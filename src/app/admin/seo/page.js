'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '../layout';

export default function AdminSEO() {
  const { authFetch } = useAdmin();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    authFetch('/api/admin/settings').then(r => r.json()).then(s => { setSettings(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const update = (key, value) => setSettings({ ...settings, [key]: value });

  const save = async () => {
    setSaving(true);
    await authFetch('/api/admin/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="admin-pg-title" style={{ marginBottom: 0 }}>Настройки SEO</h1>
        <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`} onClick={save} disabled={saving}>
          {saving ? 'Сохранение...' : saved ? '✓ Сохранено!' : '💾 Сохранить'}
        </button>
      </div>

      {/* Analytics counters */}
      <div className="card section-card">
        <h3 className="section-title">Счетчики посещаемости</h3>
        <div className="form-group">
          <label className="form-label">Номер счётчика Яндекс Метрики</label>
          <input className="form-input" value={settings.yandex_metrika_id || ''} onChange={e => update('yandex_metrika_id', e.target.value)} placeholder="Напр. 45716004" style={{ maxWidth: 300 }} />
          <p className="field-hint">Чтобы получить номер, зайдите на <a href="https://metrika.yandex.ru" target="_blank" rel="noopener" style={{ color: 'var(--color-gold)' }}>metrika.yandex.ru</a></p>
        </div>
        <div className="form-group">
          <label className="form-label">Номер счётчика Google Analytics</label>
          <input className="form-input" value={settings.google_analytics_id || ''} onChange={e => update('google_analytics_id', e.target.value)} placeholder="Напр. UA-105877147-1 или G-XXXXXXXXXX" style={{ maxWidth: 350 }} />
          <p className="field-hint">Чтобы получить номер, зайдите на <a href="https://analytics.google.com" target="_blank" rel="noopener" style={{ color: 'var(--color-gold)' }}>analytics.google.com</a></p>
        </div>
      </div>

      {/* Custom scripts */}
      <div className="card section-card">
        <h3 className="section-title">Вставка дополнительных скриптов</h3>
        <div className="form-group">
          <label className="form-label">Скрипт в head</label>
          <textarea className="form-input form-textarea code-area" value={settings.script_header || ''} onChange={e => update('script_header', e.target.value)} placeholder="<script>...</script>" rows={4} />
        </div>
        <div className="form-group">
          <label className="form-label">Скрипт в footer</label>
          <textarea className="form-input form-textarea code-area" value={settings.script_footer || ''} onChange={e => update('script_footer', e.target.value)} placeholder="<script>...</script>" rows={4} />
        </div>
      </div>

      {/* Meta tags */}
      <div className="card section-card">
        <h3 className="section-title">Мета-описание для всех страниц</h3>
        <div className="form-group">
          <label className="form-label">Шаблон meta title</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>[meta_title]</span>
            <input className="form-input" value={settings.meta_title_template || ''} onChange={e => update('meta_title_template', e.target.value)} placeholder="на сайте" style={{ maxWidth: 300 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>☆ Имя Сайта ☆</span>
          </div>
          <p className="field-hint">Только для страниц, где мета-описание не указано</p>
        </div>
        <div className="form-group">
          <label className="form-label">SEO Title</label>
          <input className="form-input" value={settings.seo_title || ''} onChange={e => update('seo_title', e.target.value)} placeholder="Craftcake — Мастерская десертов" />
        </div>
        <div className="form-group">
          <label className="form-label">SEO Description</label>
          <textarea className="form-input form-textarea" value={settings.seo_description || ''} onChange={e => update('seo_description', e.target.value)} rows={3} />
        </div>
        <div className="form-group">
          <label className="form-label">SEO Keywords</label>
          <input className="form-input" value={settings.seo_keywords || ''} onChange={e => update('seo_keywords', e.target.value)} />
        </div>
      </div>

      {/* robots.txt */}
      <div className="card section-card">
        <h3 className="section-title">robots.txt</h3>
        <div className="form-group">
          <textarea className="form-input form-textarea code-area" value={settings.robots_txt || ''} onChange={e => update('robots_txt', e.target.value)} rows={6} />
        </div>
      </div>

      <style jsx>{`
        .admin-pg-title { font-size: 2rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .section-card { padding: 1.5rem; margin-bottom: 1.5rem; }
        .section-title { font-family: var(--font-heading); font-size: 1.15rem; margin-bottom: 1.25rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .field-hint { font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.35rem; }
        .code-area { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.85rem; }
      `}</style>
    </>
  );
}
