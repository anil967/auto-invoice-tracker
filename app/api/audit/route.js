import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';
import { ROLES } from '@/constants/roles';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const currentUser = await getCurrentUser();

        // Strict RBAC: Only Admin, Finance Manager, and Auditor can view complete audit logs
        if (!currentUser || ![ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.AUDITOR].includes(currentUser.role)) {
            return NextResponse.json({ error: 'Access denied. Audit logs are restricted.' }, { status: 403 });
        }

        const url = new URL(request.url);
        const invoiceId = url.searchParams.get('invoiceId');
        const limit = parseInt(url.searchParams.get('limit') || '100');

        let logs;
        if (invoiceId) {
            logs = await db.getAuditTrail(invoiceId);
        } else {
            logs = await db.getAllAuditLogs(limit);
        }

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Audit log fetch error:', error);
        return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
    }
}
