"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Icon from "@/components/Icon";
import clsx from "clsx";

const AuditTrail = ({ invoice }) => {
  // Simulate timeline data based on invoice details
  const timeline = useMemo(() => {
    if (!invoice) return [];

    const baseDate = new Date(invoice.date);
    const steps = [
      {
        id: "step-1",
        title: "Invoice Received",
        description: "Document uploaded via portal",
        date: new Date(baseDate.getTime() - 172800000).toISOString().split("T")[0], // 2 days prior
        status: "completed",
        icon: "FileInput",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500",
      },
      {
        id: "step-2",
        title: "Digitization Complete",
        description: "OCR extraction and validation",
        date: new Date(baseDate.getTime() - 86400000).toISOString().split("T")[0], // 1 day prior
        status: "completed",
        icon: "ScanLine",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500",
      },
      {
        id: "step-3",
        title: "Three-Way Match",
        description: "Automated verification against PO & GR",
        date: invoice.date,
        status: "completed",
        icon: "GitMerge",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500",
      },
      {
        id: "step-4",
        title: "Pending Approval",
        description: "Awaiting manager sign-off",
        date: invoice.status === "Pending Approval" ? "Today" : invoice.date,
        status: invoice.status === "Pending Approval" ? "current" : "completed",
        icon: "Clock",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning",
      },
    ];

    // If invoice is already finalized, update step 4 and add step 5
    if (invoice.status === "Approved" || invoice.status === "Rejected") {
      steps[3].status = "completed";
      steps.push({
        id: "step-5",
        title: invoice.status === "Approved" ? "Approved" : "Rejected",
        description: invoice.status === "Approved" ? "Payment scheduled" : "Returned to vendor",
        date: "Today",
        status: "completed", // Final state
        icon: invoice.status === "Approved" ? "CheckCircle" : "XCircle",
        color: invoice.status === "Approved" ? "text-success" : "text-error",
        bgColor: invoice.status === "Approved" ? "bg-success/10" : "bg-error/10",
        borderColor: invoice.status === "Approved" ? "border-success" : "border-error",
      });
    }

    return steps;
  }, [invoice]);

  if (!invoice) return null;

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Icon name="History" size={20} className="text-primary" />
        Audit Trail
      </h3>

      <div className="relative pl-4 space-y-8">
        {/* Continuous Line */}
        <div className="absolute top-2 left-[27px] w-0.5 h-[calc(100%-40px)] bg-gray-200 -z-10"></div>

        {timeline.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4"
          >
            {/* Icon Node */}
            <div
              className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white z-10 transition-colors duration-300",
                step.status === "current" ? "bg-white border-2 animate-pulse" : step.bgColor,
                step.status === "current" ? step.borderColor : "border-transparent",
                step.color
              )}
            >
              <Icon name={step.icon} size={14} />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex justify-between items-start">
                <h4
                  className={clsx(
                    "font-bold text-sm",
                    step.status === "current" ? "text-gray-900" : "text-gray-700"
                  )}
                >
                  {step.title}
                </h4>
                <span className="text-[10px] font-mono text-gray-400 bg-white/50 px-1.5 py-0.5 rounded">
                  {step.date}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrail;