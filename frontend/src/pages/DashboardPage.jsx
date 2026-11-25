import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import KPIs from '../components/KPIs';
import FinancialChart from '../components/FinancialChart';
import TransactionForm from '../components/TransactionForm';
import { api } from '../services/api';

export default function DashboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard', { params: { month, year } });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const criticalAlerts = data?.budgetAlerts?.filter((b) => b.status !== 'OK') || [];

  return (
    <Layout title="Visão Geral" onQuickNewTransaction={() => setModalOpen(true)}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="select" style={{ width: 150 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2026, i, 1).toLocaleString('pt-BR', { month: 'long' })}
            </option>
          ))}
        </select>
        <input
          className="input"
          style={{ width: 110 }}
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>

      {criticalAlerts.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--warning)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 700 }}>
            <AlertTriangle size={18} /> Alertas de Orçamento Mensal
          </div>
          {criticalAlerts.map((al) => (
            <div key={al.id} style={{ fontSize: '0.88rem' }}>
              <strong>{al.categoryName}:</strong> {al.percentage}% utilizado (R$ {al.spent.toFixed(2)} de R$ {al.limit.toFixed(2)})
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid-kpi">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 118 }} />
          ))}
        </div>
      ) : (
        <>
          <KPIs kpis={data?.kpis} />
          <FinancialChart
            monthlySeries={data?.monthlySeries}
            expensesByCategory={data?.expensesByCategory}
          />

          <div className="grid-2">
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.9rem' }}>Minhas Carteiras</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {data?.accounts?.map((acc) => (
                  <div
                    key={acc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 10,
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{acc.name}</span>
                    <span style={{ fontWeight: 700, color: acc.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {acc.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.9rem' }}>Últimos Lançamentos</h3>
              <div className="table-wrapper">
                <table>
                  <tbody>
                    {data?.recentTransactions?.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{t.description}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            {new Date(t.date).toLocaleDateString('pt-BR')} • {t.categoryRel?.name || t.category}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                          {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <TransactionForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadDashboard}
      />
    </Layout>
  );
}
