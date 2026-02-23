'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '../layout';

export default function AdminCategories() {
  const { authFetch } = useAdmin();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '' });

  const load = () => {
    authFetch('/api/admin/categories').then(r => r.json()).then(setCats).catch(() => { }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!form.name) return;
    if (editId) {
      await authFetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...form }) });
    } else {
      await authFetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setForm({ name: '', description: '', image: '' });
    setEditId(null);
    load();
  };

  const edit = (c) => { setEditId(c.id); setForm({ name: c.name, description: c.description || '', image: c.image || '' }); };
  const del = async (id) => {
    if (!confirm('Удалить категорию? Товары останутся без категории.')) return;
    await authFetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <h1 className="admin-pg-title">Категории</h1>
      <div className="cats-layout">
        <div className="cats-form card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>{editId ? 'Редактировать' : 'Новая категория'}</h3>
          <div className="form-group"><label className="form-label">Название</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Описание</label><textarea className="form-input form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">URL изображения</label><input className="form-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary btn-sm" onClick={save}>{editId ? 'Сохранить' : 'Создать'}</button>
            {editId && <button className="btn btn-secondary btn-sm" onClick={() => { setEditId(null); setForm({ name: '', description: '', image: '' }); }}>Отмена</button>}
          </div>
        </div>
        <div className="cats-list">
          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" /></div> : cats.map(c => (
            <div key={c.id} className="cat-item card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>{c.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.description || 'Нет описания'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-icon" onClick={() => edit(c)}>✏️</button>
                  <button className="btn-icon" style={{ color: 'var(--color-error)' }} onClick={() => del(c.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .admin-pg-title { font-size: 2rem; margin-bottom: 2rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .cats-layout { display: grid; grid-template-columns: 380px 1fr; gap: 2rem; }
        @media (max-width: 768px) { .cats-layout { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
