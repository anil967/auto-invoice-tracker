import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ROLES } from '@/constants/roles';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const userRole = request.headers.get('x-user-role');

    // Strict RBAC: Only Admin, Finance Manager, and Auditor can view complete audit logs
    if (![ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.AUDITOR].includes(userRole)) {
        return NextResponse.json({ error: 'Access denied. Audit logs are restricted to authorized personnel.' }, { status: 403 });
    }

    try {
        const url = new URL(request.url);
        const invoiceId = url.searchParams.get('invoiceId');

        let logs;
        if (invoiceId) {
            logs = await db.getAuditTrail(invoiceId);
        } else {
            // Fetch all audit entries for system-wide review (Admin/Auditor)
            logs = await db.getAllAuditLogs(100);
        }

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Audit log fetch error:', error);
        return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
    }
}
