const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(process.cwd(), 'data', 'craftcake.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      meta_description TEXT DEFAULT '',
      keywords TEXT DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'шт',
      category_id INTEGER,
      available INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      images TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      sku TEXT DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      old_price REAL DEFAULT NULL,
      unit TEXT DEFAULT 'шт',
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cake_sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      diameter TEXT DEFAULT '',
      servings TEXT DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cake_fillings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      price_modifier REAL DEFAULT 0,
      available INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT DEFAULT '',
      delivery_method TEXT DEFAULT 'pickup',
      delivery_address TEXT DEFAULT '',
      payment_method TEXT DEFAULT 'cash',
      status TEXT DEFAULT 'new',
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL DEFAULT 0,
      delivery_cost REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      comment TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      role TEXT DEFAULT 'customer',
      referral_code TEXT UNIQUE,
      referred_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT DEFAULT '',
      meta_description TEXT DEFAULT '',
      published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      type TEXT DEFAULT 'percent',
      value REAL DEFAULT 0,
      min_order REAL DEFAULT 0,
      max_uses INTEGER DEFAULT 0,
      used_count INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT DEFAULT '',
      subscribed INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      short_name TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      rating INTEGER DEFAULT 5,
      text TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      total_spent REAL DEFAULT 0,
      orders_count INTEGER DEFAULT 0,
      bonus_points REAL DEFAULT 0,
      referral_code TEXT DEFAULT '',
      referred_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin user if not exists
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
      'admin@craftcake.ru', hash, 'Администратор', 'admin'
    );
  }

  // Seed default categories
  const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
  if (catCount === 0) {
    const cats = [
      { name: 'Макаронс', slug: 'macarons', sort_order: 1 },
      { name: 'Торты', slug: 'torty', sort_order: 2 },
      { name: 'Десерты', slug: 'deserty', sort_order: 3 },
      { name: 'Моти', slug: 'moti', sort_order: 4 },
      { name: 'Наборы', slug: 'nabory', sort_order: 5 },
    ];
    const stmt = db.prepare('INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)');
    cats.forEach(c => stmt.run(c.name, c.slug, c.sort_order));
  }

  // Seed default settings
  const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get().c;
  if (settingsCount === 0) {
    const defaults = {
      'shop_name': 'Craftcake',
      'shop_subtitle': 'Мастерская десертов',
      'shop_description': 'Кондитерская в Москве — макаронс, торты, десерты, моти',
      'shop_phone': '+7 (999) 123-45-67',
      'shop_email': 'hello@craftcake.ru',
      'shop_address': 'г. Москва, ул. Верейская, д. 29с134',
      'shop_instagram': '@craftcake_msk',
      'shop_telegram': '@craftcake',
      'delivery_enabled': '1',
      'delivery_free_from': '3000',
      'delivery_cost': '500',
      'delivery_zone': 'Москва и ближнее Подмосковье',
      'pickup_enabled': '1',
      'pickup_address': 'г. Москва, ул. Верейская, д. 29с134',
      'payment_cash': '1',
      'payment_card': '1',
      'payment_online': '0',
      'seo_title': 'Craftcake — Мастерская десертов в Москве',
      'seo_description': 'Авторские десерты, торты на заказ, макаронс и моти. Доставка по Москве.',
      'seo_keywords': 'торты на заказ, макаронс, десерты москва, моти, кондитерская',
      'privacy_policy': 'Политика конфиденциальности магазина Craftcake...',
      'primary_color': '#1a1a2e',
      'accent_color': '#c9a84c',
      'registration_enabled': '1',
      'newsletter_enabled': '1',
      'referral_enabled': '1',
      'referral_discount': '10',
      'cake_price_per_kg': '2500',
      'cake_berries_price': '500',
      'cake_fondant_price': '800',
      'cake_flowers_price': '1500',
      'delivery_zones': JSON.stringify([
        { from: 0, to: 3, price: 700, color: '#4CAF50' },
        { from: 3, to: 6, price: 900, color: '#8BC34A' },
        { from: 6, to: 10, price: 1200, color: '#FFC107' },
        { from: 10, to: 16, price: 1500, color: '#FF9800' },
        { from: 16, to: 21, price: 2000, color: '#FF5722' },
        { from: 21, to: 27, price: 2500, color: '#F44336' },
      ]),
      'shop_lat': '55.720072',
      'shop_lng': '37.476708',
      'shop_address': 'г. Москва, ул. Верейская, д. 29с134',
    };
    const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    Object.entries(defaults).forEach(([k, v]) => stmt.run(k, v));
  }

  // Ensure cake pricing settings exist (migration for existing DBs)
  const cakePriceSettings = {
    'cake_price_per_kg': '2500',
    'cake_berries_price': '500',
    'cake_fondant_price': '800',
    'cake_flowers_price': '1500',
  };
  const insertIfMissing = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  Object.entries(cakePriceSettings).forEach(([k, v]) => insertIfMissing.run(k, v));

  // Ensure delivery settings exist (migration for existing DBs)
  const deliveryDefaults = {
    'delivery_zones': JSON.stringify([
      { from: 0, to: 3, price: 700, color: '#4CAF50' },
      { from: 3, to: 6, price: 900, color: '#8BC34A' },
      { from: 6, to: 10, price: 1200, color: '#FFC107' },
      { from: 10, to: 16, price: 1500, color: '#FF9800' },
      { from: 16, to: 21, price: 2000, color: '#FF5722' },
      { from: 21, to: 27, price: 2500, color: '#F44336' },
    ]),
    'shop_lat': '55.720072',
    'shop_lng': '37.476708',
    'shop_address': 'г. Москва, ул. Верейская, д. 29с134',
  };
  Object.entries(deliveryDefaults).forEach(([k, v]) => insertIfMissing.run(k, v));

  // Fix old placeholder addresses
  db.prepare("UPDATE settings SET value = ? WHERE key = 'shop_address' AND value LIKE '%Кондитерская%'").run('г. Москва, ул. Верейская, д. 29с134');
  db.prepare("UPDATE settings SET value = ? WHERE key = 'pickup_address' AND value LIKE '%Кондитерская%'").run('г. Москва, ул. Верейская, д. 29с134');

  // Loyalty / discount system settings
  const loyaltyDefaults = {
    'discount_mode': 'combined',
    'order_discounts': JSON.stringify([
      { name: '10000', from: 10000, to: 19999, percent: 5 },
      { name: '20000', from: 20000, to: 29999, percent: 10 },
      { name: '30000', from: 30000, to: 39999, percent: 15 },
    ]),
    'cumulative_discounts': JSON.stringify([
      { threshold: 10000, percent: 1 },
      { threshold: 20000, percent: 3 },
      { threshold: 30000, percent: 5 },
      { threshold: 50000, percent: 10 },
    ]),
    'bonus_earn_percent': '1',
    'bonus_use_limit': '50',
    'bonus_page_url': 'bonus',
    'referral_earn_percent': '0',
    'referral_cookie_days': '365',
    'referral_page_url': 'partners',
  };
  Object.entries(loyaltyDefaults).forEach(([k, v]) => insertIfMissing.run(k, v));

  // SEO settings
  const seoDefaults = {
    'yandex_metrika_id': '',
    'google_analytics_id': '',
    'script_header': '',
    'script_footer': '',
    'meta_title_template': '',
    'robots_txt': 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml',
    'canonical_filter_pages': 'nocanonical',
  };
  Object.entries(seoDefaults).forEach(([k, v]) => insertIfMissing.run(k, v));

  // Admin recovery email
  insertIfMissing.run('admin_recovery_email', '');

  // Seed default units
  const unitCount = db.prepare('SELECT COUNT(*) as c FROM units').get().c;
  if (unitCount === 0) {
    const units = [
      { name: 'Штука', short_name: 'шт' },
      { name: 'Килограмм', short_name: 'кг' },
      { name: 'Набор', short_name: 'набор' },
      { name: 'Порция', short_name: 'порц' },
    ];
    const stmt = db.prepare('INSERT INTO units (name, short_name) VALUES (?, ?)');
    units.forEach(u => stmt.run(u.name, u.short_name));
  }

  // Seed default cake sizes and fillings
  const sizeCount = db.prepare('SELECT COUNT(*) as c FROM cake_sizes').get().c;
  if (sizeCount === 0) {
    const sizes = [
      { name: 'Мини', diameter: '14 см', servings: '4-6', price: 2500, sort_order: 1 },
      { name: 'Средний', diameter: '18 см', servings: '8-10', price: 3800, sort_order: 2 },
      { name: 'Большой', diameter: '22 см', servings: '12-16', price: 5200, sort_order: 3 },
      { name: 'Премиум', diameter: '26 см', servings: '18-24', price: 7500, sort_order: 4 },
    ];
    const stmt = db.prepare('INSERT INTO cake_sizes (name, diameter, servings, price, sort_order) VALUES (?, ?, ?, ?, ?)');
    sizes.forEach(s => stmt.run(s.name, s.diameter, s.servings, s.price, s.sort_order));
  }

  const fillingCount = db.prepare('SELECT COUNT(*) as c FROM cake_fillings').get().c;
  if (fillingCount === 0) {
    const fillings = [
      { name: 'Ванильный с малиной', description: 'Нежный ванильный бисквит с малиновым конфитюром и сливочным кремом', price_modifier: 0, sort_order: 1 },
      { name: 'Шоколадный трюфель', description: 'Шоколадный бисквит с трюфельным ганашем и вишнёвым джемом', price_modifier: 300, sort_order: 2 },
      { name: 'Карамельно-ореховый', description: 'Ореховый бисквит с солёной карамелью и фундучным пралине', price_modifier: 400, sort_order: 3 },
      { name: 'Фисташка-клубника', description: 'Фисташковый бисквит со свежей клубникой и фисташковым кремом', price_modifier: 500, sort_order: 4 },
      { name: 'Манго-маракуйя', description: 'Тропический бисквит с курдом манго-маракуйя и кокосовым кремом', price_modifier: 350, sort_order: 5 },
      { name: 'Красный бархат', description: 'Классический Red Velvet с кремом на основе маскарпоне', price_modifier: 200, sort_order: 6 },
    ];
    const stmt = db.prepare('INSERT INTO cake_fillings (name, description, price_modifier, sort_order) VALUES (?, ?, ?, ?)');
    fillings.forEach(f => stmt.run(f.name, f.description, f.price_modifier, f.sort_order));
  }

  // Seed sample products
  const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (prodCount === 0) {
    const products = [
      { name: 'Макаронс Классик', slug: 'macarons-classic', description: 'Нежные французские макаронс с разнообразными начинками. В наборе 6 штук: ваниль, шоколад, фисташка, малина, лаванда, карамель.', meta_description: 'Французские макаронс с натуральными начинками — набор 6 штук', keywords: 'макаронс, macarons, французские, набор', price: 890, unit: 'набор', category_id: 1, sort_order: 1 },
      { name: 'Макаронс Премиум', slug: 'macarons-premium', description: 'Премиальная коллекция макаронс с эксклюзивными вкусами: трюфель, шампанское, розовый личи, маракуйя, фиалка, золотая карамель.', meta_description: 'Премиальные макаронс с эксклюзивными вкусами — набор 6 штук', keywords: 'макаронс премиум, эксклюзивные вкусы', price: 1290, unit: 'набор', category_id: 1, sort_order: 2 },
      { name: 'Торт "Наполеон"', slug: 'tort-napoleon', description: 'Классический торт Наполеон с хрустящими слоями и нежнейшим кремом. Готовится из натурального сливочного масла.', meta_description: 'Классический торт Наполеон на заказ в Москве', keywords: 'торт наполеон, классический торт, заказать торт', price: 3200, unit: 'кг', category_id: 2, sort_order: 1 },
      { name: 'Торт "Прага"', slug: 'tort-praga', description: 'Шоколадный торт Прага — густой шоколадный вкус с абрикосовой прослойкой и шоколадной глазурью.', meta_description: 'Шоколадный торт Прага на заказ — доставка по Москве', keywords: 'торт прага, шоколадный торт', price: 2800, unit: 'кг', category_id: 2, sort_order: 2 },
      { name: 'Чизкейк Нью-Йорк', slug: 'cheesecake-new-york', description: 'Классический нью-йоркский чизкейк с нежнейшей текстурой и лёгкой кислинкой. На основе сливочного сыра Филадельфия.', meta_description: 'Чизкейк Нью-Йорк — классический рецепт с Филадельфией', keywords: 'чизкейк, нью-йорк, десерт', price: 650, unit: 'порц', category_id: 3, sort_order: 1 },
      { name: 'Тирамису', slug: 'tiramisu', description: 'Итальянский десерт тирамису с маскарпоне, савоярди и натуральным эспрессо. Без добавления алкоголя.', meta_description: 'Тирамису — итальянский десерт с маскарпоне', keywords: 'тирамису, итальянский десерт, маскарпоне', price: 580, unit: 'порц', category_id: 3, sort_order: 2 },
      { name: 'Панна Котта', slug: 'panna-kotta', description: 'Нежная итальянская панна котта со свежими ягодами и ванильным соусом.', meta_description: 'Панна котта — нежный итальянский десерт', keywords: 'панна котта, десерт, ванильный', price: 450, unit: 'порц', category_id: 3, sort_order: 3 },
      { name: 'Моти Манго', slug: 'moti-mango', description: 'Японские рисовые пирожные моти с начинкой из сочного манго. Гладкая рисовая оболочка и яркий тропический вкус.', meta_description: 'Моти с манго — японские рисовые пирожные', keywords: 'моти, манго, японские десерты, mochi', price: 320, unit: 'шт', category_id: 4, sort_order: 1 },
      { name: 'Моти Матча', slug: 'moti-matcha', description: 'Моти со вкусом японского чая матча. Тонкий вкус зелёного чая в нежной рисовой оболочке.', meta_description: 'Моти матча — японский десерт с зелёным чаем', keywords: 'моти, матча, зелёный чай, mochi', price: 350, unit: 'шт', category_id: 4, sort_order: 2 },
      { name: 'Моти Клубника', slug: 'moti-klubnika', description: 'Классические моти с начинкой из свежей клубники. Нежная рисовая оболочка и ягодная свежесть.', meta_description: 'Моти с клубникой — свежий японский десерт', keywords: 'моти, клубника, японские десерты', price: 300, unit: 'шт', category_id: 4, sort_order: 3 },
      { name: 'Эклер Ваниль', slug: 'ekler-vanil', description: 'Классический французский эклер с ванильным кремом и шоколадной глазурью.', meta_description: 'Эклер ваниль — французская классика', keywords: 'эклер, ваниль, французская выпечка', price: 280, unit: 'шт', category_id: 3, sort_order: 4 },
      { name: 'Круассан с миндалём', slug: 'kruassan-mindal', description: 'Свежий круассан с миндальным кремом и хрустящей миндальной крошкой сверху.', meta_description: 'Круассан с миндальным кремом', keywords: 'круассан, миндаль, выпечка', price: 350, unit: 'шт', category_id: 3, sort_order: 5 },
    ];
    const stmt = db.prepare('INSERT INTO products (name, slug, description, meta_description, keywords, price, unit, category_id, sort_order, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    products.forEach(p => stmt.run(p.name, p.slug, p.description, p.meta_description, p.keywords, p.price, p.unit, p.category_id, p.sort_order, '[]'));
  }
}

module.exports = { getDb };
