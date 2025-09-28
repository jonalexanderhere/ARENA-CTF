import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export async function middleware(request: NextRequestWithAuth) {
  const response = NextResponse.next();
  
  // Add performance headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add caching headers for static assets
  if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Add caching headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Cache API responses for 1 minute by default
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
  }
  
  // Add compression headers
  response.headers.set('Vary', 'Accept-Encoding');
  
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');

  if (isAdminRoute) {
    if (!token?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/admin/:path*'],
}; 