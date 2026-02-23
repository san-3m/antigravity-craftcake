/**
 * Seed dessert (десерты) products from photo files.
 *
 * Run:  node scripts/seed-deserty.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'craftcake.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const catId = 3; // Десерты
console.log(`Category "Десерты" id = ${catId}`);

// Delete old demo desserts
const deleted = db.prepare("DELETE FROM products WHERE category_id = ?").run(catId);
console.log(`Deleted ${deleted.changes} old dessert products`);

const desserts = [
  {
    images: ['anna_pavlova.jpg', 'anna_pavlova1.jpg', 'anna_pavlova2.jpg', 'anna_pavlova3.jpg'],
    name: 'Анна Павлова',
    slug: 'desert-anna-pavlova',
    desc: 'Классический десерт Анна Павлова — воздушная меренга с нежным кремом и свежими ягодами.',
    price: 450,
  },
  {
    images: ['bananoviy_keks.jpg', 'bananoviy_keks2.jpg', 'bananoviy_keks3.jpg'],
    name: 'Банановый кекс',
    slug: 'desert-bananoviy-keks',
    desc: 'Нежный банановый кекс с насыщенным вкусом спелых бананов и влажной текстурой.',
    price: 350,
  },
  {
    images: ['kartoshka.jpg', 'kartoshka1.jpg', 'kartoshka2.jpg', 'kartoshka3.jpg'],
    name: 'Картошка',
    slug: 'desert-kartoshka',
    desc: 'Авторская пирожное «Картошка» — классический десерт с шоколадным вкусом и кремовой начинкой.',
    price: 250,
  },
  {
    images: ['merengoviy_rulet.jpg', 'merengoviy_rulet1.jpg', 'merengoviy_rulet2.jpg'],
    name: 'Меренговый рулет',
    slug: 'desert-merengoviy-rulet',
    desc: 'Воздушный меренговый рулет с нежной начинкой. Хрустящая корочка и мягкая середина.',
    price: 500,
  },
  {
    images: ['napoleon.jpg'],
    name: 'Наполеон',
    slug: 'desert-napoleon',
    desc: 'Классический торт Наполеон — слоёное тесто с нежным заварным кремом.',
    price: 450,
  },
  {
    images: ['profitrol.jpg', 'profitrol1.jpg'],
    name: 'Профитроли',
    slug: 'desert-profitrol',
    desc: 'Нежные профитроли из заварного теста с кремовой начинкой.',
    price: 300,
  },
  {
    images: ['tort_shoko_vishnya.jpg', 'tort_shoko_vishnya1.jpg'],
    name: 'Шоколад и вишня',
    slug: 'desert-shoko-vishnya',
    desc: 'Десерт с насыщенным шоколадом и спелой вишней. Классическое сочетание вкусов.',
    price: 400,
  },
];

// Insert
const insertStmt = db.prepare(`
  INSERT INTO products (name, slug, description, meta_description, keywords, price, unit, category_id, sort_order, images, available)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAll = db.transaction(() => {
  desserts.forEach((d, i) => {
    const fullName = d.name;
    const imagesPaths = d.images.map(img => `/uploads/${img}`);

    insertStmt.run(
      fullName,
      d.slug,
      d.desc,
      `${fullName} — авторский десерт от Craftcake`,
      `десерт, ${d.name.toLowerCase()}, кондитерская, выпечка`,
      d.price,
      'шт',
      catId,
      i + 1,
      JSON.stringify(imagesPaths),
    );
    console.log(`  ✓ ${fullName} (${d.images.length} фото, ${d.price} ₽)`);
  });
});

insertAll();
console.log(`\nInserted ${desserts.length} dessert products`);
db.close();
