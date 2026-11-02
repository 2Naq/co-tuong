// src/ui/hud_theme.js - Global UI Theme, Color & Glassmorphism Engine for entire project
import { DEFAULT_HUD_STYLE, HUD_STYLE_PRESETS } from "../core/constants";

export function getContrastYIQ(hexcolor) {
  if (!hexcolor || typeof hexcolor !== "string") return "#ffffff";
  const hex = hexcolor.replace("#", "");
  if (hex.length < 6) return "#ffffff";
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#000000" : "#ffffff";
}

export function hexToRgba(hexcolor, alpha = 1) {
  if (!hexcolor || typeof hexcolor !== "string")
    return `rgba(249, 115, 22, ${alpha})`;
  const hex = hexcolor.replace("#", "");
  let r = 249,
    g = 115,
    b = 22;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length >= 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolveHudAccent(styleConfig) {
  const cfg = styleConfig || DEFAULT_HUD_STYLE;
  if (cfg.preset === "custom" && cfg.customColor) {
    return cfg.customColor;
  }
  const match = HUD_STYLE_PRESETS.find((p) => p.id === cfg.preset);
  return match ? match.color : DEFAULT_HUD_STYLE.customColor;
}

/**
 * Universal project-wide theme applier.
 * Injects/updates a single global <style id="ziga-global-theme-stylesheet">
 * so colors, glassmorphism, border glow and radius immediately apply to
 * HUD, Settings Modal, Tactical Sandbox, Game Review, and all Base UI portals.
 */
export function applyHudStyle(styleConfig, themeMode = "dark") {
  const cfg = {
    ...DEFAULT_HUD_STYLE,
    ...(styleConfig || {}),
  };

  const accentHex = resolveHudAccent(cfg);
  const textColor = getContrastYIQ(accentHex);
  const isDark =
    themeMode === "light"
      ? false
      : themeMode === "dark"
        ? true
        : typeof document !== "undefined"
          ? document.documentElement.classList.contains("dark")
          : true;

  // 1. Compute Radius Tokens
  let radiusPx = "16px";
  let radiusRem = "1rem";
  if (cfg.borderRadius === "rounded_lg") {
    radiusPx = "12px";
    radiusRem = "0.75rem";
  } else if (cfg.borderRadius === "rounded_sm") {
    radiusPx = "5px";
    radiusRem = "0.3rem";
  }

  // 2. Compute Surface & Glassmorphism Rules
  let containerBg = "";
  let backdropFilter = "";
  let cardBg = "";
  let cardBorder = "";
  let overlayBg = "rgba(0, 0, 0, 0.70)";
  let popoverBg = "";
  let popoverBackdrop = "";
  let popoverBorder = "";
  let popoverShadow = "";

  if (cfg.bgMode === "solid") {
    containerBg = isDark ? "#141417" : "#ffffff";
    backdropFilter = "none";
    cardBg = isDark ? "#1f1f24" : "#f4f4f6";
    cardBorder = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    overlayBg = "rgba(0, 0, 0, 0.75)";
    popoverBg = isDark ? "#181820" : "#ffffff";
    popoverBackdrop = "none";
    popoverBorder = isDark
      ? "rgba(255, 255, 255, 0.14)"
      : "rgba(0, 0, 0, 0.12)";
    popoverShadow = "0 20px 48px rgba(0, 0, 0, 0.65)";
    popoverBg = isDark ? "#181820" : "#ffffff";
    popoverBackdrop = "none";
    popoverBorder = isDark
      ? "rgba(255, 255, 255, 0.14)"
      : "rgba(0, 0, 0, 0.12)";
    popoverShadow = "0 20px 48px rgba(0, 0, 0, 0.65)";
  } else if (cfg.bgMode === "clear") {
    // Ultra-translucent clear mode (40-50% opacity, highly transparent!)
    containerBg = isDark
      ? "rgba(10, 10, 14, 0.45)"
      : "rgba(255, 255, 255, 0.50)";
    backdropFilter = "blur(10px) saturate(160%)";
    cardBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)";
    cardBorder = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
    overlayBg = "rgba(0, 0, 0, 0.35)";
    popoverBg = isDark ? "rgba(12, 16, 24, 0.65)" : "rgba(255, 255, 255, 0.72)";
    popoverBackdrop = "blur(18px) saturate(160%)";
    popoverBorder = isDark
      ? "rgba(255, 255, 255, 0.14)"
      : "rgba(0, 0, 0, 0.10)";
    popoverShadow = `0 20px 48px rgba(0, 0, 0, 0.5), 0 0 16px ${hexToRgba(accentHex, 0.2)}`;
    popoverBg = isDark ? "rgba(12, 16, 24, 0.65)" : "rgba(255, 255, 255, 0.72)";
    popoverBackdrop = "blur(18px) saturate(160%)";
    popoverBorder = isDark
      ? "rgba(255, 255, 255, 0.14)"
      : "rgba(0, 0, 0, 0.10)";
    popoverShadow = `0 20px 48px rgba(0, 0, 0, 0.5), 0 0 16px ${hexToRgba(accentHex, 0.2)}`;
  } else {
    // Default 'glass' mode (Frosted Glassmorphism ~78-82% opacity)
    containerBg = isDark
      ? "rgba(18, 18, 24, 0.75)"
      : "rgba(255, 255, 255, 0.80)";
    backdropFilter = "blur(16px) saturate(180%)";
    cardBg = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)";
    cardBorder = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
    overlayBg = "rgba(0, 0, 0, 0.50)";
    popoverBg = isDark ? "rgba(16, 20, 28, 0.82)" : "rgba(255, 255, 255, 0.86)";
    popoverBackdrop = "blur(24px) saturate(180%)";
    popoverBorder = isDark
      ? "rgba(255, 255, 255, 0.16)"
      : "rgba(0, 0, 0, 0.10)";
    popoverShadow = `0 20px 48px -8px rgba(0, 0, 0, 0.55), 0 0 20px ${hexToRgba(accentHex, 0.22)}, 0 1px 0 inset rgba(255, 255, 255, 0.18)`;
    popoverBg = isDark ? "rgba(16, 20, 28, 0.82)" : "rgba(255, 255, 255, 0.86)";
    popoverBackdrop = "blur(24px) saturate(180%)";
    popoverBorder = isDark
      ? "rgba(255, 255, 255, 0.16)"
      : "rgba(0, 0, 0, 0.10)";
    popoverShadow = `0 20px 48px -8px rgba(0, 0, 0, 0.55), 0 0 20px ${hexToRgba(accentHex, 0.22)}, 0 1px 0 inset rgba(255, 255, 255, 0.18)`;
  }

  // Card opacity override if explicitly requested
  if (cfg.cardOpacity === "transparent") {
    cardBg = isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)";
    cardBorder = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)";
  } else if (cfg.cardOpacity === "solid") {
    cardBg = isDark ? "#1e1e24" : "#f0f0f3";
    cardBorder = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)";
  }

  // 3. Compute Border Glow & Shadow
  let glowBoxShadow = "";
  let glowBorderColor = "";
  if (cfg.borderGlow) {
    glowBoxShadow = `0 20px 50px rgba(0, 0, 0, 0.7), 0 0 20px ${hexToRgba(accentHex, 0.42)}`;
    glowBorderColor = hexToRgba(accentHex, 0.65);
  } else {
    glowBoxShadow = "0 20px 50px rgba(0, 0, 0, 0.6)";
    glowBorderColor = isDark
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(0, 0, 0, 0.12)";
  }

  // 4. Scale
  const scale =
    typeof cfg.hudScale === "number" &&
    cfg.hudScale >= 0.8 &&
    cfg.hudScale <= 1.2
      ? cfg.hudScale
      : 1.0;

  // 5. Construct Global Dynamic CSS
  const css = `
/* ========================================================================= */
/* UNIVERSAL PROJECT-WIDE DYNAMIC THEME & COLOR STYLESHEET                   */
/* ========================================================================= */

/* 1. Global Tokens (High Specificity + !important ensures NO override in Light & Dark Mode) */
:root,
.dark,
.ziga-shadcn-root,
.ziga-shadcn-root.dark,
#ziga-react-settings-host,
#ziga-mod-widget,
#ziga-sandbox-modal,
#ziga-game-review-modal,
.ziga-sb-card,
.ziga-sb-flank,
[data-slot="dialog-content"],
.dark [data-slot="dialog-content"],
[data-slot="popover-content"],
.dark [data-slot="popover-content"],
[data-slot="select-content"],
.dark [data-slot="select-content"],
[data-slot="tooltip-content"],
.dark [data-slot="tooltip-content"],
[data-base-ui-portal] {
  --primary: ${accentHex} !important;
  --primary-foreground: ${textColor} !important;
  --ring: ${accentHex} !important;
  --radius: ${radiusRem} !important;
}

#ziga-mod-widget,
[data-slot="dialog-content"],
.dark [data-slot="dialog-content"] {
  --popover: ${containerBg} !important;
  --background: ${containerBg} !important;
  --card: ${cardBg} !important;
}

/* High-Contrast Frosted Glass Flyouts & Floating Menus (Popover, Select, Tooltip) */
[data-slot="popover-content"],
[data-slot="select-content"],
[data-slot="tooltip-content"],
.dark [data-slot="popover-content"],
.dark [data-slot="select-content"],
.dark [data-slot="tooltip-content"] {
  --primary: ${accentHex} !important;
  --primary-foreground: ${textColor} !important;
  --popover: ${popoverBg} !important;
  --background: ${popoverBg} !important;
  --card: ${cardBg} !important;
  background-color: ${popoverBg} !important;
  background: ${popoverBg} !important;
  backdrop-filter: ${popoverBackdrop} !important;
  -webkit-backdrop-filter: ${popoverBackdrop} !important;
  border: 1px solid ${popoverBorder} !important;
  box-shadow: ${popoverShadow} !important;
  border-radius: calc(${radiusPx} + 2px) !important;
  color: ${isDark ? "#f3f4f6" : "#111827"} !important;
}

/* Translucent table surfaces inside Frosted Glass Popovers */
[data-slot="popover-content"] [data-slot="table-header"] tr {
  background-color: ${isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)"} !important;
  border-bottom: 1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"} !important;
}
[data-slot="popover-content"] [data-slot="table-footer"] {
  background-color: ${isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)"} !important;
  border-top: 1px solid ${isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"} !important;
}
[data-slot="popover-content"] [data-slot="table-row"] {
  border-bottom: 1px solid ${isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"} !important;
}
[data-slot="popover-content"] [data-slot="table-row"]:hover {
  background-color: ${isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.05)"} !important;
}

/* 2. Direct Component Fallback Enforcement for Primary Color */
[data-slot="button"][data-variant="default"],
button.bg-primary,
.bg-primary {
  background-color: ${accentHex} !important;
  color: ${textColor} !important;
}

.text-primary,
:is(#ziga-mod-widget, .ziga-shadcn-root, [data-slot], [data-base-ui-portal]) .text-primary,
[data-slot="popover-content"] .text-primary,
.dark [data-slot="popover-content"] .text-primary {
  color: ${accentHex} !important;
}

[data-slot="button"][data-variant="outline"]:hover {
  border-color: ${accentHex} !important;
  color: ${accentHex} !important;
}

[data-slot="badge"][data-variant="default"],
.ziga-shadcn-root .bg-primary.text-primary-foreground {
  background-color: ${accentHex} !important;
  color: ${textColor} !important;
}

[data-slot="switch"][data-state="checked"],
[data-slot="switch"][aria-checked="true"] {
  background-color: ${accentHex} !important;
}

[data-slot="slider-range"] {
  background-color: ${accentHex} !important;
}

[data-slot="slider-thumb"] {
  border-color: ${accentHex} !important;
}

/* 3. Backdrop Overlay for Settings Dialog in Glass / Clear Modes */
[data-slot="dialog-overlay"],
.ziga-shadcn-root [data-slot="dialog-overlay"] {
  background-color: ${overlayBg} !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  transition: background-color 0.25s ease !important;
}

/* 4. Glassmorphism & Surface on HUD, Modals, and Sa Bàn */
:is(#ziga-mod-widget, #ziga-react-settings-host, .ziga-shadcn-root, [data-slot], [data-base-ui-portal])#ziga-mod-widget,
:is(#ziga-mod-widget, #ziga-react-settings-host, .ziga-shadcn-root, [data-slot], [data-base-ui-portal])[data-slot="dialog-content"],
#ziga-mod-widget.bg-background,
#ziga-mod-widget,
[data-slot="dialog-content"].bg-popover,
[data-slot="dialog-content"].bg-background,
[data-slot="dialog-content"],
.ziga-sb-card,
.ziga-sb-flank,
#ziga-game-review-modal .modal-content {
  background-color: ${containerBg} !important;
  background: ${containerBg} !important;
  backdrop-filter: ${backdropFilter} !important;
  -webkit-backdrop-filter: ${backdropFilter} !important;
  border-radius: ${radiusPx} !important;
  box-shadow: ${glowBoxShadow} !important;
  border: 1px solid ${glowBorderColor} !important;
  transition: background-color 0.25s ease, backdrop-filter 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease !important;
}

/* 5. Make inner container headers and scroll bodies transparent so glass shows through */
:is(#ziga-mod-widget, [data-slot="dialog-content"]) #ziga-mod-drag-handle,
:is(#ziga-mod-widget, [data-slot="dialog-content"]) #ziga-mod-drag-handle.bg-card,
:is(#ziga-mod-widget, [data-slot="dialog-content"]) #ziga-mod-body,
:is(#ziga-mod-widget, [data-slot="dialog-content"]) #ziga-mod-body.bg-background,
:is(#ziga-mod-widget, [data-slot="dialog-content"]) [data-slot="dialog-header"],
:is(#ziga-mod-widget, [data-slot="dialog-content"]) [data-slot="dialog-footer"],
#ziga-mod-widget #ziga-mod-drag-handle,
#ziga-mod-widget #ziga-mod-body,
[data-slot="dialog-header"],
[data-slot="dialog-footer"],
.ziga-sb-flank-header {
  background-color: transparent !important;
  background: transparent !important;
}

/* 6. Translucent Card & Tab List surfaces inside glass HUD and Modals */
:is(#ziga-mod-widget, [data-slot="dialog-content"], .ziga-sb-card) [data-slot="card"],
:is(#ziga-mod-widget, [data-slot="dialog-content"], .ziga-sb-card) [data-slot="card"].bg-card,
:is(#ziga-mod-widget, [data-slot="dialog-content"], .ziga-sb-card) .bg-card,
:is(#ziga-mod-widget, [data-slot="dialog-content"], .ziga-sb-card) [data-slot="tabs-list"],
#ziga-mod-widget [data-slot="card"],
[data-slot="dialog-content"] [data-slot="card"],
.ziga-sb-card [data-slot="card"],
[data-slot="dialog-content"] [data-slot="tabs-list"] {
  background-color: ${cardBg} !important;
  background: ${cardBg} !important;
  border-color: ${cardBorder} !important;
  border-radius: calc(${radiusPx} - 4px) !important;
  transition: background-color 0.2s ease, border-color 0.2s ease !important;
}

/* 6. Scale HUD Widget */
#ziga-mod-widget {
  ${
    Math.abs(scale - 1.0) > 0.01
      ? `transform: scale(${scale}) !important; transform-origin: top right !important;`
      : "transform: none !important;"
  }
}

/* 7. Active Tab & Interactive Focus Glow */
[data-slot="tabs-trigger"][data-active],
[data-slot="tabs-trigger"]:is([aria-selected="true"], [data-state="active"]) {
  border-bottom-color: ${accentHex} !important;
  color: ${accentHex} !important;
}

/* 8. Tactical Sandbox Time & Accent highlights */
.ziga-sb-time-num,
.ziga-sb-progress-bar,
.ziga-sb-flank-jump-btn {
  color: ${accentHex} !important;
}
.ziga-sb-progress-bar,
.ziga-sb-flank-jump-btn {
  background-color: ${accentHex} !important;
  color: ${textColor} !important;
}
`;

  // Inject or update single <style id="ziga-global-theme-stylesheet"> in document.head
  if (typeof document !== "undefined") {
    let styleTag = document.getElementById("ziga-global-theme-stylesheet");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "ziga-global-theme-stylesheet";
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = css;

    // Also update documentElement inline tokens as secondary fallback
    if (document.documentElement) {
      document.documentElement.style.setProperty("--primary", accentHex);
      document.documentElement.style.setProperty(
        "--primary-foreground",
        textColor,
      );
      document.documentElement.style.setProperty("--ring", accentHex);
      document.documentElement.style.setProperty("--radius", radiusRem);
      document.documentElement.style.setProperty("--popover", containerBg);
      document.documentElement.style.setProperty("--background", containerBg);
      document.documentElement.style.setProperty("--card", cardBg);
    }

    // Set data attributes on containers for attribute queries and styling hooks
    const hudEl = document.getElementById("ziga-mod-widget");
    if (hudEl) {
      hudEl.setAttribute("data-card-opacity", cfg.cardOpacity || "default");
      hudEl.setAttribute("data-bg-mode", cfg.bgMode || "glass");
    }
    const modalHostEl = document.getElementById("ziga-react-settings-host");
    if (modalHostEl) {
      modalHostEl.setAttribute(
        "data-card-opacity",
        cfg.cardOpacity || "default",
      );
      modalHostEl.setAttribute("data-bg-mode", cfg.bgMode || "glass");
    }
  }
}

