"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoutiqueStory } from "@/types";
import { triggerHaptic } from "@/lib/utils";
import { useModalBackstack } from "@/hooks/useBackstack";
import {
  X,
  Flame,
  Sparkles,
  Eye,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  ShoppingBag,
  Star,
  MapPin,
  Heart,
} from "lucide-react";

interface StoriesCarouselProps {
  stories: BoutiqueStory[];
  onSelectStoryProduct?: (productId: string) => void;
}

interface ThemeTokens {
  stageBg: string;
  ribbonStroke: string;
  ribbonGlow: string;
  ratingOrbBg: string;
  ratingOrbText: string;
  badgeBg: string;
  badgeText: string;
  primaryCtaBg: string;
  ringAccent: string;
}

const THEME_MAP: Record<NonNullable<BoutiqueStory["accentTheme"]>, ThemeTokens> = {
  crimson: {
    stageBg: "from-rose-50/90 via-orange-50/40 to-slate-50/90",
    ribbonStroke: "#fda4af", // rose-300
    ribbonGlow: "rgba(225, 29, 72, 0.10)",
    ratingOrbBg: "bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200",
    ratingOrbText: "text-slate-900",
    badgeBg: "bg-rose-600 text-white",
    badgeText: "text-rose-700",
    primaryCtaBg: "bg-slate-900 hover:bg-slate-800 text-white",
    ringAccent: "ring-rose-500/30",
  },
  amber: {
    stageBg: "from-amber-50/90 via-yellow-50/40 to-slate-50/90",
    ribbonStroke: "#fcd34d", // amber-300
    ribbonGlow: "rgba(217, 119, 6, 0.10)",
    ratingOrbBg: "bg-gradient-to-br from-amber-200 via-yellow-200 to-orange-200",
    ratingOrbText: "text-slate-900",
    badgeBg: "bg-amber-600 text-white",
    badgeText: "text-amber-800",
    primaryCtaBg: "bg-slate-900 hover:bg-slate-800 text-white",
    ringAccent: "ring-amber-500/35",
  },
  emerald: {
    stageBg: "from-emerald-50/85 via-teal-50/40 to-slate-50/90",
    ribbonStroke: "#6ee7b7", // emerald-300
    ribbonGlow: "rgba(5, 150, 105, 0.10)",
    ratingOrbBg: "bg-gradient-to-br from-emerald-200 via-teal-200 to-amber-100",
    ratingOrbText: "text-slate-900",
    badgeBg: "bg-emerald-700 text-white",
    badgeText: "text-emerald-800",
    primaryCtaBg: "bg-slate-900 hover:bg-slate-800 text-white",
    ringAccent: "ring-emerald-500/30",
  },
  indigo: {
    stageBg: "from-indigo-50/85 via-sky-50/45 to-slate-50/90",
    ribbonStroke: "#93c5fd", // blue-300
    ribbonGlow: "rgba(37, 99, 235, 0.10)",
    ratingOrbBg: "bg-gradient-to-br from-sky-200 via-indigo-200 to-amber-100",
    ratingOrbText: "text-slate-900",
    badgeBg: "bg-indigo-600 text-white",
    badgeText: "text-indigo-800",
    primaryCtaBg: "bg-slate-900 hover:bg-slate-800 text-white",
    ringAccent: "ring-indigo-500/30",
  },
};

// 3D Orbital Platter Motion Variants (mirrors the sweeping circular plate motion in reference video)
const platterVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? -68 : 68,
    y: direction >= 0 ? -36 : 36,
    rotate: direction >= 0 ? -38 : 38,
    rotateY: direction >= 0 ? -22 : 22,
    scale: 0.72,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    rotate: 0,
    rotateY: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 310,
      damping: 26,
      mass: 0.85,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -56 : 56,
    y: direction >= 0 ? 42 : -42,
    rotate: direction >= 0 ? 32 : -32,
    rotateY: direction >= 0 ? 18 : -18,
    scale: 0.74,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 28,
      mass: 0.75,
    },
  }),
};

// Staggered Split-Weight Kinetic Headline Variants
const headlineContainerVariants = {
  enter: {},
  center: {
    transition: {
      staggerChildren: 0.045,
    },
  },
  exit: {},
};

const kineticLineVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 34 : -34,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 28,
      mass: 0.7,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -28 : 28,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.16,
      ease: [0.32, 0, 0.67, 0],
    },
  }),
};

export const StoriesCarousel: React.FC<StoriesCarouselProps> = ({
  stories,
  onSelectStoryProduct,
}) => {
  // Spotlight Stage Active Boutique State
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [seenIds, setSeenIds] = useState<Record<string, boolean>>({});
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  // Full-Screen Story Modal State
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reminderSubscribed, setReminderSubscribed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Horizontal Touch Swipe Tracking for the Spotlight Stage
  const stageTouchStartX = useRef<number | null>(null);
  const stageTouchStartY = useRef<number | null>(null);

  const safeSelectedIndex =
    stories.length > 0 ? Math.min(selectedIndex, stories.length - 1) : 0;
  const featuredStory = stories[safeSelectedIndex];
  const activeModalStory =
    activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleCloseStory = () => {
    triggerHaptic(6);
    setActiveStoryIndex(null);
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Mobile Backstack Sync: dismiss full-screen story on swipe-back gesture
  useModalBackstack("story-viewer", activeStoryIndex !== null, handleCloseStory);

  // Auto-progress timer for full-screen Instagram-style 5s story experience
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    setProgress(0);
    const intervalTime = 50; // update progress every 50ms
    const step = 100 / (5000 / intervalTime); // 5 seconds total

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            const nextIdx = activeStoryIndex + 1;
            setActiveStoryIndex(nextIdx);
            setSelectedIndex(nextIdx);
            if (stories[nextIdx]) {
              setSeenIds((s) => ({ ...s, [stories[nextIdx].id]: true }));
            }
            return 0;
          } else {
            handleCloseStory();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoryIndex, isPaused, stories]);

  if (!featuredStory || stories.length === 0) return null;

  const theme =
    THEME_MAP[featuredStory.accentTheme || "crimson"] || THEME_MAP.crimson;

  // Select a boutique in the Dock (or launch story if already active)
  const handleSelectDockItem = (index: number) => {
    if (index === safeSelectedIndex) {
      // Tapping the already-active capsule launches the full-screen Story Viewer
      handleOpenStoryModal(index);
      return;
    }
    triggerHaptic(10);
    setDirection(index > safeSelectedIndex ? 1 : -1);
    setSelectedIndex(index);
  };

  // Step Prev / Next on the Spotlight Stage
  const handleCycleStage = (delta: number) => {
    triggerHaptic(8);
    setDirection(delta >= 0 ? 1 : -1);
    setSelectedIndex((prev) => {
      const next = (prev + delta + stories.length) % stories.length;
      return next;
    });
  };

  // Launch Full-Screen Story Modal
  const handleOpenStoryModal = (index: number) => {
    triggerHaptic(12);
    const story = stories[index];
    if (story) {
      setSeenIds((prev) => ({ ...prev, [story.id]: true }));
    }
    setSelectedIndex(index);
    setActiveStoryIndex(index);
    setProgress(0);
    setReminderSubscribed(false);
  };

  const handlePrevModalStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      triggerHaptic(8);
      const prevIdx = activeStoryIndex - 1;
      setActiveStoryIndex(prevIdx);
      setSelectedIndex(prevIdx);
      setProgress(0);
    }
  };

  const handleNextModalStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      triggerHaptic(8);
      const nextIdx = activeStoryIndex + 1;
      setActiveStoryIndex(nextIdx);
      setSelectedIndex(nextIdx);
      setProgress(0);
    } else {
      handleCloseStory();
    }
  };

  // Touch Swipe Handlers for the Stage
  const handleStageTouchStart = (e: React.TouchEvent) => {
    stageTouchStartX.current = e.touches[0].clientX;
    stageTouchStartY.current = e.touches[0].clientY;
  };

  const handleStageTouchEnd = (e: React.TouchEvent) => {
    if (stageTouchStartX.current === null || stageTouchStartY.current === null)
      return;
    const dx = e.changedTouches[0].clientX - stageTouchStartX.current;
    const dy = e.changedTouches[0].clientY - stageTouchStartY.current;
    stageTouchStartX.current = null;
    stageTouchStartY.current = null;

    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        handleCycleStage(1);
      } else {
        handleCycleStage(-1);
      }
    }
  };

  const isFeaturedLiveAuction = featuredStory.type === "live_auction";
  const isFeaturedArtisan = featuredStory.type === "artisan_craft";

  return (
    <section
      aria-label="Boutique Spotlight Stage and Stories"
      className="w-full pt-2.5 pb-3 bg-white border-b border-slate-100 select-none overflow-hidden"
    >
      <div className="max-w-md mx-auto px-3.5">
        {/* ================================================================ */}
        {/* TOP HEADER ROW: BOUTIQUE SPOTLIGHT STAGE INDICATOR               */}
        {/* ================================================================ */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
            </span>
            <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">
              Boutique Spotlight
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200/70">
              {featuredStory.meeteiScript || "ꯁꯤꯟꯌꯦꯟ"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenStoryModal(safeSelectedIndex)}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 tap-depress"
          >
            <span>24h Stories ({safeSelectedIndex + 1}/{stories.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ================================================================ */}
        {/* UNIFIED SPATIAL STAGE CARD (HERO SHOWCASE + SLIDING DOCK)        */}
        {/* ================================================================ */}
        <div
          onTouchStart={handleStageTouchStart}
          onTouchEnd={handleStageTouchEnd}
          className={`relative rounded-[26px] bg-gradient-to-br ${theme.stageBg} border border-slate-200/80 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.08)] overflow-hidden transition-colors duration-500`}
        >
          {/* Sweeping Architectural Ribbon SVG (Mirrors the curved wall ribbon in reference video) */}
          <svg
            viewBox="0 0 400 260"
            fill="none"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-75"
            preserveAspectRatio="none"
          >
            <motion.path
              initial={false}
              animate={{
                stroke: theme.ribbonStroke,
                d:
                  safeSelectedIndex % 2 === 0
                    ? "M -30 165 C 75 155, 130 25, 255 15 C 335 8, 385 55, 430 45"
                    : "M -30 45 C 85 35, 145 145, 265 135 C 345 128, 385 25, 430 15",
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 26,
              }}
              strokeWidth="42"
              strokeLinecap="round"
              strokeOpacity="0.32"
            />
          </svg>

          {/* ============================================================== */}
          {/* UPPER STAGE: 3D ORBITAL PLATTER + EDITORIAL TYPOGRAPHY & CARD  */}
          {/* ============================================================== */}
          <div className="relative z-10 px-3.5 pt-3.5 pb-2.5 grid grid-cols-12 gap-3 items-center">
            {/* LEFT COLUMN (5 cols): 3D ORBITAL CIRCULAR HERO SHOWCASE */}
            <div className="col-span-5 flex flex-col items-center justify-center perspective-stage">
              <div className="relative w-[132px] h-[132px] sm:w-[140px] sm:h-[140px] flex items-center justify-center">
                {/* Ambient Glow Halo Underneath Platter */}
                <div
                  className="absolute inset-2 rounded-full blur-xl transition-colors duration-500 pointer-events-none"
                  style={{ backgroundColor: theme.ribbonGlow }}
                />

                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.button
                    key={featuredStory.id}
                    type="button"
                    custom={direction}
                    variants={platterVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenStoryModal(safeSelectedIndex)}
                    aria-label={`Watch ${featuredStory.sellerName || featuredStory.sellerHandle} story`}
                    className={`group relative w-[128px] h-[128px] sm:w-[136px] sm:h-[136px] rounded-full p-1.5 bg-white spotlight-platter-shadow ring-2 ${theme.ringAccent} focus:outline-hidden cursor-pointer`}
                  >
                    {/* Circular Dish / Product Showcase Image */}
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100">
                      <img
                        src={featuredStory.mediaUrl}
                        alt={featuredStory.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                        draggable={false}
                      />

                      {/* Subtle Radial Vignette for Depth */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/15 pointer-events-none" />

                      {/* Interactive Play Story Glass Button in Bottom-Right of Platter */}
                      <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/55 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                        <Play className="w-3 h-3 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Top-Left Live / Loom Floating Pill on Platter Rim */}
                    <div
                      className={`absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap border border-white/60 flex items-center gap-1 ${theme.badgeBg}`}
                    >
                      {isFeaturedLiveAuction ? (
                        <>
                          <Flame className="w-2.5 h-2.5 fill-current" />
                          <span>Live Drop</span>
                        </>
                      ) : isFeaturedArtisan ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Handloom</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>New Craft</span>
                        </>
                      )}
                    </div>

                    {/* Bottom-Left Boutique Seller Avatar Coin */}
                    <div className="absolute bottom-0.5 left-0.5 w-8 h-8 rounded-full p-0.5 bg-white shadow-md ring-1 ring-slate-900/10">
                      <img
                        src={featuredStory.sellerAvatar}
                        alt={featuredStory.sellerHandle}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </motion.button>
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT COLUMN (7 cols): SPLIT TYPOGRAPHY + ARTISAN RATING CARD + DUAL CTAs */}
            <div className="col-span-7 flex flex-col justify-between min-w-0">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={featuredStory.id}
                  custom={direction}
                  variants={headlineContainerVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-2"
                >
                  {/* 1. Rank Overline & Location Tag */}
                  <motion.div
                    custom={direction}
                    variants={kineticLineVariants}
                    className="flex items-center justify-between gap-1"
                  >
                    <span className="text-[10px] font-bold text-slate-500 tracking-tight truncate">
                      {featuredStory.rankLabel || "#1 Featured Drop"}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-500 truncate">
                      <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                      {featuredStory.location?.split(",")[0] || "Imphal"}
                    </span>
                  </motion.div>

                  {/* 2. Split-Weight Kinetic Editorial Headline (Matches Reference Video) */}
                  <div
                    onClick={() => handleOpenStoryModal(safeSelectedIndex)}
                    className="cursor-pointer group"
                  >
                    <motion.div
                      custom={direction}
                      variants={kineticLineVariants}
                      className="text-xs sm:text-[13px] font-light tracking-[0.18em] text-slate-600 uppercase leading-tight truncate"
                    >
                      {featuredStory.headlineLight ||
                        featuredStory.sellerHandle.toUpperCase()}
                    </motion.div>
                    <motion.h3
                      custom={direction}
                      variants={kineticLineVariants}
                      className="text-[19px] sm:text-[21px] font-black tracking-tight text-slate-900 uppercase leading-[1.05] truncate group-hover:text-rose-700 transition-colors"
                    >
                      {featuredStory.headlineBold || "FEATURED DROP"}
                    </motion.h3>
                  </div>

                  {/* 3. Frosted Glass Artisan Rating & Overview Card (Matches 4.9 Chef Card in Video) */}
                  <motion.div
                    custom={direction}
                    variants={kineticLineVariants}
                    className="p-2 rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.07)] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Glowing Rating Badge Orb */}
                      <div
                        className={`w-9 h-9 rounded-xl ${theme.ratingOrbBg} ${theme.ratingOrbText} flex flex-col items-center justify-center shrink-0 shadow-2xs border border-white/70`}
                      >
                        <span className="text-xs font-black leading-none tracking-tighter">
                          {(featuredStory.rating || 4.9).toFixed(1)}
                        </span>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        </div>
                      </div>

                      {/* Boutique Name & Price/Social Proof */}
                      <div className="min-w-0">
                        <div className="text-[11px] font-extrabold text-slate-900 truncate leading-tight">
                          {featuredStory.sellerName || `@${featuredStory.sellerHandle}`}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                          <span className="font-extrabold text-rose-600">
                            {featuredStory.priceLabel || "Live Drop"}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {featuredStory.socialProof || "Verified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Micro-Like Heart Pill */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic(8);
                        setLikedIds((prev) => ({
                          ...prev,
                          [featuredStory.id]: !prev[featuredStory.id],
                        }));
                      }}
                      aria-label="Bookmark boutique drop"
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all tap-depress ${
                        likedIds[featuredStory.id]
                          ? "bg-rose-50 border-rose-200 text-rose-600"
                          : "bg-slate-50 border-slate-200/70 text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          likedIds[featuredStory.id] ? "fill-rose-600 text-rose-600" : ""
                        }`}
                      />
                    </button>
                  </motion.div>

                  {/* 4. Dual Action Row: "▶ Watch Story" & "⚡ View Piece" (Matches Video) */}
                  <motion.div
                    custom={direction}
                    variants={kineticLineVariants}
                    className="flex items-center gap-1.5 pt-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenStoryModal(safeSelectedIndex)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 border border-slate-200/90 shadow-2xs text-[11px] font-extrabold flex items-center justify-center gap-1.5 tap-depress transition-all"
                    >
                      <Play className="w-3 h-3 fill-slate-900 text-slate-900 shrink-0" />
                      <span className="truncate">Watch Story</span>
                    </button>

                    {featuredStory.productId && (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(12);
                          if (featuredStory.productId) {
                            onSelectStoryProduct?.(featuredStory.productId);
                          }
                        }}
                        className={`flex-1 py-1.5 px-2.5 rounded-xl ${theme.primaryCtaBg} shadow-xs text-[11px] font-extrabold flex items-center justify-center gap-1 tap-depress transition-all`}
                      >
                        <ShoppingBag className="w-3 h-3 text-amber-300 shrink-0" />
                        <span className="truncate">
                          {isFeaturedLiveAuction ? "Bid Now" : "View Piece"}
                        </span>
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ============================================================== */}
          {/* LOWER DOCK: HORIZONTAL SLIDING WHITE CAPSULE RAIL              */}
          {/* Matches reference video (0:01-0:08) with `<` `>` chevrons and  */}
          {/* the elevated vertical white capsule sliding under active item. */}
          {/* ============================================================== */}
          <div className="relative z-10 px-2 pb-2.5 pt-1.5">
            <div className="flex items-center gap-1">
              {/* Left Prev Chevron (`<`) */}
              <button
                type="button"
                onClick={() => handleCycleStage(-1)}
                aria-label="Previous boutique"
                className="w-6 h-6 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 shrink-0 tap-depress"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* 4-Column Boutique Capsule Dock */}
              <div className="flex-1 grid grid-cols-4 gap-1 relative">
                {stories.map((story, index) => {
                  const isSelected = index === safeSelectedIndex;
                  const isUnseen = story.hasUnseen && !seenIds[story.id];
                  const isLive = story.type === "live_auction";

                  return (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => handleSelectDockItem(index)}
                      aria-pressed={isSelected}
                      className="group relative flex flex-col items-center pt-2 pb-2 px-1 rounded-[20px] focus:outline-hidden select-none"
                    >
                      {/* SLIDING ELEVATED WHITE CAPSULE BACKGROUND (Framer Motion layoutId) */}
                      {isSelected && (
                        <motion.div
                          layoutId="shinyen-boutique-dock-capsule"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 28,
                            mass: 0.75,
                          }}
                          className="absolute inset-0 rounded-[20px] bg-white border border-white/95 dock-capsule-shadow z-0"
                        />
                      )}

                      {/* Circular Miniature Platter Thumbnail */}
                      <motion.div
                        initial={false}
                        animate={
                          isSelected
                            ? { y: -4, scale: 1.08 }
                            : { y: 0, scale: 0.96 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 25,
                          mass: 0.6,
                        }}
                        className="relative z-10 mb-1.5"
                      >
                        <div
                          className={`w-11 h-11 rounded-full p-0.5 transition-all duration-200 ${
                            isSelected
                              ? "bg-gradient-to-tr from-slate-900 via-rose-600 to-amber-500 dock-orb-active-shadow"
                              : isUnseen
                              ? "bg-gradient-to-tr from-rose-500 to-amber-400 opacity-90 group-hover:opacity-100"
                              : "bg-slate-200/90 opacity-80 group-hover:opacity-100"
                          }`}
                        >
                          <div className="w-full h-full rounded-full overflow-hidden bg-white p-[1.5px]">
                            <img
                              src={story.mediaUrl}
                              alt={story.dockTitle || story.sellerHandle}
                              className="w-full h-full rounded-full object-cover"
                              draggable={false}
                            />
                          </div>
                        </div>

                        {/* Mini Live / Unseen Dot Badge */}
                        {isLive ? (
                          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.1 rounded-full bg-rose-600 text-white text-[7px] font-black uppercase tracking-tighter shadow-2xs ring-1 ring-white">
                            Live
                          </span>
                        ) : (
                          isUnseen && (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white" />
                          )
                        )}
                      </motion.div>

                      {/* Two-Line Centered Dock Label (Matches Reference Video) */}
                      <div className="relative z-10 text-center w-full px-0.5">
                        <span
                          className={`block text-[10px] leading-tight truncate transition-colors duration-150 ${
                            isSelected
                              ? "font-extrabold text-slate-900"
                              : "font-semibold text-slate-600 group-hover:text-slate-800"
                          }`}
                        >
                          {story.dockTitle || `@${story.sellerHandle}`}
                        </span>
                        <span
                          className={`block text-[9px] leading-tight truncate mt-0.5 transition-colors duration-150 ${
                            isSelected
                              ? "font-bold text-rose-600"
                              : "font-medium text-slate-400"
                          }`}
                        >
                          {story.dockSubtitle || story.priceLabel || "Drop"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Next Chevron (`>`) */}
              <button
                type="button"
                onClick={() => handleCycleStage(1)}
                aria-label="Next boutique"
                className="w-6 h-6 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 shrink-0 tap-depress"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FULL-SCREEN INSTAGRAM STORY VIEWER MODAL (PRESERVED BACKSTACK)     */}
      {/* ================================================================== */}
      {activeModalStory && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 max-w-md mx-auto animate-in fade-in duration-200"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Top Multi-Segment Progress Bars */}
          <div className="flex items-center gap-1.5 w-full pt-1 px-1">
            {stories.map((s, idx) => (
              <div
                key={s.id}
                className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      idx < (activeStoryIndex || 0)
                        ? "100%"
                        : idx === activeStoryIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Header Bar */}
          <div className="flex items-center justify-between text-white z-10 pt-2 px-1">
            <div className="flex items-center gap-2">
              <img
                src={activeModalStory.sellerAvatar}
                alt={activeModalStory.sellerHandle}
                className="w-9 h-9 rounded-full border border-white/40 object-cover"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white leading-tight">
                    @{activeModalStory.sellerHandle}
                  </span>
                  {activeModalStory.rating && (
                    <span className="px-1.5 py-0.2 rounded-full bg-white/15 text-[10px] font-bold text-amber-300 flex items-center gap-0.5">
                      ★ {activeModalStory.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/70">
                  {activeModalStory.location || "Verified Manipur Boutique"}
                </span>
              </div>
            </div>

            <button
              onClick={handleCloseStory}
              className="p-2 rounded-full bg-black/40 text-white/90 hover:bg-black/60 active:scale-90 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Story Main Image & Tap Zones */}
          <div className="relative flex-1 my-3 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-900 shadow-2xl">
            <img
              src={activeModalStory.mediaUrl}
              alt={activeModalStory.title}
              className="w-full h-full object-cover select-none"
            />

            {/* Left & Right Tap Zones for Navigation */}
            <div
              onClick={handlePrevModalStory}
              className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
            />
            <div
              onClick={handleNextModalStory}
              className="absolute right-0 top-0 bottom-0 w-2/3 z-20 cursor-pointer"
            />

            {/* Gradient Overlay & Caption */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-5">
              <div className="flex items-center gap-1.5 mb-2">
                {activeModalStory.type === "live_auction" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    <Flame className="w-3 h-3 fill-white" /> Live Drop Auction
                  </span>
                ) : activeModalStory.type === "artisan_craft" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    <Sparkles className="w-3 h-3" /> Artisan Loom Weave
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    <Sparkles className="w-3 h-3" /> New Boutique Arrival
                  </span>
                )}
                {activeModalStory.priceLabel && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold">
                    {activeModalStory.priceLabel}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-white leading-snug drop-shadow-md">
                {activeModalStory.title}
              </p>
            </div>
          </div>

          {/* Interactive Action Stickers Bar */}
          <div className="space-y-2 z-30">
            {activeModalStory.productId ? (
              <button
                onClick={() => {
                  triggerHaptic(15);
                  const id = activeModalStory.productId;
                  handleCloseStory();
                  if (id) onSelectStoryProduct?.(id);
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>{activeModalStory.ctaText || "View Item & Bid"}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic(12);
                  setReminderSubscribed(true);
                  setTimeout(() => setReminderSubscribed(false), 3000);
                }}
                className="w-full py-3 px-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 border border-white/30 active:scale-98 transition-all"
              >
                {reminderSubscribed ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Drop Alert Subscribed!</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 text-amber-300" />
                    <span>Set Drop Reminder (WhatsApp)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
