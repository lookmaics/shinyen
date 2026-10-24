"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { ProductItem } from "@/types";
import { formatINR, triggerHaptic } from "@/lib/utils";
import leikaisData from "@/data/leikais.json";
import {
  getAvailableDeliveryOptions,
  DeliveryOption,
  calculatePlatformFee,
} from "@/lib/deliveryPricing";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { useModalBackstack } from "@/hooks/useBackstack";
import {
  MapPin,
  Navigation,
  ShieldCheck,
  X,
  Check,
  ArrowRight,
  MessageCircle,
  Truck,
  Building,
  Info,
} from "lucide-react";

interface CheckoutDrawerProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  // Mobile Backstack Sync (swiping back dismisses drawer instead of quitting PWA)
  useModalBackstack("checkout-drawer", isOpen, onClose);

  const [district, setDistrict] = useState("Imphal West");
  const [leikaiQuery, setLeikaiQuery] = useState("");
  const [selectedLeikai, setSelectedLeikai] = useState("Yaiskul Leirak");
  const [landmark, setLandmark] = useState("");
  const [gateNote, setGateNote] = useState("");
  const [phone, setPhone] = useState("9862000000");

  // GPS & Pricing State
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Delivery Options based on District
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>("std_doorstep");

  // Post-payment Confirmation Modal State
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderCode: string;
    deliveryOtp: string;
    totalPaid: number;
  } | null>(null);

  useEffect(() => {
    const options = getAvailableDeliveryOptions(district);
    setDeliveryOptions(options);
    if (options.length > 0) {
      setSelectedDeliveryMethod(options[0].id);
    }
  }, [district]);

  if (!product) return null;

  const currentDeliveryOption =
    deliveryOptions.find((o) => o.id === selectedDeliveryMethod) || deliveryOptions[0];
  const deliveryFee = currentDeliveryOption?.fee || 50;
  const totalAmount = product.price + deliveryFee;

  // Platform fee calculation
  const { platformFeeAmount } = calculatePlatformFee(product.price, product.category);

  // Filter leikais based on search and district
  const filteredLeikais = leikaisData.filter(
    (l) => l.district === district && l.name.toLowerCase().includes(leikaiQuery.toLowerCase())
  );

  const handleCaptureGps = () => {
    triggerHaptic(12);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGpsLoading(false);
        triggerHaptic(20);
      },
      () => {
        setIsGpsLoading(false);
        // Fallback gracefully for indoor tin roofs
        alert("GPS signal low under indoor roof. Your landmark will guide the rider.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handlePayUpi = async (upiApp: string) => {
    triggerHaptic(15);
    setIsProcessing(true);

    try {
      // 1. Call Create Order API
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          sellerId: product.sellerId,
          buyerName: "Bembem Devi",
          phone,
          district,
          leikai: selectedLeikai,
          landmark: landmark || "Near Community Hall",
          gateNotes: gateNote,
          lat: gpsCoords?.lat,
          lng: gpsCoords?.lng,
          deliveryMethod: selectedDeliveryMethod,
          deliveryFee,
          itemAmount: product.price,
          platformFee: platformFeeAmount,
          upiApp,
        }),
      });

      const data = await res.json();

      setIsProcessing(false);
      onClose();

      // 2. Open Order Confirmation Modal with 4-Digit In-App Delivery OTP
      setConfirmedOrder({
        orderCode: data.orderCode || `SH-${Math.floor(1000 + Math.random() * 9000)}`,
        deliveryOtp: data.deliveryOtp || String(Math.floor(1000 + Math.random() * 9000)),
        totalPaid: totalAmount,
      });

      onOrderSuccess(data.orderCode);
    } catch (err) {
      // Offline fallback
      setIsProcessing(false);
      onClose();
      setConfirmedOrder({
        orderCode: `SH-${Math.floor(1000 + Math.random() * 9000)}`,
        deliveryOtp: "4821",
        totalPaid: totalAmount,
      });
      onOrderSuccess("SH-1049");
    }
  };

  return (
    <>
      <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[28px] fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto max-h-[92vh] overflow-hidden focus:outline-hidden shadow-2xl">
            <div className="pt-3 pb-2 flex justify-center cursor-grab">
              <div className="w-12 h-1.5 rounded-full bg-slate-200" />
            </div>

            <div className="p-5 flex-1 overflow-y-auto pb-safe space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Secure Escrow Checkout
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Product Summary */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
                  <span className="text-[11px] text-slate-500 block">From @{product.seller.handle}</span>
                  <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">
                    {formatINR(product.price)}
                  </span>
                </div>
              </div>

              {/* Manipur Reality Address Form */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Delivery Destination
                  </span>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isGpsLoading}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 active:scale-95 transition-all"
                  >
                    <Navigation className={`w-3 h-3 ${isGpsLoading ? "animate-spin" : ""}`} />
                    <span>{gpsCoords ? "GPS Pin Captured ✅" : "1-Tap GPS Pin"}</span>
                  </button>
                </div>

                {/* District Dropdown */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    District Hub
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setLeikaiQuery("");
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option>Imphal West</option>
                    <option>Imphal East</option>
                    <option>Thoubal</option>
                    <option>Kakching</option>
                    <option>Bishnupur</option>
                    <option>Churachandpur</option>
                    <option>Ukhrul</option>
                    <option>Senapati</option>
                  </select>
                </div>

                {/* Tiered Delivery Method Selection */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Delivery Mode for {district}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {deliveryOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          triggerHaptic(6);
                          setSelectedDeliveryMethod(opt.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedDeliveryMethod === opt.id
                            ? "border-rose-600 bg-rose-50/70 text-slate-900 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{opt.name}</span>
                          <span className="font-extrabold text-xs text-rose-600">
                            {formatINR(opt.fee)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {opt.estimatedHours}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leikai Autocomplete */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Leikai / Locality ({filteredLeikais.length} in {district})
                  </label>
                  <input
                    type="text"
                    value={leikaiQuery || selectedLeikai}
                    onChange={(e) => {
                      setLeikaiQuery(e.target.value);
                      setSelectedLeikai(e.target.value);
                    }}
                    placeholder="Type leikai (e.g. Yaiskul, Uripok, Wangkhei)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                  {leikaiQuery && filteredLeikais.length > 0 && (
                    <div className="mt-1 max-h-32 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-lg p-1 divide-y divide-slate-100 z-10">
                      {filteredLeikais.map((l) => (
                        <button
                          type="button"
                          key={l.id}
                          onClick={() => {
                            setSelectedLeikai(l.name);
                            setLeikaiQuery("");
                            triggerHaptic(6);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-800 hover:bg-slate-100 rounded-lg"
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mandatory Landmark */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Prominent Landmark <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Achom Leikai Club, Beside Waiting Shed"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Gate / House Note */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    House / Gate Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={gateNote}
                    onChange={(e) => setGateNote(e.target.value)}
                    placeholder="e.g. Green gate with two coconut trees"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Bill Summary with Fee Transparency */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Item Subtotal</span>
                  <span>{formatINR(product.price)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>
                    Delivery ({currentDeliveryOption?.name || district})
                  </span>
                  <span>{formatINR(deliveryFee)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>Total Payable</span>
                  <span className="text-rose-600">{formatINR(totalAmount)}</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Pass-Through Breakdown:</span>
                  <span>
                    ₹{currentDeliveryOption?.riderCut} Rider • ₹{currentDeliveryOption?.bagPool} Tamper Bag • ₹{currentDeliveryOption?.insurancePool} Safety
                  </span>
                </div>
              </div>

              {/* UPI 1-Tap Payment Buttons */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Pay with 1-Tap UPI
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handlePayUpi("PhonePe")}
                    className="py-3 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span>PhonePe</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handlePayUpi("Google Pay")}
                    className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span>Google Pay</span>
                  </button>
                </div>
              </div>

              {/* Escrow Assurance */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Payment held in Lookmai Escrow until in-app OTP verification</span>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Post-Payment Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          isOpen={Boolean(confirmedOrder)}
          onClose={() => setConfirmedOrder(null)}
          orderCode={confirmedOrder.orderCode}
          deliveryOtp={confirmedOrder.deliveryOtp}
          itemTitle={product.title}
          totalPaid={confirmedOrder.totalPaid}
          district={district}
          leikai={selectedLeikai}
          onViewOrders={() => {
            setConfirmedOrder(null);
            onOrderSuccess(confirmedOrder.orderCode);
          }}
        />
      )}
    </>
  );
};
