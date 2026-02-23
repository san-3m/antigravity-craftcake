'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/components/CartProvider';

export default function DessertSetsPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [setItems, setSetItems] = useState([]);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => {
      setProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addToSet = (product) => {
    const existing = setItems.find(i => i.id === product.id);
    if (existing) {
      setSetItems(setItems.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setSetItems([...setItems, { ...product, qty: 1 }]);
    }
  };

  const removeFromSet = (id) => {
    setSetItems(setItems.filter(i => i.id !== id));
  };

  const updateSetQty = (id, qty) => {
    if (qty <= 0) { removeFromSet(id); return; }
    setSetItems(setItems.map(i => i.id === id ? { ...i, qty } : i));
  };

  const setTotal = setItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const setCount = setItems.reduce((sum, i) => sum + i.qty, 0);

  const handleAddSetToCart = () => {
    if (setItems.length === 0) return;
    const setId = `set-${Date.now()}`;
    const details = setItems.map(i => `${i.name} ×${i.qty}`).join(', ');
    addItem({
      id: setId,
      type: 'set',
      name: `Десерт-набор (${setCount} шт)`,
      details,
      price: setTotal,
      unit: 'набор',
    });
    setAdded(true);
    setSetItems([]);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      <div className="spinner" />
    </div>
  );

  const categoryEmoji = { 1: '🧁', 2: '🎂', 3: '🍰', 4: '🍡' };

  return (
    <>
      <section className="sets-hero">
        <div className="container">
          <h1 className="sets-title">Соберите свой набор</h1>
          <p className="sets-subtitle">Выберите любимые десерты и создайте идеальный подарочный набор</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="sets-layout">
            <div className="sets-products">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Выберите десерты</h2>
              <div className="sets-grid">
                {products.map(product => {
                  const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
                  const inSet = setItems.find(i => i.id === product.id);
                  return (
                    <div key={product.id} className={`set-product-card ${inSet ? 'in-set' : ''}`}>
                      <div className="set-product-img">
                        {images[0] ? (
                          <img src={images[0]} alt={product.name} />
                        ) : (
                          <div className="set-product-placeholder">{categoryEmoji[product.category_id] || '🍰'}</div>
                        )}
                      </div>
                      <div className="set-product-info">
                        <h4 className="set-product-name">{product.name}</h4>
                        <p className="set-product-price">{product.price.toLocaleString('ru-RU')} ₽ / {product.unit}</p>
                      </div>
                      <button className="set-product-add" onClick={() => addToSet(product)}>
                        {inSet ? `+1 (${inSet.qty})` : '+ Добавить'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sets-builder">
              <div className="sets-builder-card card" style={{ padding: '1.5rem', position: 'sticky', top: 'calc(var(--header-height) + 1rem)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1rem' }}>
                  🎁 Ваш набор {setCount > 0 && <span className="badge badge-gold">{setCount} шт</span>}
                </h3>

                {setItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</p>
                    <p style={{ fontSize: '0.9rem' }}>Набор пуст. Добавьте десерты!</p>
                  </div>
                ) : (
                  <>
                    <div className="set-items-list">
                      {setItems.map(item => (
                        <div key={item.id} className="set-item">
                          <div className="set-item-info">
                            <span className="set-item-name">{item.name}</span>
                            <span className="set-item-price">{(item.price * item.qty).toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <div className="set-item-actions">
                            <div className="qty-control" style={{ transform: 'scale(0.85)' }}>
                              <button className="qty-btn" onClick={() => updateSetQty(item.id, item.qty - 1)}>−</button>
                              <span className="qty-value">{item.qty}</span>
                              <button className="qty-btn" onClick={() => updateSetQty(item.id, item.qty + 1)}>+</button>
                            </div>
                            <button style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }} onClick={() => removeFromSet(item.id)}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: '600' }}>Итого:</span>
                        <span className="price" style={{ fontSize: '1.4rem' }}>{setTotal.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <button
                        className={`btn ${added ? 'btn-secondary' : 'btn-primary'} btn-lg`}
                        style={{ width: '100%' }}
                        onClick={handleAddSetToCart}
                      >
                        {added ? '✓ Набор добавлен!' : '🛒 Добавить набор в корзину'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .sets-hero {
          padding: 3rem 0;
          background: var(--color-bg-alt);
          border-bottom: 1px solid var(--color-border);
          text-align: center;
        }
        .sets-title {
          font-size: 3rem;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sets-subtitle { color: var(--color-text-secondary); margin-top: 0.5rem; }
        .sets-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
          align-items: start;
        }
        .sets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .set-product-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-base);
        }
        .set-product-card.in-set {
          border-color: var(--color-gold);
        }
        .set-product-img {
          aspect-ratio: 16/10;
          overflow: hidden;
        }
        .set-product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .set-product-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; background: var(--color-surface);
        }
        .set-product-info { padding: 1rem; }
        .set-product-name { font-family: var(--font-heading); font-size: 1rem; margin-bottom: 4px; }
        .set-product-price { font-size: 0.85rem; color: var(--color-gold); }
        .set-product-add {
          width: 100%;
          padding: 10px;
          border-top: 1px solid var(--color-border);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-gold);
          transition: all var(--transition-base);
        }
        .set-product-add:hover {
          background: rgba(201,168,76,0.1);
        }
        .set-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
        }
        .set-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
        .set-item-info { flex: 1; min-width: 0; }
        .set-item-name { display: block; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .set-item-price { display: block; font-size: 0.8rem; color: var(--color-gold); }
        .set-item-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        @media (max-width: 768px) {
          .sets-layout { grid-template-columns: 1fr; }
          .sets-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
