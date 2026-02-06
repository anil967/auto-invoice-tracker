import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const invoices = await db.getInvoices();
        return NextResponse.json(invoices.sort((a, b) =>
            new Date(b.receivedAt || b.updatedAt || b.created_at) - new Date(a.receivedAt || a.updatedAt || a.created_at)
        ));
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices', details: error.message },
            { status: 500 }
        );
    }
}
