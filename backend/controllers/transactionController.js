import { prisma } from '../prisma.js';

/**
 * Lista as transações financeiras APENAS do usuário autenticado.
 * Ordena por data (mais recente primeiro).
 */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId }, 
      orderBy: { date: 'desc' }
    });
    
    return res.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações pessoais:", error);
    return res.status(500).json({ error: 'Falha ao carregar suas transações.' });
  }
};

/**
 * Lista as últimas 50 transações globais (de todos os usuários).
 * Inclui o nome do usuário dono da transação.
 */
export const getGlobalTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      take: 50, // Limite para evitar sobrecarga
      include: {
        user: {
          select: { name: true } // Traz apenas o nome do usuário
        }
      }
    });

    return res.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar histórico global:", error);
    return res.status(500).json({ error: 'Falha ao carregar o histórico global.' });
  }
};

/**
 * Cria uma nova transação vinculada ao usuário logado.
 */
export const createTransaction = async (req, res) => {
  const { type, amount, category, description, date, notes } = req.body;
  
  try {
    const newTransaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        category,
        description,
        date: date ? new Date(date) : undefined,
        notes,
        userId: req.userId
      }
    });

    return res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return res.status(500).json({ error: 'Falha ao salvar nova transação.' });
  }
};

/**
 * Atualiza os dados de uma transação existente.
 * Valida se a transação pertence ao usuário logado antes de permitir a edição.
 */
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, description, date, notes } = req.body;

  try {
    // 1. Busca a transação para verificar o dono
    const transaction = await prisma.transaction.findUnique({ where: { id: Number(id) } });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada.' });
    }

    // 2. Verifica permissão
    if (transaction.userId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para editar esta transação.' });
    }

    // 3. Atualiza os dados
    const updated = await prisma.transaction.update({
      where: { id: Number(id) },
      data: {
        type,
        amount,
        category,
        description,
        date: date ? new Date(date) : undefined,
        notes
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return res.status(500).json({ error: 'Falha ao editar a transação.' });
  }
};

/**
 * Remove permanentemente uma transação.
 * Valida se a transação pertence ao usuário logado antes de permitir a exclusão.
 */
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Busca a transação para verificar o dono
    const transaction = await prisma.transaction.findUnique({ where: { id: Number(id) } });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada.' });
    }

    // 2. Verifica permissão
    if (transaction.userId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta transação.' });
    }

    // 3. Exclui
    await prisma.transaction.delete({ where: { id: Number(id) } });

    return res.json({ message: 'Transação excluída com sucesso.' });
  } catch (error) {
    console.error("Erro ao excluir transação:", error);
    return res.status(500).json({ error: 'Falha ao remover a transação.' });
  }
};