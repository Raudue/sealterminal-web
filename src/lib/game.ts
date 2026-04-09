import { getDb } from './db';

// ── Stat multiplier calculations (server-side) ──

export function calcStatMultiplier(
  stats: { str: number; dex: number; int: number; cha: number; end: number },
  context: { longProcessCount?: number; rapidCommandCount?: number; claudeCommandCount?: number }
): number {
  let multiplier = 1.0;

  // STR → +2% per point on long-running processes (>30s)
  if (context.longProcessCount && context.longProcessCount > 0) {
    multiplier += stats.str * 0.02;
  }

  // DEX → +2% per point on rapid commands (<5s apart)
  if (context.rapidCommandCount && context.rapidCommandCount > 0) {
    multiplier += stats.dex * 0.02;
  }

  // INT → +2% per point on Claude commands
  if (context.claudeCommandCount && context.claudeCommandCount > 0) {
    multiplier += stats.int * 0.02;
  }

  return multiplier;
}

// CHA referral bonus: base 5% + 0.2% per CHA point
export function calcReferralPercent(cha: number): number {
  return 0.05 + cha * 0.002;
}

// END streak bonus
export function calcStreakBonus(end: number, baseFish: number): number {
  return Math.floor(baseFish * (1 + end * 0.02));
}

// Equipment stat totals
export async function getEquipmentBonuses(userId: string): Promise<{ str: number; dex: number; int: number; cha: number; end: number }> {
  const sql = getDb();
  const rows = await sql`
    SELECT COALESCE(SUM(i.bonus_str), 0) as str,
           COALESCE(SUM(i.bonus_dex), 0) as dex,
           COALESCE(SUM(i.bonus_int), 0) as int,
           COALESCE(SUM(i.bonus_cha), 0) as cha,
           COALESCE(SUM(i.bonus_end), 0) as end
    FROM user_items ui
    JOIN items i ON i.id = ui.item_id
    WHERE ui.user_id = ${userId} AND ui.equipped = true
  `;
  const r = rows[0];
  return r
    ? { str: Number(r.str), dex: Number(r.dex), int: Number(r.int), cha: Number(r.cha), end: Number(r.end) }
    : { str: 0, dex: 0, int: 0, cha: 0, end: 0 };
}

// Total stats = base + equipment
export function totalStats(
  base: { str: number; dex: number; int: number; cha: number; end: number },
  equip: { str: number; dex: number; int: number; cha: number; end: number }
) {
  return {
    str: base.str + equip.str,
    dex: base.dex + equip.dex,
    int: base.int + equip.int,
    cha: base.cha + equip.cha,
    end: base.end + equip.end,
  };
}

// Generate unique 8-char referral code
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Distribute referral fish (3 levels deep)
export async function distributeReferralFish(
  earnerId: string,
  fishEarned: number
): Promise<{ referralFishGiven: number }> {
  const sql = getDb();
  let totalGiven = 0;
  let currentUserId = earnerId;

  for (let level = 1; level <= 3; level++) {
    // Find who referred currentUserId
    const refs = await sql`
      SELECT u.id, u.stat_cha, u.referred_by FROM users u WHERE u.id = ${currentUserId}
    `;
    if (refs.length === 0 || !refs[0].referred_by) break;

    const referrerId = refs[0].referred_by;

    // Get referrer's CHA for bonus calc
    const referrer = await sql`SELECT stat_cha FROM users WHERE id = ${referrerId}`;
    if (referrer.length === 0) break;

    const pct = calcReferralPercent(referrer[0].stat_cha);
    // Each level reduces pct: level 1 = full, level 2 = half, level 3 = quarter
    const levelPct = pct / Math.pow(2, level - 1);
    const fishToGive = Math.max(1, Math.floor(fishEarned * levelPct));

    await sql`UPDATE users SET fish = fish + ${fishToGive}, total_fish_earned = total_fish_earned + ${fishToGive} WHERE id = ${referrerId}`;

    await sql`
      INSERT INTO referral_earnings (referrer_id, earner_id, level, fish_earned, fish_given)
      VALUES (${referrerId}, ${earnerId}, ${level}, ${fishEarned}, ${fishToGive})
    `;

    totalGiven += fishToGive;
    currentUserId = referrerId;
  }

  return { referralFishGiven: totalGiven };
}

// Update quest progress and check completion
export async function updateQuestProgress(
  userId: string,
  metric: string,
  increment: number
): Promise<Array<{ questName: string; completed: boolean }>> {
  const sql = getDb();
  const updates: Array<{ questName: string; completed: boolean }> = [];

  // Get active quests for this user matching the metric
  const activeQuests = await sql`
    SELECT uq.id, uq.progress, uq.completed, qd.name, qd.target, qd.metric
    FROM user_quests uq
    JOIN quest_definitions qd ON qd.id = uq.quest_id
    WHERE uq.user_id = ${userId}
      AND qd.metric = ${metric}
      AND uq.completed = false
      AND uq.reward_claimed = false
      AND (uq.expires_at IS NULL OR uq.expires_at > now())
  `;

  for (const quest of activeQuests) {
    const newProgress = Math.min(quest.progress + increment, quest.target);
    const completed = newProgress >= quest.target;

    await sql`
      UPDATE user_quests
      SET progress = ${newProgress},
          completed = ${completed},
          completed_at = ${completed ? new Date() : null}
      WHERE id = ${quest.id}
    `;

    updates.push({ questName: quest.name, completed });
  }

  return updates;
}

