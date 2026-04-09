import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Accept token from query param (Electron) or Authorization header (web)
  const queryToken = request.nextUrl.searchParams.get('token');
  const authHeader = request.headers.get('authorization');
  const token = queryToken || authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  const user = await validateSession(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  // Get character_created flag
  const sql = (await import('@/lib/db')).getDb();
  const extra = await sql`SELECT character_created FROM users WHERE id = ${user.id}`;

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    plan: user.plan,
    username: user.username,
    fish: user.fish,
    characterCreated: extra[0]?.character_created || false,
  });
}
