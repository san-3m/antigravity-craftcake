import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total), 0) as s FROM orders').get().s;
    const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
    const totalCustomers = db.prepare('SELECT COUNT(*) as c FROM orders WHERE customer_email != ""').get().c;
    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10').all();
    const topProducts = db.prepare(`
      SELECT name, price, available FROM products ORDER BY sort_order ASC LIMIT 5
    `).all();
    const ordersByStatus = db.prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status').all();
    return NextResponse.json({ totalOrders, totalRevenue, totalProducts, totalCustomers, recentOrders, topProducts, ordersByStatus });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
