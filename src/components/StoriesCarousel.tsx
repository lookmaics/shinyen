"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoutiqueStory, StoryShowcaseItem, StoryThemeConfig } from "@/types";
import { triggerHaptic, formatINR } from "@/lib/utils";
import { useModalBackstack } from "@/hooks/useBackstack";
import {
  ArrowRight,
  Plus,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

interface StoriesCarouselProps {
  stories: BoutiqueStory[];
  onSelectStoryProduct?: (productId: string) => void;
}

const DEFAULT_THEME: StoryThemeConfig = {
  id: "mint",
  blobStart: "#2FE0B5",
  blobEnd: "#0CB892",
  accentHex: "#059669",
  softBgHex: "#F2FBF7",
  orbPrimary: "#A7F3D0",
  orbSecondary: "#047857",
  textTint: "#F2FBF7",
  svgPath: "",
};

/**
 * Clockwise Orbital Motion Variants (Matching referral video):
 * - Enter: Swoops in clockwise from top-left (-x, -y, counter-rotated)
 * - Center: Settles smoothly at origin
 * - Exit: Swoops out clockwise toward bottom-right (+x, +y, clockwise-rotated)
 */
const heroOrbitalVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? -90 : 90,
    y: direction >= 0 ? -95 : 95,
    rotate: direction >= 0 ? -28 : 26,
    scale: 0.55,
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
    x: direction >= 0 ? 95 : -90,
    y: direction >= 0 ? 100 : -95,
    rotate: direction >= 0 ? 26 : -26,
    scale: 0.55,
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
 * Floating Parallax Bokeh Sphere Variants (Warm ambient orbs from video)
 */
const bokehOrbVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 60 : -60,
    y: direction >= 0 ? -70 : 70,
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
      delay: 0.05,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -70 : 70,
    y: direction >= 0 ? 80 : -70,
    scale: 0.25,
    opacity: 0,
    transition: {
      duration: 0.26,
      ease: "easeIn",
    },
  }),
};

/**
 * Staggered Storehouse Rows Variants
 */
const storehouseListVariants = {
  enter: { opacity: 0 },
  center: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

const storehouseRowVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 18 : -18,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 26,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -14 : 14,
    opacity: 0,
    transition: { duration: 0.15 },
  }),
};

