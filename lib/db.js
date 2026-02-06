// lib/db.js
import { sql } from '@vercel/postgres';

export const db = {
    getInvoices: async () => {
        try {
            // Self-healing: Ensure table exists
            await sql`CREATE TABLE IF NOT EXISTS invoices (
                id TEXT PRIMARY KEY,
                vendor_name TEXT NOT NULL,
                invoice_number TEXT,
                date TEXT,
                amount DECIMAL(15, 2),
                status TEXT NOT NULL,
                category TEXT,
                due_date TEXT,
                cost_center TEXT,
                account_code TEXT,
                currency TEXT DEFAULT 'INR',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_url TEXT,
                po_number TEXT,
                matching_results JSONB
            )`;
            const { rows } = await sql`SELECT * FROM invoices ORDER BY created_at DESC`;
            // Map SQL snake_case to JS camelCase if needed, but here we kept them mostly similar
            return rows.map(row => ({
                ...row,
                vendorName: row.vendor_name,
                invoiceNumber: row.invoice_number,
                dueDate: row.due_date,
                costCenter: row.cost_center,
                accountCode: row.account_code,
                fileUrl: row.file_url,
                poNumber: row.po_number,
                matching: row.matching_results
            }));
        } catch (e) {
            console.error("Failed to fetch invoices from Postgres", e);
            return [];
        }
    },

    getInvoice: async (id) => {
        try {
            const { rows } = await sql`SELECT * FROM invoices WHERE id = ${id}`;
            if (rows.length === 0) return null;
            const row = rows[0];
            return {
                ...row,
                vendorName: row.vendor_name,
                invoiceNumber: row.invoice_number,
                dueDate: row.due_date,
                costCenter: row.cost_center,
                accountCode: row.account_code,
                fileUrl: row.file_url,
                poNumber: row.po_number,
                matching: row.matching_results
            };
        } catch (e) {
            console.error(`Failed to fetch invoice ${id} from Postgres`, e);
            return null;
        }
    },

    // --- Vendors ---
    getVendor: async (id) => {
        try {
            const { rows } = await sql`SELECT * FROM vendors WHERE id = ${id}`;
            return rows[0] || null;
        } catch (e) {
            console.error(`Failed to fetch vendor ${id}`, e);
            return null;
        }
    },

    getAllVendors: async () => {
        try {
            const { rows } = await sql`SELECT * FROM vendors ORDER BY name ASC`;
            return rows;
        } catch (e) {
            console.error("Failed to fetch vendors", e);
            return [];
        }
    },

    // --- Purchase Orders ---
    getPurchaseOrder: async (poNumber) => {
        try {
            // Fetch PO
            const { rows: poRows } = await sql`
                SELECT po.*, v.name as vendor_name 
                FROM purchase_orders po
                LEFT JOIN vendors v ON po.vendor_id = v.id
                WHERE po.po_number = ${poNumber}
            `;
            if (poRows.length === 0) return null;

            const po = poRows[0];

            // Fetch Items
            const { rows: itemRows } = await sql`SELECT * FROM po_items WHERE po_id = ${po.id}`;

            return {
                ...po,
                vendorName: po.vendor_name, // Alias for consistency
                totalAmount: po.total_amount,
                items: itemRows
            };
        } catch (e) {
            console.error(`Failed to fetch PO ${poNumber}`, e);
            return null;
        }
    },

    // --- Annexures ---
    getAnnexureByPO: async (poId) => {
        try {
            const { rows } = await sql`SELECT * FROM annexures WHERE po_id = ${poId}`;
            return rows[0] || null; // Assuming one active annexure per PO for simplicity, or return array
        } catch (e) {
            console.error(`Failed to fetch annexure for PO ${poId}`, e);
            return null;
        }
    },

    saveInvoice: async (id, data) => {
        try {
            // Self-Healing: Ensure schema supports new columns
            await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS file_url TEXT`;
            await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS po_number TEXT`;
            await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS matching_results JSONB`;

            // Upsert logic
            await sql`
                INSERT INTO invoices (
                    id, vendor_name, invoice_number, date, amount, status, 
                    category, due_date, cost_center, account_code, currency, file_url,
                    po_number, matching_results
                ) VALUES (
                    ${id}, ${data.vendorName || 'Pending Identification'}, ${data.invoiceNumber || ''}, ${data.date || ''}, 
                    ${data.amount || 0}, ${data.status}, ${data.category || ''}, 
                    ${data.dueDate || ''}, ${data.costCenter || ''}, ${data.accountCode || ''}, 
                    ${data.currency || 'INR'}, ${data.fileUrl || ''},
                    ${data.poNumber || ''}, ${JSON.stringify(data.matching || null)}
                )
                ON CONFLICT (id) DO UPDATE SET
                    vendor_name = EXCLUDED.vendor_name,
                    invoice_number = EXCLUDED.invoice_number,
                    date = EXCLUDED.date,
                    amount = EXCLUDED.amount,
                    status = EXCLUDED.status,
                    category = EXCLUDED.category,
                    due_date = EXCLUDED.due_date,
                    cost_center = EXCLUDED.cost_center,
                    account_code = EXCLUDED.account_code,
                    currency = EXCLUDED.currency,
                    file_url = EXCLUDED.file_url,
                    po_number = EXCLUDED.po_number,
                    matching_results = EXCLUDED.matching_results,
                    updated_at = CURRENT_TIMESTAMP
            `;

            // Also log to audit trail if it's a new or status change
            if (data.status) {
                await sql`
                    INSERT INTO audit_trail (invoice_id, username, action, details)
                    VALUES (${id}, 'System', 'UPDATE', ${`Status updated to ${data.status}`})
                `;
            }

            const { rows } = await sql`SELECT * FROM invoices WHERE id = ${id}`;
            const row = rows[0];
            return {
                ...row,
                vendorName: row.vendor_name,
                invoiceNumber: row.invoice_number,
                dueDate: row.due_date,
                costCenter: row.cost_center,
                accountCode: row.account_code,
                fileUrl: row.file_url,
                poNumber: row.po_number,
                matching: row.matching_results
            };
        } catch (e) {
            console.error(`Failed to save invoice ${id} to Postgres`, e);
            throw e;
        }
    },

    deleteInvoice: async (id) => {
        try {
            await sql`DELETE FROM invoices WHERE id = ${id}`;
        } catch (e) {
            console.error(`Failed to delete invoice ${id} from Postgres`, e);
            throw e;
        }
    },

    // --- Users ---
    getUserByEmail: async (email) => {
        try {
            const { rows } = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
            return rows[0] || null;
        } catch (e) {
            console.error(`Failed to fetch user by email: ${email}`, e);
            return null;
        }
    },

    getUserById: async (id) => {
        try {
            const { rows } = await sql`SELECT id, name, email, role FROM users WHERE id = ${id}`;
            return rows[0] || null;
        } catch (e) {
            console.error(`Failed to fetch user by id: ${id}`, e);
            return null;
        }
    },

    createUser: async (user) => {
        try {
            // Self-healing: ensure users table exists (though we added to schema.sql, this is safer for existing installs)
            await sql`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            await sql`
                INSERT INTO users (id, name, email, password_hash, role)
                VALUES (${user.id}, ${user.name}, ${user.email.toLowerCase()}, ${user.passwordHash}, ${user.role})
            `;
            const { rows } = await sql`SELECT id, name, email, role FROM users WHERE id = ${user.id}`;
            return rows[0];
        } catch (e) {
            console.error("Failed to create user", e);
            throw e;
        }
    },

    // --- Seeding & ERP Creation Helpers ---
    createVendor: async (vendor) => {
        try {
            await sql`
                INSERT INTO vendors (id, name, email, phone, address, tax_id)
                VALUES (${vendor.id}, ${vendor.name}, ${vendor.email}, ${vendor.phone}, ${vendor.address}, ${vendor.tax_id})
                ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
            `;
            return vendor;
        } catch (e) {
            console.error("Failed to create vendor", e);
            throw e;
        }
    },

    createPurchaseOrder: async (po) => {
        try {
            await sql`
                INSERT INTO purchase_orders (id, po_number, vendor_id, date, total_amount, currency, status)
                VALUES (${po.id}, ${po.poNumber}, ${po.vendorId}, ${po.date}, ${po.totalAmount}, ${po.currency || 'INR'}, ${po.status || 'OPEN'})
                ON CONFLICT (id) DO UPDATE SET total_amount = EXCLUDED.total_amount, status = EXCLUDED.status
            `;

            if (po.items && po.items.length > 0) {
                // Clear old items
                await sql`DELETE FROM po_items WHERE po_id = ${po.id}`;
                // Insert new items
                for (const item of po.items) {
                    await sql`
                        INSERT INTO po_items (po_id, description, quantity, unit_price, amount, gl_account)
                        VALUES (${po.id}, ${item.description}, ${item.quantity}, ${item.unitPrice}, ${item.amount}, ${item.glAccount})
                    `;
                }
            }
            return po;
        } catch (e) {
            console.error("Failed to create PO", e);
            throw e;
        }
    },

    createAnnexure: async (annexure) => {
        try {
            await sql`
                INSERT INTO annexures (id, annexure_number, po_id, original_amount, approved_amount, description, status)
                VALUES (${annexure.id}, ${annexure.annexureNumber}, ${annexure.poId}, ${annexure.originalAmount}, ${annexure.approvedAmount}, ${annexure.description}, ${annexure.status || 'APPROVED'})
                ON CONFLICT (id) DO UPDATE SET approved_amount = EXCLUDED.approved_amount, status = EXCLUDED.status
            `;
            return annexure;
        } catch (e) {
            console.error("Failed to create annexure", e);
            throw e;
        }
    },

    createAuditTrailEntry: async (entry) => {
        try {
            await sql`
                INSERT INTO audit_trail (invoice_id, username, action, details)
                VALUES (${entry.invoice_id}, ${entry.username}, ${entry.action}, ${entry.details})
            `;
        } catch (e) {
            console.error("Failed to create audit trail entry", e);
            throw e;
        }
    },

    // --- Delegation (FR-5) ---
    getDelegation: async (username) => {
        try {
            // Self-healing table check
            await sql`
                CREATE TABLE IF NOT EXISTS delegations (
                    id SERIAL PRIMARY KEY,
                    delegate_from TEXT NOT NULL,
                    delegate_to TEXT NOT NULL,
                    active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            const { rows } = await sql`SELECT * FROM delegations WHERE delegate_from = ${username} AND active = TRUE`;
            return rows[0] || null;
        } catch (e) {
            console.error("Failed to get delegation", e);
            return null;
        }
    },

    setDelegation: async (from, to) => {
        try {
            // Deactivate old ones
            await sql`UPDATE delegations SET active = FALSE WHERE delegate_from = ${from}`;

            await sql`
                INSERT INTO delegations (delegate_from, delegate_to, active)
                VALUES (${from}, ${to}, TRUE)
            `;
        } catch (e) {
            console.error("Failed to set delegation", e);
            throw e;
        }
    },

    getAuditTrail: async (invoiceId) => {
        try {
            const { rows } = await sql`
                SELECT * FROM audit_trail 
                WHERE invoice_id = ${invoiceId} 
                ORDER BY timestamp DESC
            `;
            return rows;
        } catch (e) {
            console.error("Failed to fetch audit trail", e);
            return [];
        }
    },

    getAllAuditLogs: async (limit = 100) => {
        try {
            const { rows } = await sql`
                SELECT * FROM audit_trail 
                ORDER BY timestamp DESC 
                LIMIT ${limit}
            `;
            return rows;
        } catch (e) {
            console.error("Failed to fetch all audit logs", e);
            return [];
        }
    }
};
