"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/Icon";
import Link from "next/link";
import axios from "axios";

const AdminDashboard = () => {
    const [systemHealth, setSystemHealth] = useState({
        dbStatus: 'Checking...',
        apiLatency: '--',
        storageUsage: '--'
    });

    const [recentLogs, setRecentLogs] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [logsRes, usersRes, healthRes] = await Promise.all([
                axios.get('/api/audit?limit=5'),
                axios.get('/api/users'),
                axios.get('/api/health')
            ]);
            setRecentLogs(logsRes.data || []);
            setUserCount(usersRes.data?.length || 0);

            // Update health data from API
            if (healthRes.data) {
                setSystemHealth({
                    dbStatus: healthRes.data.dbStatus || 'Unknown',
                    apiLatency: healthRes.data.apiLatency || '0ms',
                    storageUsage: healthRes.data.storageUsage || '0%'
                });
            }
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            setSystemHealth({
                dbStatus: 'Error',
                apiLatency: 'N/A',
                storageUsage: 'N/A'
            });
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { name: "User Management", icon: "Users", path: "/users", color: "from-blue-500 to-blue-600", desc: "Manage system users" },
        { name: "Configuration", icon: "Settings", path: "/config", color: "from-purple-500 to-purple-600", desc: "System settings" },
        { name: "Audit Logs", icon: "FileText", path: "/audit", color: "from-teal-500 to-teal-600", desc: "Activity history" },
        { name: "Analytics", icon: "BarChart3", path: "/analytics", color: "from-orange-500 to-orange-600", desc: "Reports & insights" }
    ];

    const formatTime = (timestamp) => {
        if (!timestamp) return "Just now";
        const date = new Date(timestamp);
        const diff = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff} mins ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-8">
            {/* System Health Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5 border-l-4 border-l-success bg-gradient-to-br from-white to-green-50/30">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Database</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></div>
                        <p className="text-xl font-bold text-gray-900">{systemHealth.dbStatus}</p>
                    </div>
                </Card>
                <Card className="p-5 border-l-4 border-l-accent bg-gradient-to-br from-white to-purple-50/30">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">{loading ? '...' : userCount}</p>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.path} href={action.path}>
                            <Card className="p-5 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon name={action.icon} size={24} className="text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900">{action.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Configuration Summary */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/80 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">System Configuration</h3>
                        <Link href="/config" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                            <Icon name="Settings" size={14} />
                            Edit
                        </Link>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">3-Way Match Tolerance</span>
                            <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">±5%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">OCR Engine</span>
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">Azure Form Recognizer</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Audit Retention</span>
                            <span className="font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded">7 Years</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">SAP Integration</span>
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Connected
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/80 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Recent System Activity</h3>
                        <Link href="/audit" className="text-sm text-primary font-medium hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y">
                        {loading ? (
                            <div className="p-6 text-center text-gray-400">Loading...</div>
                        ) : recentLogs.length === 0 ? (
                            <div className="p-6 text-center text-gray-400">No recent activity</div>
                        ) : (
                            recentLogs.map((log, idx) => (
                                <div key={log._id || idx} className="p-3 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                            {log.username?.charAt(0) || "S"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{log.username || "System"}</p>
                                            <p className="text-xs text-gray-500">{log.action}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{formatTime(log.timestamp)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
