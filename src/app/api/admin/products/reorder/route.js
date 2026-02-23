import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const { items } = await request.json();
    if (!items || !Array.isArray(items)) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    const stmt = db.prepare('UPDATE products SET sort_order = ? WHERE id = ?');
    const updateMany = db.transaction((items) => {
      items.forEach((item, index) => stmt.run(index, item.id));
    });
    updateMany(items);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}
