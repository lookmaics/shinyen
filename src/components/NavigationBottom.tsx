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
  badgeCount?: number;
}

export const NavigationBottom: React.FC<NavigationBottomProps> = ({
  currentTab,
  onSelectTab,
  activeOrderCount = 1,
}) => {
  const tabs: TabItem[] = [
    { id: "store", label: "Store", icon: Store },
    { id: "drops", label: "Drops", icon: Flame },
    { id: "sell", label: "Sell", icon: PlusCircle },
    { id: "orders", label: "Orders", icon: PackageCheck, badgeCount: activeOrderCount },
    { id: "profile", label: "Profile", icon: User },
  ];

  const activeIndex = tabs.findIndex((t) => t.id === currentTab);
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;
  const ActiveIcon = tabs[safeIndex].icon;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe pointer-events-none select-none">
      <div className="max-w-md mx-auto relative pointer-events-auto">
        {/* Solid White Navigation Bar Surface */}
        <div className="bg-white border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] h-[62px] relative">
          
          {/* Fluid Sliding Curved Dome + Elevated Circular Ring */}
          <div
            className="absolute -top-[18px] left-0 w-1/5 flex flex-col items-center pointer-events-none transition-transform duration-350 ease-[cubic-bezier(0.34,1.4,0.64,1)] z-10"
            style={{
              transform: `translate3d(${safeIndex * 100}%, 0, 0)`,
            }}
          >
            {/* White Bezier Dome Wings (Seamless transition from the flat bar to the circular dome) */}
            <svg
              className="w-[92px] h-[22px] absolute top-0 text-white fill-current pointer-events-none drop-shadow-[0_-1px_1px_rgba(0,0,0,0.03)]"
              viewBox="0 0 100 24"
              preserveAspectRatio="none"
            >
              <path d="M0 24 C16 24, 22 8, 32 3 C 42 -1, 58 -1, 68 3 C 78 8, 84 24, 100 24 Z" />
            </svg>

            {/* Elevated Circle with Black Border (Matching Reference Video) */}
            <div className="w-[48px] h-[48px] rounded-full bg-white border-[2.5px] border-slate-900 shadow-sm flex items-center justify-center relative z-20 mt-[1px]">
              <ActiveIcon className="w-5 h-5 text-slate-900 stroke-[2.2]" />

              {/* Active Badge on Circle for Orders */}
              {tabs[safeIndex].id === "orders" && Boolean(activeOrderCount && activeOrderCount > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {activeOrderCount}
                </span>
              )}
            </div>
          </div>

          {/* 5-Column Grid of Interactive Tab Buttons */}
          <div className="grid grid-cols-5 h-full relative z-20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic(10);
                    onSelectTab(tab.id);
                  }}
                  className="relative flex flex-col items-center justify-end pb-2 pt-1 h-full tap-depress outline-none"
                  aria-label={tab.label}
                >
                  {/* Inactive Icon (Fades out when active so the icon inside the elevated circle takes over) */}
                  <div
                    className={`transition-all duration-200 flex items-center justify-center mb-1 relative ${
                      isActive
                        ? "opacity-0 scale-75 pointer-events-none"
                        : "opacity-100 scale-100 text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[1.8]" />

                    {/* Inactive Orders Badge */}
                    {!isActive && tab.id === "orders" && Boolean(activeOrderCount && activeOrderCount > 0) && (
                      <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                        {activeOrderCount}
                      </span>
                    )}
                  </div>

                  {/* Tab Label */}
                  <span
                    className={`text-[10px] tracking-tight transition-colors duration-200 select-none ${
                      isActive
                        ? "text-slate-900 font-extrabold"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