// Alias for semantic clarity
export const applyGlobalTheme = applyHudStyle;

export function saveHudStyleToStorage(styleConfig) {
  try {
    localStorage.setItem("ziga_xiangqi_hud_style", JSON.stringify(styleConfig));
  } catch (e) {}
}

export function loadSavedHudStyle() {
  try {
    const raw = localStorage.getItem("ziga_xiangqi_hud_style");
    if (raw) {
      return { ...DEFAULT_HUD_STYLE, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return { ...DEFAULT_HUD_STYLE };
}

// Global hookup
if (typeof window !== "undefined") {
  const ZigaMod = (window.ZigaMod = window.ZigaMod || {});
  ZigaMod.applyHudStyle = applyHudStyle;
  ZigaMod.applyGlobalTheme = applyGlobalTheme;
  ZigaMod.saveHudStyleToStorage = saveHudStyleToStorage;
  ZigaMod.loadSavedHudStyle = loadSavedHudStyle;

  // Auto-apply saved global theme immediately on script evaluation
  if (typeof document !== "undefined") {
    try {
      const saved = loadSavedHudStyle();
      const mode =
        localStorage.getItem("ziga_xiangqi_theme_mode") ||
        (document.documentElement.classList.contains("dark")
          ? "dark"
          : "light");
      applyHudStyle(saved, mode);
    } catch (e) {}
  }
}
