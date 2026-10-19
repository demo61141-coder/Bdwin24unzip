"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { ArrowLeft, Dice5, RotateCw } from "lucide-react";

export default function DiceGame() {
  const { user, setActiveGame, refreshUser, showToast, fireConfetti, setDepositModalOpen } = useApp();

  const [target, setTarget] = useState<number>(50);
  const [condition, setCondition] = useState<"over" | "under">("over");
  const [betAmount, setBetAmount] = useState<number>(20);
  const [rolling, setRolling] = useState<boolean>(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const winChance = condition === "over" ? 99 - target : target;
  const multiplier = parseFloat((0.98 / Math.max(0.01, winChance / 100)).toFixed(2));

  const handleRoll = async () => {
    if (rolling) return;

    if (!user || user.balance < betAmount) {
      showToast("পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন।", "error");
      setDepositModalOpen(true);
      return;
    }

    setRolling(true);
    soundManager.playBet();

    try {
      const res = await fetch("/api/games/dice/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, condition, amount: betAmount }),
      });

      const data = await res.json();
      if (data.success) {
        setTimeout(async () => {
          setRolling(false);
          setLastRoll(data.roll);

          if (data.isWin) {
            soundManager.playWin();
            fireConfetti();
            showToast(`অভিনন্দন! রোল ${data.roll} এ ৳${data.winAmount.toFixed(0)} (${data.multiplier}x) জিতেছেন!`, "success");
          } else {
            showToast(`রোল ${data.roll} - আপনি হেরেছেন, পুনরায় চেষ্টা করুন`, "info");
          }

          await refreshUser();
        }, 800);
      } else {
        setRolling(false);
        showToast(data.error || "ডাইস রোল সম্পন্ন করা যায়নি", "error");
      }
    } catch {
      setRolling(false);
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-indigo-500/20 px-3 py-2.5 flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveGame(null);
          }}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-indigo-400 to-purple-200 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
            <Dice5 className="w-4 h-4 text-indigo-400" />
            <span>DICE OVER / UNDER</span>
          </h1>
          <p className="text-[10px] text-slate-400">ডাইস রোল প্রবাবিলিটি গেম</p>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
          ৳{user?.balance?.toFixed(2) || "0.00"}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Dice Result Display */}
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 text-center space-y-2 shadow-xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            ডাইস ফলাফল (০ - ৯৯)
          </span>
          <div
            className={`text-6xl font-black font-mono text-amber-300 transition-all ${
              rolling ? "animate-pulse scale-110" : ""
            }`}
          >
            {lastRoll !== null ? lastRoll : "50"}
          </div>
          <div className="text-xs font-bold text-indigo-300">
            সম্ভাব্য পেআউট গুণক: <span className="text-emerald-400 text-sm">{multiplier}x</span>
          </div>
        </div>

        {/* Target Slider & Over/Under Toggle */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCondition("over")}
              className={`py-2 rounded-xl font-bold text-xs transition ${
                condition === "over" ? "bg-indigo-600 text-white shadow" : "bg-slate-800 text-slate-400"
              }`}
            >
              ROLL OVER ({target}+)
            </button>
            <button
              onClick={() => setCondition("under")}
              className={`py-2 rounded-xl font-bold text-xs transition ${
                condition === "under" ? "bg-purple-600 text-white shadow" : "bg-slate-800 text-slate-400"
              }`}
            >
              ROLL UNDER ({target}-)
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1">
              <span>টার্গেট নাম্বার: {target}</span>
              <span className="text-emerald-400">জয়ের সুযোগ: {winChance}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Amount Chips */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[10, 20, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                className={`py-1.5 rounded-lg text-xs font-bold ${
                  betAmount === amt ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-300"
                }`}
              >
                ৳{amt}
              </button>
            ))}
          </div>

          <button
            onClick={handleRoll}
            disabled={rolling}
            className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-indigo-500 to-purple-400 text-slate-950 shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${rolling ? "animate-spin" : ""}`} />
            <span>{rolling ? "রোল হচ্ছে..." : `ডাইস রোল করুন (৳${betAmount})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
