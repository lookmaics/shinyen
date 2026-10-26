"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { StoriesCarousel } from "@/components/StoriesCarousel";
import { CategoryTabs, CategoryFilter } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { AuctionDrawer } from "@/components/AuctionDrawer";
import { CheckoutDrawer } from "@/components/CheckoutDrawer";
import { OrdersView } from "@/components/OrdersView";
import { NavigationBottom, NavTab } from "@/components/NavigationBottom";
import { FeedbackModal } from "@/components/FeedbackModal";
import { useModalBackstack, wasOverlayRecentlyClosed } from "@/hooks/useBackstack";
import { mockProducts, mockStories } from "@/data/mockProducts";
import { ProductItem } from "@/types";
import { triggerHaptic, formatINR } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import {
  Flame,
  ShieldCheck,
  Bike,
  Sparkles,
  Phone,
  MessageCircle,
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Package,
  Layers,
  Store,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<NavTab>("store");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedDistrict, setSelectedDistrict] = useState("Imphal West");
  const { cartCount, addToCart, clearCart } = useCart();
  const [activeOrderCount, setActiveOrderCount] = useState(1);
  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Drawers
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [auctionDrawerOpen, setAuctionDrawerOpen] = useState(false);
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);

  // Mobile Backstack Sync for page-level modals
  useModalBackstack("district-select", districtModalOpen, () => setDistrictModalOpen(false));

  const [exitToast, setExitToast] = useState(false);
  const lastBackPressRef = useRef(0);

  // Preserved Scroll Position across tabs
  const tabScrollRef = useRef<Record<NavTab, number>>({
    store: 0,
    drops: 0,
    orders: 0,
    profile: 0,
  });

  // Tab Backstack & Root Guard Synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const validTabs: NavTab[] = ["store", "drops", "orders", "profile"];
    const initialHash = window.location.hash.replace("#", "") as NavTab;

    if (validTabs.includes(initialHash)) {
      setCurrentTab(initialHash);
    } else {
      window.history.replaceState({ shinyen_root: true, tab: "store" }, "", "#store");
      window.history.pushState({ shinyen_active: true, tab: "store" }, "", "#store");
    }

    const handlePopState = () => {
      // If an overlay was closed by this pop gesture, don't change tabs or trigger exit toast
      if (wasOverlayRecentlyClosed()) {
        return;
      }

      const currentHash = window.location.hash.replace("#", "") as NavTab;

      if (validTabs.includes(currentHash)) {
        setCurrentTab(currentHash);
        // Restore scroll position
        requestAnimationFrame(() => {
          const savedY = tabScrollRef.current[currentHash] || 0;
          window.scrollTo({ top: savedY, behavior: "instant" });
        });
      } else {
        // Return to store tab
        setCurrentTab("store");
        requestAnimationFrame(() => {
          const savedY = tabScrollRef.current["store"] || 0;
          window.scrollTo({ top: savedY, behavior: "instant" });
        });

        // Double-back exit protection
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          window.history.back();
        } else {
          lastBackPressRef.current = now;
          setExitToast(true);
          setTimeout(() => setExitToast(false), 2000);
          window.history.pushState({ shinyen_active: true, tab: "store" }, "", "#store");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    if (tab === currentTab) {
      // Tap active tab to scroll smoothly to top (native iOS / Instagram mechanic)
      triggerHaptic(6);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 1. Save scroll position of current tab
    if (typeof window !== "undefined") {
      tabScrollRef.current[currentTab] = window.scrollY;
    }

    // 2. Micro haptic click (8ms)
    triggerHaptic(8);

    // 3. Update history & state
    window.history.pushState({ shinyen_tab: tab }, "", `#${tab}`);
    setCurrentTab(tab);

    // 4. Restore scroll position of destination tab on next frame
    requestAnimationFrame(() => {
      const savedY = tabScrollRef.current[tab] || 0;
      window.scrollTo({ top: savedY, behavior: "instant" });
    });
  };

  // Filter products based on tab and category
  const filteredProducts = mockProducts.filter((product) => {
    // TAB 1: STORE -> 100% Fixed Price Instant Buy Catalog
    if (currentTab === "store") {
      if (product.isAuction) return false;
    }

    // TAB 2: DROPS -> 100% Live Drops & Timed Auctions
    if (currentTab === "drops") {
      if (!product.isAuction || product.isSoldOut) return false;
    }

    if (selectedCategory === "all") return true;
    return product.category === selectedCategory;
  });

  const handleOpenProduct = (product: ProductItem) => {
    triggerHaptic(8);
    router.push(`/p/${product.id}`);
  };

  const handleQuickBid = (product: ProductItem) => {
    setSelectedProduct(product);
    setAuctionDrawerOpen(true);
  };

  const handleAddToCart = (product: ProductItem) => {
    addToCart(product);
  };

  const handleQuickBuy = (product: ProductItem) => {
    setSelectedProduct(product);
    setCheckoutDrawerOpen(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    setCheckoutDrawerOpen(false);
    setActiveOrderCount((prev) => prev + 1);
    setCurrentTab("orders");
  };

  return (
    <div className="flex-1 flex flex-col pb-24">
      {/* Top App Header */}
      <Header
        cartCount={cartCount}
        onCartClick={() => {
          handleSelectTab("orders");
        }}
        selectedDistrict={selectedDistrict}
        onLocationClick={() => setDistrictModalOpen(true)}
      />

      {/* District / Delivery Hub Selector Modal */}
      {districtModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">Select Delivery Hub</h3>
              </div>
              <button
                onClick={() => setDistrictModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Imphal Core offers 24-hr gig delivery. Outer districts route through PUDO partner shops or Winger counters.
            </p>
            <div className="space-y-2">
              {[
                { name: "Imphal West", type: "Core Hub (24-hr Doorstep ₹50)" },
                { name: "Imphal East", type: "Core Hub (24-hr Doorstep ₹50)" },
                { name: "Thoubal", type: "PUDO Hub (Thoubal Bazar Shop)" },
                { name: "Bishnupur", type: "PUDO Hub (Nambol / Moirang Bazar)" },
                { name: "Kakching", type: "PUDO Hub (Kakching Bazar Shop)" },
                { name: "Churachandpur", type: "Winger Counter (Khuman Lampak)" },
                { name: "Ukhrul", type: "Winger Counter (ISBT / Deulahland)" },
                { name: "Senapati", type: "Winger Counter (North Gate)" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setSelectedDistrict(item.name);
                    triggerHaptic(10);
                    setDistrictModalOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    selectedDistrict === item.name
                      ? "border-rose-600 bg-rose-50/50 text-rose-900 font-bold"
                      : "border-slate-100 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div>
                    <div className="text-sm">{item.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{item.type}</div>
                  </div>
                  {selectedDistrict === item.name && (
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: STORE / TAB 2: LIVE DROPS */}
      {(currentTab === "store" || currentTab === "drops") && (
            <div key={currentTab} className="tab-enter space-y-3">
              {/* Stories Carousel: STORE TAB ONLY */}
              {currentTab === "store" && (
                <StoriesCarousel
                  stories={mockStories}
                  onSelectStoryProduct={(productId) => {
                    const p = mockProducts.find((item) => item.id === productId);
                    if (p) handleOpenProduct(p);
                  }}
                />
              )}

              {/* STORE TAB ONLY: Live Drop Bridge Banner */}
              {currentTab === "store" && (
                <div
                  onClick={() => {
                    triggerHaptic(10);
                    handleSelectTab("drops");
                  }}
                  className="mx-4 p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white border border-rose-500/30 shadow-md cursor-pointer tap-depress relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shrink-0 shadow-sm">
                        <Flame className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white tracking-tight">
                            Sunday 8 PM Drop is LIVE
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-600 text-white animate-pulse">
                            ● 01h 42m left
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-1">
                          Rare archival Carhartt & Evisu selvedge denim up for bid
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>Enter Arena</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* DROPS TAB ONLY: High-Energy Live Drop Banner */}
              {currentTab === "drops" && (
                <div className="mx-4 p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wide">
                        <Flame className="w-4 h-4 fill-amber-300" /> Live Drop Arena
                      </div>
                      <h2 className="text-lg font-black tracking-tight mt-0.5">Sunday 8:00 PM Drop</h2>
                      <p className="text-xs text-white/90 mt-1 max-w-[260px]">
                        Anti-sniping soft close active (+2 mins on late bids). 1-of-1 archival grails.
                      </p>
                    </div>
                    <div className="bg-black/30 backdrop-blur-xs rounded-xl px-2.5 py-1.5 text-center border border-white/10 shrink-0">
                      <span className="text-[10px] uppercase font-bold text-white/70 block">Time Left</span>
                      <span className="text-sm font-black text-white">01h 42m</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Filter Tabs */}
              <CategoryTabs
                selected={selectedCategory}
                onSelect={(cat) => setSelectedCategory(cat)}
              />

              {/* Contextual Trust / Live Status Pill */}
              {currentTab === "store" ? (
                <div className="mx-4 py-2 px-3 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-between text-xs text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    Lookmai Escrow: 48h Inspection Window
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">Zero Dropshippers</span>
                </div>
              ) : (
                <div className="mx-4 py-2 px-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between text-xs text-rose-900">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Flame className="w-4 h-4 text-rose-600 fill-rose-600" />
                    Live Bidding Room ({filteredProducts.length} Grails)
                  </span>
                  <span className="text-[11px] text-rose-700 font-semibold">Verified WhatsApp Bidders</span>
                </div>
              )}

              {/* Product Grid */}
              <div className="px-4 grid grid-cols-2 gap-3 pb-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={handleOpenProduct}
                    onQuickBid={handleQuickBid}
                    onAddToCart={handleAddToCart}
                    onQuickBuy={handleQuickBuy}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS VIEW (OTP & Real-Time Tracking) */}
          {currentTab === "orders" && (
            <div key="orders" className="tab-enter">
              <OrdersView onExploreStore={() => handleSelectTab("store")} />
            </div>
          )}

          {/* TAB 4: PROFILE VIEW */}
          {currentTab === "profile" && (
            <div key="profile" className="tab-enter p-4 space-y-4 max-w-md mx-auto pb-24">
              <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
                  BD
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-bold text-slate-900">Bembem Devi</h2>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">+91 98620 ••••• (WhatsApp Inbound Linked)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Yaiskul Leirak, Imphal West</p>
                </div>
              </div>

              {/* Shopping & Delivery Preferences */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  Shopping & Delivery
                </span>

                {/* Delivery Location Preference */}
                <button
                  onClick={() => {
                    triggerHaptic(6);
                    setDistrictModalOpen(true);
                  }}
                  className="w-full bg-white text-slate-800 border border-slate-100 p-3.5 rounded-2xl font-semibold text-xs flex items-center justify-between hover:bg-slate-50 shadow-xs tap-depress transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-900 block">
                        Delivery Hub & Leikai
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {selectedDistrict} • Tap to change hub
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* My Purchases Quick Navigation */}
                <button
                  onClick={() => {
                    triggerHaptic(6);
                    handleSelectTab("orders");
                  }}
                  className="w-full bg-white text-slate-800 border border-slate-100 p-3.5 rounded-2xl font-semibold text-xs flex items-center justify-between hover:bg-slate-50 shadow-xs tap-depress transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-900 block">
                        My Purchases & Live Tracking
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {activeOrderCount > 0 ? `${activeOrderCount} order in transit` : "View past orders & receipts"}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Escrow Buyer Protection Guarantee */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 shadow-md">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    LOOKMAI 48h Unboxing Protection
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Every order on Shinyen is escrow-backed. Your payment is safely held until 48 hours after delivery. If the piece doesn’t match measurements or flaws were undisclosed, you get an instant 100% refund.
                </p>
              </div>

              {/* Customer Care & Feedback */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  Customer Care & Support
                </span>

                {/* WhatsApp Concierge Support */}
                <a
                  href="https://wa.me/919862000000"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerHaptic(8)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-50/60 text-emerald-900 text-xs font-bold hover:bg-emerald-100/70 shadow-xs tap-depress transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold">Lookmai Founder Concierge</span>
                      <span className="text-[11px] text-emerald-700 font-normal">
                        Direct WhatsApp support for sizing & deliveries
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                </a>

                {/* Report Bug / Feedback */}
                <button
                  onClick={() => {
                    triggerHaptic(6);
                    setFeedbackModalOpen(true);
                  }}
                  className="w-full bg-white text-slate-700 border border-slate-200/80 p-3 rounded-2xl font-bold text-xs flex items-center justify-between hover:bg-slate-50 shadow-xs tap-depress transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-slate-900">App Feedback & Suggestions</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Help us improve Shinyen for Manipur
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Entity & Trust Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Legal & Entity Transparency
                </span>
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">Shinyen (ꯁꯤꯟꯌꯦꯟ) Market Network</p>
                  <p>Operated by: <span className="font-medium text-slate-900">LOOKMAI</span> (Sole Proprietorship)</p>
                  <p>MSME Registration: <span className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-semibold">UDYAM-MN-05-0036092</span></p>
                  <p>Registered Address: Yaiskul Leirak, Imphal West, Manipur - 795001</p>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    Named after King Loiyumba’s historic edict <em>Loiyumba Shinyen</em> (1110–1122 CE), organizing the indigenous artisanal professions of Manipur.
                  </p>
                </div>
              </div>
            </div>
          )}

      {/* Fixed Bottom Navigation */}
      <NavigationBottom
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        activeOrderCount={activeOrderCount}
      />

      {/* Live Auction Pull-Up Drawer */}
      <AuctionDrawer
        product={selectedProduct}
        isOpen={auctionDrawerOpen}
        onClose={() => setAuctionDrawerOpen(false)}
        onBidPlaced={(amount) => {
          if (selectedProduct) {
            selectedProduct.currentBid = amount;
            selectedProduct.bidCount = (selectedProduct.bidCount || 0) + 1;
          }
        }}
      />

      {/* Manipur Reality Checkout Drawer */}
      <CheckoutDrawer
        product={selectedProduct}
        isOpen={checkoutDrawerOpen}
        onClose={() => setCheckoutDrawerOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Sentry Device Diagnostics & User Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />

      {/* Mobile Root Exit Prevention Toast */}
      {exitToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 border border-white/10">
          <span>Swipe back again to exit Shinyen</span>
        </div>
      )}
    </div>
  );
}
