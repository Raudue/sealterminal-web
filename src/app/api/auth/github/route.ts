import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 });
  }

  const deviceCode = request.nextUrl.searchParams.get('device_code') || '';

  // Reserve the device code in DB so we can write the token later
  if (deviceCode) {
    const sql = getDb();
    await sql`
      INSERT INTO pending_logins (code) VALUES (${deviceCode})
      ON CONFLICT (code) DO NOTHING
    `;
  }

  const redirectUri = `${process.env.APP_URL}/api/auth/github/callback`;
  const scope = 'read:user user:email';

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', deviceCode);

  return NextResponse.redirect(url.toString());
}
