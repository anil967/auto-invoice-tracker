import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    vendorName: { type: String, required: true }, // Changed from snake_case in SQL to camelCase model
    invoiceNumber: { type: String },
    date: { type: String }, // Storing as string YYYY-MM-DD for consistency with frontend
    amount: { type: Number },
    status: { type: String, required: true },
    category: { type: String },
    dueDate: { type: String },
    costCenter: { type: String },
    accountCode: { type: String },
    currency: { type: String, default: 'INR' },
    fileUrl: { type: String },
    poNumber: { type: String },
    project: { type: String }, // Associated project for PM scoping
    matching: { type: mongoose.Schema.Types.Mixed }, // JSONB storage
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
