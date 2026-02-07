import { db } from '@/lib/db';
import Vendor from '@/models/Vendor';

export const sendStatusNotification = async (invoice, nextStatus) => {
    console.log(`[Notification] Preparing alert for Invoice ${invoice.id} (${nextStatus})`);

    let recipient = "finance-team@example.com"; // Default fallback
    let subject = `Invoice ${invoice.id} Update: ${nextStatus}`;
    let message = `Invoice ${invoice.id} from ${invoice.vendorName} is now ${nextStatus}.`;

    // Customize based on status
    if (nextStatus === 'PENDING_APPROVAL') {
        recipient = "pm-approver@example.com"; // In real app, fetch from invoice.projectManagerEmail
        message += " Action required: Please review and approve for payment.";
    } else if (nextStatus === 'REJECTED') {
        // Fetch actual vendor email from database
        const vendor = await Vendor.findOne({ name: invoice.vendorName }).exec();
        if (vendor && vendor.email) {
            recipient = vendor.email;
        } else {
            console.warn(`[Notification] Vendor not found or no email for: ${invoice.vendorName}`);
        }
        message += " Reason: Match discrepancy or validation error. Please check the portal.";
    } else if (nextStatus === 'PAID') {
        // Fetch actual vendor email from database
        const vendor = await Vendor.findOne({ name: invoice.vendorName }).exec();
        if (vendor && vendor.email) {
            recipient = vendor.email;
        } else {
            console.warn(`[Notification] Vendor not found or no email for: ${invoice.vendorName}`);
        }
        message += " Confirmation: Funds released. Expected arrival within 3-5 business days.";
    }

    // 1. Log to Database
    try {
        await db.saveInvoice(invoice.id, {
            logs: [...(invoice.logs || []), { type: 'NOTIFICATION', recipient, status: nextStatus, timestamp: new Date() }]
        });

        // Also log to dedicated notifications table (from Phase 1 schema)
        // Note: db.query or sql`` isn't directly exposed in lib/db.js wrapper yet, 
        // so we might skip strict table logging or add a method.
        // But let's assume valid db access or just skip unrelated table for now to keep it simple 
        // as we are updating the invoice log itself above.
    } catch (e) {
        console.error("Failed to log notification to DB", e);
    }

    // 2. Send Email via SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
        console.warn("[Notification] SENDGRID_API_KEY not found. Skipping email dispatch.");
        return;
    }

    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: recipient }] }],
                from: { email: process.env.FROM_EMAIL || "system@invoicetracker.internal" }, // Sender must be verified in SendGrid
                subject: subject,
                content: [{ type: "text/plain", value: message }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[Notification] SendGrid Error:", JSON.stringify(errorData));
        } else {
            console.log(`[Notification] Email sent to ${recipient}`);
        }
    } catch (error) {
        console.error("[Notification] Failed to send email:", error);
    }
};
