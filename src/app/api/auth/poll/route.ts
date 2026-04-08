import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT token FROM pending_logins
    WHERE code = ${code} AND token IS NOT NULL
  `;

  if (rows.length === 0) {
    return NextResponse.json({ status: 'pending' });
  }

  const token = rows[0].token;

  // Clean up — one-time use
  await sql`DELETE FROM pending_logins WHERE code = ${code}`;

  return NextResponse.json({ status: 'complete', token });
}
