import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUser, createSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
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

    // Redirect to Electron app via custom protocol
    return NextResponse.redirect(`sealterminal://auth/callback?token=${token}`);
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
