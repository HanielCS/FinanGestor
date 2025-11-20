import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, List } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Helper para aplicar classe 'active' se a rota coincidir
  const getLinkClass = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      {/* Logo / Marca */}
      <Link to="/" className="nav-brand">
        FinanGestor
      </Link>
      
      <div className="nav-links">
        
        {/* Menu Principal */}
        <Link to="/" className={getLinkClass('/')}>
          <LayoutDashboard size={18} className="nav-icon"/>
          Dashboard
        </Link>
        
        <Link to="/transactions" className={getLinkClass('/transactions')}>
          <List size={18} className="nav-icon"/>
          Minhas Transações
        </Link>

        {/* Divisor Vertical */}
        <div className="nav-divider"></div>

        {/* Área do Usuário */}
        <span className="nav-user-name">
          Olá, {user?.name?.split(' ')[0]} {/* Mostra só o primeiro nome */}
        </span>

        <button 
          onClick={logout} 
          className="nav-logout"
          title="Sair do sistema"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </nav>
  );
}