import { prisma } from '../prisma.js';

// Lista todas as metas cadastradas no sistema.
export const getGoals = async (req, res) => {
  try {
    const goals = await prisma.goal.findMany();
    return res.json(goals);
  } catch (error) {
    console.error("Erro ao buscar lista de metas:", error);
    return res.status(500).json({ error: 'Falha ao carregar as metas.' });
  }
};

/**
 * Cria uma nova meta financeira.
 */
export const createGoal = async (req, res) => {
  const { title, targetAmount, currentAmount, deadline } = req.body;

  try {
    const newGoal = await prisma.goal.create({
      data: {
        title,
        targetAmount,
        currentAmount: currentAmount || 0,
        deadline: deadline ? new Date(deadline) : null
      }
    });
    
    return res.status(201).json(newGoal);
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return res.status(500).json({ error: 'Falha ao criar nova meta.' });
  }
};

/**
 * Adiciona um valor monetário ao montante atual de uma meta específica.
 * Usado quando o usuário clica no botão "+" no dashboard.
 */
export const addMoneyToGoal = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    // 1. Verifica se a meta existe antes de atualizar
    const currentGoal = await prisma.goal.findUnique({ where: { id: Number(id) } });
    
    if (!currentGoal) {
      return res.status(404).json({ error: 'Meta não encontrada.' });
    }

    // 2. Realiza a soma e atualiza
    const updatedGoal = await prisma.goal.update({
      where: { id: Number(id) },
      data: { 
        currentAmount: Number(currentGoal.currentAmount) + Number(amount) 
      }
    });

    return res.json(updatedGoal);
  } catch (error) {
    console.error("Erro ao adicionar fundos à meta:", error);
    return res.status(500).json({ error: 'Falha ao atualizar o saldo da meta.' });
  }
};

/**
 * Atualiza as informações básicas da meta (Título e Valor Alvo).
 * Usado na edição da meta.
 */
export const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { title, targetAmount } = req.body;

  try {
    const updatedGoal = await prisma.goal.update({
      where: { id: Number(id) },
      data: { title, targetAmount }
    });
    
    return res.json(updatedGoal);
  } catch (error) {
    console.error("Erro ao editar meta:", error);
    return res.status(500).json({ error: 'Falha ao salvar alterações da meta.' });
  }
};

/**
 * Remove permanentemente uma meta do sistema.
 */
export const deleteGoal = async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.goal.delete({ where: { id: Number(id) } });
    return res.json({ message: 'Meta excluída com sucesso.' });
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    return res.status(500).json({ error: 'Falha ao excluir a meta.' });
  }
};