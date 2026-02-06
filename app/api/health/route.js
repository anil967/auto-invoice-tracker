import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring
 */
export async function GET() {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    };

    // Check database connection
    try {
        const { sql } = await import('@vercel/postgres');
        await sql`SELECT 1`;
        health.database = 'connected';
    } catch (error) {
        health.database = 'disconnected';
        health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(health, {
        status: statusCode,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    });
}
