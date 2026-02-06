import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping custom ID for consistency
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    assignedProjects: { type: [String], default: [] }, // For Project Managers
    vendorId: { type: String }, // For Vendors (optional linkage)
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.User || mongoose.model('User', UserSchema);
