"use client";

import React from "react";
import { ShoppingBag, MapPin, Search } from "lucide-react";
import { triggerHaptic } from "@/lib/utils";

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  selectedDistrict?: string;
  onLocationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
  onCartClick,
  selectedDistrict = "Imphal West",
  onLocationClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs pt-safe">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand Logo & Cultural Typography */}
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-xs">
            <span className="text-white font-bold text-base tracking-tighter">ꯁ</span>
          </div>
          <div className="flex flex-col -space-y-1">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Shinyen</span>
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1 py-0.2 rounded-full border border-rose-200">
                ꯁꯤꯟꯌꯦꯟ
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">
              Manipur Local
            </span>
          </div>
        </div>

        {/* Location Pill & Cart */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic(8);
              onLocationClick?.();
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-full transition-colors"
          >
            <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
            <span className="truncate max-w-[85px]">{selectedDistrict}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(12);
              onCartClick?.();
            }}
            className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
