"use client";

import { useEffect, useState } from "react";
import { getAllInvoices } from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "@/components/Icon";

export default function ApprovalsPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allInvoices = await getAllInvoices();
        // Filter for Pending Approval status
        const pending = allInvoices.filter((inv) => inv.status === "PENDING_APPROVAL");
        setInvoices(pending);
      } catch (error) {
        console.error("Failed to load approvals", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Icon name="Stamp" size={28} />
            </div>
            Approval Workflow
          </h1>
          <p className="text-gray-500 mt-2 ml-14 max-w-xl">
            Pending invoices requiring managerial review and final sign-off.
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
            <span className="loading loading-bars loading-lg text-amber-500"></span>
            <p className="text-gray-500 animate-pulse">Retrieving pending approvals...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 bg-white/20 rounded-2xl border border-white/40 backdrop-blur-md">
            <Icon name="CheckCircle" size={48} className="mb-4 opacity-50 text-success" />
            <p className="text-lg font-medium text-gray-600">All caught up!</p>
            <p className="text-sm">No invoices pending approval.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col p-6 rounded-2xl bg-white/40 border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                      <Icon name="FileClock" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1">
                        {invoice.vendorName}
                      </h3>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                        {invoice.id}
                      </span>
                    </div>
                  </div>
                  <div className="badge badge-warning bg-amber-500/10 text-amber-700 border-none font-semibold">
                    Pending
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-2">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-gray-800 text-lg">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(invoice.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Due Date</span>
                    <span className="text-error font-medium">{invoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="text-gray-700">{invoice.category}</span>
                  </div>
                </div>

                {/* Action */}
                <Link href={`/approvals/${invoice.id}`} className="w-full">
                  <button className="btn btn-warning btn-outline w-full hover:!text-white shadow-lg shadow-warning/10 group-hover:scale-[1.02] transition-transform">
                    Review & Approve
                    <Icon name="ArrowRight" size={18} />
                  </button>
                </Link>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-white/20 to-transparent rounded-tr-2xl pointer-events-none"></div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}