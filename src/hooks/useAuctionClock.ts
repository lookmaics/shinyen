"use client";

import { useState, useEffect, useRef } from "react";

interface AuctionClockResult {
  formattedTime: string;
  isUrgent: boolean; // < 60 seconds left (Soft-Close danger zone)
  isEnded: boolean;
  secondsRemaining: number;
  serverOffsetMs: number;
}

export function useAuctionClock(
  endTimeIso?: string,
  initialServerEpochMs?: number
): AuctionClockResult {
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const serverOffsetRef = useRef<number>(0);
  const baselinePerformanceRef = useRef<number>(0);
  const baselineNowRef = useRef<number>(0);

  // Initialize monotonic synchronization
  useEffect(() => {
    if (initialServerEpochMs) {
      serverOffsetRef.current = initialServerEpochMs - Date.now();
    }
    baselinePerformanceRef.current = performance.now();
    baselineNowRef.current = Date.now() + serverOffsetRef.current;
  }, [initialServerEpochMs]);

  useEffect(() => {
    if (!endTimeIso) return;

    const interval = setInterval(() => {
      // Monotonic time computation: immune to OS clock tampering or system sleep drift
      const elapsedPerfMs = performance.now() - baselinePerformanceRef.current;
      const currentMonotonicNow = baselineNowRef.current + elapsedPerfMs;
      setNowMs(currentMonotonicNow);
    }, 250);

    return () => clearInterval(interval);
  }, [endTimeIso]);

  if (!endTimeIso) {
    return {
      formattedTime: "--:--",
      isUrgent: false,
      isEnded: false,
      secondsRemaining: 0,
      serverOffsetMs: serverOffsetRef.current,
    };
  }

  const endMs = new Date(endTimeIso).getTime();
  const diffMs = endMs - nowMs;

  if (diffMs <= 0) {
    return {
      formattedTime: "Auction Ended",
      isUrgent: false,
      isEnded: true,
      secondsRemaining: 0,
      serverOffsetMs: serverOffsetRef.current,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isUrgent = totalSeconds < 60; // Final 60 seconds triggers high-water mark warning

  let formatted = "";
  if (hours > 0) {
    formatted = `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  } else {
    formatted = `${minutes.toString().padStart(2, "0")}m ${seconds
      .toString()
      .padStart(2, "0")}s`;
  }

  return {
    formattedTime: formatted,
    isUrgent,
    isEnded: false,
    secondsRemaining: totalSeconds,
    serverOffsetMs: serverOffsetRef.current,
  };
}
