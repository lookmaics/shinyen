"use client";

import React from "react";

/**
 * Root Template for Next.js App Router
 * Remounts on route navigation to trigger native iOS slide-in push animations
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="ios-page-enter flex-1 flex flex-col">{children}</div>;
}
