import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ valid: false, error: 'Missing code' });

  const sql = getDb();
  const rows = await sql`SELECT username FROM users WHERE referral_code = ${code.toUpperCase()}`;

  if (rows.length === 0) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, username: rows[0].username });
}
