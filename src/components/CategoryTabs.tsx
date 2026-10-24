"use client";

import React from "react";
import { triggerHaptic } from "@/lib/utils";
import { Sparkles, Shirt, Gem, Palette, Trees } from "lucide-react";

export type CategoryFilter = "all" | "thrift" | "jewellery" | "handloom" | "lifestyle";

interface CategoryTabsProps {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}

const categories = [
  { id: "all", label: "All Items", icon: Sparkles },
  { id: "thrift", label: "Curated Thrift", icon: Shirt },
  { id: "handloom", label: "Handloom Attire", icon: Palette },
  { id: "jewellery", label: "Handmade Jewels", icon: Gem },
  { id: "lifestyle", label: "Kauna & Crafts", icon: Trees },
] as const;

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full bg-white border-b border-slate-100 sticky top-header-safe z-30">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selected === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic(8);
                onSelect(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all tap-depress ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
