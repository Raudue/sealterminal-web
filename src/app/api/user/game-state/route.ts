import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const sql = getDb();

  // Character data
  const charRows = await sql`
    SELECT seal_class, stat_str, stat_dex, stat_int, stat_cha, stat_end,
           referral_code, character_created, total_commands, total_fish_earned,
           current_streak, longest_streak, last_login_date, fish, username
    FROM users WHERE id = ${user.id}
  `;
  const c = charRows[0];

  // Seal class image
  const sealClassImg = await sql`
    SELECT image_url FROM seal_class_images WHERE seal_class = ${c.seal_class}
  `;

  // Equipment (equipped items)
  const equipment = await sql`
    SELECT i.*, ui.equipped FROM user_items ui
    JOIN items i ON i.id = ui.item_id
    WHERE ui.user_id = ${user.id} AND ui.equipped = true
  `;

  // Active quests
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

  // Badges
  const badges = await sql`
    SELECT bd.*, ub.earned_at,
           CASE WHEN ub.id IS NOT NULL THEN true ELSE false END as earned
    FROM badge_definitions bd
    LEFT JOIN user_badges ub ON ub.badge_id = bd.id AND ub.user_id = ${user.id}
    ORDER BY bd.category, bd.name
  `;

  // Referral info
  const referrals = await sql`
    SELECT u.username, u.fish, u.seal_class FROM users u
    WHERE u.referred_by = ${user.id}
  `;
  const referralEarnings = await sql`
    SELECT COALESCE(SUM(fish_given), 0) as total FROM referral_earnings
    WHERE referrer_id = ${user.id}
  `;

  return NextResponse.json({
    character: {
      sealClass: c.seal_class,
      sealClassImage: sealClassImg.length > 0 ? sealClassImg[0].image_url : null,
      stats: { str: c.stat_str, dex: c.stat_dex, int: c.stat_int, cha: c.stat_cha, end: c.stat_end },
      referralCode: c.referral_code,
      characterCreated: c.character_created,
      totalCommands: c.total_commands,
      totalFishEarned: c.total_fish_earned,
      currentStreak: c.current_streak,
      longestStreak: c.longest_streak,
      lastLoginDate: c.last_login_date,
    },
    fish: c.fish,
    username: c.username,
    equipment: equipment.map((e: Record<string, unknown>) => ({
      id: e.id, name: e.name, description: e.description, slot: e.slot,
      rarity: e.rarity, icon: e.icon, imageUrl: e.image_url || null,
      bonusStr: e.bonus_str, bonusDex: e.bonus_dex, bonusInt: e.bonus_int,
      bonusCha: e.bonus_cha, bonusEnd: e.bonus_end,
      fishMultiplier: e.fish_multiplier, cost: e.cost, levelRequired: e.level_required,
    })),
    quests: quests.map((q: Record<string, unknown>) => ({
      userQuestId: q.user_quest_id, questId: q.quest_id,
      name: q.name, description: q.description, questType: q.quest_type,
      metric: q.metric, target: q.target, progress: q.progress,
      completed: q.completed, rewardClaimed: q.reward_claimed,
      rewardFish: q.reward_fish, icon: q.icon,
      startedAt: q.started_at, completedAt: q.completed_at, expiresAt: q.expires_at,
    })),
    badges: badges.map((b: Record<string, unknown>) => ({
      id: b.id, name: b.name, description: b.description,
      icon: b.icon, category: b.category, earned: b.earned, earnedAt: b.earned_at,
    })),
    referral: {
      code: c.referral_code,
      referrals: referrals.map((r: Record<string, unknown>) => ({
        username: r.username, fish: r.fish, sealClass: r.seal_class,
      })),
      totalEarnings: Number(referralEarnings[0]?.total || 0),
    },
    streak: {
      current: c.current_streak,
      longest: c.longest_streak,
      lastLoginDate: c.last_login_date,
    },
  });
}
