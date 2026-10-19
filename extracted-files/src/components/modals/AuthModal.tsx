"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { X, Lock, Phone, Gift, ShieldCheck, Flame, UserCheck } from "lucide-react";

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    refreshUser,
    showToast,
    fireConfetti,
    t,
  } = useApp();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      showToast("মোবাইল নাম্বার ও পাসওয়ার্ড দিন", "error");
      return;
    }

    setLoading(true);
    soundManager.playClick();

    const endpoint = authModalMode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, inviteCode }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        if (authModalMode === "register") {
          fireConfetti();
        }
        await refreshUser();
        setAuthModalOpen(false);
      } else {
        showToast(data.error || "ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    soundManager.playClick();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        await refreshUser();
        setAuthModalOpen(false);
      }
    } catch {
      showToast("ডেমো ব্যর্থ হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 p-5 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-lg shadow-lg shadow-amber-500/30 mb-1">
            BD
          </div>
          <h2 className="text-lg font-black tracking-tight text-white">
            {authModalMode === "login" ? "BDWIN24 একাউন্টে প্রবেশ করুন" : "নতুন একাউন্ট খুলুন ও ৳৫০০ বোনাস নিন"}
          </h2>
          <p className="text-xs text-slate-400">
            {authModalMode === "login"
              ? "আপনার মোবাইল নাম্বার ও পাসওয়ার্ড দিন"
              : "সহজ রেজিস্ট্রেশন, ১ মিনিটে শুরু করুন"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setAuthModalMode("login")}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              authModalMode === "login" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400"
            }`}
          >
            {t.login}
          </button>
          <button
            onClick={() => setAuthModalMode("register")}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              authModalMode === "register" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400"
            }`}
          >
            {t.register}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">মোবাইল নাম্বার (+880)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder={t.passPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {authModalMode === "register" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">রেফার / ইনভাইট কোড (ঐচ্ছিক)</label>
              <div className="relative">
                <Gift className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="যেমন: E768EYN"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 transition transform active:scale-95"
          >
            {loading ? "অপেক্ষা করুন..." : authModalMode === "login" ? t.login : "রেজিস্ট্রেশন করুন (+৳৫০০ বোনাস)"}
          </button>
        </form>

        {/* Demo Button */}
        <div className="pt-1 text-center">
          <button
            onClick={handleDemo}
            className="text-xs text-amber-400 hover:underline font-bold inline-flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>লগইন ছাড়া ডেমো খেলতে চান? এখানে ক্লিক করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
