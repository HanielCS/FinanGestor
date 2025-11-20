import { prisma } from '../prisma.js';

/**
 * Gera os indicadores financeiros (KPIs) e o resumo de caixa.
 * Nota: Atualmente calcula com base em TODAS as transações do banco.
 */
export const getDashboardData = async (req, res) => {
  try {
    // Busca todas as transações do banco (sem filtro de usuário)
    const transactions = await prisma.transaction.findMany();

    let totalIncome = 0;
    let totalExpense = 0;
    
    // Variáveis auxiliares para cálculo de ROI (Categoria 'INVESTIMENTO')
    let investCost = 0;
    let investReturn = 0;

    // Itera sobre as transações para somar os totais
    transactions.forEach(t => {
      const val = Number(t.amount);

      if (t.type === 'INCOME') {
        totalIncome += val;
        // Se for retorno de investimento, soma para o ROI
        if (t.category === 'INVESTIMENTO') investReturn += val;
      } else {
        totalExpense += val;
        // Se for aporte em investimento, soma como custo
        if (t.category === 'INVESTIMENTO') investCost += val;
      }
    });

    // Cálculo do Saldo Atual
    const balance = totalIncome - totalExpense;

    // Cálculo da Margem Líquida: (Lucro / Receita Total) * 100
    // Evita divisão por zero verificando se houve receita
    const netMargin = totalIncome > 0 
      ? ((balance / totalIncome) * 100).toFixed(1) 
      : 0;

    // Cálculo do ROI: ((Retorno - Custo) / Custo) * 100
    let roi = 0;
    if (investCost > 0) {
      roi = (((investReturn - investCost) / investCost) * 100).toFixed(1);
    }

    // Retorna o objeto estruturado para o frontend
    return res.json({
      summary: {
        income: totalIncome,
        expense: totalExpense,
        balance: balance
      },
      indicators: {
        netMargin: `${netMargin}%`,
        roi: `${roi}%`,
        operatingMargin: `${netMargin}%`
      }
    });

  } catch (error) {
    console.error("Erro no controller do Dashboard:", error);
    return res.status(500).json({ error: 'Falha ao calcular indicadores financeiros.' });
  }
};