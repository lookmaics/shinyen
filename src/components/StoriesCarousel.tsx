"use client";

import React, { useState, useEffect, useRef } from "react";
import { BoutiqueStory } from "@/types";
import { triggerHaptic } from "@/lib/utils";
import { useModalBackstack } from "@/hooks/useBackstack";
import { X, Flame, Sparkles, Eye, Bell, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface StoriesCarouselProps {
  stories: BoutiqueStory[];
  onSelectStoryProduct?: (productId: string) => void;
}

export const StoriesCarousel: React.FC<StoriesCarouselProps> = ({
  stories,
  onSelectStoryProduct,
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reminderSubscribed, setReminderSubscribed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleCloseStory = () => {
    triggerHaptic(6);
    setActiveStoryIndex(null);
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Mobile Backstack Sync: dismiss full-screen story on swipe-back gesture
  useModalBackstack("story-viewer", activeStoryIndex !== null, handleCloseStory);

  // Auto-progress timer for Instagram-like 5s story experience
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    setProgress(0);
    const intervalTime = 50; // update progress every 50ms
    const step = 100 / (5000 / intervalTime); // 5 seconds total

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next story or close
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((curr) => (curr !== null ? curr + 1 : null));
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
  }, [activeStoryIndex, isPaused, stories.length]);

  const handleOpenStory = (index: number) => {
    triggerHaptic(10);
    setActiveStoryIndex(index);
    setProgress(0);
    setReminderSubscribed(false);
  };

  const handlePrevStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      triggerHaptic(8);
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  const handleNextStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      triggerHaptic(8);
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      handleCloseStory();
    }
  };

  return (
    <div className="w-full py-3 bg-white border-b border-slate-100">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Boutique Drops & Stories
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">24h Status</span>
        </div>

        {/* Stories Horizontal Scroll */}
        <div className="flex items-center gap-3.5 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {stories.map((story, index) => {
            const isAuction = story.type === "live_auction";
            const isArtisan = story.type === "artisan_craft";

            return (
              <button
                key={story.id}
                onClick={() => handleOpenStory(index)}
                className="flex flex-col items-center gap-1 shrink-0 focus:outline-hidden group"
              >
                {/* Gradient Ring Avatar */}
                <div
                  className={`p-0.5 rounded-full transition-transform active:scale-95 ${
                    isAuction
                      ? "bg-gradient-to-tr from-amber-500 via-rose-600 to-red-600 ring-2 ring-rose-200"
                      : isArtisan
                      ? "bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400"
                      : "bg-gradient-to-tr from-rose-500 to-amber-400"
                  }`}
                >
                  <div className="p-0.5 bg-white rounded-full">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100">
                      <img
                        src={story.sellerAvatar}
                        alt={story.sellerHandle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isAuction && (
                        <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[8px] font-black uppercase text-center py-0.5 tracking-tighter">
                          Live
                        </div>
                      )}
                      {isArtisan && (
                        <div className="absolute bottom-0 inset-x-0 bg-emerald-700/90 text-white text-[8px] font-bold uppercase text-center py-0.5 tracking-tighter">
                          Loom
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seller Handle & Badge */}
                <span className="text-[11px] font-medium text-slate-700 max-w-[64px] truncate text-center">
                  @{story.sellerHandle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-Screen Instagram Story Viewer Modal */}
      {activeStory && (
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
              <div key={s.id} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
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
                src={activeStory.sellerAvatar}
                alt={activeStory.sellerHandle}
                className="w-9 h-9 rounded-full border border-white/40 object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white leading-tight">
                  @{activeStory.sellerHandle}
                </span>
                <span className="text-[10px] text-white/70">Verified Manipur Boutique</span>
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
              src={activeStory.mediaUrl}
              alt={activeStory.title}
              className="w-full h-full object-cover select-none"
            />

            {/* Left & Right Tap Zones for Navigation */}
            <div
              onClick={handlePrevStory}
              className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
            />
            <div
              onClick={handleNextStory}
              className="absolute right-0 top-0 bottom-0 w-2/3 z-20 cursor-pointer"
            />

            {/* Gradient Overlay & Caption */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-5">
              <div className="flex items-center gap-1.5 mb-2">
                {activeStory.type === "live_auction" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    <Flame className="w-3 h-3 fill-white" /> Live Drop Auction
                  </span>
                ) : activeStory.type === "artisan_craft" ? (
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
                {activeStory.title}
              </p>
            </div>
          </div>

          {/* Interactive Action Stickers Bar */}
          <div className="space-y-2 z-30">
            {activeStory.productId ? (
              <button
                onClick={() => {
                  triggerHaptic(15);
                  const id = activeStory.productId;
                  handleCloseStory();
                  if (id) onSelectStoryProduct?.(id);
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>{activeStory.ctaText || "View Item & Bid"}</span>
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
    </div>
  );
};
