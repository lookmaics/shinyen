"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Download, Share2, Sparkles, Check } from "lucide-react";
import { formatINR, triggerHaptic } from "@/lib/utils";

interface InstagramStoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  priceOrBid: number;
  isAuction: boolean;
  category: string;
  sellerHandle?: string;
  imageUrl?: string;
}

export const InstagramStoryCardModal: React.FC<InstagramStoryCardModalProps> = ({
  isOpen,
  onClose,
  title,
  priceOrBid,
  isAuction,
  category,
  sellerHandle = "imphalthrift",
  imageUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to 9:16 Instagram Story standard (1080 x 1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Background Gradient (Dark Luxury Slate to Crimson)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(0.6, "#1e1022");
    bgGrad.addColorStop(1, "#881337");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Brand Header (Shinyen Meetei Mayek)
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("SHINYEN  (ꯁꯤꯟꯌꯦꯟ)", 540, 160);

    ctx.fillStyle = "#d4af37"; // Shinyen Gold
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("INDIGENOUS DROPS & AUCTIONS • MANIPUR", 540, 210);

    // 3. Drop Badge
    ctx.fillStyle = isAuction ? "#dc2626" : "#2563eb";
    const badgeText = isAuction ? "🔥 LIVE SUNDAY DROP" : "✨ NEW BOUTIQUE ARRIVAL";
    ctx.beginPath();
    ctx.roundRect(540 - 200, 260, 400, 60, 30);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(badgeText, 540, 300);

    // 4. Center Product Image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      // Draw image with rounded corners & border
      const imgX = 140;
      const imgY = 370;
      const imgW = 800;
      const imgH = 960;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 40);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgW, imgH);
      ctx.restore();

      // Border stroke around image
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 40);
      ctx.stroke();

      // 5. Title & Boutique
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, sans-serif";
      const shortTitle = title.length > 36 ? title.substring(0, 34) + "..." : title;
      ctx.fillText(shortTitle, 540, 1420);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`Curated by @${sellerHandle} • Imphal`, 540, 1475);

      // 6. Price / Starting Bid Banner
      const priceText = isAuction
        ? `STARTING BID: ${formatINR(priceOrBid)}`
        : `PRICE: ${formatINR(priceOrBid)}`;

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 68px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(priceText, 540, 1580);

      // 7. Visual Instagram Link Sticker Placeholder
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(540 - 280, 1660, 560, 90, 45);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("⚡ TAP TO BID • shinyen.in", 540, 1718);

      // 8. Footer Trust Tag
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "24px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("LOOKMAI ESCROW • 48-HR INSPECTION GUARANTEE", 540, 1840);

      setDownloadUrl(canvas.toDataURL("image/png"));
    };
  }, [isOpen, title, priceOrBid, isAuction, category, sellerHandle, imageUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    triggerHaptic(15);
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `shinyen-story-${Date.now()}.png`;
    a.click();
  };

  const handleShare = async () => {
    triggerHaptic(15);
    if (navigator.share && downloadUrl) {
      try {
        const blob = await (await fetch(downloadUrl)).blob();
        const file = new File([blob], "shinyen-drop-story.png", { type: "image/png" });
        await navigator.share({
          files: [file],
          title: `New Drop: ${title}`,
          text: `Check out this drop on Shinyen: ${title}`,
        });
      } catch (e) {
        handleDownload();
      }
    } else {
      handleDownload();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-sm text-white">9:16 Instagram Story Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Auto-generated 1080x1920 poster ready to share to your boutique's Instagram Stories with a sticker link!
        </p>

        {/* Canvas Display (Scaled down for preview) */}
        <div className="w-full aspect-9/16 max-h-[380px] bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleShare}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-900/50 active:scale-98 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share to Instagram Stories</span>
          </button>

          <button
            onClick={handleDownload}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 active:scale-98 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Save Image to Phone</span>
          </button>
        </div>
      </div>
    </div>
  );
};
