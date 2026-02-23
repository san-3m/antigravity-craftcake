import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const cat = searchParams.get('cat');
    const limit = parseInt(searchParams.get('limit')) || 100;
    const search = searchParams.get('q');

    let query = 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.available = 1';
    const params = [];

    if (cat) {
      query += ' AND c.slug = ?';
      params.push(cat);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.sort_order ASC LIMIT ?';
    params.push(limit);

    const products = db.prepare(query).all(...params);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { items, customer_name, customer_phone, customer_email, delivery_method, delivery_address, delivery_cost, payment_method, comment } = body;

    if (!items || !customer_name || !customer_phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderNumber = 'CC-' + Date.now().toString(36).toUpperCase();
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryCost = delivery_method === 'delivery' ? (parseFloat(delivery_cost) || 0) : 0;
    const total = subtotal + deliveryCost;

    const result = db.prepare(`
      INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, delivery_method, delivery_address, payment_method, items, subtotal, delivery_cost, total, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderNumber, customer_name, customer_phone, customer_email || '', delivery_method || 'pickup', delivery_address || '', payment_method || 'cash', JSON.stringify(items), subtotal, deliveryCost, total, comment || '');

    return NextResponse.json({ id: result.lastInsertRowid, order_number: orderNumber, total });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
