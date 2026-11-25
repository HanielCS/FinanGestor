import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function listTransactions(userId, query) {
  const {
    page = 1,
    limit = 15,
    search,
    type,
    categoryId,
    accountId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    includeDeleted = 'false',
  } = query;

  const take = Math.min(Number(limit) || 15, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = {
    userId,
    deletedAt: includeDeleted === 'true' ? { not: null } : null,
    ...(type && ['INCOME', 'EXPENSE'].includes(type) ? { type } : {}),
    ...(categoryId ? { categoryId: Number(categoryId) } : {}),
    ...(accountId ? { accountId: Number(accountId) } : {}),
    ...(search
      ? {
          OR: [
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...((startDate || endDate)
      ? {
          date: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
    ...((minAmount || maxAmount)
      ? {
          amount: {
            ...(minAmount ? { gte: Number(minAmount) } : {}),
            ...(maxAmount ? { lte: Number(maxAmount) } : {}),
          },
        }
      : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: {
        categoryRel: { select: { id: true, name: true, color: true, icon: true } },
        account: { select: { id: true, name: true, color: true, type: true } },
      },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      skip,
      take,
    }),
  ]);

  return {
    items: items.map((t) => ({ ...t, amount: Number(t.amount) })),
    pagination: {
      page: Number(page) || 1,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

export async function createTransaction(userId, data) {
  const {
    type,
    amount,
    category,
    categoryId,
    accountId,
    description,
    date,
    notes,
    isRecurring = false,
    installments = 1,
  } = data;

  let resolvedCategoryName = category || 'Outros';
  if (categoryId) {
    const cat = await prisma.category.findFirst({ where: { id: categoryId, userId } });
    if (!cat) throw new AppError('Categoria não encontrada.', 404);
    resolvedCategoryName = cat.name;
  }

  if (accountId) {
    const acc = await prisma.account.findFirst({ where: { id: accountId, userId } });
    if (!acc) throw new AppError('Conta não encontrada.', 404);
  }

  const totalInstallments = Number(installments) || 1;
  const installmentGroup = totalInstallments > 1 ? crypto.randomUUID() : null;
  const baseDate = new Date(date);
  const perInstallmentAmount =
    totalInstallments > 1 ? Number((amount / totalInstallments).toFixed(2)) : Number(amount);

  return prisma.$transaction(async (tx) => {
    const createdRecords = [];

    for (let i = 0; i < totalInstallments; i++) {
      const txDate = i === 0 ? baseDate : addMonths(baseDate, i);
      const txDesc =
        totalInstallments > 1 ? `${description} (${i + 1}/${totalInstallments})` : description;

      const record = await tx.transaction.create({
        data: {
          userId,
          type,
          amount: perInstallmentAmount,
          category: resolvedCategoryName,
          categoryId: categoryId || null,
          accountId: accountId || null,
          description: txDesc,
          date: txDate,
          notes: notes || null,
          isRecurring,
          installmentGroup,
          installmentNumber: totalInstallments > 1 ? i + 1 : null,
          installmentTotal: totalInstallments > 1 ? totalInstallments : null,
        },
      });
      createdRecords.push(record);
    }

    if (accountId) {
      const delta = type === 'INCOME' ? perInstallmentAmount : -perInstallmentAmount;
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: delta } },
      });
    }

    return createdRecords;
  });
}

export async function updateTransaction(userId, id, data) {
  const existing = await prisma.transaction.findFirst({
    where: { id: Number(id), userId, deletedAt: null },
  });
  if (!existing) throw new AppError('Transação não encontrada.', 404);

  let resolvedCategoryName = data.category || existing.category;
  if (data.categoryId) {
    const cat = await prisma.category.findFirst({ where: { id: data.categoryId, userId } });
    if (!cat) throw new AppError('Categoria inválida.', 404);
    resolvedCategoryName = cat.name;
  }

  return prisma.$transaction(async (tx) => {
    if (existing.accountId) {
      const oldDelta = existing.type === 'INCOME' ? -Number(existing.amount) : Number(existing.amount);
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: oldDelta } },
      });
    }

    const updated = await tx.transaction.update({
      where: { id: existing.id },
      data: {
        type: data.type,
        amount: data.amount,
        category: resolvedCategoryName,
        categoryId: data.categoryId ?? existing.categoryId,
        accountId: data.accountId ?? existing.accountId,
        description: data.description,
        date: new Date(data.date),
        notes: data.notes ?? existing.notes,
        isRecurring: data.isRecurring ?? existing.isRecurring,
      },
    });

    const targetAccountId = data.accountId !== undefined ? data.accountId : existing.accountId;
    if (targetAccountId) {
      const newDelta = data.type === 'INCOME' ? Number(data.amount) : -Number(data.amount);
      await tx.account.update({
        where: { id: targetAccountId },
        data: { balance: { increment: newDelta } },
      });
    }

    return updated;
  });
}

export async function softDeleteTransaction(userId, id) {
  const existing = await prisma.transaction.findFirst({
    where: { id: Number(id), userId, deletedAt: null },
  });
  if (!existing) throw new AppError('Transação não encontrada.', 404);

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    if (existing.accountId) {
      const revertDelta =
        existing.type === 'INCOME' ? -Number(existing.amount) : Number(existing.amount);
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: revertDelta } },
      });
    }
  });
}

export async function restoreTransaction(userId, id) {
  const existing = await prisma.transaction.findFirst({
    where: { id: Number(id), userId, deletedAt: { not: null } },
  });
  if (!existing) throw new AppError('Transação excluída não encontrada.', 404);

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: existing.id },
      data: { deletedAt: null },
    });

    if (existing.accountId) {
      const applyDelta =
        existing.type === 'INCOME' ? Number(existing.amount) : -Number(existing.amount);
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: applyDelta } },
      });
    }
  });
}

export async function batchImportTransactions(userId, { accountId, items }) {
  if (accountId) {
    const acc = await prisma.account.findFirst({ where: { id: accountId, userId } });
    if (!acc) throw new AppError('Conta de destino não encontrada.', 404);
  }

  return prisma.$transaction(async (tx) => {
    let netDelta = 0;

    for (const item of items) {
      await tx.transaction.create({
        data: {
          userId,
          type: item.type,
          amount: item.amount,
          description: item.description,
          category: item.category || 'Outros',
          categoryId: item.categoryId || null,
          accountId: accountId || null,
          date: new Date(item.date),
        },
      });
      netDelta += item.type === 'INCOME' ? Number(item.amount) : -Number(item.amount);
    }

    if (accountId && netDelta !== 0) {
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: netDelta } },
      });
    }

    return { importedCount: items.length };
  });
}
