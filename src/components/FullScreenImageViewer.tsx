"use client";

import React, { useState, useEffect, useRef } from "react";
import { useModalBackstack } from "@/hooks/useBackstack";
import { triggerHaptic } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertTriangle, ShieldCheck } from "lucide-react";

interface FullScreenImageViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sellerHandle?: string;
  hasFlaw?: boolean;
  flawNote?: string;
}

export const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
  sellerHandle,
  hasFlaw,
  flawNote,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  // Sync initial index when viewer opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when full screen viewer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Mobile Backstack Sync: Android back gesture closes viewer
  useModalBackstack("full-screen-photo-viewer", isOpen, onClose);

  // Keyboard navigation (Escape to close, Left/Right arrows)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  // Touch Swipe Handling
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isSwipingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isZoomed) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isZoomed || !isSwipingRef.current) return;
    isSwipingRef.current = false;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Horizontal swipe threshold: 45px
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    // Vertical swipe down to close: 70px
    else if (deltaY > 70 && Math.abs(deltaY) > Math.abs(deltaX)) {
      triggerHaptic(8);
      onClose();
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      triggerHaptic(10);
      setIsZoomed(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      triggerHaptic(10);
      setIsZoomed(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleZoom = (e?: React.MouseEvent) => {
    triggerHaptic(12);
    if (!isZoomed && e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomOrigin({ x, y });
    }
    setIsZoomed((prev) => !prev);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full Screen Photo Gallery"
      className="fixed inset-0 z-50 bg-black/98 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
    >
      {/* Top Header Controls */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-safe h-16 text-white border-b border-white/10 bg-black/40 backdrop-blur-xs">
        <button
          onClick={() => {
            triggerHaptic(8);
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors tap-depress outline-none"
          aria-label="Close Full Screen Gallery"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Title & Counter */}
        <div className="flex flex-col items-center max-w-[200px] truncate text-center">
          {title && (
            <span className="text-xs font-semibold text-white/90 truncate w-full">
              {title}
            </span>
          )}
          <span className="text-[11px] font-mono font-medium text-white/60">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* Zoom In/Out Toggle Button */}
        <button
          onClick={() => toggleZoom()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors tap-depress outline-none ${
            isZoomed
              ? "bg-rose-600 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
          aria-label={isZoomed ? "Zoom Out" : "Zoom In (Inspect Weave)"}
          title={isZoomed ? "Zoom Out" : "Zoom In"}
        >
          {isZoomed ? (
            <ZoomOut className="w-5 h-5" />
          ) : (
            <ZoomIn className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden p-2 touch-none cursor-zoom-in"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={toggleZoom}
      >
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            key={currentIndex}
            src={images[currentIndex]}
            alt={title ? `${title} photo ${currentIndex + 1}` : `Photo ${currentIndex + 1}`}
            className={`max-w-full max-h-[75vh] sm:max-h-[82vh] object-contain rounded-lg transition-transform duration-250 ease-out ${
              isZoomed ? "scale-[2.4] cursor-zoom-out shadow-2xl" : "scale-100"
            }`}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  }
                : undefined
            }
            draggable={false}
          />
        </div>

        {/* Left Navigation Arrow (desktop / tablet) */}
        {currentIndex > 0 && !isZoomed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 flex items-center justify-center shadow-lg transition-all tap-depress z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Navigation Arrow (desktop / tablet) */}
        {currentIndex < images.length - 1 && !isZoomed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 flex items-center justify-center shadow-lg transition-all tap-depress z-10"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Zoom Hint Overlay (Fades out quickly) */}
        {!isZoomed && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-[11px] text-white/80 font-medium">
            Tap or double-tap to zoom
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip & Flaw Disclosures */}
      <div className="relative z-20 px-4 pb-safe pt-2 bg-black/60 backdrop-blur-xs border-t border-white/10 space-y-2">
        {/* Flaw disclosure banner if item has declared flaws */}
        {hasFlaw && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">
              {flawNote || "Vintage transparency: Minor natural distress photographed."}
            </span>
          </div>
        )}

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(6);
                  setIsZoomed(false);
                  setCurrentIndex(idx);
                }}
                className={`relative w-12 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  currentIndex === idx
                    ? "border-rose-500 scale-105 shadow-md shadow-rose-900/40"
                    : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Seller Info / Escrow reassurance */}
        <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
          {sellerHandle && <span>Seller: @{sellerHandle}</span>}
          <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 48h Escrow Guarantee
          </span>
        </div>
      </div>
    </div>
  );
};
