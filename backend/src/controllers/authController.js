import * as authService from '../services/authService.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const getReqMeta = (req) => ({
  ip: req.ip,
  userAgent: req.headers['user-agent'] || 'unknown',
});

export async function register(req, res) {
  const { user, accessToken, refreshToken } = await authService.registerUser(
    req.body,
    getReqMeta(req)
  );
  res.cookie('fg_refresh_token', refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ user, accessToken });
}

export async function login(req, res) {
  const { user, accessToken, refreshToken } = await authService.loginUser(
    req.body,
    getReqMeta(req)
  );
  res.cookie('fg_refresh_token', refreshToken, COOKIE_OPTIONS);
  res.json({ user, accessToken });
}

export async function refresh(req, res) {
  const rawToken = req.cookies?.fg_refresh_token;
  const { user, accessToken, refreshToken } = await authService.rotateRefreshToken(
    rawToken,
    getReqMeta(req)
  );
  res.cookie('fg_refresh_token', refreshToken, COOKIE_OPTIONS);
  res.json({ user, accessToken });
}

export async function logout(req, res) {
  const rawToken = req.cookies?.fg_refresh_token;
  await authService.logoutUser(rawToken);
  res.clearCookie('fg_refresh_token', COOKIE_OPTIONS);
  res.status(204).send();
}

export async function changePassword(req, res) {
  await authService.changeUserPassword(req.userId, req.body, getReqMeta(req));
  res.clearCookie('fg_refresh_token', COOKIE_OPTIONS);
  res.json({ message: 'Senha alterada com sucesso. Faça login novamente.' });
}
