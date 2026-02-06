"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/Icon";

const NotificationLog = ({ relatedEntityId }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { getAuditLogs } = await import("@/lib/api");
                const logs = await getAuditLogs(relatedEntityId);

                // Transform audit logs to notification format
                const formattedLogs = logs.map((log, index) => ({
                    id: index,
                    type: 'SYSTEM',
                    subject: `${log.action} - ${log.username}`,
                    recipient: 'System Log',
                    status: 'LOGGED',
                    timestamp: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    details: log.details
                })).slice(0, 5); // Show latest 5

                setNotifications(formattedLogs);
            } catch (error) {
                console.error("Failed to load audit logs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Poll for real-time updates
        return () => clearInterval(interval);
    }, [relatedEntityId]);

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-sm">System Audit Trail</h3>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">Live</span>
            </div>
            <div className="divide-y max-h-[300px] overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-400 text-xs">Syncing logs...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-xs">No activity recorded yet</div>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} className="p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors group">
                            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <Icon name="Activity" size={14} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-800">{n.subject}</p>
                                <p className="text-[10px] text-gray-500 line-clamp-2" title={n.details}>{n.details}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-medium text-gray-400">{n.timestamp}</p>
                                <span className="text-[9px] text-slate-400 font-bold flex items-center justify-end gap-1">
                                    <Icon name="Check" size={8} /> {n.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

export default NotificationLog;
