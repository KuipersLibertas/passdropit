import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin-only routes
    if (pathname.startsWith('/admin') && (token as any)?.user?.level !== 2) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Admin routes always require auth
        if (pathname.startsWith('/admin')) return !!(token as any)?.user;

        // Authenticated user routes
        const authRequired = [
          '/create-new-link',
          '/manage-link',
          '/manage-subscription',
          '/user',
        ];
        if (authRequired.some((p) => pathname.startsWith(p))) return !!token;

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/create-new-link/:path*',
    '/manage-link/:path*',
    '/manage-subscription/:path*',
    '/user/:path*',
  ],
};
