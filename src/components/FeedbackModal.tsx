"use client";

import React, { useState } from "react";
import { MessageSquare, X, Check, Bug, Smartphone, MapPin, Send } from "lucide-react";
import { triggerHaptic } from "@/lib/utils";
import { useModalBackstack } from "@/hooks/useBackstack";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  useModalBackstack("feedback", isOpen, onClose);

  const [category, setCategory] = useState<string>("bug");
  const [deviceModel, setDeviceModel] = useState("Redmi 9A / Android 11");
  const [leikai, setLeikai] = useState("Yaiskul, Imphal West");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Feedback & Diagnostics</h3>
              <p className="text-[11px] text-slate-400">Powered by Sentry Profiling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
            <Check className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-slate-900 text-sm">Feedback Sent!</h4>
            <p className="text-xs text-slate-600">
              Diagnostic report logged with device hardware profile. Thank you for helping optimize Shinyen!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Feedback Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Type of Feedback
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                {[
                  { id: "bug", label: "🐛 Bug" },
                  { id: "slow", label: "⚡ Slow Lag" },
                  { id: "suggest", label: "💡 Idea" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(5);
                      setCategory(c.id);
                    }}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      category === c.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Device Profile Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-slate-400" />
                <span>Phone Model (for Helio G25/RAM tuning)</span>
              </label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium"
              />
            </div>

            {/* Leikai Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Your Leikai / Area (Network profiling)</span>
              </label>
              <input
                type="text"
                value={leikai}
                onChange={(e) => setLeikai(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                What happened?
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Bidding countdown paused when screen rotated, or photo upload lagged."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Diagnostics</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
