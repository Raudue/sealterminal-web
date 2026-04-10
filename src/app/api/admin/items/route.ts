import { NextRequest, NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/admin';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const admin = await validateAdmin(token);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const sql = getDb();
  const items = await sql`
    SELECT id, name, description, slot, rarity, icon, image_url, level_required, cost
    FROM items
    ORDER BY level_required, cost
  `;

  return NextResponse.json({
    items: items.map((i: Record<string, unknown>) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      slot: i.slot,
      rarity: i.rarity,
      icon: i.icon,
      imageUrl: i.image_url || null,
      levelRequired: i.level_required,
      cost: i.cost,
    })),
  });
}
