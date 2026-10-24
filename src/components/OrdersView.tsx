"use client";

import React, { useState } from "react";
import { formatINR, triggerHaptic } from "@/lib/utils";
import { useModalBackstack } from "@/hooks/useBackstack";
import { ShieldCheck, Package, Clock, Video, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";

export const OrdersView: React.FC = () => {
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  useModalBackstack("dispute-modal", showDisputeModal, () => setShowDisputeModal(false));

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Orders</h1>
          <p className="text-xs text-slate-500">Track deliveries & view in-app pickup OTPs</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
          1 Active
        </span>
      </div>

      {/* ACTIVE ORDER CARD: In-Transit with In-App 4-Digit OTP */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        {/* Status Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Out for Delivery
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Order #SH-1049</span>
        </div>

        {/* Product Summary */}
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=200&q=80"
            alt="Product"
            className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              Vintage 90s Carhartt Detroit Duck Canvas Jacket
            </h4>
            <span className="text-[11px] text-slate-500 block">From @imphalthrift • Size L</span>
            <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">
              {formatINR(1850)}
            </span>
          </div>
        </div>

        {/* THE IN-APP 4-DIGIT DELIVERY OTP CARD (Zero SMS Cost!) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider block">
              Your Delivery Passcode (Show to Rider)
            </span>
            <span className="text-xs text-amber-300 font-semibold">
              Rider arriving at Yaiskul Leirak
            </span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 font-mono font-black text-xl tracking-widest shadow-inner">
            4821
          </div>
        </div>

        {/* Delivery Address & Status */}
        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
          <div>
            <span className="font-semibold text-slate-700">Delivery Address: </span>
            <span>House No. 5, Yaiskul Leirak (Near Community Club), Imphal West</span>
          </div>
          <div className="text-slate-500">
            Fulfillment: Standard Next-Day Delivery (Tamper-Evident Shinyen Seal)
          </div>
        </div>
      </div>

      {/* COMPLETED ORDER CARD: 48-Hour Escrow Inspection Window */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Delivered • In Inspection
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Order #SH-1022</span>
        </div>

        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=80"
            alt="Jewellery"
            className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              Pressed Wild Hydrangea Botanical Drop Earrings
            </h4>
            <span className="text-[11px] text-slate-500 block">From @mayaresin</span>
            <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">
              {formatINR(480)}
            </span>
          </div>
        </div>

        {/* 48-Hour Inspection Countdown Badge */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-semibold">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>26 hours left in inspection</span>
          </div>
          <button
            onClick={() => {
              triggerHaptic(10);
              setShowDisputeModal(true);
            }}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
          >
            Report Issue
          </button>
        </div>
      </div>

      {/* Dispute Modal (Explaining Continuous Unboxing Video Policy) */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Return / Dispute Protocol</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To protect both buyers and local artisans against scams, returns require a **continuous, uncut unboxing video** starting with the unbroken Shinyen tamper-evident seal.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-[11px] text-slate-700">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Upload unboxing clip (Max 60s / 50MB)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reviewed by Lookmai team within 24 hours</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  triggerHaptic(12);
                  alert("Please attach unboxing video file (Simulation).");
                  setShowDisputeModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-xs"
              >
                Choose Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
