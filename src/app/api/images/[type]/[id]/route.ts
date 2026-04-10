import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  const sql = getDb();

  let imageData: string | null = null;

  if (type === 'reference') {
    const rows = await sql`SELECT image_data FROM admin_assets WHERE asset_type = ${'reference-' + id} AND image_data IS NOT NULL`;
    if (rows.length > 0) imageData = rows[0].image_data as string;
  } else if (type === 'seal') {
    const rows = await sql`SELECT image_data FROM seal_class_images WHERE seal_class = ${id} AND image_data IS NOT NULL`;
    if (rows.length > 0) imageData = rows[0].image_data as string;
  } else if (type === 'item') {
    const rows = await sql`SELECT image_data FROM items WHERE id = ${id} AND image_data IS NOT NULL`;
    if (rows.length > 0) imageData = rows[0].image_data as string;
  }

  if (!imageData) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  const buffer = Buffer.from(imageData, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
