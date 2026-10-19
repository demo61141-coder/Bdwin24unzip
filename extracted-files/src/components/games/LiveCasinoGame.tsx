"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { ArrowLeft, Trophy, Sparkles, ShieldCheck } from "lucide-react";

export default function LiveCasinoGame() {
  const { user, activeGame, setActiveGame, refreshUser, showToast, fireConfetti, setDepositModalOpen } = useApp();

  const [gameMode, setGameMode] = useState<"dragon_tiger" | "roulette" | "andar_bahar">(
    activeGame === "roulette" ? "roulette" : "dragon_tiger"
  );

  const [betSide, setBetSide] = useState<string>("dragon");
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);

  const handlePlay = async () => {
    if (isPlaying) return;

    if (!user || user.balance < betAmount) {
      showToast("পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন।", "error");
      setDepositModalOpen(true);
      return;
    }

    setIsPlaying(true);
    soundManager.playBet();

    try {
      const res = await fetch("/api/games/live/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: gameMode, betSide, amount: betAmount }),
      });

      const data = await res.json();
      if (data.success) {
        setTimeout(async () => {
          setIsPlaying(false);
          setLastResult(data.gameDetails);

          if (data.isWin) {
            soundManager.playWin();
            fireConfetti();
            showToast(`অভিনন্দন! আপনি ৳${data.winAmount.toFixed(0)} (${data.multiplier.toFixed(1)}x) জিতেছেন!`, "success");
          } else {
            showToast("এই রাউন্ডে আপনি হেরেছেন, পুনরায় চেষ্টা করুন", "info");
          }

          await refreshUser();
        }, 1200);
      } else {
        setIsPlaying(false);
        showToast(data.error || "গেম সম্পন্ন করা যায়নি", "error");
      }
    } catch {
      setIsPlaying(false);
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-red-500/20 px-3 py-2.5 flex items-center justify-between">
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
          <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent">
            {gameMode === "dragon_tiger" ? "DRAGON TIGER" : gameMode === "roulette" ? "EUROPEAN ROULETTE" : "ANDAR BAHAR"}
          </h1>
          <p className="text-[10px] text-slate-400">লাইভ ডিলার টেবিল গেম</p>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-red-500/30 text-amber-400 font-bold text-xs">
          ৳{user?.balance?.toFixed(2) || "0.00"}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Game Mode Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              setGameMode("dragon_tiger");
              setBetSide("dragon");
            }}
            className={`py-1.5 rounded-lg text-xs font-bold transition ${
              gameMode === "dragon_tiger" ? "bg-red-600 text-white" : "text-slate-400"
            }`}
          >
            ড্রাগন টাইগার
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setGameMode("roulette");
              setBetSide("red");
            }}
            className={`py-1.5 rounded-lg text-xs font-bold transition ${
              gameMode === "roulette" ? "bg-amber-600 text-white" : "text-slate-400"
            }`}
          >
            রুলেট ৩৬x
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setGameMode("andar_bahar");
              setBetSide("andar");
            }}
            className={`py-1.5 rounded-lg text-xs font-bold transition ${
              gameMode === "andar_bahar" ? "bg-blue-600 text-white" : "text-slate-400"
            }`}
          >
            অন্দর বাহার
          </button>
        </div>

        {/* Live Dealer Table View */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-red-950/40 to-slate-950 border border-red-500/30 p-4 shadow-xl text-center space-y-3 min-h-[180px] flex flex-col justify-center">
          {gameMode === "dragon_tiger" && (
            <div className="flex items-center justify-around">
              {/* Dragon Card */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-black text-red-400">DRAGON (ড্রাগন)</span>
                <div
                  className={`w-20 h-28 rounded-xl bg-slate-800 border-2 border-red-500/50 flex items-center justify-center text-2xl font-black shadow-lg ${
                    isPlaying ? "animate-pulse" : ""
                  }`}
                >
                  {lastResult?.dragon ? String(lastResult.dragon) : "🐉"}
                </div>
              </div>

              <div className="text-xs font-black text-amber-300">VS</div>

              {/* Tiger Card */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-black text-amber-400">TIGER (টাইগার)</span>
                <div
                  className={`w-20 h-28 rounded-xl bg-slate-800 border-2 border-amber-500/50 flex items-center justify-center text-2xl font-black shadow-lg ${
                    isPlaying ? "animate-pulse" : ""
                  }`}
                >
                  {lastResult?.tiger ? String(lastResult.tiger) : "🐅"}
                </div>
              </div>
            </div>
          )}

          {gameMode === "roulette" && (
            <div className="space-y-2">
              <div className="text-4xl animate-bounce">🎡</div>
              <div className="text-xl font-black text-amber-300">
                {lastResult?.number !== undefined
                  ? `লাকি নাম্বার: ${lastResult.number} (${String(lastResult.color).toUpperCase()})`
                  : "রুলেট হুইল ঘুরান"}
              </div>
            </div>
          )}

          {gameMode === "andar_bahar" && (
            <div className="space-y-2">
              <div className="text-3xl">🃏</div>
              <div className="text-base font-black text-amber-300">
                {lastResult?.winner
                  ? `বিজয়ী: ${String(lastResult.winner).toUpperCase()} (জোকার: ${lastResult.joker})`
                  : "অন্দর বনাম বাহার"}
              </div>
            </div>
          )}
        </div>

        {/* Betting Choices */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-slate-300">বেটের ধরন বেছে নিন:</div>

          {gameMode === "dragon_tiger" && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBetSide("dragon")}
                className={`py-3 rounded-xl font-black text-xs transition ${
                  betSide === "dragon" ? "bg-red-600 text-white ring-4 ring-red-400/40" : "bg-slate-800 text-slate-300"
                }`}
              >
                DRAGON (2x)
              </button>
              <button
                onClick={() => setBetSide("tie")}
                className={`py-3 rounded-xl font-black text-xs transition ${
                  betSide === "tie" ? "bg-emerald-600 text-white ring-4 ring-emerald-400/40" : "bg-slate-800 text-slate-300"
                }`}
              >
                TIE (8x)
              </button>
              <button
                onClick={() => setBetSide("tiger")}
                className={`py-3 rounded-xl font-black text-xs transition ${
                  betSide === "tiger" ? "bg-amber-600 text-white ring-4 ring-amber-400/40" : "bg-slate-800 text-slate-300"
                }`}
              >
                TIGER (2x)
              </button>
            </div>
          )}

          {gameMode === "roulette" && (
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setBetSide("red")}
                className={`py-2.5 rounded-xl font-black text-xs ${
                  betSide === "red" ? "bg-red-600 text-white ring-2 ring-white" : "bg-red-800 text-slate-200"
                }`}
              >
                RED (2x)
              </button>
              <button
                onClick={() => setBetSide("black")}
                className={`py-2.5 rounded-xl font-black text-xs ${
                  betSide === "black" ? "bg-slate-950 text-white ring-2 ring-white" : "bg-slate-800 text-slate-200"
                }`}
              >
                BLACK (2x)
              </button>
              <button
                onClick={() => setBetSide("even")}
                className={`py-2.5 rounded-xl font-black text-xs ${
                  betSide === "even" ? "bg-amber-600 text-white ring-2 ring-white" : "bg-slate-800 text-slate-200"
                }`}
              >
                EVEN (2x)
              </button>
              <button
                onClick={() => setBetSide("odd")}
                className={`py-2.5 rounded-xl font-black text-xs ${
                  betSide === "odd" ? "bg-blue-600 text-white ring-2 ring-white" : "bg-slate-800 text-slate-200"
                }`}
              >
                ODD (2x)
              </button>
            </div>
          )}

          {gameMode === "andar_bahar" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBetSide("andar")}
                className={`py-3 rounded-xl font-black text-xs ${
                  betSide === "andar" ? "bg-blue-600 text-white ring-4 ring-blue-400/40" : "bg-slate-800 text-slate-300"
                }`}
              >
                ANDAR (1.95x)
              </button>
              <button
                onClick={() => setBetSide("bahar")}
                className={`py-3 rounded-xl font-black text-xs ${
                  betSide === "bahar" ? "bg-amber-600 text-white ring-4 ring-amber-400/40" : "bg-slate-800 text-slate-300"
                }`}
              >
                BAHAR (2.0x)
              </button>
            </div>
          )}

          {/* Amount Chips */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[20, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  soundManager.playClick();
                  setBetAmount(amt);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  betAmount === amt ? "bg-amber-500 text-slate-950 font-black shadow" : "bg-slate-800 text-slate-300"
                }`}
              >
                ৳{amt}
              </button>
            ))}
          </div>

          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg transition transform active:scale-95"
          >
            {isPlaying ? "ডিল হচ্ছে..." : `বেট নিশ্চিত করুন (৳${betAmount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
