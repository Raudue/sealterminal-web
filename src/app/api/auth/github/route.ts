import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 });
  }

  const redirectUri = `${process.env.APP_URL}/api/auth/github/callback`;
  const scope = 'read:user user:email';

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', scope);

  return NextResponse.redirect(url.toString());
}
