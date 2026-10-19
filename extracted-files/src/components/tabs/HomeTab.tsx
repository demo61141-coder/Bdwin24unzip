"use client";

import React, { useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import JackpotTicker from "@/components/JackpotTicker";
import QuickActions from "@/components/QuickActions";
import CategoryNav, { CategoryKey } from "@/components/CategoryNav";
import GameGrid from "@/components/GameGrid";

export default function HomeTab() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");

  return (
    <div className="space-y-1 pb-16">
      <HeroBanner />
      <JackpotTicker />
      <QuickActions />
      <CategoryNav selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <GameGrid selectedCategory={selectedCategory} />
    </div>
  );
}
