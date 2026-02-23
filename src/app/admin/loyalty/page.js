'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '../layout';

const MODES = [
  { value: 'disabled', label: 'Скидки отключены' },
  { value: 'order', label: 'Скидка от суммы заказа' },
  { value: 'cumulative', label: 'Накопительная скидка' },
  { value: 'combined', label: 'Скидка от суммы заказа + Накопительная скидка' },
];

export default function AdminLoyalty() {
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

  // JSON array helpers
  const getJson = (key, fallback = []) => { try { return JSON.parse(settings[key] || '[]'); } catch { return fallback; } };
  const setJson = (key, val) => update(key, JSON.stringify(val));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const orderDiscounts = getJson('order_discounts');
  const cumulativeDiscounts = getJson('cumulative_discounts');
  const mode = settings.discount_mode || 'disabled';

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="admin-pg-title" style={{ marginBottom: 0 }}>Скидки и лояльность</h1>
        <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`} onClick={save} disabled={saving}>
          {saving ? 'Сохранение...' : saved ? '✓ Сохранено!' : '💾 Сохранить'}
        </button>
      </div>

      {/* Discount mode */}
      <div className="card section-card">
        <h3 className="section-title">Скидки</h3>
        <div className="radio-group">
          {MODES.map(m => (
            <label key={m.value} className={`radio-item ${mode === m.value ? 'active' : ''}`}>
              <input type="radio" name="mode" value={m.value} checked={mode === m.value} onChange={() => update('discount_mode', m.value)} />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
        <p className="hint">Купоны, скидки для вариантов товаров, реферальная программа и баллы работают независимо</p>
      </div>

      {/* Order-based discounts */}
      {(mode === 'order' || mode === 'combined') && (
        <div className="card section-card">
          <h3 className="section-title">Скидка от суммы заказа (₽)</h3>
          <div className="tier-table">
            <div className="tier-header">
              <span>Название</span><span>Сумма от</span><span>Сумма до</span><span>Скидка %</span><span></span>
            </div>
            {orderDiscounts.map((d, i) => (
              <div key={i} className="tier-row">
                <input className="form-input tier-input" value={d.name} onChange={e => { const n = [...orderDiscounts]; n[i] = { ...d, name: e.target.value }; setJson('order_discounts', n); }} />
                <input className="form-input tier-input" type="number" value={d.from} onChange={e => { const n = [...orderDiscounts]; n[i] = { ...d, from: Number(e.target.value) }; setJson('order_discounts', n); }} />
                <input className="form-input tier-input" type="number" value={d.to} onChange={e => { const n = [...orderDiscounts]; n[i] = { ...d, to: Number(e.target.value) }; setJson('order_discounts', n); }} />
                <input className="form-input tier-input" type="number" value={d.percent} onChange={e => { const n = [...orderDiscounts]; n[i] = { ...d, percent: Number(e.target.value) }; setJson('order_discounts', n); }} />
                <button className="btn-icon" style={{ color: 'var(--color-error)' }} onClick={() => setJson('order_discounts', orderDiscounts.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => setJson('order_discounts', [...orderDiscounts, { name: '', from: 0, to: 0, percent: 0 }])}>+ Добавить</button>
        </div>
      )}

      {/* Cumulative discounts */}
      {(mode === 'cumulative' || mode === 'combined') && (
        <div className="card section-card">
          <h3 className="section-title">Накопительная скидка (₽)</h3>
          <div className="tier-table">
            <div className="tier-header two-col">
              <span>Сумма</span><span>%</span><span></span>
            </div>
            {cumulativeDiscounts.map((d, i) => (
              <div key={i} className="tier-row two-col">
                <input className="form-input tier-input" type="number" value={d.threshold} onChange={e => { const n = [...cumulativeDiscounts]; n[i] = { ...d, threshold: Number(e.target.value) }; setJson('cumulative_discounts', n); }} />
                <input className="form-input tier-input" type="number" value={d.percent} onChange={e => { const n = [...cumulativeDiscounts]; n[i] = { ...d, percent: Number(e.target.value) }; setJson('cumulative_discounts', n); }} />
                <button className="btn-icon" style={{ color: 'var(--color-error)' }} onClick={() => setJson('cumulative_discounts', cumulativeDiscounts.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => setJson('cumulative_discounts', [...cumulativeDiscounts, { threshold: 0, percent: 0 }])}>+ Добавить</button>
        </div>
      )}

      {/* Bonus points */}
      <div className="card section-card">
        <h3 className="section-title">Баллы (1 балл = 1 ₽)</h3>
        <div className="inline-fields">
          <div className="inline-field">
            <label>Начисление баллов от суммы оплаченного заказа</label>
            <div className="input-unit">
              <input className="form-input" type="number" value={settings.bonus_earn_percent || ''} onChange={e => update('bonus_earn_percent', e.target.value)} style={{ width: 80 }} />
              <span>%</span>
            </div>
          </div>
          <div className="inline-field">
            <label>Лимит использования баллов при оплате заказа</label>
            <div className="input-unit">
              <input className="form-input" type="number" value={settings.bonus_use_limit || ''} onChange={e => update('bonus_use_limit', e.target.value)} style={{ width: 80 }} />
              <span>%</span>
            </div>
          </div>
          <div className="inline-field">
            <label>Адрес страницы описания бонусной программы</label>
            <input className="form-input" value={settings.bonus_page_url || ''} onChange={e => update('bonus_page_url', e.target.value)} placeholder="Напр.: bonus" style={{ width: 250 }} />
          </div>
        </div>
      </div>

      {/* Referral program */}
      <div className="card section-card">
        <h3 className="section-title">Реферальная программа</h3>
        <div className="inline-fields">
          <div className="inline-field">
            <label>Начисление баллов от суммы оплаченного заказа</label>
            <div className="input-unit">
              <input className="form-input" type="number" value={settings.referral_earn_percent || ''} onChange={e => update('referral_earn_percent', e.target.value)} style={{ width: 80 }} />
              <span>%</span>
            </div>
          </div>
          <div className="inline-field">
            <label>Срок жизни cookie</label>
            <div className="input-unit">
              <input className="form-input" type="number" value={settings.referral_cookie_days || ''} onChange={e => update('referral_cookie_days', e.target.value)} style={{ width: 80 }} />
              <span>дней</span>
            </div>
          </div>
          <div className="inline-field">
            <label>Адрес страницы описания реферальной программы</label>
            <input className="form-input" value={settings.referral_page_url || ''} onChange={e => update('referral_page_url', e.target.value)} placeholder="Напр.: partners" style={{ width: 250 }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-pg-title { font-size: 2rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .section-card { padding: 1.5rem; margin-bottom: 1.5rem; }
        .section-title { font-family: var(--font-heading); font-size: 1.15rem; margin-bottom: 1.25rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .radio-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .radio-item { display: flex; align-items: center; gap: 0.75rem; padding: 8px 12px; border-radius: var(--radius-md); cursor: pointer; transition: background var(--transition-fast); font-size: 0.9rem; }
        .radio-item:hover { background: var(--color-bg); }
        .radio-item.active { background: rgba(201,168,76,0.08); color: var(--color-gold); }
        .radio-item input[type="radio"] { accent-color: var(--color-gold); }
        .hint { font-size: 0.8rem; color: var(--color-text-muted); font-style: italic; }
        .tier-table { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
        .tier-header { display: grid; grid-template-columns: 1fr 1fr 1fr 100px 40px; gap: 0; padding: 8px 12px; background: var(--color-bg); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); }
        .tier-header.two-col { grid-template-columns: 1fr 100px 40px; }
        .tier-row { display: grid; grid-template-columns: 1fr 1fr 1fr 100px 40px; gap: 0; padding: 4px 8px; border-bottom: 1px solid var(--color-border); align-items: center; }
        .tier-row.two-col { grid-template-columns: 1fr 100px 40px; }
        .tier-row:last-child { border-bottom: none; }
        .tier-input { border: 1px solid var(--color-border); padding: 6px 8px; font-size: 0.85rem; margin: 2px; }
        .inline-fields { display: flex; flex-direction: column; gap: 1rem; }
        .inline-field { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .inline-field label { font-size: 0.9rem; color: var(--color-text-secondary); min-width: 280px; }
        .input-unit { display: flex; align-items: center; gap: 0.5rem; }
        .input-unit span { font-size: 0.85rem; color: var(--color-text-muted); }
        @media (max-width: 768px) {
          .tier-header, .tier-row { grid-template-columns: 1fr; }
          .inline-field { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .inline-field label { min-width: auto; }
        }
      `}</style>
    </>
  );
}
