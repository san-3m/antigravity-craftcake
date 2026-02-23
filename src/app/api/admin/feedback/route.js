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
  const feedback = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
  return NextResponse.json(feedback);
}

export async function PUT(request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const body = await request.json();
  const { id, status, message } = body;
  if (status) db.prepare('UPDATE feedback SET status = ? WHERE id = ?').run(status, id);
  if (message !== undefined) db.prepare('UPDATE feedback SET message = ? WHERE id = ?').run(message, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  db.prepare('DELETE FROM feedback WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
