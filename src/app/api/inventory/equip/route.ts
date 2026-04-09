import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const body = await request.json();
  const { itemId } = body;
  if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });

  const sql = getDb();

  // Get item details and verify ownership
  const owned = await sql`
    SELECT ui.id, i.slot FROM user_items ui
    JOIN items i ON i.id = ui.item_id
    WHERE ui.user_id = ${user.id} AND ui.item_id = ${itemId}
  `;
  if (owned.length === 0) return NextResponse.json({ error: 'Item not owned' }, { status: 400 });

  const slot = owned[0].slot;

  // Unequip any item in same slot
  await sql`
    UPDATE user_items SET equipped = false
    WHERE user_id = ${user.id} AND item_id IN (
      SELECT ui2.item_id FROM user_items ui2
      JOIN items i2 ON i2.id = ui2.item_id
      WHERE ui2.user_id = ${user.id} AND i2.slot = ${slot} AND ui2.equipped = true
    )
  `;

  // Equip the new item
  await sql`UPDATE user_items SET equipped = true WHERE user_id = ${user.id} AND item_id = ${itemId}`;

  return NextResponse.json({ success: true });
}
