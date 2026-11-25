// src/engine_hook.js - Cocos2d in-engine hooks for piece sprite enhancement and click handling
(function (ZigaMod) {
  "use strict";

  // =========================================================================
  // HELPER COMPATIBILITY LAYER: Ziga ver=142, ver=141 vs Legacy Ziga
  // =========================================================================

  function generateBoardMatrix(gl, b) {
    if (!gl) return;
    if (typeof gl.fD === "function") {
      gl.fD(b);
    } else if (typeof gl.ZC === "function") {
      gl.ZC(b);
    } else {
      for (let c = 0; 9 > c; c++) {
        if (!b[c]) b[c] = Array(10);
        for (let d = 0; 10 > d; d++) b[c][d] = -1;
      }
      if (gl.V && Array.isArray(gl.V)) {
        for (let c = 0; 32 > c; c++) {
          if (
            gl.V[c] &&
            !gl.V[c].pa &&
            gl.V[c].fa !== undefined &&
            gl.V[c].rowIndex !== undefined
          ) {
            b[gl.V[c].fa][gl.V[c].rowIndex] = c;
          }
        }
      }
    }
  }

  function getPieceHelper(gl, pieceIndex) {
    if (!gl) return null;
    if (typeof gl.fq === "function") return gl.fq(pieceIndex);
    if (typeof gl.hq === "function") return gl.hq(pieceIndex);
    if (gl.V && gl.V[pieceIndex]) {
      const p = gl.V[pieceIndex];
      if (
        typeof window !== "undefined" &&
        typeof window.BkChessPiece === "function"
      ) {
        try {
          const b = new window.BkChessPiece(pieceIndex);
          b.Ha = p.Ha !== undefined ? p.Ha : p.Ga !== undefined ? p.Ga : 0;
          b.ka = p.ka;
          b.fa = p.fa;
          b.rowIndex = p.rowIndex;
          return b;
        } catch (e) {}
      }
      return p;
    }
    return null;
  }

  function isMovePatternValid(gl, helper, pieceIndex, destSquare, matrix) {
    if (!gl || !helper) return false;
    // In v142+: QM is pattern check: QM(helper, pieceIndex, destSquare, matrix)
    if (typeof gl.QM === "function") {
      return !!gl.QM(helper, pieceIndex, destSquare, matrix);
    }
    // In v141: PM is pattern check (4 args: helper, pieceIndex, destSquare, matrix)
    if (typeof gl.PM === "function" && gl.PM.length >= 3) {
      return !!gl.PM(helper, pieceIndex, destSquare, matrix);
    }
    // In legacy: IM is pattern check
    if (typeof gl.IM === "function" && gl.IM.length >= 3) {
      return !!gl.IM(helper, pieceIndex, destSquare, matrix);
    }
    return false;
  }

  function isKingFacingKing(gl, helper, pieceIndex, col, row, matrix) {
    if (!gl || !helper) return false;
    // In v142+: JM is king-facing-king check (takes 5 args: helper, pieceIndex, col, row, matrix)
    if (typeof gl.JM === "function") {
      return !!gl.JM(helper, pieceIndex, col, row, matrix);
    }
    // In v141: IM is king-facing-king check (takes 5 args)
    if (typeof gl.PM === "function" && typeof gl.IM === "function") {
      return !!gl.IM(helper, pieceIndex, col, row, matrix);
    }
    // In legacy: BM is king-facing-king check (takes 5 args)
    if (typeof gl.BM === "function") {
      return !!gl.BM(helper, pieceIndex, col, row, matrix);
    }
    return false;
  }

  function isKingCheckedAfterMove(gl, helper, pieceIndex, col, row, matrix) {
    if (!gl || !helper) return false;
    // In v142+: LM is king-checked check (takes 6 args: 0, helper, pieceIndex, col, row, matrix)
    if (typeof gl.LM === "function") {
      return !!gl.LM(0, helper, pieceIndex, col, row, matrix);
    }
    // In v141: KM is king-checked check (takes 6 args: 0, helper, pieceIndex, col, row, matrix)
    if (typeof gl.KM === "function") {
      return !!gl.KM(0, helper, pieceIndex, col, row, matrix);
    }
    // In legacy: DM is king-checked check (takes 6 args)
    if (typeof gl.DM === "function") {
      return !!gl.DM(0, helper, pieceIndex, col, row, matrix);
    }
    return false;
  }

  function findPieceAt(gl, col, row) {
    if (!gl) return -1;
    // In v142+: XK is findPieceAt(col, row)
    if (typeof gl.XK === "function") return gl.XK(col, row);
    // In v141: WK is findPieceAt(col, row)
    if (typeof gl.WK === "function") return gl.WK(col, row);
    if (typeof gl.QK === "function") return gl.QK(col, row);
    if (gl.V && Array.isArray(gl.V)) {
      for (let c = 0; 32 > c; c++) {
        if (
          gl.V[c] &&
          !gl.V[c].pa &&
          gl.V[c].fa === col &&
          gl.V[c].rowIndex === row
        ) {
          return c;
        }
      }
    }
    return -1;
  }

  function isDestValid(gl, col, row) {
    if (!gl) return false;
    // In v142+: PM is destination valid check: PM(col, row)
    if (typeof gl.PM === "function" && gl.PM.length === 2) {
      return !!gl.PM(col, row);
    }
    if (typeof gl.OM === "function") return gl.OM(col, row);
    if (typeof gl.HM === "function") return gl.HM(col, row);

    // Fallback against tc markers
    if (gl.tc && Array.isArray(gl.tc)) {
      for (let c = 0; c < gl.tc.length; c++) {
        const marker = gl.tc[c];
        if (marker && marker.x > 0) {
          const mCol = marker.aq !== undefined ? marker.aq : marker.cq;
          const mRow = marker.Kr !== undefined ? marker.Kr : marker.Ir;
          if (mCol === col && mRow === row) return true;
        }
      }
    }
    const list = gl.Tp || gl.Vp || [];
    for (let c = 0; c < list.length; c++) {
      if (list[c] && list[c][0] === col && list[c][1] === row) return true;
    }
    return false;
  }

  // =========================================================================
  // PIECE SPRITE ENHANCEMENT (Pulsing Attack Aura)
  // =========================================================================

  function enhancePieceSprite(piece) {
    if (!piece || piece.__zigaEnhancedKj) return;
    piece.__zigaEnhancedKj = true;

    piece.kj = function (show, isDangerous) {
      if (!this.rd) return;

      // Honor user setting for in-engine highlight (defaults to true)
      const isHighlightEnabled =
        !ZigaMod.userSettings ||
        ZigaMod.userSettings.highlightTactics !== false;

      if (!isHighlightEnabled || !show) {
        this.rd.setVisible(false);
        this.rd.stopAllActions();
        if (this.rd.eU) this.rd.eU.stopAllActions();
        if (this.rd.WT) this.rd.WT.stopAllActions();
        if (this.rd.dU) this.rd.dU.stopAllActions();
        this.rd.setScale(0.5);
        if (this.rd.setColor && typeof cc !== "undefined" && cc.color) {
          this.rd.setColor(cc.color(255, 255, 255));
        }
        var inner = this.rd.eU || this.rd.dU || this.rd.WT;
        if (inner && inner.setColor && typeof cc !== "undefined" && cc.color) {
          inner.setColor(cc.color(255, 255, 255));
        }
        return;
      }

      this.rd.setVisible(true);
      this.rd.stopAllActions();
      if (this.rd.eU) this.rd.eU.stopAllActions();
      if (this.rd.WT) this.rd.WT.stopAllActions();
      if (this.rd.dU) this.rd.dU.stopAllActions();
      this.rd.setScale(0.5);

      // Color tint: Red if capture is dangerous (recapturable), Green if capture is free/safe!
      const isRadarEnabled =
        !ZigaMod.userSettings ||
        ZigaMod.userSettings.moveSafetyRadar !== false;
      const auraColor =
        isRadarEnabled && typeof cc !== "undefined" && cc.color
          ? isDangerous === false
            ? cc.color(46, 204, 113) // Safe Emerald Green
            : cc.color(248, 80, 80) // Danger Red
          : null;

      if (auraColor && this.rd.setColor) {
        this.rd.setColor(auraColor);
      }
      var inner = this.rd.eU || this.rd.dU || this.rd.WT;
      if (inner && auraColor && inner.setColor) {
        inner.setColor(auraColor);
      }

      // Pulse animation matching native Ziga scale & clean sequence
      if (
        typeof cc !== "undefined" &&
        typeof cc.fadeTo === "function" &&
        typeof cc.sequence === "function"
      ) {
        var fadeOut = cc.fadeTo(0.4, 40);
        var fadeIn = cc.fadeTo(0.4, 255);
        var pulse = cc.sequence(fadeOut, fadeIn).repeatForever();
        this.rd.runAction(pulse);

        if (inner) {
          inner.runAction(pulse.clone());
        }
      }
    };
  }

  // =========================================================================
  // MOVE SAFETY RADAR CONFIGURATION (Tùy chỉnh Style, Kích thước, Hiệu ứng)
  // =========================================================================

  const RADAR_CONFIG = {
    // 1. TỶ LỆ KÍCH THƯỚC HIỂN THỊ (To / Nhỏ trên bàn cờ)
    // Giá trị chuẩn: 0.42 (nhỏ gọn vừa khít ô). Tăng 0.46 - 0.50 nếu muốn to hơn.
    baseScale: 0.42,

    // 2. HIỆU ỨNG CHUYỂN ĐỘNG (Animations)
    animation: {
      enable: true, // Bật/tắt hiệu ứng nhịp đập & nhịp thở

      // Ô ĐỎ (Nguy hiểm) - Nhịp tim đập cảnh báo
      dangerSpeed: 0.35, // Thời gian 1 nhịp đập (giây, càng nhỏ càng nhanh)
      dangerScaleMax: 0.47, // Độ to cực đại khi đập
      dangerScaleMin: 0.38, // Độ thu nhỏ khi đập

      // Ô XANH (An toàn) - Nhịp thở êm ái
      safeSpeed: 1.0, // Thời gian 1 nhịp thở (giây)
      safeScaleMax: 0.44, // Độ to cực đại khi thở
      safeScaleMin: 0.4, // Độ thu nhỏ khi thở

      // Tùy chọn hiệu ứng xoay vòng radar (Rotate)
      enableRotate: false, // Đổi thành true nếu muốn vòng ngắm xoay tròn liên tục
      rotateSpeed: 4.0, // Thời gian xoay 360 độ (giây)
    },

    // 3. KÍCH THƯỚC CÁC CHI TIẾT HÌNH HỌC (Pixels trên canvas 128x128)
    radius: {
      outerRing: 36, // Bán kính vành ngắm ngoài (36px)
      innerRing: 23, // Bán kính vành ngắm phụ bên trong (23px)
      centerOrb: 13, // Bán kính bóng ngọc 3D ở tâm (13px)
      discBacking: 36, // Bán kính đĩa nền mờ
      tickStart: 27, // Tọa độ bắt đầu vạch ngắm chữ thập
      tickEnd: 43, // Tọa độ mũi tên vạch ngắm chữ thập
    },

    // 4. ĐỘ DÀY NÉT VẼ (Stroke Width)
    strokeWidth: {
      outerRing: 3.5, // Độ dày vành ngoài
      innerRing: 1.6, // Độ dày vành trong
      crosshair: 3.0, // Độ dày vạch chữ thập
      orbRim: 1.2, // Độ dày viền bóng ngọc
    },

    // 5. MÀU SẮC & ÁNH SÁNG GLOW
    colors: {
      safe: {
        ring: "#4ade80", // Xanh neon viền ngoài
        glow: "#22c55e", // Ánh sáng tỏa ra
        glowBlur: 12, // Độ tỏa sáng
        innerRing: "rgba(134, 239, 172, 0.65)",
        discBacking: "rgba(16, 185, 129, 0.18)",
        crosshair: "#86efac",
        orbGradient: ["#ffffff", "#bbf7d0", "#22c55e", "#16a34a", "#14532d"],
      },
      danger: {
        ring: "#ff3355", // Đỏ rực viền ngoài
        glow: "#ef4444", // Ánh sáng tỏa ra
        glowBlur: 14, // Độ tỏa sáng
        innerRing: "rgba(254, 202, 202, 0.85)",
        discBacking: "rgba(239, 68, 68, 0.22)",
        crosshair: "#fecaca",
        orbGradient: ["#ffffff", "#fecaca", "#ef4444", "#dc2626", "#7f1d1d"],
      },
    },
  };

  let radarGreenCanvasCache = null;
  let radarRedCanvasCache = null;
  let cachedRadarGreenTex = null;
  let cachedRadarRedTex = null;

  function getRadarGreenCanvas() {
    if (radarGreenCanvasCache) return radarGreenCanvasCache;
    if (typeof document === "undefined") return null;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      const cx = 64,
        cy = 64;
      const r = RADAR_CONFIG.radius;
      const sw = RADAR_CONFIG.strokeWidth;
      const col = RADAR_CONFIG.colors.safe;

      ctx.clearRect(0, 0, 128, 128);

      // 1. Soft Ambient Neon Green Glow / Bloom
      const bloom = ctx.createRadialGradient(cx, cy, 12, cx, cy, 60);
      bloom.addColorStop(0.0, "rgba(34, 197, 94, 0.45)");
      bloom.addColorStop(0.5, "rgba(34, 197, 94, 0.18)");
      bloom.addColorStop(1.0, "rgba(34, 197, 94, 0.0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fill();

      // 2. Translucent Tinted Radar Glass / Disc Backing
      ctx.fillStyle = col.discBacking;
      ctx.beginPath();
      ctx.arc(cx, cy, r.discBacking, 0, Math.PI * 2);
      ctx.fill();

      // 3. Sharp Main Tactical Outer Reticle Ring
      ctx.save();
      ctx.shadowColor = col.glow;
      ctx.shadowBlur = col.glowBlur;
      ctx.strokeStyle = col.ring;
      ctx.lineWidth = sw.outerRing;
      ctx.beginPath();
      ctx.arc(cx, cy, r.outerRing, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Inner Concentric Reticle Ring
      ctx.strokeStyle = col.innerRing;
      ctx.lineWidth = sw.innerRing;
      ctx.beginPath();
      ctx.arc(cx, cy, r.innerRing, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Four Bold Tactical Crosshair Ticks (North, South, West, East)
      ctx.save();
      ctx.shadowColor = col.glow;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = col.crosshair;
      ctx.lineWidth = sw.crosshair;
      ctx.lineCap = "round";
      ctx.beginPath();
      // North
      ctx.moveTo(cx, cy - r.tickEnd);
      ctx.lineTo(cx, cy - r.tickStart);
      // South
      ctx.moveTo(cx, cy + r.tickEnd);
      ctx.lineTo(cx, cy + r.tickStart);
      // West
      ctx.moveTo(cx - r.tickEnd, cy);
      ctx.lineTo(cx - r.tickStart, cy);
      // East
      ctx.moveTo(cx + r.tickEnd, cy);
      ctx.lineTo(cx + r.tickStart, cy);
      ctx.stroke();
      ctx.restore();

      // 6. Center 3D Luminous Core Orb (Solid & Brilliant)
      const orbGrad = ctx.createRadialGradient(
        cx - 3,
        cy - 3,
        1,
        cx,
        cy,
        r.centerOrb,
      );
      const stops = col.orbGradient;
      orbGrad.addColorStop(0.0, stops[0]);
      orbGrad.addColorStop(0.2, stops[1]);
      orbGrad.addColorStop(0.55, stops[2]);
      orbGrad.addColorStop(0.85, stops[3]);
      orbGrad.addColorStop(1.0, stops[4]);
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r.centerOrb, 0, Math.PI * 2);
      ctx.fill();

      // White specular gleam dot
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 4, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Glowing rim around orb
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = sw.orbRim;
      ctx.beginPath();
      ctx.arc(cx, cy, r.centerOrb, 0, Math.PI * 2);
      ctx.stroke();

      radarGreenCanvasCache = canvas;
      return canvas;
    } catch (e) {
      console.warn("[AN Mod] Failed to create green radar canvas:", e);
      return null;
    }
  }

  function getRadarRedCanvas() {
    if (radarRedCanvasCache) return radarRedCanvasCache;
    if (typeof document === "undefined") return null;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      const cx = 64,
        cy = 64;
      const r = RADAR_CONFIG.radius;
      const sw = RADAR_CONFIG.strokeWidth;
      const col = RADAR_CONFIG.colors.danger;

      ctx.clearRect(0, 0, 128, 128);

      // 1. Soft Ambient Warning Bloom
      const bloom = ctx.createRadialGradient(cx, cy, 12, cx, cy, 60);
      bloom.addColorStop(0.0, "rgba(239, 68, 68, 0.55)");
      bloom.addColorStop(0.5, "rgba(239, 68, 68, 0.22)");
      bloom.addColorStop(1.0, "rgba(239, 68, 68, 0.0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fill();

      // 2. Translucent Tinted Danger Zone Backing
      ctx.fillStyle = col.discBacking;
      ctx.beginPath();
      ctx.arc(cx, cy, r.discBacking, 0, Math.PI * 2);
      ctx.fill();

      // 3. Sharp Main Tactical Warning Outer Ring
      ctx.save();
      ctx.shadowColor = col.glow;
      ctx.shadowBlur = col.glowBlur;
      ctx.strokeStyle = col.ring;
      ctx.lineWidth = sw.outerRing;
      ctx.beginPath();
      ctx.arc(cx, cy, r.outerRing, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Inner Concentric Dashed Reticle Ring (Warning pattern)
      ctx.strokeStyle = col.innerRing;
      ctx.lineWidth = sw.innerRing;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, r.innerRing, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Four Bold Tactical Crosshair Ticks (North, South, West, East)
      ctx.save();
      ctx.shadowColor = col.glow;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = col.crosshair;
      ctx.lineWidth = sw.crosshair;
      ctx.lineCap = "round";
      ctx.beginPath();
      // North
      ctx.moveTo(cx, cy - r.tickEnd);
      ctx.lineTo(cx, cy - r.tickStart);
      // South
      ctx.moveTo(cx, cy + r.tickEnd);
      ctx.lineTo(cx, cy + r.tickStart);
      // West
      ctx.moveTo(cx - r.tickEnd, cy);
      ctx.lineTo(cx - r.tickStart, cy);
      // East
      ctx.moveTo(cx + r.tickEnd, cy);
      ctx.lineTo(cx + r.tickStart, cy);
      ctx.stroke();
      ctx.restore();

      // 6. Center 3D Luminous Danger Core Orb (Solid & Blazing Red)
      const redOrbGrad = ctx.createRadialGradient(
        cx - 3,
        cy - 3,
        1,
        cx,
        cy,
        r.centerOrb,
      );
      const stops = col.orbGradient;
      redOrbGrad.addColorStop(0.0, stops[0]);
      redOrbGrad.addColorStop(0.2, stops[1]);
      redOrbGrad.addColorStop(0.55, stops[2]);
      redOrbGrad.addColorStop(0.85, stops[3]);
      redOrbGrad.addColorStop(1.0, stops[4]);
      ctx.fillStyle = redOrbGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r.centerOrb, 0, Math.PI * 2);
      ctx.fill();

      // White specular gleam dot
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 4, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Glowing rim
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = sw.orbRim;
      ctx.beginPath();
      ctx.arc(cx, cy, r.centerOrb, 0, Math.PI * 2);
      ctx.stroke();

      radarRedCanvasCache = canvas;
      return canvas;
    } catch (e) {
      console.warn("[AN Mod] Failed to create red radar canvas:", e);
      return null;
    }
  }

  function getRadarTexture(isDanger) {
    if (typeof window === "undefined" || !window.cc) return null;
    if (isDanger && cachedRadarRedTex) return cachedRadarRedTex;
    if (!isDanger && cachedRadarGreenTex) return cachedRadarGreenTex;

    const canvas = isDanger ? getRadarRedCanvas() : getRadarGreenCanvas();
    if (!canvas) return null;

    try {
      let tex = null;
      if (cc.Texture2D) {
        tex = new cc.Texture2D();
        if (typeof tex.initWithElement === "function") {
          tex.initWithElement(canvas);
          if (typeof tex.handleLoadedTexture === "function") {
            tex.handleLoadedTexture();
          }
        }
      }
      const result = tex || canvas;
      if (isDanger) cachedRadarRedTex = result;
      else cachedRadarGreenTex = result;
      return result;
    } catch (e) {
      console.warn("[AN Mod] Failed to getRadarTexture:", e);
      return canvas;
    }
  }

  function createRadarSprite(isDanger) {
    if (typeof window === "undefined" || !window.cc) return null;
    const tex = getRadarTexture(isDanger);
    if (!tex) return null;

    try {
      let spr = null;
      if (typeof cc.Sprite === "function") {
        spr = new cc.Sprite(tex);
      } else if (cc.Sprite && typeof cc.Sprite.create === "function") {
        spr = cc.Sprite.create(tex);
      }
      if (spr) {
        spr.setAnchorPoint(0.5, 0.5);
      }
      return spr;
    } catch (err) {
      console.warn("[AN Mod] createRadarSprite failed:", err);
      return null;
    }
  }

  function ensureRadarSprites(marker) {
    if (!marker) return;
    const sz = marker.getContentSize ? marker.getContentSize() : null;
    const w = sz && sz.width > 0 ? sz.width : 32;
    const h = sz && sz.height > 0 ? sz.height : 32;
    const baseScale = RADAR_CONFIG.baseScale || 0.42;

    if (!marker.__radarGreen) {
      const sprGreen = createRadarSprite(false);
      if (sprGreen) {
        sprGreen.setPosition(w / 2, h / 2);
        sprGreen.setVisible(false);
        sprGreen.setScale(baseScale);
        marker.addChild(sprGreen, 20);
        marker.__radarGreen = sprGreen;
      }
    }

    if (!marker.__radarRed) {
      const sprRed = createRadarSprite(true);
      if (sprRed) {
        sprRed.setPosition(w / 2, h / 2);
        sprRed.setVisible(false);
        sprRed.setScale(baseScale);
        marker.addChild(sprRed, 20);
        marker.__radarRed = sprRed;
      }
    }
  }

  function applyRadarStyleToMarker(marker, isDanger) {
    if (!marker) return;
    ensureRadarSprites(marker);

    // Hide native orange dot so it doesn't bleed through or darken colors
    if (typeof marker.setCascadeOpacityEnabled === "function") {
      marker.setCascadeOpacityEnabled(false);
    }
    if (typeof marker.setOpacity === "function") {
      marker.setOpacity(0);
    }
    if (
      typeof marker.setColor === "function" &&
      typeof cc !== "undefined" &&
      cc.color
    ) {
      marker.setColor(cc.color(255, 255, 255));
    }

    const baseScale = RADAR_CONFIG.baseScale || 0.42;
    const anim = RADAR_CONFIG.animation || {};

    if (isDanger) {
      if (marker.__radarGreen) {
        marker.__radarGreen.stopAllActions();
        marker.__radarGreen.setVisible(false);
      }
      if (marker.__radarRed) {
        marker.__radarRed.setVisible(true);
        marker.__radarRed.setOpacity(255);
        marker.__radarRed.stopAllActions();
        marker.__radarRed.setScale(baseScale);

        if (anim.enable !== false && typeof cc !== "undefined") {
          if (
            typeof cc.sequence === "function" &&
            typeof cc.scaleTo === "function"
          ) {
            const pulse = cc.sequence(
              cc.scaleTo(anim.dangerSpeed || 0.35, anim.dangerScaleMax || 0.47),
              cc.scaleTo(anim.dangerSpeed || 0.35, anim.dangerScaleMin || 0.38),
            ).repeatForever();
            marker.__radarRed.runAction(pulse);
          }
          if (anim.enableRotate && typeof cc.rotateBy === "function") {
            marker.__radarRed.runAction(
              cc.rotateBy(anim.rotateSpeed || 4.0, 360).repeatForever(),
            );
          }
        }
      }
    } else {
      if (marker.__radarRed) {
        marker.__radarRed.stopAllActions();
        marker.__radarRed.setVisible(false);
      }
      if (marker.__radarGreen) {
        marker.__radarGreen.setVisible(true);
        marker.__radarGreen.setOpacity(255);
        marker.__radarGreen.stopAllActions();
        marker.__radarGreen.setScale(baseScale);

        if (anim.enable !== false && typeof cc !== "undefined") {
          if (
            typeof cc.sequence === "function" &&
            typeof cc.scaleTo === "function"
          ) {
            const breathe = cc.sequence(
              cc.scaleTo(anim.safeSpeed || 1.0, anim.safeScaleMax || 0.44),
              cc.scaleTo(anim.safeSpeed || 1.0, anim.safeScaleMin || 0.4),
            ).repeatForever();
            marker.__radarGreen.runAction(breathe);
          }
          if (anim.enableRotate && typeof cc.rotateBy === "function") {
            marker.__radarGreen.runAction(
              cc.rotateBy(anim.rotateSpeed || 4.0, 360).repeatForever(),
            );
          }
        }
      }
    }
  }

  function resetRadarStyleMarker(marker) {
    if (!marker) return;
    if (marker.__radarGreen) {
      marker.__radarGreen.stopAllActions();
      marker.__radarGreen.setVisible(false);
    }
    if (marker.__radarRed) {
      marker.__radarRed.stopAllActions();
      marker.__radarRed.setVisible(false);
    }
    if (marker.__radarRing) {
      marker.__radarRing.stopAllActions();
      marker.__radarRing.setVisible(false);
    }
    if (typeof marker.setCascadeOpacityEnabled === "function") {
      marker.setCascadeOpacityEnabled(true);
    }
    if (typeof marker.setOpacity === "function") {
      marker.setOpacity(255);
    }
    if (typeof marker.setScale === "function") {
      marker.setScale(1.0);
    }
    if (
      typeof marker.setColor === "function" &&
      typeof cc !== "undefined" &&
      cc.color
    ) {
      marker.setColor(cc.color(255, 255, 255));
    }
  }

  // =========================================================================
  // SIMULATED BOARD & DETERMINISTIC TACTICAL ATTACK SCANNER
  // Pure Xiangqi rules evaluator: 100% accurate for both Red & Black
  // =========================================================================

  function buildSimulatedGrid(gl, movingPieceIndex, toCol, toRow) {
    const grid = Array.from({ length: 9 }, () => Array(10).fill(null));
    if (!gl || !gl.V || !Array.isArray(gl.V)) return grid;

    for (let i = 0; i < 32; i++) {
      const p = gl.V[i];
      if (!p || p.pa) continue;
      if (i === movingPieceIndex) continue; // Will be placed at (toCol, toRow)
      if (p.fa === undefined || p.rowIndex === undefined) continue;
      if (p.fa < 0 || p.fa > 8 || p.rowIndex < 0 || p.rowIndex > 9) continue;

      const pType =
        typeof ZigaMod.resolvePieceType === "function"
          ? ZigaMod.resolvePieceType(p, i)
          : p.Ha !== undefined
            ? p.Ha
            : p.Ga !== undefined
              ? p.Ga
              : i === 0 || i === 16
                ? 0
                : 6;

      const pColor = p.ka !== undefined ? p.ka : Math.floor(i / 16);

      grid[p.fa][p.rowIndex] = {
        index: i,
        type: pType,
        color: pColor,
        col: p.fa,
        row: p.rowIndex,
      };
    }

    // Place the moving piece at its new simulated destination (toCol, toRow)
    if (movingPieceIndex >= 0 && gl.V[movingPieceIndex]) {
      const mp = gl.V[movingPieceIndex];
      const mpType =
        typeof ZigaMod.resolvePieceType === "function"
          ? ZigaMod.resolvePieceType(mp, movingPieceIndex)
          : mp.Ha !== undefined
            ? mp.Ha
            : mp.Ga !== undefined
              ? mp.Ga
              : movingPieceIndex === 0 || movingPieceIndex === 16
                ? 0
                : 6;
      const mpColor =
        mp.ka !== undefined ? mp.ka : Math.floor(movingPieceIndex / 16);

      grid[toCol][toRow] = {
        index: movingPieceIndex,
        type: mpType,
        color: mpColor,
        col: toCol,
        row: toRow,
      };
    }

    return grid;
  }

  function canPieceAttackTarget(grid, attacker, toCol, toRow, redKingRow) {
    if (!attacker) return false;
    const fromCol = attacker.col;
    const fromRow = attacker.row;
    if (fromCol === toCol && fromRow === toRow) return false;

    const dx = toCol - fromCol;
    const dy = toRow - fromRow;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const type = attacker.type;
    const color = attacker.color;

    // 1. XE (Rook, type 3) - Orthogonal with 0 blockers
    if (type === 3) {
      if (dx !== 0 && dy !== 0) return false;
      if (dx === 0) {
        const step = dy > 0 ? 1 : -1;
        for (let r = fromRow + step; r !== toRow; r += step) {
          if (grid[fromCol][r] !== null) return false;
        }
        return true;
      } else {
        const step = dx > 0 ? 1 : -1;
        for (let c = fromCol + step; c !== toCol; c += step) {
          if (grid[c][fromRow] !== null) return false;
        }
        return true;
      }
    }

    // 2. PHÁO (Cannon, type 4) - Jumps over EXACTLY 1 screen (mòi / ngòi) to capture
    if (type === 4) {
      if (dx !== 0 && dy !== 0) return false;
      let screens = 0;
      if (dx === 0) {
        const step = dy > 0 ? 1 : -1;
        for (let r = fromRow + step; r !== toRow; r += step) {
          if (grid[fromCol][r] !== null) screens++;
        }
      } else {
        const step = dx > 0 ? 1 : -1;
        for (let c = fromCol + step; c !== toCol; c += step) {
          if (grid[c][fromRow] !== null) screens++;
        }
      }
      return screens === 1;
    }

    // 3. MÃ (Knight / Horse, type 5) - L-shape with unblocked horse leg
    if (type === 5) {
      if (absDx === 1 && absDy === 2) {
        const legRow = fromRow + (dy > 0 ? 1 : -1);
        if (grid[fromCol][legRow] === null) return true;
      } else if (absDx === 2 && absDy === 1) {
        const legCol = fromCol + (dx > 0 ? 1 : -1);
        if (grid[legCol][fromRow] === null) return true;
      }
      return false;
    }

    // 4. TỐT / BINH (Pawn, type 6) - 1 step forward; + sideways after river
    if (type === 6) {
      const movesDown =
        (color === 0 && redKingRow <= 2) || (color === 1 && redKingRow >= 7);
      const fwdStep = movesDown ? 1 : -1;
      const crossedRiver = movesDown ? fromRow >= 5 : fromRow <= 4;

      if (dx === 0 && dy === fwdStep) return true;
      if (crossedRiver && dy === 0 && absDx === 1) return true;
      return false;
    }

    // 5. TƯỢNG (Elephant, type 2) - Diagonal 2 steps, eye unblocked, inside own half
    if (type === 2) {
      if (absDx === 2 && absDy === 2) {
        const eyeCol = fromCol + (dx > 0 ? 1 : -1);
        const eyeRow = fromRow + (dy > 0 ? 1 : -1);
        if (grid[eyeCol][eyeRow] !== null) return false;

        const isTopSide =
          (color === 0 && redKingRow <= 2) || (color === 1 && redKingRow >= 7);
        if (isTopSide && toRow > 4) return false;
        if (!isTopSide && toRow < 5) return false;
        return true;
      }
      return false;
    }

    // 6. SĨ (Advisor, type 1) - Diagonal 1 step inside palace
    if (type === 1) {
      if (absDx === 1 && absDy === 1) {
        if (toCol < 3 || toCol > 5) return false;
        const isTopSide =
          (color === 0 && redKingRow <= 2) || (color === 1 && redKingRow >= 7);
        if (isTopSide && (toRow < 0 || toRow > 2)) return false;
        if (!isTopSide && (toRow < 7 || toRow > 9)) return false;
        return true;
      }
      return false;
    }

    // 7. TƯỚNG (King, type 0) - Orthogonal 1 step inside palace
    if (type === 0) {
      if (absDx + absDy === 1) {
        if (toCol >= 3 && toCol <= 5) {
          const isTopSide =
            (color === 0 && redKingRow <= 2) || (color === 1 && redKingRow >= 7);
          if (isTopSide && toRow >= 0 && toRow <= 2) return true;
          if (!isTopSide && toRow >= 7 && toRow <= 9) return true;
        }
      }
      return false;
    }

    return false;
  }

  /**
   * Evaluates if (targetCol, targetRow) is under legal attack by ANY enemy piece
   * on the simulated board state (after the moving piece has made its move).
   */
  function isSquareAttackedByEnemy(
    gl,
    targetCol,
    targetRow,
    movingPieceColor,
    simulatedGrid,
  ) {
    if (!gl || !gl.V || !Array.isArray(gl.V)) return false;
    const oppColor = movingPieceColor === 0 ? 1 : 0;

    // Detect board orientation from Red King (piece 0)
    let redKingRow = 0;
    if (gl.V[0] && typeof gl.V[0].rowIndex === "number") {
      redKingRow = gl.V[0].rowIndex;
    } else if (gl.V) {
      for (let p = 0; p < 32; p++) {
        const piece = gl.V[p];
        if (piece && !piece.pa && (piece.ka === 0 || p < 16)) {
          const pType =
            typeof ZigaMod.resolvePieceType === "function"
              ? ZigaMod.resolvePieceType(piece, p)
              : 6;
          if (pType === 0 && typeof piece.rowIndex === "number") {
            redKingRow = piece.rowIndex;
            break;
          }
        }
      }
    }

    // Check all living enemy pieces on the board
    for (let k = 0; k < 32; k++) {
      const oppPiece = gl.V[k];
      if (!oppPiece || oppPiece.pa) continue;
      const pieceColor =
        oppPiece.ka !== undefined ? oppPiece.ka : Math.floor(k / 16);
      if (pieceColor !== oppColor) continue;

      const oppCol = oppPiece.fa;
      const oppRow = oppPiece.rowIndex;
      if (oppCol === undefined || oppRow === undefined) continue;

      // Skip if this enemy piece is the one being captured on (targetCol, targetRow)
      if (oppCol === targetCol && oppRow === targetRow) continue;

      const oppType =
        typeof ZigaMod.resolvePieceType === "function"
          ? ZigaMod.resolvePieceType(oppPiece, k)
          : oppPiece.Ha !== undefined
            ? oppPiece.Ha
            : oppPiece.Ga !== undefined
              ? oppPiece.Ga
              : k === 0 || k === 16
                ? 0
                : 6;

      const attackerInfo = {
        index: k,
        type: oppType,
        color: pieceColor,
        col: oppCol,
        row: oppRow,
      };

      if (
        canPieceAttackTarget(
          simulatedGrid,
          attackerInfo,
          targetCol,
          targetRow,
          redKingRow,
        )
      ) {
        return true;
      }
    }

    return false;
  }

  // =========================================================================
  // CUSTOM HIGHLIGHT MOVES (Full 32-piece capture detection & Move Safety Radar)
  // =========================================================================

  function customHighlightMoves(gl, pieceIndex) {
    if (pieceIndex < 0 || pieceIndex >= 32 || !gl.V || !gl.V[pieceIndex]) return;

    // Reset previous piece capture rings so no leftover halos remain
    if (gl.V && Array.isArray(gl.V)) {
      for (var p = 0; p < 32; p++) {
        if (gl.V[p] && typeof gl.V[p].kj === "function") {
          gl.V[p].kj(false);
        }
      }
    }

    var b = Array(9);
    for (var c = 0; 10 > c; c++) b[c] = Array(10);
    generateBoardMatrix(gl, b);

    var pieceHelper = getPieceHelper(gl, pieceIndex);
    if (!pieceHelper) return;

    gl.Tp = [];
    gl.Vp = [];
    var attacker = gl.V[pieceIndex];
    var attackerColor =
      attacker.ka !== undefined ? attacker.ka : Math.floor(pieceIndex / 16);
    var capturableList = [];

    for (var d = 0, e = 0; 90 > e; e++) {
      if (isMovePatternValid(gl, pieceHelper, pieceIndex, e, b)) {
        var f = e % 9,
          g = Math.floor(e / 9);

        var isBlockedOrChecked =
          isKingFacingKing(gl, pieceHelper, pieceIndex, f, g, b) ||
          isKingCheckedAfterMove(gl, pieceHelper, pieceIndex, f, g, b);

        if (isBlockedOrChecked) {
          if (gl.tc && gl.tc[d]) {
            gl.tc[d].setPosition(gl.Pb(f), gl.Qb(g));
            gl.tc[d].Kr = g;
            gl.tc[d].Ir = g;
            gl.tc[d].aq = f;
            gl.tc[d].cq = f;
            gl.tc[d].setVisible(false);
            resetRadarStyleMarker(gl.tc[d]);
          }
        } else {
          // Construct simulated board grid with piece moved to (f, g)
          var simGrid = buildSimulatedGrid(gl, pieceIndex, f, g);

          var isEnemyCapture = false;
          var capturedTargetIndex = -1;

          // Check ALL 32 pieces for target on square (f, g)
          // Fixes Ziga's engine bug where it hardcoded k = 16..31
          for (var k = 0; k < 32; k++) {
            var targetPiece = gl.V[k];
            if (
              targetPiece &&
              !targetPiece.pa &&
              (targetPiece.ka !== undefined
                ? targetPiece.ka
                : Math.floor(k / 16)) !== attackerColor &&
              targetPiece.fa === f &&
              targetPiece.rowIndex === g
            ) {
              isEnemyCapture = true;
              capturedTargetIndex = k;
              enhancePieceSprite(targetPiece);

              const isRadarEnabled =
                !ZigaMod.userSettings ||
                ZigaMod.userSettings.moveSafetyRadar !== false;
              let isCaptureDangerous = false;
              if (isRadarEnabled) {
                isCaptureDangerous = isSquareAttackedByEnemy(
                  gl,
                  f,
                  g,
                  attackerColor,
                  simGrid,
                );
              }

              if (
                !ZigaMod.userSettings ||
                ZigaMod.userSettings.highlightTactics !== false
              ) {
                targetPiece.kj(true, isCaptureDangerous);
              }
              gl.Tp.push([f, g]);
              gl.Vp.push([f, g]);

              const pType =
                typeof ZigaMod.resolvePieceType === "function"
                  ? ZigaMod.resolvePieceType(targetPiece, k)
                  : targetPiece.Ha !== undefined
                    ? targetPiece.Ha
                    : targetPiece.Ga !== undefined
                      ? targetPiece.Ga
                      : 6;

              capturableList.push({
                piece: targetPiece,
                type: pType,
                color: targetPiece.ka,
                col: f,
                row: g,
                name:
                  ZigaMod.PIECE_DEFS && ZigaMod.PIECE_DEFS[pType]
                    ? ZigaMod.PIECE_DEFS[pType].name
                    : "Quân",
                char:
                  typeof ZigaMod.getPieceChar === "function"
                    ? ZigaMod.getPieceChar(pType, targetPiece.ka)
                    : "",
                value:
                  ZigaMod.PIECE_DEFS && ZigaMod.PIECE_DEFS[pType]
                    ? ZigaMod.PIECE_DEFS[pType].value
                    : 0,
                isDangerous: isCaptureDangerous,
              });
              break;
            }
          }

          if (!isEnemyCapture && gl.tc && gl.tc[d]) {
            gl.tc[d].setPosition(gl.Pb(f), gl.Qb(g));
            gl.tc[d].Kr = g;
            gl.tc[d].Ir = g;
            gl.tc[d].aq = f;
            gl.tc[d].cq = f;
            gl.tc[d].setVisible(true);

            const isRadarEnabled =
              !ZigaMod.userSettings ||
              ZigaMod.userSettings.moveSafetyRadar !== false;

            if (isRadarEnabled) {
              const isDanger = isSquareAttackedByEnemy(
                gl,
                f,
                g,
                attackerColor,
                simGrid,
              );
              applyRadarStyleToMarker(gl.tc[d], isDanger);
            } else {
              resetRadarStyleMarker(gl.tc[d]);
            }
          }
        }
        d++;
      }
    }

    // Hide any remaining unused move markers from previous pieces
    if (gl.tc && Array.isArray(gl.tc)) {
      for (var rem = d; rem < gl.tc.length; rem++) {
        if (gl.tc[rem]) {
          gl.tc[rem].setPosition(-100, -100);
          gl.tc[rem].Kr = -1;
          gl.tc[rem].Ir = -1;
          gl.tc[rem].aq = -1;
          gl.tc[rem].cq = -1;
          gl.tc[rem].setVisible(false);
          resetRadarStyleMarker(gl.tc[rem]);
        }
      }
    }

    ZigaMod.selectedAttackerIndex = pieceIndex;
    if (typeof ZigaMod.updateTacticalHud === "function") {
      ZigaMod.updateTacticalHud(attacker, capturableList);
    }

    // Guarantee rotating selection indicator (this.ij) is ALWAYS visible, actively rotating, and BEHIND pieces
    if (gl && gl.ij && gl.V && gl.V[pieceIndex]) {
      gl.ij.setVisible(true);
      // z-order 31: ABOVE background (0) and BEHIND pieces (32) so chess character is crisp & clean
      if (typeof gl.ij.setLocalZOrder === "function") {
        gl.ij.setLocalZOrder(31);
      }
      gl.ij.setPosition(
        gl.Pb(gl.V[pieceIndex].fa),
        gl.Qb(gl.V[pieceIndex].rowIndex) + 1,
      );
      if (typeof cc !== "undefined" && typeof cc.rotateBy === "function") {
        if (
          !gl.ij.getNumberOfRunningActions ||
          gl.ij.getNumberOfRunningActions() === 0
        ) {
          const rot = cc.rotateBy(2, 360).repeatForever();
          gl.Hr = rot;
          gl.Fr = rot;
          gl.ij.stopAllActions();
          gl.ij.runAction(rot);
        }
      }
    }
  }

  // =========================================================================
  // CLEAR HIGHLIGHTS (All 32 pieces and markers)
  // =========================================================================

  function clearHighlights(gl) {
    if (!gl) return;

    if (gl.tc && Array.isArray(gl.tc)) {
      for (var a = 0; a < gl.tc.length; a++) {
        if (gl.tc[a]) {
          gl.tc[a].setPosition(-100, -100);
          gl.tc[a].Kr = -1;
          gl.tc[a].Ir = -1;
          gl.tc[a].aq = -1;
          gl.tc[a].cq = -1;
          resetRadarStyleMarker(gl.tc[a]);
        }
      }
    }

    if (gl.V && Array.isArray(gl.V)) {
      for (var a = 0; a < 32; a++) {
        if (gl.V[a] && typeof gl.V[a].kj === "function") {
          gl.V[a].kj(false);
        }
      }
    }

    // Cleanly hide and reset selection swirl (gl.ij)
    if (gl.ij) {
      gl.ij.setPosition(-100, -100);
      if (gl.Hr) {
        gl.ij.stopAction(gl.Hr);
        gl.Hr = null;
      }
      if (gl.Fr) {
        gl.ij.stopAction(gl.Fr);
        gl.Fr = null;
      }
      gl.ij.stopAllActions();
      gl.ij.setVisible(false);
    }

    if (gl.Tp) gl.Tp = [];
    if (gl.Vp) gl.Vp = [];

    ZigaMod.selectedAttackerIndex = -1;
    if (typeof ZigaMod.clearTacticalHud === "function") {
      ZigaMod.clearTacticalHud();
    }
  }

  // =========================================================================
  // HOOK GAME LAYER
  // =========================================================================

  function hookGameLayer(gameLayer) {
    if (!gameLayer || gameLayer.__zigaInEngineHooked) return;
    gameLayer.__zigaInEngineHooked = true;

    console.log(
      "[AN Mod] In-engine hooks active (vT/nT, zA/pA, cp/fp, nU/fU).",
    );

    // Also enhance BkChessPieceSprite prototype if available
    if (
      typeof window !== "undefined" &&
      window.BkChessPieceSprite &&
      window.BkChessPieceSprite.prototype
    ) {
      enhancePieceSprite(window.BkChessPieceSprite.prototype);
    }

    if (gameLayer.V && Array.isArray(gameLayer.V)) {
      for (let i = 0; i < gameLayer.V.length; i++) {
        enhancePieceSprite(gameLayer.V[i]);
      }
    }

    // Initialize board row numbers (1-10 on left and right wooden rims)
    setupRowNumbers(gameLayer);

    // 0. HOOK YR (v142+) / XR (v141 selection indicator placement & rotation)
    const origYR = typeof gameLayer.YR === "function" ? gameLayer.YR : null;
    const origXR = typeof gameLayer.XR === "function" ? gameLayer.XR : null;
    const selectHandler = function (pieceIndex) {
      if (origYR) {
        origYR.call(this, pieceIndex);
      } else if (origXR) {
        origXR.call(this, pieceIndex);
      }
      this.me = pieceIndex;
      this.le = pieceIndex;
      if (this.ij && this.V && this.V[pieceIndex]) {
        this.ij.setVisible(true);
        if (typeof this.ij.setLocalZOrder === "function") {
          this.ij.setLocalZOrder(31);
        }
        this.ij.setPosition(
          this.Pb(this.V[pieceIndex].fa),
          this.Qb(this.V[pieceIndex].rowIndex) + 1,
        );
        if (typeof cc !== "undefined" && typeof cc.rotateBy === "function") {
          if (
            !this.ij.getNumberOfRunningActions ||
            this.ij.getNumberOfRunningActions() === 0
          ) {
            const rot = cc.rotateBy(2, 360).repeatForever();
            this.Hr = rot;
            this.Fr = rot;
            this.ij.stopAllActions();
            this.ij.runAction(rot);
          }
        }
      }
    };
    if (origYR) gameLayer.YR = selectHandler;
    if (origXR) gameLayer.XR = selectHandler;

    // 1. OVERRIDE wT (v142+), vT (v141) and nT (legacy)
    gameLayer.wT = function (pieceIndex) {
      customHighlightMoves(this, pieceIndex);
    };
    gameLayer.vT = function (pieceIndex) {
      customHighlightMoves(this, pieceIndex);
    };
    gameLayer.nT = function (pieceIndex) {
      customHighlightMoves(this, pieceIndex);
    };

    // 2. OVERRIDE zA (v141+) and pA (legacy)
    gameLayer.zA = function () {
      clearHighlights(this);
    };
    gameLayer.pA = function () {
      clearHighlights(this);
    };

    // 3. OVERRIDE cp (v141+) and fp (legacy)
    const unselectHandler = function () {
      if (this.ij) {
        this.ij.setPosition(-100, -100);
        if (this.Hr) this.ij.stopAction(this.Hr);
        if (this.Fr) this.ij.stopAction(this.Fr);
        this.ij.stopAllActions();
        this.Hr = null;
        this.Fr = null;
        this.ij.setVisible(false);
      }

      clearHighlights(this);
      this.me = -1;
      this.le = -1;
    };

    gameLayer.cp = unselectHandler;
    gameLayer.fp = unselectHandler;

    // 4. HOOK oU (v142+), nU (v141) and fU (legacy)
    const origOU = typeof gameLayer.oU === "function" ? gameLayer.oU : null;
    const origNU = typeof gameLayer.nU === "function" ? gameLayer.nU : null;
    const origFU = typeof gameLayer.fU === "function" ? gameLayer.fU : null;

    const invokeOrigTouch = (target, touchX, touchY) => {
      if (origOU) origOU.call(target, touchX, touchY);
      else if (origNU) origNU.call(target, touchX, touchY);
      else if (origFU) origFU.call(target, touchX, touchY);
    };

    const touchHandler = function (touchX, touchY) {
      const col = typeof this.xq === "function" ? this.xq(touchX) : -1;
      const row = typeof this.Cq === "function" ? this.Cq(touchY) : -1;
      const clickedIdx = findPieceAt(this, col, row);

      if (clickedIdx >= 0 && this.V && this.V[clickedIdx]) {
        const clickedPiece = this.V[clickedIdx];
        const myColor = this.Nj !== undefined && this.Nj >= 0 ? this.Nj : 0;
        const isMyTurn =
          this.T &&
          typeof this.T === "function" &&
          this.T().Fb === 2 &&
          this.Yc === this.Nj;
        const currentSelected =
          this.me !== undefined && this.me >= 0
            ? this.me
            : this.le !== undefined && this.le >= 0
              ? this.le
              : -1;

        // A. If my turn, piece already selected, and clicked on a valid destination/capture move -> make move!
        if (currentSelected >= 0 && isMyTurn && isDestValid(this, col, row)) {
          invokeOrigTouch(this, touchX, touchY);
          return;
        }

        // B. If clicked opponent piece OR clicked own piece when NOT my turn -> Tactical Inspector
        if (clickedPiece.ka !== myColor || !isMyTurn) {
          if (currentSelected === clickedIdx) {
            // Clicked same piece again -> deselect & clear highlights
            this.cp();
          } else {
            // Select to inspect attack range
            this.cp();
            this.me = clickedIdx;
            this.le = clickedIdx;

            if (this.ij) {
              this.ij.setVisible(true);
              if (typeof this.ij.setLocalZOrder === "function") {
                this.ij.setLocalZOrder(31);
              }
              this.ij.setPosition(
                this.Pb(clickedPiece.fa),
                this.Qb(clickedPiece.rowIndex) + 1,
              );
              this.ij.stopAllActions();
              if (
                typeof cc !== "undefined" &&
                typeof cc.rotateBy === "function"
              ) {
                const rot = cc.rotateBy(2, 360).repeatForever();
                this.Hr = rot;
                this.Fr = rot;
                this.ij.runAction(rot);
              }
            }

            customHighlightMoves(this, clickedIdx);
          }
          return;
        }

        // C. Clicked own piece on my turn -> default selection behavior (calls YR/XR -> wT/vT/nT)
        invokeOrigTouch(this, touchX, touchY);

        // After calling native touch handler, verify selection ring is visible if a piece was selected
        const newSelected =
          this.me !== undefined && this.me >= 0
            ? this.me
            : this.le !== undefined && this.le >= 0
              ? this.le
              : -1;
        if (newSelected >= 0 && this.ij && this.V && this.V[newSelected]) {
          this.ij.setVisible(true);
          if (typeof this.ij.setLocalZOrder === "function") {
            this.ij.setLocalZOrder(31);
          }
          this.ij.setPosition(
            this.Pb(this.V[newSelected].fa),
            this.Qb(this.V[newSelected].rowIndex) + 1,
          );
          if (typeof cc !== "undefined" && typeof cc.rotateBy === "function") {
            if (
              !this.ij.getNumberOfRunningActions ||
              this.ij.getNumberOfRunningActions() === 0
            ) {
              const rot = cc.rotateBy(2, 360).repeatForever();
              this.Hr = rot;
              this.Fr = rot;
              this.ij.stopAllActions();
              this.ij.runAction(rot);
            }
          }
        }
        return;
      }

      // D. Clicked outside / empty board square
      const currentSelected =
        this.me !== undefined && this.me >= 0
          ? this.me
          : this.le !== undefined && this.le >= 0
            ? this.le
            : -1;
      if (currentSelected >= 0) {
        const selectedPiece = this.V ? this.V[currentSelected] : null;
        const myColor = this.Nj !== undefined && this.Nj >= 0 ? this.Nj : 0;
        const isMyTurn =
          this.T &&
          typeof this.T === "function" &&
          this.T().Fb === 2 &&
          this.Yc === this.Nj;

        // If inspecting enemy piece or inspecting during opponent turn, clicking empty square deselects
        if (selectedPiece && (selectedPiece.ka !== myColor || !isMyTurn)) {
          this.cp();
          return;
        }
      }

      invokeOrigTouch(this, touchX, touchY);
    };

    if (origOU) gameLayer.oU = touchHandler;
    if (origNU) gameLayer.nU = touchHandler;
    if (origFU) gameLayer.fU = touchHandler;
  }

  // ==========================================
  // BOARD ROW NUMBERS (1 to 10 on Wooden Rims)
  // ==========================================

  function setupRowNumbers(gameLayer) {
    if (
      !gameLayer ||
      typeof gameLayer.Pb !== "function" ||
      typeof gameLayer.Qb !== "function"
    )
      return;

    const ROW_FONT_SIZE = 16;

    // Nếu đã tạo nhãn với đúng cỡ chữ này thì chỉ cập nhật ẩn/hiện
    if (
      gameLayer.__zigaRowLabels &&
      gameLayer.__zigaRowLabels.length > 0 &&
      gameLayer.__zigaRowLabelsFontSize === ROW_FONT_SIZE
    ) {
      updateRowLabelsVisibility(gameLayer);
      return;
    }

    // Nếu cỡ chữ thay đổi hoặc cần tạo mới, gỡ bỏ nhãn cũ trước
    if (gameLayer.__zigaRowLabels && Array.isArray(gameLayer.__zigaRowLabels)) {
      for (let i = 0; i < gameLayer.__zigaRowLabels.length; i++) {
        const lbl = gameLayer.__zigaRowLabels[i];
        if (lbl && typeof lbl.removeFromParent === "function") {
          lbl.removeFromParent(true);
        }
      }
      gameLayer.__zigaRowLabels = [];
    }

    gameLayer.__zigaRowLabelsFontSize = ROW_FONT_SIZE;
    gameLayer.__zigaRowLabelsAdded = true;

    const p0 = gameLayer.Pb(0);
    const p1 = gameLayer.Pb(1);
    const p8 = gameLayer.Pb(8);
    const dx = Math.abs(p1 - p0) || 57;

    const leftX = p0 - dx * 0.44;
    const rightX = p8 + dx * 0.44;

    const labels = [];
    let cocosSuccess = false;

    if (window.cc) {
      try {
        for (let r = 0; r < 10; r++) {
          const y = gameLayer.Qb(r);
          const numText = (10 - r).toString();
          const numTextRight = (r + 1).toString();

          let lblL = null;
          let lblR = null;

          if (typeof cc.LabelTTF === "function") {
            try {
              lblL = new cc.LabelTTF(numText, "Arial", ROW_FONT_SIZE);
              lblR = new cc.LabelTTF(numTextRight, "Arial", ROW_FONT_SIZE);
            } catch (e) {
              if (cc.LabelTTF.create) {
                lblL = cc.LabelTTF.create(numText, "Arial", ROW_FONT_SIZE);
                lblR = cc.LabelTTF.create(numTextRight, "Arial", ROW_FONT_SIZE);
              }
            }
          }

          if (lblL && lblR) {
            // Wood carved tone matching bottom column numbers exactly
            const textColor = cc.color ? cc.color(114, 51, 20) : null;
            if (textColor) {
              if (lblL.setColor) {
                lblL.setColor(textColor);
                lblR.setColor(textColor);
              }
            }
            if (lblL.setOpacity) {
              lblL.setOpacity(220);
              lblR.setOpacity(220);
            }
            lblL.setPosition(leftX, y);
            lblR.setPosition(rightX, y);
            if (lblL.setAnchorPoint) {
              lblL.setAnchorPoint(0.5, 0.5);
              lblR.setAnchorPoint(0.5, 0.5);
            }

            // Add at z-index 5 (below pieces at z=10, above board background at z=0)
            gameLayer.addChild(lblL, 5);
            gameLayer.addChild(lblR, 5);

            labels.push(lblL);
            labels.push(lblR);
            cocosSuccess = true;
          }
        }
      } catch (err) {
        console.warn("[AN Mod] Cocos2d LabelTTF init failed:", err);
      }
    }

    gameLayer.__zigaRowLabels = labels;

    // Fallback: If Cocos labels could not be created, use DOM overlay
    if (!cocosSuccess) {
      setupDomRowNumbers(gameLayer);
    }

    updateRowLabelsVisibility(gameLayer);
  }

  function setupDomRowNumbers(gameLayer) {
    let overlay = document.getElementById("ziga-dom-row-numbers");
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "ziga-dom-row-numbers";
      overlay.style.position = "absolute";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "50";
      const parent = canvas.parentElement || document.body;
      if (window.getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }
      parent.appendChild(overlay);
    }

    const rect = canvas.getBoundingClientRect();
    const parentRect = overlay.parentElement.getBoundingClientRect();
    const scaleX = rect.width / (canvas.width || 1);
    const scaleY = rect.height / (canvas.height || 1);

    const dx = Math.abs(gameLayer.Pb(1) - gameLayer.Pb(0)) || 57;
    const leftX = gameLayer.Pb(0) - dx * 0.44;
    const rightX = gameLayer.Pb(8) + dx * 0.44;

    overlay.innerHTML = "";
    for (let r = 0; r < 10; r++) {
      const cocosY = gameLayer.Qb(r);
      const domY =
        (canvas.height - cocosY) * scaleY + (rect.top - parentRect.top);
      const domLeftX = leftX * scaleX + (rect.left - parentRect.left);
      const domRightX = rightX * scaleX + (rect.left - parentRect.left);
      const numText = (r + 1).toString();

      const spanL = document.createElement("span");
      spanL.className = "ziga-board-row-num";
      spanL.textContent = numText;
      spanL.style.position = "absolute";
      spanL.style.left = domLeftX + "px";
      spanL.style.top = domY + "px";
      spanL.style.transform = "translate(-50%, -50%)";
      overlay.appendChild(spanL);

      const spanR = document.createElement("span");
      spanR.className = "ziga-board-row-num";
      spanR.textContent = numText;
      spanR.style.position = "absolute";
      spanR.style.left = domRightX + "px";
      spanR.style.top = domY + "px";
      spanR.style.transform = "translate(-50%, -50%)";
      overlay.appendChild(spanR);
    }
  }

  function updateRowLabelsVisibility(gameLayer) {
    const show = !!ZigaMod.userSettings.showRowNumbers;
    if (gameLayer && gameLayer.__zigaRowLabels) {
      for (let i = 0; i < gameLayer.__zigaRowLabels.length; i++) {
        const lbl = gameLayer.__zigaRowLabels[i];
        if (lbl && typeof lbl.setVisible === "function") {
          lbl.setVisible(show);
        }
      }
    }
    const domOverlay = document.getElementById("ziga-dom-row-numbers");
    if (domOverlay) {
      domOverlay.style.display = show ? "block" : "none";
    }
  }

  // Export to namespace
  ZigaMod.generateBoardMatrix = generateBoardMatrix;
  ZigaMod.getPieceHelper = getPieceHelper;
  ZigaMod.isMovePatternValid = isMovePatternValid;
  ZigaMod.isKingFacingKing = isKingFacingKing;
  ZigaMod.isKingCheckedAfterMove = isKingCheckedAfterMove;
  ZigaMod.findPieceAt = findPieceAt;
  ZigaMod.isDestValid = isDestValid;
  ZigaMod.enhancePieceSprite = enhancePieceSprite;
  ZigaMod.hookGameLayer = hookGameLayer;
  ZigaMod.setupRowNumbers = setupRowNumbers;
  ZigaMod.updateRowLabelsVisibility = updateRowLabelsVisibility;
})((window.ZigaMod = window.ZigaMod || {}));
