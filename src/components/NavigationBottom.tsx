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

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] select-none">
      {/* Safe Area Container: White background extends all the way to bottom of phone screen */}
      <div className="max-w-md mx-auto relative pb-safe">
        <div className="h-[58px] relative">
          
          {/* Sliding Circular Ring & Curved Wings Indicator */}
          <div
            className="absolute -top-[14px] left-0 w-1/5 flex flex-col items-center pointer-events-none transition-transform duration-350 ease-[cubic-bezier(0.34,1.4,0.64,1)] z-10"
            style={{
              transform: `translate3d(${safeIndex * 100}%, 0, 0)`,
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Left Concave Wing (Mathematical Bezier Fillet) */}
              <svg
                className="w-4 h-4 absolute -left-3.5 bottom-[4px] text-white fill-current pointer-events-none drop-shadow-[0_-1px_1px_rgba(0,0,0,0.03)]"
                viewBox="0 0 16 16"
              >
                <path d="M0 16 C6 16, 12 10, 16 0 L16 16 Z" />
              </svg>

              {/* Elevated Circle with Black Border matching reference video */}
              <div className="w-[44px] h-[44px] rounded-full bg-white border-[2.5px] border-slate-900 shadow-sm flex items-center justify-center relative z-20" />

              {/* Right Concave Wing (Mathematical Bezier Fillet) */}
              <svg
                className="w-4 h-4 absolute -right-3.5 bottom-[4px] text-white fill-current pointer-events-none drop-shadow-[0_-1px_1px_rgba(0,0,0,0.03)]"
                viewBox="0 0 16 16"
              >
                <path d="M0 0 C4 10, 10 16, 16 16 L0 16 Z" />
              </svg>
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
                  className="relative flex flex-col items-center justify-center h-full tap-depress outline-none"
                  aria-label={tab.label}
                >
                  {/* Tab Icon: Smoothly lifts directly into the center of the circular ring when active */}
                  <div
                    className={`relative transition-all duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)] flex items-center justify-center ${
                      isActive
                        ? "-translate-y-3.5 text-slate-900 scale-105 z-30"
                        : "translate-y-0 text-slate-400 hover:text-slate-600 scale-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />

                    {/* Orders Badge: stays firmly attached to the Orders icon */}
                    {Boolean(tab.badgeCount && tab.badgeCount > 0) && (
                      <span
                        className={`absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs transition-transform ${
                          isActive ? "scale-90" : "animate-pulse"
                        }`}
                      >
                        {tab.badgeCount}
                      </span>
                    )}
                  </div>

                  {/* Tab Label: snugly placed right beneath the circle with NO awkward gap */}
                  <span
                    className={`text-[10px] tracking-tight transition-all duration-200 select-none mt-0.5 ${
                      isActive
                        ? "text-slate-900 font-extrabold translate-y-[-2px]"
                        : "text-slate-400 font-medium translate-y-0"
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
