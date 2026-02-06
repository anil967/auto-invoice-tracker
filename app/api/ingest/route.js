import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processInvoice } from '@/lib/processor';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Write file
        const filePath = join(uploadDir, filename);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${filename}`;

        const invoiceId = `INV-${uuidv4().slice(0, 8).toUpperCase()}`;
        const invoiceMetadata = {
            id: invoiceId,
            originalName: file.name,
            fileUrl: fileUrl, // Store accessible URL
            status: 'RECEIVED',
            receivedAt: new Date().toISOString(),
            ingestedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            logs: []
        };

        // Save initial state
        await db.saveInvoice(invoiceId, invoiceMetadata);

        // Perform processing inline (Simulation)
        // NOTE: In production serverless, you'd use a background worker like Vercel Functions with Upstash QStash.
        const result = await processInvoice(invoiceId, buffer); // Pass buffer for "OCR"

        if (result.success) {
            await db.saveInvoice(invoiceId, {
                ...result.data,
                fileUrl: fileUrl, // Ensure it persists
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
