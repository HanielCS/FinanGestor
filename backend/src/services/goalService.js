import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function listGoals(userId) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ status: 'asc' }, { id: 'desc' }],
  });
  return goals.map((g) => ({
    ...g,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
  }));
}

export async function createGoal(userId, data) {
  const status = data.currentAmount >= data.targetAmount ? 'COMPLETED' : 'PENDING';
  return prisma.goal.create({
    data: {
      userId,
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline ? new Date(data.deadline) : null,
      status,
    },
  });
}

export async function addContribution(userId, id, amount) {
  const goal = await prisma.goal.findFirst({ where: { id: Number(id), userId } });
  if (!goal) throw new AppError('Meta não encontrada.', 404);

  const nextAmount = Number(goal.currentAmount) + Number(amount);
  const status = nextAmount >= Number(goal.targetAmount) ? 'COMPLETED' : 'PENDING';

  return prisma.goal.update({
    where: { id: goal.id },
    data: { currentAmount: nextAmount, status },
  });
}

export async function deleteGoal(userId, id) {
  const goal = await prisma.goal.findFirst({ where: { id: Number(id), userId } });
  if (!goal) throw new AppError('Meta não encontrada.', 404);
  await prisma.goal.delete({ where: { id: goal.id } });
}
