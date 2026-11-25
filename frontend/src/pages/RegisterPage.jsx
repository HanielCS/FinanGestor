import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      addToast('Conta criada com sucesso!', 'success');
      navigate('/');
    } catch (err) {
      const details = err.response?.data?.details;
      addToast(details?.[0]?.message || err.response?.data?.message || 'Erro no cadastro.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 style={{ marginBottom: '0.35rem' }}>Criar Conta</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Suas categorias e carteira inicial serão configuradas automaticamente
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Senha (mín. 8 caracteres, 1 maiúscula e 1 número)</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Já tem conta? <Link to="/login" style={{ color: 'var(--primary)' }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
