import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Tela de Cadastro de Usuário.
export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(form.name, form.email, form.password);
      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.error || 'Erro ao realizar cadastro.';
      alert(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2 className="auth-title">Criar Conta</h2>
        
        <form onSubmit={handleSubmit} className="form-card">
          <div className="input-group">
            <label htmlFor="name">Nome</label>
            <input 
              id="name"
              type="text" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              required 
              placeholder="Seu Nome Completo"
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input 
              id="email"
              type="email" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              required 
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input 
              id="password"
              type="password" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              required 
              placeholder="Crie uma senha forte"
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/login">Fazer Login</Link>
        </p>
      </div>
    </div>
  );
}