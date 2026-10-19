"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { ArrowLeft, Rocket, ShieldCheck, Flame, History, Users, RefreshCw } from "lucide-react";

interface AviatorPlayer {
  username: string;
  bet: number;
  cashedOut: boolean;
  cashoutMult?: number;
}

export default function AviatorGame() {
  const { user, setActiveGame, refreshUser, showToast, fireConfetti, setDepositModalOpen } = useApp();

  // Game Flight States: 'waiting' | 'flying' | 'crashed'
  const [gameState, setGameState] = useState<"waiting" | "flying" | "crashed">("waiting");
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(2.5);
  const [waitingCountdown, setWaitingCountdown] = useState<number>(4);
  const [recentMultipliers, setRecentMultipliers] = useState<number[]>([1.42, 3.85, 12.4, 1.15, 2.2, 45.8, 1.08, 5.12]);

  // Bet 1 State
  const [bet1Amount, setBet1Amount] = useState<number>(50);
  const [bet1Active, setBet1Active] = useState<boolean>(false);
  const [bet1Id, setBet1Id] = useState<number | null>(null);
  const [bet1CashedOut, setBet1CashedOut] = useState<boolean>(false);
  const [bet1AutoCashout, setBet1AutoCashout] = useState<string>("2.00");
  const [bet1AutoEnabled, setBet1AutoEnabled] = useState<boolean>(false);

  // Live Players
  const [onlinePlayers, setOnlinePlayers] = useState<AviatorPlayer[]>([]);

  const animRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);

  // Initialize online players
  const generateSimulatedPlayers = () => {
    const list: AviatorPlayer[] = [
      { username: "User_***842", bet: 200, cashedOut: false },
      { username: "User_***119", bet: 500, cashedOut: false },
      { username: "User_***902", bet: 100, cashedOut: false },
      { username: "User_***340", bet: 1000, cashedOut: false },
      { username: "User_***718", bet: 50, cashedOut: false },
      { username: "User_***553", bet: 250, cashedOut: false },
    ];
    setOnlinePlayers(list);
  };

  // Start new round logic
  const startNewRound = () => {
    // Generate crash point with realistic house edge
    let nextCrash = 1.05 + Math.random() * 3.5;
    if (Math.random() < 0.25) nextCrash = 4.0 + Math.random() * 15.0;
    if (Math.random() < 0.05) nextCrash = 20.0 + Math.random() * 80.0;
    nextCrash = parseFloat(nextCrash.toFixed(2));

    setCrashPoint(nextCrash);
    setMultiplier(1.0);
    setGameState("waiting");
    setWaitingCountdown(4);
    setBet1CashedOut(false);
    generateSimulatedPlayers();

    let count = 4;
    const countTimer = setInterval(() => {
      count -= 1;
      setWaitingCountdown(count);
      if (count <= 0) {
        clearInterval(countTimer);
        launchFlight(nextCrash);
      }
    }, 1000);
  };

  const launchFlight = (targetCrash: number) => {
    setGameState("flying");
    flightStartTimeRef.current = Date.now();

    const updateFrame = () => {
      const elapsed = (Date.now() - flightStartTimeRef.current) / 1000;
      // Exponential curve: mult = 1.0 + 0.06 * elapsed^1.8
      const currentMult = parseFloat((1.0 + Math.pow(elapsed * 0.8, 1.85)).toFixed(2));

      if (currentMult >= targetCrash) {
        // Crashed
        setMultiplier(targetCrash);
        setGameState("crashed");
        soundManager.playCrash();
        setRecentMultipliers((prev) => [targetCrash, ...prev.slice(0, 10)]);

        // Notify server of crash if active bet
        if (bet1Active && !bet1CashedOut && bet1Id) {
          fetch("/api/games/aviator/bet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "crashed", betId: bet1Id, crashPoint: targetCrash }),
          }).catch(() => {});
        }

        setBet1Active(false);

        // Next round after 3 seconds
        setTimeout(() => {
          startNewRound();
        }, 3000);
      } else {
        setMultiplier(currentMult);

        // Simulate random player cashouts
        setOnlinePlayers((prev) =>
          prev.map((p) => {
            if (!p.cashedOut && Math.random() < 0.035 && currentMult > 1.2) {
              return { ...p, cashedOut: true, cashoutMult: currentMult };
            }
            return p;
          })
        );

        animRef.current = requestAnimationFrame(updateFrame);
      }
    };

    animRef.current = requestAnimationFrame(updateFrame);
  };

  useEffect(() => {
    startNewRound();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Handle Bet 1 Placement
  const handlePlaceBet1 = async () => {
    if (!user || user.balance < bet1Amount) {
      showToast("পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন।", "error");
      setDepositModalOpen(true);
      return;
    }

    soundManager.playBet();
    try {
      const res = await fetch("/api/games/aviator/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "place_bet", amount: bet1Amount }),
      });
      const data = await res.json();
      if (data.success) {
        setBet1Active(true);
        setBet1Id(data.betId);
        await refreshUser();
        showToast(`বেট নিশ্চিত হয়েছে (৳${bet1Amount})`, "success");
      } else {
        showToast(data.error || "বেট স্থাপন করা যায়নি", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  // Handle Bet 1 Cashout
  const handleCashout1 = async () => {
    if (!bet1Active || bet1CashedOut || !bet1Id || gameState !== "flying") return;

    soundManager.playWin();
    try {
      const res = await fetch("/api/games/aviator/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cashout",
          betId: bet1Id,
          multiplier: multiplier,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBet1CashedOut(true);
        setBet1Active(false);
        fireConfetti();
        await refreshUser();
        showToast(data.message, "success");
      } else {
        showToast(data.error || "ক্যাশআউট ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  const calculatedProfit1 = (bet1Amount * multiplier).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-rose-500/20 px-3 py-2.5 flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveGame(null);
          }}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          <Rocket className="w-5 h-5 text-rose-500 animate-pulse" />
          <span className="font-black text-base tracking-wider bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
            AVIATOR CRASH
          </span>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-rose-500/30 text-rose-400 font-bold text-xs">
          ৳{user?.balance?.toFixed(2) || "0.00"}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Recent Multipliers Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs font-mono font-bold">
          <span className="text-[10px] text-slate-500 shrink-0 font-sans">হিস্ট্রি:</span>
          {recentMultipliers.map((m, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-md shrink-0 text-[11px] ${
                m >= 10.0
                  ? "bg-purple-900/60 text-purple-300 border border-purple-500/40"
                  : m >= 2.0
                  ? "bg-sky-900/60 text-sky-300 border border-sky-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {m.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* Flight Radar Animation Canvas Box */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-rose-500/30 min-h-[220px] flex flex-col items-center justify-center p-4 shadow-2xl">
          {/* Radar Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

          {gameState === "waiting" && (
            <div className="text-center z-10 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                পরবর্তী ফ্লাইট শুরু হচ্ছে
              </span>
              <div className="text-4xl font-black font-mono text-amber-400 animate-pulse">
                {waitingCountdown}s
              </div>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-1000"
                  style={{ width: `${((4 - waitingCountdown) / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {gameState === "flying" && (
            <div className="text-center z-10 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Rocket className="w-8 h-8 text-rose-500 transform rotate-45 animate-bounce" />
                <div className="text-5xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]">
                  {multiplier.toFixed(2)}x
                </div>
              </div>
              <p className="text-[11px] text-rose-300 font-bold tracking-wider animate-pulse">
                ফ্লাইট চলমান... বিমান ওড়ার আগে ক্যাশআউট করুন!
              </p>
            </div>
          )}

          {gameState === "crashed" && (
            <div className="text-center z-10 space-y-2">
              <div className="text-sm font-black text-red-500 uppercase tracking-widest">
                FLEW AWAY / ক্র্যাশ হয়েছে!
              </div>
              <div className="text-5xl font-black font-mono text-red-400">
                {multiplier.toFixed(2)}x
              </div>
              <p className="text-xs text-slate-400">পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন</p>
            </div>
          )}
        </div>

        {/* Dual Betting Panel: Bet 1 */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>বেট স্লট #১</span>
            <span className="text-amber-400">৳{bet1Amount}</span>
          </div>

          {/* Quick Amount Chips */}
          <div className="grid grid-cols-4 gap-1.5">
            {[20, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  soundManager.playClick();
                  setBet1Amount(amt);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  bet1Amount === amt
                    ? "bg-rose-500 text-white font-black shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                ৳{amt}
              </button>
            ))}
          </div>

          {/* Bet Button OR Cashout Button */}
          {bet1Active && gameState === "flying" && !bet1CashedOut ? (
            <button
              onClick={handleCashout1}
              className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:from-emerald-400 hover:to-green-300 text-slate-950 shadow-xl shadow-emerald-500/40 flex flex-col items-center justify-center transition transform active:scale-95 animate-pulse"
            >
              <span>ক্যাশআউট করুন</span>
              <span className="text-xs font-extrabold text-slate-950">
                ৳{calculatedProfit1} ({multiplier.toFixed(2)}x)
              </span>
            </button>
          ) : (
            <button
              onClick={handlePlaceBet1}
              disabled={bet1Active || gameState === "flying"}
              className={`w-full py-3.5 rounded-xl font-black text-sm transition transform active:scale-95 shadow-lg ${
                bet1Active
                  ? "bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 cursor-default"
                  : gameState === "flying"
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 text-white shadow-rose-600/30"
              }`}
            >
              {bet1Active
                ? `বেট অ্যাক্টিভ (৳${bet1Amount})`
                : gameState === "flying"
                ? "ফ্লাইট চলছে..."
                : `বেট প্লেস করুন (৳${bet1Amount})`}
            </button>
          )}
        </div>

        {/* Live Online Players List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>চলমান প্লেয়ারদের বাজি</span>
            </div>
            <span className="text-emerald-400 text-[11px] font-mono">লাইভ</span>
          </div>

          <div className="space-y-1.5 divide-y divide-slate-800/60 max-h-40 overflow-y-auto">
            {onlinePlayers.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between pt-1.5 text-xs font-mono">
                <span className="text-slate-400 text-[11px]">{p.username}</span>
                <span className="text-white font-bold">৳{p.bet}</span>
                {p.cashedOut ? (
                  <span className="text-emerald-400 font-bold text-[11px]">
                    +{p.cashoutMult?.toFixed(2)}x (৳{(p.bet * (p.cashoutMult || 1)).toFixed(0)})
                  </span>
                ) : (
                  <span className="text-amber-400 text-[10px]">ফ্লাইং...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
