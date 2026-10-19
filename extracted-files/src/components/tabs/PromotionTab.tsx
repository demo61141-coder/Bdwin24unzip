"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { Users, Copy, Check, Gift, Share2, DollarSign, TrendingUp, Sparkles } from "lucide-react";

export default function PromotionTab() {
  const { user, showToast, refreshUser } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const inviteCode = user?.inviteCode || "E768EYN";
  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/?ref=${inviteCode}` : `https://bdwin24.net/?ref=${inviteCode}`;

  const handleCopyLink = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    showToast("আমন্ত্রণ লিংক কপি হয়েছে!", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    showToast("আমন্ত্রণ কোড কপি হয়েছে!", "success");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4 p-2 pb-24 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 border border-amber-400/40 rounded-2xl p-4 shadow-xl text-white space-y-2">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-300" />
          <h2 className="text-base font-black">আমন্ত্রণ ও আনলিমিটেড কমিশন</h2>
        </div>
        <p className="text-xs text-slate-100 font-medium">
          বন্ধুদের ইনভাইট করে প্রতিদিন ৫০,০০০ টাকা পর্যন্ত স্থায়ী কমিশন আয় করুন!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="bg-slate-950/60 rounded-xl p-2.5 text-center border border-white/10">
            <span className="text-[10px] text-slate-300 block">মোট আমন্ত্রণ</span>
            <span className="text-base font-black text-amber-300">১২ জন</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2.5 text-center border border-white/10">
            <span className="text-[10px] text-slate-300 block">মোট অর্জিত কমিশন</span>
            <span className="text-base font-black text-emerald-400">৳৪,৮৫০.০০</span>
          </div>
        </div>
      </div>

      {/* Referral Link & Code Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-md">
        <h3 className="text-xs font-black text-white">আপনার পার্সোনাল ইনভাইট লিঙ্ক</h3>

        {/* Code */}
        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
          <div>
            <span className="text-[10px] text-slate-400 block">ইনভাইট কোড</span>
            <span className="font-mono font-black text-sm text-amber-400 tracking-wider">{inviteCode}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? "কপি হয়েছে" : "কোড কপি"}</span>
          </button>
        </div>

        {/* Link */}
        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
          <div className="truncate max-w-[200px]">
            <span className="text-[10px] text-slate-400 block">আমন্ত্রণ লিংক</span>
            <span className="font-mono text-xs text-slate-300 truncate block">{inviteLink}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-3 py-1.5 rounded-lg shadow font-black transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "কপি হয়েছে" : "লিংক শেয়ার"}</span>
          </button>
        </div>
      </div>

      {/* 3-Tier Commission Structure */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
        <h3 className="text-xs font-black text-white">৩-টায়ার কমিশন কাঠামো (3-Level Team)</h3>

        <div className="space-y-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-400">টায়ার ১ (সরাসরি বন্ধু)</span>
              <p className="text-[10px] text-slate-400">আপনার লিঙ্ক দিয়ে সরাসরি যুক্ত হওয়া প্লেয়ার</p>
            </div>
            <span className="text-sm font-black text-emerald-400">০.৬% রিবেট</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-400">টায়ার ২ (বন্ধুর বন্ধু)</span>
              <p className="text-[10px] text-slate-400">আপনার বন্ধুদের দ্বারা আমন্ত্রিত সদস্য</p>
            </div>
            <span className="text-sm font-black text-emerald-400">০.৩% রিবেট</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-400">টায়ার ৩ (টিম নেটওয়ার্ক)</span>
              <p className="text-[10px] text-slate-400">৩য় স্তরের সমস্ত প্লেয়ারের বেট ভলিউম</p>
            </div>
            <span className="text-sm font-black text-emerald-400">০.১% রিবেট</span>
          </div>
        </div>
      </div>
    </div>
  );
}
