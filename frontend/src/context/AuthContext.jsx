import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

/**
 * Provedor de Autenticação.
 * Gerencia o estado do usuário, persistência (localStorage) e cabeçalhos HTTP.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Evita piscar a tela de login ao recarregar

  // 1. Ao iniciar, verifica se existe sessão salva
  useEffect(() => {
    const recoveredUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (recoveredUser && token) {
      setUser(JSON.parse(recoveredUser));
      // Restaura o token no Axios para todas as requisições futuras
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  // 2. Função de Login
  const login = async (email, password) => {
    // A chamada API pode lançar erro, quem chama (LoginPage) deve tratar o catch
    const response = await api.post('/login', { email, password });
    
    const { user: loggedUser, token } = response.data;

    // Salva no Storage
    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('token', token);

    // Configura API e Estado
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(loggedUser);
  };

  // 3. Função de Logout
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Remove o header de autorização do Axios
    delete api.defaults.headers.Authorization;
    
    setUser(null);
  };

  // 4. Função de Registro (Proxy para API)
  const register = async (name, email, password) => {
    await api.post('/register', { name, email, password });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        authenticated: !!user, // Booleano: true se tiver usuário, false se não
        user, 
        loading, 
        login, 
        logout, 
        register 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};