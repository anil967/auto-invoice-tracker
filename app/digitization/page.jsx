"use client";

import { useEffect, useState } from "react";
import { getInvoices, initStorage } from "@/utils/storage";
import InvoiceList from "@/components/Digitization/InvoiceList";
import Icon from "@/components/Icon";
import { motion } from "framer-motion";

export default function DigitizationPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { getAllInvoices } = await import("@/lib/api");
        const allInvoices = await getAllInvoices();
        setInvoices(allInvoices);

        // Sync local storage for other components
        const { getInvoices, updateInvoice } = await import("@/utils/storage");
        allInvoices.forEach(inv => updateInvoice(inv.id, inv));
      } catch (e) {
        console.error("Failed to load invoices from backend", e);
        // Fallback to local storage if backend is down
        const allInvoices = getInvoices();
        setInvoices(allInvoices);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Polling for updates on "Digitizing" or "Processing" invoices
    const pollInterval = setInterval(async () => {
      const { getAllInvoices } = await import("@/lib/api");
      const { updateInvoice } = await import("@/utils/storage");

      try {
        const remoteInvoices = await getAllInvoices();
        // Simple diff check to update UI only if status changed
        setInvoices(remoteInvoices);
        remoteInvoices.forEach(inv => updateInvoice(inv.id, inv));
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icon name="ScanLine" size={28} />
            </div>
            Digitization Queue
          </h1>
          <p className="text-gray-500 mt-2 ml-14 max-w-xl">
            Review, validate, and process incoming invoices. The AI pre-fills data for your verification.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-3"
        >
          <div className="join shadow-sm border border-white/40 rounded-lg">
            <button className="join-item btn btn-sm bg-white/50 border-none hover:bg-white"><Icon name="List" size={18} /></button>
            <button className="join-item btn btn-sm bg-primary text-white border-none"><Icon name="Grid" size={18} /></button>
          </div>
          <button className="btn btn-sm btn-ghost bg-white/40 border border-white/60 shadow-sm gap-2">
            <Icon name="Filter" size={16} /> Filter
          </button>
        </motion.div>
      </div>

      {/* Stats Summary (Mini) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 flex flex-col">
          <span className="text-xs font-bold uppercase opacity-70">To Digitize</span>
          <span className="text-2xl font-bold">{invoices.filter(i => i.status === 'Digitizing').length}</span>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 flex flex-col">
          <span className="text-xs font-bold uppercase opacity-70">Processing</span>
          <span className="text-2xl font-bold">{invoices.filter(i => i.status === 'Processing').length}</span>
        </div>
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 flex flex-col">
          <span className="text-xs font-bold uppercase opacity-70">Pending Approval</span>
          <span className="text-2xl font-bold">{invoices.filter(i => i.status === 'Pending Approval').length}</span>
        </div>
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 flex flex-col">
          <span className="text-xs font-bold uppercase opacity-70">Completed Today</span>
          <span className="text-2xl font-bold">12</span>
        </div>
      </div>

      {/* Main List */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-gray-500 animate-pulse">Loading invoices...</p>
          </div>
        ) : (
          <InvoiceList invoices={invoices} />
        )}
      </div>
    </div>
  );
}