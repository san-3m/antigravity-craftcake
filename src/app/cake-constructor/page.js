'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/components/CartProvider';

/*
  Weight ranges (kg) per size × tier-count.
  Diameters are maximum ("до X см").
  Height per tier ≈ 12 cm.
*/
const CAKE_SIZES = [
  {
    id: 'small',
    name: 'Маленький',
    emoji: '🎂',
    maxTiers: 2,
    tierDiameters: [25, 15],          // bottom, top
    byTiers: {
      1: { minKg: 2, maxKg: 4, label: 'до 25 см' },
      2: { minKg: 3, maxKg: 6, label: 'до 25 + 15 см' },
    },
  },
  {
    id: 'medium',
    name: 'Средний',
    emoji: '🎂',
    maxTiers: 3,
    tierDiameters: [35, 25, 15],
    byTiers: {
      1: { minKg: 4, maxKg: 6, label: 'до 35 см' },
      2: { minKg: 6, maxKg: 8, label: 'до 35 + 25 см' },
      3: { minKg: 8, maxKg: 10, label: 'до 35 + 25 + 15 см' },
    },
  },
  {
    id: 'premium',
    name: 'Премиум',
    emoji: '👑',
    maxTiers: 3,
    tierDiameters: [50, 40, 30],
    byTiers: {
      1: { minKg: 9, maxKg: 13, label: 'до 50 см' },
      2: { minKg: 12, maxKg: 16, label: 'до 50 + 40 см' },
      3: { minKg: 15, maxKg: 23, label: 'до 50 + 40 + 30 см' },
    },
  },
];

const TIER_HEIGHT_CM = 12;

