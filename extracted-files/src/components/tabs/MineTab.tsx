"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import {
  User,
  Crown,
  ShieldCheck,
  Gift,
  History,
  Headphones,
  Globe,
  Volume2,
  VolumeX,
  LogOut,
  ChevronRight,
  Download,
  Flame,
  Award,
  Lock,
} from "lucide-react";

export default function MineTab() {
  const {
    user,
    setUser,
    lang,
    setLang,
    soundEnabled,
    setSoundEnabled,
    setAuthModalOpen,
    setAuthModalMode,
    setChatModalOpen,
    setAppDownloadModalOpen,
    showToast,
    setActiveTab,
  } = useApp();

  const handleLogout = async () => {
    soundManager.playClick();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      showToast("সফলভাবে লগআউট হয়েছে", "info");
    } catch {}
  };

  const nextVipExp = (user?.vipLevel || 1) * 1000;
  const currentExp = user?.vipExp || 0;
  const vipPercent = Math.min(100, Math.floor((currentExp / Math.max(1, nextVipExp)) * 100));

  return (
    <div className="space-y-4 p-2 pb-24 max-w-lg mx-auto">
      {/* Profile Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-5 shadow-2xl text-white space-y-3">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
                <User className="w-8 h-8 text-slate-950" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-white">{user.username}</h2>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-bold">
                    VIP {user.vipLevel || 1}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{user.phone}</p>
                <div className="text-xs text-amber-400 font-bold mt-1">
                  ইনভাইট কোড: <span className="font-mono text-white">{user.inviteCode}</span>
                </div>
              </div>
            </div>

            {/* VIP Level Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">VIP {user.vipLevel || 1} অগ্রগতি</span>
                <span className="text-amber-400 font-bold">
                  {currentExp} / {nextVipExp} EXP ({vipPercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                  style={{ width: `${vipPercent}%` }}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <h2 className="text-base font-black text-white">BDWIN24 এ স্বাগতম</h2>
            <p className="text-xs text-slate-400">খেলতে ও রিচার্জ করতে অনুগ্রহ করে লগইন করুন</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setAuthModalMode("login");
                  setAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                লগইন
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setAuthModalMode("register");
                  setAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow"
              >
                রেজিস্ট্রেশন (+৳৫০০)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Statistics Grid */}
      {user && (
        <div className="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">মোট ডিপোজিট</span>
            <span className="text-xs font-black text-emerald-400">
              ৳{(user.totalDeposited || 0).toFixed(0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">মোট উত্তোলন</span>
            <span className="text-xs font-black text-amber-400">
              ৳{(user.totalWithdrawn || 0).toFixed(0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">মোট জয়ের পরিমাণ</span>
            <span className="text-xs font-black text-purple-400">
              ৳{(user.totalWinAmount || 0).toFixed(0)}
            </span>
          </div>
        </div>
      )}

      {/* Menu Options List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden text-xs">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab("wallet");
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/60 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">লেনদেন ও বেটিং হিস্ট্রি</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab("promotion");
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/60 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">রেফারেল ও আমন্ত্রণ প্রোগ্রাম</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setAppDownloadModalOpen(true);
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/60 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white">BDWIN24 APK ডাউনলোড</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setChatModalOpen(true);
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/60 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <Headphones className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white">২৪/৭ লাইভ কাস্টমার সাপোর্ট</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Language switch row */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">ভাষা (Language)</span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              setLang(lang === "bn" ? "en" : "bn");
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-amber-300"
          >
            {lang === "bn" ? "বাংলা" : "English"}
          </button>
        </div>

        {/* Sound toggle row */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span className="font-bold text-white">সাউন্ড ইফেক্টস</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              soundEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
            }`}
          >
            {soundEnabled ? "চালু" : "বন্ধ"}
          </button>
        </div>

        {/* Admin Panel Link for Site Owner */}
        <Link
          href="/admin"
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/60 transition text-left block"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-amber-300">এডমিন প্যানেল (মালিকের জন্য)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400" />
        </Link>
      </div>

      {/* Logout Button */}
      {user && (
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl font-black text-xs bg-slate-900 border border-red-500/30 text-red-400 hover:bg-red-950/40 transition flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>লগআউট করুন</span>
        </button>
      )}
    </div>
  );
}
