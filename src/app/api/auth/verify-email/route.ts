import { NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/db/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, message: 'Missing token' }, { status: 400 });
  }

  const result = await verifyEmail(token);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
