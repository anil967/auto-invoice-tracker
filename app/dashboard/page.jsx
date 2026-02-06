"use client";

// Force dynamic rendering - always fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "@/components/Icon";
import { getAllInvoices } from "@/lib/api";
import AnalyticsView from "@/components/Dashboard/AnalyticsView";
import RoleSwitcher from "@/components/Dashboard/RoleSwitcher";
import DropZone from "@/components/Dashboard/DropZone";
import StatCard from "@/components/Dashboard/StatCard";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser, ROLES, getDelegation, clearDelegation, setDelegation } from "@/utils/auth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingCount: 0,
    processingCount: 0,
    approvedCount: 0,
    verifiedCount: 0,
    discrepancyCount: 0
  });
  const [activeTab, setActiveTab] = useState("overview");

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const data = await getAllInvoices();
      setInvoices(data);
      calculateStats(data);
    } catch (e) {
      console.error("Dashboard fetch error", e);
    }
  };

  const calculateStats = (data) => {
    const totalAmount = data.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const pendingCount = data.filter(inv => inv.status === "PENDING_APPROVAL").length;
    const processingCount = data.filter(inv => ["DIGITIZING", "RECEIVED"].includes(inv.status)).length;
    const verifiedCount = data.filter(inv => inv.status === "VERIFIED").length;
    const discrepancyCount = data.filter(inv => inv.status === "MATCH_DISCREPANCY").length;

    setStats({
      totalAmount,
      pendingCount,
      processingCount,
      verifiedCount,
      discrepancyCount
    });
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchData();

    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    if (!currentUser) return true;
    if (currentUser.role === ROLES.ADMIN) return true;
    if (currentUser.role === ROLES.PROJECT_MANAGER) {
      // PMs only see Verified or Discrepancy invoices waiting for their input
      return ['VERIFIED', 'MATCH_DISCREPANCY', 'PENDING_APPROVAL'].includes(inv.status);
    }
    return true; // Finance sees all
  });

  const handleUploadComplete = () => {
    fetchData(); // Refresh data after upload
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  // Show loading state while checking authentication
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your financial workflows</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="tabs tabs-boxed bg-white/40 border border-white/60 backdrop-blur-md p-1 rounded-full">
            <button
              className={`tab tab-sm h-8 px-4 rounded-full transition-all ${activeTab === 'overview' ? 'tab-active bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`tab tab-sm h-8 px-4 rounded-full transition-all ${activeTab === 'analytics' ? 'tab-active bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>

          <RoleSwitcher />

          <button
            onClick={() => window.open('/api/invoices/export')}
            className="btn btn-sm btn-ghost bg-white/40 border border-white/60 shadow-sm"
          >
            <Icon name="Download" size={16} />
            <span>Export Audit Trail</span>
          </button>

          {currentUser?.role === ROLES.PROJECT_MANAGER && (
            <button
              onClick={() => {
                const del = getDelegation();
                if (del) clearDelegation();
                else setDelegation(ROLES.FINANCE_MANAGER);
                alert(del ? "Delegation cleared!" : "Authority delegated to Finance Manager!");
              }}
              className={`btn btn-sm shadow-sm ${getDelegation() ? 'btn-error text-white' : 'btn-ghost bg-white/40 border-white/60'}`}
            >
              <Icon name={getDelegation() ? "UserX" : "UserPlus"} size={16} />
              <span>{getDelegation() ? "Clear Delegation" : "Delegate Authority"}</span>
            </button>
          )}

          <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost bg-white/40 border border-white/60 shadow-sm">
              <Icon name="Calendar" size={16} />
              <span>Oct 2023</span>
            </button>
            <button className="btn btn-sm btn-primary text-white shadow-lg shadow-primary/30 rounded-full px-4">
              <Icon name="Plus" size={16} />
              <span>New Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <AnalyticsView />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Volume"
              value={formatCurrency(stats.totalAmount)}
              icon="DollarSign"
              trend="up"
              trendValue="12%"
              color="primary"
              delay={0}
            />
            <StatCard
              title="Discrepancies"
              value={stats.discrepancyCount}
              icon="AlertCircle"
              color="error"
              delay={1}
            />
            <StatCard
              title="Verified"
              value={stats.verifiedCount}
              icon="CheckCircle"
              color="success"
              delay={2}
            />
            <StatCard
              title="Pending Approval"
              value={stats.pendingCount}
              icon="Clock"
              color="warning"
              delay={3}
            />
          </div>

          {/* Main Content Split: DropZone & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[500px]">
            {/* Left Column: Interactive Drop Zone */}
            <div className="lg:col-span-2 h-full">
              <Card className="h-full flex flex-col" hoverEffect={false}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Quick Upload</h3>
                    <p className="text-sm text-gray-500">Drag invoices here to start processing</p>
                  </div>
                  <button className="btn btn-circle btn-ghost btn-sm">
                    <Icon name="MoreHorizontal" size={20} />
                  </button>
                </div>
                <div className="flex-1 min-h-[300px]">
                  <DropZone onUploadComplete={handleUploadComplete} />
                </div>
              </Card>
            </div>

            {/* Right Column: Recent Activity Feed */}
            <div className="lg:col-span-1 h-full">
              <Card className="h-full flex flex-col" hoverEffect={false}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                  <Link href="/reports" className="text-sm text-primary hover:underline">View All</Link>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {filteredInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Icon name="Inbox" size={48} className="mb-2 opacity-50" />
                      <p>No invoices matching your role</p>
                    </div>
                  ) : (
                    filteredInvoices.slice(0, 6).map((inv, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/60 cursor-pointer"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${['APPROVED', 'VERIFIED', 'PAID'].includes(inv.status) ? 'bg-success/10 text-success' :
                          inv.status === 'PENDING_APPROVAL' ? 'bg-warning/10 text-warning' :
                            ['MATCH_DISCREPANCY', 'VALIDATION_REQUIRED'].includes(inv.status) ? 'bg-error/10 text-error' :
                              'bg-info/10 text-info'
                          }`}>
                          <Icon name={
                            ['APPROVED', 'VERIFIED', 'PAID'].includes(inv.status) ? 'Check' :
                              inv.status === 'PENDING_APPROVAL' ? 'Clock' :
                                ['MATCH_DISCREPANCY', 'VALIDATION_REQUIRED'].includes(inv.status) ? 'AlertCircle' :
                                  'RefreshCw'
                          } size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">{inv.vendorName}</h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            {inv.id} • <span className="opacity-75">{inv.date}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-700 text-sm">{formatCurrency(inv.amount)}</p>
                          <span className={`text-[10px] uppercase font-bold ${['APPROVED', 'VERIFIED', 'PAID'].includes(inv.status) ? 'text-success' :
                            inv.status === 'PENDING_APPROVAL' ? 'text-warning' :
                              ['MATCH_DISCREPANCY', 'VALIDATION_REQUIRED'].includes(inv.status) ? 'text-error' :
                                'text-info'
                            }`}>
                            {inv.status}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Quick Actions / Recent Filings Info */}
    </div>
  );
}