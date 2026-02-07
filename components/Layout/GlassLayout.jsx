"use client";

import { usePathname } from "next/navigation";
import Background3D from "@/components/Layout/Background3D";
import Navbar from "@/components/Layout/Navbar";

const GlassLayout = ({ children }) => {
  const pathname = usePathname();
  const isPublicPage = ["/login", "/signup", "/"].includes(pathname);

  return (
    <div className="min-h-screen w-full relative font-sans text-base-content selection:bg-primary/20">
      <Background3D />

      {isPublicPage ? (
        // Public Layout (Full width, no sidebar/navbar)
        <main className="w-full h-screen overflow-auto relative z-10">
          {children}
        </main>
      ) : (
        // App Layout (full width, no sidebar)
        <div className="w-full h-screen overflow-hidden flex flex-col">
          <div className="pt-6 px-6 pb-0 flex-1 flex flex-col min-h-0">
            <div className="glass-panel rounded-t-3xl h-[calc(100vh-1.5rem)] flex flex-col backdrop-blur-lg border-b-0 flex-1 min-h-0">
              <Navbar />
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar scroll-smooth">
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlassLayout;