/**
 * Simulates an IDP (OCR) service for invoice data extraction.
 * ESM Version for Next.js.
 */
export const extractInvoiceData = async (fileBuffer) => {
    // Phase 2: Manual Entry Mode (User has no OCR keys)

    // In a real implementation with keys, we would call Azure/AWS here.
    // For now, we simulate a successful "upload" but with empty data requiring manual entry.

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return empty/partial structure
    return {
        // Core fields empty => Validation will fail => Status: VALIDATION_REQUIRED
        invoiceNumber: "",
        invoiceDate: "",
        vendorName: "",
        totalAmount: 0,
        currency: "USD",
        lineItems: [],
        confidence: 0, // Low confidence triggers review
        costCenter: "",
        accountCode: "",
        status: "UPLOADED", // Processing status, not final status
        extractionMethod: "MANUAL_ENTRY_REQUIRED"
    };
};
