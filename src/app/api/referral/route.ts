import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const sql = getDb();

  const userData = await sql`SELECT referral_code FROM users WHERE id = ${user.id}`;
  const referrals = await sql`
    SELECT username, seal_class, fish FROM users WHERE referred_by = ${user.id}
  `;
  const earnings = await sql`
    SELECT COALESCE(SUM(fish_given), 0) as total FROM referral_earnings
    WHERE referrer_id = ${user.id}
  `;
  const recentEarnings = await sql`
    SELECT re.*, u.username as earner_name FROM referral_earnings re
    JOIN users u ON u.id = re.earner_id
    WHERE re.referrer_id = ${user.id}
    ORDER BY re.created_at DESC LIMIT 20
  `;

  return NextResponse.json({
    code: userData[0]?.referral_code,
    referrals: referrals.map((r: Record<string, unknown>) => ({
      username: r.username, sealClass: r.seal_class, fish: r.fish,
    })),
    totalEarnings: Number(earnings[0]?.total || 0),
    recentEarnings: recentEarnings.map((e: Record<string, unknown>) => ({
      earnerName: e.earner_name, level: e.level,
      fishEarned: e.fish_earned, fishGiven: e.fish_given,
      createdAt: e.created_at,
    })),
  });
}
