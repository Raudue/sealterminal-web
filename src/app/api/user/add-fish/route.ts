import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  const user = await validateSession(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const body = await request.json();
  const amount = Number(body.amount);

  if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
    return NextResponse.json({ error: 'Amount must be integer 1-1000' }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`UPDATE users SET fish = fish + ${amount} WHERE id = ${user.id} RETURNING fish`;

  return NextResponse.json({ fish: rows[0].fish });
}
