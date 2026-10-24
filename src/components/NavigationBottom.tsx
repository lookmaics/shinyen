"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/utils";

export type NavTab = "store" | "drops" | "sell" | "orders" | "profile";

interface NavigationBottomProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeOrderCount?: number;
}

interface AnimatedIconProps {
  isActive: boolean;
  className?: string;
}

/**
 * 1. STORE ICON: Boutique Storefront Entrance
 * Path-level micro-animation: Store base rises firmly while the scalloped
 * market awning drops from above and unfurls with an elastic bounce.
 */
const StoreAnimatedIcon: React.FC<AnimatedIconProps> = ({ isActive, className }) => {
  const strokeWidth = isActive ? 2.15 : 1.8;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Storefront Base Walls & Doorway */}
      <path
        d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"
        className={isActive ? "animate-store-base" : ""}
      />
      {/* Boutique Entrance Door Arch */}
      <path
        d="M9.5 21v-5.5a2.5 2.5 0 0 1 5 0V21"
        className={isActive ? "animate-store-base" : ""}
      />
      {/* Scalloped Boutique Awning / Canopy Roof (Drops & bounces onto building) */}
      <path
        d="M3 7.5 4.8 3.6A1.5 1.5 0 0 1 6.16 3h11.68a1.5 1.5 0 0 1 1.36.6L21 7.5c0 2-1.5 3.5-3.2 3.5-1.5 0-2.6-.9-2.8-2-.2 1.1-1.3 2-3 2s-2.8-.9-3-2c-.2 1.1-1.3 2-2.8 2C4.5 11 3 9.5 3 7.5Z"
        className={isActive ? "animate-store-awning" : ""}
      />
    </svg>
  );
};

/**
 * 2. DROPS ICON: Dual-Path Live Auction Flame
 * Path-level micro-animation: Outer flame springs upward with an organic
 * rotational flicker while the inner core tongue dances in counter-phase.
 */
const DropsAnimatedIcon: React.FC<AnimatedIconProps> = ({ isActive, className }) => {
  const strokeWidth = isActive ? 2.15 : 1.8;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Outer Flame Silhouette */}
      <path
        d="M12 2.5c1.5 3.2 4.5 5.3 5.7 8.4a6.8 6.8 0 0 1-11.4 6.6c-1.5-2.1-1.6-5.2-.1-7.6.7 1.3 1.9 2 2.6 2.1-.4-2.8 1-6.5 3.2-9.5Z"
        className={isActive ? "animate-flame-outer" : ""}
      />
      {/* Inner Flame Core Tongue */}
      <path
        d="M12 13.2c1.1 1.1 1.8 2.2 1.5 3.5a2.1 2.1 0 0 1-3.5 1.1c-.5-.8-.4-1.9.3-2.8.5-.6 1.1-1.1 1.7-1.8Z"
        fill={isActive ? "currentColor" : "none"}
        fillOpacity={isActive ? 0.22 : 0}
        className={isActive ? "animate-flame-inner" : ""}
      />
    </svg>
  );
};

/**
 * 3. SELL / ADD ICON: Precision Geometric Plus (+)
 * Matches reference recording (0:02–0:03): Pure geometric cross inside the
 * suspended active circle, rotating 90° with a high-tension spring snap.
 */
