import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function verifyAdmin(request) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  try {
    const jwt = require('jsonwebtoken');
    jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'craftcake-secret-key-2024');
    return true;
  } catch { return false; }
}

export async function GET(request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const customers = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
  return NextResponse.json(customers);
}

export async function POST(request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const body = await request.json();
  const { name, email, phone } = body;
  db.prepare('INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)').run(name || '', email || '', phone || '');
  return NextResponse.json({ success: true });
}

export async function PUT(request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const body = await request.json();
  const { id, name, email, phone, bonus_points } = body;
  db.prepare('UPDATE customers SET name = ?, email = ?, phone = ?, bonus_points = ? WHERE id = ?')
    .run(name || '', email || '', phone || '', bonus_points || 0, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
