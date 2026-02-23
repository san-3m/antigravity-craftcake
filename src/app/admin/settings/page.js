'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '../layout';

const settingGroups = [
  {
    key: 'store', label: '🏪 Магазин', fields: [
      { key: 'store_name', label: 'Название магазина', type: 'text' },
      { key: 'store_description', label: 'Описание', type: 'textarea' },
      { key: 'store_phone', label: 'Телефон', type: 'text' },
      { key: 'store_email', label: 'Email', type: 'text' },
      { key: 'store_address', label: 'Адрес', type: 'text' },
      { key: 'store_hours', label: 'Режим работы', type: 'text' },
    ]
  },
  {
    key: 'delivery', label: '🚚 Доставка', fields: [
      { key: 'delivery_enabled', label: 'Доставка включена', type: 'toggle' },
      { key: 'delivery_cost', label: 'Стоимость доставки (₽)', type: 'number' },
      { key: 'delivery_free_from', label: 'Бесплатная от (₽)', type: 'number' },
      { key: 'delivery_min_order', label: 'Минимальный заказ (₽)', type: 'number' },
      { key: 'delivery_zones', label: 'Зоны доставки', type: 'textarea' },
    ]
  },
  {
    key: 'payment', label: '💳 Оплата', fields: [
      { key: 'payment_cash', label: 'Наличные', type: 'toggle' },
      { key: 'payment_card', label: 'Картой', type: 'toggle' },
      { key: 'payment_online', label: 'Онлайн-оплата', type: 'toggle' },
      { key: 'payment_note', label: 'Примечание к оплате', type: 'textarea' },
    ]
  },
  {
    key: 'seo', label: '🔍 SEO', fields: [
      { key: 'seo_title', label: 'Title по умолчанию', type: 'text' },
      { key: 'seo_description', label: 'Meta Description', type: 'textarea' },
      { key: 'seo_keywords', label: 'Ключевые слова', type: 'text' },
      { key: 'seo_og_image', label: 'OG Image URL', type: 'text' },
    ]
  },
  {
    key: 'social', label: '📱 Соцсети', fields: [
      { key: 'social_telegram', label: 'Telegram', type: 'text' },
      { key: 'social_instagram', label: 'Instagram', type: 'text' },
      { key: 'social_vk', label: 'ВКонтакте', type: 'text' },
      { key: 'social_whatsapp', label: 'WhatsApp', type: 'text' },
    ]
  },
  {
    key: 'discounts', label: '🏷️ Скидки', fields: [
      { key: 'discount_enabled', label: 'Скидки включены', type: 'toggle' },
      { key: 'discount_percent', label: 'Процент скидки (%)', type: 'number' },
      { key: 'discount_min_order', label: 'Мин. заказ для скидки (₽)', type: 'number' },
      { key: 'referral_enabled', label: 'Реферальная программа', type: 'toggle' },
      { key: 'referral_bonus', label: 'Бонус за реферала (₽)', type: 'number' },
    ]
  },
  {
    key: 'cake', label: '🎂 Конструктор торта', fields: [
      { key: 'cake_price_per_kg', label: 'Цена за 1 кг (₽)', type: 'number' },
      { key: 'cake_berries_price', label: 'Украшение ягодами (₽)', type: 'number' },
      { key: 'cake_fondant_price', label: 'Покрытие мастикой (₽)', type: 'number' },
      { key: 'cake_flowers_price', label: 'Живые цветы (₽)', type: 'number' },
    ]
  },
  {
    key: 'delivery', label: '🚚 Доставка', fields: [
      { key: 'shop_address', label: 'Адрес кондитерской', type: 'text' },
      { key: 'shop_lat', label: 'Широта (lat)', type: 'text' },
      { key: 'shop_lng', label: 'Долгота (lng)', type: 'text' },
      { key: 'delivery_zones', label: 'Зоны доставки', type: 'zones' },
    ]
  },
  {
    key: 'notifications', label: '🔔 Уведомления', fields: [
      { key: 'notify_email', label: 'Email для уведомлений', type: 'text' },
      { key: 'notify_telegram', label: 'Telegram для уведомлений', type: 'text' },
      { key: 'notify_new_order', label: 'Уведомлять о новых заказах', type: 'toggle' },
      { key: 'notify_feedback', label: 'Уведомлять об обратной связи', type: 'toggle' },
      { key: 'admin_recovery_email', label: 'Email для восстановления пароля', type: 'text' },
    ]
  },
  {
    key: 'legal', label: '📋 Правовая информация', fields: [
      { key: 'legal_name', label: 'Юридическое название', type: 'text' },
      { key: 'legal_inn', label: 'ИНН', type: 'text' },
      { key: 'legal_ogrn', label: 'ОГРН', type: 'text' },
      { key: 'privacy_policy', label: 'Политика конфиденциальности', type: 'textarea' },
      { key: 'terms_of_service', label: 'Пользовательское соглашение', type: 'textarea' },
    ]
  },
];

