/**
 * Simulates an IDP (OCR) service for invoice data extraction.
 * ESM Version for Next.js.
 */
export const extractInvoiceData = async (fileBuffer) => {
    // Simulate network/processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock extraction results
    return {
        invoiceNumber: `INV-${Math.floor(Math.random() * 1000000)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        vendorName: "Mock Vendor Corp",
        totalAmount: 1250.50,
        currency: "USD",
        lineItems: [
            { description: "Consulting Services", quantity: 10, unitPrice: 100.00, amount: 1000.00 },
            { description: "Software Licenses", quantity: 1, unitPrice: 250.50, amount: 250.50 }
        ],
        confidence: 0.98,
        costCenter: "CC-742-MARKETING",
        accountCode: "GL-5001-SOFTWARE",
        status: "Digitized"
    };
};
