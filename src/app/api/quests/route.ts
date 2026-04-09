import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { autoAssignQuests } from '@/lib/game';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const sql = getDb();

  // Auto-assign any missing daily/weekly/boss quests
  await autoAssignQuests(user.id);

  const quests = await sql`
    SELECT uq.id as user_quest_id, uq.progress, uq.completed, uq.reward_claimed,
           uq.started_at, uq.completed_at, uq.expires_at,
           qd.id as quest_id, qd.name, qd.description, qd.quest_type, qd.metric,
           qd.target, qd.reward_fish, qd.icon
    FROM user_quests uq
    JOIN quest_definitions qd ON qd.id = uq.quest_id
    WHERE uq.user_id = ${user.id}
      AND (uq.expires_at IS NULL OR uq.expires_at > now())
    ORDER BY qd.quest_type, qd.name
  `;

  return NextResponse.json({
    quests: quests.map((q: Record<string, unknown>) => ({
      userQuestId: q.user_quest_id, questId: q.quest_id,
      name: q.name, description: q.description, questType: q.quest_type,
      metric: q.metric, target: q.target, progress: q.progress,
      completed: q.completed, rewardClaimed: q.reward_claimed,
      rewardFish: q.reward_fish, icon: q.icon,
      startedAt: q.started_at, completedAt: q.completed_at, expiresAt: q.expires_at,
    })),
  });
}
