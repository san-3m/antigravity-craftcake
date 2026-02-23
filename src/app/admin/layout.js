'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminContext = createContext();
export const useAdmin = () => useContext(AdminContext);

export default function AdminLayout({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const t = localStorage.getItem('craftcake_admin_token');
    if (t) setToken(t);
    setLoading(false);
  }, []);

  const login = (t) => { setToken(t); localStorage.setItem('craftcake_admin_token', t); };
  const logout = () => { setToken(null); localStorage.removeItem('craftcake_admin_token'); };

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: { ...options.headers, 'Authorization': `Bearer ${token}` },
    });
    if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
    return res;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}><div className="spinner" /></div>;

  if (!token) return <LoginForm onLogin={login} />;

  const navItems = [
    { href: '/admin', icon: '📊', label: 'Дашборд' },
    { href: '/admin/products', icon: '🧁', label: 'Товары' },
    { href: '/admin/categories', icon: '📁', label: 'Категории' },
    { href: '/admin/orders', icon: '📦', label: 'Заказы' },
    { href: '/admin/cake', icon: '🎂', label: 'Конструктор торта' },
    { href: '/admin/customers', icon: '👥', label: 'Покупатели' },
    { href: '/admin/loyalty', icon: '💎', label: 'Скидки' },
    { href: '/admin/seo', icon: '🔍', label: 'SEO' },
    { href: '/admin/users', icon: '📧', label: 'Рассылки' },
    { href: '/admin/feedback', icon: '💬', label: 'Отзывы' },
    { href: '/admin/settings', icon: '⚙️', label: 'Настройки' },
  ];

  return (
    <AdminContext.Provider value={{ token, authFetch, logout }}>
      <div className="admin-wrapper">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <span style={{ fontSize: '1.5rem' }}>🎂</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-gold)' }}>Craftcake</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Админ-панель</div>
            </div>
          </div>
          <nav className="admin-nav">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <Link href="/" className="admin-nav-item" target="_blank">
              <span>🌐</span><span>Открыть сайт</span>
            </Link>
            <button className="admin-nav-item" onClick={logout}>
              <span>🚪</span><span>Выйти</span>
            </button>
          </div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>

      <style jsx global>{`
        .admin-wrapper {
          display: flex;
          min-height: 100vh;
          background: var(--color-bg);
        }
        .admin-sidebar {
          width: 260px;
          background: var(--color-bg-alt);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 100;
        }
        .admin-sidebar-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .admin-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 10px 16px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .admin-nav-item:hover {
          background: var(--color-bg-card);
          color: var(--color-text);
        }
        .admin-nav-item.active {
          background: rgba(201,168,76,0.1);
          color: var(--color-gold);
        }
        .admin-sidebar-footer {
          padding: 0.75rem;
          border-top: 1px solid var(--color-border);
        }
        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 2rem;
          min-height: 100vh;
        }
        /* Override the store header/footer in admin */
        .admin-wrapper header,
        .admin-wrapper footer,
        .admin-wrapper .cart-overlay,
        .admin-wrapper .cart-sidebar { display: none !important; }
      `}</style>
    </AdminContext.Provider>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('admin@craftcake.ru');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Ошибка входа'); setLoading(false); return; }
      onLogin(data.token);
    } catch {
      setError('Ошибка соединения');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎂</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>Craftcake</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Вход в панель управления</p>
        </div>
        {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '1rem', color: 'var(--color-error)', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Введите пароль" />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Логин: admin@craftcake.ru / Пароль: admin123
        </p>
      </div>
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--gradient-hero);
        }
        .login-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 3rem;
          width: 100%;
          max-width: 420px;
        }
      `}</style>
    </div>
  );
}
