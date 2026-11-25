import { useCallback, useContext, useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { logout } = useContext(AuthContext);
  const { addToast } = useToast();
  const [meta, setMeta] = useState({ accounts: [], categories: [] });
  const [accForm, setAccForm] = useState({ name: '', type: 'CHECKING', balance: 0, color: '#6366f1' });
  const [catForm, setCatForm] = useState({ name: '', type: 'EXPENSE', color: '#3b82f6' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });

  const loadMeta = useCallback(async () => {
    const { data } = await api.get('/meta');
    setMeta(data);
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    await api.post('/meta/accounts', { ...accForm, balance: Number(accForm.balance) });
    setAccForm({ name: '', type: 'CHECKING', balance: 0, color: '#6366f1' });
    addToast('Carteira adicionada!', 'success');
    loadMeta();
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    await api.post('/meta/categories', catForm);
    setCatForm({ name: '', type: 'EXPENSE', color: '#3b82f6' });
    addToast('Categoria criada!', 'success');
    loadMeta();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', pwdForm);
      addToast('Senha atualizada. Entre novamente.', 'success');
      await logout();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao alterar senha.', 'error');
    }
  };

  return (
    <Layout title="Configurações">
      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <h3>Carteiras & Contas</h3>
          <form onSubmit={handleAddAccount} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              className="input"
              style={{ flex: 2 }}
              required
              placeholder="Nome (ex: Nubank)"
              value={accForm.name}
              onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
            />
            <select
              className="select"
              style={{ flex: 1 }}
              value={accForm.type}
              onChange={(e) => setAccForm({ ...accForm, type: e.target.value })}
            >
              <option value="CHECKING">Conta Corrente</option>
              <option value="CREDIT_CARD">Cartão</option>
              <option value="CASH">Dinheiro</option>
              <option value="SAVINGS">Reserva</option>
            </select>
            <input
              className="input"
              style={{ width: 110 }}
              type="number"
              step="0.01"
              placeholder="Saldo"
              value={accForm.balance}
              onChange={(e) => setAccForm({ ...accForm, balance: e.target.value })}
            />
            <button className="btn btn-primary" type="submit"><Plus size={16} /></button>
          </form>

          {meta.accounts.map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{a.name} — <strong>R$ {a.balance.toFixed(2)}</strong></span>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await api.delete(`/meta/accounts/${a.id}`);
                  loadMeta();
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <h3>Categorias Personalizadas</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input"
              required
              placeholder="Nome da categoria"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            />
            <select
              className="select"
              style={{ width: 130 }}
              value={catForm.type}
              onChange={(e) => setCatForm({ ...catForm, type: e.target.value })}
            >
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
            <input
              type="color"
              value={catForm.color}
              onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
              style={{ width: 44, height: 38, border: 'none', background: 'transparent' }}
            />
            <button className="btn btn-primary" type="submit"><Plus size={16} /></button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {meta.categories.map((c) => (
              <span
                key={c.id}
                className="badge"
                style={{ background: `${c.color}22`, color: c.color, padding: '0.35rem 0.65rem' }}
              >
                {c.name}
                <button
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 4 }}
                  onClick={async () => {
                    await api.delete(`/meta/categories/${c.id}`);
                    loadMeta();
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <h3 style={{ marginBottom: '0.9rem' }}>Segurança da Conta</h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div className="form-group">
            <label className="form-label">Senha Atual</label>
            <input
              className="input"
              type="password"
              required
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nova Senha (mín. 8 caracteres, 1 maiúscula e 1 número)</label>
            <input
              className="input"
              type="password"
              required
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" type="submit">Atualizar Senha e Encerrar Sessões</button>
        </form>
      </div>
    </Layout>
  );
}
