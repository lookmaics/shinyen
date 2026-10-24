"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { mockSellers, mockProducts } from "@/data/mockProducts";
import { formatINR, triggerHaptic } from "@/lib/utils";
import {
  ArrowLeft,
  Share2,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Grid,
  Flame,
  Sparkles,
  Users,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function BoutiqueProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawHandle = (params?.handle as string) || "";
  const cleanHandle = rawHandle.replace(/^@/, "");

  const seller = mockSellers[cleanHandle];
  const [activeTab, setActiveTab] = useState<"items" | "drops" | "community">("items");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(seller ? seller.followerCount : 0);

  // If seller doesn't exist, show not found
  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold text-slate-800">Boutique Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          No verified artisan or boutique found at @{cleanHandle}.
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

  // Filter products belonging to this seller
  const sellerProducts = mockProducts.filter((p) => p.sellerId === seller.id);
  const activeDrops = sellerProducts.filter((p) => p.isAuction && !p.isSoldOut);

  // Community fit checks mock data for this boutique
  const communityPhotos = [
    {
      id: "fit-1",
      imageUrl: sellerProducts[0]?.images[0] || seller.avatar,
      customerName: "Jenny M.",
      leikai: "Uripok, Imphal West",
      quote: "Fit is perfect! Pit-to-pit 23 was 100% accurate.",
      rating: 5,
    },
    {
      id: "fit-2",
      imageUrl: sellerProducts[0]?.images[1] || seller.avatar,
      customerName: "Thoiba S.",
      leikai: "Singjamei, Imphal West",
      quote: "Arrived in 24 hours via Lookmai rider. Amazing condition.",
      rating: 5,
    },
  ];

  const handleToggleFollow = () => {
    triggerHaptic(15);
    if (isFollowing) {
      setFollowers((prev) => prev - 1);
      setIsFollowing(false);
    } else {
      setFollowers((prev) => prev + 1);
      setIsFollowing(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-safe h-header-safe flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-700 hover:text-slate-900 rounded-full active:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          @{seller.handle}
        </span>

        <button
          onClick={() => {
            triggerHaptic(10);
            if (navigator.share) {
              navigator.share({
                title: seller.name,
                text: `Check out @${seller.handle} on Shinyen:`,
                url: window.location.href,
              });
            }
          }}
          className="p-2 -mr-2 text-slate-700 hover:text-slate-900 rounded-full active:bg-slate-100"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Boutique Aesthetic Banner & Profile Section */}
      <div className="bg-white border-b border-slate-100 p-5 space-y-4">
        {/* Profile Avatar & Primary Stats */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={seller.avatar}
              alt={seller.name}
              className="w-18 h-18 rounded-full object-cover ring-3 ring-rose-500/20 shadow-md"
            />
            {seller.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-rose-600 fill-rose-50" />
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-3 text-center divide-x divide-slate-100">
            <div>
              <span className="text-base font-black text-slate-900 block">
                {sellerProducts.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Items</span>
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block">
                {seller.totalSales}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Sales</span>
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block">
                {followers.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Followers</span>
            </div>
          </div>
        </div>

        {/* Bio, Name & Local Badge */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-black text-slate-900">{seller.name}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {seller.rating} ★
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {seller.bio}
          </p>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{seller.location}</span>
          </div>
        </div>

        {/* Action Buttons: Follow & WhatsApp Concierge */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleToggleFollow}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
              isFollowing
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isFollowing ? "Following" : "+ Follow Boutique"}
          </button>

          <a
            href={`https://wa.me/919862000000?text=Hi%20${encodeURIComponent(seller.name)},%20I%20saw%20your%20boutique%20on%20Shinyen`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Chat</span>
          </a>
        </div>
      </div>

      {/* Profile Sub-Navigation Tabs */}
      <div className="bg-white border-b border-slate-100 grid grid-cols-3 text-center text-xs font-bold sticky top-header-safe z-30">
        <button
          onClick={() => {
            triggerHaptic(5);
            setActiveTab("items");
          }}
          className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === "items"
              ? "border-rose-600 text-rose-600 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>All Items</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(5);
            setActiveTab("drops");
          }}
          className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === "drops"
              ? "border-rose-600 text-rose-600 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Live Drops ({activeDrops.length})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(5);
            setActiveTab("community");
          }}
          className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === "community"
              ? "border-rose-600 text-rose-600 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Fit Checks</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Items Grid (3-column Instagram Style) */}
      {activeTab === "items" && (
        <div className="p-3">
          {sellerProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No active listings yet from this boutique.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sellerProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/p/${item.id}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-xs"
                >
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                    <span className="text-[11px] font-black text-white">
                      {formatINR(item.isAuction ? item.currentBid || item.price : item.price)}
                    </span>
                    {item.isAuction && (
                      <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: Active Drops & Auctions */}
      {activeTab === "drops" && (
        <div className="p-4 space-y-3">
          {activeDrops.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-xs text-slate-400">
              No live drop auctions currently open. Check Sunday 8:00 PM!
            </div>
          ) : (
            activeDrops.map((drop) => (
              <Link
                key={drop.id}
                href={`/p/${drop.id}`}
                className="block bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-rose-200 transition-all space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={drop.images[0]}
                    alt={drop.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Live Auction
                      </span>
                      <span className="text-[11px] text-slate-400">{drop.bidCount || 0} bids</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 truncate mt-1">
                      {drop.title}
                    </h3>
                    <span className="text-sm font-black text-rose-600 block mt-0.5">
                      Leading Bid: {formatINR(drop.currentBid || drop.price)}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT 3: Worn by Community / Fit-Check Gallery */}
      {activeTab === "community" && (
        <div className="p-4 space-y-3">
          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs text-rose-900">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-600" />
              Verified Manipur Buyer Fit Checks
            </span>
            <span className="text-[10px] text-rose-700 font-bold">100% Real</span>
          </div>

          <div className="space-y-3">
            {communityPhotos.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {item.customerName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900">{item.customerName}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                    </div>
                    <span className="text-[10px] text-slate-400">{item.leikai}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic">"{item.quote}"</p>

                <div className="w-full aspect-16/10 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.customerName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
