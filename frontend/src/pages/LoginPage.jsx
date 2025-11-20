import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Tela de Login.
 * Gerencia a autenticação do usuário e redirecionamento para o Dashboard.
 */
export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2 className="auth-title">Login FinanGestor</h2>
        
        <form onSubmit={handleSubmit} className="form-card">
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
              placeholder="••••••"
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-btn" 
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}