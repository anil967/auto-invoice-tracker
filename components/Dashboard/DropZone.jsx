"use client";

import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/Icon";
import { ingestInvoice } from "@/lib/api";

const DropZone = forwardRef(({ onUploadComplete }, ref) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadSuccess(false);

    try {
      // Step through files
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];

        // Update progress based on file count
        setUploadProgress(Math.round(((i) / acceptedFiles.length) * 100) + 10);

        await ingestInvoice(file);
        // The backend handles saving and initial status
      }

      setUploadProgress(100);
      setUploadSuccess(true);

      // Reset after success animation
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSuccess(false);
        if (onUploadComplete) onUploadComplete();
      }, 1500);

    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 5,
    noClick: false // Allow click on container
  });

  // Expose open method to parent
  useImperativeHandle(ref, () => ({
    open: () => open()
  }));

  return (
    <div className="w-full h-full min-h-[300px]">
      <div
        {...getRootProps()}
        className={`
          relative w-full h-full rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8
          ${isDragActive
            ? "border-primary bg-primary/5 shadow-inner scale-[0.99]"
            : "border-gray-300 hover:border-primary/50 hover:bg-white/40 bg-white/20"}
          ${isDragReject ? "border-error bg-error/5" : ""}
          backdrop-blur-sm cursor-pointer overflow-hidden group
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full z-10"
            >
              {uploadSuccess ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4 mx-auto"
                  >
                    <Icon name="Check" size={40} className="text-success" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-700">Upload Complete!</h3>
                  <p className="text-gray-500">Processing your invoices...</p>
                </div>
              ) : (
                <div className="w-full max-w-xs text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                    <Icon name="UploadCloud" size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Uploading Files...</h3>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{uploadProgress}%</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center z-10"
            >
              <div className={`
                w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center transition-colors duration-300
                ${isDragActive ? "bg-primary text-white shadow-xl shadow-primary/30" : "bg-white/60 text-primary shadow-lg"}
              `}>
                <Icon name="Upload" size={36} className={isDragActive ? "animate-bounce" : ""} />
              </div>

              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                {isDragActive ? "Drop files here" : "Upload Invoices"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                Drag & drop your invoices here, or click to browse files.
                <br />
                <span className="text-xs opacity-70">(PDF, JPG, PNG supported)</span>
              </p>

              <button type="button" className="btn btn-outline btn-primary rounded-full px-8 border-2 font-bold hover:scale-105 transition-transform">
                Browse Files
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative elements inside dropzone */}
        {!isUploading && (
          <>
            <div className="absolute top-10 left-10 text-gray-300 rotate-12 pointer-events-none group-hover:scale-110 transition-transform">
              <Icon name="FileText" size={48} />
            </div>
            <div className="absolute bottom-10 right-10 text-gray-300 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform">
              <Icon name="Image" size={48} />
            </div>
          </>
        )}
      </div>
    </div>
  );
});

DropZone.displayName = "DropZone";

export default DropZone;