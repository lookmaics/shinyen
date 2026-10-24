"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { mockProducts } from "@/data/mockProducts";
import { ProductItem } from "@/types";
import { formatINR, triggerHaptic } from "@/lib/utils";
import { AuctionDrawer } from "@/components/AuctionDrawer";
import { CheckoutDrawer } from "@/components/CheckoutDrawer";
import {
  ArrowLeft,
  Share2,
  ShieldCheck,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Ruler,
  Check,
  ShoppingBag,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Drawers
  const [auctionDrawerOpen, setAuctionDrawerOpen] = useState(false);
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);

  useEffect(() => {
    const found = mockProducts.find((p) => p.id === productId);
    if (found) {
      setProduct(found);
    }
  }, [productId]);

  // Live countdown timer for active auctions
  useEffect(() => {
    if (!product || !product.isAuction || !product.endTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(product.endTime!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Auction Ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}h ${minutes
          .toString()
          .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This drop may have concluded or the link is expired.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  const handleShare = async () => {
    triggerHaptic(10);
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} on Shinyen (ꯁꯤꯟꯌꯦꯟ):`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled or failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  const toggleFollow = () => {
    triggerHaptic(15);
    setIsFollowing((prev) => !prev);
  };

  return (
    <div className="ios-page-enter min-h-screen bg-slate-50 flex flex-col pb-28">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-safe h-header-safe flex items-center justify-between">
        <button
          onClick={() => {
            triggerHaptic(8);
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="p-2 -ml-2 text-slate-700 hover:text-slate-900 rounded-full active:bg-slate-100 tap-depress"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider truncate max-w-[200px]">
          {product.category === "thrift"
            ? "Curated Thrift"
            : product.category === "handloom"
            ? "Traditional Handloom"
            : "Handcrafted Jewels"}
        </span>

        <button
          onClick={handleShare}
          className="p-2 -mr-2 text-slate-700 hover:text-slate-900 rounded-full active:bg-slate-100"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Share Toast */}
      {sharedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-in fade-in">
          Link copied to clipboard!
        </div>
      )}

      {/* Main Image Gallery */}
      <div className="relative w-full aspect-4/5 bg-slate-100 overflow-hidden">
        <img
          src={product.images[selectedImageIndex] || product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover"
        />

        {/* Thumbnail Selector Dots / Bar */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  triggerHaptic(5);
                  setSelectedImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  selectedImageIndex === idx
                    ? "w-5 bg-white shadow-xs"
                    : "bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        )}

        {/* Live Auction Badge */}
        {product.isAuction && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/95 text-white text-xs font-black shadow-lg backdrop-blur-xs">
            <Flame className="w-4 h-4 fill-white animate-pulse" />
            <span>LIVE DROP AUCTION</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-4">
        {/* Title & Pricing */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-lg font-extrabold text-slate-900 leading-snug">
              {product.title}
            </h1>
            <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase">
              {product.sizeTag}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-rose-600">
              {formatINR(product.isAuction ? product.currentBid || product.price : product.price)}
            </span>
            {product.isAuction ? (
              <span className="text-xs text-slate-400 font-medium">
                Current Leading Bid ({product.bidCount || 0} bids)
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Fixed Price</span>
            )}
          </div>

          {/* Auction Countdown Box */}
          {product.isAuction && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50/70 border border-rose-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900">
                <Clock className="w-4 h-4 text-rose-600 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-wide">Closing In:</span>
              </div>
              <span className="font-mono text-sm font-black text-rose-700">{timeLeft}</span>
            </div>
          )}
        </div>

        {/* Category-Smart Sizing Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-rose-600" /> Sizing & Fit Breakdown
            </span>
            {product.isVerifiedFit && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Measured by Hand
              </span>
            )}
          </div>

          {product.category === "thrift" ? (
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tag Size</span>
                <span className="text-sm font-black text-slate-800">{product.sizeTag}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Chest (Pit-to-Pit)</span>
                <span className="text-sm font-black text-slate-800">{product.chestInches || "23"}" in</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Back Length</span>
                <span className="text-sm font-black text-slate-800">{product.lengthInches || "26.5"}" in</span>
              </div>
            </div>
          ) : product.category === "handloom" ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p><span className="font-semibold text-slate-900">Format:</span> Free Size / Unstitched Ceremonial Handloom</p>
              <p><span className="font-semibold text-slate-900">Dimensions:</span> Standard Traditional 2.25m x 1.15m drape</p>
              <p><span className="font-semibold text-slate-900">Loom Type:</span> Traditional Wooden Fly-Shuttle Frame Loom</p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p><span className="font-semibold text-slate-900">Standard Fit:</span> Lightweight hypoallergenic hooks</p>
              <p><span className="font-semibold text-slate-900">Handcraft:</span> UV-stabilized jewelry grade resin with genuine botanicals</p>
            </div>
          )}
        </div>

        {/* Natural Flaw Transparency Disclosure (Thrift) */}
        {product.hasFlaw && (
          <div className="bg-amber-50/70 border border-amber-200/70 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Vintage Flaw Transparency Guarantee</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              {product.flawNote || "Minor natural vintage distress consistent with authentic 90s wear. Photographed and verified before listing."}
            </p>
          </div>
        )}

        {/* Item Description */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Artisan & Piece Details
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Followable Boutique Mini-Profile */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <Link
            href={`/${product.seller.handle}`}
            className="flex items-center gap-3 group"
          >
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-12 h-12 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  {product.seller.name}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 fill-rose-100" />
              </div>
              <span className="text-xs text-slate-400 block">@{product.seller.handle}</span>
              <span className="text-[11px] text-slate-500 font-medium">
                {product.seller.rating} ★ • {product.seller.totalSales} drops completed
              </span>
            </div>
          </Link>

          <button
            onClick={toggleFollow}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              isFollowing
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isFollowing ? "Following" : "+ Follow"}
          </button>
        </div>

        {/* Lookmai Escrow Guarantee Box */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1.5 shadow-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-white tracking-wide">
              LOOKMAI Anti-Counterfeit Escrow
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Seller payment is locked in escrow for 48 hours post-delivery. If the piece doesn’t match measurements or descriptions, upload your unboxing video for a 100% instant refund.
          </p>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 p-3 max-w-md mx-auto">
        {product.isAuction ? (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Leading Bid</span>
              <span className="text-base font-black text-rose-600">
                {formatINR(product.currentBid || product.price)}
              </span>
            </div>
            <button
              onClick={() => {
                triggerHaptic(15);
                setAuctionDrawerOpen(true);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-200 tap-depress transition-all"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Place Bid (Quick +₹50)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
              <span className="text-base font-black text-slate-900">{formatINR(product.price)}</span>
            </div>
            <button
              onClick={() => {
                triggerHaptic(15);
                setCheckoutDrawerOpen(true);
              }}
              className="flex-1 py-3 bg-slate-900 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg tap-depress transition-all hover:bg-slate-800"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Instant Checkout (UPI)</span>
            </button>
          </div>
        )}
      </div>

      {/* Auction Drawer */}
      <AuctionDrawer
        product={product}
        isOpen={auctionDrawerOpen}
        onClose={() => setAuctionDrawerOpen(false)}
        onBidPlaced={(amount) => {
          setProduct({
            ...product,
            currentBid: amount,
            bidCount: (product.bidCount || 0) + 1,
          });
        }}
      />

      {/* Checkout Drawer */}
      <CheckoutDrawer
        product={product}
        isOpen={checkoutDrawerOpen}
        onClose={() => setCheckoutDrawerOpen(false)}
        onOrderSuccess={(orderId) => {
          setCheckoutDrawerOpen(false);
          router.push("/");
        }}
      />
    </div>
  );
}
