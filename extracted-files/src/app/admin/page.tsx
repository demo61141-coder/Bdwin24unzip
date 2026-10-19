"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Wallet,
  Users,
  ArrowUpRight,
  PlusCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Ticket,
  Headphones,
  Settings,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Save,
  Send,
  Eye,
  LogOut,
  Smartphone,
  ExternalLink,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  totalBetVolume: number;
  totalPaidWinnings: number;
  houseProfit: number;
}

interface SiteSettingsData {
  id?: number;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  upayNumber: string;
  usdtAddress: string;
  minDeposit: number;
  minWithdraw: number;
  depositBonusPercent: number;
  welcomeBonus: number;
  adminPin: string;
  siteNotice: string;
  isDepositAutoApprove: boolean;
}

interface DepositRecord {
  id: number;
  userId: number;
  amount: number;
  method: string;
  accountNumber: string;
  trxId: string;
  status: string;
  note: string;
  createdAt: string;
  username: string;
  phone: string;
  userBalance: number;
}

interface WithdrawRecord {
  id: number;
  userId: number;
  amount: number;
  method: string;
  accountNumber: string;
  status: string;
  note: string;
  createdAt: string;
  username: string;
  phone: string;
  userBalance: number;
}

interface UserItem {
  id: number;
  username: string;
  phone: string;
  balance: number;
  bonusBalance: number;
  vipLevel: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalBetAmount: number;
  totalWinAmount: number;
  isBanned: boolean;
  isDemo: boolean;
  createdAt: string;
}

