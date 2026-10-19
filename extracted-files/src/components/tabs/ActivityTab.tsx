"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import {
  Gift,
  Disc3,
  CalendarCheck,
  Ticket,
  Crown,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ActivityTab() {
  const {
    user,
    setDepositModalOpen,
    setCheckInModalOpen,
    setSpinModalOpen,
    setGiftModalOpen,
    setAppDownloadModalOpen,
  } = useApp();

  const promotions = [
    {
      id: "welcome",
      title: "২০০% প্রথম রিচার্জ ওয়েলকাম বোনাস",
      desc: "প্রথমবার যেকোনো পরিমাণ রিচার্জে পান দ্বিগুণ ক্যাশ + ৳৫০০ সাইনআপ গিফট!",
      tag: "NEW USER",
      color: "from-amber-600 to-red-600",
      action: () => setDepositModalOpen(true),
    },
    {
      id: "checkin",
      title: "৭ দিনের ধারাবাহিক সাইন-ইন বোনাস",
      desc: "প্রতিদিন লগইন করে ক্লেইম করুন নগদ টাকা ও স্পিন টিকেট।",
      tag: "DAILY FREE",
      color: "from-blue-600 to-indigo-700",
      action: () => setCheckInModalOpen(true),
    },
    {
      id: "spin",
      title: "লাকি হুইল জ্যাকপট (৳৫,০০০ পর্যন্ত)",
      desc: "প্রতিদিন ফ্রি স্পিন ঘুরিয়ে জিতে নিন ইনস্ট্যান্ট ক্যাশ প্রাইজ।",
      tag: "FREE SPIN",
      color: "from-purple-600 to-pink-700",
      action: () => setSpinModalOpen(true),
    },
    {
      id: "gift",
      title: "স্পেশাল রিডিম গিফট কোড",
      desc: "'BDWIN2026' বা 'WELCOME500' দিয়ে তাৎক্ষণিক ফ্রি ব্যালেন্স নিন।",
      tag: "GIFT CODE",
      color: "from-rose-600 to-red-700",
      action: () => setGiftModalOpen(true),
    },
  ];

  const vipTiers = [
    { level: "VIP 1", exp: "৳0", bonus: "৳50", monthly: "৳100", rebate: "0.2%" },
    { level: "VIP 2", exp: "৳1,000", bonus: "৳100", monthly: "৳250", rebate: "0.3%" },
    { level: "VIP 3", exp: "৳5,000", bonus: "৳300", monthly: "৳600", rebate: "0.4%" },
    { level: "VIP 4", exp: "৳20,000", bonus: "৳1,000", monthly: "৳2,000", rebate: "0.5%" },
    { level: "VIP 5", exp: "৳50,000", bonus: "৳3,000", monthly: "৳5,000", rebate: "0.6%" },
    { level: "VIP 10", exp: "৳500,000", bonus: "৳50,000", monthly: "৳100,000", rebate: "1.2%" },
  ];

  return (
    <div className="space-y-4 p-2 pb-24 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-black text-white">অফার ও বোনাস সেন্টার</h2>
        </div>
        <p className="text-xs text-slate-300">
          BDWIN24 এর সমস্ত স্পেশাল বোনাস, লাকি হুইল ও ভিআইপি রিওয়ার্ড ক্লেইম করুন।
        </p>
      </div>

      {/* Promotions List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
          সক্রিয় ইভেন্টসমূহ
        </h3>
        {promotions.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              soundManager.playClick();
              p.action();
            }}
            className={`bg-gradient-to-r ${p.color} border border-white/10 rounded-2xl p-3.5 shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:scale-95 transition`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-black bg-black/40 text-amber-300 px-2 py-0.5 rounded-full border border-white/10">
                  {p.tag}
                </span>
                <h4 className="text-sm font-black text-white mt-1.5">{p.title}</h4>
                <p className="text-xs text-slate-100 opacity-90 mt-0.5">{p.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white shrink-0 mt-2" />
            </div>
          </div>
        ))}
      </div>

      {/* VIP Club Tier Privilege Table */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-white">ভিআইপি ক্লাব সুবিধা</h3>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
            আপনার স্তর: VIP {user?.vipLevel || 1}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                <th className="pb-2">লেভেল</th>
                <th className="pb-2">রিচার্জ লক্ষ্য</th>
                <th className="pb-2">লেভেল বোনাস</th>
                <th className="pb-2">মাসিক স্যালারি</th>
                <th className="pb-2 text-right">ক্যাশব্যাক</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {vipTiers.map((v) => (
                <tr key={v.level} className="text-[11px]">
                  <td className="py-2 text-amber-300 font-bold">{v.level}</td>
                  <td className="py-2 text-slate-300">{v.exp}</td>
                  <td className="py-2 text-emerald-400 font-bold">{v.bonus}</td>
                  <td className="py-2 text-amber-400 font-bold">{v.monthly}</td>
                  <td className="py-2 text-right text-slate-300">{v.rebate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
