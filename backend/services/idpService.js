/**
 * Simulates an IDP (OCR) service for invoice data extraction.
 * In a production environment, this would call Azure Form Recognizer, AWS Textract, etc.
 */
const extractInvoiceData = async (filePath) => {
    // Simulate network/processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock extraction results
    // In reality, we would parse the file at filePath
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

module.exports = {
    extractInvoiceData
};
