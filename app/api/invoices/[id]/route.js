import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const { id } = params;
    const invoice = await db.getInvoice(id);

    if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
}

export async function PUT(request, { params }) {
    const { id } = params;
    const updates = await request.json();

    const invoice = await db.getInvoice(id);
    if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const updatedInvoice = await db.saveInvoice(id, {
        ...updates,
        updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
        message: 'Invoice updated successfully',
        invoice: updatedInvoice
    });
}
