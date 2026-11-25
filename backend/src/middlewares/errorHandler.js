export function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      message: 'Registro duplicado: já existe um item com esses dados.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'error',
      message: 'Registro não encontrado ou sem permissão de acesso.',
    });
  }

  console.error('[UNHANDLED ERROR]:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno no servidor.',
  });
}
