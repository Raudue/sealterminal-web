import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  const deviceCode = request.nextUrl.searchParams.get('device_code') || '';

  if (deviceCode) {
    const sql = getDb();
    await sql`
      INSERT INTO pending_logins (code) VALUES (${deviceCode})
      ON CONFLICT (code) DO NOTHING
    `;
  }

  const redirectUri = `${process.env.APP_URL}/api/auth/google/callback`;

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', deviceCode);

  return NextResponse.redirect(url.toString());
}
