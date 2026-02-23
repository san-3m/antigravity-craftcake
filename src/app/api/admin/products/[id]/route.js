import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const { id } = await params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order').all(id);
    return NextResponse.json({ ...product, variants });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();

    // Handle availability toggle
    if (body.toggle_available !== undefined) {
      db.prepare('UPDATE products SET available = NOT available, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
      return NextResponse.json({ success: true });
    }

    // Handle inline price update
    if (body.inline_price !== undefined) {
      db.prepare('UPDATE products SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(body.inline_price, id);
      return NextResponse.json({ success: true });
    }

    // Handle full update
    const { name, description, meta_description, keywords, price, unit, category_id, images, available, sort_order, variants } = body;
    db.prepare(`
      UPDATE products SET name=?, description=?, meta_description=?, keywords=?, price=?, unit=?, category_id=?, images=?, available=?, sort_order=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(name, description || '', meta_description || '', keywords || '', price || 0, unit || 'шт', category_id || null, JSON.stringify(images || []), available !== undefined ? available : 1, sort_order || 0, id);

    // Save variants
    if (variants !== undefined) {
      db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
      const insertVariant = db.prepare('INSERT INTO product_variants (product_id, name, sku, price, old_price, unit, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
      (variants || []).forEach((v, idx) => {
        insertVariant.run(id, v.name || '', v.sku || '', v.price || 0, v.old_price || null, v.unit || 'шт', idx);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const { id } = await params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
