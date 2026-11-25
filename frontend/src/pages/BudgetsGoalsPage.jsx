import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function BudgetsGoalsPage() {
  const { addToast } = useToast();
  const now = new Date();
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);

  const [budgetForm, setBudgetForm] = useState({ categoryId: '', amount: '' });
  const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', deadline: '' });

  const loadAll = useCallback(async () => {
    const [bRes, gRes, mRes] = await Promise.all([
      api.get('/budgets', { params: { month: now.getMonth() + 1, year: now.getFullYear() } }),
      api.get('/goals'),
      api.get('/meta'),
    ]);
    setBudgets(bRes.data);
    setGoals(gRes.data);
    setCategories(mRes.data.categories.filter((c) => c.type === 'EXPENSE'));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    await api.post('/budgets', {
      categoryId: Number(budgetForm.categoryId),
      amount: Number(budgetForm.amount),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
    setBudgetForm({ categoryId: '', amount: '' });
    addToast('Orçamento mensal definido!', 'success');
    loadAll();
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    await api.post('/goals', {
      title: goalForm.title,
      targetAmount: Number(goalForm.targetAmount),
      deadline: goalForm.deadline || null,
    });
    setGoalForm({ title: '', targetAmount: '', deadline: '' });
    addToast('Meta criada!', 'success');
    loadAll();
  };

  const handleAddDeposit = async (goalId) => {
    const val = prompt('Valor do aporte (R$):');
    if (!val || Number(val) <= 0) return;
    await api.put(`/goals/${goalId}/add`, { amount: Number(val) });
    addToast('Aporte adicionado à meta!', 'success');
    loadAll();
  };

  return (
    <Layout title="Orçamentos & Metas">
      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Orçamentos do Mês Atual</h3>
          <form onSubmit={handleCreateBudget} style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              className="select"
              required
              value={budgetForm.categoryId}
              onChange={(e) => setBudgetForm({ ...budgetForm, categoryId: e.target.value })}
            >
              <option value="">Categoria...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              step="0.01"
              required
              placeholder="Teto (R$)"
              value={budgetForm.amount}
              onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
            />
            <button className="btn btn-primary" type="submit"><Plus size={16} /></button>
          </form>

          {budgets.map((b) => {
            const barColor =
              b.status === 'EXCEEDED' ? 'var(--danger)' : b.status === 'WARNING' ? 'var(--warning)' : 'var(--success)';
            return (
              <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <strong>{b.category.name}</strong>
                  <span>
                    R$ {b.spent.toFixed(2)} / R$ {b.limit.toFixed(2)} ({b.percentage}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(b.percentage, 100)}%`, background: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Minhas Metas Financeiras</h3>
          <form onSubmit={handleCreateGoal} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              className="input"
              style={{ flex: 2 }}
              required
              placeholder="Nome da meta (ex: Reserva)"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            />
            <input
              className="input"
              style={{ flex: 1 }}
              type="number"
              step="0.01"
              required
              placeholder="Alvo (R$)"
              value={goalForm.targetAmount}
              onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
            />
            <button className="btn btn-primary" type="submit"><Plus size={16} /></button>
          </form>

          {goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, Number(((g.currentAmount / g.targetAmount) * 100).toFixed(1))) : 0;
            return (
              <div key={g.id} style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <strong>{g.title}</strong>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.55rem' }} onClick={() => handleAddDeposit(g.id)}>
                      + Aportar
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem' }}
                      onClick={async () => {
                        await api.delete(`/goals/${g.id}`);
                        loadAll();
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  R$ {g.currentAmount.toFixed(2)} de R$ {g.targetAmount.toFixed(2)} ({pct}%)
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--primary)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
