/**
 * Seed mochi (моти) products from photo files.
 *
 * Run:  node scripts/seed-moti.js
 *
 * Each product gets 3 photos: main, razrez (single), razrez2 (double).
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'craftcake.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const catId = 4; // Моти
console.log(`Category "Моти" id = ${catId}`);

// Delete old demo moti
const deleted = db.prepare("DELETE FROM products WHERE category_id = ? AND slug LIKE 'moti-%'").run(catId);
console.log(`Deleted ${deleted.changes} old moti demo products`);

const motiProducts = [
  {
    main: 'moti_bubble_gum.jpg',
    razrez: 'moti_bubble_gum_razrez.jpg',
    razrez2: 'moti_bubble_gum_razrez2.jpg',
    name: 'Бабл Гам',
    slug: 'moti-bubble-gum',
    desc: 'Моти со вкусом жевательной резинки Бабл Гам. Яркий и сладкий вкус детства.',
  },
  {
    main: 'moti_dorblu_grusha_grecoreh.jpg',
    razrez: 'moti_dorblu_grusha_grecoreh_razrez.jpg',
    razrez2: 'moti_dorblu_grusha_grecoreh_razrez2.jpg',
    name: 'Дорблю, груша, грецкий орех',
    slug: 'moti-dorblu-grusha-grecoreh',
    desc: 'Изысканный моти с сыром дорблю, грушей и грецким орехом. Гурманское сочетание.',
  },
  {
    main: 'moti_fistashka_vishnya.jpg',
    razrez: 'moti_fistashka_vishnya_razrez.jpg',
    razrez2: 'moti_fistashka_vishnya_razrez2.jpg',
    name: 'Фисташка, вишня',
    slug: 'moti-fistashka-vishnya',
    desc: 'Моти с фисташковой начинкой и вишней. Классическое сочетание орехов и ягод.',
  },
  {
    main: 'moti_klubnichniy_milkshake.jpg',
    razrez: 'moti_klubnichniy_milkshake_razrez.jpg',
    razrez2: 'moti_klubnichniy_milkshake_razrez2.jpg',
    name: 'Клубничный милкшейк',
    slug: 'moti-klubnichniy-milkshake',
    desc: 'Моти со вкусом клубничного молочного коктейля. Нежная сливочно-ягодная начинка.',
  },
  {
    main: 'moti_mak_limon.jpg',
    razrez: 'moti_mak_limon_razrez.jpg',
    razrez2: 'moti_mak_limon_razrez2.jpg',
    name: 'Мак, лимон',
    slug: 'moti-mak-limon',
    desc: 'Моти с маком и лимоном. Маковая начинка с цитрусовой свежестью.',
  },
  {
    main: 'moti_medovik.jpg',
    razrez: 'moti_medovik_razrez.jpg',
    razrez2: 'moti_medovik_razrez2.jpg',
    name: 'Медовик',
    slug: 'moti-medovik',
    desc: 'Моти со вкусом медовика. Медовая начинка с нотками классического торта.',
  },
  {
    main: 'moti_nezhnaya_klyukva.jpg',
    razrez: 'moti_nezhnaya_klyukva_razrez.jpg',
    razrez2: 'moti_nezhnaya_klyukva_razrez2.jpg',
    name: 'Нежная клюква',
    slug: 'moti-nezhnaya-klyukva',
    desc: 'Моти с нежной клюквенной начинкой. Ягодная свежесть в каждом кусочке.',
  },
  {
    main: 'moti_oblepihoviy_plombir.jpg',
    razrez: 'moti_oblepihoviy_plombir_razrez.jpg',
    razrez2: 'moti_oblepihoviy_plombir_razrez2.jpg',
    name: 'Облепиховый пломбир',
    slug: 'moti-oblepihoviy-plombir',
    desc: 'Моти со вкусом облепихового пломбира. Яркая облепиха и сливочное мороженое.',
  },
  {
    main: 'moti_shokolad_malina.jpg',
    razrez: 'moti_shokolad_malina_razrez.jpg',
    razrez2: 'moti_shokolad_malina_razrez2.jpg',
    name: 'Шоколад, малина',
    slug: 'moti-shokolad-malina',
    desc: 'Шоколадный моти с малиновой начинкой. Насыщенный шоколад и свежая ягода.',
  },
  {
    main: 'moti_shokoladniy_krispi.jpg',
    razrez: 'moti_shokoladniy_krispi_razrez.jpg',
    razrez2: 'moti_shokoladniy_krispi_razrez2.jpg',
    name: 'Шоколадный криспи',
    slug: 'moti-shokoladniy-krispi',
    desc: 'Моти с шоколадным криспи. Хрустящая текстура и нежный шоколад.',
  },
  {
    main: 'moti_limon_klubnika_razrez.jpg',
    razrez: 'moti_limon_klubnika_razrez2.jpg',
    razrez2: null,
    name: 'Лимон, клубника',
    slug: 'moti-limon-klubnika',
    desc: 'Моти с лимоном и клубникой. Цитрусовая свежесть и сладкая ягода.',
  },
  {
    main: 'moti_mango_klubnika_razrez.jpg',
    razrez: 'moti_mango_klubnika_razrez2.jpg',
    razrez2: null,
    name: 'Манго, клубника',
    slug: 'moti-mango-klubnika',
    desc: 'Моти с манго и клубникой. Тропический манго и сочная клубника.',
  },
];

// Insert
const insertStmt = db.prepare(`
  INSERT INTO products (name, slug, description, meta_description, keywords, price, unit, category_id, sort_order, images, available)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAll = db.transaction(() => {
  motiProducts.forEach((m, i) => {
    const fullName = `Моти «${m.name}»`;
    const images = [`/uploads/${m.main}`];
    if (m.razrez) images.push(`/uploads/${m.razrez}`);
    if (m.razrez2) images.push(`/uploads/${m.razrez2}`);

    insertStmt.run(
      fullName,
      m.slug,
      m.desc,
      `${fullName} — авторский моти, 270 ₽/шт`,
      `моти, ${m.name.toLowerCase()}, mochi, десерт`,
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
console.log(`\nInserted ${motiProducts.length} moti products @ 270 ₽/шт`);
db.close();
