"use client";

import React from "react";
import { Store, Flame, PlusCircle, PackageCheck, User } from "lucide-react";
import { triggerHaptic } from "@/lib/utils";

export type NavTab = "store" | "drops" | "sell" | "orders" | "profile";

interface NavigationBottomProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeOrderCount?: number;
}

interface TabItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isHighlight?: boolean;
  isAccent?: boolean;
  badgeCount?: number;
}

export const NavigationBottom: React.FC<NavigationBottomProps> = ({
  currentTab,
  onSelectTab,
  activeOrderCount = 1,
}) => {
  const tabs: TabItem[] = [
    { id: "store", label: "Store", icon: Store },
    { id: "drops", label: "Live Drops", icon: Flame, isHighlight: true },
    { id: "sell", label: "Sell (+)", icon: PlusCircle, isAccent: true },
    { id: "orders", label: "Orders", icon: PackageCheck, badgeCount: activeOrderCount },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 pb-safe">
      <div className="max-w-md mx-auto px-3 h-14 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic(8);
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center w-14 py-1 active:scale-95 transition-all ${
                isActive ? "text-rose-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.isAccent ? (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center -mt-3 shadow-md shadow-rose-200">
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {Boolean(tab.badgeCount && tab.badgeCount > 0) && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {tab.badgeCount}
                    </span>
                  )}
                </div>
              )}
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? "font-bold text-rose-600" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
