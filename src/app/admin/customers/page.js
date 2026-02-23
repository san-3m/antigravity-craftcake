'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '../layout';

export default function AdminCustomers() {
  const { authFetch } = useAdmin();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [search, setSearch] = useState('');

  const load = () => {
    authFetch('/api/admin/customers').then(r => r.json()).then(d => { setCustomers(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    const method = editItem ? 'PUT' : 'POST';
    const body = editItem ? { ...form, id: editItem.id } : form;
    await authFetch('/api/admin/customers', {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setShowModal(false); setForm({ name: '', email: '', phone: '' }); setEditItem(null); load();
  };

  const remove = async (id) => {
    if (!confirm('Удалить покупателя?')) return;
    await authFetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' });
    load();
  };

  const openEdit = (c) => { setEditItem(c); setForm({ name: c.name, email: c.email, phone: c.phone }); setShowModal(true); };
  const openAdd = () => { setEditItem(null); setForm({ name: '', email: '', phone: '' }); setShowModal(true); };

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="admin-pg-title" style={{ marginBottom: 0 }}>Покупатели</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Добавить</button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input className="form-input" placeholder="Поиск по имени, email или телефону..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Имя</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Телефон</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Потрачено</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Заказов</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Баллы</th>
              <th style={{ padding: '12px 16px', width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Нет покупателей</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.name || '—'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{c.email || '—'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{c.phone || '—'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--color-gold)' }}>{(c.total_spent || 0).toLocaleString('ru-RU')} ₽</td>
                <td style={{ padding: '12px 16px' }}>{c.orders_count || 0}</td>
                <td style={{ padding: '12px 16px', color: 'var(--color-gold)' }}>{(c.bonus_points || 0).toLocaleString('ru-RU')}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => remove(c.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        Всего: {customers.length} покупателей
      </p>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: 500 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>
              {editItem ? 'Редактировать' : 'Добавить покупателя'}
            </h3>
            <div className="form-group">
              <label className="form-label">ФИО</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Иванов Иван Иванович" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input className="form-input" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 (999) 123-45-67" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={save}>Сохранить</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-pg-title { font-size: 2rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { width: 90%; }
      `}</style>
    </>
  );
}
