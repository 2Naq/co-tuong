// src/lib/scroll_lock.js - Safe, Reference-Counted Outer Page Scroll Lock Manager
let lockCount = 0;
let prevBodyOverflow = "";
let prevHtmlOverflow = "";
let prevBodyPaddingRight = "";

/**
 * Locks scroll of the host website (document.body & document.documentElement)
 * while a fullscreen modal/overlay (e.g. Tactical Sandbox, Settings, Game Review) is open.
 * Uses reference counting so multiple stacked modals unlock cleanly.
 */
export function lockOuterScroll() {
  if (typeof document === "undefined") return;
  lockCount++;
  if (lockCount === 1) {
    prevBodyOverflow = document.body.style.overflow;
    prevHtmlOverflow = document.documentElement.style.overflow;
    prevBodyPaddingRight = document.body.style.paddingRight;

    // Compensate scrollbar width to prevent content jumping to the right
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }
}

/**
 * Restores original host website scroll behavior when all modals are closed.
 */
export function unlockOuterScroll() {
  if (typeof document === "undefined") return;
  if (lockCount > 0) {
    lockCount--;
    if (lockCount === 0) {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.paddingRight = prevBodyPaddingRight;
    }
  }
}

// Attach to ZigaMod global namespace so vanilla features can invoke it easily
if (typeof window !== "undefined") {
  window.ZigaMod = window.ZigaMod || {};
  window.ZigaMod.lockOuterScroll = lockOuterScroll;
  window.ZigaMod.unlockOuterScroll = unlockOuterScroll;
}

