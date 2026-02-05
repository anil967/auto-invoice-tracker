"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Icon from "@/components/Icon";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { updateInvoice } from "@/utils/storage";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const ThreeWayMatch = ({ invoice: initialInvoice }) => {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initialInvoice);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [goodsReceipt, setGoodsReceipt] = useState(null);
  const [matchStatus, setMatchStatus] = useState(initialInvoice?.status === 'Verified' ? 'matched' : (initialInvoice?.status === 'Match Discrepancy' ? 'discrepancy' : 'analyzing'));
  const [processing, setProcessing] = useState(false);

  // --- Real-time Polling for Match Results ---
  useEffect(() => {
    if (invoice?.status === 'Processing' || invoice?.status === 'Digitizing') {
      const interval = setInterval(async () => {
        const { getInvoiceStatus } = await import("@/lib/api");
        const { updateInvoice } = await import("@/utils/storage");

        try {
          const status = await getInvoiceStatus(invoice.id);
          if (status.status !== invoice.status && (status.status === 'Verified' || status.status === 'Match Discrepancy')) {
            clearInterval(interval);
            updateInvoice(invoice.id, status);
            setInvoice(status);
            setMatchStatus(status.status === 'Verified' ? 'matched' : 'discrepancy');
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [invoice?.id, invoice?.status]);

  // --- External Data Simulation (SAP/Ringi) ---
  useEffect(() => {
    if (!invoice || matchStatus === 'analyzing') return;

    // Fetch the detailed PO and Annexure data if needed (mocked for now based on backend matching results)
    const mockPO = {
      id: invoice.poNumber || "PO-2026-001",
      date: "2026-02-01",
      vendor: invoice.vendorName,
      total: invoice.status === 'Verified' ? invoice.totalAmount || invoice.amount : (invoice.totalAmount || invoice.amount) + 100, // Discrepancy if not verified
      items: (invoice.lineItems || invoice.items).map(item => ({
        ...item,
        unitPrice: invoice.status === 'Verified' ? item.unitPrice : item.unitPrice * 1.1
      }))
    };

    setPurchaseOrder(mockPO);
    setGoodsReceipt({
      id: "GR-999",
      date: "2026-02-03",
      receivedBy: "Warehouse B",
      items: mockPO.items
    });
  }, [invoice, matchStatus]);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const { getCurrentUser } = require("@/utils/auth");
    setCurrentUser(getCurrentUser());

    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleMatch = async () => {
    setProcessing(true);
    try {
      const { transitionWorkflow } = await import("@/lib/api");
      const { updateInvoice } = await import("@/utils/storage");

      const response = await transitionWorkflow(invoice.id, 'APPROVE', "Automated match confirmed by user.");
      updateInvoice(invoice.id, response.invoice);
      setInvoice(response.invoice);

      router.push("/matching");
    } catch (error) {
      console.error("Match approval error", error);
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleFlagException = async () => {
    setProcessing(true);
    try {
      const { transitionWorkflow } = await import("@/lib/api");
      const { updateInvoice } = await import("@/utils/storage");

      const response = await transitionWorkflow(invoice.id, 'REJECT', "Discrepancy flagged for manual review.");
      updateInvoice(invoice.id, response.invoice);
      setInvoice(response.invoice);

      router.push("/matching");
    } catch (error) {
      console.error("Flag error", error);
    } finally {
      setProcessing(false);
    }
  };

  // Helper to check permissions
  const canApprove = () => {
    if (!currentUser) return false;
    const { hasPermission } = require("@/utils/auth");
    return hasPermission(currentUser, 'APPROVE_MATCH');
  };

  // Helper to compare values and return color class
  const getComparisonClass = (val1, val2) => {
    // Simple float comparison tolerance
    const num1 = Number(val1);
    const num2 = Number(val2);

    if (Math.abs(num1 - num2) < 0.01) return "text-success bg-success/10";
    return "text-error bg-error/10 font-bold animate-pulse";
  };

  if (!invoice) return null;

  return (
    <div className="space-y-6">
      {/* Header Status Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            Matching Center
            {matchStatus === "analyzing" && <span className="loading loading-dots loading-sm text-gray-400"></span>}
            {matchStatus === "matched" && <span className="badge badge-success text-white gap-1"><Icon name="Check" size={12} /> Match Found</span>}
            {matchStatus === "discrepancy" && <span className="badge badge-error text-white gap-1"><Icon name="AlertTriangle" size={12} /> Discrepancy</span>}
            {invoice.status === 'REJECTED' && <span className="badge badge-ghost text-error gap-1"><Icon name="XCircle" size={12} /> Rejected</span>}
            {invoice.status === 'PENDING_APPROVAL' && <span className="badge badge-warning text-white gap-1"><Icon name="Clock" size={12} /> Pending Approval</span>}
          </h2>
          <p className="text-gray-500 text-sm">Comparing Invoice {invoice.id} against Purchase Order and Goods Receipt.</p>
          {invoice.matching?.discrepancies?.map((d, i) => (
            <div key={i} className="flex items-center gap-2 mt-1 text-error text-xs font-semibold bg-error/5 border border-error/10 p-1 px-2 rounded w-fit">
              <Icon name="AlertCircle" size={12} /> {d}
            </div>
          ))}
          {invoice.matchingNotes && (
            <div className="flex items-center gap-2 mt-2 text-info text-xs font-semibold bg-info/5 border border-info/10 p-1 px-2 rounded w-fit italic">
              <Icon name="Info" size={12} /> {invoice.matchingNotes}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="danger"
            disabled={currentUser?.role === 'Auditor' || matchStatus === "analyzing" || processing || invoice.status === 'REJECTED'}
            onClick={handleFlagException}
            icon="Flag"
          >
            Reject / Flag
          </Button>
          <Button
            variant="primary"
            disabled={!canApprove() || matchStatus !== "matched" || processing || invoice.status === 'APPROVED'}
            onClick={handleMatch}
            loading={processing}
            icon="CheckCircle"
          >
            {invoice.status === 'PENDING_APPROVAL' ? 'Final Approve' : 'Approve Match'}
          </Button>
        </div>
      </div>

      {/* 3-Column Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Invoice (Source of Truth for this view) */}
        <Card className="border-l-4 border-l-blue-500 h-full">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <Icon name="FileText" size={20} /> INVOICE
            </div>
            <span className="badge badge-ghost">{invoice.id}</span>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Vendor</p>
              <p className="font-semibold text-gray-800">{invoice.vendorName}</p>
            </div>
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Total Amount</p>
              <p className="font-bold text-xl text-blue-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Cost Center</p>
                <p className="text-sm font-mono text-blue-700">{invoice.costCenter || "Not Set"}</p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Account Code</p>
                <p className="text-sm font-mono text-blue-700">{invoice.accountCode || "Not Set"}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Line Items</p>
              <div className="space-y-2">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-2 rounded hover:bg-white/60">
                    <span className="truncate w-1/2">{item.description}</span>
                    <div className="text-right">
                      <span className="block font-mono text-xs">{item.quantity} x ${item.unitPrice}</span>
                      <span className="font-bold">${item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Column 2: Purchase Order */}
        <Card className="border-l-4 border-l-purple-500 h-full relative overflow-hidden">
          {matchStatus === "analyzing" && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center flex-col">
              <span className="loading loading-spinner loading-md text-purple-500 mb-2"></span>
              <p className="text-purple-500 font-medium text-sm">Fetching PO Data...</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-purple-700 font-bold">
              <Icon name="ShoppingCart" size={20} /> PURCHASE ORDER
            </div>
            {purchaseOrder && <span className="badge badge-ghost">{purchaseOrder.id}</span>}
          </div>

          {purchaseOrder && (
            <div className="space-y-4">
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Vendor</p>
                <p className="font-semibold text-gray-800">{purchaseOrder.vendor}</p>
              </div>
              <div className={`p-3 rounded-lg transition-colors duration-500 ${getComparisonClass(invoice.amount, purchaseOrder.total)}`}>
                <p className="text-xs uppercase opacity-70">PO Total</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-xl">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(purchaseOrder.total)}
                  </p>
                  {Math.abs(invoice.amount - purchaseOrder.total) > 0.01 && (
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">
                      Diff: {((purchaseOrder.total - invoice.amount)).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Line Items Comparison</p>
                <div className="space-y-2">
                  {invoice.items.map((invItem, idx) => {
                    const poItem = purchaseOrder.items[idx] || {};
                    const priceMatch = Math.abs(invItem.unitPrice - poItem.unitPrice) < 0.01;

                    return (
                      <div key={idx} className="flex justify-between items-center text-sm p-2 rounded bg-white/40 border border-transparent hover:border-purple-200">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">Unit Price</span>
                          <span className={clsx("font-mono font-bold", !priceMatch ? "text-error" : "text-gray-700")}>
                            ${poItem.unitPrice}
                          </span>
                        </div>
                        {!priceMatch && <Icon name="XCircle" size={16} className="text-error" />}
                        {priceMatch && <Icon name="CheckCircle" size={16} className="text-success" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Column 3: Goods Receipt */}
        <Card className="border-l-4 border-l-orange-500 h-full relative overflow-hidden">
          {matchStatus === "analyzing" && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center flex-col">
              <span className="loading loading-spinner loading-md text-orange-500 mb-2"></span>
              <p className="text-orange-500 font-medium text-sm">Verifying Receipt...</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-orange-700 font-bold">
              <Icon name="PackageCheck" size={20} /> GOODS RECEIPT
            </div>
            {goodsReceipt && <span className="badge badge-ghost">{goodsReceipt.id}</span>}
          </div>

          {goodsReceipt && (
            <div className="space-y-4">
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Received By</p>
                <p className="font-semibold text-gray-800">{goodsReceipt.receivedBy}</p>
              </div>
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Receipt Date</p>
                <p className="font-semibold text-gray-800">{goodsReceipt.date}</p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Quantity Verification</p>
                <div className="space-y-2">
                  {invoice.items.map((invItem, idx) => {
                    const grItem = goodsReceipt.items[idx] || {};
                    const qtyMatch = invItem.quantity === grItem.quantity;

                    return (
                      <div key={idx} className={clsx("flex justify-between items-center text-sm p-2 rounded border",
                        qtyMatch ? "bg-success/5 border-success/20" : "bg-error/5 border-error/20"
                      )}>
                        <span className="truncate w-1/3 text-xs">{invItem.description}</span>
                        <div className="text-right flex items-center gap-2">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400">Received</span>
                            <span className={clsx("font-bold", !qtyMatch ? "text-error" : "text-gray-700")}>
                              {grItem.quantity} / {invItem.quantity}
                            </span>
                          </div>
                          {!qtyMatch && <Icon name="AlertTriangle" size={16} className="text-error" />}
                          {qtyMatch && <Icon name="Check" size={16} className="text-success" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Visual Connection Lines (simulated via absolute positioning if needed, or simple SVG) */}
      {/* For a simpler glassmorphic approach, the 3 cards side-by-side with color coding is sufficient for the task requirements */}

    </div>
  );
};

export default ThreeWayMatch;