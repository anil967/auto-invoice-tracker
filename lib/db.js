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
            };
        } catch (e) {
            console.error(`Failed to fetch invoice ${id} from Postgres`, e);
            return null;
        }
    },

    saveInvoice: async (id, data) => {
        try {
            // Upsert logic
            await sql`
                INSERT INTO invoices (
                    id, vendor_name, invoice_number, date, amount, status, 
                    category, due_date, cost_center, account_code, currency
                ) VALUES (
                    ${id}, ${data.vendorName}, ${data.invoiceNumber || ''}, ${data.date || ''}, 
                    ${data.amount || 0}, ${data.status}, ${data.category || ''}, 
                    ${data.dueDate || ''}, ${data.costCenter || ''}, ${data.accountCode || ''}, 
                    ${data.currency || 'INR'}
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
