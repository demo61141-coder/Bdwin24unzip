"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { X, Copy, Check, Zap, ShieldCheck } from "lucide-react";

export default function DepositModal() {
  const { depositModalOpen, setDepositModalOpen, refreshUser, showToast, fireConfetti, user, setAuthModalOpen } = useApp();

  const [method, setMethod] = useState<"bkash" | "nagad" | "rocket" | "upay" | "usdt">("bkash");
  const [amount, setAmount] = useState<number>(500);
  const [trxId, setTrxId] = useState<string>("");
  const [senderNumber, setSenderNumber] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [paymentNumbers, setPaymentNumbers] = useState({
    bkash: "01788223344",
    nagad: "01899112233",
    rocket: "01955443322",
    upay: "01622334455",
    usdt: "TQx7Y2bnWpL8mQ9vZxKrP3sD1fG5hJ4kL8",
  });
  const [bonusPercent, setBonusPercent] = useState<number>(5);

  useEffect(() => {
    if (depositModalOpen) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            setPaymentNumbers({
              bkash: data.settings.bkashNumber || "01788223344",
              nagad: data.settings.nagadNumber || "01899112233",
              rocket: data.settings.rocketNumber || "01955443322",
              upay: data.settings.upayNumber || "01622334455",
              usdt: data.settings.usdtAddress || "TQx7Y2bnWpL8mQ9vZxKrP3sD1fG5hJ4kL8",
            });
            if (data.settings.depositBonusPercent !== undefined) {
              setBonusPercent(data.settings.depositBonusPercent);
            }
          }
        })
        .catch(() => {});
    }
  }, [depositModalOpen]);

  if (!depositModalOpen) return null;

  const currentNumber = paymentNumbers[method] || "01788223344";

  const handleCopy = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(currentNumber);
    setCopied(true);
    showToast("নাম্বার সফলভাবে কপি হয়েছে!", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setDepositModalOpen(false);
      setAuthModalOpen(true);
      return;
    }

    if (!trxId || trxId.trim().length < 4) {
      showToast("সঠিক ট্রানজেকশন আইডি (TrxID) দিন", "error");
      return;
    }

    setLoading(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method,
          accountNumber: senderNumber || "01XXXXXXXXX",
          trxId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        soundManager.playWin();
        fireConfetti();
        await refreshUser();
        setDepositModalOpen(false);
      } else {
        showToast(data.error || "রিচার্জ ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন", "error");
    } finally {
      setLoading(false);
    }
  };

  const bonusAmount = (amount * bonusPercent) / 100;
  const totalReceived = amount + bonusAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/30 p-5 shadow-2xl text-white space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setDepositModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>+{bonusPercent}% এক্সট্রা রিচার্জ বোনাস</span>
          </div>
          <h2 className="text-lg font-black text-white">ওয়ালেট রিচার্জ (Deposit)</h2>
          <p className="text-xs text-slate-400">বিকাশ, নগদ বা রকেটে দ্রুত ব্যালেন্স টপ-আপ</p>
        </div>

        {/* Payment Gateways Selector */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "bkash", label: "বিকাশ", color: "from-pink-600 to-rose-700" },
            { id: "nagad", label: "নগদ", color: "from-orange-600 to-red-600" },
            { id: "rocket", label: "রকেট", color: "from-purple-600 to-indigo-700" },
            { id: "usdt", label: "USDT", color: "from-teal-600 to-emerald-700" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id as typeof method)}
              className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                method === m.id
                  ? `bg-gradient-to-tr ${m.color} text-white ring-2 ring-white shadow-lg`
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Official Number Copy Box */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>অফিসিয়াল {method.toUpperCase()} ক্যাশআউট নাম্বার:</span>
            <span className="text-emerald-400 text-[10px]">সক্রিয়</span>
          </div>

          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <span className="font-mono font-black text-sm text-amber-300 tracking-wider truncate max-w-[200px]">
              {currentNumber}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-md transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "কপি হয়েছে" : "কপি"}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            * উপরে দেওয়া নাম্বারে সেন্ড মানি / ক্যাশআউট করে নিচে TrxID দিন।
          </p>
        </div>

        {/* Amount Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>রিচার্জের পরিমাণ:</span>
            <span className="text-amber-400 text-sm font-black">৳{amount}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[100, 200, 500, 1000, 2000, 5000, 10000, 25000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  amount === amt ? "bg-emerald-500 text-slate-950 font-black shadow" : "bg-slate-800 text-slate-300"
                }`}
              >
                ৳{amt}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/20 p-2 rounded-xl text-center">
            আপনি পাবেন: ৳{amount} + {bonusPercent}% বোনাস ৳{bonusAmount.toFixed(0)} = <span className="font-black text-white">৳{totalReceived.toFixed(0)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">ট্রানজেকশন আইডি (TrxID)</label>
            <input
              type="text"
              placeholder="যেমন: 9J4K2L8M1"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none uppercase font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">আপনার মোবাইল নাম্বার (যেখান থেকে পাঠিয়েছেন)</label>
            <input
              type="text"
              placeholder="০১XXXXXXXXX"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 shadow-lg shadow-emerald-500/30 transition transform active:scale-95"
          >
            {loading ? "ভেরিফাই হচ্ছে..." : `রিচার্জ নিশ্চিত করুন (+${bonusPercent}% বোনাস)`}
          </button>
        </form>
      </div>
    </div>
  );
}
