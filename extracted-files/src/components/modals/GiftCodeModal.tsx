"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { X, Ticket, Sparkles, CheckCircle2 } from "lucide-react";

export default function GiftCodeModal() {
  const { giftModalOpen, setGiftModalOpen, refreshUser, showToast, fireConfetti, user, setAuthModalOpen } = useApp();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!giftModalOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setGiftModalOpen(false);
      setAuthModalOpen(true);
      return;
    }

    if (!code || !code.trim()) {
      showToast("গিফট কোড লিখুন", "error");
      return;
    }

    setLoading(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/activity/gift-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        soundManager.playBigWin();
        fireConfetti();
        showToast(data.message, "success");
        setCode("");
        await refreshUser();
        setGiftModalOpen(false);
      } else {
        showToast(data.error || "গিফট কোড রিডিম করা যায়নি", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-rose-500/30 p-5 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setGiftModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 text-white shadow-lg shadow-rose-500/30 mb-1">
            <Ticket className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-white">গিফট কোড রিডিম করুন</h2>
          <p className="text-xs text-slate-400">অফিসিয়াল গিফট কোড দিয়ে তাৎক্ষণিক ফ্রি ক্যাশ নিন</p>
        </div>

        {/* Sample Promo Codes Hints */}
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs space-y-1">
          <span className="text-slate-400 font-bold text-[11px] block">সক্রিয় গিফট কোডসমূহ:</span>
          <div className="flex flex-wrap gap-1.5">
            {["BDWIN2026", "WELCOME500", "BONUS100", "VIPBDWIN", "FREEBDT"].map((c) => (
              <button
                key={c}
                onClick={() => setCode(c)}
                className="px-2 py-0.5 rounded-md bg-slate-900 border border-amber-500/40 text-amber-300 font-mono text-[11px] hover:bg-slate-800"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRedeem} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">গিফট কোড লিখুন</label>
            <input
              type="text"
              placeholder="যেমন: BDWIN2026"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-400 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none uppercase font-mono tracking-wider font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-xs bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white shadow-lg shadow-rose-500/30 transition transform active:scale-95"
          >
            {loading ? "ভেরিফাই হচ্ছে..." : "কোড রিডিম করুন (Claim Cash)"}
          </button>
        </form>
      </div>
    </div>
  );
}
