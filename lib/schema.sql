-- lib/schema.sql
-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
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
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_trail table
CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username TEXT,
    action TEXT,
    details TEXT
);
