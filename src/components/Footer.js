'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top-decor" />
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">🎂</span>
              <div>
                <div className="footer-logo-name">Craftcake</div>
                <div className="footer-logo-sub">мастерская десертов</div>
              </div>
            </div>
            <p className="footer-desc">
              Авторская кондитерская в Москве. Создаём торты, макаронс, десерты и моти
              с любовью к каждой детали.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href="#" className="social-link" aria-label="Telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.32 13.617l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z" /></svg>
              </a>
              <a href="#" className="social-link" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Каталог</h4>
            <ul className="footer-list">
              <li><Link href="/catalog?cat=macarons">Макаронс</Link></li>
              <li><Link href="/catalog?cat=torty">Торты</Link></li>
              <li><Link href="/catalog?cat=deserty">Десерты</Link></li>
              <li><Link href="/catalog?cat=moti">Моти</Link></li>
              <li><Link href="/dessert-sets">Наборы</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Услуги</h4>
            <ul className="footer-list">
              <li><Link href="/cake-constructor">Конструктор торта</Link></li>
              <li><Link href="/dessert-sets">Собрать набор</Link></li>
              <li><Link href="/delivery">Доставка</Link></li>
              <li><Link href="/catalog">Весь каталог</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Контакты</h4>
            <ul className="footer-list">
              <li>📍 ул. Верейская, 29с134</li>
              <li>📞 +7 (999) 123-45-67</li>
              <li>✉️ hello@craftcake.ru</li>
              <li>🕐 Пн–Пт 8:00–18:00</li>
              <li><Link href="/delivery">🚚 Доставка</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024–2026 Craftcake — Мастерская десертов. Все права защищены.</p>
          <div className="footer-bottom-links">
            <Link href="/privacy">Политика конфиденциальности</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(180deg, var(--color-bg) 0%, #ede5d8 100%);
          border-top: 1px solid var(--color-border);
          padding: 4rem 0 2rem;
          margin-top: auto;
          position: relative;
        }
        .footer-top-decor {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 2px;
          background: var(--gradient-gold);
          border-radius: 2px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
        }
        .footer-brand {}
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .footer-logo-icon { font-size: 2rem; }
        .footer-logo-name {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 600;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .footer-logo-sub {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--color-text-muted);
        }
        .footer-desc {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        .footer-social {
          display: flex;
          gap: 1rem;
        }
        .social-link {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          transition: all var(--transition-base);
          background: var(--color-bg-card);
        }
        .social-link:hover {
          color: var(--color-gold);
          border-color: var(--color-gold);
          background: rgba(184, 150, 62, 0.06);
          box-shadow: var(--shadow-gold);
          transform: translateY(-3px);
        }
        .footer-heading {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          color: var(--color-gold);
          margin-bottom: 1.25rem;
          position: relative;
        }
        .footer-heading::after {
          content: '';
          display: block;
          width: 24px;
          height: 1.5px;
          background: var(--gradient-gold);
          margin-top: 0.5rem;
          border-radius: 1px;
        }
        .footer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .footer-list li,
        .footer-list a {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          transition: all var(--transition-base);
        }
        .footer-list a:hover {
          color: var(--color-gold);
          padding-left: 4px;
        }
        .footer-bottom {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        .footer-bottom-links {
          display: flex;
          gap: 1.5rem;
        }
        .footer-bottom-links a {
          color: var(--color-text-muted);
          transition: color var(--transition-base);
        }
        .footer-bottom-links a:hover {
          color: var(--color-gold);
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
