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
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error_description }, { status: 400 });
    }

    const accessToken: string = tokenData.access_token;

    // Get user info from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const ghUser = await userRes.json();

    // Get primary email if not public
    let email = ghUser.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const emails = await emailRes.json();
      const primary = emails.find((e: { primary: boolean }) => e.primary);
      email = primary?.email || emails[0]?.email;
    }

    if (!email) {
      return NextResponse.json({ error: 'Could not get email from GitHub' }, { status: 400 });
    }

    // Create or find user
    const user = await findOrCreateUser({
      email,
      name: ghUser.name || ghUser.login,
      avatarUrl: ghUser.avatar_url,
      provider: 'github',
      providerAccountId: String(ghUser.id),
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
    console.error('GitHub OAuth error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
