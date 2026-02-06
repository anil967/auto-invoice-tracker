import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ROLES } from '@/constants/roles';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        console.log("[Seed] Starting ERP Data Seed...");

        // 0. Seed Users
        // 0. Seed Users with Consistent Password
        const salt = await bcrypt.genSalt(10);
        const defaultPasswordHash = await bcrypt.hash('Password123!', salt); // Common password for all demo users

        const users = [
            // 1. Admin
            {
                id: 'u-admin-01',
                name: 'System Admin',
                email: 'admin@invoiceflow.com',
                passwordHash: defaultPasswordHash,
                role: ROLES.ADMIN,
                assignedProjects: [],
                vendorId: null
            },
            // 2. Finance Manager
            {
                id: 'u-fin-mgr-01',
                name: 'Finance Manager',
                email: 'financemanager@invoiceflow.com',
                passwordHash: defaultPasswordHash,
                role: ROLES.FINANCE_MANAGER,
                assignedProjects: [],
                vendorId: null
            },
            // 3. Project Manager (with assigned projects)
            {
                id: 'u-pm-01',
                name: 'Project Manager',
                email: 'pm@invoiceflow.com',
                passwordHash: defaultPasswordHash,
                role: ROLES.PROJECT_MANAGER,
                assignedProjects: ['Project Alpha', 'Cloud Migration'], // Critical for testing RBAC
                vendorId: null
            },
            // 4. Finance User (Operational)
            {
                id: 'u-finance-01',
                name: 'Finance User',
                email: 'financeuser@gmail.com', // Keeping legacy email for continuity
                passwordHash: defaultPasswordHash,
                role: ROLES.FINANCE_USER,
                assignedProjects: [],
                vendorId: null
            },
            // 5. Vendor (Linked to Acme Solutions)
            {
                id: 'u-vendor-01',
                name: 'Acme Solutions', // Must match Vendor Name for current simple mapping
                email: 'vendor@acme.com',
                passwordHash: defaultPasswordHash,
                role: ROLES.VENDOR,
                assignedProjects: [],
                vendorId: 'v-001'
            },
            // 6. Auditor (Read-only)
            {
                id: 'u-auditor-01',
                name: 'Compliance Auditor',
                email: 'auditor@invoiceflow.com',
                passwordHash: defaultPasswordHash,
                role: ROLES.AUDITOR,
                assignedProjects: [],
                vendorId: null
            }
        ];

        // Ensure unique creation by email
        for (const user of users) {
            const existing = await db.getUserByEmail(user.email);
            if (!existing) {
                await db.createUser(user);
            } else {
                // Optional: Update password/role if needed, but for now we skip to preserve custom changes
                console.log(`User ${user.email} already exists, skipping creation.`);
                // Force update role/projects for testing consistency?
                // Let's force update to ensure RBAC works immediately
                await db.createUser(user);
            }
        }


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
