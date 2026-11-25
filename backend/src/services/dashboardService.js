import { prisma } from '../config/prisma.js';

export async function getDashboardSummary(userId, { month, year }) {
  const now = new Date();
  const targetMonth = Number(month) || now.getMonth() + 1;
  const targetYear = Number(year) || now.getFullYear();

  const startCurrent = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
  const endCurrent = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

  const startPrev = new Date(Date.UTC(targetYear, targetMonth - 2, 1));
  const endPrev = new Date(Date.UTC(targetYear, targetMonth - 1, 0, 23, 59, 59, 999));

  const startSixMonths = new Date(Date.UTC(targetYear, targetMonth - 6, 1));

  const [currentTxs, prevTxs, sixMonthTxs, accounts, budgets, goals, recentTxs] =
    await prisma.$transaction([
      prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: startCurrent, lte: endCurrent } },
        include: { categoryRel: true },
      }),
      prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: startPrev, lte: endPrev } },
      }),
      prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: startSixMonths, lte: endCurrent } },
      }),
      prisma.account.findMany({ where: { userId }, orderBy: { id: 'asc' } }),
      prisma.budget.findMany({
        where: { userId, month: targetMonth, year: targetYear },
        include: { category: true },
      }),
      prisma.goal.findMany({ where: { userId }, orderBy: { id: 'desc' }, take: 4 }),
      prisma.transaction.findMany({
        where: { userId, deletedAt: null },
        include: { categoryRel: true, account: true },
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
        take: 6,
      }),
    ]);

  const sumByType = (list, type) =>
    list
      .filter((t) => t.type === type)
      .reduce((acc, t) => acc + Number(t.amount), 0);

  const income = sumByType(currentTxs, 'INCOME');
  const expense = sumByType(currentTxs, 'EXPENSE');
  const balance = income - expense;
  const savingsRate = income > 0 ? Number((((income - expense) / income) * 100).toFixed(1)) : 0;

  const prevIncome = sumByType(prevTxs, 'INCOME');
  const prevExpense = sumByType(prevTxs, 'EXPENSE');

  const calcDeltaPct = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  const categoryMap = new Map();
  for (const t of currentTxs.filter((tx) => tx.type === 'EXPENSE')) {
    const name = t.categoryRel?.name || t.category || 'Outros';
    const color = t.categoryRel?.color || '#64748b';
    const prev = categoryMap.get(name) || { name, value: 0, color, categoryId: t.categoryId };
    prev.value += Number(t.amount);
    categoryMap.set(name, prev);
  }

  const budgetAlerts = budgets.map((b) => {
    const spent = currentTxs
      .filter((t) => t.type === 'EXPENSE' && t.categoryId === b.categoryId)
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const limit = Number(b.amount);
    const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;
    return {
      id: b.id,
      categoryName: b.category.name,
      color: b.category.color,
      limit,
      spent,
      percentage,
      status: percentage >= 100 ? 'EXCEEDED' : percentage >= 80 ? 'WARNING' : 'OK',
    };
  });

  const monthlySeries = [];
  for (let i = 5; i >= 0; i--) {
    const ref = new Date(Date.UTC(targetYear, targetMonth - 1 - i, 1));
    const m = ref.getUTCMonth() + 1;
    const y = ref.getUTCFullYear();
    const label = `${String(m).padStart(2, '0')}/${String(y).slice(-2)}`;

    const monthTxs = sixMonthTxs.filter((t) => {
      const d = new Date(t.date);
      return d.getUTCMonth() + 1 === m && d.getUTCFullYear() === y;
    });

    monthlySeries.push({
      month: label,
      receitas: sumByType(monthTxs, 'INCOME'),
      despesas: sumByType(monthTxs, 'EXPENSE'),
    });
  }

  return {
    period: { month: targetMonth, year: targetYear },
    kpis: {
      income,
      expense,
      balance,
      savingsRate,
      totalConsolidatedBalance: accounts.reduce((acc, a) => acc + Number(a.balance), 0),
      incomeChangePct: calcDeltaPct(income, prevIncome),
      expenseChangePct: calcDeltaPct(expense, prevExpense),
    },
    accounts: accounts.map((a) => ({ ...a, balance: Number(a.balance) })),
    expensesByCategory: Array.from(categoryMap.values()).sort((a, b) => b.value - a.value),
    monthlySeries,
    budgetAlerts,
    goals: goals.map((g) => ({
      ...g,
      targetAmount: Number(g.targetAmount),
      currentAmount: Number(g.currentAmount),
    })),
    recentTransactions: recentTxs.map((t) => ({ ...t, amount: Number(t.amount) })),
  };
}
