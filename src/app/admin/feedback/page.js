'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '../layout';

export default function AdminFeedback() {
  const { authFetch } = useAdmin();
  const [tab, setTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editText, setEditText] = useState('');

  const load = () => {
    Promise.all([
      authFetch('/api/admin/reviews').then(r => r.json()),
      authFetch('/api/admin/feedback').then(r => r.json()),
    ]).then(([r, f]) => { setReviews(r); setFeedback(f); setLoading(false); });
  };
  useEffect(load, []);

  const approveReview = async (id) => {
    await authFetch('/api/admin/reviews', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'approved' }) });
    load();
  };
  const rejectReview = async (id) => {
    await authFetch('/api/admin/reviews', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'rejected' }) });
    load();
  };
  const deleteReview = async (id) => {
    if (!confirm('Удалить отзыв?')) return;
    await authFetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
    load();
  };
  const saveReviewEdit = async (id) => {
    await authFetch('/api/admin/reviews', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, text: editText }) });
    setEditingReview(null); load();
  };

  const updateFeedbackStatus = async (id, status) => {
    await authFetch('/api/admin/feedback', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    load();
  };
  const deleteFeedback = async (id) => {
    if (!confirm('Удалить?')) return;
    await authFetch(`/api/admin/feedback?id=${id}`, { method: 'DELETE' });
    load();
  };

  const statusBadge = (s) => {
    const colors = { pending: '#f59e0b', approved: '#4caf50', rejected: '#ef4444', new: '#3b82f6', read: '#9ca3af' };
    const labels = { pending: 'На модерации', approved: 'Одобрен', rejected: 'Отклонён', new: 'Новое', read: 'Прочитано' };
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: `${colors[s] || '#666'}22`, color: colors[s] || '#666' }}>{labels[s] || s}</span>;
  };

  const stars = (n) => '⭐'.repeat(n) + '☆'.repeat(5 - n);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  return (
    <>
      <h1 className="admin-pg-title">Обратная связь и отзывы</h1>

      <div className="tabs-bar">
        <button className={`tab-btn ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
          Отзывы к товарам {reviews.filter(r => r.status === 'pending').length > 0 && <span className="badge">{reviews.filter(r => r.status === 'pending').length}</span>}
        </button>
        <button className={`tab-btn ${tab === 'feedback' ? 'active' : ''}`} onClick={() => setTab('feedback')}>
          Обращения {feedback.filter(f => f.status === 'new').length > 0 && <span className="badge">{feedback.filter(f => f.status === 'new').length}</span>}
        </button>
      </div>

      {tab === 'reviews' && (
        <div className="items-list">
          {reviews.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Нет отзывов</p>}
          {reviews.map(r => (
            <div key={r.id} className="card item-card">
              <div className="item-header">
                <div>
                  <strong>{r.name}</strong>
                  {r.email && <span className="item-email">{r.email}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {statusBadge(r.status)}
                  <span className="item-date">{new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              {r.product_name && <p className="item-product">Товар: <strong>{r.product_name}</strong></p>}
              <p className="item-rating">{stars(r.rating)}</p>
              {editingReview === r.id ? (
                <div>
                  <textarea className="form-input form-textarea" rows={3} value={editText} onChange={e => setEditText(e.target.value)} />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveReviewEdit(r.id)}>Сохранить</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingReview(null)}>Отмена</button>
                  </div>
                </div>
              ) : (
                <p className="item-text">{r.text}</p>
              )}
              <div className="item-actions">
                {r.status === 'pending' && <>
                  <button className="btn btn-primary btn-sm" onClick={() => approveReview(r.id)}>✓ Одобрить</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => rejectReview(r.id)}>✗ Отклонить</button>
                </>}
                {r.status !== 'pending' && r.status === 'rejected' && <button className="btn btn-secondary btn-sm" onClick={() => approveReview(r.id)}>✓ Одобрить</button>}
                {r.status !== 'pending' && r.status === 'approved' && <button className="btn btn-secondary btn-sm" onClick={() => rejectReview(r.id)}>✗ Отклонить</button>}
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditingReview(r.id); setEditText(r.text); }}>✏️ Редактировать</button>
                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => deleteReview(r.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'feedback' && (
        <div className="items-list">
          {feedback.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Нет обращений</p>}
          {feedback.map(f => (
            <div key={f.id} className="card item-card">
              <div className="item-header">
                <div>
                  <strong>{f.name}</strong>
                  {f.email && <span className="item-email">{f.email}</span>}
                  {f.phone && <span className="item-email">{f.phone}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {statusBadge(f.status)}
                  <span className="item-date">{new Date(f.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              <p className="item-text">{f.message}</p>
              <div className="item-actions">
                {f.status === 'new' && <button className="btn btn-secondary btn-sm" onClick={() => updateFeedbackStatus(f.id, 'read')}>✓ Прочитано</button>}
                {f.status === 'read' && <button className="btn btn-secondary btn-sm" onClick={() => updateFeedbackStatus(f.id, 'new')}>📌 Новое</button>}
                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => deleteFeedback(f.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .admin-pg-title { font-size: 2rem; margin-bottom: 1.5rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .tabs-bar { display: flex; gap: 0; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); }
        .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; font-size: 0.9rem; color: var(--color-text-muted); border-bottom: 2px solid transparent; transition: all var(--transition-fast); display: flex; align-items: center; gap: 0.5rem; }
        .tab-btn:hover { color: var(--color-text); }
        .tab-btn.active { color: var(--color-gold); border-bottom-color: var(--color-gold); }
        .badge { background: var(--color-error); color: #fff; font-size: 0.7rem; padding: 2px 7px; border-radius: 10px; }
        .items-list { display: flex; flex-direction: column; gap: 1rem; }
        .item-card { padding: 1.25rem; }
        .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem; }
        .item-email { font-size: 0.8rem; color: var(--color-text-muted); margin-left: 0.75rem; }
        .item-date { font-size: 0.8rem; color: var(--color-text-muted); }
        .item-product { font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 0.35rem; }
        .item-rating { margin-bottom: 0.5rem; letter-spacing: 2px; }
        .item-text { color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 0.75rem; }
        .item-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
      `}</style>
    </>
  );
}