export const StoriesCarousel: React.FC<StoriesCarouselProps> = ({
  stories,
  onSelectStoryProduct,
}) => {
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [cardProgress, setCardProgress] = useState(0);
  const [isCardPaused, setIsCardPaused] = useState(false);

  // Full-screen 9:16 modal viewer
  const [fullModalStoryIndex, setFullModalStoryIndex] = useState<number | null>(null);
  const isModalOpen = fullModalStoryIndex !== null;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const safeShowcaseIndex = stories.length > 0 ? showcaseIndex % stories.length : 0;
  const currentStory = stories[safeShowcaseIndex] || stories[0];
  const currentTheme = currentStory?.theme || DEFAULT_THEME;
  const showcaseItems = currentStory?.showcaseItems || [];
  const activeHighlightItem = showcaseItems[selectedRowIndex] || showcaseItems[0];
  const displayLines = currentStory?.heroDisplayLines || ["Herb", "pods"];

  // Clockwise advance handler
  const handleNext = useCallback(() => {
    triggerHaptic(8);
    setDirection(1);
    setSelectedRowIndex(0);
    setCardProgress(0);
    setShowcaseIndex((prev) => (prev + 1) % stories.length);
  }, [stories.length]);

  const handlePrev = useCallback(() => {
    triggerHaptic(8);
    setDirection(-1);
    setSelectedRowIndex(0);
    setCardProgress(0);
    setShowcaseIndex((prev) => (prev - 1 + stories.length) % stories.length);
  }, [stories.length]);

  // Auto-advance loop (5.5s interval with smooth clockwise circular ring)
  useEffect(() => {
    if (isCardPaused || isModalOpen || stories.length <= 1) return;

    const stepMs = 50;
    const totalMs = 5500;
    const stepIncrement = (stepMs / totalMs) * 100;

    progressIntervalRef.current = setInterval(() => {
      setCardProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isCardPaused, isModalOpen, stories.length, handleNext]);

  // Swipe gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  // Backstack support for modal
  useModalBackstack("story-viewer-modal", isModalOpen, () =>
    setFullModalStoryIndex(null)
  );

  if (!stories || stories.length === 0) return null;

  const ringRadius = 13;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (cardProgress / 100) * ringCircumference;

  return (
    <section className="w-full relative select-none">
      {/* ============================================================== */}
      {/* FULL-WIDTH BLEED 3D STAGE (Matching Referral Video Exactly)     */}
      {/* ============================================================== */}
      <div className="w-full px-2 sm:px-4">
        <div
          onMouseEnter={() => setIsCardPaused(true)}
          onMouseLeave={() => setIsCardPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[320px] sm:h-[340px] rounded-[28px] sm:rounded-[32px] bg-[#F7F8FA] border border-slate-100 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.06)] overflow-hidden flex"
        >
          {/* ========================================================== */}
          {/* LEFT COLUMN: PILLOWY PASTEL BACKDROP & 3D FLOATING HERO    */}
          {/* ========================================================== */}
          <div className="relative w-[48%] h-full p-2.5 sm:p-3 flex z-10">
            {/* Smooth Pillowy Colored Capsule (Velvety Pastel Gradient) */}
            <motion.div
              initial={false}
              animate={{
                background: `linear-gradient(145deg, ${currentTheme.blobStart}, ${currentTheme.blobEnd})`,
              }}
              transition={{ duration: 0.65, ease: "easeInOut" }}
              className="w-full h-full rounded-[24px] sm:rounded-[28px] p-4 flex flex-col justify-between relative overflow-hidden shadow-xs"
            >
              {/* 2-Line Oversized Editorial Headline */}
              <div className="relative z-10 font-black tracking-tight text-white leading-[0.92] text-[29px] sm:text-[34px] select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                <span className="block">{displayLines[0]}</span>
                <span className="block opacity-95">{displayLines[1]}</span>
              </div>

              {/* Glossy 3D White Organic Pebble / Bean (Video Bottom-Left Accent) */}
              <div
                aria-hidden="true"
                className="
                  w-6 h-10 rounded-full
                  bg-gradient-to-br from-white via-white/95 to-slate-200/90
                  shadow-[0_8px_16px_rgba(0,0,0,0.14),inset_0_2px_4px_rgba(255,255,255,1)]
                  border border-white/80
                  animate-bean-float pointer-events-none z-10
                "
              />

              {/* Subtle ambient light gradient inside pill */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/5 pointer-events-none" />
            </motion.div>
          </div>

          {/* ========================================================== */}
          {/* FLOATING 3D HERO OBJECT (Free Cutout Levitating Across Stage) */}
          {/* ========================================================== */}
          <div className="absolute left-[31%] sm:left-[34%] top-1/2 -translate-y-1/2 z-30 pointer-events-none">
            {/* Ambient Blurred Parallax Bokeh Sphere (Counter-drift) */}
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={`orb-${currentStory.id}`}
                custom={direction}
                variants={bokehOrbVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  background: `radial-gradient(circle at 35% 35%, #ffffff, ${currentTheme.orbPrimary})`,
                }}
                className="absolute -top-12 -left-6 w-9 h-9 rounded-full shadow-md blur-[1.5px] z-10 pointer-events-none animate-orb-drift"
              />
            </AnimatePresence>

            {/* Clockwise Orbital 3D Item Sculpture */}
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={`hero-3d-${currentStory.id}`}
                custom={direction}
                variants={heroOrbitalVariants}
                initial="enter"
                animate="center"
                exit="exit"
                onClick={() => {
                  triggerHaptic(12);
                  onSelectStoryProduct?.(currentStory.productId || activeHighlightItem.productId);
                }}
                className="relative cursor-pointer pointer-events-auto group flex flex-col items-center"
              >
                {/* Micro-Levitation Float Container */}
                <div className="relative animate-orbital-float flex flex-col items-center">
                  <img
                    src={currentStory.hero3dUrl || currentStory.mediaUrl}
                    alt={currentStory.title}
                    className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_22px_28px_rgba(15,23,42,0.22)] group-hover:scale-105 transition-transform duration-300"
                    draggable={false}
                  />

                  {/* Soft Ambient Diffuse Contact Shadow Pedestal */}
                  <div className="w-24 h-3.5 -mt-2.5 rounded-full bg-slate-900/18 blur-md pointer-events-none animate-shadow-breathe" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ========================================================== */}
          {/* RIGHT COLUMN: "MY STOREHOUSE" CURATED PRODUCT MATRIX       */}
          {/* ========================================================== */}
          <div className="relative w-[52%] h-full flex flex-col justify-between p-3.5 sm:p-4 pl-3 sm:pl-4 bg-transparent z-10">
            {/* Top Row: "My storehouse" Title + Warm Circular Avatar Badge */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight tracking-tight">
                  My
                  <br />
                  storehouse
                </h3>
              </div>

              {/* Warm Smiling Amber Badge (From Video Top-Right) */}
              <div
                title={currentStory.sellerName || currentStory.sellerHandle}
                className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-bold shadow-[0_3px_8px_rgba(245,158,11,0.35)] select-none shrink-0"
              >
                <span className="text-[11px] leading-none">😊</span>
              </div>
            </div>

            {/* Sub-Header Row: PRODUCT | NO */}
            <div className="flex items-center justify-between text-[8px] sm:text-[8.5px] font-bold uppercase tracking-wider text-slate-400 pt-1 pb-1 border-b border-slate-200/60">
              <span>PRODUCT</span>
              <span className="pr-1">NO</span>
            </div>

            {/* 3 Curated Storehouse Rows with Transparent 3D Cutouts */}
            <div className="flex-1 flex flex-col justify-center divide-y divide-slate-100/90 py-1 pb-9">
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
                    const isSelected = idx === selectedRowIndex;
                    return (
                      <motion.div
                        key={item.id}
                        custom={direction}
                        variants={storehouseRowVariants}
                        onClick={() => {
                          triggerHaptic(8);
                          setSelectedRowIndex(idx);
                        }}
                        className={`group py-1.5 px-1 rounded-xl flex items-center justify-between gap-1.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-slate-900/[0.04]"
                            : "hover:bg-slate-100/50"
                        }`}
                      >
                        {/* Name & Dimension */}
                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-[11px] sm:text-xs truncate block leading-tight ${
                              isSelected
                                ? "font-bold text-slate-900"
                                : "font-medium text-slate-700 group-hover:text-slate-900"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        {/* Dimension Spec (e.g. 110 x 110) */}
                        <span className="text-[8.5px] sm:text-[9px] font-mono text-slate-400 whitespace-nowrap shrink-0 pr-1">
                          {item.dimensionLabel}
                        </span>

                        {/* Isolated 3D Miniature Cutout (NO enclosing box or border) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-7 h-7 flex items-center justify-center">
                            <img
                              src={item.thumbnail3dUrl || item.thumbnailUrl}
                              alt={item.name}
                              className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform duration-200"
                              draggable={false}
                            />
                          </div>

                          {/* Quick Add '+' Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic(10);
                              onSelectStoryProduct?.(item.productId);
                            }}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200/80 transition-colors tap-depress"
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

            {/* ======================================================== */}
            {/* FLOATING FROSTED CONTROL DOCK (With Live Clockwise Ring) */}
            {/* ======================================================== */}
            <div className="absolute bottom-2.5 right-3 sm:right-4 z-40 bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-[0_6px_16px_rgba(0,0,0,0.06)] rounded-full px-2.5 py-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFullModalStoryIndex(safeShowcaseIndex)}
                className="text-slate-400 hover:text-slate-800 transition-colors p-0.5 tap-depress"
                title="Full Story"
              >
                <SlidersHorizontal className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handlePrev}
                className="text-slate-400 hover:text-slate-800 transition-colors p-0.5 tap-depress"
                title="Previous Story"
              >
                <Sparkles className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setFullModalStoryIndex(safeShowcaseIndex)}
                className="text-slate-400 hover:text-slate-800 transition-colors p-0.5 tap-depress"
                title="Seller Profile"
              >
                <User className="w-3 h-3" />
              </button>

              <div className="w-px h-3 bg-slate-200 mx-0.5" />

              {/* Circular Dark Button with Live Clockwise SVG Progress Ring */}
              <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  viewBox="0 0 32 32"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r={ringRadius}
                    fill="none"
                    stroke="rgba(15,23,42,0.12)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r={ringRadius}
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-[stroke-dashoffset] duration-75 linear"
                  />
                </svg>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs tap-depress hover:bg-slate-800 transition-colors"
                >
                  <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FULL-SCREEN 9:16 STORY VIEWER MODAL                            */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4"
          >
            <div className="relative w-full h-full sm:max-w-md sm:h-[844px] sm:rounded-3xl overflow-hidden bg-slate-900 flex flex-col justify-between">
              {/* Top Segment Progress Bars */}
              <div className="absolute top-0 inset-x-0 p-3 pt-4 z-30 flex items-center gap-1.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                {stories.map((s, idx) => (
                  <div
                    key={s.id}
                    className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
                  >
                    <div
                      className={`h-full bg-white transition-all duration-100 ${
                        idx < safeShowcaseIndex
                          ? "w-full"
                          : idx === safeShowcaseIndex
                          ? `w-[${cardProgress}%]`
                          : "w-0"
                      }`}
                      style={{
                        width:
                          idx < safeShowcaseIndex
                            ? "100%"
                            : idx === safeShowcaseIndex
                            ? `${cardProgress}%`
                            : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setFullModalStoryIndex(null)}
                className="absolute top-8 right-4 z-40 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal 3D Hero Visual Stage */}
              <div className="relative flex-1 flex flex-col items-center justify-center p-6">
                <div
                  className="w-64 h-64 rounded-full blur-3xl opacity-40 absolute"
                  style={{ background: currentTheme.blobStart }}
                />

                <img
                  src={currentStory.hero3dUrl || currentStory.mediaUrl}
                  alt={currentStory.title}
                  className="w-64 h-64 object-contain relative z-10 drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
                />

                <div className="text-center mt-6 z-10">
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    {displayLines[0]} {displayLines[1]}
                  </h2>
                  <p className="text-sm text-slate-300 mt-2 max-w-xs">
                    {currentStory.title}
                  </p>
                </div>
              </div>

              {/* Bottom CTA Drawer */}
              <div className="p-5 bg-gradient-to-t from-black via-black/80 to-transparent z-30 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setFullModalStoryIndex(null);
                    onSelectStoryProduct?.(
                      currentStory.productId || activeHighlightItem.productId
                    );
                  }}
                  className="w-full py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg tap-depress"
                >
                  <span>{currentStory.ctaText || "Inspect Collection"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default StoriesCarousel;
