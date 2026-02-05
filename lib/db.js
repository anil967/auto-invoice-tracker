// lib/db.js
// This is a placeholder for a persistent database.
// In a production environment (Vercel), you would replace this 
// with a Vercel Postgres, Supabase, or MongoDB client.

let globalInvoices = {};

// For now, we'll try to persist to a JSON file if on local, 
// though this won't work on Serverless production.
import fs from 'fs';
import path from 'path';
const DB_PATH = path.join(process.cwd(), 'invoices_db.json');

const loadDb = () => {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            globalInvoices = JSON.parse(data);
        }
    } catch (e) {
        console.error("Failed to load DB", e);
    }
};

const saveDb = () => {
    try {
        // Note: FS operations won't work in Vercel Serverless production!
        // This is strictly for local dev during migration.
        fs.writeFileSync(DB_PATH, JSON.stringify(globalInvoices, null, 2));
    } catch (e) {
        // Fail silently in read-only envs
    }
};

// Initialize
loadDb();

export const db = {
    getInvoices: () => Object.values(globalInvoices),
    getInvoice: (id) => globalInvoices[id],
    saveInvoice: (id, data) => {
        globalInvoices[id] = { ...globalInvoices[id], ...data };
        saveDb();
        return globalInvoices[id];
    },
    deleteInvoice: (id) => {
        delete globalInvoices[id];
        saveDb();
    }
};
