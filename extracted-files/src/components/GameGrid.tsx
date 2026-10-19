"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { CategoryKey } from "./CategoryNav";
import { Flame, Play, Star, Users } from "lucide-react";

interface GameGridProps {
  selectedCategory: CategoryKey;
}

export default function GameGrid({ selectedCategory }: GameGridProps) {
  const { setActiveGame, setSelectedSlotId } = useApp();

  const games = [
    {
      id: "wingo_1m",
      title: "Win Go 1 Min",
      category: "lottery",
      subtitle: "কালার প্রেডিকশন (Red/Green/Violet)",
      badge: "HOT #1",
      badgeColor: "bg-red-600",
      rtp: "98.5%",
      players: "14,820",
      gradient: "from-emerald-600 via-teal-700 to-slate-900",
      icon: "🎯",
      action: () => setActiveGame("wingo"),
    },
    {
      id: "aviator_crash",
      title: "Aviator Crash",
      category: "aviator",
      subtitle: "বিমান উড়ান ও ১০০x পর্যন্ত ক্যাশআউট",
      badge: "VIRAL",
      badgeColor: "bg-rose-600",
      rtp: "97.0%",
      players: "22,450",
      gradient: "from-rose-600 via-red-800 to-indigo-950",
      icon: "🚀",
      action: () => setActiveGame("aviator"),
    },
    {
      id: "fortune_tiger",
      title: "Fortune Tiger",
      category: "slots",
      subtitle: "পিজি স্লট - গোল্ডেন টাইগার ২৫০০x",
      badge: "MEGA WIN",
      badgeColor: "bg-amber-600",
      rtp: "96.8%",
      players: "9,840",
      gradient: "from-amber-600 via-orange-700 to-slate-950",
      icon: "🐯",
      action: () => {
        setSelectedSlotId("fortune_tiger");
        setActiveGame("slots");
      },
    },
    {
      id: "gates_of_olympus",
      title: "Gates of Olympus",
      category: "slots",
      subtitle: "জিউস লাইটনিং ৫০০x মাল্টিপ্লায়ার",
      badge: "POPULAR",
      badgeColor: "bg-purple-600",
      rtp: "96.5%",
      players: "11,200",
      gradient: "from-purple-700 via-indigo-800 to-slate-950",
      icon: "⚡",
      action: () => {
        setSelectedSlotId("gates_of_olympus");
        setActiveGame("slots");
      },
    },
    {
      id: "dragon_tiger",
      title: "Dragon Tiger",
      category: "live",
      subtitle: "লাইভ কার্ড টেবিল - ড্রাগন বনাম টাইগার",
      badge: "LIVE",
      badgeColor: "bg-red-600",
      rtp: "97.2%",
      players: "8,950",
      gradient: "from-red-700 via-rose-900 to-slate-950",
      icon: "🐉",
      action: () => setActiveGame("dragon_tiger"),
    },
    {
      id: "mines",
      title: "Mines Mini-Game",
      category: "mini",
      subtitle: "৫x৫ গ্রিড মাইনসুইপার ও ডায়মন্ড ক্যাশআউট",
      badge: "EASY WIN",
      badgeColor: "bg-teal-600",
      rtp: "99.0%",
      players: "16,100",
      gradient: "from-cyan-700 via-teal-800 to-slate-950",
      icon: "💣",
      action: () => setActiveGame("mines"),
    },
    {
      id: "sweet_bonanza",
      title: "Sweet Bonanza",
      category: "slots",
      subtitle: "ক্যান্ডি টাম্বলিং স্লট ও ফ্রি স্পিন",
      badge: "SWEET",
      badgeColor: "bg-pink-600",
      rtp: "96.6%",
      players: "7,820",
      gradient: "from-pink-600 via-rose-700 to-slate-950",
      icon: "🍭",
      action: () => {
        setSelectedSlotId("sweet_bonanza");
        setActiveGame("slots");
      },
    },
    {
      id: "super_ace",
      title: "Super Ace",
      category: "slots",
      subtitle: "গোল্ডেন এস ও পোকার কম্বো স্লট",
      badge: "JILI TOP",
      badgeColor: "bg-blue-600",
      rtp: "97.4%",
      players: "6,910",
      gradient: "from-blue-700 via-indigo-900 to-slate-950",
      icon: "🃏",
      action: () => {
        setSelectedSlotId("super_ace");
        setActiveGame("slots");
      },
    },
    {
      id: "sports_cricket",
      title: "BPL & Cricket বাজি",
      category: "sports",
      subtitle: "লাইভ ক্রিকেট ও ফুটবল স্পোর্টস অডস",
      badge: "HIGH ODDS",
      badgeColor: "bg-emerald-600",
      rtp: "98.0%",
      players: "12,400",
      gradient: "from-emerald-700 via-green-900 to-slate-950",
      icon: "🏏",
      action: () => setActiveGame("sports"),
    },
    {
      id: "roulette",
      title: "European Roulette",
      category: "live",
      subtitle: "৩৬x পর্যন্ত লাকি নাম্বার পেআউট",
      badge: "CLASSIC",
      badgeColor: "bg-amber-600",
      rtp: "97.3%",
      players: "4,600",
      gradient: "from-amber-700 via-yellow-900 to-slate-950",
      icon: "🎡",
      action: () => setActiveGame("roulette"),
    },
    {
      id: "dice",
      title: "Dice Over/Under",
      category: "mini",
      subtitle: "ডাইস রোল ও প্রবাবিলিটি পেআউট",
      badge: "INSTANT",
      badgeColor: "bg-indigo-600",
      rtp: "99.0%",
      players: "5,300",
      gradient: "from-indigo-700 via-purple-900 to-slate-950",
      icon: "🎲",
      action: () => setActiveGame("dice"),
    },
    {
      id: "crazy_777",
      title: "Crazy 777",
      category: "slots",
      subtitle: "ক্লাসিক ট্রিপল সেভেন জ্যাকপট",
      badge: "1000X",
      badgeColor: "bg-red-600",
      rtp: "96.4%",
      players: "5,120",
      gradient: "from-red-600 via-orange-800 to-slate-950",
      icon: "7️⃣",
      action: () => {
        setSelectedSlotId("crazy_777");
        setActiveGame("slots");
      },
    },
  ];

  const filteredGames = selectedCategory === "all" ? games : games.filter((g) => g.category === selectedCategory);

  return (
    <div className="grid grid-cols-2 gap-2.5 px-1 my-2">
      {filteredGames.map((game) => (
        <div
          key={game.id}
          onClick={() => {
            soundManager.playClick();
            game.action();
          }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${game.gradient} border border-white/10 hover:border-amber-400/50 p-3 shadow-lg cursor-pointer transition-all duration-200 transform hover:-translate-y-1 active:scale-95 group flex flex-col justify-between min-h-[135px]`}
        >
          {/* Top badges */}
          <div className="flex items-start justify-between">
            <span className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded-full ${game.badgeColor} shadow-sm`}>
              {game.badge}
            </span>
            <span className="text-2xl group-hover:scale-125 transition-transform duration-200 drop-shadow">
              {game.icon}
            </span>
          </div>

          {/* Title and details */}
          <div className="mt-2">
            <h3 className="text-sm font-black text-white tracking-tight drop-shadow-sm group-hover:text-amber-300 transition-colors">
              {game.title}
            </h3>
            <p className="text-[10px] text-slate-200 font-medium line-clamp-1 opacity-90 mt-0.5">
              {game.subtitle}
            </p>
          </div>

          {/* Bottom Live Stats & Play Button */}
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-slate-300">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>{game.players}</span>
            </div>

            <button className="flex items-center gap-1 px-2 py-0.8 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] shadow group-hover:bg-amber-300 transition">
              <Play className="w-2.5 h-2.5 fill-slate-950" />
              <span>প্লে</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
