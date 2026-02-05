"use client";

import { useState, useEffect } from "react";
import { updateInvoiceApi, getInvoiceStatus } from "@/lib/api";
import { getCurrentUser, ROLES } from "@/utils/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/Icon";
import { useRouter } from "next/navigation";

const ValidationForm = ({ invoice: initialInvoice }) => {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initialInvoice);
  const [formData, setFormData] = useState({
    vendorName: "",
    date: "",
    dueDate: "",
    amount: "",
    category: "",
    costCenter: "",
    accountCode: "",
    id: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [confidence, setConfidence] = useState(initialInvoice?.confidence ? Math.round(initialInvoice.confidence * 100) : 85);

  useEffect(() => {
    if (invoice) {
      setFormData({
        vendorName: invoice.vendorName || "",
        date: invoice.invoiceDate || invoice.date || "",
        dueDate: invoice.dueDate || "",
        amount: invoice.totalAmount || invoice.amount || "",
        category: invoice.category || "Uncategorized",
        costCenter: invoice.costCenter || "",
        accountCode: invoice.accountCode || "",
        id: invoice.id
      });
      if (invoice.confidence) {
        setConfidence(Math.round(invoice.confidence * 100));
      }
    }
  }, [invoice]);

  // Poll for updates if still digitizing
  useEffect(() => {
    if (invoice?.status === 'DIGITIZING' || invoice?.status === 'RECEIVED') {
      const interval = setInterval(async () => {
        try {
          const status = await getInvoiceStatus(invoice.id);
          if (status.status !== invoice.status) {
            clearInterval(interval);
            setInvoice(status);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [invoice?.status, invoice?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Update the invoice in backend
      const response = await updateInvoiceApi(formData.id, {
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'VERIFIED', // Moving to matched phase after validation
      });

      setInvoice(response.invoice);
      router.push('/digitization');
    } catch (error) {
      console.error("Submission error", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const [currentUser, setCurrentUser] = useState(null);
  const isAuditor = currentUser?.role === ROLES.AUDITOR;

  useEffect(() => {
    setCurrentUser(getCurrentUser());

    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  return (
    <Card className="h-full flex flex-col bg-white/60 border-white/60">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Icon name="CheckSquare" className="text-primary" />
            {isAuditor ? "Review Mode (Read-Only)" : "Validate Data"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAuditor ? "Auditing extracted information." : "Review extracted information below."}
          </p>
        </div>
        <div className="radial-progress text-primary text-xs font-bold" style={{ "--value": confidence, "--size": "3rem" }} role="progressbar">
          {confidence}%
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar">

        {/* Vendor Information */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-semibold flex items-center gap-2">
              <Icon name="Store" size={16} /> Vendor Name
            </span>
          </label>
          <input
            type="text"
            name="vendorName"
            value={formData.vendorName}
            onChange={handleChange}
            readOnly={isAuditor}
            placeholder="e.g. Acme Corp"
            className="input input-bordered w-full bg-white/50 focus:bg-white focus:border-primary transition-colors disabled:bg-gray-100"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Invoice Date */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Icon name="Calendar" size={16} /> Invoice Date
              </span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              readOnly={isAuditor}
              className="input input-bordered w-full bg-white/50 focus:bg-white focus:border-primary disabled:bg-gray-100"
              required
            />
          </div>

          {/* Due Date */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Icon name="Clock" size={16} /> Due Date
              </span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              readOnly={isAuditor}
              onChange={handleChange}
              className="input input-bordered w-full bg-white/50 focus:bg-white focus:border-primary disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Amount */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Icon name="DollarSign" size={16} /> Total Amount
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              readOnly={isAuditor}
              onChange={handleChange}
              placeholder="0.00"
              className="input input-bordered w-full bg-white/50 focus:bg-white focus:border-primary font-mono disabled:bg-gray-100"
              required
            />
          </div>

          {/* Category */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Icon name="Tag" size={16} /> Category
              </span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isAuditor}
              className="select select-bordered w-full bg-white/50 focus:bg-white focus:border-primary disabled:bg-gray-100"
            >
              <option value="" disabled>Select Category</option>
              <option value="IT Infrastructure">IT Infrastructure</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Marketing">Marketing</option>
              <option value="Software">Software</option>
              <option value="Logistics">Logistics</option>
              <option value="Uncategorized">Uncategorized</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Cost Center */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Icon name="Target" size={16} /> Cost Center
              </span>
            </label>
            <input
              type="text"
              name="costCenter"
              value={formData.costCenter}
              readOnly={isAuditor}
              onChange={handleChange}
              placeholder="e.g. CC-101"
              className="input input-bordered w-full bg-white/50 focus:bg-white focus:border-primary font-mono disabled:bg-gray-100"
            />
          </div>

          {/* Account Code */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Icon name="Hash" size={16} /> Account Code
              </span>
            </label>
            <input
              type="text"
              name="accountCode"
              value={formData.accountCode}
              readOnly={isAuditor}
              onChange={handleChange}
              placeholder="e.g. GL-5000"
              className="input input-bordered w-full bg-white/50 focus:bg-white focus:border-primary font-mono disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Validation Feedback */}
        {(invoice?.validation?.errors?.length > 0 || invoice?.validation?.warnings?.length > 0) && (
          <div className="space-y-2 mt-2">
            {invoice.validation.errors.map((err, i) => (
              <div key={i} className="alert alert-error bg-error/10 border-error/20 text-error text-xs py-1 rounded-lg">
                <Icon name="AlertCircle" size={14} />
                <span>{err}</span>
              </div>
            ))}
            {invoice.validation.warnings.map((warn, i) => (
              <div key={i} className="alert alert-warning bg-warning/10 border-warning/20 text-warning text-xs py-1 rounded-lg">
                <Icon name="AlertTriangle" size={14} />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        )}

        {/* AI Confidence Notice */}
        <div className="alert bg-blue-50 border-blue-100 text-blue-800 text-sm py-2 rounded-lg mt-2">
          <Icon name="Sparkles" size={18} />
          <span>AI extracted these fields with {confidence}% confidence. Please verify carefully.</span>
        </div>

        <div className="mt-auto pt-6 flex gap-3">
          <Button
            variant="ghost"
            type="button"
            className="flex-1 border border-gray-300"
            onClick={() => router.back()}
          >
            {isAuditor ? "Back to Dashboard" : "Cancel"}
          </Button>
          {!isAuditor && (
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={isSaving}
              icon="CheckCircle"
            >
              Confirm & Process
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default ValidationForm;