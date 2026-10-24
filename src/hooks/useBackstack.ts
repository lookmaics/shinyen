"use client";

import { useEffect, useRef } from "react";

// Global timestamp tracker to distinguish between overlay pops and tab/root pops
let lastOverlayClosedAt = 0;

export function recordOverlayClosed() {
  lastOverlayClosedAt = Date.now();
}

export function wasOverlayRecentlyClosed(): boolean {
  return Date.now() - lastOverlayClosedAt < 600;
}

/**
 * useModalBackstack
 * Connects any modal, drawer, or sheet to the browser/PWA history stack.
 * Enables native mobile swipe-back gestures and Android back button navigation
 * to dismiss overlays instead of exiting the PWA.
 *
 * @param id Unique identifier for the overlay (used in URL hash)
 * @param isOpen Boolean indicating whether the modal/drawer is open
 * @param onClose Callback to close the modal
 */
export function useModalBackstack(
  id: string,
  isOpen: boolean,
  onClose: () => void
) {
  const isPushedRef = useRef(false);
  const isPoppingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isOpen) {
      // 1. Push state for this modal if not already pushed
      if (!isPushedRef.current) {
        window.history.pushState(
          { shinyen_overlay: id, timestamp: Date.now() },
          "",
          `#${id}`
        );
        isPushedRef.current = true;
      }

      const handlePopState = () => {
        // Popstate occurred (user swiped back on iOS or tapped back on Android)
        isPoppingRef.current = true;
        isPushedRef.current = false;
        recordOverlayClosed();
        onCloseRef.current();
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);

        // If the modal was closed NOT by popstate (e.g. user clicked "X", backdrop, or completed an action),
        // we must pop the history state we created, so the browser stack doesn't have a dangling state.
        if (isPushedRef.current && !isPoppingRef.current) {
          isPushedRef.current = false;
          recordOverlayClosed();
          if (window.location.hash === `#${id}`) {
            window.history.back();
          }
        }
        isPoppingRef.current = false;
      };
    } else {
      isPushedRef.current = false;
      isPoppingRef.current = false;
    }
  }, [isOpen, id]);
}
