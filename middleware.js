import { NextResponse } from 'next/server';

// App version for cache busting
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

export function middleware(request) {
    const response = NextResponse.next();

    // Add app version header for cache busting
    response.headers.set('X-App-Version', APP_VERSION);

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // CORS headers for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role');

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, { status: 200, headers: response.headers });
        }
    }

    // Add cache control for HTML pages - prevent stale UI
    if (!request.nextUrl.pathname.startsWith('/api/') &&
        !request.nextUrl.pathname.startsWith('/_next/') &&
        !request.nextUrl.pathname.startsWith('/uploads/')) {
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
}

// Configure which routes use this middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
