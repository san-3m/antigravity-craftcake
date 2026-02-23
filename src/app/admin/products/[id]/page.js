'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdmin } from '../../layout';
import Link from 'next/link';

export default function AdminProductEdit() {
  const { id } = useParams();
  const router = useRouter();
  const { authFetch } = useAdmin();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', meta_description: '', keywords: '',
    price: 0, unit: 'шт', category_id: '', images: [],
    available: 1, sort_order: 0, variants: [],
  });

  const imgDragItem = useRef(null);
  const imgDragOver = useRef(null);

  useEffect(() => {
    Promise.all([
      authFetch(`/api/admin/products/${id}`).then(r => r.json()),
      authFetch('/api/admin/categories').then(r => r.json()),
    ]).then(([product, cats]) => {
      setCategories(cats);
      const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
      setForm({
        name: product.name || '',
        description: product.description || '',
        meta_description: product.meta_description || '',
        keywords: product.keywords || '',
        price: product.price || 0,
        unit: product.unit || 'шт',
        category_id: product.category_id || '',
        images,
        available: product.available,
        sort_order: product.sort_order || 0,
        variants: product.variants || [],
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const save = async () => {
    setSaving(true);
    await authFetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await authFetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) {
      setForm({ ...form, images: [...form.images, data.url] });
    }
  };

  const removeImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const handleImgDragStart = (idx) => { imgDragItem.current = idx; };
  const handleImgDragEnter = (idx) => { imgDragOver.current = idx; };
  const handleImgDragEnd = () => {
    const items = [...form.images];
    const dragged = items.splice(imgDragItem.current, 1)[0];
    items.splice(imgDragOver.current, 0, dragged);
    setForm({ ...form, images: items });
    imgDragItem.current = null;
    imgDragOver.current = null;
  };

  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { name: '', sku: '', price: 0, old_price: '', unit: 'шт' }] });
  };
  const removeVariant = (idx) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });
  };
  const updateVariant = (idx, field, value) => {
    const updated = [...form.variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, variants: updated });
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="edit-header">
        <div className="edit-header-left">
          <button className="btn-back" onClick={() => router.push('/admin/products')}>
            ← Назад
          </button>
          <h1 className="edit-title">Редактирование товара</h1>
        </div>
        <a
          href={`/catalog/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-view-site"
        >
          🔗 Открыть на сайте
        </a>
      </div>

      <div className="edit-layout">
        {/* Images section */}
        <div className="edit-section">
          <h2 className="section-title">Изображения товара</h2>
          <p className="section-hint">Перетаскивайте фото для изменения порядка. Первое фото будет главным.</p>
          <div className="images-grid">
            {form.images?.map((img, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={() => handleImgDragStart(idx)}
                onDragEnter={() => handleImgDragEnter(idx)}
                onDragEnd={handleImgDragEnd}
                onDragOver={e => e.preventDefault()}
                className="img-thumb"
                style={{ border: idx === 0 ? '2px solid var(--color-gold)' : '1px solid var(--color-border)' }}
              >
                <img src={img} alt="" />
                {idx === 0 && <span className="img-badge">Главное</span>}
                <button className="img-remove" onClick={() => removeImage(idx)}>✕</button>
              </div>
            ))}
            <label className="img-upload">
              <span className="img-upload-icon">↑</span>
              <span className="img-upload-text">Добавить фото</span>
              <input type="file" accept="image/*" onChange={uploadImage} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Fields */}
        <div className="edit-section">
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Название *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Описание</label>
              <textarea className="form-input form-textarea" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Категория *</label>
              <select className="form-select" value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value ? parseInt(e.target.value) : null })}>
                <option value="">Без категории</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Цена (₽) *</label>
              <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Единица</label>
              <input className="form-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '8px' }}>
              <label className="toggle">
                <input type="checkbox" checked={!!form.available} onChange={e => setForm({ ...form, available: e.target.checked ? 1 : 0 })} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: '0.9rem' }}>В наличии</span>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="edit-section">
          <h2 className="section-title">Варианты товара</h2>
          <p className="section-hint">Например: 1 штука, 6 штук, 12 штук — каждый со своей ценой и артикулом.</p>
          {form.variants.length > 0 && (
            <div className="variants-table">
              <div className="variants-header">
                <span style={{ flex: 2 }}>Название</span>
                <span style={{ flex: 1 }}>Артикул</span>
                <span style={{ flex: 1 }}>Цена</span>
                <span style={{ flex: 1 }}>Старая цена</span>
                <span style={{ flex: 1 }}>Единица</span>
                <span style={{ width: '36px' }}></span>
              </div>
              {form.variants.map((v, idx) => (
                <div key={idx} className="variant-row">
                  <input className="form-input" style={{ flex: 2 }} value={v.name} onChange={e => updateVariant(idx, 'name', e.target.value)} placeholder="1 штука (60г)" />
                  <input className="form-input" style={{ flex: 1 }} value={v.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)} placeholder="SKU" />
                  <input className="form-input" style={{ flex: 1 }} type="number" value={v.price} onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value) || 0)} />
                  <input className="form-input" style={{ flex: 1 }} type="number" value={v.old_price || ''} onChange={e => updateVariant(idx, 'old_price', e.target.value ? parseFloat(e.target.value) : null)} placeholder="—" />
                  <input className="form-input" style={{ flex: 1 }} value={v.unit} onChange={e => updateVariant(idx, 'unit', e.target.value)} />
                  <button className="btn-remove-variant" onClick={() => removeVariant(idx)} title="Удалить вариант">✕</button>
                </div>
              ))}
            </div>
          )}
          <button className="btn-add-variant" onClick={addVariant}>＋ Добавить вариант</button>
        </div>

        {/* SEO */}
        <div className="edit-section">
          <h2 className="section-title">SEO мета-теги</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Мета-описание</label>
              <textarea className="form-input" style={{ minHeight: '70px' }} value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} placeholder="Краткое описание для поисковых систем (до 160 символов)" />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Ключевые слова</label>
              <input className="form-input" value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="ключевое слово 1, ключевое слово 2, ..." />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="edit-actions">
          <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-lg`} onClick={save} disabled={saving} style={{ minWidth: '280px' }}>
            {saving ? 'Сохранение...' : saved ? '✓ Сохранено!' : 'Сохранить изменения'}
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/admin/products')}>Отмена</button>
        </div>
      </div>

      <style jsx>{`
        .edit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .edit-header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .btn-back {
          background: none;
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          padding: 0.4rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-base);
        }
        .btn-back:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
        }
        .edit-title {
          font-size: 1.8rem;
          font-family: var(--font-heading);
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .btn-view-site {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--color-gold);
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border: 1px solid var(--color-gold);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }
        .btn-view-site:hover {
          background: var(--color-gold);
          color: #fff;
        }
        .edit-layout {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .edit-section {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.75rem;
        }
        .section-title {
          font-size: 1.1rem;
          font-family: var(--font-heading);
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }
        .section-hint {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 1.25rem;
        }
        .images-grid {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .img-thumb {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: grab;
          background: #fff;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .img-thumb:hover {
          transform: scale(1.04);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .img-thumb:active { opacity: 0.6; }
        .img-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .img-badge {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--gradient-gold);
          color: #fff;
          font-size: 0.65rem;
          text-align: center;
          padding: 2px 0;
          font-weight: 700;
          text-transform: uppercase;
        }
        .img-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(248,113,113,0.9);
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          font-size: 0.65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .img-thumb:hover .img-remove { opacity: 1; }
        .img-upload {
          width: 120px;
          height: 120px;
          border-radius: var(--radius-md);
          border: 2px dashed var(--color-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          gap: 0.4rem;
          transition: all var(--transition-base);
          background: var(--color-bg);
        }
        .img-upload:hover {
          border-color: var(--color-gold);
          background: rgba(184, 150, 62, 0.04);
        }
        .img-upload-icon {
          font-size: 1.5rem;
          color: var(--color-text-muted);
        }
        .img-upload-text {
          font-size: 0.7rem;
          color: var(--color-text-muted);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.25rem;
          max-width: 700px;
        }
        .full-width { grid-column: 1 / -1; }
        .span-2 { grid-column: span 2; }
        .edit-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 1.5rem 0;
        }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .edit-header { flex-direction: column; align-items: flex-start; }
          .variant-row { flex-wrap: wrap; }
        }
        .variants-table {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .variants-header {
          display: flex;
          gap: 0.5rem;
          padding: 0 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .variant-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .variant-row .form-input {
          font-size: 0.85rem;
          padding: 6px 10px;
        }
        .btn-remove-variant {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(248,113,113,0.12);
          color: #f87171;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .btn-remove-variant:hover {
          background: #f87171;
          color: #fff;
        }
        .btn-add-variant {
          background: none;
          border: 1px dashed var(--color-border);
          color: var(--color-gold);
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
        }
        .btn-add-variant:hover {
          border-color: var(--color-gold);
          background: rgba(184,150,62,0.04);
        }
      `}</style>
    </>
  );
}
