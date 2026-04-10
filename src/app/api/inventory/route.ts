import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const sql = getDb();
  const items = await sql`
    SELECT i.*, ui.equipped FROM user_items ui
    JOIN items i ON i.id = ui.item_id
    WHERE ui.user_id = ${user.id}
    ORDER BY i.slot, i.rarity DESC
  `;

  return NextResponse.json({
    items: items.map((i: Record<string, unknown>) => ({
      id: i.id, name: i.name, description: i.description, slot: i.slot,
      rarity: i.rarity, icon: i.icon, imageUrl: i.image_url || null, equipped: i.equipped,
      bonusStr: i.bonus_str, bonusDex: i.bonus_dex, bonusInt: i.bonus_int,
      bonusCha: i.bonus_cha, bonusEnd: i.bonus_end,
      fishMultiplier: i.fish_multiplier, cost: i.cost, levelRequired: i.level_required,
    })),
  });
}
