// src/ui/hud_theme.js - HUD Widget Theme & Personalization Engine
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

export function applyHudStyle(styleConfig, themeMode = "dark") {
  const cfg = {
    ...DEFAULT_HUD_STYLE,
    ...(styleConfig || {}),
  };

  const widgetEl = document.getElementById("ziga-mod-widget");
  const bodyEl = document.getElementById("ziga-mod-body");
  const headerEl = document.getElementById("ziga-mod-drag-handle");

  if (!widgetEl) return;

  const accentHex = resolveHudAccent(cfg);
  const textColor = getContrastYIQ(accentHex);
  const isDark = themeMode === "dark" || widgetEl.classList.contains("dark");

  // 1. Accent color tokens for shadcn/ui
  widgetEl.style.setProperty("--primary", accentHex);
  widgetEl.style.setProperty("--primary-foreground", textColor);
  widgetEl.style.setProperty("--ring", accentHex);

  // 2. Background & Glassmorphism
  let bgColor = "";
  let backdrop = "";
  if (cfg.bgMode === "solid") {
    bgColor = isDark ? "#141416" : "#ffffff";
    backdrop = "none";
  } else if (cfg.bgMode === "clear") {
    bgColor = isDark ? "rgba(12, 12, 15, 0.65)" : "rgba(255, 255, 255, 0.65)";
    backdrop = "blur(8px) saturate(160%)";
  } else {
    // 'glass' mode
    bgColor = isDark ? "rgba(18, 18, 22, 0.88)" : "rgba(255, 255, 255, 0.88)";
    backdrop = "blur(14px) saturate(180%)";
  }

  widgetEl.style.setProperty("background-color", bgColor, "important");
  widgetEl.style.setProperty("backdrop-filter", backdrop, "important");
  widgetEl.style.setProperty("-webkit-backdrop-filter", backdrop, "important");

  if (bodyEl) {
    bodyEl.style.setProperty("background-color", "transparent", "important");
  }
  if (headerEl) {
    headerEl.style.setProperty("background-color", "transparent", "important");
  }

  // 3. Border Glow & Box Shadow
  if (cfg.borderGlow) {
    widgetEl.style.setProperty(
      "box-shadow",
      `0 20px 45px rgba(0, 0, 0, 0.65), 0 0 16px ${hexToRgba(accentHex, 0.38)}`,
      "important",
    );
    widgetEl.style.setProperty(
      "border-color",
      hexToRgba(accentHex, 0.55),
      "important",
    );
  } else {
    widgetEl.style.setProperty(
      "box-shadow",
      "0 20px 45px rgba(0, 0, 0, 0.55)",
      "important",
    );
    widgetEl.style.removeProperty("border-color");
  }

  // 4. Border Radius
  let radiusPx = "16px";
  let radiusRem = "1rem";
  if (cfg.borderRadius === "rounded_lg") {
    radiusPx = "12px";
    radiusRem = "0.75rem";
  } else if (cfg.borderRadius === "rounded_sm") {
    radiusPx = "5px";
    radiusRem = "0.3rem";
  }
  widgetEl.style.setProperty("border-radius", radiusPx, "important");
  widgetEl.style.setProperty("--radius", radiusRem);

  // 5. Card Opacity Mode
  widgetEl.setAttribute("data-card-opacity", cfg.cardOpacity || "default");
  const cardElements = widgetEl.querySelectorAll(
    "#ziga-mod-body > [data-slot='card']",
  );
  cardElements.forEach((card) => {
    if (cfg.cardOpacity === "transparent") {
      card.style.setProperty(
        "background-color",
        isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
        "important",
      );
    } else if (cfg.cardOpacity === "solid") {
      card.style.setProperty(
        "background-color",
        isDark ? "#1c1c20" : "#f4f4f5",
        "important",
      );
    } else {
      card.style.removeProperty("background-color");
    }
  });

  // 6. Scale & Transform
  const scale =
    typeof cfg.hudScale === "number" &&
    cfg.hudScale >= 0.8 &&
    cfg.hudScale <= 1.2
      ? cfg.hudScale
      : 1.0;

  if (Math.abs(scale - 1.0) > 0.01) {
    widgetEl.style.setProperty("transform", `scale(${scale})`, "important");
    // Determine anchor origin: check if widget is closer to left or right
    const rect = widgetEl.getBoundingClientRect();
    const isLeft = rect.left < window.innerWidth / 2;
    widgetEl.style.setProperty(
      "transform-origin",
      isLeft ? "top left" : "top right",
      "important",
    );
  } else {
    widgetEl.style.removeProperty("transform");
    widgetEl.style.removeProperty("transform-origin");
  }
}

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
  ZigaMod.saveHudStyleToStorage = saveHudStyleToStorage;
  ZigaMod.loadSavedHudStyle = loadSavedHudStyle;
}
