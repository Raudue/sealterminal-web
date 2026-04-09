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

  // Get item
  const items = await sql`SELECT * FROM items WHERE id = ${itemId}`;
  if (items.length === 0) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  const item = items[0];

  // Check if already owned
  const owned = await sql`SELECT id FROM user_items WHERE user_id = ${user.id} AND item_id = ${itemId}`;
  if (owned.length > 0) return NextResponse.json({ error: 'Already owned' }, { status: 400 });

  // Check fish
  if (user.fish < item.cost) {
    return NextResponse.json({ error: 'Not enough fish' }, { status: 400 });
  }

  // Check level
  const { getLevelForFish } = await import('@/lib/game-levels');
  const userLevel = getLevelForFish(user.fish);
  if (userLevel < item.level_required) {
    return NextResponse.json({ error: 'Level too low' }, { status: 400 });
  }

  // Deduct fish and add item
  await sql`UPDATE users SET fish = fish - ${item.cost} WHERE id = ${user.id}`;
  await sql`INSERT INTO user_items (user_id, item_id) VALUES (${user.id}, ${itemId})`;

  const updated = await sql`SELECT fish FROM users WHERE id = ${user.id}`;

  return NextResponse.json({ success: true, fish: updated[0].fish });
}
