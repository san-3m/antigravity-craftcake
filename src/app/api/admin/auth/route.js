import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';
import { rateLimit } from '@/lib/security';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`login-${ip}`, 5, 60000)) {
      return NextResponse.json({ error: 'Слишком много попыток. Подождите минуту.' }, { status: 429 });
    }

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, 'admin');
    if (!user || !comparePassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    const token = generateToken(user);
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
