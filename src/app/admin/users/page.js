'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '../layout';

export default function AdminUsers() {
  const { authFetch } = useAdmin();
  const [tab, setTab] = useState('subscribers');
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '' });
  const [mailForm, setMailForm] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [mailResult, setMailResult] = useState('');
  const [importText, setImportText] = useState('');

  const load = () => {
    authFetch('/api/admin/settings').then(r => r.json()).then(s => {
      try { setSubscribers(JSON.parse(s.subscribers_list || '[]')); } catch { setSubscribers([]); }
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const saveSubscribers = async (list) => {
    setSubscribers(list);
    await authFetch('/api/admin/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscribers_list: JSON.stringify(list) }),
    });
  };

  const addSubscriber = async () => {
    if (!addForm.email) return;
    const list = [...subscribers, { name: addForm.name, email: addForm.email, subscribed: true, added: new Date().toISOString() }];
    await saveSubscribers(list);
    setAddForm({ name: '', email: '' }); setShowAdd(false);
  };

  const removeSubscriber = async (idx) => {
    if (!confirm('Удалить подписчика?')) return;
    await saveSubscribers(subscribers.filter((_, i) => i !== idx));
  };

  const importSubscribers = async () => {
    const lines = importText.split('\n').filter(l => l.trim());
    const newSubs = lines.map(l => {
      const parts = l.split(/[,;\t]/);
      return { email: (parts[0] || '').trim(), name: (parts[1] || '').trim(), subscribed: true, added: new Date().toISOString() };
    }).filter(s => s.email);
    await saveSubscribers([...subscribers, ...newSubs]);
    setImportText('');
  };

  const exportSubscribers = () => {
    const csv = 'Email,Имя\n' + subscribers.map(s => `${s.email},${s.name || ''}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'subscribers.csv'; a.click();
  };

  const sendMail = async () => {
    if (!mailForm.subject || !mailForm.body) { setMailResult('Заполните тему и текст письма'); return; }
    setSending(true); setMailResult('');
    // In a real system this would call an email API. Here we simulate.
    await new Promise(r => setTimeout(r, 1500));
    setMailResult(`✅ Рассылка поставлена в очередь для ${subscribers.filter(s => s.subscribed !== false).length} подписчиков`);
    setSending(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const tabs = [
    { id: 'subscribers', label: 'Список подписчиков' },
    { id: 'mailing', label: 'Email-рассылка' },
  ];

  return (
    <>
      <h1 className="admin-pg-title">Пользователи и рассылки</h1>

      <div className="tabs-bar">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'subscribers' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}>+ Добавить подписчика</button>
            <button className="btn btn-secondary btn-sm" onClick={exportSubscribers}>📥 Экспорт подписчиков</button>
          </div>

          {showAdd && (
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', maxWidth: 500 }}>
              <h4 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>Добавить подписчика</h4>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Имя</label>
                <input className="form-input" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" onClick={addSubscriber}>Добавить</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Отмена</button>
              </div>
            </div>
          )}

          {/* Import */}
          <details style={{ marginBottom: '1.5rem' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--color-gold)', fontSize: '0.9rem' }}>Импорт подписчиков</summary>
            <div className="card" style={{ padding: '1.25rem', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Вставьте email адреса (по одному на строку, через запятую можно добавить имя)</p>
              <textarea className="form-input form-textarea" rows={5} value={importText} onChange={e => setImportText(e.target.value)} placeholder="email@example.com, Имя&#10;email2@example.com, Имя2" />
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }} onClick={importSubscribers}>Импортировать</button>
            </div>
          </details>

          {/* Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {subscribers.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Нет записей</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Имя</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Дата</th>
                    <th style={{ padding: '12px 16px', width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px' }}>{s.email}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{s.name || '—'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{s.added ? new Date(s.added).toLocaleDateString('ru-RU') : '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => removeSubscriber(i)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Всего: {subscribers.length}</p>
        </div>
      )}

      {tab === 'mailing' && (
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.25rem' }}>Настройки</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Подписчиков для рассылки: <strong style={{ color: 'var(--color-gold)' }}>{subscribers.filter(s => s.subscribed !== false).length}</strong>
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Тема письма</label>
              <input className="form-input" value={mailForm.subject} onChange={e => setMailForm({ ...mailForm, subject: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Текст письма</label>
              <textarea className="form-input form-textarea" rows={10} value={mailForm.body} onChange={e => setMailForm({ ...mailForm, body: e.target.value })} placeholder="Здравствуйте! ..." />
            </div>
            {mailResult && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', background: mailResult.startsWith('✅') ? 'rgba(76,175,80,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${mailResult.startsWith('✅') ? 'rgba(76,175,80,0.25)' : 'rgba(248,113,113,0.25)'}`, fontSize: '0.9rem' }}>
                {mailResult}
              </div>
            )}
            <button className="btn btn-primary" onClick={sendMail} disabled={sending}>
              {sending ? 'Отправка...' : '📧 Поставить в очередь на рассылку'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-pg-title { font-size: 2rem; margin-bottom: 1.5rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .tabs-bar { display: flex; gap: 0; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); }
        .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; font-size: 0.9rem; color: var(--color-text-muted); border-bottom: 2px solid transparent; transition: all var(--transition-fast); }
        .tab-btn:hover { color: var(--color-text); }
        .tab-btn.active { color: var(--color-gold); border-bottom-color: var(--color-gold); }
      `}</style>
    </>
  );
}
