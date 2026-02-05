require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { UPLOADS_DIR } = require('./config');

// Middleware
app.use(cors());
app.use(express.json());

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = require('path').extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
    }
});

const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Invoice Tracking System API' });
});

const invoiceProcessor = require('./processor');
const path = require('path');

// In-memory "DB" for now
const invoicesState = {};

const fs = require('fs');

// Handle Processing Completion
invoiceProcessor.on('completed', ({ invoiceId, data, validation, matching }) => {
    console.log(`[Server] Updating state for ${invoiceId}`);

    const isMockPO = !data.poNumber || data.poNumber === "PO-2026-001";

    invoicesState[invoiceId] = {
        ...invoicesState[invoiceId],
        ...data,
        validation,
        matching,
        status: (validation.isValid && matching?.isMatched) ? 'Verified' :
            (!validation.isValid ? 'Validation Required' : 'Match Discrepancy'),
        processedAt: new Date(),
        digitizedAt: new Date(), // Phase 11
        matchingNotes: isMockPO ? "Note: Invoice matched against default mock PO." : ""
    };
    savePersistedState();
});

const savePersistedState = () => {
    try {
        fs.writeFileSync(path.join(__dirname, 'invoices_db.json'), JSON.stringify(invoicesState, null, 2));
    } catch (e) {
        console.error("Failed to persist state", e);
    }
};

// FR-5: Automated Reminders (Simulation)
setInterval(() => {
    const now = new Date();
    Object.values(invoicesState).forEach(inv => {
        if (inv.status === 'Verified' || inv.status === 'Pending Approval') {
            const processedAt = new Date(inv.processedAt || inv.receivedAt);
            const diffHours = (now - processedAt) / (1000 * 60 * 60);
            if (diffHours > 48) {
                console.log(`[Reminder] ALERT: Invoice ${inv.id} has been stale for ${Math.floor(diffHours)} hours. Pinging assigned PM...`);
            }
        }
    });
}, 60000); // Check every minute for simulation purposes

// Load initial state
try {
    const dbPath = path.join(__dirname, 'invoices_db.json');
    if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        Object.assign(invoicesState, JSON.parse(data));
        console.log(`[Server] Loaded ${Object.keys(invoicesState).length} invoices from disk.`);
    }
} catch (e) {
    console.error("Failed to load persisted state", e);
}

// FR-1: Invoice Ingestion
app.post('/api/ingest', upload.single('invoice'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const invoiceId = `INV-${uuidv4().substring(0, 8).toUpperCase()}`;
        const filePath = path.join(UPLOADS_DIR, req.file.filename);

        const invoiceMetadata = {
            id: invoiceId,
            originalName: req.file.originalname,
            filename: req.file.filename,
            status: 'RECEIVED',
            receivedAt: new Date(),
            ingestedAt: new Date(), // Phase 11
            updatedAt: new Date(),
            logs: []
        };

        // Save to state
        invoicesState[invoiceId] = invoiceMetadata;

        // Trigger Asynchronous Processing (Phase 2)
        invoiceProcessor.emit('process', invoiceId, filePath);

        // FR-1: Acknowledgment notification
        sendStatusNotification(invoiceMetadata, 'RECEIVED');

        savePersistedState();

        res.status(201).json({
            message: 'Invoice received and processing started',
            invoice: invoiceMetadata
        });
    } catch (error) {
        console.error('Ingestion error:', error);
        res.status(500).json({ error: 'Failed to process invoice ingestion' });
    }
});

const { sendStatusNotification } = require('./services/notificationService');

