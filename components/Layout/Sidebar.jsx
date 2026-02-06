"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { motion } from "framer-motion";
import clsx from "clsx";
import { APP_VERSION } from "@/lib/version";
import { useAuth } from "@/context/AuthContext";
import { canSeeMenuItem } from "@/constants/roles";

const menuItems = [
  { name: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
  { name: "Digitization", icon: "ScanLine", path: "/digitization" },
  { name: "Matching", icon: "GitMerge", path: "/matching" },
  { name: "Approvals", icon: "CheckCircle", path: "/approvals" },
  { name: "Vendors", icon: "Users", path: "/vendors" },
  { name: "Analytics", icon: "BarChart3", path: "/analytics" },
  { name: "Configuration", icon: "Settings", path: "/config" },
  { name: "User Management", icon: "Shield", path: "/users" },
  { name: "Audit Logs", icon: "FileText", path: "/audit" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => canSeeMenuItem(user, item.name));

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 z-40 pt-6 pb-6 pl-6">
      <div className="glass-panel h-full rounded-3xl flex flex-col justify-between overflow-hidden p-4 relative">

        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Icon name="Zap" className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            InvoiceFlow
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className="block relative group"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={clsx(
                  "relative flex items-center gap-4 px-4 py-3 rounded-xl transition-colors duration-200",
                  isActive ? "text-primary font-semibold" : "text-gray-500 hover:text-gray-900 hover:bg-white/30"
                )}>
                  <Icon
                    name={item.icon}
                    size={20}
                    className={isActive ? "text-primary" : "text-gray-400 group-hover:text-primary transition-colors"}
                  />
                  <span>{item.name}</span>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Version Indicator */}
        <div className="mt-auto pt-6 border-t border-gray-200/30 flex justify-between items-center px-2">
          <span className="text-xs font-mono text-gray-400">v{APP_VERSION}</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-success/50 animate-pulse" title="System Online"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;