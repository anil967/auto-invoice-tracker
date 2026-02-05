"use client";

import Icon from "@/components/Icon";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const Navbar = () => {
  const [notifications] = useState(3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [areNotificationsOpen, setAreNotificationsOpen] = useState(false);
  
  // Refs for click outside handling
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleNotifications = () => setAreNotificationsOpen(!areNotificationsOpen);
  
  const handleSettingsClick = () => {
    // eslint-disable-next-line no-alert
    alert("Settings panel coming soon!");
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (areNotificationsOpen && notificationRef.current && !notificationRef.current.contains(event.target)) {
        setAreNotificationsOpen(false);
      }
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [areNotificationsOpen, isMobileMenuOpen]);


  return (
    <header className="navbar w-full p-0 min-h-[4rem] relative z-50">
      <div className="flex-1 lg:hidden">
        {/* Mobile Menu Trigger */}
        <div className="dropdown" ref={mobileMenuRef}>
            <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-ghost lg:hidden"
                onClick={toggleMobileMenu}
            >
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </div>
            {isMobileMenuOpen && (
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 absolute left-0 top-full">
                    <li><Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link></li>
                    <li><Link href="/digitization" onClick={() => setIsMobileMenuOpen(false)}>Digitization</Link></li>
                    <li><Link href="/approvals" onClick={() => setIsMobileMenuOpen(false)}>Approvals</Link></li>
                </ul>
            )}
        </div>
        <Link href="/" className="btn btn-ghost text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">InvoiceFlow</Link>
      </div>

      <div className="flex-1 hidden lg:flex px-4">
          <div className="relative w-full max-w-md">
            <input 
                type="text" 
                placeholder="Search invoices, vendors..." 
                className="input input-sm w-full bg-white/40 border-gray-200/50 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full pl-10 transition-all" 
            />
            <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
      </div>

      <div className="flex-none gap-2 pr-4">
        {/* Notifications */}
        <div className="dropdown dropdown-end" ref={notificationRef}>
          <div 
            tabIndex={0} 
            role="button" 
            className="btn btn-ghost btn-circle bg-white/30 hover:bg-white/60"
            onClick={toggleNotifications}
          >
            <div className="indicator">
              <Icon name="Bell" size={20} className="text-gray-600" />
              {notifications > 0 && (
                  <span className="badge badge-sm badge-error indicator-item text-white border-none w-5 h-5">{notifications}</span>
              )}
            </div>
          </div>
          {areNotificationsOpen && (
            <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100/90 backdrop-blur-md shadow-xl border border-white/20 absolute right-0 top-full">
                <div className="card-body">
                <span className="font-bold text-lg">{notifications} New Notifications</span>
                <ul className="py-2 space-y-2">
                    <li className="flex gap-2 items-start text-sm p-2 hover:bg-base-200 rounded-lg cursor-pointer transition-colors">
                        <span className="w-2 h-2 mt-1.5 rounded-full bg-info shrink-0"></span>
                        <div>
                            <p className="font-semibold">Invoice #INV-003 Processed</p>
                            <p className="text-xs text-gray-500">2 mins ago</p>
                        </div>
                    </li>
                    <li className="flex gap-2 items-start text-sm p-2 hover:bg-base-200 rounded-lg cursor-pointer transition-colors">
                        <span className="w-2 h-2 mt-1.5 rounded-full bg-warning shrink-0"></span>
                        <div>
                            <p className="font-semibold">Approval Required: #INV-001</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                    </li>
                    <li className="flex gap-2 items-start text-sm p-2 hover:bg-base-200 rounded-lg cursor-pointer transition-colors">
                        <span className="w-2 h-2 mt-1.5 rounded-full bg-error shrink-0"></span>
                        <div>
                            <p className="font-semibold">Failed OCR: #INV-009</p>
                            <p className="text-xs text-gray-500">3 hours ago</p>
                        </div>
                    </li>
                </ul>
                <div className="card-actions">
                    <button className="btn btn-primary btn-block btn-sm text-white" onClick={() => setAreNotificationsOpen(false)}>View all</button>
                </div>
                </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button 
            className="btn btn-ghost btn-circle bg-white/30 hover:bg-white/60"
            onClick={handleSettingsClick}
        >
            <Icon name="Settings" size={20} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;