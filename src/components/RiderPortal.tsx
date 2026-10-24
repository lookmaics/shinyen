"use client";

import React, { useState } from "react";
import { formatINR, triggerHaptic } from "@/lib/utils";
import { Phone, MessageCircle, MapPin, CheckCircle, Navigation, ShieldCheck, Check } from "lucide-react";

export const RiderPortal: React.FC = () => {
  const [tab, setTab] = useState<"pickups" | "deliveries">("deliveries");
  const [otpInput, setOtpInput] = useState("");
  const [isDelivered, setIsDelivered] = useState(false);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === "4821") {
      triggerHaptic(20);
      setIsDelivered(true);
    } else {
      triggerHaptic(30);
      alert("Invalid OTP! Buyer must provide the 4-digit code from their phone.");
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
            Rider Dispatch Portal
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Today's Run</h1>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-800">Tomba Singh</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">● Online (Zone 1)</span>
        </div>
      </div>

      {/* 2-Tab Navigation */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => {
            triggerHaptic(6);
            setTab("deliveries");
          }}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "deliveries"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🛵 Deliveries (1 Active)
        </button>
        <button
          onClick={() => {
            triggerHaptic(6);
            setTab("pickups");
          }}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "pickups"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📦 Pickups (2 Ready)
        </button>
      </div>

      {/* DELIVERIES LIST */}
      {tab === "deliveries" && (
        <div className="space-y-3">
          {isDelivered ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-sm">Delivery Verified! 🎉</h3>
              <p className="text-xs text-slate-600">
                ₹45 payout added to your wallet. 48-hr inspection window started.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Stop #1 • Order #SH-1049</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Earn ₹45
                </span>
              </div>

              {/* Customer & Location */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Bembem Devi</h4>
                <div className="text-xs text-slate-600 mt-0.5 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    House No. 5, Yaiskul Leirak, Imphal West (Near Community Hall)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mt-2">
                  <span className="font-semibold text-slate-700">Gate Note: </span>
                  Green gate with two coconut trees, second house from main road.
                </div>
              </div>

              {/* 1-Tap Action Buttons (Phone, WhatsApp, Google Maps) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href="tel:9862000000"
                  onClick={() => triggerHaptic(8)}
                  className="py-2 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href="https://wa.me/919862000000?text=Hello,%20I%20am%20your%20Shinyen%20Rider,%20arriving%20in%2010%20minutes!"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerHaptic(8)}
                  className="py-2 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=24.8081,93.9433"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerHaptic(8)}
                  className="py-2 px-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Maps</span>
                </a>
              </div>

              {/* Enter 4-Digit OTP to Complete Delivery */}
              <form onSubmit={handleVerifyOtp} className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Ask Buyer for 4-Digit Delivery Code:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4821"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-mono text-center text-lg font-bold tracking-widest text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                  >
                    Verify & Finish
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* PICKUPS LIST */}
      {tab === "pickups" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900">Pickup #1: @imphalthrift</span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Ready for Pickup
              </span>
            </div>
            <div className="text-xs text-slate-600">
              <div className="font-semibold text-slate-800">Kwakeithel Moirang Purel, Imphal West</div>
              <div>Item: Vintage Carhartt Jacket</div>
              <div className="text-rose-600 font-medium text-[11px] mt-1">
                ⚠️ Rider Bags at Door: Slip into Shinyen Security Flyer & seal.
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic(12);
                alert("Package bagged and scanned! Route updated.");
              }}
              className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Confirm Bagging & Scan QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