// NEW: Workflow Transition (Approve/Reject)
app.post('/api/invoices/:id/workflow', async (req, res) => {
    const { id } = req.params;
    const { action, comments } = req.body; // action: 'APPROVE', 'REJECT', 'RESET'

    const invoice = invoicesState[id];
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    let nextStatus = invoice.status;
    if (action === 'APPROVE') {
        if (invoice.status === 'VERIFIED') nextStatus = 'PENDING_APPROVAL';
        else if (invoice.status === 'PENDING_APPROVAL') {
            // Phase 10: Granular Permission Check
            const userRole = req.headers['x-user-role'];
            if (userRole !== 'Finance Manager' && userRole !== 'Admin') {
                return res.status(403).json({ error: 'Only a Finance Manager or Admin can release funds for payment.' });
            }
            nextStatus = 'PAID';
        }
    } else if (action === 'REJECT') {
        nextStatus = 'REJECTED';
    } else if (action === 'RESET') {
        nextStatus = 'RECEIVED';
    }

    if (nextStatus === invoice.status && action !== 'RESET') {
        return res.status(400).json({ error: `Invalid action '${action}' for current status '${invoice.status}'` });
    }

    // Phase 11: Lifecycle Timestamps
    const timestampUpdates = {};
    if (nextStatus === 'Verified') timestampUpdates.verifiedAt = new Date();
    if (nextStatus === 'Pending Approval') timestampUpdates.approvedAt = new Date();
    if (nextStatus === 'PAID') timestampUpdates.paidAt = new Date();

    console.log(`[Workflow] Invoice ${id} transition: ${invoice.status} -> ${nextStatus}`);

    const prevStatus = invoice.status;
    invoicesState[id] = {
        ...invoice,
        ...timestampUpdates,
        status: nextStatus,
        workflowLogs: [
            ...(invoice.workflowLogs || []),
            { from: prevStatus, to: nextStatus, action, comments, timestamp: new Date() }
        ]
    };

    // Trigger notification
    await sendStatusNotification(invoicesState[id], nextStatus);

    res.json({ message: `Invoice ${action}ed successfully`, invoice: invoicesState[id] });
});

// NEW: Update Invoice and Re-trigger Matching
app.put('/api/invoices/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    if (!invoicesState[id]) {
        return res.status(404).json({ error: 'Invoice not found' });
    }

    console.log(`[Server] Updating invoice ${id} and re-triggering match...`);

    // Merge updated data (from Review Station)
    invoicesState[id] = {
        ...invoicesState[id],
        ...updatedData,
        status: 'Processing', // Reset status to trigger UI loading/polling
        updatedAt: new Date()
    };

    // Re-trigger the processor for Phase 3 (Matching)
    // In a real system, we'd skip IDP and go straight to matching
    invoiceProcessor.emit('process', id, invoicesState[id].filePath || '');

    res.json({ message: 'Invoice updated and re-processing started', invoice: invoicesState[id] });
});

// NEW: Get All Invoices
app.get('/api/invoices', (req, res) => {
    res.json(Object.values(invoicesState).sort((a, b) =>
        new Date(b.receivedAt || b.updatedAt) - new Date(a.receivedAt || a.updatedAt)
    ));
});

// NEW: Get Invoice Status
// NEW: Analytics Data Point (Phase 11)
app.get('/api/analytics', (req, res) => {
    const invoices = Object.values(invoicesState);

    // 1. Cycle Time Calculation
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID' && inv.paidAt && inv.ingestedAt);
    const avgCycleTime = paidInvoices.length > 0
        ? paidInvoices.reduce((acc, inv) => acc + (new Date(inv.paidAt) - new Date(inv.ingestedAt)), 0) / paidInvoices.length
        : 0;

    // 2. OCR Accuracy (Average confidence)
    const processedInvoices = invoices.filter(inv => inv.confidence !== undefined);
    const avgConfidence = processedInvoices.length > 0
        ? processedInvoices.reduce((acc, inv) => acc + (inv.confidence || 0), 0) / processedInvoices.length
        : 0.95; // Default mock target

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

    res.json({
        metrics: {
            avgCycleTimeHours: (avgCycleTime / (1000 * 60 * 60)).toFixed(1),
            ocrAccuracy: (avgConfidence * 100).toFixed(1),
            totalInvoices: invoices.length,
            paidInvoices: paidInvoices.length,
            savingsEstimated: (paidInvoices.length * 45).toFixed(0) // Assuming $45 saved per invoice vs manual
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
});

app.get('/api/invoices/:id', (req, res) => {
    const invoice = invoicesState[req.params.id];
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
});

// NEW: Export Invoices as CSV (FR-5 Section 66)
app.get('/api/invoices/export', (req, res) => {
    try {
        const invoices = Object.values(invoicesState);

        // Define CSV headers
        const headers = ["ID", "Original Name", "Vendor", "Amount", "Status", "Received At", "Processed At", "Cost Center", "Account Code"];

        // Map data to rows
        const rows = invoices.map(inv => [
            inv.id,
            inv.originalName || "N/A",
            inv.vendorName || "Unextracted",
            inv.totalAmount || inv.amount || 0,
            inv.status,
            inv.receivedAt,
            inv.processedAt || "N/A",
            inv.costCenter || "N/A",
            inv.accountCode || "N/A"
        ]);

        // Combine into CSV string
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice_audit_log.csv');
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to generate export' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
