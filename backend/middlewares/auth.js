import jwt from 'jsonwebtoken';

/**
 * Middleware de Autenticação.
 * Intercepta a requisição para verificar se existe um token JWT válido.
 * Se válido, adiciona o ID do usuário (req.userId) à requisição.
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verifica se o header existe
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de acesso não fornecido.' });
  }

  // 2. Verifica o formato do token ("Bearer <TOKEN>")
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;

  // Verifica se a primeira parte contém "Bearer" (case insensitive)
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado.' });
  }

  try {
    // 3. Verifica a validade do token
    const decoded = jwt.verify(token, 'SEU_TOKEN');
    
    // 4. Injeta o ID do usuário na requisição para uso nos controllers
    req.userId = decoded.id;
    
    return next();
  } catch (err) {
    console.error("Falha na autenticação:", err.message);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};