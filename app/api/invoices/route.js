import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const invoices = db.getInvoices();
    return NextResponse.json(invoices.sort((a, b) =>
        new Date(b.receivedAt || b.updatedAt) - new Date(a.receivedAt || a.updatedAt)
    ));
}
