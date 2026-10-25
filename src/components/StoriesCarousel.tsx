"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoutiqueStory, StoryShowcaseItem, StoryThemeConfig } from "@/types";
import { triggerHaptic, formatINR } from "@/lib/utils";
import { useModalBackstack } from "@/hooks/useBackstack";
import {
  X,
  Flame,
  Sparkles,
  Eye,
  Bell,
  Check,
  ArrowRight,
  Plus,
  Maximize2,
  ShieldCheck,
  Palette,
  Gem,
  Shirt,
  Pause,
} from "lucide-react";

interface StoriesCarouselProps {
  stories: BoutiqueStory[];
  onSelectStoryProduct?: (productId: string) => void;
}

const DEFAULT_THEME: StoryThemeConfig = {
  id: "mint",
  blobStart: "#34E8B6",
  blobEnd: "#10B981",
  accentHex: "#059669",
  softBgHex: "#ECFDF5",
  orbPrimary: "#A7F3D0",
  orbSecondary: "#047857",
  textTint: "#ECFDF5",
  svgPath:
    "M0,0 L162,0 C198,34 218,86 196,142 C176,194 214,236 172,292 C142,332 82,340 0,340 Z",
};

/**
 * Clockwise Orbital Motion Variants (Directly modeled on video 00:01 -> 00:04):
 * - Enter: Swoops in clockwise from top-left (-x, -y, counter-rotated)
 * - Center: Settles into hero stage with spring physics
 * - Exit: Swoops out clockwise toward bottom-right (+x, +y, clockwise-rotated)
 */
const heroOrbitalVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? -78 : 78,
    y: direction >= 0 ? -92 : 92,
    rotate: direction >= 0 ? -26 : 24,
    scale: 0.62,
    opacity: 0,
    filter: "blur(6px)",
  }),
  center: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 240,
      damping: 22,
      mass: 0.85,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? 84 : -78,
    y: direction >= 0 ? 96 : -88,
    rotate: direction >= 0 ? 24 : -24,
    scale: 0.6,
    opacity: 0,
    filter: "blur(6px)",
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 26,
      mass: 0.75,
    },
  }),
};

/**
 * Secondary Floating Bokeh Orb Variants (Counter-Orbital Parallax)
 */
const bokehOrbVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 55 : -55,
    y: direction >= 0 ? -65 : 65,
    scale: 0.3,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      mass: 0.9,
      delay: 0.04,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -65 : 65,
    y: direction >= 0 ? 75 : -65,
    scale: 0.25,
    opacity: 0,
    transition: {
      duration: 0.26,
      ease: "easeIn",
    },
  }),
};

/**
 * Kinetic Display Typography Variants (Layered between Blob and Hero Product)
 */
const displayTitleVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? -42 : 42,
    y: direction >= 0 ? -18 : 18,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 290,
      damping: 25,
      mass: 0.75,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? 38 : -38,
    y: direction >= 0 ? 16 : -16,
    opacity: 0,
    scale: 0.92,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  }),
};

/**
 * Right-Side "Storehouse" List Container & Row Stagger Variants
 */
const storehouseListVariants = {
  enter: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.03,
    },
  },
  center: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.03,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const storehouseRowVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 34 : -34,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 28,
      mass: 0.7,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -28 : 28,
    opacity: 0,
    transition: {
      duration: 0.16,
    },
  }),
};

