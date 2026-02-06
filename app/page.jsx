"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#F8F9FC]">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 bg-linear-to-br from-indigo-100 via-purple-50 to-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      </div>

      {/* Top Navigation for public access */}
      <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 px-8">
        <div className="text-xl font-black bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">
          InvoiceFlow
        </div>
        <div className="flex gap-4">
          {!isLoading && user ? (
            <Link href="/dashboard">
              <button className="btn btn-primary btn-sm md:btn-md rounded-full px-6 text-white shadow-lg shadow-primary/20">Dashboard</button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <button className="btn btn-ghost hover:bg-white/50 rounded-full px-6">Login</button>
              </Link>
              <Link href="/signup">
                <button className="btn btn-primary btn-sm md:btn-md rounded-full px-6 text-white shadow-lg shadow-primary/20">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl"
        >
          <div className="inline-flex items-center justify-center p-3 mb-8 bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50">
            <div className="p-3 bg-linear-to-tr from-primary to-accent rounded-xl shadow-lg mr-4">
              <Icon name="Zap" className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-linear-to-r from-gray-800 to-gray-600 tracking-tight">
              InvoiceFlow
            </h1>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6">
            Intelligent Invoice Processing <br />
            <span className="text-primary">Reimagined with Spatial Design</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the future of financial workflows. seamless digitization,
            AI-powered extraction, and 3-way matching in a stunning glassmorphic interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href={!isLoading && user ? "/dashboard" : "/signup"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-lg rounded-full px-10 shadow-xl shadow-primary/30 border-none bg-linear-to-r from-primary to-accent text-white font-bold text-lg group"
              >
                {!isLoading && user ? "Enter Dashboard" : "Get Started Free"}
                <Icon name="ArrowRight" className="ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
            {[
              { title: "Smart Ingestion", icon: "UploadCloud", desc: "Drag & drop with real-time OCR feedback." },
              { title: "3-Way Match", icon: "GitMerge", desc: "Automated validation against POs and receipts." },
              { title: "Spatial UI", icon: "Layers", desc: "Interactive 3D depth for better data visibility." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (idx * 0.2) }}
                className="p-6 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center mb-4 text-primary shadow-sm">
                  <Icon name={feature.icon} size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 bg-white/50 backdrop-blur-xl border-t border-white/60">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700">© 2026 InvoiceFlow Technologies</span>
            <span>•</span>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
          <div className="flex gap-4">
            <span className="text-xs text-gray-400">Powered by Next.js & Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}