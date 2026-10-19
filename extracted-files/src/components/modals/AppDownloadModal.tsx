"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { X, Download, Smartphone, Apple, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AppDownloadModal() {
  const { appDownloadModalOpen, setAppDownloadModalOpen, showToast } = useApp();
  const [downloading, setDownloading] = useState(false);

  if (!appDownloadModalOpen) return null;

  const handleDownloadApk = () => {
    soundManager.playClick();
    setDownloading(true);
    showToast("BDWIN24 অফিশিয়াল APK ডাউনলোড শুরু হয়েছে (7.2 MB)...", "info");

    setTimeout(() => {
      setDownloading(false);
      showToast("APK ডাউনলোড সম্পন্ন হয়েছে! 'Install' এ ক্লিক করুন।", "success");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/30 p-5 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setAppDownloadModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/30 mb-1">
            <Smartphone className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-lg font-black text-white">BDWIN24 অফিশিয়াল মোবাইল অ্যাপ</h2>
          <p className="text-xs text-slate-400">অ্যান্ড্রয়েড APK ও আইওএস (iOS) সাপোর্ট</p>
        </div>

        {/* App Features List */}
        <div className="space-y-2 bg-slate-950 border border-slate-800 p-3 rounded-2xl text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>১ ক্লিকে সুপার ফাস্ট ডিপোজিট ও উইথড্র</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>লাইটওয়েট মাত্র ৭.২ মেগাবাইট (ব্যাটারি সেভিং)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>লাইভ উইনিং সিগন্যাল ও পুশ নোটিফিকেশন</span>
          </div>
        </div>

        {/* Android Download Button */}
        <button
          onClick={handleDownloadApk}
          disabled={downloading}
          className="w-full py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 shadow-lg shadow-emerald-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? "ডাউনলোড হচ্ছে (7.2 MB)..." : "Android APK ডাউনলোড (v1.0.0)"}</span>
        </button>

        {/* iOS PWA Instructions */}
        <div className="text-center pt-1 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center justify-center gap-1 font-bold text-slate-300 mb-0.5">
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone / iOS ইউজারদের জন্য:</span>
          </div>
          <span>Safari ব্রাউজারে Share আইকনে ট্যাপ করে 'Add to Home Screen' চাপুন।</span>
        </div>
      </div>
    </div>
  );
}
