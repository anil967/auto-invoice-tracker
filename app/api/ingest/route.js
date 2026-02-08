import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processInvoice } from '@/lib/processor';
import { getCurrentUser } from '@/lib/server-auth';
import { ROLES } from '@/constants/roles';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Get the authenticated user to associate invoice with vendor
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Vercel Fix: Do not write to filesystem (read-only).
        // Convert to Base64 Data URI for immediate access/preview.
        const base64String = buffer.toString('base64');
        const mimeType = file.type || 'application/pdf'; // Default or actual
        const fileUrl = `data:${mimeType};base64,${base64String}`;

        const invoiceId = `INV-${uuidv4().slice(0, 8).toUpperCase()}`;
        const receivedAt = new Date().toISOString();
        const invoiceMetadata = {
            id: invoiceId,
            vendorName: user.role === ROLES.VENDOR ? user.name : 'Pending Identification',
            submittedByUserId: user.id, // So vendor list filters by user.id and updates correctly
            originalName: file.name,
            fileUrl: fileUrl,
            status: 'RECEIVED',
            receivedAt,
            auditUsername: user.name || 'Vendor',
            auditAction: 'SUBMIT',
            auditDetails: `Invoice "${file.name}" submitted via vendor portal (${user.role === ROLES.VENDOR ? 'Vendor' : user.role})`
        };

        // Persist to DB and create audit trail (Admin can see via Audit log - RBAC)
        await db.saveInvoice(invoiceId, invoiceMetadata);

        // Perform processing inline (Simulation)
        const result = await processInvoice(invoiceId, buffer);

        if (result.success) {
            await db.saveInvoice(invoiceId, {
                ...result.data,
                // Preserve vendor identity – IDP may overwrite with mock data
                submittedByUserId: invoiceMetadata.submittedByUserId,
                vendorName: invoiceMetadata.vendorName,
                fileUrl: fileUrl,
                validation: result.validation,
                matching: result.matching,
                status: (result.validation.isValid && result.matching?.isMatched) ? 'VERIFIED' :
                    (result.status || (!result.validation.isValid ? 'VALIDATION_REQUIRED' : 'MATCH_DISCREPANCY')),
                processedAt: new Date().toISOString(),
                digitizedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({
            message: 'Invoice received and processing started',
            invoice: await db.getInvoice(invoiceId)
        });

    } catch (error) {
        console.error('Ingestion error:', error);
        return NextResponse.json({ error: 'Failed to process invoice ingestion' }, { status: 500 });
    }
}
