import { getPurchaseOrder, getAnnexureByPO } from './erp';

/**
 * Performs a 3-way match: Invoice vs. Purchase Order vs. Ringi Annexure
 * ESM Version for Next.js.
 */
export const performThreeWayMatch = async (invoiceData) => {
    const { poNumber, totalAmount, vendorName } = invoiceData;
    const results = {
        isMatched: false,
        discrepancies: [],
        poFound: false,
        annexureFound: false,
        toleranceApplied: false
    };

    if (!poNumber) {
        results.discrepancies.push("No PO Number found on invoice/extracted data.");
        return results;
    }

    const po = await getPurchaseOrder(poNumber);
    if (!po) {
        results.discrepancies.push(`PO ${poNumber} not found in SAP.`);
        return results;
    }
    results.poFound = true;

    const annexure = await getAnnexureByPO(poNumber);
    if (!annexure) {
        results.discrepancies.push(`Ringi Annexure for PO ${poNumber} not found.`);
    } else {
        results.annexureFound = true;
    }

    // Vendor Match
    if (po.vendorName.toLowerCase() !== vendorName.toLowerCase()) {
        results.discrepancies.push(`Vendor mismatch: Invoice (${vendorName}) vs PO (${po.vendorName})`);
    }

    // Amount Match with 5% Tolerance
    const tolerance = 0.05;
    const diff = Math.abs(totalAmount - po.totalAmount);
    const maxAllowedDiff = po.totalAmount * tolerance;

    if (diff > maxAllowedDiff) {
        results.discrepancies.push(`Amount mismatch: Invoice (${totalAmount}) vs PO (${po.totalAmount}). Difference ${diff.toFixed(2)} exceeds 5% tolerance.`);
    } else if (diff > 0) {
        results.toleranceApplied = true;
    }

    // Annexure Limit Check
    if (annexure && totalAmount > annexure.approvedAmount) {
        results.discrepancies.push(`Amount (${totalAmount}) exceeds Ringi Annexure approved limit (${annexure.approvedAmount}).`);
    }

    results.isMatched = results.discrepancies.length === 0;
    return results;
};
