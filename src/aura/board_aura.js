// src/aura/board_aura.js - 100% In-Engine Cocos2d Live Glowing Aura Rings
// Supports Dynamic Color Themes, Custom HEX Pickers, 22 Built-in HD Presets & Custom Image Uploads
(function (ZigaMod) {
  'use strict';

  const textureCache = {};
  const decodedImageCache = {};

  /**
   * Helper to convert HEX color to RGBA string
   * @param {string} hex - e.g. '#39ff14'
   * @param {number} alpha - 0.0 to 1.0
   * @returns {string}
   */
  function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== 'string') return `rgba(57, 255, 20, ${alpha})`;
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return `rgba(57, 255, 20, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Resolves the active base64 image data for 'green' (my) or 'red' (opp).
   * Checks both presetMy/presetOpp (from ZigaMod.PRESET_AURAS) and customImageMy/customImageOpp.
   * @param {string} colorType - 'green' or 'red'
   * @returns {string}
   */
  function getResolvedCustomImageData(colorType) {
    const custom = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {};
    if (ZigaMod.resolveAuraImageData) {
      return ZigaMod.resolveAuraImageData(custom, colorType === 'green' ? 'my' : 'opp');
    }
    const isMy = (colorType === 'green');
    const presetId = isMy ? custom.presetMy : custom.presetOpp;
    if (presetId && Array.isArray(ZigaMod.PRESET_AURAS)) {
      const found = ZigaMod.PRESET_AURAS.find(p => p.id === presetId);
      if (found && found.base64) return found.base64;
    }
    const direct = isMy ? custom.customImageMy : custom.customImageOpp;
    return (direct && typeof direct === 'string' && direct.startsWith('data:image')) ? direct : '';
  }

  /**
   * Pre-decodes an image dataURL into decodedImageCache so subsequent canvas draws are 100% synchronous.
   * @param {string} dataUrl
   * @param {Function} [onReady]
   * @returns {HTMLImageElement|null}
   */
  function ensureDecodedImage(dataUrl, onReady) {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return null;

    let img = decodedImageCache[dataUrl];
    if (img) {
      if (img.complete && img.naturalWidth > 0) {
        if (onReady) onReady(img);
      } else if (onReady) {
        img.addEventListener('load', function onImgLoad() {
          img.removeEventListener('load', onImgLoad);
          onReady(img);
        });
      }
      return img;
    }

    img = new Image();
    img.crossOrigin = 'anonymous';
    decodedImageCache[dataUrl] = img;

    img.addEventListener('load', function onFirstLoad() {
      img.removeEventListener('load', onFirstLoad);
      if (onReady) onReady(img);
    });

    img.src = dataUrl;
    return img;
  }

  /**
   * Pre-warms decodedImageCache for active user settings and built-in presets.
   */
  function preloadActiveAndPresetImages() {
    try {
      const myImg = getResolvedCustomImageData('green');
      const oppImg = getResolvedCustomImageData('red');
      if (myImg) ensureDecodedImage(myImg, () => reloadAuraTextures());
      if (oppImg) ensureDecodedImage(oppImg, () => reloadAuraTextures());

      // Pre-decode all presets in background batches so 1-click switching is instantaneous
      const presets = ZigaMod.PRESET_AURAS || [];
      presets.forEach((p, idx) => {
        if (p && p.base64) {
          setTimeout(() => {
            ensureDecodedImage(p.base64);
          }, idx * 25);
        }
      });
    } catch (e) {}
  }

  /**
   * Generates an offscreen 256x256 HiDPI canvas with a circular neon glowing aura.
   * Inside of circle is 100% transparent so Chinese characters on wooden pieces remain crystal clear.
   * Includes 8 glowing energy nodes & segmented outer arcs so spin animations look vivid and dynamic.
   * @param {string} colorType - 'green' (my turn) or 'red' (opp turn)
   * @param {string} [overrideHex] - Optional override HEX color
   * @param {HTMLCanvasElement} [targetCanvas] - Optional existing canvas to draw into
   * @returns {HTMLCanvasElement}
   */
  function createAuraCanvas(colorType, overrideHex, targetCanvas) {
    const size = 256;
    const canvas = targetCanvas || document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const radius = 94; // Inner hollow diameter ~188px (73.4% of 256px)

    ctx.clearRect(0, 0, size, size);

    const custom = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {};
    let mainColor = overrideHex;
    if (!mainColor) {
      mainColor = (colorType === 'green') ? (custom.myColor || '#39ff14') : (custom.oppColor || '#ff1744');
    }

    const outerGlow = hexToRgba(mainColor, 0.45);
    const midGlow = hexToRgba(mainColor, 0.82);
    const softGlow = hexToRgba(mainColor, 0.25);

    ctx.save();

    // 1. Deep Atmospheric Outer Bloom
    ctx.beginPath();
    ctx.arc(center, center, radius + 3, 0, Math.PI * 2);
    ctx.lineWidth = 16;
    ctx.strokeStyle = softGlow;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 24;
    ctx.stroke();

    // 2. Segmented Outer Energy Arcs (8 tactical sectors so rotation is visibly dynamic)
    const outerArcRadius = radius + 11;
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = midGlow;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 10;
    for (let i = 0; i < 8; i++) {
      const startAngle = (i * Math.PI) / 4 + 0.08;
      const endAngle = ((i + 1) * Math.PI) / 4 - 0.08;
      ctx.beginPath();
      ctx.arc(center, center, outerArcRadius, startAngle, endAngle);
      ctx.stroke();
    }

    // 3. Secondary Mid Bloom
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 9;
    ctx.strokeStyle = outerGlow;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 16;
    ctx.stroke();

    // 4. Main Ultra-Bright Neon Ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = mainColor;
    ctx.shadowColor = midGlow;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // 5. Inner White-Hot Core Highlight
    ctx.beginPath();
    ctx.arc(center, center, radius - 1.5, 0, Math.PI * 2);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 0;
    ctx.stroke();

    // 6. 8 Cardinal Energy Nodes (Glowing Pearls along the ring)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const nx = center + Math.cos(angle) * (radius + 4);
      const ny = center + Math.sin(angle) * (radius + 4);
      const nodeRadius = (i % 2 === 0) ? 5.2 : 3.6;

      ctx.beginPath();
      ctx.arc(nx, ny, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 12;
      ctx.fill();
    }

    ctx.restore();
    return canvas;
  }

  /**
   * Creates a 256x256 HTMLCanvasElement backed by the custom/preset PNG image.
   * Always returns a valid 256x256 canvas synchronously so Cocos2d Texture2D never gets 0x0 size!
   * If the image is still decoding asynchronously, draws it and refreshes textures the instant it loads.
   * @param {string} colorType - 'green' or 'red'
   * @param {string} customImgData - base64 dataURL
   * @returns {HTMLCanvasElement}
   */
  function createImageAuraCanvas(colorType, customImgData) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = ensureDecodedImage(customImgData, (loadedImg) => {
      try {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(loadedImg, 0, 0, size, size);
        const cachedTex = textureCache[colorType];
        if (cachedTex && typeof cachedTex.handleLoadedTexture === 'function') {
          cachedTex.handleLoadedTexture();
        }
        // Re-attach to pieces if this finished loading asynchronously after initial attach
        if (canvas.__zigaNeedsAsyncRefresh) {
          canvas.__zigaNeedsAsyncRefresh = false;
          reloadAuraTextures();
        }
      } catch (e) {
        console.warn('[AN Mod] Async aura image draw failed:', e);
      }
    });

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    } else {
      // Draw temporary neon ring while PNG finishes 1-2ms async decode, then auto-refresh
      canvas.__zigaNeedsAsyncRefresh = true;
      createAuraCanvas(colorType, null, canvas);
    }

    return canvas;
  }

  /**
   * Retrieves or creates a Cocos2d Texture2D from the 256x256 aura canvas (both Image and Neon modes).
   * @param {string} colorType - 'green' or 'red'
   * @returns {cc.Texture2D|HTMLCanvasElement}
   */
  function getAuraTexture(colorType) {
    if (textureCache[colorType]) return textureCache[colorType];

    const custom = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {};
    const isImageMode = (custom.mode === 'image');
    const customImgData = getResolvedCustomImageData(colorType);

    const canvas = (isImageMode && customImgData)
      ? createImageAuraCanvas(colorType, customImgData)
      : createAuraCanvas(colorType);

    if (window.cc && cc.Texture2D) {
      try {
        const tex = new cc.Texture2D();
        if (typeof tex.initWithElement === 'function') {
          tex.initWithElement(canvas);
          if (typeof tex.handleLoadedTexture === 'function') {
            tex.handleLoadedTexture();
          }
          textureCache[colorType] = tex;
          return tex;
        }
      } catch (err) {
        console.warn('[AN Mod] Texture2D.initWithElement failed:', err);
      }
    }

    textureCache[colorType] = canvas;
    return canvas;
  }

  /**
   * Creates a Cocos2d Sprite from the aura texture and guarantees a valid 256x256 texture rect.
   * @param {string} colorType
   * @returns {cc.Sprite|null}
   */
  function createAuraSprite(colorType) {
    const tex = getAuraTexture(colorType);
    if (!window.cc) return null;

    try {
      let spr = null;
      if (typeof cc.Sprite === 'function') {
        spr = new cc.Sprite(tex);
      } else if (cc.Sprite && typeof cc.Sprite.create === 'function') {
        spr = cc.Sprite.create(tex);
      }
      if (spr) {
        const sz = spr.getContentSize ? spr.getContentSize() : null;
        if ((!sz || !sz.width || sz.width <= 0) && spr.setTextureRect && cc.rect) {
          spr.setTextureRect(cc.rect(0, 0, 256, 256));
        }
      }
      return spr;
    } catch (e) {
      console.warn('[AN Mod] cc.Sprite creation failed:', e);
    }
    return null;
  }

  /**
   * Applies selected animation effect to an aura sprite using native Cocos2d Actions.
   * Supports: 'spin_pulse', 'spin', 'pulse', 'heartbeat', 'static'.
   * @param {cc.Sprite} sprite
   * @param {number} baseScale
   */
  function applyAuraAnimation(sprite, baseScale) {
    if (!sprite || !window.cc) return;

    try {
      sprite.stopAllActions();
      sprite.setRotation(0);
      sprite.setScale(baseScale);
      sprite.setOpacity(235);

      const custom = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {};
      const animType = custom.animation || 'spin_pulse';
      const speed = Math.max(1.0, Math.min(8.0, Number(custom.spinSpeed) || 3.5));

      if (animType === 'static') {
        sprite.setOpacity(245);
        return;
      }

      if (animType === 'spin') {
        const spinAction = cc.rotateBy(speed, 360).repeatForever();
        sprite.runAction(spinAction);
        return;
      }

      if (animType === 'pulse') {
        const scaleUp = cc.scaleTo(0.75, baseScale * 1.08);
        const scaleDown = cc.scaleTo(0.75, baseScale * 0.95);
        const fadeOut = cc.fadeTo(0.75, 135);
        const fadeIn = cc.fadeTo(0.75, 255);

        const pulseAction = cc.sequence(
          cc.spawn(scaleUp, fadeIn),
          cc.spawn(scaleDown, fadeOut)
        ).repeatForever();
        sprite.runAction(pulseAction);
        return;
      }

      if (animType === 'heartbeat') {
        const beat1Up = cc.spawn(cc.scaleTo(0.12, baseScale * 1.15), cc.fadeTo(0.12, 255));
        const beat1Dn = cc.spawn(cc.scaleTo(0.12, baseScale * 0.98), cc.fadeTo(0.12, 185));
        const beat2Up = cc.spawn(cc.scaleTo(0.15, baseScale * 1.22), cc.fadeTo(0.15, 255));
        const beat2Dn = cc.spawn(cc.scaleTo(0.2, baseScale), cc.fadeTo(0.2, 165));
        const wait = cc.delayTime(0.7);

        const heartbeat = cc.sequence(beat1Up, beat1Dn, beat2Up, beat2Dn, wait).repeatForever();
        sprite.runAction(heartbeat);
        return;
      }

      // Default: 'spin_pulse' (360° continuous rotation + breathing pulse)
      const spinAction = cc.rotateBy(speed, 360).repeatForever();

      const scaleUp = cc.scaleTo(0.8, baseScale * 1.07);
      const scaleDown = cc.scaleTo(0.8, baseScale * 0.96);
      const fadeOut = cc.fadeTo(0.8, 155);
      const fadeIn = cc.fadeTo(0.8, 255);

      const pulseAction = cc.sequence(
        cc.spawn(scaleUp, fadeIn),
        cc.spawn(scaleDown, fadeOut)
      ).repeatForever();

      sprite.runAction(spinAction);
      sprite.runAction(pulseAction);
    } catch (e) {
      console.warn('[AN Mod] Failed to apply aura animation:', e);
    }
  }

  /**
   * Calculates dynamic base scale for an aura sprite to wrap snugly around a chess piece.
   * Both 256px Neon Canvas and 256px Preset PNGs have an inner hollow diameter ~0.72 * sprW.
   * @param {cc.Sprite} sprite
   * @param {number} pieceWidth
   * @param {string} colorType - 'green' or 'red'
   * @returns {number}
   */
  function calculateAuraBaseScale(sprite, pieceWidth, colorType) {
    const custom = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {};
    const userScaleFactor = (typeof custom.scale === 'number' && custom.scale > 0) ? custom.scale : 1.0;

    let sprW = 256;
    if (sprite && sprite.getContentSize) {
      const sz = sprite.getContentSize();
      if (sz && sz.width > 0) sprW = sz.width;
    }

    // Inner hollow ring diameter in 256x256 texture is ~0.72 * sprW (~184px)
    const ringDiameterInTex = sprW * 0.72;

    // Desired inner ring diameter on piece: 0.98x piece width so inner edge hugs the wooden rim
    // while ornate blades/runes radiate cleanly outside the piece
    const targetRingDiameter = pieceWidth * 0.98 * userScaleFactor;

    return targetRingDiameter / ringDiameterInTex;
  }

  /**
   * Attaches Green and Red aura child sprites directly to a Cocos2d piece sprite.
   * Because they are children of the piece, their coordinates are 100% pixel-perfect.
   * @param {cc.Sprite} piece
   */
  function attachAuraToPiece(piece) {
    if (!piece) return;

    if (piece.__zigaAuraGreen) {
      try { piece.__zigaAuraGreen.removeFromParent(true); } catch (e) {}
      piece.__zigaAuraGreen = null;
    }
    if (piece.__zigaAuraRed) {
      try { piece.__zigaAuraRed.removeFromParent(true); } catch (e) {}
      piece.__zigaAuraRed = null;
    }

    try {
      const size = piece.getContentSize ? piece.getContentSize() : { width: 55, height: 55 };
      const w = (size && size.width > 0) ? size.width : 55;
      const h = (size && size.height > 0) ? size.height : 55;
      const cx = w / 2;
      const cy = h / 2;

      piece.__zigaAuraAttached = true;
      piece.__zigaAuraPieceW = (size && size.width > 0) ? size.width : 0;

      // 1. Green Aura Sprite (My Turn / Capture Target)
      const greenSprite = createAuraSprite('green');
      if (greenSprite) {
        greenSprite.setPosition(cx, cy);
        if (greenSprite.setAnchorPoint) greenSprite.setAnchorPoint(0.5, 0.5);
        greenSprite.setVisible(false);
        const greenBaseScale = calculateAuraBaseScale(greenSprite, w, 'green');
        applyAuraAnimation(greenSprite, greenBaseScale);
        piece.addChild(greenSprite, 10);
        piece.__zigaAuraGreen = greenSprite;
      }

      // 2. Red Aura Sprite (Opponent Turn / Threatened Piece)
      const redSprite = createAuraSprite('red');
      if (redSprite) {
        redSprite.setPosition(cx, cy);
        if (redSprite.setAnchorPoint) redSprite.setAnchorPoint(0.5, 0.5);
        redSprite.setVisible(false);
        const redBaseScale = calculateAuraBaseScale(redSprite, w, 'red');
        applyAuraAnimation(redSprite, redBaseScale);
        piece.addChild(redSprite, 10);
        piece.__zigaAuraRed = redSprite;
      }
    } catch (err) {
      console.warn('[AN Mod] attachAuraToPiece failed:', err);
    }
  }

  /**
   * Reloads all aura textures and updates existing piece sprites in real-time.
   * Immediately invokes updateBoardAura so changes appear on the board in the exact same frame!
   */
  function reloadAuraTextures() {
    delete textureCache['green'];
    delete textureCache['red'];

    const gameLayer = ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null;
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return;

    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p) {
        p.__zigaAuraAttached = false;
        attachAuraToPiece(p);
      }
    }

    if (ZigaMod.getActiveGameData) {
      const activeData = ZigaMod.getActiveGameData();
      if (activeData) {
        updateBoardAura(activeData);
      }
    }
  }

  /**
   * Piece values in Xiangqi for tactical exchange evaluation
   */
  function getPieceValue(type, row, baseRow) {
    switch (type) {
      case 0: return 1000; // Tướng (King)
      case 3: return 9.0;  // Xe (Chariot)
      case 4: return 4.5;  // Pháo (Cannon)
      case 5: return 4.0;  // Mã (Horse)
      case 1: return 2.0;  // Sĩ (Advisor)
      case 2: return 2.0;  // Tượng (Elephant)
      case 6: {
        // Tốt (Pawn): 1.5 before river, 2.5 after river
        const isCrossed = (baseRow <= 2) ? (row >= 5) : (row <= 4);
        return isCrossed ? 2.5 : 1.5;
      }
      default: return 1.5;
    }
  }

  /**
   * Check if a piece can legally attack/strike a target square (targetCol, targetRow).
   * Works for both attacks (enemy square) and defense checks (friendly square).
   */
  function canPieceAttackSquare(piece, targetCol, targetRow, grid) {
    const c = piece.col;
    const r = piece.row;
    const type = piece.type;
    const baseRow = piece.baseRow;

    if (c === targetCol && r === targetRow) return false;
    if (targetCol < 0 || targetCol > 8 || targetRow < 0 || targetRow > 9) return false;

    // 0: Tướng (King) - 1 step orthogonal in Palace, or Flying General
    if (type === 0) {
      const minR = (baseRow <= 2) ? 0 : 7;
      const maxR = (baseRow <= 2) ? 2 : 9;
      if (targetCol >= 3 && targetCol <= 5 && targetRow >= minR && targetRow <= maxR) {
        if (Math.abs(c - targetCol) + Math.abs(r - targetRow) === 1) return true;
      }
      if (c === targetCol) {
        const targetPiece = grid[targetCol][targetRow];
        if (targetPiece && targetPiece.type === 0 && targetPiece.color !== piece.color) {
          const step = (targetRow > r) ? 1 : -1;
          let blocked = false;
          for (let y = r + step; y !== targetRow; y += step) {
            if (grid[c][y]) { blocked = true; break; }
          }
          if (!blocked) return true;
        }
      }
      return false;
    }

    // 1: Sĩ (Advisor) - 1 step diagonal in Palace
    if (type === 1) {
      const minR = (baseRow <= 2) ? 0 : 7;
      const maxR = (baseRow <= 2) ? 2 : 9;
      if (targetCol >= 3 && targetCol <= 5 && targetRow >= minR && targetRow <= maxR) {
        return Math.abs(c - targetCol) === 1 && Math.abs(r - targetRow) === 1;
      }
      return false;
    }

    // 2: Tượng (Elephant) - 2 steps diagonal, eye not blocked, cannot cross river
    if (type === 2) {
      const riverOk = (baseRow <= 2) ? (targetRow <= 4) : (targetRow >= 5);
      if (!riverOk) return false;
      if (Math.abs(c - targetCol) === 2 && Math.abs(r - targetRow) === 2) {
        const eyeC = (c + targetCol) / 2;
        const eyeR = (r + targetRow) / 2;
        return !grid[eyeC][eyeR];
      }
      return false;
    }

    // 3: Xe (Chariot) - Straight line with 0 obstacles
    if (type === 3) {
      if (c !== targetCol && r !== targetRow) return false;
      const dc = (targetCol === c) ? 0 : (targetCol > c ? 1 : -1);
      const dr = (targetRow === r) ? 0 : (targetRow > r ? 1 : -1);
      let curC = c + dc;
      let curR = r + dr;
      while (curC !== targetCol || curR !== targetRow) {
        if (grid[curC][curR]) return false;
        curC += dc;
        curR += dr;
      }
      return true;
    }

    // 4: Pháo (Cannon) - Straight line with EXACTLY 1 obstacle (screen / ngòi)
    if (type === 4) {
      if (c !== targetCol && r !== targetRow) return false;
      const dc = (targetCol === c) ? 0 : (targetCol > c ? 1 : -1);
      const dr = (targetRow === r) ? 0 : (targetRow > r ? 1 : -1);
      let curC = c + dc;
      let curR = r + dr;
      let screens = 0;
      while (curC !== targetCol || curR !== targetRow) {
        if (grid[curC][curR]) screens++;
        curC += dc;
        curR += dr;
      }
      return screens === 1;
    }

    // 5: Mã (Horse) - L-step, leg not blocked
    if (type === 5) {
      const dc = targetCol - c;
      const dr = targetRow - r;
      if (Math.abs(dc) === 1 && Math.abs(dr) === 2) {
        const legR = r + (dr > 0 ? 1 : -1);
        return !grid[c][legR];
      }
      if (Math.abs(dc) === 2 && Math.abs(dr) === 1) {
        const legC = c + (dc > 0 ? 1 : -1);
        return !grid[legC][r];
      }
      return false;
    }

    // 6: Tốt (Pawn) - 1 step forward, sideways after river
    if (type === 6) {
      const forward = (baseRow <= 2) ? 1 : -1;
      const isCrossed = (baseRow <= 2) ? (r >= 5) : (r <= 4);

      if (targetCol === c && targetRow === r + forward) return true;
      if (isCrossed && targetRow === r && Math.abs(targetCol - c) === 1) return true;

      return false;
    }

    return false;
  }

  /**
   * Analyzes active board state and determines:
   * - greenTargets: Opponent pieces player can capture safely (un-defended or profitable trade).
   * - redTargets: Player pieces that opponent can capture profitably / hanging.
   */
  function analyzeBoardAuras(gameLayer, myColor, oppColor) {
    const greenTargets = new Set();
    const redTargets = new Set();

    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) {
      return { greenTargets, redTargets };
    }

    const pieces = [];
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p && !p.pa && p.fa >= 0 && p.fa <= 8 && p.rowIndex >= 0 && p.rowIndex <= 9) {
        pieces.push({
          index: i,
          col: p.fa,
          row: p.rowIndex,
          type: (p.Ga !== undefined) ? p.Ga : 6,
          color: (p.ka !== undefined) ? p.ka : Math.floor(i / 16),
          sprite: p
        });
      }
    }

    if (pieces.length === 0) return { greenTargets, redTargets };

    let redBaseRow = 0;
    let blackBaseRow = 9;
    const redKing = pieces.find(p => p.type === 0 && p.color === 0);
    const blackKing = pieces.find(p => p.type === 0 && p.color === 1);
    if (redKing) redBaseRow = (redKing.row <= 2) ? 0 : 9;
    if (blackKing) blackBaseRow = (blackKing.row <= 2) ? 0 : 9;

    pieces.forEach(p => {
      p.baseRow = (p.color === 0) ? redBaseRow : blackBaseRow;
    });

    const grid = Array.from({ length: 9 }, () => Array(10).fill(null));
    pieces.forEach(p => {
      grid[p.col][p.row] = p;
    });

    const myPieces = pieces.filter(p => p.color === myColor);
    const oppPieces = pieces.filter(p => p.color === oppColor);

    // Evaluate GREEN AURAS (Opportunities: opponent pieces player can capture safely)
    oppPieces.forEach(target => {
      const myAttackers = myPieces.filter(a => canPieceAttackSquare(a, target.col, target.row, grid));
      if (myAttackers.length === 0) return;

      const oppDefenders = oppPieces.filter(d => d.index !== target.index && canPieceAttackSquare(d, target.col, target.row, grid));
      const targetVal = getPieceValue(target.type, target.row, target.baseRow);

      let canCaptureSafely = false;
      if (oppDefenders.length === 0) {
        canCaptureSafely = true;
      } else {
        canCaptureSafely = myAttackers.some(a => {
          const atkVal = getPieceValue(a.type, a.row, a.baseRow);
          return (targetVal - atkVal >= 1.5);
        });
      }

      if (canCaptureSafely) {
        greenTargets.add(target.index);
      }
    });

    // Evaluate RED AURAS (Threats: player pieces that opponent can capture profitably / hanging)
    myPieces.forEach(myTarget => {
      const oppAttackers = oppPieces.filter(e => canPieceAttackSquare(e, myTarget.col, myTarget.row, grid));
      if (oppAttackers.length === 0) return;

      const myDefenders = myPieces.filter(d => d.index !== myTarget.index && canPieceAttackSquare(d, myTarget.col, myTarget.row, grid));
      const targetVal = getPieceValue(myTarget.type, myTarget.row, myTarget.baseRow);

      let isUnderRealDanger = false;
      if (myDefenders.length === 0) {
        isUnderRealDanger = true;
      } else {
        isUnderRealDanger = oppAttackers.some(e => {
          const oppVal = getPieceValue(e.type, e.row, e.baseRow);
          return (targetVal - oppVal >= 1.5);
        });
      }

      if (isUnderRealDanger) {
        redTargets.add(myTarget.index);
      }
    });

    return { greenTargets, redTargets };
  }

  function removeOldDomAuraLayer() {
    const old = document.getElementById('ziga-board-aura-layer');
    if (old && old.parentElement) {
      old.parentElement.removeChild(old);
    }
  }

  function clearBoardAura(gameLayer) {
    removeOldDomAuraLayer();

    const gl = gameLayer || (ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null);
    if (!gl || !gl.V || !Array.isArray(gl.V)) return;

    for (let i = 0; i < 32; i++) {
      const p = gl.V[i];
      if (p) {
        if (p.__zigaAuraGreen) p.__zigaAuraGreen.setVisible(false);
        if (p.__zigaAuraRed) p.__zigaAuraRed.setVisible(false);
      }
    }
  }

  /**
   * Main function called by game update loop.
   * Accurately displays Green (Free Capture) and Red (Hanging Threat) auras simultaneously.
   */
  function updateBoardAura(data) {
    if (!ZigaMod.userSettings || !ZigaMod.userSettings.liveBoardAura) {
      clearBoardAura(data ? data.gameLayer : null);
      return;
    }

    if (!data || !data.gameLayer || !data.gameLayer.V || !Array.isArray(data.gameLayer.V)) {
      clearBoardAura(null);
      return;
    }

    const gameLayer = data.gameLayer;
    removeOldDomAuraLayer();

    const isPlaying = (gameLayer.T && typeof gameLayer.T === 'function')
      ? (gameLayer.T().Fb === 2)
      : (gameLayer.Yc !== undefined && gameLayer.Yc >= 0);

    if (!isPlaying) {
      clearBoardAura(gameLayer);
      return;
    }

    // Ensure aura sprites are attached & valid on all 32 piece sprites
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p) continue;

      const curW = (p.getContentSize && p.getContentSize().width) || 0;
      const greenDetached = !p.__zigaAuraGreen || (typeof p.__zigaAuraGreen.getParent === 'function' && p.__zigaAuraGreen.getParent() !== p);
      const redDetached = !p.__zigaAuraRed || (typeof p.__zigaAuraRed.getParent === 'function' && p.__zigaAuraRed.getParent() !== p);
      const sizeChanged = (curW > 0 && p.__zigaAuraPieceW !== curW);

      if (!p.__zigaAuraAttached || greenDetached || redDetached || sizeChanged) {
        attachAuraToPiece(p);
      }
    }

    // Hide all auras first so no stale aura ever lingers
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p) {
        if (p.__zigaAuraGreen) p.__zigaAuraGreen.setVisible(false);
        if (p.__zigaAuraRed) p.__zigaAuraRed.setVisible(false);
      }
    }

    const { greenTargets, redTargets } = analyzeBoardAuras(gameLayer, data.myColor, data.oppColor);

    greenTargets.forEach(idx => {
      const piece = gameLayer.V[idx];
      if (piece && !piece.pa && piece.__zigaAuraGreen) {
        piece.__zigaAuraGreen.setVisible(true);
      }
    });

    redTargets.forEach(idx => {
      const piece = gameLayer.V[idx];
      if (piece && !piece.pa && piece.__zigaAuraRed) {
        piece.__zigaAuraRed.setVisible(true);
      }
    });
  }

  // Preload active and preset images on module init
  setTimeout(preloadActiveAndPresetImages, 50);

  // Export to namespace
  ZigaMod.createAuraCanvas = createAuraCanvas;
  ZigaMod.hexToRgba = hexToRgba;
  ZigaMod.canPieceAttackSquare = canPieceAttackSquare;
  ZigaMod.analyzeBoardAuras = analyzeBoardAuras;
  ZigaMod.updateBoardAura = updateBoardAura;
  ZigaMod.clearBoardAura = clearBoardAura;
  ZigaMod.reloadAuraTextures = reloadAuraTextures;
  ZigaMod.applyAuraAnimation = applyAuraAnimation;
  ZigaMod.ensureDecodedImage = ensureDecodedImage;

})(window.ZigaMod = window.ZigaMod || {});
