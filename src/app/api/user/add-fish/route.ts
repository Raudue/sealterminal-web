import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { calcStatMultiplier, getEquipmentBonuses, totalStats, distributeReferralFish, updateQuestProgress, checkBadges } from '@/lib/game';

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  const user = await validateSession(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const body = await request.json();
  const amount = Number(body.amount) || 0;
  const commands = Number(body.commands) || 0;
  const context = body.context || {};

  if (amount < 0 || amount > 10000) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const sql = getDb();

  // Get user stats
  const userData = await sql`
    SELECT stat_str, stat_dex, stat_int, stat_cha, stat_end,
           total_commands, total_fish_earned, current_streak, character_created
    FROM users WHERE id = ${user.id}
  `;
  const u = userData[0];

  let finalAmount = amount;
  let bonusFish = 0;

  if (u.character_created) {
    // Get equipment bonuses
    const equipBonuses = await getEquipmentBonuses(user.id);
    const stats = totalStats(
      { str: u.stat_str, dex: u.stat_dex, int: u.stat_int, cha: u.stat_cha, end: u.stat_end },
      equipBonuses
    );

    // Apply stat multiplier
    const multiplier = calcStatMultiplier(stats, {
      longProcessCount: context.longProcessCount || 0,
      rapidCommandCount: context.rapidCommandCount || 0,
      claudeCommandCount: context.claudeCommandCount || 0,
    });

    bonusFish = Math.floor(amount * (multiplier - 1));
    finalAmount = amount + bonusFish;
  }

  // Update user fish, commands, total fish earned
  const newTotalCommands = u.total_commands + commands;
  const newTotalFishEarned = u.total_fish_earned + finalAmount;

  const rows = await sql`
    UPDATE users SET
      fish = fish + ${finalAmount},
      total_commands = ${newTotalCommands},
      total_fish_earned = ${newTotalFishEarned}
    WHERE id = ${user.id}
    RETURNING fish
  `;

  // Update quest progress
  const questUpdates: Array<{ questName: string; completed: boolean }> = [];
  if (commands > 0) {
    const cmdQuests = await updateQuestProgress(user.id, 'commands', commands);
    questUpdates.push(...cmdQuests);

    // Also update total_commands metric for boss quests
    const totalCmdQuests = await updateQuestProgress(user.id, 'total_commands', commands);
    questUpdates.push(...totalCmdQuests);
  }
  if (finalAmount > 0) {
    const fishQuests = await updateQuestProgress(user.id, 'fish', finalAmount);
    questUpdates.push(...fishQuests);

    const totalFishQuests = await updateQuestProgress(user.id, 'total_fish', finalAmount);
    questUpdates.push(...totalFishQuests);
  }
  if (context.rapidCommandCount > 0) {
    const rapidQuests = await updateQuestProgress(user.id, 'rapid_commands', context.rapidCommandCount);
    questUpdates.push(...rapidQuests);
  }

  // Distribute referral fish
  let referralFishGiven = 0;
  if (finalAmount > 0 && u.character_created) {
    const refResult = await distributeReferralFish(user.id, finalAmount);
    referralFishGiven = refResult.referralFishGiven;
  }

  // Check badges
  const badgesEarned = await checkBadges(user.id, {
    totalCommands: newTotalCommands,
    totalFishEarned: newTotalFishEarned,
    currentStreak: u.current_streak,
  });

  return NextResponse.json({
    fish: rows[0].fish,
    bonusFish,
    questUpdates,
    badgesEarned,
    referralFishGiven,
  });
}
