"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { getInvoiceStatus } from "@/lib/api";
import ThreeWayMatch from "@/components/Matching/ThreeWayMatch";
import AuditTrail from "@/components/Workflow/AuditTrail";
import ApprovalActions from "@/components/Workflow/ApprovalActions";
import Icon from "@/components/Icon";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (![ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(user.role)) {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return; // Wait for auth

    const fetchInvoice = async () => {
      try {
        const foundInvoice = await getInvoiceStatus(params.id);

        if (!foundInvoice) {
          router.push("/approvals");
          return;
        }

        setInvoice(foundInvoice);
      } catch (error) {
        console.error("Failed to fetch invoice:", error);
        router.push("/approvals");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <span className="loading loading-infinity loading-lg text-amber-500 mb-4"></span>
          <p className="text-gray-500">Loading invoice context...</p>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  // Check if invoice is already processed to disable actions
  const isProcessed = invoice.status === "APPROVED" || invoice.status === "REJECTED";

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-4 pb-10">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link
          href="/approvals"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <Icon name="ArrowLeft" size={14} /> Back to Approvals
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-700">{invoice.id}</span>
        <span>/</span>
        <span className="text-amber-600">Final Review</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left Panel: Context (Three-Way Match Read-Only) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Info Banner */}
          <div className="alert bg-blue-50 border-blue-200 text-blue-800 shadow-sm">
            <Icon name="Info" size={20} />
            <div>
              <h3 className="font-bold text-sm">Review Context</h3>
              <div className="text-xs">
                Review the matching analysis below. This section is read-only for final approval context.
              </div>
            </div>
          </div>

          {/* 
            Wrapper to make ThreeWayMatch read-only visually and interactively.
            pointer-events-none disables buttons.
            select-none prevents text selection (optional).
          */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200/50">
            <div className="pointer-events-none opacity-90 grayscale-[0.05] bg-gray-50/50 p-4">
              <ThreeWayMatch invoice={invoice} />
            </div>
            {/* Overlay to further ensure read-only feel and maybe add a label */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span className="badge badge-ghost bg-white/80 backdrop-blur text-xs font-mono uppercase tracking-widest border-gray-300">
                Read Only View
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Panel: Workflow Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Approval Actions */}
          {!isProcessed ? (
            <ApprovalActions invoiceId={invoice.id} />
          ) : (
            <div
              className={`p-6 rounded-2xl border ${invoice.status === "APPROVED"
                ? "bg-success/10 border-success/30 text-success-content"
                : "bg-error/10 border-error/30 text-error-content"
                } flex flex-col items-center justify-center text-center space-y-3`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${invoice.status === "APPROVED" ? "bg-success text-white" : "bg-error text-white"
                  }`}
              >
                <Icon
                  name={invoice.status === "APPROVED" ? "Check" : "X"}
                  size={32}
                />
              </div>
              <h3 className="text-xl font-bold uppercase">
                Invoice {invoice.status}
              </h3>
              <p className="text-sm opacity-80">
                This workflow has been finalized. No further actions can be taken.
              </p>
            </div>
          )}

          {/* Audit Trail */}
          <AuditTrail invoice={invoice} />
        </motion.div>
      </div>
    </div>
  );
}