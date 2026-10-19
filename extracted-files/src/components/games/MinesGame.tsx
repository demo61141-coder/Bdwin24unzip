"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { ArrowLeft, Bomb, Diamond, Sparkles, Trophy } from "lucide-react";

export default function MinesGame() {
  const { user, setActiveGame, refreshUser, showToast, fireConfetti, setDepositModalOpen } = useApp();

  const [betAmount, setBetAmount] = useState<number>(20);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mineLocations, setMineLocations] = useState<number[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<Record<number, "gem" | "mine">>({});
  const [gemsCount, setGemsCount] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);

  const calculateMultiplier = (gems: number, mines: number) => {
    let mult = 1.0;
    for (let i = 0; i < gems; i++) {
      mult *= (25 - i) / (25 - mines - i);
    }
    return Math.max(1.1, parseFloat((mult * 0.98).toFixed(2)));
  };

  const handleStartGame = async () => {
    if (!user || user.balance < betAmount) {
      showToast("পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন।", "error");
      setDepositModalOpen(true);
      return;
    }

    soundManager.playBet();
    try {
      const res = await fetch("/api/games/mines/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", betAmount, minesCount }),
      });
      const data = await res.json();
      if (data.success) {
        setMineLocations(data.mineIndices);
        setRevealedTiles({});
        setGemsCount(0);
        setCurrentMultiplier(1.0);
        setIsPlaying(true);
        await refreshUser();
      }
    } catch {
      showToast("গেম শুরু করা যায়নি", "error");
    }
  };

  const handleTileClick = async (idx: number) => {
    if (!isPlaying || revealedTiles[idx]) return;

    soundManager.playClick();
    const isMine = mineLocations.includes(idx);

    if (isMine) {
      // Hit Mine
      soundManager.playCrash();
      const newRevealed: Record<number, "gem" | "mine"> = { ...revealedTiles, [idx]: "mine" };
      // Reveal all mines
      mineLocations.forEach((m) => {
        newRevealed[m] = "mine";
      });
      setRevealedTiles(newRevealed);
      setIsPlaying(false);
      showToast("বম্ব বিস্ফোরিত হয়েছে! আপনি হেরেছেন।", "error");

      fetch("/api/games/mines/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hit_mine", betAmount, tileIndex: idx }),
      }).catch(() => {});
    } else {
      // Gem Found!
      soundManager.playWin();
      const nextGems = gemsCount + 1;
      const nextMult = calculateMultiplier(nextGems, minesCount);
      setGemsCount(nextGems);
      setCurrentMultiplier(nextMult);
      setRevealedTiles((prev) => ({ ...prev, [idx]: "gem" }));
    }
  };

  const handleCashout = async () => {
    if (!isPlaying || gemsCount === 0) return;

    soundManager.playBigWin();
    try {
      const res = await fetch("/api/games/mines/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cashout",
          betAmount,
          minesCount,
          gemsRevealed: gemsCount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsPlaying(false);
        fireConfetti();
        showToast(`অভিনন্দন! ${data.multiplier}x এ ক্যাশআউট করে ৳${data.winAmount.toFixed(0)} জিতেছেন!`, "success");
        await refreshUser();
      }
    } catch {
      showToast("ক্যাশআউট ব্যর্থ হয়েছে", "error");
    }
  };

  const potentialWin = (betAmount * currentMultiplier).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-teal-500/20 px-3 py-2.5 flex items-center justify-between">
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
          <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-teal-400 to-cyan-200 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
            <Bomb className="w-4 h-4 text-teal-400" />
            <span>MINES মিনি গেম</span>
          </h1>
          <p className="text-[10px] text-slate-400">ডায়মন্ড খুঁজুন ও ক্যাশআউট করুন</p>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-teal-500/30 text-teal-400 font-bold text-xs">
          ৳{user?.balance?.toFixed(2) || "0.00"}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Multiplier / Status Header */}
        <div className="bg-slate-900 border border-teal-500/30 p-3 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">ডায়মন্ড সংগৃহীত:</span>
            <div className="text-base font-black text-teal-300 flex items-center gap-1">
              <Diamond className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>{gemsCount} Gems</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">বর্তমান পেআউট:</span>
            <div className="text-lg font-black text-amber-400 font-mono">
              {currentMultiplier.toFixed(2)}x (৳{potentialWin})
            </div>
          </div>
        </div>

        {/* 5x5 Mines Grid */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-xl grid grid-cols-5 gap-2">
          {Array.from({ length: 25 }).map((_, idx) => {
            const state = revealedTiles[idx];
            return (
              <button
                key={idx}
                disabled={!isPlaying || Boolean(state)}
                onClick={() => handleTileClick(idx)}
                className={`h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all transform active:scale-95 shadow-md ${
                  state === "gem"
                    ? "bg-gradient-to-tr from-cyan-600 to-teal-400 ring-2 ring-cyan-300 scale-102"
                    : state === "mine"
                    ? "bg-red-600 ring-2 ring-red-400 animate-bounce"
                    : isPlaying
                    ? "bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
                    : "bg-slate-800/60 border border-slate-800"
                }`}
              >
                {state === "gem" ? "💎" : state === "mine" ? "💣" : "?"}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium block mb-1">মাইনস সংখ্যা:</span>
              <select
                disabled={isPlaying}
                value={minesCount}
                onChange={(e) => setMinesCount(parseInt(e.target.value, 10))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-bold text-white focus:outline-none"
              >
                {[1, 2, 3, 5, 8, 10, 15, 20].map((m) => (
                  <option key={m} value={m}>
                    {m} Mines
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">বেটের পরিমাণ:</span>
              <div className="flex items-center gap-1">
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    disabled={isPlaying}
                    onClick={() => setBetAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                      betAmount === amt ? "bg-teal-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isPlaying ? (
            <button
              onClick={handleCashout}
              disabled={gemsCount === 0}
              className={`w-full py-3.5 rounded-xl font-black text-sm shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 ${
                gemsCount === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 shadow-emerald-500/30 animate-pulse"
              }`}
            >
              <span>ক্যাশআউট করুন (৳{potentialWin})</span>
            </button>
          ) : (
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 shadow-lg shadow-teal-500/30 transition transform active:scale-95"
            >
              গেম শুরু করুন (৳{betAmount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
