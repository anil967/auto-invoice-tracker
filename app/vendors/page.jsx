"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/Icon";
import Link from "next/link";
import DropZone from "@/components/Dashboard/DropZone";
import { getAllInvoices } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import clsx from "clsx";

export default function VendorPortal() {
    const { user } = useAuth();
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const data = await getAllInvoices();
                // Server-side filtering already handles vendor isolation
                setAllSubmissions(data);
            } catch (e) {
                console.error("Failed to fetch vendor submissions", e);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
        const interval = setInterval(fetchSubmissions, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const stats = useMemo(() => {
        const total = allSubmissions.length;
        const paid = allSubmissions.filter(i => i.status === 'PAID').length;
        const pending = allSubmissions.filter(i => !['PAID', 'REJECTED'].includes(i.status)).length;
        const amount = allSubmissions.reduce((sum, i) => sum + (parseFloat(i.amount || i.totalAmount) || 0), 0);
        return { total, paid, pending, amount };
    }, [allSubmissions]);

    const handleUploadComplete = () => {
        // Polling will handle the update
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PAID': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'VERIFIED':
            case 'APPROVED': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'REJECTED': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'DIGITIZING':
            case 'RECEIVED': return 'text-amber-600 bg-amber-50 border-amber-100 animate-pulse';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleDownloadCSV = () => {
        if (allSubmissions.length === 0) {
            alert("No submissions to export.");
            return;
        }

        const headers = ["Invoice ID", "Original Name", "Date", "Amount", "Status"];
        const csvContent = [
            headers.join(","),
            ...allSubmissions.map(inv => [
                inv.id,
                `"${inv.originalName || "Invoice"}"`,
                inv.date || new Date(inv.receivedAt).toLocaleDateString(),
                inv.amount || inv.totalAmount || 0,
                inv.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `vendor_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
            {/* 1. Integrated Glass Navbar */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 px-6 md:px-12 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="p-2.5 bg-teal-600 rounded-xl shadow-lg shadow-teal-600/20 group-hover:rotate-6 transition-transform">
                        <Icon name="Zap" className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xl font-black tracking-tight text-slate-800">
                            Invoice<span className="text-teal-600">Flow</span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block -mt-1">Vendor Hub</span>
                    </div>
                </Link>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-600">Connected to Mainframe</span>
                    </div>
                    <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{user?.name || "Global Vendor"}</p>
                            <p className="text-[10px] text-teal-600 font-bold">Authenticated Profile</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20 flex items-center justify-center border-2 border-white">
                            <Icon name="User" size={20} className="text-white" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10 md:py-16 space-y-12">
                {/* 2. Welcome & Stats Grid */}
                <section className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
                                Your <span className="text-teal-600">Financial</span> Dashboard
                            </h1>
                            <p className="text-slate-500 mt-3 text-lg font-medium max-w-xl">
                                Seamlessly manage your billing, track payments in real-time, and resolve discrepancies instantly.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDownloadCSV}
                                className="h-12 px-6 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                            >
                                <Icon name="Download" size={18} /> Export CSV
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Icon name="Settings" size={20} />
                            </button>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Submissions', value: stats.total, icon: 'FileText', color: 'teal' },
                            { label: 'Paid Invoices', value: stats.paid, icon: 'CheckCircle', color: 'emerald' },
                            { label: 'Pending Approval', value: stats.pending, icon: 'Clock', color: 'amber' },
                            { label: 'Total Volume', value: `₹${stats.amount.toLocaleString()}`, icon: 'BarChart3', color: 'blue' }
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
                            >
                                <div className={clsx(
                                    "absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full -mr-12 -mt-12 transition-colors",
                                    stat.color === 'teal' && "bg-teal-500/10 group-hover:bg-teal-500/20",
                                    stat.color === 'emerald' && "bg-emerald-500/10 group-hover:bg-emerald-500/20",
                                    stat.color === 'amber' && "bg-amber-500/10 group-hover:bg-amber-500/20",
                                    stat.color === 'blue' && "bg-blue-500/10 group-hover:bg-blue-500/20",
                                )}></div>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className={clsx(
                                        "p-2.5 rounded-xl",
                                        stat.color === 'teal' && "bg-teal-50 text-teal-600",
                                        stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                                        stat.color === 'amber' && "bg-amber-50 text-amber-600",
                                        stat.color === 'blue' && "bg-blue-50 text-blue-600",
                                    )}>
                                        <Icon name={stat.icon} size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                </div>
                                <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 3. Main Work Area: Upload vs Feed */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">

                    {/* Left Side: Professional Upload Portal */}
                    <div className="xl:col-span-12">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
                            <div className="lg:w-1/2 p-8 md:p-12 space-y-8 bg-slate-50/50 border-r border-slate-100">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Rapid <span className="text-teal-600">Submission</span> Portal</h2>
                                    <p className="text-slate-500 mt-2 font-medium">Standardize your billing cycle with our AI-powered intake system.</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { icon: 'Zap', title: 'Instant OCR Extraction', text: 'Line items are identified in seconds.' },
                                        { icon: 'ShieldCheck', title: 'Automated 3-Way Match', text: 'Auto-sync with Purchase Orders and GR.' },
                                        { icon: 'Clock', title: 'Fast-Track Payment', text: 'Reduce approval cycles by up to 70%.' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 p-4 hover:bg-white rounded-2xl transition-colors">
                                            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg h-fit">
                                                <Icon name={item.icon} size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                                                <p className="text-[11px] text-slate-500 font-medium">{item.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-5 bg-teal-600 rounded-[2rem] text-white space-y-4 shadow-xl shadow-teal-600/20">
                                    <div className="flex items-center justify-between">
                                        <Icon name="Infinity" size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest border border-white/20 px-2 py-1 rounded-full bg-white/10">Enterprise Plan</span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed opacity-90">
                                        Your account is optimized for High-Volume verification. All API endpoints are active.
                                    </p>
                                </div>
                            </div>

                            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                <div className="h-full min-h-[400px]">
                                    <DropZone onUploadComplete={handleUploadComplete} />
                                </div>
                                <p className="text-[11px] text-center text-slate-400 mt-6 font-medium italic">
                                    Supported: PDF, JPG, PNG (Max 15MB) • Encrypted Transfer
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Professional Activity Table */}
                    <div className="xl:col-span-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <Icon name="Activity" size={18} />
                                </div>
                                Submissions Intelligence
                            </h2>
                            <button className="text-teal-600 font-black text-xs uppercase tracking-widest hover:underline transition-all">
                                History Vault
                            </button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-800">
                                            <th className="px-10 py-6">Document Identity</th>
                                            <th className="px-6 py-6 border-l border-white/5">Submitted On</th>
                                            <th className="px-6 py-6 border-l border-white/5">Gross Amount</th>
                                            <th className="px-6 py-6 border-l border-white/5">Workflow Status</th>
                                            <th className="px-10 py-6 text-right">Verification</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            [1, 2, 3].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan="5" className="px-10 py-6 bg-slate-50/50">
                                                        <div className="h-10 bg-slate-200 rounded-2xl w-full"></div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : allSubmissions.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-10 py-20 text-center">
                                                    <div className="max-w-xs mx-auto space-y-3">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                                            <Icon name="Inbox" size={32} />
                                                        </div>
                                                        <p className="text-lg font-black text-slate-400">No Submissions Found</p>
                                                        <p className="text-xs text-slate-400 font-medium">Your uploaded documents will appear here in real-time as they are processed.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <AnimatePresence mode="popLayout">
                                                {allSubmissions.slice(0, 10).map((inv, idx) => (
                                                    <motion.tr
                                                        key={inv.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="group hover:bg-slate-50/80 transition-all cursor-default"
                                                    >
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors flex items-center justify-center">
                                                                    <Icon name="FileText" size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{inv.originalName || "Corporate Invoice"}</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-tighter">REF: {inv.id.slice(0, 12)}...</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 border-l border-slate-50 font-bold text-slate-500 text-sm italic tracking-tight">
                                                            {new Date(inv.receivedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-6 border-l border-slate-50">
                                                            <p className="font-black text-slate-900 text-sm">
                                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(inv.amount || 0)}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-6 border-l border-slate-50">
                                                            <span className={clsx(
                                                                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm inline-flex items-center gap-2",
                                                                getStatusStyle(inv.status)
                                                            )}>
                                                                <span className={clsx("w-1.5 h-1.5 rounded-full", inv.status === 'DIGITIZING' ? "bg-amber-500 animate-pulse" : "bg-current opacity-40")}></span>
                                                                {inv.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-10 py-6 text-right border-l border-slate-50">
                                                            <button className="p-2 text-slate-300 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
                                                                <Icon name="ExternalLink" size={18} />
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
                                <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-teal-600 transition-all flex items-center gap-2">
                                    Load Secure History <Icon name="ChevronDown" size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Support Float */}
            <div className="fixed bottom-8 right-8 z-40">
                <button className="w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
                    <Icon name="LifeBuoy" size={24} className="group-hover:rotate-45 transition-transform" />
                </button>
            </div>

            {/* Settings Modal - Custom Overlay */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setIsSettingsOpen(false)}
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-[101]"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10">
                                        <Icon name="Settings" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-slate-800 tracking-tight">Vendor Preferences</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Configuration</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(false); }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <Icon name="X" size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <Icon name="Bell" size={20} className="text-teal-600" />
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">Payment Notifications</p>
                                                <p className="text-xs text-slate-400">Receive SMS alerts on payment.</p>
                                            </div>
                                        </div>
                                        <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <Icon name="Moon" size={20} className="text-indigo-600" />
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">Dark Mode</p>
                                                <p className="text-xs text-slate-400">Switch dashboard theme.</p>
                                            </div>
                                        </div>
                                        <input type="checkbox" className="toggle toggle-primary toggle-sm" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                                        <div className="flex items-center gap-3">
                                            <Icon name="CreditCard" size={20} className="text-purple-600" />
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">Direct Debit</p>
                                                <p className="text-xs text-slate-400">Auto-withdraw to bank account.</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black bg-slate-200 text-slate-500 px-2 py-1 rounded-full uppercase">Pending KYC</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(false); }}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
