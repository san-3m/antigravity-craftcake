'use client';
import { useCart } from './CartProvider';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
  const mainImage = images[0] || null;
  const hoverImage = images[1] || null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      unit: product.unit,
    });
  };

  // Emoji map for product fallback
  const categoryEmoji = {
    1: '🧁', 2: '🎂', 3: '🍰', 4: '🍡',
  };

  return (
    <div className="product-card card">
      <a href={`/catalog/${product.id}`} className="product-card-link">
        <div className="product-card-img">
          {mainImage ? (
            <>
              <img className="img-main" src={mainImage} alt={product.name} />
              {hoverImage && (
                <img className="img-hover" src={hoverImage} alt={`${product.name} — в разрезе`} />
              )}
            </>
          ) : (
            <div className="product-card-placeholder">
              {categoryEmoji[product.category_id] || '🍰'}
            </div>
          )}
          {!product.available && (
            <div className="product-card-unavailable">Нет в наличии</div>
          )}
        </div>
        <div className="product-card-body">
          <h3 className="product-card-name">{product.name}</h3>
          <p className="product-card-desc">{product.description?.slice(0, 80)}...</p>
          <div className="product-card-footer">
            <div className="product-card-price">
              <span className="price">{product.price?.toLocaleString('ru-RU')} ₽</span>
              <span className="price-unit">/ {product.unit}</span>
            </div>
            {product.available !== 0 && (
              <button className="product-card-add" onClick={handleAdd} aria-label="Добавить в корзину">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </a>

      <style jsx>{`
        .product-card {
          position: relative;
          overflow: hidden;
          background: var(--color-bg-card);
          border-radius: var(--radius-xl);
        }
        .product-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .product-card-img {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          background: #ffffff;
        }
        .product-card-img .img-main {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8%;
          transition: transform 0.5s ease, opacity 0.4s ease;
        }
        .product-card-img .img-hover {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8%;
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.5s ease;
        }
        .product-card:hover .img-main {
          opacity: 0;
          transform: scale(1.04);
        }
        .product-card:hover .img-hover {
          opacity: 1;
          transform: scale(1.04);
        }
        .product-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          background: linear-gradient(135deg, var(--color-surface) 0%, #f0e8d8 100%);
        }
        .product-card-unavailable {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(196, 64, 64, 0.9);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 2;
        }
        .product-card-body {
          padding: 1.25rem;
        }
        .product-card-name {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          line-height: 1.3;
          color: var(--color-text);
        }
        .product-card-desc {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .product-card-add {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gradient-gold);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(184, 150, 62, 0.25);
        }
        .product-card-add:hover {
          transform: scale(1.12);
          box-shadow: var(--shadow-gold);
        }
      `}</style>
    </div>
  );
}
