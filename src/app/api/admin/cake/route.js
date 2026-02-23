import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    return NextResponse.json({
      sizes: db.prepare('SELECT * FROM cake_sizes ORDER BY sort_order ASC').all(),
      fillings: db.prepare('SELECT * FROM cake_fillings ORDER BY sort_order ASC').all(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    const body = await request.json();
    if (body.type === 'size') {
      const { name, diameter, servings, price } = body;
      const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM cake_sizes').get().m || 0;
      const r = db.prepare('INSERT INTO cake_sizes (name, diameter, servings, price, sort_order) VALUES (?, ?, ?, ?, ?)').run(name, diameter || '', servings || '', price || 0, maxOrder + 1);
      return NextResponse.json({ id: r.lastInsertRowid });
    } else {
      const { name, description, image, price_modifier } = body;
      const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM cake_fillings').get().m || 0;
      const r = db.prepare('INSERT INTO cake_fillings (name, description, image, price_modifier, sort_order) VALUES (?, ?, ?, ?, ?)').run(name, description || '', image || '', price_modifier || 0, maxOrder + 1);
      return NextResponse.json({ id: r.lastInsertRowid });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    const body = await request.json();
    if (body.type === 'size') {
      const { id, name, diameter, servings, price } = body;
      db.prepare('UPDATE cake_sizes SET name=?, diameter=?, servings=?, price=? WHERE id=?').run(name, diameter, servings, price, id);
    } else {
      const { id, name, description, image, price_modifier, available } = body;
      db.prepare('UPDATE cake_fillings SET name=?, description=?, image=?, price_modifier=?, available=? WHERE id=?').run(name, description, image || '', price_modifier || 0, available !== undefined ? available : 1, id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    if (type === 'size') db.prepare('DELETE FROM cake_sizes WHERE id = ?').run(id);
    else db.prepare('DELETE FROM cake_fillings WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