// Check and award badges based on milestones
export async function checkBadges(
  userId: string,
  stats: { totalCommands: number; totalFishEarned: number; currentStreak: number }
): Promise<string[]> {
  const sql = getDb();
  const earned: string[] = [];

  const milestones: Array<{ name: string; check: () => boolean }> = [
    { name: 'First Command', check: () => stats.totalCommands >= 1 },
    { name: 'Centurion', check: () => stats.totalCommands >= 100 },
    { name: 'Commander', check: () => stats.totalCommands >= 1000 },
    { name: 'Marathon Runner', check: () => stats.totalCommands >= 5000 },
    { name: 'Fish Mogul', check: () => stats.totalFishEarned >= 1000 },
    { name: 'Millionaire', check: () => stats.totalFishEarned >= 10000 },
    { name: 'Week Warrior', check: () => stats.currentStreak >= 7 },
    { name: 'Veteran', check: () => stats.currentStreak >= 30 },
  ];

  for (const m of milestones) {
    if (!m.check()) continue;

    // Check if badge exists and not already earned
    const badge = await sql`SELECT id FROM badge_definitions WHERE name = ${m.name}`;
    if (badge.length === 0) continue;

    const existing = await sql`
      SELECT id FROM user_badges WHERE user_id = ${userId} AND badge_id = ${badge[0].id}
    `;
    if (existing.length > 0) continue;

    await sql`
      INSERT INTO user_badges (user_id, badge_id) VALUES (${userId}, ${badge[0].id})
    `;
    earned.push(m.name);
  }

  // Check equipment badges
  const equipped = await sql`
    SELECT DISTINCT i.slot FROM user_items ui
    JOIN items i ON i.id = ui.item_id
    WHERE ui.user_id = ${userId} AND ui.equipped = true
  `;

  if (equipped.length >= 4) {
    const badge = await sql`SELECT id FROM badge_definitions WHERE name = 'Fashionista'`;
    if (badge.length > 0) {
      const existing = await sql`SELECT id FROM user_badges WHERE user_id = ${userId} AND badge_id = ${badge[0].id}`;
      if (existing.length === 0) {
        await sql`INSERT INTO user_badges (user_id, badge_id) VALUES (${userId}, ${badge[0].id})`;
        earned.push('Fashionista');
      }
    }
  }

  // Check referral badges
  const referralCount = await sql`
    SELECT COUNT(DISTINCT id) as cnt FROM users WHERE referred_by = ${userId}
  `;
  const refCnt = Number(referralCount[0]?.cnt || 0);

  if (refCnt >= 1) {
    const badge = await sql`SELECT id FROM badge_definitions WHERE name = 'Social Butterfly'`;
    if (badge.length > 0) {
      const existing = await sql`SELECT id FROM user_badges WHERE user_id = ${userId} AND badge_id = ${badge[0].id}`;
      if (existing.length === 0) {
        await sql`INSERT INTO user_badges (user_id, badge_id) VALUES (${userId}, ${badge[0].id})`;
        earned.push('Social Butterfly');
      }
    }
  }
  if (refCnt >= 5) {
    const badge = await sql`SELECT id FROM badge_definitions WHERE name = 'The Recruiter'`;
    if (badge.length > 0) {
      const existing = await sql`SELECT id FROM user_badges WHERE user_id = ${userId} AND badge_id = ${badge[0].id}`;
      if (existing.length === 0) {
        await sql`INSERT INTO user_badges (user_id, badge_id) VALUES (${userId}, ${badge[0].id})`;
        earned.push('The Recruiter');
      }
    }
  }

  return earned;
}

// Auto-assign quests for user (daily/weekly auto-refresh, boss once)
export async function autoAssignQuests(userId: string): Promise<void> {
  const sql = getDb();
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get all quest definitions
  const allQuests = await sql`SELECT * FROM quest_definitions`;

  for (const quest of allQuests) {
    if (quest.quest_type === 'daily') {
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Check if already assigned today
      const existing = await sql`
        SELECT id FROM user_quests
        WHERE user_id = ${userId} AND quest_id = ${quest.id}
          AND started_at >= ${new Date(today.getFullYear(), today.getMonth(), today.getDate())}
      `;
      if (existing.length === 0) {
        await sql`
          INSERT INTO user_quests (user_id, quest_id, expires_at)
          VALUES (${userId}, ${quest.id}, ${endOfDay})
        `;
      }
    } else if (quest.quest_type === 'weekly') {
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const existing = await sql`
        SELECT id FROM user_quests
        WHERE user_id = ${userId} AND quest_id = ${quest.id}
          AND started_at >= ${startOfWeek}
      `;
      if (existing.length === 0) {
        await sql`
          INSERT INTO user_quests (user_id, quest_id, expires_at)
          VALUES (${userId}, ${quest.id}, ${endOfWeek})
        `;
      }
    } else if (quest.quest_type === 'boss') {
      // Only assign once, ever
      const existing = await sql`
        SELECT id FROM user_quests
        WHERE user_id = ${userId} AND quest_id = ${quest.id}
      `;
      if (existing.length === 0) {
        await sql`
          INSERT INTO user_quests (user_id, quest_id)
          VALUES (${userId}, ${quest.id})
        `;
      }
    }
  }
}
