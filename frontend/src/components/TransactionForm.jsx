import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function TransactionForm({ isOpen, onClose, onSaved, initialData = null }) {
  const { addToast } = useToast();
  const [meta, setMeta] = useState({ accounts: [], categories: [] });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    accountId: '',
    notes: '',
    isRecurring: false,
    installments: 1,
  });

  useEffect(() => {
    if (!isOpen) return;
    api.get('/meta').then(({ data }) => {
      setMeta(data);
      if (!initialData && data.accounts.length > 0) {
        setForm((prev) => ({ ...prev, accountId: prev.accountId || data.accounts[0].id }));
      }
    });
  }, [isOpen, initialData]);

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type,
        amount: initialData.amount,
        description: initialData.description,
        date: new Date(initialData.date).toISOString().split('T')[0],
        categoryId: initialData.categoryId || '',
        accountId: initialData.accountId || '',
        notes: initialData.notes || '',
        isRecurring: Boolean(initialData.isRecurring),
        installments: 1,
      });
    } else {
      setForm((prev) => ({
        ...prev,
        type: 'EXPENSE',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        notes: '',
        isRecurring: false,
        installments: 1,
      }));
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const filteredCategories = meta.categories.filter((c) => c.type === form.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        accountId: form.accountId ? Number(form.accountId) : null,
        installments: Number(form.installments) || 1,
      };

      if (initialData) {
        await api.put(`/transactions/${initialData.id}`, payload);
        addToast('Transação atualizada!', 'success');
      } else {
        await api.post('/transactions', payload);
        addToast('Transação registrada com sucesso!', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao salvar transação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
          <h3>{initialData ? 'Editar Transação' : 'Nova Transação'}</h3>
          <button className="btn btn-outline" style={{ padding: '0.3rem' }} onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              type="button"
              className={`btn ${form.type === 'EXPENSE' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setForm({ ...form, type: 'EXPENSE', categoryId: '' })}
            >
              Despesa
            </button>
            <button
              type="button"
              className={`btn ${form.type === 'INCOME' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setForm({ ...form, type: 'INCOME', categoryId: '' })}
            >
              Receita
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input
              className="input"
              required
              placeholder="Ex: Supermercado, Salário..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Valor Total (R$)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data</label>
              <input
                className="input"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                className="select"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Conta / Carteira</label>
              <select
                className="select"
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              >
                <option value="">Sem conta vinculada</option>
                {meta.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!initialData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
              <div className="form-group">
                <label className="form-label">Parcelas (1 = à vista)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="60"
                  value={form.installments}
                  onChange={(e) => setForm({ ...form, installments: e.target.value })}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                />
                Lançamento fixo/recorrente
              </label>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Observações (opcional)</label>
            <input
              className="input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Confirmar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  );
}
