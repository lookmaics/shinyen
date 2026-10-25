"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SellerStudio } from "@/components/SellerStudio";
import { triggerHaptic } from "@/lib/utils";
import {
  ArrowLeft,
  Share2,
  Download,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Store,
  ExternalLink,
} from "lucide-react";

export default function SellerPage() {
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if running in standalone mode (installed PWA)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
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
      // Fallback instruction for iOS Safari / Chrome
      alert(
        "To install Shinyen Seller App:\n\n1. Tap the Share button (or browser menu ⋮)\n2. Select 'Add to Home Screen'\n\nThis gives you instant 1-tap camera access and order notifications!"
      );
    }
  };

  return (
    <div className="ios-page-enter min-h-screen bg-slate-50 flex flex-col">
      {/* Top Standalone Seller Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 pt-safe h-header-safe flex items-center justify-between shadow-xs">
        {/* Brand & Merchant Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
            S
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 tracking-tight block leading-tight">
              Shinyen <span className="text-rose-600">Seller</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Boutique Workstation
            </span>
          </div>
        </div>

        {/* PWA Home Screen Install Button */}
        {!isPwaInstalled ? (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-xl hover:bg-rose-100 tap-depress transition-all shadow-xs"
            title="Install Shinyen Seller to your Home Screen"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>App Active</span>
          </div>
        )}
      </header>

      {/* Main Seller Studio Workspace */}
      <main className="flex-1">
        <SellerStudio />
      </main>
    </div>
  );
}
