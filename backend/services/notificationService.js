/**
 * Mock Notification Service (FR-7)
 */

const sendStatusNotification = async (invoice, nextStatus) => {
    console.log(`[Notification] Sending alert to stakeholders for Invoice ${invoice.id}...`);
    console.log(`[Notification] Status changed from ${invoice.status} to ${nextStatus}`);

    // Simulate email content
    let recipient = "finance-team@example.com";
    let message = `Invoice ${invoice.id} from ${invoice.vendorName} is now ${nextStatus}.`;

    if (nextStatus === 'PENDING_APPROVAL') {
        recipient = "pm-approver@example.com";
        message += " Action required: Please review and approve for payment.";
    } else if (nextStatus === 'REJECTED') {
        recipient = "vendor-admin@example.com";
        message += " Reason: Match discrepancy or validation error. Please check the portal.";
    } else if (nextStatus === 'PAID') {
        recipient = "vendor-admin@example.com";
        message += " Confirmation: Funds released. Expected arrival within 3-5 business days.";
    }

    console.log(`[Notification] To: ${recipient}`);
    console.log(`[Notification] Message: ${message}`);

    // Simulate async delay
    return new Promise(resolve => setTimeout(resolve, 300));
};

module.exports = {
    sendStatusNotification
};
