import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const body = await request.json();
    const { action, ids, value } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No items selected' }, { status: 400 });
    }

    const placeholders = ids.map(() => '?').join(',');

    switch (action) {
      case 'price':
        if (value === undefined) return NextResponse.json({ error: 'Price value required' }, { status: 400 });
        db.prepare(`UPDATE products SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(value, ...ids);
        break;
      case 'price_percent':
        if (value === undefined) return NextResponse.json({ error: 'Percent value required' }, { status: 400 });
        db.prepare(`UPDATE products SET price = ROUND(price * (1 + ? / 100.0), 2), updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(value, ...ids);
        break;
      case 'category':
        db.prepare(`UPDATE products SET category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(value, ...ids);
        break;
      case 'available':
        db.prepare(`UPDATE products SET available = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(value ? 1 : 0, ...ids);
        break;
      case 'delete':
        db.prepare(`DELETE FROM products WHERE id IN (${placeholders})`).run(...ids);
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Bulk operation failed' }, { status: 500 });
  }
}
