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
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe pointer-events-none select-none">
      <div className="max-w-md mx-auto relative pointer-events-auto">
        {/* Main Bar Surface */}
        <div className="bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] h-16 relative">
          
          {/* Fluid Sliding Curved Notch & Elevated Bubble Container */}
          <div
            className="absolute -top-5 left-0 w-1/5 h-16 flex items-start justify-center pointer-events-none transition-transform duration-380 ease-[cubic-bezier(0.34,1.4,0.64,1)] z-10"
            style={{
              transform: `translate3d(${safeIndex * 100}%, 0, 0)`,
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Left Concave Wing (Mathematical Bezier Fillet) */}
              <svg
                className="w-4 h-4 absolute -left-3.5 bottom-1 text-white fill-current pointer-events-none drop-shadow-[0_-1px_1px_rgba(0,0,0,0.03)]"
                viewBox="0 0 18 18"
              >
                <path d="M0 18 C8 18, 14 12, 18 0 L18 18 Z" />
              </svg>

              {/* Elevated Floating Circular Bubble */}
              <div className="w-13 h-13 rounded-full bg-white shadow-[0_8px_20px_rgba(225,29,72,0.22)] border-[3px] border-white flex items-center justify-center ring-1 ring-slate-100/90 relative">
                {/* Glowing Active Core Badge */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-xs" />
              </div>

              {/* Right Concave Wing (Mathematical Bezier Fillet) */}
              <svg
                className="w-4 h-4 absolute -right-3.5 bottom-1 text-white fill-current pointer-events-none drop-shadow-[0_-1px_1px_rgba(0,0,0,0.03)]"
                viewBox="0 0 18 18"
              >
                <path d="M0 0 C4 12, 10 18, 18 18 L0 18 Z" />
              </svg>
            </div>
          </div>

          {/* Interactive Tab Buttons (5-column grid) */}
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
                  {/* Floating Icon: Lifts up into the elevated circle when active */}
                  <div
                    className={`relative transition-all duration-380 ease-[cubic-bezier(0.34,1.4,0.64,1)] flex items-center justify-center ${
                      isActive
                        ? "-translate-y-5.5 text-white scale-110 z-30"
                        : "translate-y-0 text-slate-400 hover:text-slate-600 scale-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />

                    {/* Order Badge Count */}
                    {Boolean(tab.badgeCount && tab.badgeCount > 0) && (
                      <span
                        className={`absolute -top-1 -right-2 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-slate-900 shadow-xs"
                            : "bg-rose-600 animate-pulse shadow-xs"
                        }`}
                      >
                        {tab.badgeCount}
                      </span>
                    )}
                  </div>

                  {/* Label: sits anchored below */}
                  <span
                    className={`text-[10px] tracking-tight transition-all duration-200 mt-0.5 select-none ${
                      isActive
                        ? "text-rose-600 font-extrabold translate-y-0"
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
