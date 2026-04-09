import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const sql = getDb();

  // Get items, marking owned ones
  const items = await sql`
    SELECT i.*,
           CASE WHEN ui.id IS NOT NULL THEN true ELSE false END as owned
    FROM items i
    LEFT JOIN user_items ui ON ui.item_id = i.id AND ui.user_id = ${user.id}
    ORDER BY i.level_required, i.cost
  `;

  return NextResponse.json({
    items: items.map((i: Record<string, unknown>) => ({
      id: i.id, name: i.name, description: i.description, slot: i.slot,
      rarity: i.rarity, icon: i.icon,
      bonusStr: i.bonus_str, bonusDex: i.bonus_dex, bonusInt: i.bonus_int,
      bonusCha: i.bonus_cha, bonusEnd: i.bonus_end,
      fishMultiplier: i.fish_multiplier, cost: i.cost, levelRequired: i.level_required,
      owned: i.owned,
    })),
    userFish: user.fish,
  });
}
