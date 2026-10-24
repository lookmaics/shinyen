"use client";

import React, { useState, useRef } from "react";
import { formatINR, triggerHaptic } from "@/lib/utils";
import {
  compressListingImagesSequentially,
  CompressedImageDual,
} from "@/lib/imageCompression";
import { InstagramStoryCardModal } from "@/components/InstagramStoryCardModal";
import {
  Camera,
  Sparkles,
  Flame,
  Check,
  ShieldCheck,
  Share2,
  UploadCloud,
  Package,
  Wallet,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export const SellerStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"list" | "orders" | "wallet">("list");

  // Form State
  const [sellingMode, setSellingMode] = useState<"fixed_price" | "auction">("auction");
  const [category, setCategory] = useState<string>("thrift");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [size, setSize] = useState("L");
  const [chest, setChest] = useState("");
  const [length, setLength] = useState("");
  const [hasFlaw, setHasFlaw] = useState(false);
  const [flawNote, setFlawNote] = useState("");
  const [packMode, setPackMode] = useState<"rider_bag" | "self_pack">("rider_bag");

  // Compression & Upload State
  const [compressedPhotos, setCompressedPhotos] = useState<CompressedImageDual[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Success & Story Card Modal
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);

  // Order Center State (Simulated)
  const [orderReady, setOrderReady] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  // Handle Photo Selection with Sequential Client Compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    triggerHaptic(10);
    setIsCompressing(true);

    try {
      const results = await compressListingImagesSequentially(
        files,
        (current, total, text) => {
          setCompressProgress(text);
        }
      );

      setCompressedPhotos((prev) => [...prev, ...results].slice(0, 4));
      triggerHaptic(15);
    } catch (err) {
      console.error("Compression error:", err);
    } finally {
      setIsCompressing(false);
      setCompressProgress("");
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    setPublishedSuccess(true);
    setStoryModalOpen(true);
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Studio Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mb-0.5">
            <Sparkles className="w-4 h-4" />
            <span className="uppercase tracking-wider">Seller Studio</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Boutique Dashboard
          </h1>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> @imphalthrift
        </span>
      </div>

      {/* Top Studio Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => {
            triggerHaptic(5);
            setActiveTab("list");
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "list"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          + List Item
        </button>
        <button
          onClick={() => {
            triggerHaptic(5);
            setActiveTab("orders");
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "orders"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Pickups (1)
        </button>
        <button
          onClick={() => {
            triggerHaptic(5);
            setActiveTab("wallet");
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "wallet"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Wallet
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: 60-SECOND RAPID LISTING FORM                          */}
      {/* ============================================================ */}
      {activeTab === "list" && (
        <>
          {publishedSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Listing Published! 🎉</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your drop is now live on the Shinyen feed and ready for bidding or checkout.
              </p>
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setStoryModalOpen(true);
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Open 9:16 Instagram Story Card</span>
              </button>
              <button
                onClick={() => {
                  setPublishedSuccess(false);
                  setTitle("");
                  setPrice("");
                  setStartingBid("");
                  setCompressedPhotos([]);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 block pt-1 mx-auto"
              >
                + List Another Item
              </button>
            </div>
          ) : (
            <form onSubmit={handlePublish} className="space-y-4">
              {/* Step 1: Photos Upload with Sequential Compression */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    1. Photos (Auto-Compressed WebP)
                  </label>
                  <span className="text-[10px] text-slate-400">Max 4 photos</span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(5);
                      fileInputRef.current?.click();
                    }}
                    className="aspect-square rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-rose-50 active:scale-95 transition-all"
                  >
                    <Camera className="w-5 h-5 text-rose-600" />
                    <span className="text-[10px] font-bold text-rose-600">+ Photo</span>
                  </button>

                  {compressedPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                    >
                      <img
                        src={photo.thumbnailUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 p-0.5 text-center text-[8px] font-mono font-bold text-emerald-400">
                        {photo.gallerySizeKb}KB
                      </div>
                    </div>
                  ))}

                  {Array.from({ length: Math.max(0, 3 - compressedPhotos.length) }).map(
                    (_, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-[10px] text-slate-400"
                      >
                        Slot {compressedPhotos.length + idx + 2}
                      </div>
                    )
                  )}
                </div>

                {isCompressing ? (
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-800 text-[11px] font-semibold flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{compressProgress || "Optimizing photos for budget Android RAM..."}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 block">
                    ⚡ Generates dual output: 14KB feed thumbnail + 160KB full gallery WebP.
                  </span>
                )}
              </div>

              {/* Step 2: Title & Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  2. Title & Category
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Vintage 90s Carhartt Detroit Jacket"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: "thrift", label: "👗 Thrift" },
                    { id: "handloom", label: "🥻 Handloom" },
                    { id: "jewellery", label: "💎 Jewellery" },
                  ].map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => {
                        triggerHaptic(6);
                        setCategory(c.id);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        category === c.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Selling Mode (Instant Buy vs Auction) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  3. Selling Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setSellingMode("auction");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      sellingMode === "auction"
                        ? "border-red-600 bg-red-50 text-red-700 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                    <span>Live Drop Auction</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setSellingMode("fixed_price");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      sellingMode === "fixed_price"
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span>Instant Buy (Fixed)</span>
                  </button>
                </div>

                {sellingMode === "auction" ? (
                  <div className="pt-1.5 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">
                        Starting Bid (₹)
                      </span>
                      <input
                        type="number"
                        required
                        value={startingBid}
                        onChange={(e) => setStartingBid(e.target.value)}
                        placeholder="800"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">
                        Drop Duration
                      </span>
                      <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white">
                        <option>Sunday 8 PM Drop (24h)</option>
                        <option>15 Mins Flash Drop</option>
                        <option>3 Days Standard</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1.5">
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      Fixed Selling Price (₹)
                    </span>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1200"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>

              {/* Step 4: Sizing & Verified Measurements */}
              {category === "thrift" && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    4. Sizing & Measurements
                  </label>
                  <div className="flex gap-2">
                    {["S", "M", "L", "XL", "Oversized"].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => {
                          triggerHaptic(6);
                          setSize(s);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                          size === s
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">
                        Pit-to-Pit Chest (inches)
                      </span>
                      <input
                        type="number"
                        value={chest}
                        onChange={(e) => setChest(e.target.value)}
                        placeholder="e.g. 23"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">
                        Back Length (inches)
                      </span>
                      <input
                        type="number"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="e.g. 27"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Packaging Preference */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  5. Packaging Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(6);
                      setPackMode("rider_bag");
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs ${
                      packMode === "rider_bag"
                        ? "border-rose-600 bg-rose-50 text-slate-900"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="font-bold">🛵 Rider Bags at Door</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Rider seals parcel at pickup</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(6);
                      setPackMode("self_pack");
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs ${
                      packMode === "self_pack"
                        ? "border-rose-600 bg-rose-50 text-slate-900"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="font-bold">📦 Self-Pack (Starter Kit)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Add thank-you notes inside</div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish to Shinyen (0% Launch Promo)</span>
              </button>
            </form>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SELLER ORDER CENTER & PICKUP DISPATCH                 */}
      {/* ============================================================ */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Pickups (1)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Auto-dispatches to Gig Rider</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">
                  Buyer Paid • Escrow Locked
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">
                  Vintage 90s Carhartt Detroit Jacket
                </h3>
                <span className="text-xs text-slate-400">Order #SH-1049 • Size L</span>
              </div>
              <span className="text-base font-black text-slate-900">{formatINR(1850)}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <p><strong className="text-slate-800">Buyer Delivery:</strong> Bembem Devi (Yaiskul Leirak)</p>
              <p><strong className="text-slate-800">Packaging:</strong> {packMode === "rider_bag" ? "🛵 Rider provides tamper bag at door" : "📦 Seller boxed & sealed"}</p>
            </div>

            <button
              onClick={() => {
                triggerHaptic(15);
                setOrderReady((prev) => !prev);
              }}
              className={`w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                orderReady
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {orderReady ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Marked Ready! Rider Tomba Singh Dispatched</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>1-Tap "Ready for Rider Pickup"</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SELLER ESCROW WALLET & PAYOUTS                        */}
      {/* ============================================================ */}
      {activeTab === "wallet" && (
        <div className="space-y-3">
          {/* Escrow Balance Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Lookmai Escrow Wallet</span>
              <span className="text-[10px] bg-white/10 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                Daily 10 AM UPI Settled
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium block">
                  Available for Payout
                </span>
                <span className="text-xl font-black text-emerald-400">
                  {formatINR(5400)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium block">
                  In 48h Inspection Window
                </span>
                <span className="text-xl font-black text-amber-300">
                  {formatINR(3600)}
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span>Payout VPA: <strong>imphalthrift@okhdfcbank</strong></span>
              <span className="text-emerald-400 font-bold">● Active</span>
            </div>
          </div>

          {/* Request Immediate Payout Button */}
          <button
            onClick={() => {
              triggerHaptic(15);
              setPayoutRequested(true);
              setTimeout(() => setPayoutRequested(false), 4000);
            }}
            disabled={payoutRequested}
            className={`w-full py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border transition-all ${
              payoutRequested
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 active:scale-98"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>
              {payoutRequested
                ? "Payout Queued! UTR will arrive via WhatsApp"
                : `Instant UPI Payout (${formatINR(5400)})`}
            </span>
          </button>

          {/* Transparent Fee Schedule */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
            <span className="font-bold text-slate-900 text-xs block">
              Lookmai Category Platform Fees:
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">7%</span>
                <span className="text-slate-500">Thrift</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">8%</span>
                <span className="text-slate-500">Jewellery</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">5%</span>
                <span className="text-slate-500">Handloom</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              Zero payment gateway markup. 100% pass-through delivery fees (₹45 to rider, ₹3 bag pool, ₹2 transit safety pool).
            </p>
          </div>
        </div>
      )}

      {/* 9:16 Instagram Story Card Generator Modal */}
      <InstagramStoryCardModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        title={title || "Vintage 90s Carhartt Detroit Jacket"}
        priceOrBid={Number(sellingMode === "auction" ? startingBid || 800 : price || 1200)}
        isAuction={sellingMode === "auction"}
        category={category}
        sellerHandle="imphalthrift"
        imageUrl={
          compressedPhotos[0]?.galleryUrl ||
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"
        }
      />
    </div>
  );
};
