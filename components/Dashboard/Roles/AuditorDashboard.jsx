"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/Icon";
import { formatDate } from "@/utils/format";

const AuditorDashboard = ({ invoices }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [auditTrail, setAuditTrail] = useState([]);
    const [isLoadingTrail, setIsLoadingTrail] = useState(false);

    const filteredAuditItems = invoices.filter(inv =>
        inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchTrail = async (invoiceId) => {
        setIsLoadingTrail(true);
        try {
            const res = await fetch(`/api/audit?invoiceId=${invoiceId}`);
            const data = await res.json();
            setAuditTrail(data);
        } catch (e) {
            console.error("Failed to fetch trail", e);
        } finally {
            setIsLoadingTrail(false);
        }
    };

    const handleViewTrail = (invoice) => {
        setSelectedInvoice(invoice);
        fetchTrail(invoice.id);
        const modal = document.getElementById('audit_modal');
        if (modal) modal.showModal();
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-linear-to-r from-gray-800 to-gray-700 text-white border-none shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Icon name="ShieldCheck" size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-tight">Compliance Oversight (FR-6)</h2>
                        <p className="text-sm opacity-70">Strict Read-Only access enabled for 7-year data retention compliance.</p>
                    </div>
                </div>
            </Card>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search audit logs by invoice ID or vendor..."
                        className="input input-bordered w-full pl-12 rounded-full bg-white shadow-sm border-gray-100"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline border-gray-200 rounded-full gap-2 px-6">
                    <Icon name="Filter" size={16} /> Filters
                </button>
            </div>

            <Card className="p-0 overflow-hidden border-gray-100 shadow-sm">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Chain of Custody Log</h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-200 px-2 py-1 rounded">Immutable Records</span>
                </div>
                <div className="divide-y divide-gray-100">
                    {filteredAuditItems.length > 0 ? filteredAuditItems.map(inv => (
                        <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Icon name="FileText" size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{inv.vendorName} - <span className="font-mono text-xs text-primary">{inv.id}</span></p>
                                    <p className="text-[11px] text-gray-500 font-medium">Last Action: <span className="text-gray-900">{inv.status}</span> • Updated {formatDate(inv.updatedAt || new Date())}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleViewTrail(inv)}
                                className="btn btn-sm btn-outline btn-primary rounded-full gap-2 px-4 shadow-sm"
                            >
                                <Icon name="Eye" size={14} /> Full Trail
                            </button>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-gray-400 italic">No matching invoices found.</div>
                    )}
                </div>
            </Card>

            {/* Audit Trail Modal */}
            <dialog id="audit_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-2xl bg-white p-0 overflow-hidden rounded-3xl shadow-2xl">
                    <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-xl text-gray-800">Immutable Audit History</h3>
                            <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">
                                Invoice: <span className="text-primary">{selectedInvoice?.id}</span> • {selectedInvoice?.vendorName}
                            </p>
                        </div>
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost">✕</button>
                        </form>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {isLoadingTrail ? (
                            <div className="flex flex-col items-center justify-center p-12">
                                <span className="loading loading-spinner loading-lg text-primary"></span>
                                <p className="mt-4 text-xs font-bold text-gray-400 uppercase">Fetching Trail...</p>
                            </div>
                        ) : (
                            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                {auditTrail.length > 0 ? auditTrail.map((log, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        </div>
                                        <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded tracking-widest">{log.action || 'System Action'}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(log.timestamp)}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 font-semibold leading-relaxed">{log.details}</p>
                                            <div className="mt-4 pt-3 border-t border-gray-200/50 flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-primary/20 uppercase">
                                                    {log.username?.charAt(0) || 'S'}
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Action by: <span className="text-gray-900">{log.username || 'System'}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                                        <Icon name="SearchX" size={48} className="opacity-20 mb-4" />
                                        <p className="font-bold uppercase text-xs tracking-widest">No historical logs found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t flex justify-end">
                        <form method="dialog">
                            <button className="btn btn-primary rounded-full px-12 shadow-lg shadow-primary/20">Close Trail</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop backdrop-blur-sm bg-black/5">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default AuditorDashboard;
