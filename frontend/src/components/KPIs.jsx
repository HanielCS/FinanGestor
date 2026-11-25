import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank } from 'lucide-react';

const formatBRL = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function KPIs({ kpis }) {
  if (!kpis) return null;

  const cards = [
    {
      label: 'Saldo Consolidado (Contas)',
      value: formatBRL(kpis.totalConsolidatedBalance),
      sub: `Saldo do mês: ${formatBRL(kpis.balance)}`,
      icon: Wallet,
      color: 'var(--primary)',
    },
    {
      label: 'Receitas do Mês',
      value: formatBRL(kpis.income),
      sub: `${kpis.incomeChangePct >= 0 ? '+' : ''}${kpis.incomeChangePct}% vs mês anterior`,
      icon: ArrowUpRight,
      color: 'var(--success)',
    },
    {
      label: 'Despesas do Mês',
      value: formatBRL(kpis.expense),
      sub: `${kpis.expenseChangePct >= 0 ? '+' : ''}${kpis.expenseChangePct}% vs mês anterior`,
      icon: ArrowDownRight,
      color: 'var(--danger)',
    },
    {
      label: 'Taxa de Economia',
      value: `${kpis.savingsRate}%`,
      sub: kpis.savingsRate >= 20 ? 'Meta saudável atingida' : 'Recomendado: acima de 20%',
      icon: PiggyBank,
      color: 'var(--warning)',
    },
  ];

  return (
    <div className="grid-kpi">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div className="card" key={c.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {c.label}
              </span>
              <Icon size={19} color={c.color} />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {c.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
