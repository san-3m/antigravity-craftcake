'use client';
import { useState } from 'react';

export default function ContactsPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch { }
    setSending(false);
  };

  return (
    <>
      <section className="contacts-hero">
        <div className="container">
          <h1 className="contacts-title">Контакты</h1>
          <p className="contacts-subtitle">Мы всегда рады вашим вопросам и предложениям</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="contacts-grid">
            <div className="contacts-info">
              <div className="contact-block">
                <h3>📍 Адрес</h3>
                <p>г. Москва, ул. Верейская, д. 29с134</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Пункт самовывоза</p>
              </div>
              <div className="contact-block">
                <h3>📞 Телефон</h3>
                <p>+7 (999) 123-45-67</p>
              </div>
              <div className="contact-block">
                <h3>✉️ Email</h3>
                <p>hello@craftcake.ru</p>
              </div>
              <div className="contact-block">
                <h3>🕐 Режим работы</h3>
                <p>По будням с 8:00 до 18:00</p>
              </div>
              <div className="contact-block">
                <h3>📱 Мессенджеры</h3>
                <p>Telegram: @craftcake</p>
                <p>Instagram: @craftcake_msk</p>
              </div>
            </div>

            <div className="contacts-form-wrapper">
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Напишите нам</h3>
                {sent ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</p>
                    <p style={{ fontSize: '1.1rem' }}>Спасибо! Мы свяжемся с вами в ближайшее время.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Имя *</label>
                      <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Телефон</label>
                      <input className="form-input" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 (999) 123-45-67" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Сообщение *</label>
                      <textarea className="form-input form-textarea" required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Ваше сообщение..." />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={sending}>
                      {sending ? 'Отправляем...' : 'Отправить'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yandex Map */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="map-heading">Мы на карте</h2>
          <div className="map-wrapper">
            <iframe
              src="https://yandex.ru/map-widget/v1/?pt=37.476708,55.720072&z=16&l=map&text=Москва, ул. Верейская, д. 29с134"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              style={{ border: 0, borderRadius: 'var(--radius-xl)' }}
              title="Кондитерская Craftcake на карте"
            />
          </div>
          <p className="map-address">📍 г. Москва, ул. Верейская, д. 29с134</p>
        </div>
      </section>

      <style jsx>{`
        .contacts-hero {
          padding: 3rem 0;
          background: var(--color-bg-alt);
          border-bottom: 1px solid var(--color-border);
          text-align: center;
        }
        .contacts-title {
          font-size: 3rem;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .contacts-subtitle { color: var(--color-text-secondary); margin-top: 0.5rem; }
        .contacts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }
        .contact-block {
          margin-bottom: 2rem;
        }
        .contact-block h3 {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: var(--color-gold);
        }
        .contact-block p {
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
        .map-heading {
          font-family: var(--font-heading);
          font-size: 2rem;
          text-align: center;
          margin-bottom: 1.5rem;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .map-wrapper {
          width: 100%;
          height: 450px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid var(--color-border);
          background: var(--color-bg-card);
        }
        .map-address {
          text-align: center;
          margin-top: 1rem;
          font-size: 1rem;
          color: var(--color-text-secondary);
        }
        @media (max-width: 768px) {
          .contacts-grid { grid-template-columns: 1fr; }
          .map-wrapper { height: 300px; }
        }
      `}</style>
    </>
  );
}
