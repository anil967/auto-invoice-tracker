import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ROLES } from '@/constants/roles';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        console.log("[Seed] Starting ERP Data Seed...");

        // 0. Seed Users
        const salt = await bcrypt.genSalt(10);
        const financePassword = await bcrypt.hash('financeuser@gmail.com', salt);

        const users = [
            {
                id: 'u-finance-01',
                name: 'Finance User',
                email: 'financeuser@gmail.com',
                passwordHash: financePassword,
                role: ROLES.FINANCE_USER
            }
        ];

        await Promise.all(users.map(u => db.createUser(u)));


        // 1. Seed Vendors
        const vendors = [
            { id: 'v-001', name: 'Acme solutions', email: 'billing@acme.com', phone: '123-456-7890', address: '123 Acme St, NY', tax_id: 'TX-1001' },
            { id: 'v-002', name: 'Global Tech Inc', email: 'invoices@globaltech.com', phone: '987-654-3210', address: '456 Tech Park, CA', tax_id: 'TX-2002' },
            { id: 'v-003', name: 'Office Depot', email: 'supply@officedepot.com', phone: '555-0199', address: '789 Supply Ave, FL', tax_id: 'TX-3003' }
        ];

        // 1. Seed Variants (Parallel)
        await Promise.all(vendors.map(v => db.createVendor(v)));

        // 2. Seed Purchase Orders
        const pos = [
            {
                id: 'po-001',
                poNumber: 'PO-2026-001',
                vendorId: 'v-001',
                date: '2026-02-01',
                totalAmount: 50000.00,
                currency: 'INR',
                status: 'OPEN',
                items: [
                    { description: 'Cloud infrastructure - Feb', quantity: 1, unitPrice: 45000.00, amount: 45000.00, glAccount: 'GL-5000' },
                    { description: 'Setup Fee', quantity: 1, unitPrice: 5000.00, amount: 5000.00, glAccount: 'GL-5001' }
                ]
            },
            {
                id: 'po-002',
                poNumber: 'PO-2026-002',
                vendorId: 'v-002',
                date: '2026-01-15',
                totalAmount: 125000.00,
                currency: 'INR',
                status: 'OPEN',
                items: [
                    { description: 'Software Development Services', quantity: 100, unitPrice: 1250.00, amount: 125000.00, glAccount: 'GL-6000' }
                ]
            }
        ];

        await Promise.all(pos.map(po => db.createPurchaseOrder(po)));

        // 3. Seed Ringi Annexures
        const annexures = [
            {
                id: 'ax-001',
                annexureNumber: 'RINGI-2026-A1',
                poId: 'po-001',
                originalAmount: 60000.00,
                approvedAmount: 55000.00,
                description: 'Digital Transformation Project - Phase 1',
                status: 'APPROVED'
            }
        ];

        await Promise.all(annexures.map(ax => db.createAnnexure(ax)));

        // 4. Seed Users
        const passwordHash = '$2a$10$X7SV.u.Zk/k/k/k/k/k/k.eX7SV.u.Zk/k/k/k/k/k/k'; // Pre-hashed 'financeuser@gmail.com' or similar to avoid bcrypt import issues if not present?
        // Actually best to use bcrypt if available. db.createUser expects passwordHash.
        // Let's use a known hash for 'financeuser@gmail.com' to avoid import complexity or compute time?
        // Hash for 'financeuser@gmail.com' is: $2a$10$abcdefghijklmnopqrstuv
        // I will use a simple one: 'password123' -> $2a$10$YourHashHere
        // Better: import bcrypt.

        // Wait, I can't easily import bcrypt if I don't know if it's installed in this scope (it is in package.json).
        // I'll import bcrypt at top.

        // REPLACING WITH REAL CODE BELOW


        console.log("[Seed] ERP Data Seed Completed.");

        return NextResponse.json({
            message: 'ERP seed successful',
            counts: {
                users: users.length,
                vendors: vendors.length,
                pos: pos.length,
                annexures: annexures.length
            }
        });

    } catch (error) {
        console.error("[Seed] ERP Seed error:", error);
        return NextResponse.json({ error: 'Failed to seed ERP data' }, { status: 500 });
    }
}
