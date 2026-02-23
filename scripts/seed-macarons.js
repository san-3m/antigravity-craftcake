/**
 * Seed macaron products from photo files.
 *
 * Run:  node scripts/seed-macarons.js
 *
 * This script:
 *  1. Looks up (or creates) the "Макаронс" category.
 *  2. Removes OLD demo macarons (slug starting with "macarons-").
 *  3. Inserts real macaron products with photos, 270 RUB / шт.
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'craftcake.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Category ──────────────────────────────────────────────
let cat = db.prepare("SELECT id FROM categories WHERE slug = 'macarons'").get();
if (!cat) {
  db.prepare("INSERT INTO categories (name, slug, sort_order) VALUES ('Макаронс', 'macarons', 1)").run();
  cat = db.prepare("SELECT id FROM categories WHERE slug = 'macarons'").get();
}
const catId = cat.id;
console.log(`Category "Макаронс" id = ${catId}`);

// ── Delete old demo macarons ─────────────────────────────
const deleted = db.prepare("DELETE FROM products WHERE category_id = ? AND slug LIKE 'macarons-%'").run(catId);
console.log(`Deleted ${deleted.changes} old macaron demo products`);

// ── Product definitions ──────────────────────────────────
// Each entry: [main_photo, razrez_photo | null, russian_name, slug, description]
const macarons = [
  {
    main: 'macarons_arahisovoe_pechenye.jpg',
    razrez: 'macarons_arahisovoe_pechenye_razrez.jpg',
    name: 'Арахисовое печенье',
    slug: 'macarons-arahisovoe-pechenye',
    desc: 'Макаронс со вкусом арахисового печенья. Насыщенная арахисовая начинка и хрустящая текстура.',
  },
  {
    main: 'macarons_bananoviy_raf.jpg',
    razrez: 'macarons_bananoviy_raf_razrez.jpg',
    name: 'Банановый раф',
    slug: 'macarons-bananoviy-raf',
    desc: 'Макаронс с нежным вкусом бананового раф-кофе. Сливочная начинка с банановыми нотками.',
  },
  {
    main: 'makarons_baunti.jpg',
    razrez: 'macarons_baunti_razrez.jpg',
    name: 'Баунти',
    slug: 'macarons-baunti',
    desc: 'Макаронс со вкусом Баунти. Кокосовая начинка с молочным шоколадом.',
  },
  {
    main: 'macarons_dorblu_grusha_grecoreh.jpg',
    razrez: 'macarons_dorblu_grusha_grecoreh_razrez.jpg',
    name: 'Дорблю, груша, грецкий орех',
    slug: 'macarons-dorblu-grusha-grecoreh',
    desc: 'Изысканный макаронс с сыром дорблю, грушей и грецким орехом. Гурманский вкус.',
  },
  {
    main: 'macarons_dubayskiy_shokolad.jpg',
    razrez: 'macarons_dubayskiy_shokolad_razrez.jpg',
    name: 'Дубайский шоколад',
    slug: 'macarons-dubayskiy-shokolad',
    desc: 'Макаронс с дубайским шоколадом. Роскошная шоколадная начинка с фисташкой и кадаифом.',
  },
  {
    main: 'makarons_erl_grej_malina.jpg',
    razrez: 'macarons_erlgrey_malina_razrez.jpg',
    name: 'Эрл Грей, малина',
    slug: 'macarons-erl-grey-malina',
    desc: 'Макаронс с чаем Эрл Грей и малиной. Утончённый бергамотовый аромат с ягодной свежестью.',
  },
  {
    main: 'macarons_fistashkoviy_s_malinoy.jpg',
    razrez: 'macarons_fistashkoviy_s_malinoy_razrez.jpg',
    name: 'Фисташковый с малиной',
    slug: 'macarons-fistashkoviy-s-malinoy',
    desc: 'Фисташковый макаронс с малиновой начинкой. Классическое сочетание фисташки и ягод.',
  },
  {
    main: 'macarons_hvoya_kedroviy_oreh.jpg',
    razrez: 'macarons_hvoya_kedroviy_oreh_razrez.jpg',
    name: 'Хвоя, кедровый орех',
    slug: 'macarons-hvoya-kedroviy-oreh',
    desc: 'Авторский макаронс с хвойным ароматом и кедровым орехом. Лесная свежесть в десерте.',
  },
  {
    main: 'macarons_limonniy_plombir_klubnika.jpg',
    razrez: 'macarons_limonniy_plombir_klubnika_razrez.jpg',
    name: 'Лимонный пломбир, клубника',
    slug: 'macarons-limonniy-plombir-klubnika',
    desc: 'Макаронс со вкусом лимонного пломбира и клубники. Освежающее лимонное мороженое с ягодами.',
  },
  {
    main: 'macarons_molochniy_ulun_klubnika.jpg',
    razrez: 'macarons_molochniy_ulun_klubnika_razrez.jpg',
    name: 'Молочный улун, клубника',
    slug: 'macarons-molochniy-ulun-klubnika',
    desc: 'Макаронс с молочным улуном и клубникой. Чайная нежность и сладкая ягода.',
  },
  {
    main: 'macarons_plombir_shololadnaya_kroshka.jpg',
    razrez: 'macarons_plombir_shokoladnaya_kroshka_razrez.jpg',
    name: 'Пломбир, шоколадная крошка',
    slug: 'macarons-plombir-shokoladnaya-kroshka',
    desc: 'Макаронс со вкусом пломбира и шоколадной крошкой. Мороженое в каждом кусочке.',
  },
  {
    main: 'macarons_pryanaya_vishnya_shokolad.jpg',
    razrez: 'macarons_pryanaya_vishnya_shokolad_razrez.jpg',
    name: 'Пряная вишня, шоколад',
    slug: 'macarons-pryanaya-vishnya-shokolad',
    desc: 'Макаронс с пряной вишней и шоколадом. Терпкая вишнёвая начинка со специями.',
  },
  {
    main: 'macarons_raf_slivochnaya_karamel.jpg',
    razrez: 'macarons_raf_slivochnaya_karamel_razrez.jpg',
    name: 'Раф, сливочная карамель',
    slug: 'macarons-raf-slivochnaya-karamel',
    desc: 'Макаронс со вкусом раф-кофе и сливочной карамелью. Нежный кофейно-карамельный десерт.',
  },
  {
    main: 'macarons_shokolad_klyukva.jpg',
    razrez: 'macarons_shokolad_klyukva_razrez.jpg',
    name: 'Шоколад, клюква',
    slug: 'macarons-shokolad-klyukva',
    desc: 'Шоколадный макаронс с клюквенной начинкой. Шоколад и кислинка ягод.',
  },
  {
    main: 'makarons_snikers.jpg',
    razrez: 'macarons_snikers_razrez.jpg',
    name: 'Сникерс',
    slug: 'macarons-snikers',
    desc: 'Макаронс со вкусом Сникерс. Арахис, карамель и молочный шоколад.',
  },
  {
    main: 'macarons_sol_moloch_shokolad_malina.jpg',
    razrez: 'macarons_sol_moloch_shokolad_malina_razrez.jpg',
    name: 'Солёный молочный шоколад, малина',
    slug: 'macarons-sol-moloch-shokolad-malina',
    desc: 'Макаронс с солёным молочным шоколадом и малиной. Солёно-сладкое наслаждение.',
  },
  {
    main: 'makarons_temn_shokolad_malina.jpg',
    razrez: 'macarons_temn_shokolad_malina_razrez.jpg',
    name: 'Тёмный шоколад, малина',
    slug: 'macarons-temn-shokolad-malina',
    desc: 'Макаронс с тёмным шоколадом и малиной. Горький шоколад и свежая ягода.',
  },
];

// ── Insert ────────────────────────────────────────────────
const insertStmt = db.prepare(`
  INSERT INTO products (name, slug, description, meta_description, keywords, price, unit, category_id, sort_order, images, available)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAll = db.transaction(() => {
  macarons.forEach((m, i) => {
    const fullName = `Макаронс «${m.name}»`;
    const images = [`/uploads/${m.main}`];
    if (m.razrez) images.push(`/uploads/${m.razrez}`);

    insertStmt.run(
      fullName,
      m.slug,
      m.desc,
      `${fullName} — авторский макаронс, 270 ₽/шт`,
      `макаронс, ${m.name.toLowerCase()}, macarons, десерт`,
      270,         // price
      'шт',        // unit
      catId,       // category_id
      i + 1,       // sort_order
      JSON.stringify(images),
    );
    console.log(`  ✓ ${fullName}`);
  });
});

insertAll();
console.log(`\nInserted ${macarons.length} macaron products @ 270 ₽/шт`);
db.close();
