import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function getUserMeta(userId) {
  const [accounts, categories] = await prisma.$transaction([
    prisma.account.findMany({ where: { userId }, orderBy: { id: 'asc' } }),
    prisma.category.findMany({ where: { userId }, orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
  ]);
  return {
    accounts: accounts.map((a) => ({ ...a, balance: Number(a.balance) })),
    categories,
  };
}

export async function createAccount(userId, data) {
  return prisma.account.create({ data: { ...data, userId } });
}

export async function deleteAccount(userId, id) {
  const acc = await prisma.account.findFirst({ where: { id: Number(id), userId } });
  if (!acc) throw new AppError('Conta não encontrada.', 404);
  await prisma.account.delete({ where: { id: acc.id } });
}

export async function createCategory(userId, data) {
  return prisma.category.create({ data: { ...data, userId } });
}

export async function deleteCategory(userId, id) {
  const cat = await prisma.category.findFirst({ where: { id: Number(id), userId } });
  if (!cat) throw new AppError('Categoria não encontrada.', 404);
  await prisma.category.delete({ where: { id: cat.id } });
}
