// lib/db.js
import { sql } from '@vercel/postgres';

export const db = {
    getInvoices: async () => {
        try {
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
            // Self-Healing: Ensure schema supports file storage (Base64)
            await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS file_url TEXT`;

            // Upsert logic
            await sql`
                INSERT INTO invoices (
                    id, vendor_name, invoice_number, date, amount, status, 
                    category, due_date, cost_center, account_code, currency, file_url
                ) VALUES (
                    ${id}, ${data.vendorName || 'Pending Identification'}, ${data.invoiceNumber || ''}, ${data.date || ''}, 
                    ${data.amount || 0}, ${data.status}, ${data.category || ''}, 
                    ${data.dueDate || ''}, ${data.costCenter || ''}, ${data.accountCode || ''}, 
                    ${data.currency || 'INR'}, ${data.fileUrl || ''}
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
    }
};
