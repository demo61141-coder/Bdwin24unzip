"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { X, ArrowUpRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function WithdrawModal() {
  const { withdrawModalOpen, setWithdrawModalOpen, refreshUser, showToast, user } = useApp();

  const [method, setMethod] = useState<"bkash" | "nagad" | "rocket" | "bank">("bkash");
  const [amount, setAmount] = useState<number>(500);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!withdrawModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (amount < 110) {
      showToast("সর্বনিম্ন উত্তোলন পরিমাণ ৳১১০", "error");
      return;
    }

    if (user.balance < amount) {
      showToast("আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই!", "error");
      return;
    }

    if (!accountNumber || accountNumber.trim().length < 11) {
      showToast("সঠিক ১১ ডিজিটের ওয়ালেট নাম্বার দিন", "error");
      return;
    }

    setLoading(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method,
          accountNumber,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        soundManager.playWin();
        await refreshUser();
        setWithdrawModalOpen(false);
      } else {
        showToast(data.error || "উত্তোলন সম্পন্ন করা যায়নি", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 p-5 shadow-2xl text-white space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setWithdrawModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>১-৫ মিনিটে ফাস্ট পেমেন্ট</span>
          </div>
          <h2 className="text-lg font-black text-white">ব্যালেন্স উত্তোলন (Withdraw)</h2>
          <p className="text-xs text-slate-400">
            বর্তমান ব্যালেন্স: <span className="text-amber-400 font-bold">৳{user?.balance?.toFixed(2) || "0.00"}</span>
          </p>
        </div>

        {/* Payment Gateways */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "bkash", label: "বিকাশ", color: "from-pink-600 to-rose-700" },
            { id: "nagad", label: "নগদ", color: "from-orange-600 to-red-600" },
            { id: "rocket", label: "রকেট", color: "from-purple-600 to-indigo-700" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id as typeof method)}
              className={`p-2 rounded-xl text-xs font-bold transition ${
                method === m.id
                  ? `bg-gradient-to-tr ${m.color} text-white ring-2 ring-white shadow-lg`
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Amount Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>উত্তোলনের পরিমাণ:</span>
            <span className="text-amber-400 text-sm font-black">৳{amount}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[110, 200, 500, 1000, 2000, 5000, 10000, 20000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  amount === amt ? "bg-amber-500 text-slate-950 font-black shadow" : "bg-slate-800 text-slate-300"
                }`}
              >
                ৳{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">
              আপনার {method.toUpperCase()} নাম্বার (পার্সোনাল)
            </label>
            <input
              type="text"
              placeholder="০১XXXXXXXXX"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">লগইন পাসওয়ার্ড / পিন</label>
            <input
              type="password"
              placeholder="পাসওয়ার্ড নিশ্চিত করুন"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950 p-2 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>সর্বনিম্ন উত্তোলন ৳১১০। চার্জ ০%। প্রতিদিন সর্বোচ্চ ৫ বার উত্তোলন সম্ভব।</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30 transition transform active:scale-95"
          >
            {loading ? "প্রসেসিং হচ্ছে..." : "উত্তোলনের আবেদন করুন (Withdraw)"}
          </button>
        </form>
      </div>
    </div>
  );
}
