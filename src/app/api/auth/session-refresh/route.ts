import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { encode } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import { getUserById } from '@/lib/db/auth';
import { syncSubscription } from '@/lib/db/user';

// Server-side session refresh — reads fresh user data from Supabase,
// encodes a new NextAuth JWT, sets it as a cookie, then redirects.
//
// Query params:
//   sync=1         call syncSubscription() to reconcile Stripe status first
//   callbackUrl    where to redirect after refresh (default: /user/plan)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  const userId = session.user.id as number;
  const { searchParams } = new URL(request.url);
  const sync        = searchParams.get('sync') === '1';
  const rawCallback = searchParams.get('callbackUrl') ?? '/user/plan';

  // SECURITY: only allow relative paths — parse with URL constructor to catch
  // encoded bypasses like %2F%2F, then verify the host matches our own origin.
  let callbackPath = '/user/plan';
  try {
    const parsed = new URL(rawCallback, request.url);
    if (parsed.origin === new URL(request.url).origin) {
      callbackPath = parsed.pathname + parsed.search;
    }
  } catch {
    // malformed URL — fall back to default
  }

  const target = new URL(callbackPath, request.url);

  let freshUser = null;
  try {
    freshUser = sync
      ? await syncSubscription(userId)
      : await getUserById(userId);
  } catch (err: any) {
    console.error('session-refresh error:', err.message);
    try { freshUser = await getUserById(userId); } catch {}
  }

  if (!freshUser) {
    return NextResponse.redirect(target);
  }

  const secret = process.env.NEXTAUTH_SECRET ?? '';
  const newToken = { user: freshUser, sign_out: false };
  const encoded = await encode({ token: newToken, secret, maxAge: 30 * 24 * 60 * 60 });

  const secure     = process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production';
  const cookieName = secure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

  const response = NextResponse.redirect(target);
  response.cookies.set(cookieName, encoded, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
