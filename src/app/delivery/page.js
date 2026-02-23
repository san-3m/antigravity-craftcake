'use client';
import { useState, useEffect, useRef } from 'react';

export default function DeliveryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    fetch('/api/delivery')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data || mapInstance.current) return;

    const initMap = () => {
      if (!window.ymaps || !mapRef.current) return;
      window.ymaps.ready(() => {
        const map = new window.ymaps.Map(mapRef.current, {
          center: [data.shop_lat, data.shop_lng],
          zoom: 10,
          controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
        });

        // Draw zone circles (draw outer zones first so inner ones are on top)
        const sortedZones = [...data.delivery_zones].sort((a, b) => b.to - a.to);
        sortedZones.forEach(zone => {
          const circle = new window.ymaps.Circle(
            [[data.shop_lat, data.shop_lng], zone.to * 1000],
            {
              hintContent: `${zone.from}–${zone.to} км — ${zone.price} ₽`,
              balloonContent: `<strong>Зона доставки ${zone.from}–${zone.to} км</strong><br/>Стоимость: ${zone.price} ₽`,
            },
            {
              fillColor: zone.color + '33',
              strokeColor: zone.color,
              strokeWidth: 2,
              strokeOpacity: 0.8,
              fillOpacity: 0.15,
            }
          );
          map.geoObjects.add(circle);
        });

        // Add shop marker
        const placemark = new window.ymaps.Placemark(
          [data.shop_lat, data.shop_lng],
          {
            hintContent: 'Craftcake — Мастерская десертов',
            balloonContent: `<strong>Craftcake</strong><br/>${data.shop_address}<br/>Ежедневно 9:00–21:00`,
          },
          {
            preset: 'islands#redDotIcon',
          }
        );
        map.geoObjects.add(placemark);

        mapInstance.current = map;
      });
    };

    // Load Yandex Maps API
    if (window.ymaps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=none&lang=ru_RU';
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [data]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <>
      <section className="delivery-hero">
        <div className="container">
          <h1 className="delivery-title">Доставка</h1>
          <p className="delivery-subtitle">Доставляем по всей Москве и ближнему Подмосковью</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="delivery-grid">
            {/* Map */}
            <div className="delivery-map-col">
              <h2 className="delivery-heading">Зоны доставки</h2>
              <div className="map-wrapper" ref={mapRef} />
              <p className="map-note">Наведите на зону для подробностей</p>
            </div>

            {/* Zone prices */}
            <div className="delivery-info-col">
              <h2 className="delivery-heading">Стоимость доставки</h2>
              <div className="zones-list">
                {data?.delivery_zones?.map((zone, i) => (
                  <div key={i} className="zone-card">
                    <div className="zone-color" style={{ background: zone.color }} />
                    <div className="zone-details">
                      <span className="zone-range">{zone.from}–{zone.to} км</span>
                      <span className="zone-desc">от кондитерской</span>
                    </div>
                    <span className="zone-price">{zone.price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                ))}
              </div>

              <div className="pickup-card">
                <div className="pickup-icon">🏪</div>
                <div>
                  <h3 className="pickup-title">Самовывоз — бесплатно</h3>
                  <p className="pickup-addr">{data?.shop_address}</p>
                  <p className="pickup-hours">По будням с 8:00 до 18:00</p>
                </div>
              </div>

              <div className="delivery-note-card">
                <h3>📋 Важная информация</h3>
                <ul>
                  <li>Минимальная сумма заказа — 1 500 ₽</li>
                  <li>Доставка в день заказа при оформлении до 14:00</li>
                  <li>Точное время доставки согласовывается по телефону</li>
                  <li>Торты доставляются в специальной упаковке</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .delivery-hero {
          padding: 3rem 0;
          background: var(--color-bg-alt);
          border-bottom: 1px solid var(--color-border);
          text-align: center;
        }
        .delivery-title {
          font-size: 3rem;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .delivery-subtitle { color: var(--color-text-secondary); margin-top: 0.5rem; }
        .delivery-heading {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          margin-bottom: 1.5rem;
        }
        .delivery-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 3rem;
          align-items: start;
        }
        .map-wrapper {
          width: 100%;
          height: 520px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid var(--color-border);
          background: var(--color-bg-card);
        }
        .map-note {
          text-align: center;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 0.75rem;
        }
        .zones-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
        .zone-card {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
        }
        .zone-card:hover { border-color: rgba(201,168,76,0.3); transform: translateX(4px); }
        .zone-color {
          width: 12px; height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 6px currentColor;
        }
        .zone-details { flex: 1; display: flex; flex-direction: column; }
        .zone-range { font-weight: 600; font-size: 1rem; }
        .zone-desc { font-size: 0.75rem; color: var(--color-text-muted); }
        .zone-price { font-weight: 700; color: var(--color-gold); font-size: 1.15rem; white-space: nowrap; }

        .pickup-card {
          display: flex; align-items: flex-start; gap: 1rem;
          padding: 1.25rem;
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: var(--radius-lg);
          margin-bottom: 1.5rem;
        }
        .pickup-icon { font-size: 2rem; }
        .pickup-title { font-family: var(--font-heading); font-size: 1.1rem; margin-bottom: 0.3rem; color: var(--color-gold); }
        .pickup-addr { font-size: 0.9rem; color: var(--color-text-secondary); }
        .pickup-hours { font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.25rem; }

        .delivery-note-card {
          padding: 1.25rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }
        .delivery-note-card h3 {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
        }
        .delivery-note-card ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .delivery-note-card li {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          padding-left: 1.25rem;
          position: relative;
        }
        .delivery-note-card li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--color-gold);
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .delivery-grid { grid-template-columns: 1fr; }
          .map-wrapper { height: 350px; }
        }
      `}</style>
    </>
  );
}
