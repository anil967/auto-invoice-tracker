"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/Icon";
import Link from "next/link";
import DropZone from "@/components/Dashboard/DropZone";

export default function VendorPortal() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const { getAllInvoices } = await import("@/lib/api");
                const data = await getAllInvoices();
                // In a real app, we'd filter by the current logged-in vendor
                // For demo, we'll show the most recent ones
                setSubmissions(data.slice(0, 5));
            } catch (e) {
                console.error("Failed to fetch vendor submissions", e);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
        const interval = setInterval(fetchSubmissions, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleUploadComplete = (newInvoice) => {
        setSubmissions(prev => [newInvoice, ...prev].slice(0, 5));
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PAID':
            case 'APPROVED':
            case 'VERIFIED': return 'text-success bg-success/10 border-success/20';
            case 'REJECTED': return 'text-error bg-error/10 border-error/20';
            case 'Processing':
            case 'Digitizing': return 'text-info bg-info/10 border-info/20 animate-pulse';
            default: return 'text-gray-500 bg-gray-100 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary rounded-lg shadow-lg group-hover:rotate-12 transition-transform">
                        <Icon name="Zap" className="text-white w-5 h-5" />
                    </div>
                    <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600">
                        InvoiceFlow <span className="text-primary font-medium text-sm ml-1">Vendor Hub</span>
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost btn-sm gap-2">
                        <Icon name="HelpCircle" size={18} /> Support
                    </button>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-inner flex items-center justify-center overflow-hidden">
                        <Icon name="User" size={20} className="text-slate-500" />
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Side: Upload Section */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                                Submit Your <span className="text-primary">Invoices</span>
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg">
                                Upload your billing documents for instant processing and automated matching.
                            </p>
                        </motion.div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                            <DropZone onUploadComplete={handleUploadComplete} />
                            <div className="mt-6 flex items-start gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <Icon name="Info" className="text-primary mt-1" size={20} />
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Supported formats: **PDF, PNG, JPG**. Max size: 10MB per file.
                                    Our AI will extract line items automatically for faster approval.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Tracking Section */}
                    <div className="lg:col-span-5 space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <Icon name="Activity" className="text-primary" />
                            Recent Submissions
                        </h2>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                    <p className="text-slate-400 mt-4 font-medium italic">Syncing with ERP...</p>
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
                                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                                        <Icon name="FileText" size={32} className="text-slate-300" />
                                    </div>
                                    <p className="font-bold text-slate-700">No submissions yet</p>
                                    <p className="text-sm text-slate-400">Your uploaded invoices will appear here.</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {submissions.map((inv, idx) => (
                                        <motion.div
                                            key={inv.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex justify-between items-center"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <Icon name="FileText" size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 truncate max-w-[150px]">{inv.originalName || "Invoice"}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{inv.id}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(inv.status)}`}>
                                                    {inv.status}
                                                </span>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                    {new Date(inv.receivedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        <button className="btn btn-ghost w-full btn-sm text-primary gap-2 hover:bg-primary/5">
                            View All History <Icon name="ChevronRight" size={16} />
                        </button>
                    </div>

                </div>
            </main>

        </div>
    );
}
