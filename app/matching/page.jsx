"use client";

import { useEffect, useState } from "react";
import { getInvoices, initStorage } from "@/utils/storage";
import MatchingList from "@/components/Matching/MatchingList";
import Icon from "@/components/Icon";
import { motion } from "framer-motion";

export default function MatchingPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await initStorage();
      const allInvoices = getInvoices();
      // Filter for invoices ready for matching (Status: Processing)
      // NOTE: In a real app, 'Processing' might imply OCR processing, but per task description,
      // we are using 'Processing' as the status for items waiting for 3-way matching.
      const readyForMatching = allInvoices.filter(inv => inv.status === 'Processing');
      setInvoices(readyForMatching);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                <Icon name="GitMerge" size={28} />
            </div>
            Matching Arena
          </h1>
          <p className="text-gray-500 mt-2 ml-14 max-w-xl">
            Resolve discrepancies and validate invoices against Purchase Orders and Goods Receipts.
          </p>
        </motion.div>

        <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost bg-white/40 border border-white/60 shadow-sm gap-2">
                <Icon name="Filter" size={16} /> Filter
            </button>
            <button className="btn btn-sm btn-ghost bg-white/40 border border-white/60 shadow-sm gap-2">
                <Icon name="SortDesc" size={16} /> Sort
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <span className="loading loading-bars loading-lg text-blue-500"></span>
             <p className="text-gray-500 animate-pulse">Syncing matching data...</p>
          </div>
        ) : (
          <MatchingList invoices={invoices} />
        )}
      </div>
    </div>
  );
}