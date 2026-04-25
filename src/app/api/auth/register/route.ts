import { NextResponse } from 'next/server';
import { register } from '@/lib/db/auth';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const xff = request.headers.get('x-forwarded-for');
    const ip = (xff ? xff.split(',').map(s => s.trim()).filter(Boolean).at(-1) : request.headers.get('x-real-ip')) ?? 'unknown';
    if (!rateLimit(`register:${ip}`, 5, 3600)) {
      return NextResponse.json({ success: false, message: 'Too many registration attempts. Try again later.' }, { status: 429 });
    }

    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const result = await register(firstName, lastName, email, password);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
