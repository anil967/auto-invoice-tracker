import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendStatusNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    const { id } = params;
    const { action, comments } = await request.json();

    const invoice = await db.getInvoice(id);
    if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    let nextStatus = invoice.status;
    const timestampUpdates = {};

    if (action === 'APPROVE') {
        if (invoice.status === 'VERIFIED') {
            nextStatus = 'PENDING_APPROVAL';
            timestampUpdates.approvedAt = new Date().toISOString();
        } else if (invoice.status === 'PENDING_APPROVAL') {
            const userRole = request.headers.get('x-user-role');
            if (userRole !== 'Finance Manager' && userRole !== 'Admin') {
                return NextResponse.json({ error: 'Only a Finance Manager or Admin can release funds.' }, { status: 403 });
            }
            nextStatus = 'PAID';
            timestampUpdates.paidAt = new Date().toISOString();
        }
    } else if (action === 'REJECT') {
        nextStatus = 'REJECTED';
    } else if (action === 'RESET') {
        nextStatus = 'RECEIVED';
    }

    const updatedInvoice = await db.saveInvoice(id, {
        ...timestampUpdates,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        workflowLogs: [
            ...(invoice.workflowLogs || []),
            {
                timestamp: new Date().toISOString(),
                action,
                fromStatus: invoice.status,
                toStatus: nextStatus,
                comments: comments || "Batch workflow update"
            }
        ]
    });

    // Trigger simulated notification
    await sendStatusNotification(updatedInvoice, nextStatus);

    return NextResponse.json({
        message: 'Workflow updated successfully',
        invoice: updatedInvoice
    });
}
