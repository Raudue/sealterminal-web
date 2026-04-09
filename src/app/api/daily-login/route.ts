import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { calcStreakBonus } from '@/lib/game';

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const sql = getDb();
  const today = new Date().toISOString().split('T')[0];

  // Get user's streak data
  const userData = await sql`
    SELECT current_streak, longest_streak, last_login_date, stat_end
    FROM users WHERE id = ${user.id}
  `;
  const u = userData[0];

  // Check if already claimed today
  const alreadyClaimed = await sql`
    SELECT id FROM daily_login_log WHERE user_id = ${user.id} AND login_date = ${today}
  `;
  if (alreadyClaimed.length > 0) {
    return NextResponse.json({
      alreadyClaimed: true,
      currentStreak: u.current_streak,
      longestStreak: u.longest_streak,
    });
  }

  // Calculate streak
  const lastLogin = u.last_login_date ? new Date(u.last_login_date).toISOString().split('T')[0] : null;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak: number;
  if (lastLogin === yesterday) {
    newStreak = u.current_streak + 1;
  } else if (lastLogin === today) {
    newStreak = u.current_streak;
  } else {
    newStreak = 1; // streak broken
  }

  const longestStreak = Math.max(u.longest_streak, newStreak);

  // Calculate fish reward: day N = N × 2, milestones
  let baseFish = newStreak * 2;
  if (newStreak === 7) baseFish = 20;
  else if (newStreak === 14) baseFish = 40;
  else if (newStreak === 30) baseFish = 100;
  else if (newStreak % 30 === 0) baseFish = 100;

  // Apply END stat bonus
  const fishAwarded = calcStreakBonus(u.stat_end, baseFish);

  // Update user
  await sql`
    UPDATE users SET
      current_streak = ${newStreak},
      longest_streak = ${longestStreak},
      last_login_date = ${today},
      fish = fish + ${fishAwarded},
      total_fish_earned = total_fish_earned + ${fishAwarded}
    WHERE id = ${user.id}
  `;

  // Log it
  await sql`
    INSERT INTO daily_login_log (user_id, login_date, streak_day, fish_awarded)
    VALUES (${user.id}, ${today}, ${newStreak}, ${fishAwarded})
  `;

  const updated = await sql`SELECT fish FROM users WHERE id = ${user.id}`;

  return NextResponse.json({
    success: true,
    alreadyClaimed: false,
    currentStreak: newStreak,
    longestStreak,
    fishAwarded,
    fish: updated[0].fish,
  });
}