export default function AdminSettings() {
  const { authFetch } = useAdmin();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState('store');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    authFetch('/api/admin/settings').then(r => r.json()).then(s => { setSettings(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await authFetch('/api/admin/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (key, value) => setSettings({ ...settings, [key]: value });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const group = settingGroups.find(g => g.key === activeGroup);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="admin-pg-title" style={{ marginBottom: 0 }}>Настройки</h1>
        <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`} onClick={save} disabled={saving}>
          {saving ? 'Сохранение...' : saved ? '✓ Сохранено!' : '💾 Сохранить'}
        </button>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          {settingGroups.map(g => (
            <button key={g.key} className={`settings-nav-item ${activeGroup === g.key ? 'active' : ''}`} onClick={() => setActiveGroup(g.key)}>
              {g.label}
            </button>
          ))}
        </nav>

        <div className="settings-panel card" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>{group?.label}</h2>
          {group?.fields.map(f => {
            if (f.type === 'zones') {
              let zones = [];
              try { zones = JSON.parse(settings[f.key] || '[]'); } catch { }
              const updateZones = (newZones) => update(f.key, JSON.stringify(newZones));
              const addZone = () => {
                const last = zones[zones.length - 1];
                updateZones([...zones, { from: last ? last.to : 0, to: (last ? last.to : 0) + 5, price: 1000, color: '#9C27B0' }]);
              };
              const removeZone = (idx) => updateZones(zones.filter((_, i) => i !== idx));
              const editZone = (idx, field, val) => {
                const nz = [...zones];
                nz[idx] = { ...nz[idx], [field]: field === 'color' ? val : Number(val) };
                updateZones(nz);
              };
              return (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <div className="zones-editor">
                    {zones.map((z, i) => (
                      <div key={i} className="zone-row">
                        <input type="color" value={z.color} onChange={e => editZone(i, 'color', e.target.value)} className="zone-color-input" title="Цвет зоны" />
                        <div className="zone-field">
                          <span className="zone-field-label">От</span>
                          <input type="number" className="form-input zone-num" value={z.from} onChange={e => editZone(i, 'from', e.target.value)} />
                          <span className="zone-field-unit">км</span>
                        </div>
                        <div className="zone-field">
                          <span className="zone-field-label">До</span>
                          <input type="number" className="form-input zone-num" value={z.to} onChange={e => editZone(i, 'to', e.target.value)} />
                          <span className="zone-field-unit">км</span>
                        </div>
                        <div className="zone-field">
                          <span className="zone-field-label">Цена</span>
                          <input type="number" className="form-input zone-num" value={z.price} onChange={e => editZone(i, 'price', e.target.value)} />
                          <span className="zone-field-unit">₽</span>
                        </div>
                        <button className="btn-icon" style={{ color: 'var(--color-error)' }} onClick={() => removeZone(i)} title="Удалить зону">🗑️</button>
                      </div>
                    ))}
                    <button className="btn btn-secondary btn-sm" onClick={addZone} style={{ marginTop: '0.5rem' }}>+ Добавить зону</button>
                  </div>
                </div>
              );
            }
            return (
              <div key={f.key} className={`form-group ${f.type === 'toggle' ? 'form-group-toggle' : ''}`}>
                <label className="form-label">{f.label}</label>
                {f.type === 'toggle' ? (
                  <label className="toggle">
                    <input type="checkbox" checked={settings[f.key] === '1' || settings[f.key] === 'true'} onChange={e => update(f.key, e.target.checked ? '1' : '0')} />
                    <span className="toggle-slider" />
                  </label>
                ) : f.type === 'textarea' ? (
                  <textarea className="form-input form-textarea" value={settings[f.key] || ''} onChange={e => update(f.key, e.target.value)} />
                ) : f.type === 'number' ? (
                  <input className="form-input" type="number" value={settings[f.key] || ''} onChange={e => update(f.key, e.target.value)} />
                ) : (
                  <input className="form-input" value={settings[f.key] || ''} onChange={e => update(f.key, e.target.value)} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .admin-pg-title { font-size: 2rem; margin-bottom: 2rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; }
        .settings-nav {
          display: flex; flex-direction: column; gap: 4px;
          background: var(--color-bg-card); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: 0.75rem;
          position: sticky; top: 1rem; height: fit-content;
        }
        .settings-nav-item {
          text-align: left; padding: 10px 14px; border-radius: var(--radius-md);
          font-size: 0.85rem; color: var(--color-text-secondary);
          transition: all var(--transition-fast); border: none; background: none; cursor: pointer;
        }
        .settings-nav-item:hover { background: var(--color-bg); }
        .settings-nav-item.active { background: rgba(201,168,76,0.1); color: var(--color-gold); }
        .zones-editor { margin-top: 0.5rem; }
        .zone-row {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem; margin-bottom: 0.5rem;
          background: var(--color-bg); border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .zone-color-input {
          width: 32px; height: 32px; border: none; cursor: pointer;
          border-radius: var(--radius-sm); background: none; padding: 0;
        }
        .zone-field {
          display: flex; align-items: center; gap: 4px;
        }
        .zone-field-label { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; min-width: 24px; }
        .zone-num { width: 80px; padding: 6px 8px; font-size: 0.85rem; }
        .zone-field-unit { font-size: 0.75rem; color: var(--color-text-muted); }
        @media (max-width: 768px) {
          .settings-layout { grid-template-columns: 1fr; }
          .zone-row { flex-wrap: wrap; }
          .zone-num { width: 60px; }
        }
      `}</style>
    </>
  );
}
