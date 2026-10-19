"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { ArrowLeft, Trophy, Flame, CheckCircle, Clock } from "lucide-react";

interface Match {
  id: number;
  sport: string;
  tournament: string;
  teamA: string;
  teamB: string;
  oddsA: number;
  oddsDraw: number;
  oddsB: number;
  status: string;
  score: string;
  startTime: string;
}

export default function SportsGame() {
  const { user, setActiveGame, refreshUser, showToast, fireConfetti, setDepositModalOpen } = useApp();

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [activeSlip, setActiveSlip] = useState<{ matchId: number; team: string; odds: number } | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/games/sports/matches?sport=${selectedSport}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.matches) setMatches(data.matches);
      })
      .catch(() => {});
  }, [selectedSport]);

  const handlePlaceSportsBet = async () => {
    if (!activeSlip) return;

    if (!user || user.balance < betAmount) {
      showToast("পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন।", "error");
      setDepositModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    soundManager.playBet();

    try {
      const res = await fetch("/api/games/sports/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: activeSlip.matchId,
          pick: activeSlip.team,
          odds: activeSlip.odds,
          amount: betAmount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setActiveSlip(null);
        await refreshUser();
      } else {
        showToast(data.error || "বেট সম্পন্ন করা যায়নি", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-emerald-500/20 px-3 py-2.5 flex items-center justify-between">
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
          <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-emerald-400 to-green-200 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>স্পোর্টসবুক বাজি</span>
          </h1>
          <p className="text-[10px] text-slate-400">লাইভ ক্রিকেট ও ফুটবল অডস</p>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
          ৳{user?.balance?.toFixed(2) || "0.00"}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Sport Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "সব ম্যাচ" },
            { id: "cricket", label: "ক্রিকেট (BPL/ICC)" },
            { id: "football", label: "ফুটবল (UCL/EPL)" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSport(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedSport === s.id
                  ? "bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 font-black shadow"
                  : "bg-slate-900 border border-slate-800 text-slate-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Matches List */}
        <div className="space-y-2.5">
          {matches.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold">
                  {m.tournament}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === "live" ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-sky-500/20 text-sky-400"
                  }`}
                >
                  {m.status === "live" ? "🔴 LIVE NOW" : m.startTime}
                </span>
              </div>

              {/* Teams & Score */}
              <div className="flex items-center justify-between text-sm font-extrabold text-white">
                <div className="flex-1">{m.teamA}</div>
                <div className="text-center px-3 text-xs font-mono text-amber-400">{m.score}</div>
                <div className="flex-1 text-right">{m.teamB}</div>
              </div>

              {/* Odds Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveSlip({ matchId: m.id, team: m.teamA, odds: m.oddsA });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                    activeSlip?.matchId === m.id && activeSlip?.team === m.teamA
                      ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 font-black"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  <span className="text-[10px] truncate max-w-[80px]">1 ({m.teamA})</span>
                  <span className="text-emerald-400 font-extrabold text-sm">{m.oddsA}x</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveSlip({ matchId: m.id, team: "Draw (ড্র)", odds: m.oddsDraw || 3.2 });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                    activeSlip?.matchId === m.id && activeSlip?.team === "Draw (ড্র)"
                      ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 font-black"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  <span className="text-[10px]">X (ড্র)</span>
                  <span className="text-amber-400 font-extrabold text-sm">{m.oddsDraw || 3.2}x</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveSlip({ matchId: m.id, team: m.teamB, odds: m.oddsB });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                    activeSlip?.matchId === m.id && activeSlip?.team === m.teamB
                      ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 font-black"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  <span className="text-[10px] truncate max-w-[80px]">2 ({m.teamB})</span>
                  <span className="text-emerald-400 font-extrabold text-sm">{m.oddsB}x</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Active Bet Slip Bottom Drawer */}
        {activeSlip && (
          <div className="fixed bottom-14 left-0 right-0 z-30 bg-slate-900 border-t border-emerald-500/40 p-3.5 shadow-2xl max-w-lg mx-auto rounded-t-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">
                বেট স্লিপ: <span className="text-emerald-400">{activeSlip.team}</span> (@{activeSlip.odds}x)
              </span>
              <button onClick={() => setActiveSlip(null)} className="text-slate-400 hover:text-white text-xs">
                ✕ বাতিল
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`py-1 px-2 rounded-lg text-xs font-bold ${
                      betAmount === amt ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400 block text-[10px]">সম্ভাব্য রিটার্ন:</span>
                <span className="text-emerald-400 font-extrabold text-sm">
                  ৳{(betAmount * activeSlip.odds).toFixed(0)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceSportsBet}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 shadow-lg"
            >
              {isSubmitting ? "সাবমিট হচ্ছে..." : `বেট নিশ্চিত করুন (৳${betAmount})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
