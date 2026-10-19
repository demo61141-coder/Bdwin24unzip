"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  History,
  DollarSign,
  Gift,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Txn {
  id: number;
  type: string;
  amount: number;
  method: string;
  status: string;
  trxId?: string;
  note?: string;
  createdAt: string;
}

export default function WalletTab() {
  const { user, setDepositModalOpen, setWithdrawModalOpen, refreshUser, showToast } = useApp();
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTxns = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/transactions");
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxns();
  }, [user]);

  return (
    <div className="space-y-4 p-2 pb-24 max-w-lg mx-auto">
      {/* Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-5 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Wallet className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">মোট ব্যালেন্স (Main Balance)</span>
              <div className="text-2xl font-black text-amber-300 tracking-tight">
                ৳{user?.balance?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              soundManager.playClick();
              await refreshUser();
              await fetchTxns();
              showToast("ওয়ালেট রিফ্রেশ হয়েছে", "info");
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Bonus & Commission Pill Rows */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">বোনাস ব্যালেন্স</span>
            <span className="text-sm font-black text-emerald-400">
              ৳{user?.bonusBalance?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">কমিশন ব্যালেন্স</span>
            <span className="text-sm font-black text-amber-400">
              ৳{user?.commissionBalance?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        {/* Deposit & Withdraw Big Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              soundManager.playClick();
              setDepositModalOpen(true);
            }}
            className="py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>রিচার্জ (Deposit)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setWithdrawModalOpen(true);
            }}
            className="py-3 rounded-2xl font-black text-xs bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 shadow-lg flex items-center justify-center gap-1.5 transition transform active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span>উত্তোলন (Withdraw)</span>
          </button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-md">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-400" />
            <span>লেনদেন হিস্ট্রি (Transactions)</span>
          </div>
          <span className="text-[10px] text-slate-500">সাম্প্রতিক ৫০টি</span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              কোনো লেনদেন রেকর্ড পাওয়া যায়নি
            </div>
          ) : (
            transactions.map((t) => (
              <div
                key={t.id}
                className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                        t.type === "deposit"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : t.type === "withdraw"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {t.type}
                    </span>
                    <span className="font-bold text-white capitalize">{t.method || "System"}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.note || "সফল"}</div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-black text-sm ${
                      t.type === "deposit" || t.type === "bonus" ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {t.type === "deposit" || t.type === "bonus" ? "+" : "-"}৳{t.amount.toFixed(0)}
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold block">✓ সম্পন্ন</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
