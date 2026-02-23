import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET: public reviews for a product
export async function GET(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const reviews = db.prepare(
      "SELECT id, name, rating, text, created_at FROM reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC"
    ).all(id);
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// POST: submit a new review
export async function POST(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const { name, email, rating, text } = body;
    if (!name || !text) return NextResponse.json({ error: 'Name and text required' }, { status: 400 });

    db.prepare(
      'INSERT INTO reviews (product_id, name, email, rating, text) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name, email || '', Math.min(5, Math.max(1, rating || 5)), text);

    return NextResponse.json({ success: true, message: 'Отзыв отправлен на модерацию' });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
