const EventEmitter = require('events');
const { extractInvoiceData } = require('./services/idpService');
const { performThreeWayMatch } = require('./services/matchingService');

class InvoiceProcessor extends EventEmitter {
    constructor() {
        super();
        this.on('process', this.processInvoice);
    }

    async processInvoice(invoiceId, filePath) {
        console.log(`[Processor] Starting Phase 2 (IDP) for invoice ${invoiceId}...`);

        try {
            const extractedData = await extractInvoiceData(filePath);

            // FR-3: Data Validation
            const validationResults = this.validateExtractedData(extractedData);

            console.log(`[Processor] Phase 2 complete. Starting Phase 3 (Matching)...`);

            // FR-4: 3-Way Matching (Phase 3)
            // For demo, we assign a mock PO number if not found
            if (!extractedData.poNumber) {
                extractedData.poNumber = "PO-2026-001";
            }

            const matchingResults = await performThreeWayMatch(extractedData);

            console.log(`[Processor] Processing and Matching complete for ${invoiceId}.`);

            // Emit completion event with validation and matching results
            this.emit('completed', {
                invoiceId,
                data: extractedData,
                validation: validationResults,
                matching: matchingResults
            });

        } catch (error) {
            console.error(`[Processor] Failed to process ${invoiceId}:`, error);
            this.emit('failed', { invoiceId, error: error.message });
        }
    }

    validateExtractedData(data) {
        const errors = [];
        const warnings = [];

        if (!data.invoiceNumber) errors.push("Missing Invoice Number");
        if (!data.vendorName) errors.push("Missing Vendor Name");
        if (!data.totalAmount || data.totalAmount <= 0) errors.push("Invalid or missing Total Amount");
        if (!data.invoiceDate) errors.push("Missing Invoice Date");

        // Enrichment Validation (FR-3)
        if (!data.costCenter) {
            warnings.push("Cost Center not assigned");
        } else if (!/^CC-\d{3}/.test(data.costCenter)) {
            errors.push(`Invalid Cost Center format: ${data.costCenter} (Expected: CC-XXX)`);
        }

        if (!data.accountCode) {
            warnings.push("General Ledger account not assigned");
        } else if (!/^GL-\d{4}/.test(data.accountCode)) {
            errors.push(`Invalid Account Code format: ${data.accountCode} (Expected: GL-XXXX)`);
        }

        // Simple confidence check
        if (data.confidence < 0.90) {
            warnings.push("Low OCR confidence - manual review recommended");
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

module.exports = new InvoiceProcessor();
