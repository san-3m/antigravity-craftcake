'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(catParam || '');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set('cat', activeCategory);
    if (search) params.set('q', search);
    fetch(`/api/products?${params}`).then(r => r.json()).then(data => {
      setProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeCategory, search]);

  useEffect(() => {
    if (catParam) setActiveCategory(catParam);
  }, [catParam]);

  return (
    <>
      <section className="catalog-hero">
        <div className="container">
          <h1 className="catalog-title">Каталог десертов</h1>
          <p className="catalog-subtitle">Выберите категорию или найдите любимый десерт</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="catalog-controls">
            <div className="catalog-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Найти десерт..."
                className="form-input catalog-search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="catalog-filters">
              <button
                className={`filter-btn ${!activeCategory ? 'active' : ''}`}
                onClick={() => setActiveCategory('')}
              >
                Все
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`filter-btn ${activeCategory === c.slug ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner" />
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-text">Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-4">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .catalog-hero {
          padding: 3rem 0 2rem;
          background: var(--color-bg-alt);
          border-bottom: 1px solid var(--color-border);
        }
        .catalog-title {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 0.5rem;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .catalog-subtitle {
          text-align: center;
          color: var(--color-text-secondary);
        }
        .catalog-controls {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .catalog-search {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--color-bg-card);
          padding: 4px 16px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          max-width: 500px;
          margin: 0 auto;
          width: 100%;
        }
        .catalog-search-input {
          border: none !important;
          background: transparent !important;
          padding: 10px 0 !important;
        }
        .catalog-search-input:focus {
          box-shadow: none !important;
        }
        .catalog-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }
        .filter-btn {
          padding: 8px 20px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          transition: all var(--transition-base);
        }
        .filter-btn:hover {
          color: var(--color-gold);
          border-color: var(--color-gold);
        }
        .filter-btn.active {
          background: var(--color-gold);
          color: #ffffff;
          border-color: var(--color-gold);
        }
      `}</style>
    </>
  );
}
