import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const invoices = await db.getInvoices();

    // 1. Cycle Time Calculation
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID' && inv.paidAt && inv.ingestedAt);
    const avgCycleTime = paidInvoices.length > 0
        ? paidInvoices.reduce((acc, inv) => acc + (new Date(inv.paidAt) - new Date(inv.ingestedAt)), 0) / paidInvoices.length
        : 0;

    // 2. OCR Accuracy (Average confidence)
    const processedInvoices = invoices.filter(inv => inv.confidence !== undefined);
    const avgConfidence = processedInvoices.length > 0
        ? processedInvoices.reduce((acc, inv) => acc + (inv.confidence || 0), 0) / processedInvoices.length
        : 0.95; // Default target

    // 3. Status Distribution
    const statusCounts = invoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
    }, {});

    // 4. Volume by Category
    const categoryVolume = invoices.reduce((acc, inv) => {
        const cat = inv.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    return NextResponse.json({
        metrics: {
            avgCycleTimeHours: (avgCycleTime / (1000 * 60 * 60)).toFixed(1),
            ocrAccuracy: (avgConfidence * 100).toFixed(1),
            totalInvoices: invoices.length,
            paidInvoices: paidInvoices.length,
            savingsEstimated: (paidInvoices.length * 45).toFixed(0)
        },
        volumeOverTime: [
            { name: 'Mon', value: 4 },
            { name: 'Tue', value: 7 },
            { name: 'Wed', value: 5 },
            { name: 'Thu', value: 9 },
            { name: 'Fri', value: 12 },
        ],
        statusCounts,
        categoryVolume
    });
}
