"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/Icon";
import Button from "@/components/ui/Button";

const AdminDashboard = () => {
    const [systemHealth, setSystemHealth] = useState({
        dbStatus: 'Connected',
        apiLatency: '124ms',
        storageUsage: '42%'
    });

    const [recentLogs, setRecentLogs] = useState([
        { id: 1, user: 'Finance User 1', action: 'Upload', time: '5 mins ago' },
        { id: 2, user: 'Admin', action: 'Config Change', time: '12 mins ago' },
        { id: 3, user: 'PM John', action: 'Approval', time: '45 mins ago' }
    ]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-l-4 border-l-success">
                    <p className="text-xs font-bold text-gray-500 uppercase">Database Status</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                        <p className="text-xl font-bold">{systemHealth.dbStatus}</p>
                    </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-primary">
                    <p className="text-xs font-bold text-gray-500 uppercase">API Latency</p>
                    <p className="text-xl font-bold mt-1">{systemHealth.apiLatency}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-warning">
                    <p className="text-xs font-bold text-gray-500 uppercase">Azure Storage</p>
                    <p className="text-xl font-bold mt-1">{systemHealth.storageUsage}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold">System Configuration</h3>
                        <Button variant="ghost" size="sm" icon="Settings">Edit</Button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">3-Way Match Tolerance</span>
                            <span className="font-mono bg-gray-100 px-2 rounded">5%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">OCR Engine</span>
                            <span className="font-mono bg-gray-100 px-2 rounded">Azure Form Recognizer</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Audit Retention</span>
                            <span className="font-mono bg-gray-100 px-2 rounded">7 Years (Compliance)</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-bold">Recent System Activity</h3>
                    </div>
                    <div className="divide-y text-sm">
                        {recentLogs.map(log => (
                            <div key={log.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold">{log.user}</p>
                                    <p className="text-xs text-gray-500">{log.action}</p>
                                </div>
                                <span className="text-xs text-gray-400">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
