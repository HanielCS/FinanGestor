import pkg from '@prisma/client';

// Desestrutura o pacote para garantir compatibilidade entre ESM e CommonJS
const { PrismaClient } = pkg;

/**
 * Instância única do Prisma Client.
 * Importe este arquivo sempre que precisar acessar o banco de dados.
 */
export const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
});