export const StoriesCarousel: React.FC<StoriesCarouselProps> = ({
  stories,
  onSelectStoryProduct,
}) => {
  // Orbital Showcase Card State
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [direction, setDirection] = useState(1); // +1 = clockwise forward, -1 = counter-clockwise
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [cardProgress, setCardProgress] = useState(0);
  const [isCardPaused, setIsCardPaused] = useState(false);

  // Full-Screen 9:16 Modal Viewer State
  const [modalStoryIndex, setModalStoryIndex] = useState<number | null>(null);
  const [modalProgress, setModalProgress] = useState(0);
  const [isModalPaused, setIsModalPaused] = useState(false);
  const [reminderSubscribed, setReminderSubscribed] = useState(false);

  // Touch Gesture Coordinates for Orbital Card
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const safeShowcaseIndex =
    stories.length > 0 ? showcaseIndex % stories.length : 0;
  const currentStory = stories[safeShowcaseIndex];
  const currentTheme = currentStory?.theme || DEFAULT_THEME;
  const showcaseItems: StoryShowcaseItem[] =
    currentStory?.showcaseItems && currentStory.showcaseItems.length > 0
      ? currentStory.showcaseItems
      : [
          {
            id: `fallback-${currentStory?.id}`,
            productId: currentStory?.productId || "prod-01",
            name: currentStory?.title?.slice(0, 16) || "Featured Grail",
            dimensionLabel: "Verified Fit",
            price: 1850,
            thumbnailUrl: currentStory?.mediaUrl || "",
          },
        ];

  const activeHighlightItem =
    showcaseItems[selectedRowIndex] || showcaseItems[0];

  const activeModalStory =
    modalStoryIndex !== null ? stories[modalStoryIndex] : null;

  // Advance Orbital Showcase Clockwise
  const handleAdvanceClockwise = useCallback(() => {
    if (stories.length <= 1) return;
    setDirection(1);
    setSelectedRowIndex(0);
    setCardProgress(0);
    setShowcaseIndex((prev) => (prev + 1) % stories.length);
  }, [stories.length]);

  // Jump to Specific Boutique Story in Orbital Showcase
  const handleSelectShowcaseStory = (targetIdx: number) => {
    if (targetIdx === safeShowcaseIndex) return;
    triggerHaptic(10);
    const dir = targetIdx > safeShowcaseIndex ? 1 : -1;
    setDirection(dir);
    setSelectedRowIndex(0);
    setCardProgress(0);
    setShowcaseIndex(targetIdx);
  };

  // Auto-advance timer for the Orbital Showcase Card (5.5s cycle)
  useEffect(() => {
    if (
      modalStoryIndex !== null ||
      isCardPaused ||
      stories.length <= 1
    ) {
      return;
    }

    const tickMs = 50;
    const durationMs = 5500;
    const increment = 100 / (durationMs / tickMs);

    const interval = setInterval(() => {
      setCardProgress((prev) => {
        if (prev + increment >= 100) {
          handleAdvanceClockwise();
          return 0;
        }
        return prev + increment;
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [
    modalStoryIndex,
    isCardPaused,
    stories.length,
    handleAdvanceClockwise,
  ]);

  // Close Full-Screen Story Modal
  const handleCloseModalStory = useCallback(() => {
    triggerHaptic(6);
    setModalStoryIndex(null);
    setModalProgress(0);
  }, []);

  // Mobile Backstack Sync for Full-Screen Modal
  useModalBackstack(
    "story-viewer",
    modalStoryIndex !== null,
    handleCloseModalStory
  );

  // Auto-progress timer for Full-Screen 9:16 Story Viewer (5.0s cycle)
  useEffect(() => {
    if (modalStoryIndex === null || isModalPaused) return;

    setModalProgress(0);
    const intervalTime = 50;
    const step = 100 / (5000 / intervalTime);

    const timer = setInterval(() => {
      setModalProgress((prev) => {
        if (prev >= 100) {
          if (modalStoryIndex < stories.length - 1) {
            setModalStoryIndex((curr) => (curr !== null ? curr + 1 : null));
            return 0;
          } else {
            handleCloseModalStory();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [modalStoryIndex, isModalPaused, stories.length, handleCloseModalStory]);

  const handleOpenFullStoryModal = (index: number) => {
    triggerHaptic(12);
    setModalStoryIndex(index);
    setModalProgress(0);
    setReminderSubscribed(false);
  };

  const handlePrevModalStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modalStoryIndex !== null && modalStoryIndex > 0) {
      triggerHaptic(8);
      setModalStoryIndex(modalStoryIndex - 1);
      setModalProgress(0);
    }
  };

  const handleNextModalStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modalStoryIndex !== null && modalStoryIndex < stories.length - 1) {
      triggerHaptic(8);
      setModalStoryIndex(modalStoryIndex + 1);
      setModalProgress(0);
    } else {
      handleCloseModalStory();
    }
  };

  // Horizontal Swipe Support on the Orbital Stage
  const handleStageTouchStart = (e: React.TouchEvent) => {
    setIsCardPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleStageTouchEnd = (e: React.TouchEvent) => {
    setIsCardPaused(false);
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
      triggerHaptic(10);
      if (deltaX < 0) {
        // Swipe Left -> Clockwise Next
        setDirection(1);
        setSelectedRowIndex(0);
        setCardProgress(0);
        setShowcaseIndex((prev) => (prev + 1) % stories.length);
      } else {
        // Swipe Right -> Counter-Clockwise Previous
        setDirection(-1);
        setSelectedRowIndex(0);
        setCardProgress(0);
        setShowcaseIndex(
          (prev) => (prev - 1 + stories.length) % stories.length
        );
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  if (!currentStory) return null;

  const displayLines = currentStory.heroDisplayLines || ["Grail", "Drop"];
  const dockCircumference = 2 * Math.PI * 15; // r=15 for 34x34 SVG ring
  const dockDashOffset =
    dockCircumference - (cardProgress / 100) * dockCircumference;

  const getDockIcon = (themeId?: string, idx?: number) => {
    switch (themeId) {
      case "mint":
        return Palette;
      case "violet":
        return Shirt;
      case "amber":
        return Gem;
      case "rose":
        return Flame;
      default:
        return idx === 0 ? Palette : Sparkles;
    }
  };

  return (
    <section
      aria-label="Boutique Orbital Stories & Live Storehouse"
      className="w-full pt-2.5 pb-3 bg-gradient-to-b from-white via-slate-50/70 to-white border-b border-slate-100 select-none overflow-hidden"
    >
      <div className="max-w-md mx-auto">
        {/* ================================================================ */}
        {/* 1. COMPACT BOUTIQUE STORY BAR WITH CLOCKWISE ACTIVE RING         */}
        {/* ================================================================ */}
        <div className="px-4 mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">
              Boutique Showcases
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              3D Live
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenFullStoryModal(safeShowcaseIndex)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 tap-depress transition-colors"
          >
            <span>Full Screen (9:16)</span>
            <Maximize2 className="w-3 h-3 text-rose-600" />
          </button>
        </div>

        {/* Horizontal Boutique Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none px-4 pb-2.5">
          {stories.map((story, idx) => {
            const isSelected = idx === safeShowcaseIndex;
            const storyTheme = story.theme || DEFAULT_THEME;
            const ringRadius = 19;
            const ringCircumference = 2 * Math.PI * ringRadius;
            const ringOffset = isSelected
              ? ringCircumference - (cardProgress / 100) * ringCircumference
              : 0;

            return (
              <button
                key={story.id}
                type="button"
                onClick={() => handleSelectShowcaseStory(idx)}
                onDoubleClick={() => handleOpenFullStoryModal(idx)}
                className={`group relative flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border transition-all duration-200 shrink-0 tap-depress outline-none ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {/* Avatar with Clockwise SVG Progress Ring */}
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 44 44"
                  >
                    <circle
                      cx="22"
                      cy="22"
                      r={ringRadius}
                      fill="none"
                      stroke={
                        isSelected
                          ? "rgba(255,255,255,0.2)"
                          : storyTheme.blobStart
                      }
                      strokeWidth="2.5"
                    />
                    {isSelected && (
                      <circle
                        cx="22"
                        cy="22"
                        r={ringRadius}
                        fill="none"
                        stroke={storyTheme.blobStart}
                        strokeWidth="2.75"
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        className="transition-[stroke-dashoffset] duration-75 linear"
                      />
                    )}
                  </svg>
                  <img
                    src={story.sellerAvatar}
                    alt={story.sellerHandle}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold leading-none truncate max-w-[82px]">
                      @{story.sellerHandle}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-medium block mt-0.5 leading-none ${
                      isSelected ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {story.heroDisplayLines
                      ? `${story.heroDisplayLines[0]} ${story.heroDisplayLines[1]}`
                      : "Boutique"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ================================================================ */}
        {/* 2. HERO 3D ORBITAL SHOWCASE CARD (INSPIRED BY REFERENCE VIDEO)   */}
        {/* ================================================================ */}
        <div className="px-4">
          <div
            onMouseEnter={() => setIsCardPaused(true)}
            onMouseLeave={() => setIsCardPaused(false)}
            onTouchStart={handleStageTouchStart}
            onTouchEnd={handleStageTouchEnd}
            className="relative w-full h-[316px] rounded-[28px] bg-white border border-slate-200/80 orbital-stage-shadow overflow-hidden flex"
          >
            {/* ============================================================ */}
            {/* LAYER 0: ORGANIC COLOR-MORPHING BLOB BACKDROP (LEFT STAGE)   */}
            {/* ============================================================ */}
            <div className="absolute inset-y-0 left-0 w-[56%] pointer-events-none z-0 overflow-hidden">
              <svg
                viewBox="0 0 230 340"
                preserveAspectRatio="none"
                className="w-full h-full block"
              >
                <defs>
                  <linearGradient
                    id="orbitalBlobGrad"
                    x1="0%"
                    y1="0%"
                    x2="85%"
                    y2="100%"
                  >
                    <motion.stop
                      offset="0%"
                      animate={{ stopColor: currentTheme.blobStart }}
                      transition={{ duration: 0.65, ease: "easeInOut" }}
                    />
                    <motion.stop
                      offset="100%"
                      animate={{ stopColor: currentTheme.blobEnd }}
                      transition={{ duration: 0.65, ease: "easeInOut" }}
                    />
                  </linearGradient>
                </defs>

                <motion.path
                  initial={false}
                  animate={{ d: currentTheme.svgPath }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 22,
                    mass: 1,
                  }}
                  fill="url(#orbitalBlobGrad)"
                />
              </svg>

              {/* Soft Radial Specular Glow Inside the Blob */}
              <motion.div
                initial={false}
                animate={{ backgroundColor: currentTheme.blobStart }}
                transition={{ duration: 0.6 }}
                className="absolute -top-10 -left-10 w-36 h-36 rounded-full blur-2xl opacity-50 pointer-events-none"
              />
            </div>

            {/* ============================================================ */}
            {/* LEFT STAGE (46% WIDTH): TYPOGRAPHY + ORBITAL HERO SCULPTURE  */}
            {/* ============================================================ */}
            <div className="relative w-[46%] h-full flex flex-col justify-between p-3.5 z-10">
              {/* Top-Left Boutique Status Micro-Badge */}
              <div className="flex items-center justify-between z-20">
                <button
                  type="button"
                  onClick={() => handleOpenFullStoryModal(safeShowcaseIndex)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white text-[9px] font-extrabold tracking-wide uppercase shadow-2xs tap-depress"
                >
                  {currentStory.type === "live_auction" ? (
                    <>
                      <Flame className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                      <span>Live Bid</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                      <span>Loom Drop</span>
                    </>
                  )}
                </button>
              </div>

              {/* LAYER 1: OVERSIZED 2-LINE EDITORIAL DISPLAY TITLE           */}
              {/* Positioned behind the hero 3D product asset for Z-depth     */}
              <div className="relative z-10 mt-1 pointer-events-none select-none">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`title-${currentStory.id}`}
                    custom={direction}
                    variants={displayTitleVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="font-black tracking-tighter leading-[0.9] text-[31px] sm:text-[34px] text-white drop-shadow-[0_2px_10px_rgba(15,23,42,0.14)]"
                  >
                    <span className="block">{displayLines[0]}</span>
                    <span className="block opacity-95">{displayLines[1]}</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* LAYER 2: GLOSSY WHITE 3D BEAN / CAPSULE (Video Left Accent) */}
              <div
                aria-hidden="true"
                className="
                  absolute left-2.5 bottom-[74px] z-20
                  w-7 h-11 rounded-full
                  bg-gradient-to-br from-white via-white/95 to-slate-200/90
                  shadow-[0_10px_20px_-4px_rgba(15,23,42,0.22),inset_0_2px_4px_rgba(255,255,255,1)]
                  border border-white/80
                  animate-bean-float pointer-events-none
                "
              />

              {/* LAYER 3: CLOCKWISE ORBITAL HERO PRODUCT SCULPTURE           */}
              <div className="relative flex-1 flex items-center justify-center z-30 -mt-2">
                {/* Floating Blurred Bokeh Sphere 1 (Top-Right Orbit) */}
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`orb1-${currentStory.id}-${selectedRowIndex}`}
                    custom={direction}
                    variants={bokehOrbVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, #ffffff, ${currentTheme.orbPrimary})`,
                    }}
                    className="absolute -top-3 right-0 w-7 h-7 rounded-full shadow-md blur-[1px] z-10 pointer-events-none animate-orb-drift"
                  />
                </AnimatePresence>

                {/* Floating Blurred Bokeh Sphere 2 (Bottom-Right Foreground) */}
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`orb2-${currentStory.id}-${selectedRowIndex}`}
                    custom={direction}
                    variants={bokehOrbVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, #ffffff, ${currentTheme.orbSecondary})`,
                    }}
                    className="absolute bottom-6 -right-2 w-5 h-5 rounded-full shadow-sm blur-[1.5px] z-40 pointer-events-none"
                  />
                </AnimatePresence>

                {/* Clockwise Orbital Hero Card / Sculpture */}
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`hero-${currentStory.id}-${activeHighlightItem.id}`}
                    custom={direction}
                    variants={heroOrbitalVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    onClick={() => {
                      triggerHaptic(12);
                      onSelectStoryProduct?.(activeHighlightItem.productId);
                    }}
                    className="relative cursor-pointer group"
                  >
                    {/* Continuous 3D Levitation Wrapper */}
                    <div className="relative animate-orbital-float">
                      {/* Sculpted 3D Product Frame */}
                      <div className="w-[112px] h-[132px] sm:w-[120px] sm:h-[140px] rounded-[24px] p-1 bg-white/95 backdrop-blur-md sculpture-elevation border border-white rotate-[-3deg] group-hover:rotate-0 group-hover:scale-[1.03] transition-transform duration-300 overflow-hidden relative">
                        <img
                          src={activeHighlightItem.thumbnailUrl || currentStory.mediaUrl}
                          alt={activeHighlightItem.name}
                          className="w-full h-full object-cover rounded-[20px]"
                          draggable={false}
                        />

                        {/* Glossy Specular Light Sheen */}
                        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-tr from-black/25 via-transparent to-white/30 pointer-events-none" />

                        {/* Floating Price Pill Inside Hero Sculpture */}
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white flex items-center justify-between text-[9px] font-extrabold shadow-xs">
                          <span className="truncate max-w-[54px]">
                            {activeHighlightItem.badgeText || "Verified"}
                          </span>
                          <span className="text-amber-300">
                            {formatINR(activeHighlightItem.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ground Contact Breathing Shadow Pedestal */}
                    <div className="w-20 h-3.5 mx-auto mt-1.5 rounded-full bg-slate-900/25 blur-md animate-shadow-breathe pointer-events-none" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom-Left Floating Craft Tag */}
              <div className="z-20 pb-8">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/20 backdrop-blur-xs text-[9px] font-bold text-white/95 truncate max-w-full">
                  {currentStory.floatingTag || "Manipur Verified"}
                </span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT STAGE (54% WIDTH): "MY STOREHOUSE" CURATED VAULT LIST  */}
            {/* ============================================================ */}
            <div className="relative w-[54%] h-full bg-white/90 backdrop-blur-[2px] flex flex-col justify-between p-3.5 pl-2.5 z-10">
              {/* Top Row: "My storehouse" Header + Gold Circular Badge (From Video) */}
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                    @{currentStory.sellerHandle}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight tracking-tight">
                    {currentStory.vaultTitle || "My storehouse"}
                  </h3>
                </div>

                {/* Signature Warm Gold Circular Check/Boutique Badge (Top-Right of Video) */}
                <button
                  type="button"
                  onClick={() => handleOpenFullStoryModal(safeShowcaseIndex)}
                  title="Watch Full 9:16 Boutique Story"
                  className="w-7 h-7 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-[0_4px_10px_rgba(245,158,11,0.35)] tap-depress transition-transform shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.4]" />
                </button>
              </div>

              {/* Micro Table Column Headers (PRODUCT | SPEC | NO) */}
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-1.5 pt-1.5 pb-1 border-b border-slate-100 text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>Product</span>
                <span className="text-right pr-1">Spec</span>
                <span className="text-right pr-0.5">No</span>
              </div>

              {/* 3 Staggered Curated Storehouse Rows */}
              <div className="flex-1 flex flex-col justify-center divide-y divide-slate-100/90 overflow-hidden pb-9">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`rows-${currentStory.id}`}
                    custom={direction}
                    variants={storehouseListVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="divide-y divide-slate-100/90"
                  >
                    {showcaseItems.slice(0, 3).map((item, idx) => {
                      const isRowFocused = idx === selectedRowIndex;
                      return (
                        <motion.div
                          key={item.id}
                          custom={direction}
                          variants={storehouseRowVariants}
                          onClick={() => {
                            triggerHaptic(8);
                            if (selectedRowIndex !== idx) {
                              setDirection(1);
                              setSelectedRowIndex(idx);
                            } else {
                              onSelectStoryProduct?.(item.productId);
                            }
                          }}
                          className={`group py-1.5 px-1 rounded-xl flex items-center justify-between gap-1.5 cursor-pointer transition-colors ${
                            isRowFocused
                              ? "bg-slate-900/[0.04]"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {/* Item Name & Price */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[11px] truncate block transition-colors ${
                                  isRowFocused
                                    ? "font-extrabold text-slate-900"
                                    : "font-semibold text-slate-700 group-hover:text-slate-900"
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-rose-600 block leading-tight">
                              {formatINR(item.price)}
                            </span>
                          </div>

                          {/* Authentic Manipur Dimension / Craft Spec */}
                          <span className="text-[8.5px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                            {item.dimensionLabel}
                          </span>

                          {/* Mini Cutout Thumbnail + Interactive '+' Button */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div
                              className={`w-7 h-7 rounded-lg overflow-hidden border transition-transform ${
                                isRowFocused
                                  ? "border-slate-900 scale-105 shadow-2xs"
                                  : "border-slate-200/80 opacity-85 group-hover:opacity-100"
                              }`}
                            >
                              <img
                                src={item.thumbnailUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                draggable={false}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic(12);
                                onSelectStoryProduct?.(item.productId);
                              }}
                              aria-label={`Inspect ${item.name}`}
                              className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white flex items-center justify-center transition-colors tap-depress"
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ============================================================ */}
            {/* BOTTOM FLOATING GLASS DOCK & CLOCKWISE ORBITAL TRIGGER       */}
            {/* Matches the centered pill dock & dark '->' button in video   */}
            {/* ============================================================ */}
            <div className="absolute bottom-2.5 inset-x-3.5 flex items-center justify-between pointer-events-none z-40">
              {/* Left Mini Status Pill */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  onSelectStoryProduct?.(activeHighlightItem.productId);
                }}
                className="pointer-events-auto h-7 px-2.5 rounded-full bg-white/85 backdrop-blur-md border border-white/60 shadow-sm flex items-center gap-1 text-[10px] font-extrabold text-slate-800 hover:bg-white tap-depress transition-all"
              >
                <Eye className="w-3 h-3 text-rose-600" />
                <span>Inspect</span>
              </button>

              {/* Center Frosted Glass Control Dock (Directly from Video) */}
              <div className="pointer-events-auto flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/80 dock-glass-elevation">
                {stories.map((st, idx) => {
                  const IconComp = getDockIcon(st.theme?.id, idx);
                  const isCurrent = idx === safeShowcaseIndex;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectShowcaseStory(idx)}
                      aria-label={`Switch to ${st.sellerHandle}`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all tap-depress ${
                        isCurrent
                          ? "bg-slate-900/10 text-slate-900 scale-105"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </button>
                  );
                })}

                {/* Divider */}
                <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

                {/* Dark Squircle/Circle Next Button with Clockwise SVG Progress Ring */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(14);
                    handleAdvanceClockwise();
                  }}
                  aria-label="Next Story (Clockwise Orbital Transition)"
                  className="relative w-[34px] h-[34px] rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-md tap-depress transition-all group"
                >
                  {/* Clockwise Progress SVG Ring */}
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                    viewBox="0 0 34 34"
                  >
                    <circle
                      cx="17"
                      cy="17"
                      r="15"
                      fill="none"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="17"
                      cy="17"
                      r="15"
                      fill="none"
                      stroke={currentTheme.blobStart}
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeDasharray={dockCircumference}
                      strokeDashoffset={dockDashOffset}
                      className="transition-[stroke-dashoffset] duration-75 linear"
                    />
                  </svg>

                  {isCardPaused ? (
                    <Pause className="w-3 h-3 text-white/90" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>

              {/* Right Expand Icon Button (Matches bottom-right button in video) */}
              <button
                type="button"
                onClick={() => handleOpenFullStoryModal(safeShowcaseIndex)}
                aria-label="Open Full Screen Story"
                className="pointer-events-auto w-7 h-7 rounded-full bg-slate-900/10 hover:bg-slate-900/20 backdrop-blur-md border border-slate-900/10 flex items-center justify-center text-slate-700 tap-depress transition-all"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3. FULL-SCREEN 9:16 INSTAGRAM STORY VIEWER MODAL                   */}
      {/* ================================================================== */}
      {activeModalStory && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 max-w-md mx-auto animate-in fade-in duration-200"
          onMouseDown={() => setIsModalPaused(true)}
          onMouseUp={() => setIsModalPaused(false)}
          onTouchStart={() => setIsModalPaused(true)}
          onTouchEnd={() => setIsModalPaused(false)}
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
                      idx < (modalStoryIndex || 0)
                        ? "100%"
                        : idx === modalStoryIndex
                        ? `${modalProgress}%`
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
                <span className="text-xs font-bold text-white leading-tight">
                  @{activeModalStory.sellerHandle}
                </span>
                <span className="text-[10px] text-white/70">
                  {activeModalStory.sellerLocation || "Verified Manipur Boutique"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseModalStory}
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
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  const id = activeModalStory.productId;
                  handleCloseModalStory();
                  if (id) onSelectStoryProduct?.(id);
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>{activeModalStory.ctaText || "View Item & Bid"}</span>
              </button>
            ) : (
              <button
                type="button"
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
                    <span className="text-emerald-300">
                      Drop Alert Subscribed!
                    </span>
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
