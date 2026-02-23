'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from './CartProvider';

export default function Header() {
  const { count, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="container header-inner">
          <Link href="/" className="logo">
            <span className="logo-icon">🎂</span>
            <div className="logo-text">
              <span className="logo-name">Craftcake</span>
              <span className="logo-sub">мастерская десертов</span>
            </div>
          </Link>

          <nav className={`nav ${mobileMenu ? 'nav-open' : ''}`}>
            <Link href="/catalog" className="nav-link" onClick={() => setMobileMenu(false)}>Каталог</Link>
            <Link href="/cake-constructor" className="nav-link" onClick={() => setMobileMenu(false)}>Конструктор торта</Link>
            <Link href="/dessert-sets" className="nav-link" onClick={() => setMobileMenu(false)}>Наборы</Link>
            <Link href="/contacts" className="nav-link" onClick={() => setMobileMenu(false)}>Контакты</Link>
          </nav>

          <div className="header-actions">
            <button className="cart-btn" onClick={() => setIsOpen(true)} aria-label="Корзина">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>

            <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Меню">
              <span className={`hamburger ${mobileMenu ? 'active' : ''}`}>
                <span></span><span></span><span></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: var(--header-height);
          transition: all var(--transition-base);
          background: transparent;
        }
        .header-scrolled {
          background: rgba(250, 248, 245, 0.92);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid rgba(184, 150, 62, 0.1);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          gap: 2rem;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          z-index: 1001;
        }
        .logo-icon {
          font-size: 1.8rem;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        .logo-name {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 600;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }
        .logo-sub {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--color-text-secondary);
          margin-top: 2px;
          padding-bottom: 2px;
        }
        .nav {
          display: flex;
          gap: 2rem;
        }
        .nav-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: color var(--transition-base);
          position: relative;
          text-decoration: none;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: var(--gradient-gold);
          transition: width var(--transition-base);
        }
        .nav-link:hover {
          color: var(--color-gold);
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 1001;
        }
        .cart-btn {
          position: relative;
          color: var(--color-text);
          transition: color var(--transition-base);
          padding: 8px;
        }
        .cart-btn:hover {
          color: var(--color-gold);
        }
        .cart-badge {
          position: absolute;
          top: 0;
          right: 0;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          background: var(--gradient-gold);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          box-shadow: 0 2px 8px rgba(184, 150, 62, 0.3);
        }
        .mobile-toggle {
          display: none;
          padding: 8px;
        }
        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 24px;
        }
        .hamburger span {
          display: block;
          width: 100%;
          height: 2px;
          background: var(--color-text);
          transition: all var(--transition-base);
          transform-origin: center;
        }
        .hamburger.active span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }
        .hamburger.active span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
        @media (max-width: 768px) {
          .mobile-toggle {
            display: block;
          }
          .nav {
            position: fixed;
            inset: 0;
            background: rgba(250, 248, 245, 0.98);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2.5rem;
            opacity: 0;
            pointer-events: none;
            transition: opacity var(--transition-base);
            z-index: 1000;
          }
          .nav-open {
            opacity: 1;
            pointer-events: all;
          }
          .nav-link {
            font-size: 1.5rem;
            color: var(--color-text);
          }
        }
      `}</style>
    </>
  );
}
