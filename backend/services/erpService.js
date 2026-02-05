/**
 * Simulates integration with SAP (Purchase Orders) and Ringi (Annexures).
 */

const mockPurchaseOrders = [
    {
        poNumber: "PO-2026-001",
        vendorName: "Mock Vendor Corp",
        totalAmount: 1250.50,
        items: [
            { description: "Consulting Services", quantity: 10, unitPrice: 100.00, amount: 1000.00 },
            { description: "Software Licenses", quantity: 1, unitPrice: 250.50, amount: 250.50 }
        ],
        status: "OPEN"
    },
    {
        poNumber: "PO-2026-002",
        vendorName: "Tech Solutions Ltd",
        totalAmount: 5000.00,
        items: [
            { description: "Server Hardware", quantity: 2, unitPrice: 2500.00, amount: 5000.00 }
        ],
        status: "OPEN"
    }
];

const mockAnnexures = [
    {
        annexureId: "ANX-789",
        poNumber: "PO-2026-001",
        approvedAmount: 1300.00,
        status: "APPROVED"
    },
    {
        annexureId: "ANX-456",
        poNumber: "PO-2026-002",
        approvedAmount: 5000.00,
        status: "APPROVED"
    }
];

const getPurchaseOrder = async (poNumber) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPurchaseOrders.find(po => po.poNumber === poNumber) || null;
};

const getAnnexureByPO = async (poNumber) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAnnexures.find(anx => anx.poNumber === poNumber) || null;
};

module.exports = {
    getPurchaseOrder,
    getAnnexureByPO
};
