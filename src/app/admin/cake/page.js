'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '../layout';

export default function AdminCake() {
  const { authFetch } = useAdmin();
  const [data, setData] = useState({ sizes: [], fillings: [] });
  const [loading, setLoading] = useState(true);
  const [editType, setEditType] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);

  const load = () => {
    authFetch('/api/admin/cake').then(r => r.json()).then(setData).catch(() => { }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = (type) => {
    setEditType(type);
    setEditItem(null);
    setForm(type === 'size' ? { name: '', diameter: '', servings: '', price: 0 } : { name: '', description: '', image: '', price_modifier: 0 });
  };

  const openEdit = (type, item) => {
    setEditType(type);
    setEditItem(item.id);
    setForm(type === 'size' ? { name: item.name, diameter: item.diameter, servings: item.servings, price: item.price } : { name: item.name, description: item.description, image: item.image || '', price_modifier: item.price_modifier });
  };

  const save = async () => {
    if (editItem) {
      await authFetch('/api/admin/cake', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: editType, id: editItem, ...form }) });
    } else {
      await authFetch('/api/admin/cake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: editType, ...form }) });
    }
    setEditType(null);
    load();
  };

  const del = async (type, id) => {
    if (!confirm('Удалить?')) return;
    await authFetch(`/api/admin/cake?type=${type}&id=${id}`, { method: 'DELETE' });
    load();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await authFetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm(prev => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  return (
    <>
      <h1 className="admin-pg-title">Конструктор торта</h1>
      <div className="cake-grid">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>🎂 Размеры</h2>
            <button className="btn btn-primary btn-sm" onClick={() => openNew('size')}>+ Добавить</button>
          </div>
          {data.sizes.map(s => (
            <div key={s.id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{s.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>⌀ {s.diameter}, {s.servings} порц.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{s.price?.toLocaleString('ru-RU')} ₽</span>
                  <button className="btn-icon" onClick={() => openEdit('size', s)}>✏️</button>
                  <button className="btn-icon" style={{ color: 'var(--color-error)' }} onClick={() => del('size', s.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>🍰 Начинки</h2>
            <button className="btn btn-primary btn-sm" onClick={() => openNew('filling')}>+ Добавить</button>
          </div>
          {data.fillings.map(f => (
            <div key={f.id} className="card filling-card-admin" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="filling-thumb">
                  {f.image ? <img src={f.image} alt={f.name} /> : <span>🍰</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{f.name}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.description}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  {f.price_modifier > 0 && <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem' }}>+{f.price_modifier} ₽</span>}
                  <button className="btn-icon" onClick={() => openEdit('filling', f)}>✏️</button>
                  <button className="btn-icon" style={{ color: 'var(--color-error)' }} onClick={() => del('filling', f.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editType && (
        <div className="modal-overlay" onClick={() => setEditType(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Редактировать' : 'Добавить'} {editType === 'size' ? 'размер' : 'начинку'}</h2>
              <button className="modal-close" onClick={() => setEditType(null)}>✕</button>
            </div>
            <div className="form-group"><label className="form-label">Название</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            {editType === 'size' ? (
              <>
                <div className="form-group"><label className="form-label">Диаметр</label><input className="form-input" value={form.diameter} onChange={e => setForm({ ...form, diameter: e.target.value })} placeholder="20 см" /></div>
                <div className="form-group"><label className="form-label">Порций</label><input className="form-input" value={form.servings} onChange={e => setForm({ ...form, servings: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Цена</label><input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} /></div>
              </>
            ) : (
              <>
                <div className="form-group"><label className="form-label">Описание</label><textarea className="form-input form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="form-group">
                  <label className="form-label">Фото начинки</label>
                  <div className="image-upload-area">
                    {form.image ? (
                      <div className="image-preview-wrap">
                        <img src={form.image} alt="Preview" className="image-preview" />
                        <button className="image-remove-btn" onClick={() => setForm({ ...form, image: '' })} title="Удалить фото">✕</button>
                      </div>
                    ) : (
                      <div className="image-dropzone" onClick={() => document.getElementById('filling-img-input').click()}>
                        <span className="dropzone-icon">📷</span>
                        <span className="dropzone-text">Нажмите для загрузки фото</span>
                        <span className="dropzone-hint">JPEG, PNG, WebP · до 5 МБ</span>
                      </div>
                    )}
                    <input
                      id="filling-img-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    {form.image && (
                      <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => document.getElementById('filling-img-input').click()}>
                        {uploading ? 'Загрузка...' : '📷 Заменить фото'}
                      </button>
                    )}
                    {uploading && <div className="upload-progress">Загрузка...</div>}
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Надбавка к цене (₽)</label><input className="form-input" type="number" value={form.price_modifier} onChange={e => setForm({ ...form, price_modifier: parseFloat(e.target.value) })} /></div>
              </>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setEditType(null)}>Отмена</button>
              <button className="btn btn-primary" onClick={save}>{editItem ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-pg-title { font-size: 2rem; margin-bottom: 2rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .cake-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .filling-thumb {
          width: 48px; height: 48px; border-radius: var(--radius-md);
          overflow: hidden; flex-shrink: 0; background: var(--color-surface);
          display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
        }
        .filling-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .image-upload-area { margin-top: 0.5rem; }
        .image-preview-wrap { position: relative; display: inline-block; border-radius: var(--radius-lg); overflow: hidden; }
        .image-preview { width: 180px; height: 140px; object-fit: cover; border-radius: var(--radius-lg); border: 1px solid var(--color-border); display: block; }
        .image-remove-btn {
          position: absolute; top: 6px; right: 6px;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(0,0,0,0.7); color: #fff;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; font-size: 0.8rem;
          transition: all var(--transition-fast);
        }
        .image-remove-btn:hover { background: var(--color-error); }
        .image-dropzone {
          width: 180px; height: 140px;
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          cursor: pointer; transition: all var(--transition-base);
          gap: 0.5rem;
        }
        .image-dropzone:hover { border-color: var(--color-gold); background: rgba(201,168,76,0.05); }
        .dropzone-icon { font-size: 2rem; }
        .dropzone-text { font-size: 0.8rem; color: var(--color-text-secondary); }
        .dropzone-hint { font-size: 0.7rem; color: var(--color-text-muted); }
        .upload-progress { font-size: 0.8rem; color: var(--color-gold); margin-top: 0.5rem; }
        @media (max-width: 768px) { .cake-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
