import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const invoices = await db.getInvoices();
    return NextResponse.json(invoices.sort((a, b) =>
        new Date(b.receivedAt || b.updatedAt || b.created_at) - new Date(a.receivedAt || a.updatedAt || a.created_at)
    ));
}
