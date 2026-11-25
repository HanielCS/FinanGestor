import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || `${ACCESS_SECRET()}_refresh`;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateTokens(userId) {
  const accessToken = jwt.sign({ sub: userId }, ACCESS_SECRET(), { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: userId, jti: crypto.randomUUID() }, REFRESH_SECRET(), {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
}

const DEFAULT_CATEGORIES = [
  { name: 'Salário', type: 'INCOME', color: '#10b981', icon: 'Briefcase' },
  { name: 'Freelance', type: 'INCOME', color: '#06b6d4', icon: 'Laptop' },
  { name: 'Investimentos', type: 'INCOME', color: '#8b5cf6', icon: 'TrendingUp' },
  { name: 'Alimentação', type: 'EXPENSE', color: '#f59e0b', icon: 'Utensils' },
  { name: 'Moradia', type: 'EXPENSE', color: '#ef4444', icon: 'Home' },
  { name: 'Transporte', type: 'EXPENSE', color: '#3b82f6', icon: 'Car' },
  { name: 'Lazer', type: 'EXPENSE', color: '#ec4899', icon: 'Gamepad2' },
  { name: 'Saúde', type: 'EXPENSE', color: '#14b8a6', icon: 'HeartPulse' },
  { name: 'Educação', type: 'EXPENSE', color: '#6366f1', icon: 'GraduationCap' },
  { name: 'Outros', type: 'EXPENSE', color: '#64748b', icon: 'Tag' },
];

export async function registerUser({ name, email, password }, meta = {}) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Este e-mail já está cadastrado.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accounts: {
          create: { name: 'Carteira Principal', type: 'CHECKING', balance: 0, color: '#6366f1' },
        },
        categories: {
          create: DEFAULT_CATEGORIES,
        },
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    await tx.auditLog.create({
      data: { userId: created.id, action: 'USER_REGISTERED', ipAddress: meta.ip },
    });

    return created;
  });

  const { accessToken, refreshToken } = generateTokens(user.id);
  await persistRefreshToken(user.id, refreshToken, meta);

  return { user, accessToken, refreshToken };
}

export async function loginUser({ email, password }, meta = {}) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        action: 'LOGIN_FAILED',
        metadata: `email=${email}`,
        ipAddress: meta.ip,
      },
    });
    throw new AppError('Credenciais inválidas.', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user.id);
  await persistRefreshToken(user.id, refreshToken, meta);

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'LOGIN_SUCCESS', ipAddress: meta.ip },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

export async function rotateRefreshToken(rawToken, meta = {}) {
  if (!rawToken) {
    throw new AppError('Refresh token ausente.', 401);
  }

  let payload;
  try {
    payload = jwt.verify(rawToken, REFRESH_SECRET());
  } catch {
    throw new AppError('Sessão expirada. Faça login novamente.', 401);
  }

  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored) {
    throw new AppError('Sessão inválida.', 401);
  }

  if (stored.revoked) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId },
      data: { revoked: true },
    });
    await prisma.auditLog.create({
      data: { userId: stored.userId, action: 'TOKEN_REUSE_DETECTED', ipAddress: meta.ip },
    });
    throw new AppError('Atividade suspeita detectada. Todas as sessões foram encerradas.', 401);
  }

  if (new Date() > stored.expiresAt) {
    throw new AppError('Sessão expirada.', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } }),
    prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: meta.userAgent,
        ipAddress: meta.ip,
      },
    }),
  ]);

  return { user, accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(rawToken) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export async function changeUserPassword(userId, { currentPassword, newPassword }, meta = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Usuário não encontrado.', 404);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new AppError('A senha atual está incorreta.', 400);

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } }),
    prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } }),
    prisma.auditLog.create({
      data: { userId, action: 'PASSWORD_CHANGED', ipAddress: meta.ip },
    }),
  ]);
}

async function persistRefreshToken(userId, rawToken, meta) {
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(rawToken),
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
    },
  });
}
