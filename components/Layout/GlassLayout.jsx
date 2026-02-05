"use client";

import { useEffect } from "react";
import Background3D from "@/components/Layout/Background3D";
import Sidebar from "@/components/Layout/Sidebar";
import Navbar from "@/components/Layout/Navbar";
import { initStorage } from "@/utils/storage";

const GlassLayout = ({ children }) => {
  
  // Initialize mock data storage on first load
  useEffect(() => {
    initStorage();
  }, []);

  return (
    <div className="min-h-screen w-full relative font-sans text-base-content selection:bg-primary/20">
      <Background3D />
      
      <div className="flex w-full h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
           <div className="pt-6 px-6 pb-0">
               <div className="glass-panel rounded-t-3xl h-[calc(100vh-1.5rem)] flex flex-col backdrop-blur-lg border-b-0">
                  <Navbar />
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar scroll-smooth">
                    {children}
                  </div>
               </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default GlassLayout;