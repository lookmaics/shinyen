"use client";

import React from "react";
import { Check, ShieldCheck, MapPin, Package, Clock, ArrowRight, X } from "lucide-react";
import { formatINR, triggerHaptic } from "@/lib/utils";
import { useModalBackstack } from "@/hooks/useBackstack";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode: string;
  deliveryOtp: string;
  itemTitle: string;
  totalPaid: number;
  district: string;
  leikai: string;
  onViewOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  orderCode,
  deliveryOtp,
  itemTitle,
  totalPaid,
  district,
  leikai,
  onViewOrders,
}) => {
  useModalBackstack("order-confirmed", isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Celebration Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Order Confirmed & Escrow Locked!
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Order <span className="font-mono font-bold text-slate-800">{orderCode}</span> • {formatINR(totalPaid)}
            </p>
          </div>
        </div>

        {/* IN-APP 4-DIGIT DELIVERY OTP CARD (Zero SMS, Uber/Swiggy Model) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center space-y-2 shadow-md">
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Your In-App Delivery OTP</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-1">
            {deliveryOtp.split("").map((digit, idx) => (
              <span
                key={idx}
                className="w-11 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-mono text-2xl font-black text-amber-300 shadow-inner"
              >
                {digit}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-slate-300 leading-tight px-2">
            Give this 4-digit code to your Lookmai rider when they arrive at your doorstep. <strong className="text-white">Zero SMS needed!</strong>
          </p>
        </div>

        {/* Delivery Details Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Delivering to {leikai}, {district}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Item: <strong className="text-slate-800">{itemTitle}</strong>
          </p>
          <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Lookmai 48-hr Escrow:</span>
            <span className="font-semibold text-emerald-700">Active upon OTP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              triggerHaptic(10);
              onViewOrders();
              onClose();
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <span>View in My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-slate-500 hover:text-slate-700 font-bold text-xs rounded-xl text-center"
          >
            Back to Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
