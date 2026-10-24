"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, ShieldCheck, Check, Sparkles, X, ArrowRight } from "lucide-react";
import { triggerHaptic } from "@/lib/utils";
import { useModalBackstack } from "@/hooks/useBackstack";

interface WhatsAppVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const WhatsAppVerifyModal: React.FC<WhatsAppVerifyModalProps> = ({
  isOpen,
  onClose,
  onVerified,
}) => {
  useModalBackstack("whatsapp-verify", isOpen, onClose);

  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Generate a clean 6-character anti-sybil verification token
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      setToken(`VERIFY-SHN-${randomStr}`);
      setVerifiedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const whatsappUrl = `https://wa.me/919862000000?text=${encodeURIComponent(
    `Hello Lookmai Concierge, please verify my Shinyen bidder token: ${token}`
  )}`;

  const handleSimulateWebhook = () => {
    triggerHaptic(15);
    setIsVerifying(true);

    // Simulate incoming webhook from Meta Cloud API (< 1 sec)
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      triggerHaptic(25);
      if (typeof window !== "undefined") {
        localStorage.setItem("shinyen_whatsapp_verified", "true");
      }
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Anti-Sybil Bidder Gate</h3>
              <p className="text-[11px] text-slate-400">1-Time Zero-Cost WhatsApp Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Value Proposition & Security Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px] uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Why verify before your first bid?</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
            <li>
              <strong className="text-slate-800">Zero Troll Bids:</strong> Stops fake accounts & bots from ruining real drop auctions.
            </li>
            <li>
              <strong className="text-slate-800">Zero Toll Fraud:</strong> Uses free inbound WhatsApp (Meta Cloud API). ₹0 SMS cost to you or platform.
            </li>
            <li>
              <strong className="text-slate-800">Fast 1-Tap Setup:</strong> Takes 5 seconds and stays verified on your device.
            </li>
          </ul>
        </div>

        {/* Verification Token Display */}
        <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
            Your Unique Device Token
          </span>
          <span className="font-mono text-base font-black text-emerald-900 tracking-wider">
            {token}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => triggerHaptic(10)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-200 active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open WhatsApp to Send Token</span>
          </a>

          <button
            onClick={handleSimulateWebhook}
            disabled={isVerifying || verifiedSuccess}
            className={`w-full py-3 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border transition-all ${
              verifiedSuccess
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : isVerifying
                ? "bg-slate-100 text-slate-400 border-slate-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-98"
            }`}
          >
            {verifiedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Verified! Unlocking Bidding...</span>
              </>
            ) : isVerifying ? (
              <span>Confirming Inbound Webhook...</span>
            ) : (
              <>
                <span>I Sent the Message (Confirm Verification)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
