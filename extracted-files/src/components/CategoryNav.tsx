"use client";

import React from "react";
import { soundManager } from "@/lib/audio";
import { Sparkles, Zap, Rocket, Gamepad2, Trophy, Bomb, Dice5 } from "lucide-react";

export type CategoryKey = "all" | "lottery" | "aviator" | "slots" | "live" | "sports" | "mini";

interface CategoryNavProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (cat: CategoryKey) => void;
}

export default function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  const categories = [
    { id: "all", label: "সব গেম", icon: Sparkles },
    { id: "lottery", label: "উইন গো (লটারী)", icon: Zap, hot: true },
    { id: "aviator", label: "এভিয়েটর (ক্র্যাশ)", icon: Rocket, hot: true },
    { id: "slots", label: "স্লট গেমস", icon: Gamepad2 },
    { id: "live", label: "লাইভ ক্যাসিনো", icon: Trophy },
    { id: "sports", label: "স্পোর্টস বাজি", icon: Trophy },
    { id: "mini", label: "মিনি গেমস", icon: Bomb },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => {
              soundManager.playClick();
              onSelectCategory(cat.id as CategoryKey);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 relative ${
              isSelected
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 scale-102"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-slate-950" : "text-amber-400"}`} />
            <span>{cat.label}</span>
            {cat.hot && (
              <span className={`text-[8px] font-black px-1 rounded-full ${isSelected ? "bg-red-600 text-white" : "bg-red-500/20 text-red-400"}`}>
                HOT
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