const SellAnimatedIcon: React.FC<AnimatedIconProps> = ({ isActive, className }) => {
  const strokeWidth = isActive ? 2.35 : 1.9;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className || ""} ${isActive ? "animate-sell-plus" : ""}`}
    >
      {/* Subtle outer halo ring only when inactive so active state is a pure crisp '+' inside the 44px disc */}
      {!isActive && (
        <circle cx="12" cy="12" r="8.5" strokeWidth={1.65} className="opacity-85" />
      )}
      {/* Vertical Axis */}
      <path d={isActive ? "M12 5.25v13.5" : "M12 8.5v7"} />
      {/* Horizontal Axis */}
      <path d={isActive ? "M5.25 12h13.5" : "M8.5 12h7"} />
    </svg>
  );
};

/**
 * 4. ORDERS ICON: Parcel Box + Bouncing Lid + Self-Drawing Checkmark
 * Path-level micro-animation: Box base compresses and rebounds, lid flaps
 * pop open from above and snap shut, and verification check draws itself.
 */
const OrdersAnimatedIcon: React.FC<AnimatedIconProps> = ({ isActive, className }) => {
  const strokeWidth = isActive ? 2.1 : 1.8;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Parcel Lower Body */}
      <path
        d="M3.5 8.5v8.2a2.2 2.2 0 0 0 1.2 2l6.3 3.1a2.2 2.2 0 0 0 2 0l6.3-3.1a2.2 2.2 0 0 0 1.2-2V8.5"
        className={isActive ? "animate-box-base" : ""}
      />
      {/* Parcel Top Lid Flaps & Seam (Pops up and snaps onto box) */}
      <g className={isActive ? "animate-box-lid" : ""}>
        <path d="m3.7 8.2 7.3-4.1a2.1 2.1 0 0 1 2 0l7.3 4.1-7.3 4.1a2.1 2.1 0 0 1-2 0L3.7 8.2Z" />
        <path d="m7.5 6.1 8.8 4.2" />
      </g>
      {/* Escrow Verification Checkmark on Front Face */}
      <path
        d="m9.2 15.6 2 2 3.8-3.8"
        className={isActive ? "animate-box-check" : ""}
      />
    </svg>
  );
};

/**
 * 5. PROFILE ICON: Elastic Head Drop onto Torso
 * Matches reference recording (0:00–0:01): Head circle drops from above and
 * bounces elastically onto the shoulders while the torso settles underneath.
 */
const ProfileAnimatedIcon: React.FC<AnimatedIconProps> = ({ isActive, className }) => {
  const strokeWidth = isActive ? 2.2 : 1.85;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Head Circle: Drops from above & bounces elastically onto torso */}
      <circle
        cx="12"
        cy="8"
        r="4"
        className={isActive ? "animate-profile-head" : ""}
      />
      {/* Shoulders / Torso Arch: Absorbs impact & rebounds */}
      <path
        d="M5.2 20v-1.2a6.8 6.8 0 0 1 13.6 0V20"
        className={isActive ? "animate-profile-torso" : ""}
      />
    </svg>
  );
};

interface TabItem {
  id: NavTab;
  label: string;
  IconComponent: React.FC<AnimatedIconProps>;
  badgeCount?: number;
}

export const NavigationBottom: React.FC<NavigationBottomProps> = ({
  currentTab,
  onSelectTab,
  activeOrderCount = 1,
}) => {
  const tabs: TabItem[] = [
    { id: "store", label: "Store", IconComponent: StoreAnimatedIcon },
    { id: "drops", label: "Drops", IconComponent: DropsAnimatedIcon },
    { id: "sell", label: "Sell", IconComponent: SellAnimatedIcon },
    {
      id: "orders",
      label: "Orders",
      IconComponent: OrdersAnimatedIcon,
      badgeCount: activeOrderCount,
    },
    { id: "profile", label: "Profile", IconComponent: ProfileAnimatedIcon },
  ];

  const activeIndex = tabs.findIndex((t) => t.id === currentTab);
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;
  const ActiveTabItem = tabs[safeIndex];
  const ActiveIcon = ActiveTabItem.IconComponent;

  return (
    <nav
      aria-label="Primary Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-none select-none"
    >
      <div className="max-w-md mx-auto relative pointer-events-auto">
        {/* Main 64px Interactive Bar Height */}
        <div className="h-[64px] relative">
          {/* ================================================================ */}
          {/* LAYER 1: SCULPTED LIGHT-MODE SCOOP SURFACE & SUSPENDED CIRCLE    */}
          {/* -top-[28px] gives vertical headroom for the floating circle and  */}
          {/* upward ambient shadow while clipping wings cleanly to max-w-md.  */}
          {/* ================================================================ */}
          <div className="absolute -top-[28px] inset-x-0 bottom-0 overflow-hidden pointer-events-none z-10">
            <div className="relative w-full h-[64px] mt-[28px] nav-scoop-elevation">
              <motion.div
                className="absolute top-0 bottom-0 left-0 w-1/5 flex justify-center"
                initial={false}
                animate={{ x: `${safeIndex * 100}%` }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                  mass: 0.8,
                }}
              >
                {/* 96px Wide Center Scoop & Floating Circle Unit */}
                <div className="relative w-[96px] h-[64px] shrink-0">
                  {/* Left Solid White Bar Wing (Overlaps 1px to prevent subpixel seam) */}
                  <div className="absolute top-0 bottom-0 right-[95px] w-[100vw] bg-white border-t-[1.25px] border-slate-200/90" />

                  {/* Right Solid White Bar Wing (Overlaps 1px to prevent subpixel seam) */}
                  <div className="absolute top-0 bottom-0 left-[95px] w-[100vw] bg-white border-t-[1.25px] border-slate-200/90" />

                  {/* Center 96x64 Sculpted Light-Mode Scoop SVG */}
                  <svg
                    className="w-[96px] h-[64px] block overflow-visible"
                    viewBox="0 0 96 64"
                    fill="none"
                    aria-hidden="true"
                  >
                    <defs>
                      {/* Subtle Light-Mode Concave Recess Tint so the airy 10px clearance moat is legible even over pure white feeds */}
                      <linearGradient id="shinyenScoopRecess" x1="48" y1="0" x2="48" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.15" />
                        <stop offset="55%" stopColor="#e2e8f0" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.45" />
                      </linearGradient>
                    </defs>

                    {/* 1. Whisper-Soft Concave Moat Recess inside the U-Scoop */}
                    <path
                      d="M 0 0.625 C 12 0.625, 15.5 6, 19 16.5 C 23.5 30, 32.5 39.5, 48 39.5 C 63.5 39.5, 72.5 30, 77 16.5 C 80.5 6, 84 0.625, 96 0.625 Z"
                      fill="url(#shinyenScoopRecess)"
                    />

                    {/* 2. Solid White Bar Body Below the U-Scoop Cutout */}
                    <path
                      d="M -1 0.625 L 0 0.625 C 12 0.625, 15.5 6, 19 16.5 C 23.5 30, 32.5 39.5, 48 39.5 C 63.5 39.5, 72.5 30, 77 16.5 C 80.5 6, 84 0.625, 96 0.625 L 97 0.625 L 97 65 L -1 65 Z"
                      fill="#ffffff"
                    />

                    {/* 3. Continuous Hairline Border Tracing the Scooped Top Edge */}
                    <path
                      d="M 0 0.625 C 12 0.625, 15.5 6, 19 16.5 C 23.5 30, 32.5 39.5, 48 39.5 C 63.5 39.5, 72.5 30, 77 16.5 C 80.5 6, 84 0.625, 96 0.625"
                      stroke="#e2e8f0"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* ========================================================== */}
                  {/* SUSPENDED 44x44 ACTIVE CIRCLE (10px Radial Scoop Clearance)*/}
                  {/* Circle sits at y = -15px..+29px; Scoop bottom is y = 39.5px */}
                  {/* ========================================================== */}
                  <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 w-[44px] h-[44px] z-20">
                    <div
                      key={currentTab}
                      className="w-full h-full rounded-full bg-white border-[2.25px] border-slate-900 shadow-[0_6px_16px_-2px_rgba(15,23,42,0.14),0_2px_6px_-1px_rgba(15,23,42,0.08)] flex items-center justify-center relative animate-circle-pop"
                    >
                      <ActiveIcon
                        isActive={true}
                        className="w-[21px] h-[21px] text-slate-900"
                      />

                      {/* Active Tab Orders Notification Badge */}
                      <AnimatePresence>
                        {ActiveTabItem.id === "orders" &&
                          Boolean(activeOrderCount && activeOrderCount > 0) && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 520,
                                damping: 16,
                                mass: 0.5,
                              }}
                              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs"
                            >
                              {activeOrderCount}
                            </motion.span>
                          )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* LAYER 2: 5-COLUMN ACCESSIBLE INTERACTIVE BUTTON MATRIX           */}
          {/* ================================================================ */}
          <div className="grid grid-cols-5 h-full relative z-20">
            {tabs.map((tab) => {
              const Icon = tab.IconComponent;
              const isActive = currentTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  transition={{
                    type: "spring",
                    stiffness: 550,
                    damping: 22,
                    mass: 0.5,
                  }}
                  onClick={() => {
                    triggerHaptic(10);
                    onSelectTab(tab.id);
                  }}
                  aria-label={tab.label}
                  aria-current={isActive ? "page" : undefined}
                  className="group relative flex flex-col items-center justify-end pb-[7px] pt-1.5 h-full outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-inset rounded-xl"
                >
                  {/* Inactive Icon Slot (Smoothly yields to the suspended circle when active) */}
                  <motion.div
                    initial={false}
                    animate={
                      isActive
                        ? { opacity: 0, scale: 0.65, y: -6 }
                        : { opacity: 1, scale: 1, y: 0 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 24,
                      mass: 0.6,
                    }}
                    className={`relative flex items-center justify-center mb-[6px] ${
                      isActive
                        ? "pointer-events-none"
                        : "text-slate-400 group-hover:text-slate-700 group-hover:-translate-y-[1px] transition-colors duration-150"
                    }`}
                  >
                    <Icon isActive={false} className="w-[21px] h-[21px]" />

                    {/* Inactive Orders Notification Badge */}
                    {!isActive &&
                      tab.id === "orders" &&
                      Boolean(activeOrderCount && activeOrderCount > 0) && (
                        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs">
                          {activeOrderCount}
                        </span>
                      )}
                  </motion.div>

                  {/* Tab Label: Positioned cleanly below the 39.5px scoop basin */}
                  <motion.span
                    initial={false}
                    animate={
                      isActive
                        ? { y: 0, scale: 1.02 }
                        : { y: 0, scale: 1 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 24,
                      mass: 0.6,
                    }}
                    className={`text-[10px] leading-none tracking-tight transition-colors duration-150 ${
                      isActive
                        ? "text-slate-900 font-extrabold"
                        : "text-slate-400 font-semibold group-hover:text-slate-600"
                    }`}
                  >
                    {tab.label}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Solid White Safe-Area Inset Footer for iOS Home Indicator */}
        <div className="w-full bg-white pb-safe" />
      </div>
    </nav>
  );
};
