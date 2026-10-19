"use client";

import React, { useState, useEffect } from "react";
import { Coins, Trophy, Flame } from "lucide-react";

export default function JackpotTicker() {
  const [jackpot, setJackpot] = useState(14829540.25);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot((prev) => prev + Math.random() * 45 + 5);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const winners = [
    "🔥 User_***849 won ৳4,500 on Win Go 1M",
    "⚡ User_***210 won ৳12,800 on Aviator 14.2x",
    "💎 User_***902 won ৳25,000 on Gates of Olympus",
    "🏆 User_***334 won ৳8,900 on Fortune Tiger",
    "👑 User_***115 won ৳15,400 on Dragon Tiger",
    "🌟 User_***582 won ৳6,200 on Mines (12 Gems)",
    "💰 User_***741 won ৳32,000 on Crazy 777",
  ];

  return (
    <div className="space-y-2 my-2 px-1">
      {/* Mega Jackpot Pool Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 p-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30">
              <Coins className="w-5 h-5 text-slate-950 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
                  SUPER MEGA JACKPOT
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <div className="text-xl font-black text-amber-300 tracking-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                ৳{jackpot.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-medium block">Payout Rate</span>
            <span className="text-xs font-black text-emerald-400">98.8% RTP</span>
          </div>
        </div>
      </div>

      {/* Live Winners Marquee Ticker */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs overflow-hidden">
        <div className="flex items-center gap-1 text-amber-400 font-bold shrink-0 text-[11px]">
          <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>লাইভ উইনার:</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="animate-marquee inline-block text-slate-300 text-[11px] font-medium space-x-6">
            {winners.map((win, idx) => (
              <span key={idx} className="inline-block">
                {win}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
