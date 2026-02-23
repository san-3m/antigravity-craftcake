import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const keys = ['delivery_zones', 'shop_lat', 'shop_lng', 'shop_address'];
    const result = {};
    keys.forEach(key => {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      result[key] = row ? row.value : null;
    });

    // Parse delivery_zones JSON
    try {
      result.delivery_zones = JSON.parse(result.delivery_zones);
    } catch {
      result.delivery_zones = [];
    }

    result.shop_lat = parseFloat(result.shop_lat) || 55.720072;
    result.shop_lng = parseFloat(result.shop_lng) || 37.476708;

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch delivery data' }, { status: 500 });
  }
}
