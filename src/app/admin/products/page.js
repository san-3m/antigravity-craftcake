'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../layout';

export default function AdminProducts() {
  const { authFetch } = useAdmin();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [showBulk, setShowBulk] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (catFilter) params.set('category', catFilter);
    if (search) params.set('search', search);
    Promise.all([
      authFetch(`/api/admin/products?${params}`).then(r => r.json()),
      authFetch('/api/admin/categories').then(r => r.json()),
    ]).then(([p, c]) => { setProducts(p); setCategories(c); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [catFilter]);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const selectAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map(p => p.id)));
  };

  const toggleAvailable = async (id) => {
    await authFetch(`/api/admin/products/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toggle_available: true }),
    });
    setProducts(products.map(p => p.id === id ? { ...p, available: p.available ? 0 : 1 } : p));
  };

  const deleteProduct = async (id) => {
    if (!confirm('Удалить товар?')) return;
    await authFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== id));
  };

  const handleBulk = async () => {
    if (selected.size === 0) return;
    const ids = [...selected];
    let body = { ids, action: bulkAction };
    if (bulkAction === 'price' || bulkAction === 'price_percent') body.value = parseFloat(bulkValue);
    if (bulkAction === 'category') body.value = parseInt(bulkValue);
    if (bulkAction === 'available') body.value = bulkValue === '1';
    await authFetch('/api/admin/products/bulk', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSelected(new Set());
    setShowBulk(false);
    setBulkAction('');
    setBulkValue('');
    load();
  };

  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnter = (idx) => { dragOver.current = idx; };
  const handleDragEnd = async () => {
    const items = [...products];
    const dragged = items.splice(dragItem.current, 1)[0];
    items.splice(dragOver.current, 0, dragged);
    setProducts(items);
    dragItem.current = null;
    dragOver.current = null;
    await authFetch('/api/admin/products/reorder', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map(i => ({ id: i.id })) }),
    });
  };

  const handleExport = () => {
    window.open('/api/admin/products/export', '_blank');
  };

  const createProduct = async () => {
    const res = await authFetch('/api/admin/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Новый товар', price: 0 }),
    });
    const data = await res.json();
    if (data.id) {
      router.push(`/admin/products/${data.id}`);
    } else {
      load();
    }
  };

  const updatePrice = async (id, newPrice) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) return;
    setProducts(products.map(p => p.id === id ? { ...p, price } : p));
    await authFetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inline_price: price }),
    });
  };

  return (
    <>
      <div className="products-header">
        <h1 className="admin-title">Товары</h1>
        <div className="products-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>📥 Экспорт CSV</button>
          <button className="btn btn-primary btn-sm" onClick={createProduct}>+ Добавить товар</button>
        </div>
      </div>

      <div className="products-toolbar">
        <div className="search-bar">
          <input type="text" className="form-input" placeholder="Поиск товаров..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '300px' }} />
        </div>
        <select className="form-select" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="">Все категории</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selected.size > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowBulk(!showBulk)}>
            ⚡ Массовые действия ({selected.size})
          </button>
        )}
      </div>

      {showBulk && selected.size > 0 && (
        <div className="bulk-panel">
          <div className="bulk-inner">
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Выбрано: {selected.size}</span>
            <select className="form-select" value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{ maxWidth: '220px' }}>
              <option value="">Выберите действие</option>
              <option value="price">Установить цену</option>
              <option value="price_percent">Изменить цену на %</option>
              <option value="category">Переместить в категорию</option>
              <option value="available">Изменить наличие</option>
              <option value="delete">Удалить</option>
            </select>
            {(bulkAction === 'price' || bulkAction === 'price_percent') && (
              <input type="number" className="form-input" placeholder={bulkAction === 'price' ? 'Цена' : '% изменения'} value={bulkValue} onChange={e => setBulkValue(e.target.value)} style={{ maxWidth: '150px' }} />
            )}
            {bulkAction === 'category' && (
              <select className="form-select" value={bulkValue} onChange={e => setBulkValue(e.target.value)} style={{ maxWidth: '180px' }}>
                <option value="">Категория</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            {bulkAction === 'available' && (
              <select className="form-select" value={bulkValue} onChange={e => setBulkValue(e.target.value)} style={{ maxWidth: '150px' }}>
                <option value="">Статус</option>
                <option value="1">В наличии</option>
                <option value="0">Нет в наличии</option>
              </select>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleBulk} disabled={!bulkAction}>Применить</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <label className="checkbox">
                    <input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={selectAll} />
                    <span className="checkbox-mark" />
                  </label>
                </th>
                <th style={{ width: '30px' }}>⋮⋮</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Наличие</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className={selected.has(p.id) ? 'row-selected' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    if (e.target.closest('label') || e.target.closest('button') || e.target.closest('input')) return;
                    router.push(`/admin/products/${p.id}`);
                  }}
                >
                  <td onClick={e => e.stopPropagation()}>
                    <label className="checkbox">
                      <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                      <span className="checkbox-mark" />
                    </label>
                  </td>
                  <td style={{ cursor: 'grab', color: 'var(--color-text-muted)' }}>⋮⋮</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(() => {
                          const imgs = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
                          return imgs[0] ? <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🧁';
                        })()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name} <a href={`/catalog/${p.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginLeft: '4px' }} title="Открыть на сайте">🔗</a></div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gold">{p.category_name || '—'}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <input
                      type="number"
                      className="inline-price"
                      defaultValue={p.price}
                      onBlur={e => updatePrice(p.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                    />
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <label className="toggle" onClick={() => toggleAvailable(p.id)}>
                      <input type="checkbox" checked={!!p.available} readOnly />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => router.push(`/admin/products/${p.id}`)} title="Редактировать">✏️</button>
                      <button className="btn-icon" onClick={() => deleteProduct(p.id)} title="Удалить" style={{ color: 'var(--color-error)' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .products-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .admin-title { font-size: 2rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .products-actions { display: flex; gap: 0.75rem; }
        .products-toolbar { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .bulk-panel {
          background: var(--color-bg-card); border: 1px solid var(--color-gold);
          border-radius: var(--radius-lg); padding: 1rem 1.5rem; margin-bottom: 1.5rem;
        }
        .bulk-inner { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .row-selected td { background: rgba(201,168,76,0.05) !important; }
        tr[draggable] { cursor: default; }
        tr[draggable]:active { opacity: 0.5; }
        tr[draggable]:hover td { background: rgba(184,150,62,0.04); }
        .inline-price {
          width: 80px;
          padding: 4px 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-gold);
          text-align: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg);
          transition: border-color 0.2s, box-shadow 0.2s;
          -moz-appearance: textfield;
        }
        .inline-price::-webkit-outer-spin-button,
        .inline-price::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .inline-price:focus {
          outline: none;
          border-color: var(--color-gold);
          box-shadow: 0 0 0 2px rgba(184,150,62,0.15);
        }
      `}</style>
    </>
  );
}
