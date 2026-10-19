"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { X, Calendar, Gift, CheckCircle2, Sparkles } from "lucide-react";

export default function CheckInModal() {
  const { checkInModalOpen, setCheckInModalOpen, refreshUser, showToast, fireConfetti, user, setAuthModalOpen } = useApp();
  const [loading, setLoading] = useState(false);

  if (!checkInModalOpen) return null;

  const rewards = [
    { day: 1, amount: 10 },
    { day: 2, amount: 20 },
    { day: 3, amount: 30 },
    { day: 4, amount: 50 },
    { day: 5, amount: 80 },
    { day: 6, amount: 120 },
    { day: 7, amount: 200, special: true },
  ];

  const currentStreak = user?.checkInStreak || 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  const alreadyClaimedToday = user?.lastCheckInDate === todayStr;

  const handleClaim = async () => {
    if (!user) {
      setCheckInModalOpen(false);
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/activity/checkin", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        soundManager.playWin();
        fireConfetti();
        showToast(data.message, "success");
        await refreshUser();
      } else {
        showToast(data.error || "চেক-ইন ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-blue-500/30 p-5 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setCheckInModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 text-white shadow-lg shadow-blue-500/30 mb-1">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <h2 className="text-lg font-black text-white">দৈনিক চেক-ইন বোনাস</h2>
          <p className="text-xs text-slate-400">প্রতিদিন লগইন করে ৭ দিনের ধারাবাহিক বোনাস নিন</p>
        </div>

        {/* 7-Day Rewards Grid */}
        <div className="grid grid-cols-4 gap-2">
          {rewards.map((r) => {
            const isCompleted = r.day <= currentStreak;
            const isToday = r.day === currentStreak + 1 && !alreadyClaimedToday;

            return (
              <div
                key={r.day}
                className={`p-2 rounded-2xl border text-center relative flex flex-col items-center justify-between min-h-[75px] ${
                  r.special ? "col-span-2 bg-gradient-to-tr from-amber-600/40 to-yellow-500/40 border-amber-400/50" : ""
                } ${
                  isCompleted
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : isToday
                    ? "bg-blue-950/60 border-blue-400/60 text-white ring-2 ring-blue-400"
                    : "bg-slate-950/60 border-slate-800 text-slate-400"
                }`}
              >
                <span className="text-[10px] font-bold">দিন {r.day}</span>
                <div className="text-sm font-black text-amber-300">৳{r.amount}</div>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[9px] text-slate-400">{isToday ? "আজকের" : "লকড"}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action Button */}
        <button
          onClick={handleClaim}
          disabled={alreadyClaimedToday || loading}
          className={`w-full py-3.5 rounded-2xl font-black text-xs transition transform active:scale-95 shadow-lg flex items-center justify-center gap-1.5 ${
            alreadyClaimedToday
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-400 hover:to-indigo-300 text-slate-950 shadow-blue-500/30"
          }`}
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>
            {alreadyClaimedToday
              ? "আজকের বোনাস গ্রহণ করা হয়েছে (আগামীকাল আসুন)"
              : loading
              ? "গ্রহণ করা হচ্ছে..."
              : "আজকের বোনাস দাবি করুন"}
          </span>
        </button>
      </div>
    </div>
  );
}
