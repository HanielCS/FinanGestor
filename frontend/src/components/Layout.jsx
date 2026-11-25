import { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Settings,
  LogOut,
  Sun,
  Moon,
  Plus,
  Menu,
  Wallet,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children, title, onQuickNewTransaction }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
    { to: '/planning', label: 'Orçamentos & Metas', icon: Target },
    { to: '/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Wallet size={24} color="#818cf8" />
            {!collapsed && <span>FinanGestor</span>}
          </div>
          <button
            className="btn btn-outline"
            style={{ padding: '0.3rem', color: '#94a3b8', borderColor: '#1e293b' }}
            onClick={() => setCollapsed(!collapsed)}
            title="Recolher menu"
          >
            <Menu size={16} />
          </button>
        </div>

        <nav className="nav-list">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={19} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="nav-item"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
        >
          <LogOut size={19} />
          {!collapsed && <span>Sair</span>}
        </button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-outline mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              title="Abrir menu"
            >
              <Menu size={18} />
            </button>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{title}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onQuickNewTransaction && (
              <button className="btn btn-primary" onClick={onQuickNewTransaction}>
                <Plus size={17} /> Nova Transação
              </button>
            )}

            <button className="btn btn-outline" onClick={toggleTheme} title="Alternar tema">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {user?.name?.split(' ')[0]}
            </span>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
