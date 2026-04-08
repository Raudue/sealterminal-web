import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUser, createSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const deviceCode = request.nextUrl.searchParams.get('state') || '';

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error_description }, { status: 400 });
    }

    const accessToken: string = tokenData.access_token;

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const gUser = await userRes.json();

    if (!gUser.email) {
      return NextResponse.json({ error: 'Could not get email from Google' }, { status: 400 });
    }

    // Create or find user
    const user = await findOrCreateUser({
      email: gUser.email,
      name: gUser.name || null,
      avatarUrl: gUser.picture || null,
      provider: 'google',
      providerAccountId: gUser.id,
      accessToken,
    });

    // Create session
    const token = await createSession(user.id);

    // Save token to pending_logins so Electron can poll for it
    if (deviceCode) {
      const sql = getDb();
      await sql`
        UPDATE pending_logins SET token = ${token} WHERE code = ${deviceCode}
      `;
    }

    // Redirect to success page
    return NextResponse.redirect(`${process.env.APP_URL}/auth/success?token=${token}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
