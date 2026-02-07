import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    vendorName: { type: String, required: true },
    submittedByUserId: { type: String }, // User id of submitter (vendor) - reliable filter for vendor list
    originalName: { type: String },
    receivedAt: { type: Date },
    invoiceNumber: { type: String },
    date: { type: String },
    amount: { type: Number },
    status: { type: String, required: true },
    category: { type: String },
    dueDate: { type: String },
    costCenter: { type: String },
    accountCode: { type: String },
    currency: { type: String, default: 'INR' },
    fileUrl: { type: String },
    poNumber: { type: String },
    project: { type: String },
    matching: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
