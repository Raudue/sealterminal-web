import { NextRequest, NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/admin';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const admin = await validateAdmin(token);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const sql = getDb();
  const rows = await sql`
    SELECT image_url, updated_at FROM admin_assets WHERE asset_type = 'reference-seal'
  `;

  if (rows.length === 0) {
    return NextResponse.json({ reference: null });
  }

  return NextResponse.json({
    reference: {
      imageUrl: rows[0].image_url,
      updatedAt: rows[0].updated_at,
    },
  });
}
