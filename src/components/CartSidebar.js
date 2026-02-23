'use client';
import { useCart } from './CartProvider';
import Link from 'next/link';

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, total, count, isOpen, setIsOpen } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsOpen(false)} />
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2 className="cart-title">Корзина <span className="cart-count">{count}</span></h2>
          <button className="modal-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p>Корзина пуста</p>
            <p className="cart-empty-hint">Добавьте вкусняшки из каталога!</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item, idx) => (
                <div key={`${item.type}-${item.id}-${idx}`} className="cart-item">
                  <div className="cart-item-img">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cart-item-placeholder">
                        {item.type === 'cake' ? '🎂' : item.type === 'set' ? '🎁' : '🧁'}
                      </div>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    {item.details && <div className="cart-item-details">{item.details}</div>}
                    <div className="cart-item-price">{item.price.toLocaleString('ru-RU')} ₽</div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1, item.type)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1, item.type)}>+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(item.id, item.type)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Итого:</span>
                <span className="cart-total-price">{total.toLocaleString('ru-RU')} ₽</span>
              </div>
              <Link href="/cart" className="btn btn-primary btn-lg cart-checkout-btn" onClick={() => setIsOpen(false)}>
                Оформить заказ
              </Link>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 26, 46, 0.25);
          z-index: 8000;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease;
        }
        .cart-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 420px;
          max-width: 100vw;
          background: var(--color-bg-card);
          border-left: 1px solid var(--color-border);
          z-index: 8001;
          display: flex;
          flex-direction: column;
          animation: slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -12px 0 40px rgba(0, 0, 0, 0.06);
        }
        @keyframes slideInFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-border);
        }
        .cart-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--color-text);
        }
        .cart-count {
          background: var(--gradient-gold);
          color: #ffffff;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-family: var(--font-body);
          box-shadow: 0 2px 6px rgba(184, 150, 62, 0.25);
        }
        .cart-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
        }
        .cart-empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }
        .cart-empty-hint { font-size: 0.85rem; color: var(--color-text-muted); margin-top: 0.5rem; }
        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.5rem;
        }
        .cart-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1rem 0;
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .cart-item:last-child { border-bottom: none; }
        .cart-item-img {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }
        .cart-item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cart-item-placeholder {
          width: 100%;
          height: 100%;
          background: var(--gradient-card);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-name {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--color-text);
        }
        .cart-item-details {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-bottom: 4px;
        }
        .cart-item-price {
          color: var(--color-gold);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }
        .cart-item-remove {
          color: var(--color-text-muted);
          transition: color var(--transition-base);
          padding: 4px;
        }
        .cart-item-remove:hover { color: var(--color-error); }
        .cart-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
        }
        .cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        .cart-total-price {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 600;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cart-checkout-btn {
          width: 100%;
          text-align: center;
          text-decoration: none;
        }
        @media (max-width: 480px) {
          .cart-sidebar { width: 100vw; }
        }
      `}</style>
    </>
  );
}
