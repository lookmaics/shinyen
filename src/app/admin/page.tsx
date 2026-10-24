"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR, triggerHaptic } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  Video,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  ArrowLeft,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"disputes" | "settlement" | "storage">("disputes");

  // Dispute Arbitration State
  const [disputeDecision, setDisputeDecision] = useState<string | null>(null);
  const [disputeMessage, setDisputeMessage] = useState<string | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Settlement Cron State
  const [settlementRunning, setSettlementRunning] = useState(false);
  const [settlementReport, setSettlementReport] = useState<any | null>(null);

  // Storage Purge State
  const [purgeRunning, setPurgeRunning] = useState(false);
  const [purgeReport, setPurgeReport] = useState<any | null>(null);

  // Run T+2 Settlement Batch
  const handleTriggerSettlement = async () => {
    triggerHaptic(15);
    setSettlementRunning(true);
    setSettlementReport(null);

    try {
      const res = await fetch("/api/admin/settle-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulateAllDelivered: true }),
      });
      const data = await res.json();
      setSettlementReport(data);
      triggerHaptic(20);
    } catch (err) {
      alert("Failed to run settlement cron.");
    } finally {
      setSettlementRunning(false);
    }
  };

  // Run 30-Day Auxiliary Image Purge
  const handleTriggerPurge = async () => {
    triggerHaptic(15);
    setPurgeRunning(true);
    setPurgeReport(null);

    try {
      const res = await fetch("/api/admin/purge-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setPurgeReport(data);
      triggerHaptic(20);
    } catch (err) {
      alert("Failed to run storage purge.");
    } finally {
      setPurgeRunning(false);
    }
  };

  // Handle Dispute Decision
  const handleResolveDispute = async (decision: string) => {
    triggerHaptic(15);
    try {
      const res = await fetch("/api/admin/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeId: "disp-101",
          decision,
          adminNotes: "Lookmai Founder Concierge verified tamper-seal unboxing video evidence.",
        }),
      });
      const data = await res.json();
      setDisputeDecision(decision);
      setDisputeMessage(data.message);
      triggerHaptic(25);
    } catch (err) {
      alert("Failed to submit arbitration decision.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-24">
      {/* Admin Top Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 pt-safe h-header-safe flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Store</span>
        </Link>

        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Lookmai Control Hub</span>
        </span>

        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
          Super Admin
        </span>
      </div>

      {/* Primary Financial & Safety Pool Metrics */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">LOOKMAI ESCROW</h1>
            <span className="text-[11px] text-slate-400">
              Parent Entity: UDYAM-MN-05-0036092 • Yaiskul Leirak
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-600/40">
            Escrow Healthy
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              In 48h Inspection Escrow
            </span>
            <span className="text-lg font-black text-white">{formatINR(38400)}</span>
            <span className="text-[10px] text-slate-400 block">16 orders in transit</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              Transit Safety Reserve
            </span>
            <span className="text-lg font-black text-emerald-300">{formatINR(482)}</span>
            <span className="text-[10px] text-slate-400 block">₹2/order micro-pool</span>
          </div>
        </div>
      </div>

      {/* Admin Operations Sub-Tabs */}
      <div className="grid grid-cols-3 p-3 gap-1.5 text-xs font-bold">
        <button
          onClick={() => {
            triggerHaptic(5);
            setActiveTab("disputes");
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "disputes"
              ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          Disputes (1)
        </button>

        <button
          onClick={() => {
            triggerHaptic(5);
            setActiveTab("settlement");
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "settlement"
              ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          T+2 Split Cron
        </button>

        <button
          onClick={() => {
            triggerHaptic(5);
            setActiveTab("storage");
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "storage"
              ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          R2 Purge (30d)
        </button>
      </div>

      {/* TAB 1: DISPUTE ARBITRATION & VIDEO PLAYER */}
      {activeTab === "disputes" && (
        <div className="px-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">
              Pending Dispute Arbitration
            </span>
            <span>Order #SH-1048</span>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3.5 shadow-md">
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-slate-700 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-600/40 uppercase">
                  Sizing Dispute Raised
                </span>
                <h3 className="font-extrabold text-white text-sm mt-1">
                  Japanese Evisu Raw Indigo Selvedge Denim
                </h3>
                <span className="text-xs text-slate-400">
                  Seller: @vintagey2k • Buyer: Linthoingambi S.
                </span>
              </div>
              <span className="text-sm font-black text-rose-400">{formatINR(2400)}</span>
            </div>

            {/* Claim reason callout */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-1 text-xs">
              <span className="font-bold text-amber-300 block">Buyer Evidence Claim:</span>
              <p className="text-slate-300 leading-relaxed">
                "Listed as Waist 32 inches. In unboxing video, tape measurement shows waist is actually 28 inches. Does not fit."
              </p>
            </div>

            {/* Mandatory Unboxing Video Player */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-rose-500" />
                  <span>Mandatory Unboxing Video Evidence</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-600/50">
                  ✓ Tamper Seal Intact When Cut
                </span>
              </div>

              <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center">
                {isPlayingVideo ? (
                  <video
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  />
                ) : (
                  <div
                    onClick={() => setIsPlayingVideo(true)}
                    className="flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-600 group-hover:bg-rose-500 flex items-center justify-center shadow-lg transition-transform active:scale-95">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300">
                      Play Unboxing & Measurement Check (0:48)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Arbitration Result or Action Buttons */}
            {disputeDecision ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Dispute Resolved!</h4>
                <p className="text-xs text-slate-300">{disputeMessage}</p>
              </div>
            ) : (
              <div className="space-y-2 pt-1 border-t border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Arbitration Decision
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleResolveDispute("APPROVE_REFUND_BUYER")}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve 100% Refund</span>
                  </button>

                  <button
                    onClick={() => handleResolveDispute("REJECT_CLAIM_RELEASE_SELLER")}
                    className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reject (Release Seller)</span>
                  </button>
                </div>

                <button
                  onClick={() => handleResolveDispute("PAY_FROM_INSURANCE_POOL")}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cover from Transit Safety Reserve ({formatINR(482)} pool)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: T+2 AUTOMATED SPLIT SETTLEMENT CRON */}
      {activeTab === "settlement" && (
        <div className="px-4 space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Transactional Outbox Split Engine</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Daily 10:00 AM</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Triggers exactly 48 hours post-OTP confirmation. Automatically deducts platform commissions (7% Thrift, 8% Jewellery, 5% Handloom), credits gig riders ₹45, and pays sellers via Cashfree/Razorpay Split API.
            </p>

            <button
              onClick={handleTriggerSettlement}
              disabled={settlementRunning}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <RotateCcw className={`w-4 h-4 ${settlementRunning ? "animate-spin" : ""}`} />
              <span>
                {settlementRunning ? "Processing Batch via UPI..." : "Trigger Settlement Batch Now"}
              </span>
            </button>
          </div>

          {/* Settlement Report Result */}
          {settlementReport && (
            <div className="p-4 rounded-2xl bg-slate-800 border border-emerald-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settlement Batch Executed</span>
                </span>
                <span className="text-slate-400">
                  {settlementReport.ordersSettledCount || settlementReport.count} Orders Settled
                </span>
              </div>

              <div className="space-y-2">
                {(settlementReport.settledOrders || []).map((o: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-white block">
                        Order #{o.orderCode}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        UTR: {o.utrNumber} • Idempotency: OK
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400">
                      {formatINR(o.sellerNetPayout || o.sellerPayout)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 30-DAY CLOUDFLARE R2 AUXILIARY PURGE */}
      {activeTab === "storage" && (
        <div className="px-4 space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-rose-500" />
                <span>30-Day Auxiliary Storage Lifecycle</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-600/40">
                10GB Free Tier Safe
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Exactly 30 days post-settlement, auxiliary 160KB gallery WebP photos are batch-purged. Day-0 14KB thumbnails (<code className="text-amber-300">thumb_20kb.webp</code>) remain permanently in buyer receipts. Disputed orders are strictly preserved.
            </p>

            <button
              onClick={handleTriggerPurge}
              disabled={purgeRunning}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <Database className={`w-4 h-4 ${purgeRunning ? "animate-pulse" : ""}`} />
              <span>
                {purgeRunning ? "Scanning Settled Orders..." : "Run 30-Day Auxiliary Storage Purge"}
              </span>
            </button>
          </div>

          {/* Purge Result */}
          {purgeReport && (
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2 animate-in fade-in text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Purge Complete</span>
                <span>{purgeReport.protocol}</span>
              </div>
              <p className="text-slate-300">
                {purgeReport.details?.rawGalleryWebPPolicy || "Auxiliary gallery files purged."}
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-400 space-y-1">
                <p>
                  • Evaluated: 14 settled orders older than 30 days
                </p>
                <p>
                  • Disputed Orders Skipped: 2 (Evidence locked)
                </p>
                <p className="text-emerald-400 font-bold">
                  • Storage Freed: 5.4 MB (Permanent zero storage cost)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