export default function CakeConstructorPage() {
  const { addItem } = useCart();
  const [fillings, setFillings] = useState([]);
  const [pricing, setPricing] = useState({ cake_price_per_kg: 2500, cake_berries_price: 500, cake_fondant_price: 800, cake_flowers_price: 1500 });
  const [selectedSize, setSelectedSize] = useState(CAKE_SIZES[0]);
  const [tierCount, setTierCount] = useState(1);
  const [weightKg, setWeightKg] = useState(2);
  const [tierFillings, setTierFillings] = useState([null]);
  const [berries, setBerries] = useState(false);
  const [fondant, setFondant] = useState(false);
  const [flowers, setFlowers] = useState(false);
  const [step, setStep] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cake').then(r => r.json()).then(data => {
      setFillings(data.fillings || []);
      if (data.pricing) setPricing(data.pricing);
      if (data.fillings?.length) setTierFillings([data.fillings[0]]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Current weight range
  const tierConf = selectedSize.byTiers[tierCount];
  const minKg = tierConf.minKg;
  const maxKg = tierConf.maxKg;
  const servings = Math.round(weightKg / 0.2);
  const totalHeightCm = tierCount * TIER_HEIGHT_CM;
  const activeDiameters = selectedSize.tierDiameters.slice(0, tierCount);

  // Price
  const basePrice = weightKg * pricing.cake_price_per_kg;
  const fillingsPrice = tierFillings.reduce((sum, f) => sum + (f?.price_modifier || 0), 0);
  const decorPrice = (berries ? pricing.cake_berries_price : 0) + (fondant ? pricing.cake_fondant_price : 0) + (flowers ? pricing.cake_flowers_price : 0);
  const totalPrice = Math.round(basePrice + fillingsPrice + decorPrice);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const maxT = Math.min(tierCount, size.maxTiers);
    setTierCount(maxT);
    const conf = size.byTiers[maxT];
    setWeightKg(conf.minKg);
    const newF = [...tierFillings].slice(0, maxT);
    while (newF.length < maxT) newF.push(fillings[0] || null);
    setTierFillings(newF);
  };

  const handleTierCountChange = (count) => {
    setTierCount(count);
    const conf = selectedSize.byTiers[count];
    setWeightKg(conf.minKg);
    const newF = [...tierFillings];
    while (newF.length < count) newF.push(fillings[0] || null);
    setTierFillings(newF.slice(0, count));
  };

  const handleTierFilling = (idx, filling) => {
    const newF = [...tierFillings];
    newF[idx] = filling;
    setTierFillings(newF);
  };

  const allFillingsOk = tierFillings.every(f => f !== null);
  const tierLabels = ['Нижний ярус', 'Средний ярус', 'Верхний ярус'];

  const handleAddToCart = () => {
    if (!allFillingsOk) return;
    const fillDesc = tierFillings.map((f, i) =>
      tierCount > 1 ? `${tierCount === 2 ? (i === 0 ? tierLabels[0] : tierLabels[2]) : tierLabels[i]}: ${f.name}` : f.name
    ).join('; ');
    const decos = [];
    if (berries) decos.push('ягоды');
    if (fondant) decos.push('мастика');
    if (flowers) decos.push('живые цветы');
    const decoDesc = decos.length ? ` | Декор: ${decos.join(', ')}` : '';
    addItem({
      id: `cake-${selectedSize.id}-${tierCount}t-${Date.now()}`,
      type: 'cake',
      name: `Торт «${tierFillings[0].name}»${tierCount > 1 ? ` (${tierCount} яруса)` : ''}`,
      details: `${selectedSize.name}, ${tierCount > 1 ? `${tierCount} яруса, ` : ''}${weightKg} кг, ${fillDesc}${decoDesc}`,
      price: totalPrice,
      unit: 'шт',
      image: tierFillings[0].image || null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      <div className="spinner" />
    </div>
  );

  const stepLabels = ['Размер', 'Ярусы', 'Вес', 'Начинки', 'Декор', 'Готово!'];

  return (
    <>
      <section className="constructor-hero">
        <div className="container">
          <h1 className="constructor-title">Конструктор торта</h1>
          <p className="constructor-subtitle">Создайте свой идеальный торт</p>
          <div className="constructor-steps">
            {stepLabels.map((label, i) => (
              <div key={i} style={{ display: 'contents' }}>
                {i > 0 && <div className="step-line" />}
                <div className={`step-indicator ${step >= i + 1 ? 'active' : ''}`}>
                  <span className="step-num">{i + 1}</span>
                  <span className="step-label">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating price indicator */}
      <div className="floating-price">
        <span>{weightKg} кг</span>
        <span className="floating-divider">|</span>
        <span>~{servings} порц.</span>
        <span className="floating-divider">|</span>
        <span className="floating-total">{totalPrice.toLocaleString('ru-RU')} ₽</span>
      </div>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">

          {/* STEP 1: Size */}
          {step === 1 && (
            <div className="constructor-panel animate-fadeInUp">
              <h2 className="panel-title">Выберите размер торта</h2>
              <div className="sizes-grid-3">
                {CAKE_SIZES.map(size => {
                  const c1 = size.byTiers[1];
                  return (
                    <button
                      key={size.id}
                      className={`size-card ${selectedSize.id === size.id ? 'selected' : ''}`}
                      onClick={() => handleSizeChange(size)}
                    >
                      <div className="size-emoji">{size.emoji}</div>
                      <h3 className="size-name">{size.name}</h3>
                      <p className="size-info">{c1.label}</p>
                      <p className="size-info">До {size.maxTiers} ярус{size.maxTiers > 2 ? 'ов' : 'ов'}</p>
                      <div className="size-divider" />
                      <p className="size-meta">{c1.minKg}–{c1.maxKg} кг (1 ярус)</p>
                      <p className="size-price">от {(c1.minKg * pricing.cake_price_per_kg).toLocaleString('ru-RU')} ₽</p>
                    </button>
                  );
                })}
              </div>
              <div className="panel-actions">
                <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Tiers */}
          {step === 2 && (
            <div className="constructor-panel animate-fadeInUp">
              <h2 className="panel-title">Сколько ярусов?</h2>
              <p className="panel-sub">Высота каждого яруса — {TIER_HEIGHT_CM} см</p>
              <div className="tiers-grid">
                {Array.from({ length: selectedSize.maxTiers }).map((_, i) => {
                  const count = i + 1;
                  const conf = selectedSize.byTiers[count];
                  const diams = selectedSize.tierDiameters.slice(0, count);
                  return (
                    <button
                      key={count}
                      className={`tier-card ${tierCount === count ? 'selected' : ''}`}
                      onClick={() => handleTierCountChange(count)}
                    >
                      <div className="tier-visual">
                        {Array.from({ length: count }).map((_, j) => {
                          const revIdx = count - 1 - j;
                          const d = diams[revIdx];
                          return (
                            <div
                              key={j}
                              className="tier-layer"
                              style={{
                                width: `${(d / diams[0]) * 100}%`,
                                height: count === 1 ? '80px' : count === 2 ? '50px' : '36px',
                              }}
                            >
                              <span className="tier-layer-label">⌀{d}</span>
                            </div>
                          );
                        })}
                      </div>
                      <h3 className="tier-label">
                        {count === 1 ? 'Один ярус' : count === 2 ? 'Два яруса' : 'Три яруса'}
                      </h3>
                      <p className="tier-desc">{conf.label}</p>
                      <p className="tier-desc">{conf.minKg}–{conf.maxKg} кг</p>
                      <p className="tier-desc">Высота: {count * TIER_HEIGHT_CM} см</p>
                      <p className="tier-price">от {(conf.minKg * pricing.cake_price_per_kg).toLocaleString('ru-RU')} ₽</p>
                    </button>
                  );
                })}
              </div>
              <div className="panel-actions">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Назад</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
                  Далее: выбор веса →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Weight */}
          {step === 3 && (
            <div className="constructor-panel animate-fadeInUp">
              <h2 className="panel-title">Выберите вес торта</h2>
              <p className="panel-sub">
                {selectedSize.name}, {tierCount === 1 ? '1 ярус' : `${tierCount} яруса`} · {tierConf.label}
              </p>

              <div className="weight-panel">
                <div className="weight-display">
                  <span className="weight-value">{weightKg}</span>
                  <span className="weight-unit">кг</span>
                </div>
                <p className="weight-servings">~{servings} порций</p>

                <div className="weight-slider-wrap">
                  <span className="weight-bound">{minKg} кг</span>
                  <input
                    type="range"
                    className="weight-slider"
                    min={minKg}
                    max={maxKg}
                    step={0.5}
                    value={weightKg}
                    onChange={e => setWeightKg(parseFloat(e.target.value))}
                  />
                  <span className="weight-bound">{maxKg} кг</span>
                </div>

                <div className="weight-quick">
                  {[minKg, Math.round((minKg + maxKg) / 2 * 2) / 2, maxKg].map(v => (
                    <button
                      key={v}
                      className={`weight-quick-btn ${weightKg === v ? 'active' : ''}`}
                      onClick={() => setWeightKg(v)}
                    >
                      {v} кг
                    </button>
                  ))}
                </div>

                <div className="weight-price-preview">
                  <span>Базовая стоимость:</span>
                  <span className="weight-price-val">{Math.round(basePrice).toLocaleString('ru-RU')} ₽</span>
                </div>
                <p className="weight-price-note">{pricing.cake_price_per_kg.toLocaleString('ru-RU')} ₽ за кг × {weightKg} кг</p>
              </div>

              <div className="panel-actions">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>← Назад</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(4)}>
                  Далее: начинк{tierCount > 1 ? 'и' : 'а'} →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Fillings */}
          {step === 4 && (
            <div className="constructor-panel animate-fadeInUp" style={{ maxWidth: '1000px' }}>
              <h2 className="panel-title">
                {tierCount === 1 ? 'Выберите начинку' : 'Выберите начинку для каждого яруса'}
              </h2>

              {Array.from({ length: tierCount }).map((_, tierIdx) => {
                const label = tierCount === 1 ? null : tierCount === 2 ? (tierIdx === 0 ? tierLabels[0] : tierLabels[2]) : tierLabels[tierIdx];
                const d = activeDiameters[tierIdx];
                return (
                  <div key={tierIdx} className="tier-section">
                    {tierCount > 1 && (
                      <h3 className="tier-heading">
                        <span className="tier-heading-emoji">🍰</span>
                        {label} <span style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>(до {d} см)</span>
                        {tierFillings[tierIdx] && (
                          <span className="tier-heading-selected">✓ {tierFillings[tierIdx].name}</span>
                        )}
                      </h3>
                    )}
                    <div className="fillings-grid">
                      {fillings.map(f => (
                        <button
                          key={f.id}
                          className={`filling-card ${tierFillings[tierIdx]?.id === f.id ? 'selected' : ''}`}
                          onClick={() => handleTierFilling(tierIdx, f)}
                        >
                          <div className="filling-img">
                            {f.image ? <img src={f.image} alt={f.name} /> : <div className="filling-placeholder">🍰</div>}
                          </div>
                          <div className="filling-info">
                            <h3 className="filling-name">{f.name}</h3>
                            <p className="filling-desc">{f.description}</p>
                            {f.price_modifier > 0 && <p className="filling-modifier">+{f.price_modifier.toLocaleString('ru-RU')} ₽</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="panel-actions">
                <button className="btn btn-secondary" onClick={() => setStep(3)}>← Назад</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(5)} disabled={!allFillingsOk}>
                  Далее: декор →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Decorations */}
          {step === 5 && (
            <div className="constructor-panel animate-fadeInUp">
              <h2 className="panel-title">Украшения и покрытие</h2>
              <p className="panel-sub">Добавьте финальные штрихи вашему торту</p>

              <div className="decor-grid">
                <button className={`decor-card ${fondant ? 'selected' : ''}`} onClick={() => setFondant(!fondant)}>
                  <div className="decor-emoji">🎨</div>
                  <h3 className="decor-name">Мастика</h3>
                  <p className="decor-desc">Гладкое сахарное покрытие для идеального внешнего вида</p>
                  <p className="decor-price">+{pricing.cake_fondant_price.toLocaleString('ru-RU')} ₽</p>
                  <div className="decor-toggle"><span>{fondant ? '✓ Да' : 'Без мастики'}</span></div>
                </button>

                <button className={`decor-card ${berries ? 'selected' : ''}`} onClick={() => setBerries(!berries)}>
                  <div className="decor-emoji">🍓</div>
                  <h3 className="decor-name">Ягоды</h3>
                  <p className="decor-desc">Свежие сезонные ягоды для украшения торта</p>
                  <p className="decor-price">+{pricing.cake_berries_price.toLocaleString('ru-RU')} ₽</p>
                  <div className="decor-toggle"><span>{berries ? '✓ Да' : 'Без ягод'}</span></div>
                </button>

                <button className={`decor-card ${flowers ? 'selected' : ''}`} onClick={() => setFlowers(!flowers)}>
                  <div className="decor-emoji">🌸</div>
                  <h3 className="decor-name">Живые цветы</h3>
                  <p className="decor-desc">Натуральные цветы для премиального оформления</p>
                  <p className="decor-price">+{pricing.cake_flowers_price.toLocaleString('ru-RU')} ₽</p>
                  <div className="decor-toggle"><span>{flowers ? '✓ Да' : 'Без цветов'}</span></div>
                </button>
              </div>

              <div className="panel-actions">
                <button className="btn btn-secondary" onClick={() => setStep(4)}>← Назад</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(6)}>
                  Далее: итого →
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Summary */}
          {step === 6 && (
            <div className="constructor-panel animate-fadeInUp">
              <h2 className="panel-title">Ваш торт готов!</h2>
              <div className="summary-card">
                <div className="summary-visual">
                  <div className="summary-cake-stack">
                    {Array.from({ length: tierCount }).map((_, i) => {
                      const revIdx = tierCount - 1 - i;
                      const d = activeDiameters[revIdx];
                      return (
                        <div key={i} className="summary-tier-block" style={{ width: `${(d / activeDiameters[0]) * 120}px` }}>
                          <div className="summary-tier-layer" />
                          <span className="summary-tier-dia">до {d} см</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="summary-details">
                  <div className="summary-item">
                    <span className="summary-label">Размер:</span>
                    <span className="summary-value">{selectedSize.name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Ярусов:</span>
                    <span className="summary-value">
                      {tierCount} ({activeDiameters.map(d => `до ${d} см`).join(' + ')}) · высота {totalHeightCm} см
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Вес:</span>
                    <span className="summary-value">{weightKg} кг (~{servings} порций)</span>
                  </div>
                  {tierFillings.map((f, i) => (
                    <div key={i} className="summary-item">
                      <span className="summary-label">
                        {tierCount === 1 ? 'Начинка:' : `${tierCount === 2 ? (i === 0 ? tierLabels[0] : tierLabels[2]) : tierLabels[i]}:`}
                      </span>
                      <span className="summary-value">
                        {f?.name}
                        {f?.price_modifier > 0 && <span className="summary-extra">+{f.price_modifier.toLocaleString('ru-RU')} ₽</span>}
                      </span>
                    </div>
                  ))}
                  {(berries || fondant || flowers) && (
                    <div className="summary-item">
                      <span className="summary-label">Декор:</span>
                      <span className="summary-value">
                        {[fondant && 'Мастика', berries && 'Ягоды', flowers && 'Живые цветы'].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="summary-breakdown">
                    <div className="sb-row">
                      <span>Торт ({weightKg} кг × {pricing.cake_price_per_kg.toLocaleString('ru-RU')} ₽/кг)</span>
                      <span>{Math.round(basePrice).toLocaleString('ru-RU')} ₽</span>
                    </div>
                    {fillingsPrice > 0 && <div className="sb-row"><span>Начинки</span><span>+{fillingsPrice.toLocaleString('ru-RU')} ₽</span></div>}
                    {decorPrice > 0 && <div className="sb-row"><span>Декор</span><span>+{decorPrice.toLocaleString('ru-RU')} ₽</span></div>}
                  </div>
                  <div className="summary-total">
                    <span>Итого:</span>
                    <span className="price" style={{ fontSize: '2rem' }}>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>
              <div className="panel-actions">
                <button className="btn btn-secondary" onClick={() => setStep(5)}>← Изменить</button>
                <button className={`btn ${added ? 'btn-secondary' : 'btn-primary'} btn-lg`} onClick={handleAddToCart}>
                  {added ? '✓ Добавлено в корзину!' : '🛒 Добавить в корзину'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .constructor-hero { padding: 3rem 0; background: var(--color-bg-alt); border-bottom: 1px solid var(--color-border); text-align: center; }
        .constructor-title { font-size: 3rem; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .constructor-subtitle { color: var(--color-text-secondary); margin-top: 0.5rem; }
        .constructor-steps { display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 2rem; flex-wrap: wrap; }
        .step-indicator { display: flex; align-items: center; gap: 0.35rem; padding: 5px 12px; border-radius: var(--radius-full); border: 1px solid var(--color-border); transition: all var(--transition-base); }
        .step-indicator.active { border-color: var(--color-gold); background: rgba(201,168,76,0.1); }
        .step-num { width: 22px; height: 22px; border-radius: 50%; background: var(--color-bg); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.65rem; }
        .step-indicator.active .step-num { background: var(--color-gold); color: #ffffff; }
        .step-label { font-size: 0.7rem; color: var(--color-text-secondary); }
        .step-indicator.active .step-label { color: var(--color-gold); }
        .step-line { width: 16px; height: 1px; background: var(--color-border); }
        .constructor-panel { max-width: 900px; margin: 0 auto; }
        .panel-title { font-size: 1.8rem; text-align: center; margin-bottom: 2rem; font-family: var(--font-heading); }
        .panel-sub { text-align: center; color: var(--color-text-secondary); margin-top: -1rem; margin-bottom: 2rem; font-size: 0.9rem; }
        .panel-actions { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem; }

        .floating-price {
          position: fixed; bottom: 2rem; right: 2rem; z-index: 100;
          background: var(--color-bg-card); border: 1px solid var(--color-gold);
          border-radius: var(--radius-full); padding: 10px 24px;
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.85rem; font-weight: 600;
          box-shadow: var(--shadow-gold); backdrop-filter: blur(12px);
        }
        .floating-divider { color: var(--color-border); }
        .floating-total { color: var(--color-gold); font-size: 1.05rem; }

        /* Sizes */
        .sizes-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .size-card {
          background: var(--color-bg-card); border: 2px solid var(--color-border);
          border-radius: var(--radius-xl); padding: 2rem 1.5rem;
          text-align: center; transition: all var(--transition-base); cursor: pointer;
        }
        .size-card:hover { border-color: rgba(201,168,76,0.5); transform: translateY(-4px); }
        .size-card.selected { border-color: var(--color-gold); background: rgba(201,168,76,0.08); box-shadow: var(--shadow-gold); }
        .size-emoji { font-size: 3rem; margin-bottom: 0.75rem; }
        .size-name { font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 0.5rem; }
        .size-info { font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 0.2rem; }
        .size-divider { height: 1px; background: var(--color-border); margin: 1rem 0; }
        .size-meta { font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 0.5rem; }
        .size-price { color: var(--color-gold); font-weight: 700; font-size: 1.2rem; }

        /* Tiers */
        .tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .tier-card {
          background: var(--color-bg-card); border: 2px solid var(--color-border);
          border-radius: var(--radius-xl); padding: 2rem 1.5rem;
          text-align: center; cursor: pointer; transition: all var(--transition-base);
        }
        .tier-card:hover { border-color: rgba(201,168,76,0.5); transform: translateY(-4px); }
        .tier-card.selected { border-color: var(--color-gold); background: rgba(201,168,76,0.08); box-shadow: var(--shadow-gold); }
        .tier-visual { display: flex; flex-direction: column; align-items: center; gap: 3px; margin-bottom: 1.5rem; min-height: 100px; justify-content: flex-end; }
        .tier-layer {
          background: var(--gradient-gold); border-radius: var(--radius-sm); opacity: 0.6;
          transition: all var(--transition-base); display: flex; align-items: center; justify-content: center;
        }
        .tier-card.selected .tier-layer { opacity: 1; }
        .tier-layer-label { font-size: 0.6rem; font-weight: 600; color: #ffffff; opacity: 0.8; }
        .tier-label { font-family: var(--font-heading); font-size: 1.3rem; margin-bottom: 0.3rem; }
        .tier-desc { font-size: 0.78rem; color: var(--color-text-secondary); margin-bottom: 0.2rem; }
        .tier-price { color: var(--color-gold); font-weight: 600; font-size: 1rem; margin-top: 0.4rem; }

        /* Weight step */
        .weight-panel {
          max-width: 500px; margin: 0 auto;
          background: var(--color-bg-card); border: 1px solid var(--color-border);
          border-radius: var(--radius-xl); padding: 3rem 2.5rem;
          text-align: center;
        }
        .weight-display { margin-bottom: 0.25rem; }
        .weight-value {
          font-size: 4rem; font-weight: 800; font-family: var(--font-heading);
          background: var(--gradient-gold); -webkit-background-clip: text;
          -webkit-text-fill-color: transparent; background-clip: text;
        }
        .weight-unit { font-size: 1.5rem; color: var(--color-text-secondary); margin-left: 0.25rem; }
        .weight-servings { color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 2rem; }
        .weight-slider-wrap { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .weight-bound { font-size: 0.8rem; color: var(--color-text-muted); white-space: nowrap; min-width: 40px; }
        .weight-slider {
          flex: 1; -webkit-appearance: none; appearance: none;
          height: 8px; border-radius: 4px;
          background: linear-gradient(to right, var(--color-gold), rgba(201,168,76,0.3));
          outline: none; cursor: pointer;
        }
        .weight-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--color-gold); cursor: pointer;
          box-shadow: 0 2px 8px rgba(201,168,76,0.4);
          border: 3px solid #ffffff;
        }
        .weight-slider::-moz-range-thumb {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--color-gold); cursor: pointer;
          box-shadow: 0 2px 8px rgba(201,168,76,0.4);
          border: 3px solid #ffffff;
        }
        .weight-quick { display: flex; gap: 0.75rem; justify-content: center; margin-bottom: 2rem; }
        .weight-quick-btn {
          padding: 8px 18px; border-radius: var(--radius-full);
          border: 1px solid var(--color-border); background: var(--color-bg);
          color: var(--color-text-secondary); font-size: 0.85rem;
          cursor: pointer; transition: all var(--transition-fast);
        }
        .weight-quick-btn:hover { border-color: rgba(201,168,76,0.5); }
        .weight-quick-btn.active { border-color: var(--color-gold); background: rgba(201,168,76,0.1); color: var(--color-gold); }
        .weight-price-preview {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; background: var(--color-bg); border-radius: var(--radius-md);
          font-size: 0.9rem;
        }
        .weight-price-val { font-weight: 700; color: var(--color-gold); font-size: 1.2rem; }
        .weight-price-note { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem; }

        /* Tier section for fillings */
        .tier-section { margin-bottom: 2.5rem; }
        .tier-section:last-of-type { margin-bottom: 0; }
        .tier-heading {
          font-family: var(--font-heading); font-size: 1.3rem;
          display: flex; align-items: center; gap: 0.5rem;
          margin-bottom: 1rem; padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-border);
        }
        .tier-heading-emoji { font-size: 1.5rem; }
        .tier-heading-selected { font-size: 0.85rem; color: var(--color-gold); font-family: var(--font-body); font-weight: 500; margin-left: auto; }
        .fillings-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .filling-card {
          display: flex; align-items: center; gap: 1.25rem;
          background: var(--color-bg-card); border: 2px solid var(--color-border);
          border-radius: var(--radius-lg); padding: 1rem;
          cursor: pointer; text-align: left; transition: all var(--transition-base);
        }
        .filling-card:hover { border-color: rgba(201,168,76,0.5); }
        .filling-card.selected { border-color: var(--color-gold); background: rgba(201,168,76,0.08); }
        .filling-img { width: 56px; height: 56px; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0; }
        .filling-img img { width: 100%; height: 100%; object-fit: cover; }
        .filling-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; background: var(--color-surface); }
        .filling-info { flex: 1; }
        .filling-name { font-family: var(--font-heading); font-size: 1rem; margin-bottom: 0.15rem; }
        .filling-desc { font-size: 0.78rem; color: var(--color-text-secondary); line-height: 1.4; }
        .filling-modifier { color: var(--color-gold); font-weight: 600; font-size: 0.8rem; margin-top: 0.25rem; }

        /* Decorations */
        .decor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .decor-card {
          background: var(--color-bg-card); border: 2px solid var(--color-border);
          border-radius: var(--radius-xl); padding: 2rem 1.5rem;
          text-align: center; cursor: pointer; transition: all var(--transition-base);
        }
        .decor-card:hover { border-color: rgba(201,168,76,0.5); transform: translateY(-4px); }
        .decor-card.selected { border-color: var(--color-gold); background: rgba(201,168,76,0.08); box-shadow: var(--shadow-gold); }
        .decor-emoji { font-size: 3rem; margin-bottom: 0.75rem; }
        .decor-name { font-family: var(--font-heading); font-size: 1.3rem; margin-bottom: 0.5rem; }
        .decor-desc { font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.4; margin-bottom: 0.75rem; }
        .decor-price { color: var(--color-gold); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.75rem; }
        .decor-toggle {
          display: inline-block; padding: 6px 16px; border-radius: var(--radius-full);
          background: var(--color-bg); font-size: 0.8rem; font-weight: 600;
          color: var(--color-text-muted); transition: all var(--transition-base);
        }
        .decor-card.selected .decor-toggle { background: var(--color-gold); color: #ffffff; }

        /* Summary */
        .summary-card {
          background: var(--color-bg-card); border: 1px solid var(--color-border);
          border-radius: var(--radius-xl); padding: 2.5rem;
          display: flex; gap: 3rem; align-items: flex-start;
        }
        .summary-visual { flex-shrink: 0; padding-top: 1rem; }
        .summary-cake-stack { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .summary-tier-block { display: flex; flex-direction: column; align-items: center; }
        .summary-tier-layer { width: 100%; height: 40px; background: var(--gradient-gold); border-radius: var(--radius-sm); opacity: 0.85; }
        .summary-tier-dia { font-size: 0.6rem; color: var(--color-text-muted); margin-top: 1px; }
        .summary-details { flex: 1; }
        .summary-item { margin-bottom: 0.75rem; }
        .summary-label { font-weight: 600; display: block; font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .summary-value { font-size: 0.95rem; }
        .summary-extra { color: var(--color-gold); font-size: 0.8rem; margin-left: 0.4rem; }
        .summary-breakdown { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }
        .sb-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 0.4rem; }
        .summary-total {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 1rem; padding-top: 1rem;
          border-top: 1px solid var(--color-border);
          font-size: 1.1rem; font-weight: 600;
        }

        @media (max-width: 768px) {
          .sizes-grid-3 { grid-template-columns: 1fr; max-width: 360px; margin: 0 auto; }
          .tiers-grid { grid-template-columns: 1fr; max-width: 320px; margin: 0 auto; }
          .decor-grid { grid-template-columns: 1fr; max-width: 360px; margin: 0 auto; }
          .summary-card { flex-direction: column; text-align: center; }
          .summary-total { flex-direction: column; gap: 0.5rem; }
          .step-label { display: none; }
          .floating-price { bottom: 1rem; right: 1rem; padding: 8px 16px; font-size: 0.75rem; }
          .weight-panel { padding: 2rem 1.5rem; }
          .weight-value { font-size: 3rem; }
        }
      `}</style>
    </>
  );
}
