import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/my-qr', '/records', '/profile'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function middleware(request: NextRequest) {
  const session = request.cookies.get('health-session');
  const { pathname } = request.nextUrl;

  // If logged in and trying to access login or register page, redirect to home
  if (session?.value && (pathname === '/login' || pathname === '/register')) {
    const homeUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Only protect specific routes — emergency flow, responder, family, triage,
  // matching, status, scan-qr, and all API routes stay public
  if (!session?.value && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/* (all API routes handle their own auth)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
