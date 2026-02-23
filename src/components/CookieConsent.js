'use client';
import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookie_consent');
    if (!accepted) setTimeout(() => setShow(true), 1500);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="cookie-banner">
        <div className="cookie-content">
          <div className="cookie-icon">🍪</div>
          <div className="cookie-text">
            <p>Мы используем файлы cookie для улучшения работы сайта и анализа трафика. Продолжая использовать сайт, вы соглашаетесь с использованием файлов cookie.</p>
          </div>
          <div className="cookie-actions">
            <button className="btn btn-primary btn-sm" onClick={accept}>Принять</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShow(false)}>Закрыть</button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .cookie-banner {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border-top: 1px solid var(--color-border);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.4s ease;
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .cookie-content {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; gap: 1rem;
        }
        .cookie-icon { font-size: 2rem; flex-shrink: 0; }
        .cookie-text { flex: 1; }
        .cookie-text p { font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; margin: 0; }
        .cookie-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        @media (max-width: 768px) {
          .cookie-content { flex-direction: column; text-align: center; }
          .cookie-actions { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
}
