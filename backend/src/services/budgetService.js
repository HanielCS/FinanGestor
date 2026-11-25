import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function listBudgets(userId, { month, year }) {
  const now = new Date();
  const targetMonth = Number(month) || now.getMonth() + 1;
  const targetYear = Number(year) || now.getFullYear();

  const start = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
  const end = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

  const [budgets, expenses] = await prisma.$transaction([
    prisma.budget.findMany({
      where: { userId, month: targetMonth, year: targetYear },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE', deletedAt: null, date: { gte: start, lte: end } },
    }),
  ]);

  return budgets.map((b) => {
    const spent = expenses
      .filter((e) => e.categoryId === b.categoryId)
      .reduce((acc, e) => acc + Number(e.amount), 0);
    const limit = Number(b.amount);
    const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;

    return {
      id: b.id,
      categoryId: b.categoryId,
      category: b.category,
      month: b.month,
      year: b.year,
      limit,
      spent,
      percentage,
      status: percentage >= 100 ? 'EXCEEDED' : percentage >= 80 ? 'WARNING' : 'OK',
    };
  });
}

export async function upsertBudget(userId, { categoryId, amount, month, year }) {
  const cat = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!cat) throw new AppError('Categoria não encontrada.', 404);

  return prisma.budget.upsert({
    where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
    update: { amount },
    create: { userId, categoryId, amount, month, year },
    include: { category: true },
  });
}

export async function deleteBudget(userId, id) {
  const existing = await prisma.budget.findFirst({ where: { id: Number(id), userId } });
  if (!existing) throw new AppError('Orçamento não encontrado.', 404);
  await prisma.budget.delete({ where: { id: existing.id } });
}
