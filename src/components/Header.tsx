"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  MapPin,
  Download,
  Share,
  PlusSquare,
  Sparkles,
  X,
  CheckCircle2,
} from "lucide-react";
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
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt event (Chrome / Edge / Android)
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if already running in standalone mode (installed PWA)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsPwaInstalled(true);
    }

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic(12);
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsPwaInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      // Guide users on iOS Safari or when beforeinstallprompt has not fired
      setShowIosPrompt(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs pt-safe">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-2">
          {/* Brand Logo & Cultural Typography */}
          <div
            onClick={() => {
              triggerHaptic(6);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 cursor-pointer tap-depress shrink-0"
          >
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

          {/* Actions: Install App Button, Location Pill & Cart */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isPwaInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1.5 rounded-full hover:bg-rose-100 tap-depress transition-all shadow-xs"
                title="Install Shinyen App to your Home Screen"
              >
                <Download className="w-3 h-3 text-rose-600" />
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={() => {
                triggerHaptic(8);
                onLocationClick?.();
              }}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 px-2 py-1.5 rounded-full transition-colors tap-depress"
            >
              <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
              <span className="truncate max-w-[65px] min-[400px]:max-w-[85px]">{selectedDistrict}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(12);
                onCartClick?.();
              }}
              className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 tap-depress transition-all"
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

      {/* iOS & Browser PWA Installation Guide Modal */}
      {showIosPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                  ꯁ
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Install Shinyen (ꯁꯤꯟꯌꯦꯟ)</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Add to your Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => {
                  triggerHaptic(6);
                  setShowIosPrompt(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-1">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Tap the <span className="font-bold text-slate-900 inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-md"><Share className="w-3 h-3 text-rose-600 inline" /> Share</span> button in Safari&apos;s bottom bar (or browser menu ⋮).
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Scroll down the share sheet and tap <span className="font-bold text-slate-900 inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-md"><PlusSquare className="w-3 h-3 text-rose-600 inline" /> Add to Home Screen</span>.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Tap <span className="font-bold text-rose-600">Add</span> in the top-right corner to finish installing.
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[11px] text-slate-600 font-medium">
                Instant full-screen thrift drops, zero lag, and fast checkout for Manipur shoppers.
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic(8);
                setShowIosPrompt(false);
              }}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 tap-depress transition-all shadow-md"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
