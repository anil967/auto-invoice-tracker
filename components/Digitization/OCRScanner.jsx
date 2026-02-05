"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const OCRScanner = ({ imageUrl = "https://picsum.photos/600/800", isScanning = true }) => {
  const [scanLineY, setScanLineY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanLineY((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => prev + 90);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20 group">
      {/* Container for the image that gets transformed */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
      >
          {/* Background Image (The Invoice) */}
          <div 
            className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-90 transition-opacity duration-500 group-hover:opacity-100"
            style={{ backgroundImage: `url('${imageUrl}')` }}
          ></div>
      </div>

      {/* Dark Overlay for contrast (remains static) */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

      {/* Scanning Line Animation - hidden if zoomed or rotated to avoid misalignment visuals */}
      {isScanning && zoom === 1 && rotation % 360 === 0 && (
        <>
            <motion.div
            className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_5px_rgba(var(--color-primary),0.6)] z-10 pointer-events-none"
            style={{ top: `${scanLineY}%` }}
            animate={{
                boxShadow: [
                "0 0 10px 2px rgba(79, 70, 229, 0.4)",
                "0 0 20px 5px rgba(79, 70, 229, 0.7)",
                "0 0 10px 2px rgba(79, 70, 229, 0.4)",
                ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            />
            
            {/* Scanning Overlay Gradient */}
            <div 
                className="absolute left-0 right-0 h-24 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none transition-all duration-75 z-10"
                style={{ top: `${scanLineY}%` }}
            ></div>
        </>
      )}

      {/* Simulated Recognized Fields Highlight - visible only on default view */}
      {zoom === 1 && rotation % 360 === 0 && (
          <>
            <div className="absolute top-[15%] left-[10%] w-[30%] h-[5%] border-2 border-green-400/60 bg-green-400/10 rounded-sm animate-pulse pointer-events-none"></div>
            <div className="absolute top-[25%] right-[10%] w-[20%] h-[4%] border-2 border-blue-400/60 bg-blue-400/10 rounded-sm animate-pulse delay-75 pointer-events-none"></div>
            <div className="absolute bottom-[15%] right-[10%] w-[25%] h-[5%] border-2 border-yellow-400/60 bg-yellow-400/10 rounded-sm animate-pulse delay-150 pointer-events-none"></div>
          </>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div className="badge badge-primary gap-2 shadow-lg glass text-white font-semibold p-3">
            {isScanning ? (
                <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Scanning...
                </>
            ) : (
                "Scan Complete"
            )}
        </div>
      </div>
      
      {/* Controls (Zoom, Rotate) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
          <button 
            onClick={handleZoomOut}
            className="btn btn-circle btn-xs btn-ghost text-white hover:bg-white/20 tooltip tooltip-top"
            data-tip="Zoom Out"
            aria-label="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
          <button 
            onClick={handleZoomIn}
            className="btn btn-circle btn-xs btn-ghost text-white hover:bg-white/20 tooltip tooltip-top"
            data-tip="Zoom In"
            aria-label="Zoom In"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
          <div className="w-px h-4 bg-white/20 self-center mx-1"></div>
           <button 
            onClick={handleRotate}
            className="btn btn-circle btn-xs btn-ghost text-white hover:bg-white/20 tooltip tooltip-top"
            data-tip="Rotate"
            aria-label="Rotate"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
      </div>
    </div>
  );
};

export default OCRScanner;