import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsGoalsPage from './pages/BudgetsGoalsPage';
import SettingsPage from './pages/SettingsPage';

const Private = ({ children }) => {
  const { authenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 600 }}>
        Validando sessão...
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/" element={<Private><DashboardPage /></Private>} />
              <Route path="/transactions" element={<Private><TransactionsPage /></Private>} />
              <Route path="/planning" element={<Private><BudgetsGoalsPage /></Private>} />
              <Route path="/settings" element={<Private><SettingsPage /></Private>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
