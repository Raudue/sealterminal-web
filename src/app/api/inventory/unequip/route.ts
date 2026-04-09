import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const body = await request.json();
  const { itemId } = body;
  if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });

  const sql = getDb();
  await sql`UPDATE user_items SET equipped = false WHERE user_id = ${user.id} AND item_id = ${itemId}`;

  return NextResponse.json({ success: true });
}
