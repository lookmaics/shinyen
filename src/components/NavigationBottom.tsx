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
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] select-none">
      {/* Safe Area Wrapper: Ensures solid white background extends all the way to bottom edge of screen */}
      <div className="max-w-md mx-auto relative pb-safe">
        <div className="h-[58px] relative">
          
          {/* Sliding Scooped Pit & Suspended Floating Circle */}
          <div
            className="absolute -top-[12px] left-0 w-1/5 flex flex-col items-center pointer-events-none transition-transform duration-350 ease-[cubic-bezier(0.34,1.4,0.64,1)] z-10"
            style={{
              transform: `translate3d(${safeIndex * 100}%, 0, 0)`,
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* The U-Shaped Scooped Pit Trench (Black background cavity carving into the white bar) */}
              <svg
                className="w-[76px] h-[48px] absolute top-0 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                viewBox="0 0 76 48"
              >
                <path
                  d="M 0 12 C 8 12, 12 16, 16 24 C 22 38, 28 46, 38 46 C 48 46, 54 38, 60 24 C 64 16, 68 12, 76 12 L 76 0 L 0 0 Z"
                  fill="#0f172a"
                />
              </svg>

              {/* Suspended White Circle with Bold Black Border (Floating in the pit with a 6px dark gap around it) */}
              <div className="w-[44px] h-[44px] rounded-full bg-white border-[3px] border-slate-900 shadow-md flex items-center justify-center relative z-20 mt-[2px]">
                {/* Active Icon with Energetic Spring Pop Micro-Animation */}
                <div
                  key={currentTab}
                  className="w-full h-full flex items-center justify-center animate-icon-pop"
                >
                  <ActiveIcon className="w-5 h-5 text-slate-900 stroke-[2.2]" />
                </div>

                {/* Orders Badge: attached to the circle when Orders tab is active */}
                {tabs[safeIndex].id === "orders" && Boolean(activeOrderCount && activeOrderCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {activeOrderCount}
                  </span>
                )}
              </div>
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
                  {/* Inactive Icon (Smoothly fades out on active tab because the suspended circle displays the active icon) */}
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

                  {/* Tab Label: Snugly positioned beneath the pit */}
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
