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

// GET all reviews with product names
export async function GET(request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const reviews = db.prepare(`
    SELECT r.*, p.name as product_name 
    FROM reviews r LEFT JOIN products p ON r.product_id = p.id 
    ORDER BY r.created_at DESC
  `).all();
  return NextResponse.json(reviews);
}

// PUT: update review status / edit text
export async function PUT(request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const body = await request.json();
  const { id, status, text } = body;
  if (status) db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, id);
  if (text !== undefined) db.prepare('UPDATE reviews SET text = ? WHERE id = ?').run(text, id);
  return NextResponse.json({ success: true });
}

// DELETE: remove review
export async function DELETE(request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
