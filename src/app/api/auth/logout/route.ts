import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  await deleteSession(token);
  return NextResponse.json({ ok: true });
}
