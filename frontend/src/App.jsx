import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Importação das Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';

/**
 * Componente de Proteção de Rotas.
 * - Se estiver carregando a sessão: Mostra tela de loading.
 * - Se não estiver logado: Redireciona para /login.
 * - Se logado: Renderiza a página solicitada (children).
 */
const Private = ({ children }) => {
  const { authenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        color: 'var(--primary)',
        fontWeight: 'bold'
      }}>
        Carregando sistema...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

/**
 * Componente Raiz da Aplicação.
 * Gerencia o Roteamento e o Contexto Global de Autenticação.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* === Rotas Públicas === */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* === Rotas Privadas (Requer Login) === */}
          <Route 
            path="/" 
            element={
              <Private>
                <DashboardPage />
              </Private>
            } 
          />
          
          <Route 
            path="/transactions" 
            element={
              <Private>
                <TransactionsPage />
              </Private>
            } 
          />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;