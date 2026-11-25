import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de acesso não fornecido.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
    req.userId = Number(decoded.sub);
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado.', 401));
    }
    return next(new AppError('Token inválido.', 401));
  }
}
