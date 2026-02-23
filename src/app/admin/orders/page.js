'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '../layout';

export default function AdminOrders() {
  const { authFetch } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    authFetch('/api/admin/orders').then(r => r.json()).then(setOrders).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const statusLabels = { new: 'Новый', processing: 'В работе', ready: 'Готов', delivered: 'Доставлен', cancelled: 'Отменён' };
  const statusColors = { new: 'var(--color-info)', processing: 'var(--color-warning)', ready: 'var(--color-success)', delivered: 'var(--color-gold)', cancelled: 'var(--color-error)' };
  const allStatuses = ['new', 'processing', 'ready', 'delivered', 'cancelled'];

  const updateStatus = async (id, status) => {
    await authFetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <>
      <h1 className="admin-pg-title">Заказы</h1>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</p>
          <p>Заказов пока нет</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Клиент</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{o.order_number}</td>
                  <td>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{o.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{o.customer_phone}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{o.total?.toLocaleString('ru-RU')} ₽</td>
                  <td>
                    <select className="form-select" value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '4px 8px', color: statusColors[o.status], borderColor: statusColors[o.status], maxWidth: '150px' }}>
                      {allStatuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{new Date(o.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <button className="btn-icon" onClick={() => setDetail(detail === o.id ? null : o.id)}>
                      {detail === o.id ? '▲' : '▼'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && orders.find(o => o.id === detail) && (() => {
        const o = orders.find(o => o.id === detail);
        let items = [];
        try { items = JSON.parse(o.items || '[]'); } catch { }
        return (
          <div className="order-detail card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>Детали заказа {o.order_number}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><strong>Клиент:</strong> {o.customer_name}</div>
              <div><strong>Телефон:</strong> {o.customer_phone}</div>
              <div><strong>Email:</strong> {o.customer_email || '—'}</div>
              <div><strong>Доставка:</strong> {o.delivery_method === 'pickup' ? 'Самовывоз' : 'Доставка'}</div>
              {o.delivery_address && <div style={{ gridColumn: '1/-1' }}><strong>Адрес:</strong> {o.delivery_address}</div>}
              {o.comment && <div style={{ gridColumn: '1/-1' }}><strong>Комментарий:</strong> {o.comment}</div>}
            </div>
            <h4 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Товары:</h4>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)', fontSize: '0.9rem' }}>
                <span>{item.name} {item.details ? `(${item.details})` : ''} × {item.quantity}</span>
                <span style={{ color: 'var(--color-gold)' }}>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gold)' }}>
              Итого: {o.total?.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        );
      })()}

      <style jsx>{`
        .admin-pg-title { font-size: 2rem; margin-bottom: 2rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>
    </>
  );
}
