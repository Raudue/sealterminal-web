import { NextRequest, NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/admin';
import { getDb } from '@/lib/db';

const SEAL_CLASSES = [
  { id: 'brawler', name: 'Brawler Seal', emoji: '🔥' },
  { id: 'swift', name: 'Swift Seal', emoji: '⚡' },
  { id: 'sage', name: 'Sage Seal', emoji: '🧠' },
  { id: 'diplomat', name: 'Diplomat Seal', emoji: '💬' },
  { id: 'guardian', name: 'Guardian Seal', emoji: '🛡️' },
];

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const admin = await validateAdmin(token);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const sql = getDb();
  const images = await sql`SELECT seal_class, image_url FROM seal_class_images`;

  const imageMap = new Map<string, string>();
  for (const row of images) {
    imageMap.set(row.seal_class as string, row.image_url as string);
  }

  return NextResponse.json({
    sealClasses: SEAL_CLASSES.map((sc) => ({
      ...sc,
      imageUrl: imageMap.get(sc.id) || null,
    })),
  });
}
