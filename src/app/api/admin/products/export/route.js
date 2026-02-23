import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const products = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.sort_order ASC').all();

    const headers = ['ID', 'Название', 'Описание', 'Мета-описание', 'Ключевые слова', 'Цена', 'Единица', 'Категория', 'В наличии', 'Дата создания'];
    const rows = products.map(p => [
      p.id, p.name, p.description, p.meta_description, p.keywords, p.price, p.unit, p.category_name || '', p.available ? 'Да' : 'Нет', p.created_at
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=products.csv',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
