"use client";

import React from "react";
import { useApp, TabType } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { Home, Gift, Wallet, Users, User, Gamepad2 } from "lucide-react";

export default function BottomNav() {
  const { activeTab, setActiveTab, activeGame, setActiveGame, t } = useApp();

  const handleTabClick = (tab: TabType) => {
    soundManager.playClick();
    if (activeGame) {
      setActiveGame(null); // return to tab view if game is active
    }
    setActiveTab(tab);
  };

  const navItems = [
    { id: "home", label: t.home, icon: Home },
    { id: "activity", label: t.activity, icon: Gift, badge: "HOT" },
    { id: "wallet", label: t.wallet, icon: Wallet },
    { id: "promotion", label: t.promotion, icon: Users, badge: "VIP" },
    { id: "mine", label: t.mine, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl max-w-lg mx-auto w-full px-2 py-1.5">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && !activeGame;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id as TabType)}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-all duration-150 ${
                isActive ? "text-amber-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "stroke-[2.4] text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "stroke-[1.8]"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-3 text-[8px] bg-red-600 text-white font-extrabold px-1 rounded-full scale-90">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
