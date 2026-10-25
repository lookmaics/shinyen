"use client";

import React, { useState } from "react";
import { formatINR, triggerHaptic } from "@/lib/utils";
import { useModalBackstack } from "@/hooks/useBackstack";
import { useCart, CartItem } from "@/hooks/useCart";
import { CheckoutDrawer } from "@/components/CheckoutDrawer";
import {
  ShieldCheck,
  Package,
  Clock,
  Video,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Truck,
} from "lucide-react";

interface OrdersViewProps {
  initialSubTab?: "cart" | "orders";
  onExploreStore?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  initialSubTab = "cart",
  onExploreStore,
}) => {
  const [subTab, setSubTab] = useState<"cart" | "orders">(initialSubTab);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { items, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } =
    useCart();

  useModalBackstack("dispute-modal", showDisputeModal, () => setShowDisputeModal(false));

  const deliveryFee = 50;
  const grandTotal = cartTotal > 0 ? cartTotal + deliveryFee : 0;

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-28">
      {/* Page Title & Dual Segmented Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {subTab === "cart" ? "Your Shopping Bag" : "Your Orders"}
            </h1>
            <p className="text-xs text-slate-500">
              {subTab === "cart"
                ? "Review items and checkout with Lookmai Escrow"
                : "Track deliveries & view in-app pickup OTPs"}
            </p>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl gap-1 border border-slate-200/50">
          <button
            onClick={() => {
              triggerHaptic(6);
              setSubTab("cart");
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              subTab === "cart"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
            <span>My Cart</span>
            {cartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              triggerHaptic(6);
              setSubTab("orders");
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              subTab === "orders"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Package className="w-3.5 h-3.5 text-slate-700" />
            <span>Active Orders</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              1
            </span>
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: CART VIEW ======================= */}
      {subTab === "cart" && (
        <div className="space-y-3.5 animate-in fade-in">
          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="py-12 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Your Cart is Empty</h3>
                <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
                  Discover curated thrift streetwear, authentic handloom attire, and botanical jewellery.
                </p>
              </div>
              <button
                onClick={() => {
                  triggerHaptic(8);
                  onExploreStore?.();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs tap-depress shadow-sm"
              >
                <span>Explore Drops & Thrift</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Active Cart Items List */
            <>
              <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                <span className="font-semibold">{items.length} Unique Listing(s)</span>
                <button
                  onClick={() => {
                    triggerHaptic(6);
                    if (confirm("Remove all items from your cart?")) {
                      clearCart();
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 font-medium underline text-[11px]"
                >
                  Clear all
                </button>
              </div>

              {/* Items Card List */}
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 tap-depress transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-medium truncate">@{item.product.seller.handle}</span>
                        <span>•</span>
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md font-semibold">
                          {item.product.sizeTag}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-black text-slate-900">
                          {formatINR(item.product.price)}
                        </span>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="text-slate-600 hover:text-slate-900 p-0.5"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="text-slate-600 hover:text-slate-900 p-0.5"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery & Hub Callout */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-900">Lookmai Fast Delivery</span>
                    <span className="text-[10px] text-slate-500">
                      24-hr Doorstep in Imphal or PUDO pickup
                    </span>
                  </div>
                </div>
                <span className="font-bold text-slate-900">{formatINR(deliveryFee)}</span>
              </div>

              {/* Order Cost Breakdown */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal ({cartCount} {cartCount === 1 ? "piece" : "pieces"})</span>
                  <span className="font-semibold text-slate-800">{formatINR(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Gig Delivery Pass-Through</span>
                  <span className="font-semibold text-slate-800">{formatINR(deliveryFee)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-rose-600">{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Escrow Trust Assurance */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  <strong className="font-bold">48-Hour Inspection Escrow:</strong> Your money is held securely by Lookmai. The seller is only paid after you verify the fit and tamper seal.
                </p>
              </div>

              {/* Multi-Item Checkout Primary CTA */}
              <button
                onClick={() => {
                  triggerHaptic(15);
                  setCheckoutOpen(true);
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-between px-5 shadow-lg shadow-slate-900/10 tap-depress transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-rose-400" />
                  <span>Checkout All ({cartCount} items)</span>
                </div>
                <span className="font-black text-rose-400">{formatINR(grandTotal)} →</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* ======================= TAB 2: ACTIVE & PAST ORDERS ======================= */}
      {subTab === "orders" && (
        <div className="space-y-4 animate-in fade-in">
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
        </div>
      )}

      {/* Multi-Item Cart Checkout Drawer */}
      <CheckoutDrawer
        cartItems={items}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={() => {
          clearCart();
          setCheckoutOpen(false);
          setSubTab("orders");
        }}
      />

      {/* Dispute Modal */}
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
