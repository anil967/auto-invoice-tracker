"use client";

import Card from "@/components/ui/Card";
import Icon from "@/components/Icon";
import DropZone from "@/components/Dashboard/DropZone";

const FinanceUserDashboard = ({ invoices, onUploadComplete }) => {
    const discrepancyCount = invoices.filter(inv => inv.status === 'MATCH_DISCREPANCY').length;
    const manualReview = invoices.filter(inv => inv.status === 'VALIDATION_REQUIRED').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-error/10 border-error/20 border">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-error uppercase">Discrepancies (3-Way)</p>
                            <p className="text-2xl font-black text-error mt-1">{discrepancyCount}</p>
                        </div>
                        <Icon name="AlertTriangle" className="text-error opacity-40" size={32} />
                    </div>
                </Card>
                <Card className="p-4 bg-info/10 border-info/20 border">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-info uppercase">Manual Review Needed</p>
                            <p className="text-2xl font-black text-info mt-1">{manualReview}</p>
                        </div>
                        <Icon name="UserCheck" className="text-info opacity-40" size={32} />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <h3 className="font-bold mb-4">Bulk Ingestion Queue</h3>
                        <DropZone onUploadComplete={onUploadComplete} />
                    </Card>
                </div>
                <div>
                    <Card className="p-0 overflow-hidden h-full">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-bold">IDP Feedback</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="p-3 bg-gray-50 rounded-xl text-xs">
                                <p className="font-bold text-gray-700">Learning Context</p>
                                <p className="text-gray-500 mt-1 italic">"Vendor ACME changed invoice layout. Training model with new coordinates..."</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Extraction Accuracy</p>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-success h-full" style={{ width: '96%' }}></div>
                                </div>
                                <p className="text-right text-[10px] font-bold text-success">96% High Confidence</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FinanceUserDashboard;
