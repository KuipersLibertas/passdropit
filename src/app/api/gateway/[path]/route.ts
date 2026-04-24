import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

import * as authDb from '@/lib/db/auth';
import * as linksDb from '@/lib/db/links';
import * as userDb from '@/lib/db/user';
import * as adminDb from '@/lib/db/admin';

function isAdmin(session: any): boolean {
  return session?.user?.level === 2;
}

function sanitiseIP(raw: string | null): string {
  if (!raw) return '';
  const candidate = raw.split(',')[0].trim();
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]{3,39}$/;
  return (ipv4.test(candidate) || ipv6.test(candidate)) ? candidate : '';
}

const ALLOWED_MIME: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png':  [0x89, 0x50, 0x4E, 0x47],
  'image/gif':  [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function validateFileBuffer(buffer: Buffer, declaredMime: string): boolean {
  const sig = ALLOWED_MIME[declaredMime];
  if (!sig) return false;
  for (let i = 0; i < sig.length; i++) {
    if (buffer[i] !== sig[i]) return false;
  }
  return true;
}

// ── GET /api/gateway/[path] ───────────────────────────────────────────────────

export async function GET(
  _: Request,
  { params }: { params: { path: string } }
) {
  const session = await getServerSession(authOptions);

  const guardedPaths = ['cancel-pro', 'export-activity', 'get-user-list', 'user-subscription', 'get-me', 'sync-subscription', 'get-link-list'];
  if (guardedPaths.includes(params.path) && !session) {
    return NextResponse.json({ success: false, message: 'Authentication is required' }, { status: 401 });
  }

  const adminPaths = ['get-user-list', 'export-activity'];
  if (adminPaths.includes(params.path) && !isAdmin(session)) {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  }

  const userId: number = session?.user?.id as number;

  try {
    switch (params.path) {
      case 'cancel-pro': {
        const result = await userDb.cancelPro(userId);
        return NextResponse.json(result);
      }

      case 'get-me': {
        const user = await authDb.getUserById(userId);
        if (!user) return NextResponse.json({ success: false, message: 'User not found' });
        return NextResponse.json({ success: true, user });
      }

      case 'sync-subscription': {
        const user = await userDb.syncSubscription(userId);
        if (!user) return NextResponse.json({ success: false, message: 'User not found' });
        return NextResponse.json({ success: true, user });
      }

      case 'user-subscription': {
        const result = await userDb.getSubscription(userId);
        return NextResponse.json(result);
      }

      case 'get-link-list': {
        const data = await linksDb.getLinkList(userId);
        return NextResponse.json({ success: true, data });
      }

      case 'get-user-list': {
        const data = await adminDb.getUserList();
        return NextResponse.json(data);
      }

      case 'export-activity': {
        const buffer = await adminDb.exportActivity();
        return new Response(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="UserDataExport.xlsx"',
          },
        });
      }

      default:
        return NextResponse.json({ success: false, message: 'Unknown endpoint' }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`GET /api/gateway/${params.path} error:`, error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ── POST /api/gateway/[path] ──────────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: { path: string } }
) {
  const session = await getServerSession(authOptions);

  const guardedPaths = [
    'delete-link',
    'update-link',
    'link-analytics',
    'change-password',
    'upgrade-pro',
    'update-paypal',
    'get-earning-link-list',
    'link-report',
    'user-analytics',
    'buy-link',
    'upload-logo',
    'save-link',
    'delete-logo',
  ];

  if (guardedPaths.includes(params.path) && !session) {
    return NextResponse.json({ success: false, message: 'Authentication is required' }, { status: 401 });
  }

  const adminPaths = ['update-paypal', 'get-earning-link-list', 'link-report', 'user-analytics'];
  if (adminPaths.includes(params.path) && !isAdmin(session)) {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  }

  const userId: number = session?.user?.id as number;

  // File upload (multipart)
  if (params.path === 'upload-logo') {
    try {
      const formData = await request.formData();
      const file = formData.get('logo') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, message: 'No file provided' });
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ success: false, message: 'File too large (max 5 MB)' }, { status: 413 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (!validateFileBuffer(buffer, file.type)) {
        return NextResponse.json({ success: false, message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, { status: 415 });
      }

      const result = await userDb.uploadLogo(userId, buffer, file.type);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error('POST /api/gateway/upload-logo error:', error.message);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  let req: Record<string, any> = {};
  try {
    req = await request.json();
  } catch {
    // Ignore empty body
  }

  const ip = sanitiseIP(
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip')
  );

  try {
    switch (params.path) {
      // ── Auth ──────────────────────────────────────────────────────────────
      case 'forgot-password': {
        const rateLimitKey = `forgot-password:${(req.email ?? '').toLowerCase().trim()}`;
        if (!rateLimit(rateLimitKey, 5, 15 * 60)) {
          return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
        }
        const result = await authDb.forgotPassword(req.email);
        return NextResponse.json(result);
      }

      case 'reset-password': {
        const rateLimitKey = `reset-password:${(req.token ?? '').slice(0, 16)}`;
        if (!rateLimit(rateLimitKey, 5, 15 * 60)) {
          return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
        }
        const result = await authDb.resetPassword(req.token, req.newPassword);
        return NextResponse.json(result);
      }

      case 'change-password': {
        const result = await authDb.changePassword(userId, req.currentPassword, req.newPassword);
        return NextResponse.json(result);
      }

      // ── Links ──────────────────────────────────────────────────────────────
      case 'save-link': {
        const result = await linksDb.saveLink(userId, req as any);
        return NextResponse.json(result);
      }

      case 'update-link': {
        const result = await linksDb.updateLink(userId, req as any);
        return NextResponse.json(result);
      }

      case 'delete-link': {
        const result = await linksDb.deleteLink(userId, req.id);
        return NextResponse.json(result);
      }

      case 'link-analytics': {
        const result = await linksDb.getAnalytics(userId, req.id ?? req.linkId);
        return NextResponse.json(result);
      }

      case 'get-link-detail': {
        const result = await linksDb.getLinkDetail(req.slug ?? req.url, userId);
        return NextResponse.json(result);
      }

      case 'validate-link': {
        const rateLimitKey = `validate-link:${ip || 'unknown'}:${req.linkId}`;
        if (!rateLimit(rateLimitKey, 10, 10 * 60)) {
          return NextResponse.json({ success: false, message: 'Too many attempts. Please wait before trying again.' }, { status: 429 });
        }
        const result = await linksDb.validateLink(req.linkId, req.password, ip);
        return NextResponse.json(result);
      }

      case 'buy-link': {
        // Scaffold: balance-based purchase (Stripe flow deferred)
        const result = await linksDb.buyLink(userId, req.linkId);
        return NextResponse.json(result);
      }

      case 'check-google-link': {
        // Verify Google Drive link is publicly accessible
        try {
          const res = await fetch(req.url, { method: 'HEAD', redirect: 'follow' });
          return NextResponse.json({ success: res.ok });
        } catch {
          return NextResponse.json({ success: false });
        }
      }

      // ── User ──────────────────────────────────────────────────────────────
      case 'upgrade-pro': {
        const result = await userDb.upgradePro(userId);
        return NextResponse.json(result);
      }

      case 'delete-logo': {
        const result = await userDb.deleteLogo(userId);
        return NextResponse.json(result);
      }

      // ── Admin ──────────────────────────────────────────────────────────────
      case 'update-paypal': {
        const result = await adminDb.updatePaypal(userId, req.paypalEmail);
        return NextResponse.json(result);
      }

      case 'get-earning-link-list': {
        const result = await adminDb.getEarningLinkList(req.userId, req.period);
        return NextResponse.json(result);
      }

      case 'link-report': {
        const result = await adminDb.linkReport(req.period, req.userName, req.url);
        return NextResponse.json(result);
      }

      case 'user-analytics': {
        const result = await adminDb.userAnalytics(req.userName, req.page, req.rowPerPage);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ success: false, message: 'Unknown endpoint' }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`POST /api/gateway/${params.path} error:`, error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
