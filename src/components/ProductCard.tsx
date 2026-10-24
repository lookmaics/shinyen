"use client";

import React, { useState, useEffect } from "react";
import { ProductItem } from "@/types";
import { formatINR, triggerHaptic } from "@/lib/utils";
import { Flame, CheckCircle, ShieldCheck, Ruler, Clock, ArrowRight, Bell, Check } from "lucide-react";

interface ProductCardProps {
  product: ProductItem;
  onOpenDetails: (product: ProductItem) => void;
  onQuickBid?: (product: ProductItem) => void;
  onAddToCart?: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onQuickBid,
  onAddToCart,
}) => {
  // Live countdown timer for active auctions
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [reminded, setReminded] = useState(false);

  useEffect(() => {
    if (!product.isAuction || !product.endTime) return;

    const calculateTime = () => {
      const diff = new Date(product.endTime!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
        setIsUrgent(false);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff / 1000) % 60);

      setIsUrgent(minutes < 5);
      setTimeLeft(`${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [product.isAuction, product.endTime]);

  return (
    <div
      onClick={() => {
        triggerHaptic(6);
        onOpenDetails(product);
      }}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col tap-depress"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {product.isDropTeaser ? (
            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white flex items-center gap-1 shadow-sm backdrop-blur-md">
              <Bell className="w-2.5 h-2.5 fill-white" />
              <span>Sunday 8 PM Drop</span>
            </div>
          ) : product.isAuction ? (
            <div
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-md ${
                isUrgent
                  ? "bg-red-600/90 text-white animate-pulse"
                  : "bg-slate-900/85 text-amber-300"
              }`}
            >
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>{timeLeft}</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold">
              Instant Buy
            </div>
          )}

          {/* Size Tag with Verified Measurement Badge */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-xs text-[10px] font-bold text-slate-800">
            {product.isVerifiedFit && <Ruler className="w-2.5 h-2.5 text-emerald-600" />}
            <span>{product.sizeTag}</span>
          </div>
        </div>

        {/* Flaw disclosure banner if thrift item has minor flaws */}
        {product.hasFlaw && (
          <div className="absolute bottom-2 inset-x-2 bg-amber-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-semibold truncate">
            Note: Disclosed minor flaw in photos
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Seller Handle & Rating */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mb-1">
            <span className="truncate max-w-[120px]">@{product.seller.handle}</span>
            {product.seller.isVerified && (
              <CheckCircle className="w-3 h-3 text-rose-600 fill-rose-50" />
            )}
            <span className="text-slate-300">•</span>
            <span className="text-amber-500 font-semibold">★ {product.seller.rating}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-xs text-slate-900 line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-slate-50 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">
              {product.isAuction ? "Current High Bid" : "Price"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                {formatINR(product.isAuction ? product.currentBid! : product.price)}
              </span>
              {product.isAuction && (
                <span className="text-[10px] text-slate-500 font-medium">
                  ({product.bidCount} bids)
                </span>
              )}
            </div>
          </div>

          {/* 1-Tap Action Button */}
          {product.isDropTeaser ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(12);
                setReminded((prev) => !prev);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs tap-depress transition-all ${
                reminded
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
            >
              {reminded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Alert Set</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 fill-white" />
                  <span>Remind</span>
                </>
              )}
            </button>
          ) : product.isAuction ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(12);
                onQuickBid?.(product);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs tap-depress transition-all"
            >
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>Bid</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(10);
                onAddToCart?.(product);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs tap-depress transition-all"
            >
              <span>Buy</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
