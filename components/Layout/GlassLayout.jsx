"use client";

import { usePathname } from "next/navigation";
import Background3D from "@/components/Layout/Background3D";
import Sidebar from "@/components/Layout/Sidebar";
import Navbar from "@/components/Layout/Navbar";
import Sidebar from "@/components/Layout/Sidebar";

const GlassLayout = ({ children }) => {
  const pathname = usePathname();
  const isPublicPage = ["/login", "/signup", "/"].includes(pathname);
  const isVendorPage = pathname === "/vendors";

  return (
    <div className="min-h-screen w-full relative font-sans text-base-content selection:bg-primary/20">
      <Background3D />

      {isPublicPage ? (
        // Public Layout (Full width, no sidebar/navbar)
        <main className="w-full h-screen overflow-auto relative z-10">
          {children}
        </main>
<<<<<<< HEAD
      ) : isVendorPage ? (
        // Vendor page: full width, no sidebar (vendor has its own nav)
        <div className="w-full h-screen overflow-hidden flex flex-col">
          <div className="pt-6 px-6 pb-0 flex-1 flex flex-col min-h-0">
            <div className="glass-panel rounded-t-3xl h-[calc(100vh-1.5rem)] flex flex-col backdrop-blur-lg border-b-0 flex-1 min-h-0">
=======
      ) : (
        // App Layout (Sidebar + content)
        <div className="w-full h-screen overflow-hidden flex flex-row">
          <Sidebar />
          <div className="pt-6 px-6 pb-6 flex-1 flex flex-col min-h-0">
            <div className="glass-panel rounded-3xl h-full flex flex-col backdrop-blur-lg flex-1 min-h-0">
>>>>>>> 3b2a81dcd4dd9ae74dc412b9498a3a5e4bf7de3d
              <Navbar />
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar scroll-smooth">
                {children}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Other app pages: sidebar + main content
        <div className="flex w-full h-screen overflow-hidden">
          <Sidebar />
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
      )}
    </div>
  );
};

export default GlassLayout;