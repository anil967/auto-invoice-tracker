# InvoiceFlow Pilot User Guide

Welcome to the InvoiceFlow pilot! This guide covers the core features of the system.

## 1. Dashboard Overview
- **Stats**: View your Total Volume, Discrepancies, and Pending Approvals at a glance.
- **Role Switcher**: Click the buttons at the top right to switch roles (PM, Finance, Admin) to see different perspectives.

## 2. Ingesting Invoices
1. Navigate to the **Dashboard**.
2. Drag and drop PDF/Image invoices into the **Quick Upload** zone.
3. The system will automatically start **Digitizing** (OCR) and **Matching** (against POs).

## 3. Review Station (Human-in-the-Loop)
If an invoice has low confidence or validation errors:
1. Go to the **Digitization Queue**.
2. Click **Review** on the invoice.
3. Correct any mis-extracted fields (Vendor, Amount, etc.).
4. Click **Confirm & Process**. This will re-trigger the 3-way matching logic.

## 4. Matching Center
1. Go to the **Matching Center**.
2. Invoices are categorized as **Verified** (Ready for Approval) or **Match Discrepancy**.
3. Click into an invoice to see the side-by-side comparison:
   - **Invoice** vs **Purchase Order** vs **Goods Receipt**.
4. If everything looks good, click **Approve Match**.
5. If there's an error, click **Reject / Flag**.

## 5. Roles & Permissions
- **Finance**: Can view all invoices and finalize payments.
- **Project Manager**: Primarily handles approvals for their specific projects.
- **Admin**: Full system access.

---
*Support: contact finance-tech-support@example.com*
