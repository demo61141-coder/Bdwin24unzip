"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { ArrowLeft, Sparkles, Trophy, Play, RotateCw, Flame } from "lucide-react";

export default function SlotsGame() {
  const { user, selectedSlotId, setSelectedSlotId, setActiveGame, refreshUser, showToast, fireConfetti, setDepositModalOpen } = useApp();

  const [betAmount, setBetAmount] = useState<number>(20);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(0);
  const [grid, setGrid] = useState<string[][]>([
    ["🐯", "🧧", "🍊"],
    ["🐯", "🐯", "🐯"],
    ["🪙", "💎", "⭐"],
  ]);

  const slotThemes: Record<string, { title: string; icon: string; color: string; desc: string }> = {
    fortune_tiger: { title: "Fortune Tiger", icon: "🐯", color: "from-amber-600 to-red-600", desc: "গোল্ডেন টাইগার ২৫০০x ওয়াইল্ড কম্বো" },
    gates_of_olympus: { title: "Gates of Olympus", icon: "⚡", color: "from-purple-700 to-indigo-900", desc: "জিউস লাইটনিং ৫০০x মাল্টিপ্লায়ার" },
    sweet_bonanza: { title: "Sweet Bonanza", icon: "🍭", color: "from-pink-600 to-rose-700", desc: "ক্যান্ডি টাম্বলিং ও ১০০x বোম বোনাস" },
    super_ace: { title: "Super Ace", icon: "🃏", color: "from-blue-700 to-indigo-950", desc: "গোল্ডেন কার্ড ওয়াইল্ড এলিমিনেশন" },
    crazy_777: { title: "Crazy 777", icon: "7️⃣", color: "from-red-600 to-orange-800", desc: "ক্লাসিক ট্রিপল সেভেন মেগা জ্যাকপট" },
  };

  const activeTheme = slotThemes[selectedSlotId] || slotThemes.fortune_tiger;

  const handleSpin = async () => {
    if (spinning) return;

    if (!user || user.balance < betAmount) {
      showToast("পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন।", "error");
      setDepositModalOpen(true);
      return;
    }

    setSpinning(true);
    setLastWin(0);
    soundManager.playClick();

    try {
      const res = await fetch("/api/games/slots/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlotId, betAmount }),
      });

      const data = await res.json();
      if (data.success) {
        // Spin animation delay
        setTimeout(async () => {
          setGrid(data.grid);
          setSpinning(false);
          setLastWin(data.winAmount);
          setMultiplier(data.multiplier);

          if (data.isWin && data.winAmount > 0) {
            if (data.multiplier >= 10) {
              soundManager.playBigWin();
            } else {
              soundManager.playWin();
            }
            fireConfetti();
            showToast(`অভিনন্দন! আপনি ৳${data.winAmount.toFixed(0)} (${data.multiplier.toFixed(1)}x) জিতেছেন!`, "success");
          }

          await refreshUser();
        }, 1200);
      } else {
        setSpinning(false);
        showToast(data.error || "স্পিন সম্পন্ন করা যায়নি", "error");
      }
    } catch {
      setSpinning(false);
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 px-3 py-2.5 flex items-center justify-between">
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
          <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
            <span>{activeTheme.icon}</span>
            <span>{activeTheme.title}</span>
          </h1>
          <p className="text-[10px] text-slate-400">{activeTheme.desc}</p>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400 font-bold text-xs">
          ৳{user?.balance?.toFixed(2) || "0.00"}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {Object.entries(slotThemes).map(([k, t]) => (
            <button
              key={k}
              onClick={() => {
                soundManager.playClick();
                setSelectedSlotId(k);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedSlotId === k
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.title}</span>
            </button>
          ))}
        </div>

        {/* 3x3 Slot Machine Reels Showcase */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${activeTheme.color} p-4 shadow-2xl border-2 border-amber-400/40`}>
          {/* Machine Header */}
          <div className="flex items-center justify-between mb-3 text-center">
            <span className="text-[10px] font-black bg-slate-950/70 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
              JACKPOT 2500X
            </span>
            <div className="text-xs font-black text-amber-200 tracking-wider">
              {lastWin > 0 ? `LAST WIN: ৳${lastWin.toFixed(0)} (${multiplier.toFixed(1)}x)` : "SPIN TO WIN!"}
            </div>
          </div>

          {/* 3x3 Reels Grid */}
          <div className="bg-slate-950/90 border-2 border-amber-500/50 rounded-2xl p-3 shadow-inner grid grid-rows-3 gap-2">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="grid grid-cols-3 gap-2">
                {row.map((symbol, cIdx) => (
                  <div
                    key={cIdx}
                    className={`h-16 rounded-xl bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-md transition-all ${
                      spinning ? "animate-pulse scale-95 blur-[1px]" : "scale-100"
                    }`}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bet Amount Controls */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>বেটের পরিমাণ (টাকা):</span>
            <span className="text-amber-400 text-sm font-extrabold">৳{betAmount}</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[5, 10, 20, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  soundManager.playClick();
                  setBetAmount(amt);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  betAmount === amt
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                ৳{amt}
              </button>
            ))}
          </div>

          {/* Spin Action Button */}
          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`w-full py-4 rounded-2xl font-black text-base transition transform active:scale-95 shadow-xl flex items-center justify-center gap-2 ${
              spinning
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-slate-950 shadow-amber-500/40"
            }`}
          >
            <RotateCw className={`w-5 h-5 stroke-[2.5] ${spinning ? "animate-spin" : ""}`} />
            <span>{spinning ? "রিল ঘুরছে..." : `স্পিন করুন (৳${betAmount})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
