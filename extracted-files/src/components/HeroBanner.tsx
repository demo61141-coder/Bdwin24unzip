"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { Sparkles, Trophy, Zap, Gift, ShieldCheck, ChevronRight } from "lucide-react";

export default function HeroBanner() {
  const { setDepositModalOpen, setCheckInModalOpen, setSpinModalOpen, setGiftModalOpen, setActiveGame } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: "২০০% ওয়েলকাম বোনাস",
      subtitle: "প্রথম রিচার্জে দ্বিগুণ বোনাস + ৳৫০০ সাইনআপ ক্যাশ!",
      cta: "এখনই রিচার্জ করুন",
      icon: Gift,
      gradient: "from-amber-600 via-red-600 to-purple-800",
      action: () => setDepositModalOpen(true),
    },
    {
      id: 2,
      title: "Win Go কালার প্রেডিকশন",
      subtitle: "প্রতি ১ মিনিটে জিতে নিন ৯ গুণ পর্যন্ত ক্যাশ!",
      cta: "উইন গো খেলুন",
      icon: Zap,
      gradient: "from-emerald-700 via-teal-800 to-slate-900",
      action: () => setActiveGame("wingo"),
    },
    {
      id: 3,
      title: "Aviator ক্র্যাশ গেম ১০০x",
      subtitle: "বিমান ওড়ার আগে ক্যাশআউট করুন ও ১০,০০০৳ জিতুন!",
      cta: "এভিয়েটর খেলুন",
      icon: Sparkles,
      gradient: "from-rose-700 via-pink-800 to-indigo-950",
      action: () => setActiveGame("aviator"),
    },
    {
      id: 4,
      title: "দৈনিক লাকি হুইল ও চেক-ইন",
      subtitle: "প্রতিদিন ফ্রি স্পিন ঘুরিয়ে জিতে নিন ৳৫,০০০ পর্যন্ত!",
      cta: "হুইল ঘুরান",
      icon: Trophy,
      gradient: "from-purple-700 via-violet-800 to-amber-900",
      action: () => setSpinModalOpen(true),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[currentSlide];
  const Icon = activeBanner.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r shadow-xl border border-amber-500/30 mx-1 my-2">
      <div className={`p-4 bg-gradient-to-r ${activeBanner.gradient} transition-all duration-700 flex flex-col justify-between min-h-[140px]`}>
        <div className="flex items-start justify-between">
          <div className="max-w-[70%]">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/60 backdrop-blur-sm text-[10px] text-amber-300 font-bold border border-amber-400/30 mb-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>BDWIN24 অফিশিয়াল অফার</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight drop-shadow-md">
              {activeBanner.title}
            </h2>
            <p className="text-xs text-slate-100 font-medium mt-0.5 line-clamp-2 drop-shadow">
              {activeBanner.subtitle}
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <Icon className="w-8 h-8 text-amber-300 animate-pulse" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => {
              soundManager.playClick();
              activeBanner.action();
            }}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 transition transform active:scale-95"
          >
            <span>{activeBanner.cta}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "w-5 bg-amber-400" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
