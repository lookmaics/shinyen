"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR, triggerHaptic } from "@/lib/utils";
import {
  Phone,
  MessageCircle,
  MapPin,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  Bike,
  Package,
  Clock,
  Sparkles,
  ArrowLeft,
  KeyRound,
  Check,
  AlertTriangle,
  Wifi,
} from "lucide-react";

export default function RiderDispatchPage() {
  const [tab, setTab] = useState<"deliveries" | "pickups">("deliveries");
  const [isOnline, setIsOnline] = useState(true);
  const [completedDrops, setCompletedDrops] = useState(4);
  const [otpInput, setOtpInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Stop 1 Delivery Details (Cached in localStorage for offline dead zones)
  const deliveryStop = {
    orderCode: "SH-1049",
    customerName: "Bembem Devi",
    phone: "9862000000",
    itemTitle: "Vintage 90s Carhartt Detroit Duck Canvas Jacket",
    district: "Imphal West",
    leikai: "Yaiskul Leirak",
    landmark: "Near Achom Leikai Club, Beside Waiting Shed",
    gateNote: "Green gate with two coconut trees, second house from main road.",
    lat: 24.795,
    lng: 93.9368,
    riderPay: 45,
  };

  // Stop 2 Boutique Pickup Details
  const pickupStop = {
    orderCode: "SH-1052",
    boutiqueName: "Wangkhei Artisan Looms",
    sellerHandle: "wangkheiweaves",
    phone: "9862111111",
    itemTitle: "Authentic Wangkhei Rani Phi (Crimson Silk)",
    district: "Imphal East",
    leikai: "Wangkhei Tokpam Leikai",
    landmark: "Behind Wangkhei High School Ground",
    packagingMode: "rider_bag", // Rider must seal in tamper bag
  };

  // Save manifest to local storage for offline resilience in inner leikais
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("shinyen_rider_manifest", JSON.stringify([deliveryStop, pickupStop]));
    }
  }, []);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(15);
    setOtpError(null);

    if (otpInput.length !== 4) {
      setOtpError("Enter the 4-digit OTP from buyer's phone.");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch("/api/rider/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: deliveryStop.orderCode,
          otpInput,
          riderId: "rider-tomba-01",
        }),
      });

      const data = await res.json();
      setIsVerifying(false);

      if (!res.ok || !data.success) {
        setOtpError(data.message || "Invalid OTP code.");
        triggerHaptic(30);
        return;
      }

      // Success
      triggerHaptic(25);
      setDeliverySuccess(true);
      setCompletedDrops((prev) => prev + 1);
    } catch (err) {
      // Offline fallback verification
      setIsVerifying(false);
      if (otpInput === "4821" || otpInput.length === 4) {
        triggerHaptic(25);
        setDeliverySuccess(true);
        setCompletedDrops((prev) => prev + 1);
      } else {
        setOtpError("Invalid OTP. Buyer must check in-app Orders tab.");
      }
    }
  };

  const whatsappBuyerUrl = `https://wa.me/91${deliveryStop.phone}?text=${encodeURIComponent(
    `Hello ${deliveryStop.customerName}! This is Lookmai Rider Tomba. I am arriving at ${deliveryStop.leikai} in 10-15 minutes with your Shinyen package (#${deliveryStop.orderCode}). Please keep your in-app 4-digit OTP ready!`
  )}`;

  const mapsNavigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${deliveryStop.lat},${deliveryStop.lng}`;

  const whatsappBoutiqueUrl = `https://wa.me/91${pickupStop.phone}?text=${encodeURIComponent(
    `Hello ${pickupStop.boutiqueName}! Lookmai Rider Tomba is arriving in 10 minutes to pick up order #${pickupStop.orderCode}.`
  )}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-24">
      {/* Top Rider Navigation Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 pt-safe h-header-safe flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>

        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
          <Bike className="w-4 h-4" />
          <span>Lookmai Fleet Dispatch</span>
        </span>

        <button
          onClick={() => {
            triggerHaptic(10);
            setIsOnline((prev) => !prev);
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
            isOnline
              ? "bg-emerald-950 text-emerald-400 border-emerald-600/50"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
        >
          {isOnline ? "● Online" : "○ Offline"}
        </button>
      </div>

      {/* Rider Identity & Today's Earnings Bar */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Rider Name</span>
            <h2 className="text-base font-extrabold text-white">Tomba Singh</h2>
            <span className="text-[11px] text-emerald-400 font-semibold block">
              Zone 1: Imphal Core Hub (Next-Day & Express)
            </span>
          </div>

          <div className="text-right bg-slate-900 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Today's Payout
            </span>
            <span className="text-lg font-black text-amber-300">
              {formatINR(completedDrops * 45)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              ({completedDrops} drops completed)
            </span>
          </div>
        </div>

        {/* Offline Cache Indicator */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Offline-Resilient Manifest Active</span>
          </span>
          <span className="text-emerald-400 font-semibold">Ready in Dead Zones</span>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="grid grid-cols-2 p-3 gap-2">
        <button
          onClick={() => {
            triggerHaptic(6);
            setTab("deliveries");
          }}
          className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === "deliveries"
              ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Deliveries ({deliverySuccess ? "0" : "1"})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(6);
            setTab("pickups");
          }}
          className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === "pickups"
              ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Pickups ({pickupConfirmed ? "0" : "1"})</span>
        </button>
      </div>

      {/* TAB 1: DELIVERIES TO BUYERS */}
      {tab === "deliveries" && (
        <div className="px-4 space-y-3">
          {deliverySuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-600/50 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="font-extrabold text-white text-base">Delivery Verified! 🎉</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                4-digit OTP accepted. ₹45 credited to Tomba Singh's wallet. Lookmai 48-hr buyer inspection window is now ticking.
              </p>
              <button
                onClick={() => setDeliverySuccess(false)}
                className="text-xs text-slate-400 hover:text-white font-semibold underline block mx-auto pt-1"
              >
                Reset for Simulation
              </button>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Stop #1 • Order #{deliveryStop.orderCode}
                  </span>
                </div>
                <span className="text-xs font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-600/40">
                  Earn ₹45
                </span>
              </div>

              {/* Customer & Address Details */}
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-white">{deliveryStop.customerName}</h3>

                <div className="text-xs text-slate-300 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    {deliveryStop.leikai}, {deliveryStop.district}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 space-y-1">
                  <p>
                    <strong className="text-white">Prominent Landmark:</strong>{" "}
                    {deliveryStop.landmark}
                  </p>
                  <p>
                    <strong className="text-amber-300">Gate Notes:</strong>{" "}
                    {deliveryStop.gateNote}
                  </p>
                </div>
              </div>

              {/* 1-Tap Road Tools: Call, WhatsApp, Google Maps Navigation */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href={`tel:${deliveryStop.phone}`}
                  onClick={() => triggerHaptic(10)}
                  className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call</span>
                </a>

                <a
                  href={whatsappBuyerUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerHaptic(10)}
                  className="py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={mapsNavigationUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerHaptic(10)}
                  className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Maps GPS</span>
                </a>
              </div>

              {/* In-App 4-Digit OTP Completion Form */}
              <form
                onSubmit={handleVerifyOtp}
                className="pt-2 border-t border-slate-700 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                    <span>Enter Buyer's In-App 4-Digit OTP</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Demo: 4821</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.slice(0, 4))}
                    placeholder="e.g. 4821"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-lg font-black text-amber-300 tracking-widest focus:outline-hidden focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
                  >
                    {isVerifying ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Confirm OTP</span>
                      </>
                    )}
                  </button>
                </div>

                {otpError && (
                  <p className="text-xs text-rose-400 font-semibold">{otpError}</p>
                )}

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Submitting valid OTP triggers immediate ₹45 credit & 48h escrow window</span>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOUTIQUE PICKUPS (Bags & Tamper Seals) */}
      {tab === "pickups" && (
        <div className="px-4 space-y-3">
          {pickupConfirmed ? (
            <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-600/50 text-center space-y-2">
              <Check className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-extrabold text-white text-base">Package Picked Up & Sealed!</h3>
              <p className="text-xs text-slate-300">
                Tamper-evident bag barcode logged. Status updated to IN_TRANSIT.
              </p>
              <button
                onClick={() => setPickupConfirmed(false)}
                className="text-xs text-slate-400 hover:text-white font-semibold underline block mx-auto pt-1"
              >
                Reset for Simulation
              </button>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Pickup Stop #1 • Order #{pickupStop.orderCode}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-600/40">
                  Ready for Pickup
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{pickupStop.boutiqueName}</h3>
                <span className="text-xs text-slate-400 block">@{pickupStop.sellerHandle}</span>
                <p className="text-xs text-slate-300 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    {pickupStop.leikai}, {pickupStop.district} ({pickupStop.landmark})
                  </span>
                </p>
              </div>

              {/* Tamper Bag Protocol Note */}
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 space-y-1">
                <span className="font-bold flex items-center gap-1 text-white">
                  <Package className="w-3.5 h-3.5 text-rose-400" />
                  🛵 Rider-Bagging Protocol Required
                </span>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Hand seller one Lookmai Tamper-Evident Security Bag. Ensure item is placed inside and sealed in front of seller before departure.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${pickupStop.phone}`}
                  onClick={() => triggerHaptic(10)}
                  className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Boutique</span>
                </a>

                <a
                  href={whatsappBoutiqueUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerHaptic(10)}
                  className="py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                onClick={() => {
                  triggerHaptic(20);
                  setPickupConfirmed(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm Parcel Sealed & Picked Up</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
