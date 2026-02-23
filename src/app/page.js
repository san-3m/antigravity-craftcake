'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products?limit=8').then(r => r.json()),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categoryIcons = {
    'macarons': '🧁',
    'torty': '🎂',
    'deserty': '🍰',
    'moti': '🍡',
    'nabory': '🎁',
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-gradient-2" />
          <div className="hero-particles">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 5}s`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
              }} />
            ))}
          </div>
          <div className="hero-line hero-line-1" />
          <div className="hero-line hero-line-2" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">✨ Кондитерская в Москве</div>
          <h1 className="hero-title">
            Мастерская<br />
            <span className="hero-highlight">десертов</span>
          </h1>
          <p className="hero-subtitle">
            Авторские торты, изысканные макаронс, нежные десерты и японские моти.
            Каждое изделие — произведение кондитерского искусства.
          </p>
          <div className="hero-actions">
            <Link href="/catalog" className="btn btn-primary btn-lg">Каталог</Link>
            <Link href="/cake-constructor" className="btn btn-secondary btn-lg">Собрать торт</Link>
          </div>
          <div className="hero-features">
            <div className="hero-feature">
              <span className="hero-feature-icon">🎨</span>
              <span>Авторский дизайн</span>
            </div>
            <div className="hero-feature">
              <span className="hero-feature-icon">🚗</span>
              <span>Доставка по Москве</span>
            </div>
            <div className="hero-feature">
              <span className="hero-feature-icon">🌿</span>
              <span>Натуральные продукты</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Наши категории</h2>
          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <Link href={`/catalog?cat=${cat.slug}`} key={cat.id} className="category-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="category-icon">{categoryIcons[cat.slug] || '🍰'}</div>
                <h3 className="category-name">{cat.name}</h3>
                <span className="category-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-featured">
        <div className="container">
          <h2 className="section-title">Популярные десерты</h2>
          <p className="section-subtitle">Наши бестселлеры, которые покорили сердца москвичей</p>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="grid grid-4">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/catalog" className="btn btn-secondary">Весь каталог →</Link>
          </div>
        </div>
      </section>

      {/* Constructor CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-decor" />
            <div className="cta-content">
              <h2 className="cta-title">Создайте свой идеальный торт</h2>
              <p className="cta-desc">
                Выберите размер, начинку и декор — наш конструктор поможет собрать торт мечты.
                Или соберите набор из любимых десертов в подарок!
              </p>
              <div className="cta-actions">
                <Link href="/cake-constructor" className="btn btn-primary">Конструктор торта</Link>
                <Link href="/dessert-sets" className="btn btn-rose">Собрать набор</Link>
              </div>
            </div>
            <div className="cta-visual">
              <div className="cta-emoji">🎂</div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section section-about">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-title" style={{ textAlign: 'left' }}>О нашей кондитерской</h2>
              <p className="about-text">
                <strong>Craftcake</strong> — это авторская кондитерская в самом сердце Москвы.
                Мы создаём десерты, которые не только восхищают внешним видом, но и покоряют вкусом.
              </p>
              <p className="about-text">
                Каждый торт, каждый макаронс, каждое моти — это результат passion нашей команды
                кондитеров к своему делу. Мы используем только натуральные ингредиенты высшего
                качества и современные кондитерские техники.
              </p>
              <div className="about-stats">
                <div className="about-stat">
                  <div className="about-stat-value">5+</div>
                  <div className="about-stat-label">лет опыта</div>
                </div>
                <div className="about-stat">
                  <div className="about-stat-value">10K+</div>
                  <div className="about-stat-label">довольных клиентов</div>
                </div>
                <div className="about-stat">
                  <div className="about-stat-value">50+</div>
                  <div className="about-stat-label">видов десертов</div>
                </div>
              </div>
            </div>
            <div className="about-visual">
              <div className="about-badge">📍 Москва</div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Hero */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          margin-top: calc(var(--header-height) * -1);
          padding-top: var(--header-height);
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: var(--gradient-hero);
        }
        .hero-gradient {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184,150,62,0.08) 0%, rgba(184,150,62,0.02) 40%, transparent 70%);
          top: 10%;
          right: -15%;
          animation: elegantFloat 10s ease-in-out infinite;
        }
        .hero-gradient-2 {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,132,155,0.05) 0%, transparent 70%);
          bottom: 5%;
          left: -10%;
          animation: elegantFloat 12s ease-in-out infinite reverse;
        }
        .particle {
          position: absolute;
          background: var(--color-gold-light);
          border-radius: 50%;
          opacity: 0.25;
          animation: sparkle 5s ease-in-out infinite;
        }
        .hero-particles { position: absolute; inset: 0; }
        .hero-line {
          position: absolute;
          width: 1px;
          height: 100%;
          background: linear-gradient(180deg, transparent 0%, rgba(184,150,62,0.08) 50%, transparent 100%);
        }
        .hero-line-1 { left: 25%; }
        .hero-line-2 { right: 25%; }
        .hero-content {
          position: relative;
          z-index: 1;
          padding: 4rem 0;
        }
        .hero-badge {
          display: inline-block;
          padding: 8px 24px;
          border-radius: 30px;
          border: 1px solid rgba(184,150,62,0.2);
          background: rgba(184,150,62,0.06);
          color: var(--color-gold);
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 2rem;
          animation: fadeInUp 0.6s ease;
          letter-spacing: 0.5px;
        }
        .hero-title {
          font-size: 5rem;
          font-weight: 300;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          animation: fadeInUp 0.6s ease 0.1s both;
          color: var(--color-text);
        }
        .hero-highlight {
          background: linear-gradient(
            110deg,
            var(--color-gold-dark) 0%,
            var(--color-gold) 25%,
            var(--color-gold-light) 50%,
            var(--color-gold) 75%,
            var(--color-gold-dark) 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
          animation: fadeInUp 0.6s ease 0.1s both, goldShimmer 5s ease-in-out infinite;
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--color-text-secondary);
          max-width: 550px;
          line-height: 1.8;
          margin-bottom: 2.5rem;
          animation: fadeInUp 0.6s ease 0.2s both;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 4rem;
          animation: fadeInUp 0.6s ease 0.3s both;
        }
        .hero-features {
          display: flex;
          gap: 2.5rem;
          animation: fadeInUp 0.6s ease 0.4s both;
        }
        .hero-feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          padding: 8px 16px;
          border-radius: var(--radius-full);
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(184, 150, 62, 0.08);
        }
        .hero-feature-icon { font-size: 1.3rem; }

        /* Categories */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }
        .category-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 2.5rem 1.5rem;
          text-align: center;
          text-decoration: none;
          transition: all var(--transition-base);
          animation: fadeInUp 0.6s ease both;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-card);
        }
        .category-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gradient-luxury);
          opacity: 0;
          transition: opacity var(--transition-base);
        }
        .category-card:hover::before { opacity: 1; }
        .category-card:hover {
          border-color: var(--color-gold);
          transform: translateY(-8px);
          box-shadow: var(--shadow-card-hover);
        }
        .category-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
          transition: transform var(--transition-base);
        }
        .category-card:hover .category-icon {
          transform: scale(1.15);
        }
        .category-name {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          margin-bottom: 0.75rem;
          color: var(--color-text);
          position: relative;
        }
        .category-arrow {
          font-size: 1.2rem;
          color: var(--color-gold);
          opacity: 0;
          transform: translateX(-10px);
          transition: all var(--transition-base);
          position: relative;
        }
        .category-card:hover .category-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* Featured Section */
        .section-featured {
          background: var(--color-bg-alt);
          position: relative;
        }
        .section-featured::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, var(--color-gold) 50%, transparent 100%);
          opacity: 0.15;
        }

        /* CTA */
        .cta-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 4rem;
          display: flex;
          align-items: center;
          gap: 3rem;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .cta-decor {
          position: absolute;
          top: -50%;
          right: -15%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184,150,62,0.06) 0%, transparent 70%);
          animation: gentleGlow 6s ease-in-out infinite;
        }
        .cta-content { flex: 1; position: relative; z-index: 1; }
        .cta-title {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cta-desc {
          color: var(--color-text-secondary);
          font-size: 1.05rem;
          line-height: 1.8;
          margin-bottom: 2rem;
        }
        .cta-actions {
          display: flex;
          gap: 1rem;
        }
        .cta-visual {
          flex-shrink: 0;
          position: relative;
        }
        .cta-emoji {
          font-size: 8rem;
          animation: elegantFloat 5s ease-in-out infinite;
          filter: drop-shadow(0 8px 20px rgba(0,0,0,0.08));
        }

        /* About */
        .section-about {
          background: var(--color-bg-alt);
          position: relative;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .about-text {
          color: var(--color-text-secondary);
          font-size: 1.05rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }
        .about-stats {
          display: flex;
          gap: 3rem;
          margin-top: 2rem;
        }
        .about-stat-value {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 600;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .about-stat-label {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin-top: 0.25rem;
        }
        .about-visual {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .about-badge {
          font-size: 4rem;
          padding: 3rem;
          border-radius: 50%;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-md);
          animation: gentleGlow 5s ease-in-out infinite;
        }

        @media (max-width: 1024px) {
          .categories-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 3rem; }
          .hero-features { flex-direction: column; gap: 1rem; }
          .hero-actions { flex-direction: column; }
          .categories-grid { grid-template-columns: repeat(2, 1fr); }
          .cta-card { flex-direction: column; padding: 2.5rem; text-align: center; }
          .cta-actions { justify-content: center; flex-wrap: wrap; }
          .about-grid { grid-template-columns: 1fr; }
          .about-stats { gap: 1.5rem; }
          .hero-line { display: none; }
        }
      `}</style>
    </>
  );
}
