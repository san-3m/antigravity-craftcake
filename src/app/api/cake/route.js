import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const fillings = db.prepare('SELECT * FROM cake_fillings WHERE available = 1 ORDER BY sort_order ASC').all();

    // Get cake pricing settings
    const settingKeys = ['cake_price_per_kg', 'cake_berries_price', 'cake_fondant_price', 'cake_flowers_price'];
    const pricing = {};
    settingKeys.forEach(key => {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      pricing[key] = row ? parseFloat(row.value) : 0;
    });

    return NextResponse.json({ fillings, pricing });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cake data' }, { status: 500 });
  }
}
