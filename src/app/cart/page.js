'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/components/CartProvider';
import Link from 'next/link';

// Haversine formula — distance in km between two lat/lng points
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    delivery: 'pickup', address: '',
    payment: 'cash', comment: ''
  });
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delivery zone data
  const [deliveryData, setDeliveryData] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [deliveryCalc, setDeliveryCalc] = useState(null); // { distance, zone, price } | null
  const [addressError, setAddressError] = useState('');
  const geocodeTimer = useRef(null);
  const ymapsLoaded = useRef(false);

  // Fetch delivery zones on mount
  useEffect(() => {
    fetch('/api/delivery').then(r => r.json()).then(setDeliveryData).catch(() => { });
  }, []);

  // Load Yandex Maps JS API for geocoding
  useEffect(() => {
    if (ymapsLoaded.current || typeof window === 'undefined') return;
    if (window.ymaps) { ymapsLoaded.current = true; return; }
    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=none&lang=ru_RU';
    script.async = true;
    script.onload = () => { ymapsLoaded.current = true; };
    document.head.appendChild(script);
  }, []);

  // Geocode the address and compute delivery cost
  const geocodeAddress = useCallback((address) => {
    if (!address || address.length < 5 || !deliveryData) {
      setDeliveryCalc(null);
      setAddressError('');
      return;
    }

    setGeocoding(true);
    setAddressError('');

    const doGeocode = () => {
      if (!window.ymaps) {
        setGeocoding(false);
        return;
      }
      window.ymaps.ready(() => {
        window.ymaps.geocode('Москва, ' + address, { results: 1 }).then(res => {
          const firstGeo = res.geoObjects.get(0);
          if (!firstGeo) {
            setAddressError('Адрес не найден');
            setDeliveryCalc(null);
            setGeocoding(false);
            return;
          }
          const coords = firstGeo.geometry.getCoordinates();
          const dist = haversineKm(deliveryData.shop_lat, deliveryData.shop_lng, coords[0], coords[1]);
          const roundedDist = Math.round(dist * 10) / 10;

          // Find matching zone
          const zones = deliveryData.delivery_zones || [];
          const matchedZone = zones.find(z => dist >= z.from && dist < z.to);

          if (matchedZone) {
            setDeliveryCalc({ distance: roundedDist, zone: matchedZone, price: matchedZone.price });
            setAddressError('');
          } else {
            const maxZone = zones.reduce((acc, z) => (z.to > acc ? z.to : acc), 0);
            if (dist >= maxZone) {
              setAddressError(`Адрес находится за пределами зоны доставки (${roundedDist} км). Максимум: ${maxZone} км`);
              setDeliveryCalc(null);
            } else {
              setAddressError('Не удалось определить зону');
              setDeliveryCalc(null);
            }
          }
          setGeocoding(false);
        }).catch(() => {
          setAddressError('Ошибка геокодирования');
          setDeliveryCalc(null);
          setGeocoding(false);
        });
      });
    };

    // Debounce
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(doGeocode, 800);
  }, [deliveryData]);

  // Trigger geocoding when address changes and delivery is selected
  useEffect(() => {
    if (form.delivery === 'delivery') {
      geocodeAddress(form.address);
    } else {
      setDeliveryCalc(null);
      setAddressError('');
    }
  }, [form.address, form.delivery, geocodeAddress]);

  const deliveryCost = form.delivery === 'delivery' && deliveryCalc ? deliveryCalc.price : 0;
  const grandTotal = total + deliveryCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    if (form.delivery === 'delivery' && !deliveryCalc) {
      alert('Пожалуйста, укажите корректный адрес доставки');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          delivery_method: form.delivery,
          delivery_address: form.address,
          delivery_cost: deliveryCost,
          payment_method: form.payment,
          comment: form.comment,
        }),
      });
      const data = await res.json();
      setOrderNumber(data.order_number);
      clearCart();
      setStep('success');
    } catch {
      alert('Ошибка при оформлении заказа');
    }
    setSubmitting(false);
  };

  if (step === 'success') {
    return (
      <div className="container cart-page">
        <div className="success-block">
          <div className="success-icon">✅</div>
          <h1 className="success-title">Заказ оформлен!</h1>
          <p className="success-number">Номер заказа: <strong>{orderNumber}</strong></p>
          <p className="success-text">Мы свяжемся с вами для подтверждения заказа.</p>
          <Link href="/catalog" className="btn btn-primary" style={{ marginTop: '2rem' }}>Продолжить покупки</Link>
        </div>
        <style jsx>{`
          .cart-page { padding: 4rem 0; }
          .success-block { text-align: center; padding: 4rem 2rem; }
          .success-icon { font-size: 5rem; margin-bottom: 1.5rem; }
          .success-title { font-size: 2.5rem; margin-bottom: 1rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .success-number { font-size: 1.2rem; margin-bottom: 1rem; color: var(--color-text-secondary); }
          .success-text { color: var(--color-text-muted); }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="container cart-page">
        <h1 className="cart-page-title">
          {step === 'cart' ? 'Корзина' : 'Оформление заказа'}
        </h1>

        {items.length === 0 && step === 'cart' ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <p className="empty-state-text">Ваша корзина пуста</p>
            <Link href="/catalog" className="btn btn-primary">Перейти в каталог</Link>
          </div>
        ) : step === 'cart' ? (
          <div className="cart-layout">
            <div className="cart-items-list">
              {items.map((item, idx) => (
                <div key={`${item.type}-${item.id}-${idx}`} className="cart-row">
                  <div className="cart-row-img">
                    {item.image ? <img src={item.image} alt={item.name} /> : (
                      <div className="cart-row-placeholder">{item.type === 'cake' ? '🎂' : item.type === 'set' ? '🎁' : '🧁'}</div>
                    )}
                  </div>
                  <div className="cart-row-info">
                    <h3 className="cart-row-name">{item.name}</h3>
                    {item.details && <p className="cart-row-details">{item.details}</p>}
                    <p className="cart-row-price">{item.price.toLocaleString('ru-RU')} ₽ / {item.unit || 'шт'}</p>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1, item.type)}>−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1, item.type)}>+</button>
                  </div>
                  <div className="cart-row-total">
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </div>
                  <button className="cart-row-remove" onClick={() => removeItem(item.id, item.type)}>✕</button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="cart-summary-card card">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Итого</h3>
                <div className="cart-summary-row">
                  <span>Товары ({items.reduce((s, i) => s + i.quantity, 0)} шт)</span>
                  <span>{total.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="cart-summary-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>К оплате</span>
                  <span className="price" style={{ fontSize: '1.5rem' }}>{total.toLocaleString('ru-RU')} ₽</span>
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setStep('checkout')}>
                  Оформить заказ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-left">
              <div className="checkout-section">
                <h3 className="checkout-heading">Контактные данные</h3>
                <div className="form-group">
                  <label className="form-label">Имя *</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" />
                </div>
                <div className="form-group">
                  <label className="form-label">Телефон *</label>
                  <input className="form-input" required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 (999) 123-45-67" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
              </div>

              <div className="checkout-section">
                <h3 className="checkout-heading">Доставка</h3>
                <div className="delivery-options">
                  <label className={`delivery-option ${form.delivery === 'pickup' ? 'active' : ''}`}>
                    <input type="radio" name="delivery" value="pickup" checked={form.delivery === 'pickup'} onChange={e => setForm({ ...form, delivery: e.target.value })} />
                    <div>
                      <strong>Самовывоз</strong>
                      <span>Бесплатно</span>
                    </div>
                  </label>
                  <label className={`delivery-option ${form.delivery === 'delivery' ? 'active' : ''}`}>
                    <input type="radio" name="delivery" value="delivery" checked={form.delivery === 'delivery'} onChange={e => setForm({ ...form, delivery: e.target.value })} />
                    <div>
                      <strong>Доставка</strong>
                      <span>{deliveryCalc ? `${deliveryCalc.price.toLocaleString('ru-RU')} ₽` : 'рассчитается по адресу'}</span>
                    </div>
                  </label>
                </div>
                {form.delivery === 'pickup' && (
                  <div className="pickup-info" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>📍 Адрес самовывоза:</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>г. Москва, ул. Верейская, д. 29с134</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>По будням с 8:00 до 18:00</p>
                  </div>
                )}
                {form.delivery === 'delivery' && (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Адрес доставки *</label>
                      <input
                        className="form-input"
                        value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        placeholder="Улица, дом, корпус, квартира"
                      />
                    </div>

                    {/* Delivery cost result */}
                    {geocoding && (
                      <div className="delivery-calc-status">
                        <div className="spinner-small" />
                        <span>Рассчитываем стоимость доставки...</span>
                      </div>
                    )}

                    {!geocoding && deliveryCalc && (
                      <div className="delivery-calc-result success">
                        <div className="dcr-icon">✅</div>
                        <div className="dcr-info">
                          <p className="dcr-title">Доставка доступна!</p>
                          <p className="dcr-detail">Расстояние: {deliveryCalc.distance} км (зона {deliveryCalc.zone.from}–{deliveryCalc.zone.to} км)</p>
                        </div>
                        <div className="dcr-price">{deliveryCalc.price.toLocaleString('ru-RU')} ₽</div>
                      </div>
                    )}

                    {!geocoding && addressError && (
                      <div className="delivery-calc-result error">
                        <div className="dcr-icon">⚠️</div>
                        <div className="dcr-info">
                          <p className="dcr-title">{addressError}</p>
                          <p className="dcr-detail">
                            <Link href="/delivery" style={{ color: 'var(--color-gold)' }}>Посмотреть зоны доставки</Link>
                          </p>
                        </div>
                      </div>
                    )}

                    {!geocoding && !deliveryCalc && !addressError && form.address.length > 0 && form.address.length < 5 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '-0.5rem' }}>
                        Введите полный адрес для расчёта стоимости
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="checkout-section">
                <h3 className="checkout-heading">Оплата</h3>
                <div className="delivery-options">
                  <label className={`delivery-option ${form.payment === 'cash' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="cash" checked={form.payment === 'cash'} onChange={e => setForm({ ...form, payment: e.target.value })} />
                    <div><strong>Наличные</strong></div>
                  </label>
                  <label className={`delivery-option ${form.payment === 'card' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="card" checked={form.payment === 'card'} onChange={e => setForm({ ...form, payment: e.target.value })} />
                    <div><strong>Картой</strong></div>
                  </label>
                </div>
              </div>

              <div className="checkout-section">
                <h3 className="checkout-heading">Комментарий</h3>
                <textarea className="form-input form-textarea" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Пожелания к заказу..." />
              </div>
            </div>

            <div className="checkout-right">
              <div className="cart-summary-card card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1rem' }}>Ваш заказ</h3>
                {items.map((item, idx) => (
                  <div key={idx} className="cart-summary-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                  </div>
                ))}
                <div className="cart-summary-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                  <span>Товары</span>
                  <span>{total.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="cart-summary-row">
                  <span>Доставка</span>
                  <span>
                    {form.delivery === 'pickup' ? (
                      <span style={{ color: 'var(--color-gold)' }}>Бесплатно</span>
                    ) : deliveryCalc ? (
                      `${deliveryCalc.price.toLocaleString('ru-RU')} ₽`
                    ) : geocoding ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>расчёт...</span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>укажите адрес</span>
                    )}
                  </span>
                </div>
                <div className="cart-summary-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Итого</span>
                  <span className="price" style={{ fontSize: '1.4rem' }}>{grandTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '1.5rem' }}
                  disabled={submitting || (form.delivery === 'delivery' && !deliveryCalc)}
                >
                  {submitting ? 'Оформляем...' : (form.delivery === 'delivery' && !deliveryCalc) ? 'Укажите адрес доставки' : 'Подтвердить заказ'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.75rem' }} onClick={() => setStep('cart')}>
                  ← Вернуться в корзину
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .cart-page { padding: 2rem 0 4rem; }
        .cart-page-title { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start; }
        .cart-items-list { display: flex; flex-direction: column; gap: 1rem; }
        .cart-row {
          display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem;
          background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
        }
        .cart-row-img { width: 80px; height: 80px; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0; }
        .cart-row-img img { width: 100%; height: 100%; object-fit: cover; }
        .cart-row-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--color-surface); font-size: 2rem; }
        .cart-row-info { flex: 1; min-width: 0; }
        .cart-row-name { font-size: 1rem; margin-bottom: 4px; }
        .cart-row-details { font-size: 0.8rem; color: var(--color-text-muted); }
        .cart-row-price { font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px; }
        .cart-row-total { font-weight: 600; font-size: 1.1rem; color: var(--color-gold); white-space: nowrap; }
        .cart-row-remove { color: var(--color-text-muted); font-size: 1rem; padding: 8px; transition: color var(--transition-base); }
        .cart-row-remove:hover { color: var(--color-error); }
        .cart-summary-card { padding: 1.5rem; position: sticky; top: calc(var(--header-height) + 1rem); }
        .cart-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; }
        .cart-summary-item { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 6px 0; color: var(--color-text-secondary); }

        .checkout-form { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start; }
        .checkout-left { display: flex; flex-direction: column; gap: 2rem; }
        .checkout-section { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1.5rem; }
        .checkout-heading { font-family: var(--font-heading); font-size: 1.2rem; margin-bottom: 1.25rem; }
        .delivery-options { display: flex; gap: 1rem; }
        .delivery-option {
          flex: 1; padding: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-md);
          cursor: pointer; transition: all var(--transition-base); display: flex; align-items: center; gap: 0.75rem;
        }
        .delivery-option input { display: none; }
        .delivery-option.active { border-color: var(--color-gold); background: rgba(201,168,76,0.05); }
        .delivery-option div { display: flex; flex-direction: column; gap: 2px; }
        .delivery-option span { font-size: 0.8rem; color: var(--color-text-muted); }
        .checkout-right { position: sticky; top: calc(var(--header-height) + 1rem); }

        /* Delivery calculation UI */
        .delivery-calc-status {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--color-bg); border-radius: var(--radius-md);
          font-size: 0.85rem; color: var(--color-text-secondary);
        }
        .spinner-small {
          width: 16px; height: 16px;
          border: 2px solid var(--color-border);
          border-top-color: var(--color-gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .delivery-calc-result {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 1rem; border-radius: var(--radius-md);
          margin-top: -0.5rem;
        }
        .delivery-calc-result.success {
          background: rgba(76, 175, 80, 0.08);
          border: 1px solid rgba(76, 175, 80, 0.25);
        }
        .delivery-calc-result.error {
          background: rgba(244, 67, 54, 0.06);
          border: 1px solid rgba(244, 67, 54, 0.2);
        }
        .dcr-icon { font-size: 1.5rem; flex-shrink: 0; }
        .dcr-info { flex: 1; }
        .dcr-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 2px; }
        .dcr-detail { font-size: 0.8rem; color: var(--color-text-secondary); }
        .dcr-price { font-weight: 700; font-size: 1.2rem; color: var(--color-gold); white-space: nowrap; }

        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr; }
          .cart-row { flex-wrap: wrap; }
          .checkout-form { grid-template-columns: 1fr; }
          .delivery-options { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
