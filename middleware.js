import { NextResponse } from 'next/server';

// App version for cache busting
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

export async function middleware(request) {
    const response = NextResponse.next();
    const sessionCookie = request.cookies.get('session');
    const { pathname } = request.nextUrl;

    // Define public routes
    const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname.startsWith('/api/auth') || pathname.startsWith('/api/debug');

    // Add app version header for cache busting
    response.headers.set('X-App-Version', APP_VERSION);

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Content Security Policy (CSP)
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://subtle-druid-430b16.netlify.app https://vercel.live https://va.vercel-scripts.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' data: https: blob:;
        font-src 'self' data: https://fonts.gstatic.com;
        connect-src 'self' https://vercel.live https://va.vercel-scripts.com;
        frame-ancestors 'self';
    `.replace(/\s{2,}/g, ' ').trim();
    response.headers.set('Content-Security-Policy', cspHeader);

    // CORS headers for API routes
    if (pathname.startsWith('/api/')) {
        response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role');

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, { status: 200, headers: response.headers });
        }
    }

    // Auth protection & Role Header Injection
    if (sessionCookie) {
        try {
            // Decrypt session to get role
            const { decrypt } = await import('@/lib/auth');
            const session = await decrypt(sessionCookie.value);
            const userRole = session.user.role;

            // Set role header for internal API use
            response.headers.set('x-user-role', userRole);

            // Redirect to dashboard if logged in and trying to access login/signup
            if (pathname === '/login' || pathname === '/signup') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch (e) {
            console.error("Middleware session decryption failed", e);
            // If session is invalid, clear it and redirect if not public
            if (!isPublicRoute && !pathname.includes('.')) {
                const redirect = NextResponse.redirect(new URL('/login', request.url));
                redirect.cookies.set('session', '', { expires: new Date(0) });
                return redirect;
            }
        }
    } else if (!isPublicRoute && !pathname.includes('.')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Add cache control for HTML pages - prevent stale UI
    if (!pathname.startsWith('/api/') &&
        !pathname.startsWith('/_next/') &&
        !pathname.startsWith('/uploads/')) {
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
