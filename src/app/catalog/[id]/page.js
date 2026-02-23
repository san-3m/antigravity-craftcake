'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, text: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(data => {
      setProduct(data);
      if (data.variants && data.variants.length > 0) setSelectedVariant(data.variants[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
    fetch(`/api/products/${id}/reviews`).then(r => r.json()).then(setReviews).catch(() => { });
  }, [id]);

  const handleAdd = () => {
    const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
    const hasVariants = product.variants && product.variants.length > 0;
    const price = hasVariants && selectedVariant ? selectedVariant.price : product.price;
    const variantName = hasVariants && selectedVariant ? ` (${selectedVariant.name})` : '';
    addItem({
      id: hasVariants && selectedVariant ? `${product.id}-v${selectedVariant.id}` : product.id,
      name: product.name + variantName,
      price,
      image: images[0] || null,
      unit: hasVariants && selectedVariant ? selectedVariant.unit : product.unit,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      setReviewMessage(data.message || 'Отзыв отправлен на модерацию!');
      setReviewForm({ name: '', email: '', rating: 5, text: '' });
      setShowReviewForm(false);
    } catch {
      setReviewMessage('Ошибка при отправке отзыва');
    }
    setReviewSubmitting(false);
    setTimeout(() => setReviewMessage(''), 5000);
  };

  const stars = (n) => '⭐'.repeat(n) + '☆'.repeat(5 - n);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      <div className="spinner" />
    </div>
  );

  if (!product) return (
    <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
      <h1>Товар не найден</h1>
      <Link href="/catalog" className="btn btn-secondary" style={{ marginTop: '2rem' }}>← К каталогу</Link>
    </div>
  );

  const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
  const categoryEmoji = { 1: '🧁', 2: '🎂', 3: '🍰', 4: '🍡' };

  return (
    <>
      <div className="product-page container">
        <nav className="breadcrumb">
          <Link href="/">Главная</Link>
          <span>/</span>
          <Link href="/catalog">Каталог</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <Link href={`/catalog?cat=${product.category_slug}`}>{product.category_name}</Link>
              <span>/</span>
            </>
          )}
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-detail">
          <div className="product-gallery">
            {images.length > 0 ? (
              <>
                <div className="product-main-img">
                  <img src={images[activeImg]} alt={product.name} />
                </div>
                {images.length > 1 && (
                  <div className="product-thumbs">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        className={`product-thumb ${activeImg === i ? 'active' : ''}`}
                        onClick={() => setActiveImg(i)}
                      >
                        <img src={img} alt={`${product.name} — фото ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="product-placeholder">
                {categoryEmoji[product.category_id] || '🍰'}
              </div>
            )}
          </div>

          <div className="product-info">
            {product.category_name && (
              <div className="badge badge-gold">{product.category_name}</div>
            )}
            <h1 className="product-name">{product.name}</h1>
            <p className="product-desc">{product.description}</p>

            <div className="product-price-block">
              {product.variants && product.variants.length > 0 ? (
                <>
                  <div className="variant-selector">
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        className={`variant-btn ${selectedVariant?.id === v.id ? 'variant-active' : ''}`}
                        onClick={() => setSelectedVariant(v)}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                  {selectedVariant && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <span className="price" style={{ fontSize: '2rem' }}>{selectedVariant.price?.toLocaleString('ru-RU')} ₽</span>
                      {selectedVariant.old_price && (
                        <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{selectedVariant.old_price?.toLocaleString('ru-RU')} ₽</span>
                      )}
                      <span className="price-unit" style={{ fontSize: '1rem', marginLeft: '4px' }}>/ {selectedVariant.unit}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <span className="price" style={{ fontSize: '2rem' }}>{product.price?.toLocaleString('ru-RU')} ₽</span>
                  <span className="price-unit" style={{ fontSize: '1rem', marginLeft: '8px' }}>/ {product.unit}</span>
                </>
              )}
            </div>

            <div className="product-actions">
              <div className="qty-control" style={{ transform: 'scale(1.2)', marginRight: '1rem' }}>
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button
                className={`btn ${added ? 'btn-secondary' : 'btn-primary'} btn-lg`}
                onClick={handleAdd}
                style={{ flex: 1 }}
              >
                {added ? '✓ Добавлено!' : 'В корзину'}
              </button>
            </div>


          </div>
        </div>

        {/* Reviews section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h2 className="reviews-title">Отзывы {reviews.length > 0 && <span className="reviews-count">({reviews.length})</span>}</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? 'Отмена' : '✍️ Написать отзыв'}
            </button>
          </div>

          {reviewMessage && (
            <div className="review-message">
              <span>✅</span> {reviewMessage}
            </div>
          )}

          {showReviewForm && (
            <form className="review-form card" onSubmit={submitReview}>
              <h3 className="review-form-title">Ваш отзыв</h3>
              <div className="form-group">
                <label className="form-label">Имя *</label>
                <input className="form-input" required value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} placeholder="Ваше имя" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={reviewForm.email} onChange={e => setReviewForm({ ...reviewForm, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Оценка</label>
                <div className="star-select">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" className={`star-btn ${reviewForm.rating >= n ? 'active' : ''}`} onClick={() => setReviewForm({ ...reviewForm, rating: n })}>⭐</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Отзыв *</label>
                <textarea className="form-input form-textarea" required rows={4} value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} placeholder="Расскажите о вашем опыте..." />
              </div>
              <button className="btn btn-primary" type="submit" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Отправка...' : 'Отправить отзыв'}
              </button>
            </form>
          )}

          {reviews.length === 0 && !showReviewForm && (
            <p className="no-reviews">Пока нет отзывов. Будьте первым!</p>
          )}

          <div className="reviews-list">
            {reviews.map(r => (
              <div key={r.id} className="review-card card">
                <div className="review-card-header">
                  <strong className="review-author">{r.name}</strong>
                  <span className="review-date">{new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="review-rating">{stars(r.rating)}</div>
                <p className="review-text">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-page { padding: 2rem 0 4rem; }
        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 2rem; flex-wrap: wrap; }
        .breadcrumb a { color: var(--color-text-secondary); transition: color var(--transition-base); }
        .breadcrumb a:hover { color: var(--color-gold); }
        .breadcrumb-current { color: var(--color-text); }
        .product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
        .product-main-img {
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: #ffffff;
          position: relative;
          border: 2px solid var(--color-gold);
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.3), 0 4px 20px rgba(184, 150, 62, 0.1);
          background-image: linear-gradient(#fff, #fff), var(--gradient-gold);
          background-origin: border-box;
          background-clip: padding-box, border-box;
        }
        .product-main-img img { width: 100%; aspect-ratio: 1; object-fit: cover; padding: 5%; }
        .product-thumbs { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
        .product-thumb {
          width: 72px; height: 72px; border-radius: var(--radius-md); overflow: hidden;
          border: 2px solid var(--color-border); background: #ffffff; cursor: pointer;
          transition: all var(--transition-base); padding: 4px; flex-shrink: 0;
        }
        .product-thumb img { width: 100%; height: 100%; object-fit: contain; }
        .product-thumb:hover { border-color: rgba(184, 150, 62, 0.4); }
        .product-thumb.active { border-color: var(--color-gold); box-shadow: 0 0 0 2px rgba(184, 150, 62, 0.2); }
        .product-placeholder { aspect-ratio: 1; border-radius: var(--radius-xl); background: var(--gradient-card); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 8rem; }
        .product-name { font-size: 2.5rem; margin: 1rem 0; }
        .product-desc { color: var(--color-text-secondary); line-height: 1.8; margin-bottom: 2rem; font-size: 1.05rem; }
        .product-price-block { margin-bottom: 2rem; display: flex; flex-direction: column; }
        .variant-selector { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .variant-btn {
          padding: 8px 18px; border-radius: var(--radius-full); font-size: 0.85rem;
          background: var(--color-bg); border: 1px solid var(--color-border); color: var(--color-text-secondary);
          cursor: pointer; transition: all var(--transition-base); font-weight: 500;
        }
        .variant-btn:hover { border-color: var(--color-gold); color: var(--color-gold); }
        .variant-active {
          background: var(--gradient-gold); color: #fff; border-color: transparent;
        }
        .variant-active:hover { color: #fff; }
        .product-actions { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .product-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; }
        .product-tag { padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.75rem; background: var(--color-bg); border: 1px solid var(--color-border-subtle); color: var(--color-text-muted); }

        .reviews-section { margin-top: 4rem; padding-top: 3rem; border-top: 1px solid var(--color-border); }
        .reviews-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .reviews-title { font-size: 1.8rem; font-family: var(--font-heading); }
        .reviews-count { font-size: 1rem; color: var(--color-text-muted); font-weight: 400; }
        .review-message { padding: 1rem; background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.25); border-radius: var(--radius-md); margin-bottom: 1.5rem; font-size: 0.9rem; color: #4caf50; }
        .review-form { padding: 1.5rem; margin-bottom: 2rem; }
        .review-form-title { font-family: var(--font-heading); font-size: 1.2rem; margin-bottom: 1.25rem; }
        .star-select { display: flex; gap: 4px; }
        .star-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; opacity: 0.3; transition: opacity 0.2s; padding: 2px; }
        .star-btn.active { opacity: 1; }
        .star-btn:hover { opacity: 0.8; }
        .no-reviews { text-align: center; color: var(--color-text-muted); padding: 2rem; font-size: 1rem; }
        .reviews-list { display: flex; flex-direction: column; gap: 1rem; }
        .review-card { padding: 1.25rem; }
        .review-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .review-author { font-size: 0.95rem; }
        .review-date { font-size: 0.8rem; color: var(--color-text-muted); }
        .review-rating { margin-bottom: 0.5rem; letter-spacing: 2px; }
        .review-text { color: var(--color-text-secondary); line-height: 1.6; font-size: 0.9rem; }

        @media (max-width: 768px) {
          .product-detail { grid-template-columns: 1fr; gap: 2rem; }
          .product-name { font-size: 1.8rem; }
          .reviews-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
        }
      `}</style>
    </>
  );
}
