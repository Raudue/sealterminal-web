import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { generateReferralCode } from '@/lib/game';

const VALID_CLASSES = ['brawler', 'swift', 'sage', 'diplomat', 'guardian'];

const CLASS_BONUSES: Record<string, { primary: string; primaryAmt: number; secondary: string; secondaryAmt: number }> = {
  brawler: { primary: 'str', primaryAmt: 5, secondary: 'end', secondaryAmt: 2 },
  swift: { primary: 'dex', primaryAmt: 5, secondary: 'str', secondaryAmt: 2 },
  sage: { primary: 'int', primaryAmt: 5, secondary: 'dex', secondaryAmt: 2 },
  diplomat: { primary: 'cha', primaryAmt: 5, secondary: 'int', secondaryAmt: 2 },
  guardian: { primary: 'end', primaryAmt: 5, secondary: 'cha', secondaryAmt: 2 },
};

// POST — create character
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const sql = getDb();

  // Check if already created
  const existing = await sql`SELECT character_created FROM users WHERE id = ${user.id}`;
  if (existing[0]?.character_created) {
    return NextResponse.json({ error: 'Character already created' }, { status: 400 });
  }

  const body = await request.json();
  const { sealClass, stats, referralCode } = body;

  if (!VALID_CLASSES.includes(sealClass)) {
    return NextResponse.json({ error: 'Invalid seal class' }, { status: 400 });
  }

  // Validate stat allocation: 5 free points total
  const { str, dex, int, cha, end } = stats || {};
  if ([str, dex, int, cha, end].some((s) => typeof s !== 'number' || s < 0)) {
    return NextResponse.json({ error: 'Invalid stats' }, { status: 400 });
  }
  const totalFree = str + dex + int + cha + end;
  if (totalFree !== 5) {
    return NextResponse.json({ error: 'Must allocate exactly 5 free points' }, { status: 400 });
  }

  // Calculate final stats: base 3 + class bonus + free points
  const bonus = CLASS_BONUSES[sealClass];
  const finalStats = { str: 3 + str, dex: 3 + dex, int: 3 + int, cha: 3 + cha, end: 3 + end };
  finalStats[bonus.primary as keyof typeof finalStats] += bonus.primaryAmt;
  finalStats[bonus.secondary as keyof typeof finalStats] += bonus.secondaryAmt;

  // Handle referral code
  let referredBy = null;
  if (referralCode) {
    const referrer = await sql`SELECT id FROM users WHERE referral_code = ${referralCode.toUpperCase()}`;
    if (referrer.length === 0) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }
    if (referrer[0].id === user.id) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
    }
    referredBy = referrer[0].id;
  }

  // Generate unique referral code for this user
  let myCode = generateReferralCode();
  let attempts = 0;
  while (attempts < 10) {
    const dup = await sql`SELECT id FROM users WHERE referral_code = ${myCode}`;
    if (dup.length === 0) break;
    myCode = generateReferralCode();
    attempts++;
  }

  await sql`
    UPDATE users SET
      seal_class = ${sealClass},
      stat_str = ${finalStats.str},
      stat_dex = ${finalStats.dex},
      stat_int = ${finalStats.int},
      stat_cha = ${finalStats.cha},
      stat_end = ${finalStats.end},
      referral_code = ${myCode},
      referred_by = ${referredBy},
      character_created = true
    WHERE id = ${user.id}
  `;

  return NextResponse.json({
    success: true,
    character: {
      sealClass,
      stats: finalStats,
      referralCode: myCode,
    },
  });
}

// GET — get character data
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const sql = getDb();
  const rows = await sql`
    SELECT seal_class, stat_str, stat_dex, stat_int, stat_cha, stat_end,
           referral_code, character_created, total_commands, total_fish_earned,
           current_streak, longest_streak, last_login_date
    FROM users WHERE id = ${user.id}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const u = rows[0];
  return NextResponse.json({
    characterCreated: u.character_created,
    sealClass: u.seal_class,
    stats: { str: u.stat_str, dex: u.stat_dex, int: u.stat_int, cha: u.stat_cha, end: u.stat_end },
    referralCode: u.referral_code,
    totalCommands: u.total_commands,
    totalFishEarned: u.total_fish_earned,
    currentStreak: u.current_streak,
    longestStreak: u.longest_streak,
    lastLoginDate: u.last_login_date,
  });
}
