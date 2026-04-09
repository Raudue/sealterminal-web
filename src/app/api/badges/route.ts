import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const sql = getDb();
  const badges = await sql`
    SELECT bd.*, ub.earned_at,
           CASE WHEN ub.id IS NOT NULL THEN true ELSE false END as earned
    FROM badge_definitions bd
    LEFT JOIN user_badges ub ON ub.badge_id = bd.id AND ub.user_id = ${user.id}
    ORDER BY bd.category, bd.name
  `;

  return NextResponse.json({
    badges: badges.map((b: Record<string, unknown>) => ({
      id: b.id, name: b.name, description: b.description,
      icon: b.icon, category: b.category, earned: b.earned, earnedAt: b.earned_at,
    })),
  });
}
