import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendStatusNotification } from '@/lib/notifications';
import { getCurrentUser } from '@/lib/server-auth';


export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    const { id } = await params;
    const { action, comments } = await request.json();

    // Strict Auth Check
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = user.role;
    const { ROLES } = await import('@/constants/roles');

    const invoice = await db.getInvoice(id);
    if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    let nextStatus = invoice.status;
    const timestampUpdates = {};
    const auditLog = {
        invoice_id: id,
        username: userRole || 'System',
        action: action,
        details: comments || `Action ${action} performed on invoice ${id}`
    };

    // State Machine (FR-5, FR-6)
    try {
        if (action === 'APPROVE') {
            if (invoice.status === 'VERIFIED') {
                // Project Manager Approval
                if (userRole !== ROLES.PROJECT_MANAGER && userRole !== ROLES.ADMIN) {
                    return NextResponse.json({ error: 'Only a Project Manager can approve verified invoices.' }, { status: 403 });
                }
                nextStatus = 'PENDING_APPROVAL';
                timestampUpdates.pmApprovedAt = new Date().toISOString();
                auditLog.details = `PM Approved: ${comments || 'No comments'}`;
            } else if (invoice.status === 'PENDING_APPROVAL') {
                // Finance Manager Approval (Final Payment Release)
                if (userRole !== ROLES.FINANCE_MANAGER && userRole !== ROLES.ADMIN) {
                    return NextResponse.json({ error: 'Only a Finance Manager can release final payment.' }, { status: 403 });
                }
                nextStatus = 'PAID';
                timestampUpdates.paidAt = new Date().toISOString();
                auditLog.details = `Finance Released Payment: ${comments || 'No comments'}`;
            } else if (invoice.status === 'MATCH_DISCREPANCY' || invoice.status === 'VALIDATION_REQUIRED') {
                // Manual overrides for discrepancies
                if (![ROLES.ADMIN, ROLES.FINANCE_USER, ROLES.FINANCE_MANAGER].includes(userRole)) {
                    return NextResponse.json({ error: 'Unauthorized to resolve discrepancies.' }, { status: 403 });
                }
                nextStatus = 'VERIFIED';
                auditLog.details = `Manual Override/Resolution: ${comments || 'No comments'}`;
            }
        } else if (action === 'REJECT') {
            if (![ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.FINANCE_MANAGER, ROLES.FINANCE_USER].includes(userRole)) {
                return NextResponse.json({ error: 'Unauthorized to reject invoices.' }, { status: 403 });
            }
            nextStatus = 'REJECTED';
            auditLog.details = `Rejected by ${userRole}: ${comments || 'No reasons provided'}`;
        } else if (action === 'REQUEST_INFO') {
            if (userRole !== ROLES.PROJECT_MANAGER && userRole !== ROLES.ADMIN) {
                return NextResponse.json({ error: 'Only PMs can request info from vendors.' }, { status: 403 });
            }
            nextStatus = 'AWAITING_INFO';
            auditLog.details = `More Info Requested: ${comments || 'No specific requests'}`;
        }

        const updatedInvoice = await db.saveInvoice(id, {
            ...timestampUpdates,
            status: nextStatus,
            updatedAt: new Date().toISOString()
        });

        // Detailed Audit Trail entry
        // We can use a direct SQL call or extending db.saveInvoice
        // The saveInvoice already inserts into audit_trail, but let's make it more specific
        await db.createAuditTrailEntry(auditLog);

        // Trigger simulated notification
        await sendStatusNotification(updatedInvoice, nextStatus);

        return NextResponse.json({
            message: `Invoice moved to ${nextStatus}`,
            invoice: updatedInvoice
        });

    } catch (error) {
        console.error('Workflow error:', error);
        return NextResponse.json({ error: 'Workflow transition failed' }, { status: 500 });
    }
}
