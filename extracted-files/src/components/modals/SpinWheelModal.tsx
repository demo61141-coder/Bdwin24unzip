"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { X, Disc3, Sparkles, Trophy } from "lucide-react";

export default function SpinWheelModal() {
  const { spinModalOpen, setSpinModalOpen, refreshUser, showToast, fireConfetti, user, setAuthModalOpen } = useApp();

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<number | null>(null);

  if (!spinModalOpen) return null;

  const prizes = [10, 20, 50, 100, 200, 500, 1000, 5000];

  const handleSpin = async () => {
    if (spinning) return;

    if (!user) {
      setSpinModalOpen(false);
      setAuthModalOpen(true);
      return;
    }

    setSpinning(true);
    setWonPrize(null);
    soundManager.playClick();

    try {
      const res = await fetch("/api/activity/spin", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        const segAngle = 360 / prizes.length;
        const targetAngle = 360 * 5 + (prizes.length - data.selectedIndex) * segAngle - segAngle / 2;
        setRotation((prev) => prev + targetAngle);

        const tickInterval = setInterval(() => {
          soundManager.playWheelTick();
        }, 180);

        setTimeout(async () => {
          clearInterval(tickInterval);
          setSpinning(false);
          setWonPrize(data.prize);
          soundManager.playBigWin();
          fireConfetti();
          showToast(`অভিনন্দন! লাকি হুইল থেকে আপনি ৳${data.prize} জিতেছেন!`, "success");
          await refreshUser();
        }, 4000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-purple-500/30 p-5 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setSpinModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-400 text-white shadow-lg shadow-purple-500/30 mb-1">
            <Disc3 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-lg font-black text-white">লাকি স্পিন হুইল</h2>
          <p className="text-xs text-slate-400">প্রতিদিন ১টি ফ্রি স্পিনে জিতে নিন সর্বোচ্চ ৳৫,০০০!</p>
        </div>

        {/* Rotating Wheel Simulation */}
        <div className="relative flex items-center justify-center py-4">
          {/* Wheel Pointer */}
          <div className="absolute top-2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"></div>

          {/* Rotating Disc */}
          <div
            className="w-56 h-56 rounded-full border-4 border-amber-400/80 shadow-[0_0_25px_rgba(168,85,247,0.5)] relative overflow-hidden wheel-transition flex items-center justify-center bg-gradient-to-tr from-purple-900 via-indigo-950 to-pink-900"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {prizes.map((p, idx) => {
              const angle = (360 / prizes.length) * idx;
              return (
                <div
                  key={idx}
                  className="absolute w-full h-full flex items-start justify-center pt-2"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span className="text-xs font-black text-amber-300 drop-shadow">৳{p}</span>
                </div>
              );
            })}

            {/* Wheel Center Hub */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-slate-900 flex items-center justify-center shadow-lg font-black text-slate-950 text-xs z-10">
              SPIN
            </div>
          </div>
        </div>

        {/* Result Notification */}
        {wonPrize !== null && (
          <div className="text-center p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-amber-300 font-extrabold text-xs animate-bounce">
            🎉 আপনি জিতেছেন ৳{wonPrize}! ব্যালেন্সে যোগ হয়েছে।
          </div>
        )}

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`w-full py-3.5 rounded-2xl font-black text-xs transition transform active:scale-95 shadow-xl flex items-center justify-center gap-1.5 ${
            spinning
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/30"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{spinning ? "হুইল ঘুরছে..." : "স্পিন ঘুরান (Spin Now)"}</span>
        </button>
      </div>
    </div>
  );
}