interface GiftCodeItem {
  id: number;
  code: string;
  amount: number;
  maxClaims: number;
  claimsCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<
    "overview" | "numbers" | "deposits" | "withdrawals" | "users" | "gifts" | "chat"
  >("overview");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [settings, setSettings] = useState<SiteSettingsData>({
    bkashNumber: "01788223344",
    nagadNumber: "01899112233",
    rocketNumber: "01955443322",
    upayNumber: "01622334455",
    usdtAddress: "TQx7Y2bnWpL8mQ9vZxKrP3sD1fG5hJ4kL8",
    minDeposit: 100,
    minWithdraw: 110,
    depositBonusPercent: 5,
    welcomeBonus: 500,
    adminPin: "admin1234",
    siteNotice: "BDWIN24 অফিশিয়াল বাংলাদেশ গেমিং প্ল্যাটফর্ম। বিকাশ ও নগদে ডিপোজিটে পান ৫% এক্সট্রা বোনাস।",
    isDepositAutoApprove: true,
  });

  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRecord[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [giftCodesList, setGiftCodesList] = useState<GiftCodeItem[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; username: string; message: string; isSupport: boolean }>>([]);

  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // User Balance Edit Modal state
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>("500");
  const [newPass, setNewPass] = useState<string>("");

  // New Gift Code state
  const [newGiftCode, setNewGiftCode] = useState<string>("");
  const [newGiftAmount, setNewGiftAmount] = useState<string>("100");
  const [newGiftMax, setNewGiftMax] = useState<string>("1000");

  // Admin reply chat state
  const [adminReply, setAdminReply] = useState<string>("");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAuthError("");
        fetchAllData();
      } else {
        setAuthError(data.error || "ভুল এডমিন পিন!");
      }
    } catch {
      setAuthError("সার্ভার ত্রুটি");
    }
  };

  const fetchAllData = useCallback(async () => {
    try {
      // 1. Stats
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.stats) setStats(statsData.stats);

      // 2. Settings
      const setRes = await fetch("/api/admin/settings");
      const setData = await setRes.json();
      if (setData.settings) setSettings(setData.settings);

      // 3. Deposits
      const depRes = await fetch("/api/admin/deposits");
      const depData = await depRes.json();
      if (depData.deposits) setDeposits(depData.deposits);

      // 4. Withdrawals
      const withRes = await fetch("/api/admin/withdrawals");
      const withData = await withRes.json();
      if (withData.withdrawals) setWithdrawals(withData.withdrawals);

      // 5. Users
      const userRes = await fetch("/api/admin/users");
      const userData = await userRes.json();
      if (userData.users) setUsersList(userData.users);

      // 6. Gifts
      const giftRes = await fetch("/api/admin/gifts");
      const giftData = await giftRes.json();
      if (giftData.codes) setGiftCodesList(giftData.codes);

      // 7. Chat
      const chatRes = await fetch("/api/chat");
      const chatData = await chatRes.json();
      if (chatData.messages) setChatMessages(chatData.messages);
    } catch (e) {
      console.error("Admin fetch error", e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  // Handle Save Payment Numbers / Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        if (data.settings) setSettings(data.settings);
      } else {
        showToast(data.error || "সংরক্ষণ ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  // Handle Deposit Action
  const handleDepositAction = async (txnId: number, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txnId, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchAllData();
      } else {
        showToast(data.error || "ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  // Handle Withdraw Action
  const handleWithdrawAction = async (txnId: number, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txnId, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchAllData();
      } else {
        showToast(data.error || "ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  // Handle Adjust User Balance
  const handleAdjustUserBalance = async (isAdd: boolean) => {
    if (!selectedUser) return;
    const delta = isAdd ? parseFloat(balanceAmount) : -parseFloat(balanceAmount);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "adjust_balance",
          amount: delta,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setSelectedUser(null);
        fetchAllData();
      } else {
        showToast(data.error || "ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  // Handle Change User Password
  const handleChangeUserPassword = async () => {
    if (!selectedUser || !newPass) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "change_password",
          newPassword: newPass,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setNewPass("");
        setSelectedUser(null);
        fetchAllData();
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  // Handle Ban/Unban User
  const handleToggleBan = async (user: UserItem) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "toggle_ban",
          isBanned: !user.isBanned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchAllData();
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  // Handle Create Gift Code
  const handleCreateGiftCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftCode || !newGiftAmount) return;
    try {
      const res = await fetch("/api/admin/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          code: newGiftCode,
          amount: newGiftAmount,
          maxClaims: newGiftMax,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setNewGiftCode("");
        fetchAllData();
      } else {
        showToast(data.error || "তৈরি ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
  };

  // Handle Admin Chat Reply
  const handleAdminSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim()) return;
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `[অফিসিয়াল এডমিন]: ${adminReply.trim()}` }),
      });
      setAdminReply("");
      showToast("রিপ্লাই পাঠানো হয়েছে!", "success");
      fetchAllData();
    } catch {}
  };

  // If NOT logged in as Admin, show Admin Pin Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 p-6 shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
              <ShieldCheck className="w-7 h-7 text-slate-950" />
            </div>
            <h1 className="text-lg font-black text-white mt-2">BDWIN24 অফিশিয়াল এডমিন প্যানেল</h1>
            <p className="text-xs text-slate-400">ডিপোজিট নাম্বার ও সিস্টেম ম্যানেজমেন্ট</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">এডমিন পিন / পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="ডিফল্ট পিন: admin1234"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {authError && <div className="text-xs text-red-400 font-bold text-center">{authError}</div>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 transition"
            >
              এডমিন ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-amber-300 inline-flex items-center gap-1">
              <span>← প্লেয়ার ওয়েবসাইটে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard Main View
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-sm">
              BD
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  BDWIN24 ADMIN
                </span>
                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                  MASTER
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-amber-400 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ওয়েবসাইট দেখুন</span>
            </Link>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs font-bold text-red-300 hover:bg-red-900/60 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
          {[
            { id: "overview", label: "ড্যাশবোর্ড ওভারভিউ", icon: TrendingUp },
            { id: "numbers", label: "📱 ডিপোজিট নাম্বার কন্ট্রোল", icon: Smartphone, highlight: true },
            {
              id: "deposits",
              label: `ডিপোজিট আবেদন (${stats?.pendingDepositsCount || 0})`,
              icon: PlusCircle,
            },
            {
              id: "withdrawals",
              label: `উত্তোলন আবেদন (${stats?.pendingWithdrawalsCount || 0})`,
              icon: ArrowUpRight,
            },
            { id: "users", label: `ইউজার ম্যানেজমেন্ট (${stats?.totalUsers || 0})`, icon: Users },
            { id: "gifts", label: "গিফট কোড জেনারেটর", icon: Ticket },
            { id: "chat", label: "লাইভ সাপোর্ট চ্যাট", icon: Headphones },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSel
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black"
                    : tab.highlight
                    ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:text-white"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Top Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-bold">মোট নিবন্ধিত ইউজার</span>
                <div className="text-2xl font-black text-white">{stats?.totalUsers || 0} জন</div>
              </div>

              <div className="bg-slate-900 border border-emerald-500/30 p-3.5 rounded-2xl space-y-1">
                <span className="text-xs text-emerald-400 font-bold">মোট ডিপোজিট (৳)</span>
                <div className="text-2xl font-black text-emerald-400">
                  ৳{(stats?.totalDeposits || 0).toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-900 border border-amber-500/30 p-3.5 rounded-2xl space-y-1">
                <span className="text-xs text-amber-400 font-bold">মোট উত্তোলন (৳)</span>
                <div className="text-2xl font-black text-amber-400">
                  ৳{(stats?.totalWithdrawals || 0).toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-900 border border-purple-500/30 p-3.5 rounded-2xl space-y-1">
                <span className="text-xs text-purple-400 font-bold">হাউস প্রফিট / রেভিনিউ</span>
                <div className="text-2xl font-black text-purple-300">
                  ৳{(stats?.houseProfit || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Quick Summary Alert Box */}
            <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/30 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white">পেমেন্ট গেটওয়ে স্ট্যাটাস</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  বর্তমান বিকাশ: <span className="font-mono text-amber-300 font-bold">{settings.bkashNumber}</span> |
                  নগদ: <span className="font-mono text-amber-300 font-bold">{settings.nagadNumber}</span> | রকেট:{" "}
                  <span className="font-mono text-amber-300 font-bold">{settings.rocketNumber}</span>
                </p>
              </div>

              <button
                onClick={() => setActiveTab("numbers")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow"
              >
                নাম্বার পরিবর্তন করুন
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT AGENT NUMBERS & SETTINGS (CRITICAL FEATURE) */}
        {activeTab === "numbers" && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span>অফিসিয়াল ডিপোজিট / ক্যাশআউট নাম্বার কন্ট্রোল</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  এখানে আপনি আপনার পার্সোনাল বা এজেন্ট বিকাশ, নগদ, রকেট নাম্বার বসালে ইউজাররা সেই নাম্বারেই টাকা পাঠাবে।
                </p>
              </div>

              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30">
                লাইভ সিঙ্ক সক্রিয়
              </span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* bKash Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pink-400 flex items-center gap-1">
                    <span>বিকাশ (bKash) নাম্বার:</span>
                  </label>
                  <input
                    type="text"
                    value={settings.bkashNumber}
                    onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                    placeholder="০১XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-pink-400 rounded-xl py-2.5 px-3 text-xs text-white font-mono font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">ডিপোজিট মডালে এই বিকাশ নাম্বার প্রদর্শিত হবে</span>
                </div>

                {/* Nagad Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-orange-400 flex items-center gap-1">
                    <span>নগদ (Nagad) নাম্বার:</span>
                  </label>
                  <input
                    type="text"
                    value={settings.nagadNumber}
                    onChange={(e) => setSettings({ ...settings, nagadNumber: e.target.value })}
                    placeholder="০১XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-400 rounded-xl py-2.5 px-3 text-xs text-white font-mono font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">ডিপোজিট মডালে এই নগদ নাম্বার প্রদর্শিত হবে</span>
                </div>

                {/* Rocket Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-purple-400 flex items-center gap-1">
                    <span>রকেট (Rocket) নাম্বার:</span>
                  </label>
                  <input
                    type="text"
                    value={settings.rocketNumber}
                    onChange={(e) => setSettings({ ...settings, rocketNumber: e.target.value })}
                    placeholder="০১XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl py-2.5 px-3 text-xs text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                {/* Upay Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-1">
                    <span>উপায় (Upay) নাম্বার:</span>
                  </label>
                  <input
                    type="text"
                    value={settings.upayNumber}
                    onChange={(e) => setSettings({ ...settings, upayNumber: e.target.value })}
                    placeholder="০১XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-400 rounded-xl py-2.5 px-3 text-xs text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                {/* USDT TRC20 Address */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-teal-400 flex items-center gap-1">
                    <span>USDT TRC20 ওয়ালেট অ্যাড্রেস:</span>
                  </label>
                  <input
                    type="text"
                    value={settings.usdtAddress}
                    onChange={(e) => setSettings({ ...settings, usdtAddress: e.target.value })}
                    placeholder="TQx7Y2bnWpL8mQ9v..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl py-2.5 px-3 text-xs text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                {/* Min Deposit & Min Withdraw */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">সর্বনিম্ন রিচার্জ সীমা (টাকা):</label>
                  <input
                    type="number"
                    value={settings.minDeposit}
                    onChange={(e) => setSettings({ ...settings, minDeposit: parseFloat(e.target.value) || 100 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">সর্বনিম্ন উত্তোলন সীমা (টাকা):</label>
                  <input
                    type="number"
                    value={settings.minWithdraw}
                    onChange={(e) => setSettings({ ...settings, minWithdraw: parseFloat(e.target.value) || 110 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>

                {/* Extra Deposit Bonus % */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-400">এক্সট্রা ডিপোজিট বোনাস (%):</label>
                  <input
                    type="number"
                    value={settings.depositBonusPercent}
                    onChange={(e) =>
                      setSettings({ ...settings, depositBonusPercent: parseFloat(e.target.value) || 5 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>

                {/* Change Admin PIN */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400">এডমিন পিন / পাসওয়ার্ড পরিবর্তন:</label>
                  <input
                    type="text"
                    value={settings.adminPin}
                    onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>

                {/* Site Notice */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300">সাইট নোটিশ (ব্যানার বার্তা):</label>
                  <input
                    type="text"
                    value={settings.siteNotice}
                    onChange={(e) => setSettings({ ...settings, siteNotice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>পেমেন্ট নাম্বার ও সেটিংস সেভ করুন (Save Changes)</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: DEPOSITS APPROVAL */}
        {activeTab === "deposits" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white">ডিপোজিট রিকোয়েস্ট তালিকা ({deposits.length}টি)</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                    <th className="pb-2">ইউজার</th>
                    <th className="pb-2">পরিমাণ</th>
                    <th className="pb-2">মেথড</th>
                    <th className="pb-2">TrxID</th>
                    <th className="pb-2">সেন্ডার নাম্বার</th>
                    <th className="pb-2">স্ট্যাটাস</th>
                    <th className="pb-2 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deposits.map((d) => (
                    <tr key={d.id} className="text-xs">
                      <td className="py-2.5">
                        <span className="font-bold text-white block">{d.username}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{d.phone}</span>
                      </td>
                      <td className="py-2.5 font-black text-emerald-400">৳{d.amount}</td>
                      <td className="py-2.5 uppercase font-bold text-slate-300">{d.method}</td>
                      <td className="py-2.5 font-mono text-amber-300 font-bold">{d.trxId}</td>
                      <td className="py-2.5 font-mono text-slate-400">{d.accountNumber}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            d.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : d.status === "rejected"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-1">
                        {d.status !== "completed" && (
                          <button
                            onClick={() => handleDepositAction(d.id, "approve")}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                          >
                            অনুমোদন
                          </button>
                        )}
                        {d.status !== "rejected" && (
                          <button
                            onClick={() => handleDepositAction(d.id, "reject")}
                            className="px-2 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-bold text-[10px]"
                          >
                            বাতিল
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: WITHDRAWALS APPROVAL */}
        {activeTab === "withdrawals" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white">উত্তোলন রিকোয়েস্ট তালিকা ({withdrawals.length}টি)</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                    <th className="pb-2">ইউজার</th>
                    <th className="pb-2">পরিমাণ</th>
                    <th className="pb-2">মেথড</th>
                    <th className="pb-2">উত্তোলন একাউন্ট</th>
                    <th className="pb-2">স্ট্যাটাস</th>
                    <th className="pb-2 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="text-xs">
                      <td className="py-2.5">
                        <span className="font-bold text-white block">{w.username}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{w.phone}</span>
                      </td>
                      <td className="py-2.5 font-black text-amber-400">৳{w.amount}</td>
                      <td className="py-2.5 uppercase font-bold text-slate-300">{w.method}</td>
                      <td className="py-2.5 font-mono text-emerald-300 font-bold">{w.accountNumber}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            w.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : w.status === "rejected"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-1">
                        <button
                          onClick={() => handleWithdrawAction(w.id, "approve")}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                        >
                          পেইড (Paid)
                        </button>
                        <button
                          onClick={() => handleWithdrawAction(w.id, "reject")}
                          className="px-2 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-bold text-[10px]"
                        >
                          রিফান্ড ও বাতিল
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-black text-white">ইউজার তালিকা ও ব্যালেন্স কন্ট্রোল</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                    <th className="pb-2">ইউজারনেম / ফোন</th>
                    <th className="pb-2">ব্যালেন্স</th>
                    <th className="pb-2">ডিপোজিট</th>
                    <th className="pb-2">উত্তোলন</th>
                    <th className="pb-2">ভিআইপি</th>
                    <th className="pb-2 text-right">ম্যানেজ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usersList.map((u) => (
                    <tr key={u.id} className="text-xs">
                      <td className="py-2.5">
                        <span className="font-bold text-white block">{u.username}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{u.phone}</span>
                      </td>
                      <td className="py-2.5 font-black text-amber-300">৳{u.balance.toFixed(2)}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">৳{u.totalDeposited}</td>
                      <td className="py-2.5 text-amber-400 font-bold">৳{u.totalWithdrawn}</td>
                      <td className="py-2.5">VIP {u.vipLevel}</td>
                      <td className="py-2.5 text-right space-x-1">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px]"
                        >
                          ব্যালেন্স এডিট
                        </button>
                        <button
                          onClick={() => handleToggleBan(u)}
                          className={`px-2 py-1 rounded text-white font-bold text-[10px] ${
                            u.isBanned ? "bg-emerald-700" : "bg-red-800"
                          }`}
                        >
                          {u.isBanned ? "আনব্যান" : "ব্যান"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Edit Modal */}
            {selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 p-5 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-black text-white">{selectedUser.username} এর একাউন্ট</h3>
                    <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white text-xs">
                      ✕
                    </button>
                  </div>

                  <div className="text-xs text-slate-300">
                    বর্তমান ব্যালেন্স: <span className="font-black text-amber-300">৳{selectedUser.balance.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">ব্যালেন্স যোগ / বিয়োগ (টাকা):</label>
                    <input
                      type="number"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdjustUserBalance(true)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 font-bold text-xs"
                      >
                        + যোগ করুন
                      </button>
                      <button
                        onClick={() => handleAdjustUserBalance(false)}
                        className="flex-1 py-2 rounded-xl bg-red-700 font-bold text-xs"
                      >
                        - বিয়োগ করুন
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-300">নতুন পাসওয়ার্ড সেট করুন:</label>
                    <input
                      type="text"
                      placeholder="নতুন পাসওয়ার্ড"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                    />
                    <button
                      onClick={handleChangeUserPassword}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs"
                    >
                      পাসওয়ার্ড পরিবর্তন করুন
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: GIFT CODES GENERATOR */}
        {activeTab === "gifts" && (
          <div className="space-y-4">
            {/* Create Code Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h2 className="text-sm font-black text-white">নতুন গিফট কোড তৈরি করুন</h2>
              <form onSubmit={handleCreateGiftCode} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="কোড (যেমন: EID2026)"
                  value={newGiftCode}
                  onChange={(e) => setNewGiftCode(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white uppercase font-mono font-bold"
                />
                <input
                  type="number"
                  placeholder="টাকার পরিমাণ (৳)"
                  value={newGiftAmount}
                  onChange={(e) => setNewGiftAmount(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="সর্বোচ্চ ক্লেইম সংখ্যা"
                  value={newGiftMax}
                  onChange={(e) => setNewGiftMax(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                />
                <button
                  type="submit"
                  className="py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs"
                >
                  তৈরি করুন
                </button>
              </form>
            </div>

            {/* List of active codes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-400">সক্রিয় কোডসমূহ:</h3>
              <div className="space-y-1.5">
                {giftCodesList.map((g) => (
                  <div
                    key={g.id}
                    className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-300 text-sm">{g.code}</span>
                      <span className="text-emerald-400 font-bold">(৳{g.amount})</span>
                      <span className="text-slate-400 text-[10px]">
                        ক্লেম: {g.claimsCount} / {g.maxClaims}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ সক্রিয়</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: LIVE SUPPORT CHAT */}
        {activeTab === "chat" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-black text-white">লাইভ সাপোর্ট বার্তা ও এডমিন রিপ্লাই</h2>

            <div className="space-y-2 max-h-80 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              {chatMessages.map((m) => (
                <div key={m.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-amber-300">{m.username}</span>
                    <span>{m.isSupport ? "অফিসিয়াল সাপোর্ট" : "প্লেয়ার"}</span>
                  </div>
                  <p className="text-slate-200">{m.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAdminSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="প্লেয়ারদের উদ্দেশে অফিশিয়াল বার্তা লিখুন..."
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>পাঠান</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Global Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-3 rounded-2xl bg-slate-900 border border-emerald-500/50 text-white font-bold text-xs shadow-2xl">
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}
