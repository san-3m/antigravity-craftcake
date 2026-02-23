import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { generateSlug } from '@/lib/security';

export async function GET(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const cat = searchParams.get('category');
    const search = searchParams.get('search');
    const showAll = searchParams.get('all') === '1';

    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    if (cat) { query += ' AND p.category_id = ?'; params.push(cat); }
    if (search) { query += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY p.sort_order ASC';
    const products = db.prepare(query).all(...params);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const body = await request.json();
    const { name, description, meta_description, keywords, price, unit, category_id, images } = body;

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const slug = generateSlug(name) + '-' + Date.now().toString(36);
    const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM products').get().m || 0;

    const result = db.prepare(`
      INSERT INTO products (name, slug, description, meta_description, keywords, price, unit, category_id, images, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, slug, description || '', meta_description || '', keywords || '', price || 0, unit || 'шт', category_id || null, JSON.stringify(images || []), maxOrder + 1);

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
