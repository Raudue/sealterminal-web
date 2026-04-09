import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username');
  if (!username) {
    return NextResponse.json({ error: 'Missing username param' }, { status: 400 });
  }

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ available: false, error: 'Invalid format' });
  }

  const sql = getDb();
  const rows = await sql`SELECT id FROM users WHERE username = ${username}`;
  return NextResponse.json({ available: rows.length === 0 });
}

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
  const { username } = body;

  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json({ error: 'Username must be 3-20 characters, alphanumeric and underscores only' }, { status: 400 });
  }

  const sql = getDb();

  // Check uniqueness
  const existing = await sql`SELECT id FROM users WHERE username = ${username} AND id != ${user.id}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  await sql`UPDATE users SET username = ${username} WHERE id = ${user.id}`;

  return NextResponse.json({ success: true, username });
}
