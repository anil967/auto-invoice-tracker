"use client";

import Card from "@/components/ui/Card";
import Icon from "@/components/Icon";
import { formatCurrency } from "@/utils/format";

const FinanceManagerDashboard = ({ invoices }) => {
    const paymentQueue = invoices.filter(inv => inv.status === 'PENDING_APPROVAL');
    const totalExposure = invoices.reduce((sum, inv) => sum + (inv.status !== 'PAID' ? parseFloat(inv.amount) : 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-primary text-white">
                    <p className="text-xs font-bold uppercase opacity-80">Total Liability</p>
                    <p className="text-2xl font-black mt-1">{formatCurrency(totalExposure)}</p>
                </Card>
                <Card className="p-4 bg-white shadow-sm border">
                    <p className="text-xs font-bold text-gray-500 uppercase">Payment Queue</p>
                    <p className="text-2xl font-black mt-1">{paymentQueue.length} Invoices</p>
                </Card>
                <Card className="p-4 bg-white shadow-sm border">
                    <p className="text-xs font-bold text-gray-500 uppercase">Vendor Performance</p>
                    <p className="text-2xl font-black mt-1 text-success">98.2%</p>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold">Awaiting Final Payment Release (FR-5)</h3>
                    <button className="btn btn-xs btn-primary">Batch Release</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full text-sm">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th>Vendor</th>
                                <th>Amount</th>
                                <th>Matched By</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentQueue.length > 0 ? paymentQueue.map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50">
                                    <td className="font-semibold">{inv.vendorName}</td>
                                    <td className="font-bold">{formatCurrency(inv.amount)}</td>
                                    <td><span className="badge badge-ghost badge-sm">PM Approved</span></td>
                                    <td>
                                        <button className="btn btn-xs btn-success text-white">Release Payment</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-400">No invoices pending final approval</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FinanceManagerDashboard;
