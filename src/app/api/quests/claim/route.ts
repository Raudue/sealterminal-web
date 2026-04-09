import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const body = await request.json();
  const { userQuestId } = body;
  if (!userQuestId) return NextResponse.json({ error: 'Missing userQuestId' }, { status: 400 });

  const sql = getDb();

  // Verify quest belongs to user, is completed, not claimed
  const quest = await sql`
    SELECT uq.*, qd.reward_fish, qd.name FROM user_quests uq
    JOIN quest_definitions qd ON qd.id = uq.quest_id
    WHERE uq.id = ${userQuestId} AND uq.user_id = ${user.id}
  `;

  if (quest.length === 0) return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
  if (!quest[0].completed) return NextResponse.json({ error: 'Quest not completed' }, { status: 400 });
  if (quest[0].reward_claimed) return NextResponse.json({ error: 'Already claimed' }, { status: 400 });

  const reward = quest[0].reward_fish;

  await sql`UPDATE user_quests SET reward_claimed = true WHERE id = ${userQuestId}`;
  await sql`UPDATE users SET fish = fish + ${reward}, total_fish_earned = total_fish_earned + ${reward} WHERE id = ${user.id}`;

  const updated = await sql`SELECT fish FROM users WHERE id = ${user.id}`;

  return NextResponse.json({ success: true, fish: updated[0].fish, reward });
}
