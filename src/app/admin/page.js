'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from './layout';

export default function AdminDashboard() {
  const { authFetch } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const statusLabels = { new: 'Новые', processing: 'В работе', ready: 'Готово', delivered: 'Доставлено', cancelled: 'Отменено' };
  const statusColors = { new: 'var(--color-info)', processing: 'var(--color-warning)', ready: 'var(--color-success)', delivered: 'var(--color-gold)', cancelled: 'var(--color-error)' };

  return (
    <>
      <h1 className="admin-title">Панель управления</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalOrders || 0}</div>
            <div className="stat-label">Заказов</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">{(stats?.totalRevenue || 0).toLocaleString('ru-RU')} ₽</div>
            <div className="stat-label">Выручка</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧁</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalProducts || 0}</div>
            <div className="stat-label">Товаров</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalCustomers || 0}</div>
            <div className="stat-label">Клиентов</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2 className="section-heading">Статусы заказов</h2>
          <div className="status-list">
            {(stats?.ordersByStatus || []).map(s => (
              <div key={s.status} className="status-item">
                <span className="status-dot" style={{ background: statusColors[s.status] || 'var(--color-text-muted)' }} />
                <span>{statusLabels[s.status] || s.status}</span>
                <span className="status-count">{s.count}</span>
              </div>
            ))}
            {(!stats?.ordersByStatus?.length) && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Нет заказов</p>}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-heading">Последние заказы</h2>
          <div className="recent-orders">
            {(stats?.recentOrders || []).slice(0, 5).map(order => (
              <div key={order.id} className="recent-order">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.order_number}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.customer_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{order.total?.toLocaleString('ru-RU')} ₽</div>
                  <div className="badge" style={{ background: `${statusColors[order.status]}20`, color: statusColors[order.status], fontSize: '0.7rem' }}>
                    {statusLabels[order.status] || order.status}
                  </div>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders?.length) && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Нет заказов</p>}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-title {
          font-size: 2rem;
          margin-bottom: 2rem;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-icon { font-size: 2rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-heading); }
        .stat-label { font-size: 0.8rem; color: var(--color-text-muted); margin-top: 2px; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .dashboard-section {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }
        .section-heading {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: var(--color-gold);
        }
        .status-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .status-item {
          display: flex; align-items: center; gap: 0.75rem;
          font-size: 0.9rem; color: var(--color-text-secondary);
        }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-count { margin-left: auto; font-weight: 600; color: var(--color-text); }
        .recent-orders { display: flex; flex-direction: column; gap: 0.75rem; }
        .recent-order {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.75rem; border-radius: var(--radius-md);
          background: var(--color-bg); border: 1px solid var(--color-border-subtle);
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
