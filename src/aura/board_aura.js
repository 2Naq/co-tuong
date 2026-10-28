// src/board_aura.js - 100% In-Engine Cocos2d Live Glowing Aura Rings
// Supports Dynamic Color Themes, Custom HEX Pickers, and Custom Image Uploads
(function (ZigaMod) {
  'use strict';

  const textureCache = {};

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
   * Generates an offscreen canvas with a circular neon glowing aura.
   * Inside of circle is 100% transparent so Chinese characters on wooden pieces remain crystal clear.
   * @param {string} colorType - 'green' (my turn) or 'red' (opp turn)
   * @param {string} overrideHex - Optional override HEX color
   * @returns {HTMLCanvasElement}
   */
  function createAuraCanvas(colorType, overrideHex) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const radius = size * 0.42;

    ctx.clearRect(0, 0, size, size);

    // Get color from user settings or fallback
    const custom = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {};
    let mainColor = overrideHex;
    if (!mainColor) {
      mainColor = (colorType === 'green') ? (custom.myColor || '#39ff14') : (custom.oppColor || '#ff1744');
    }

    const outerGlow = hexToRgba(mainColor, 0.42);
    const midGlow = hexToRgba(mainColor, 0.7);

    // 1. Outer Bloom
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = outerGlow;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 16;
    ctx.stroke();

    // 2. Main Neon Border
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = mainColor;
    ctx.shadowColor = midGlow;
    ctx.shadowBlur = 8;
    ctx.stroke();

    // 3. Inner Bright Core Highlight
    ctx.beginPath();
    ctx.arc(center, center, radius - 1.5, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = 0;
    ctx.stroke();

    return canvas;
  }

  /**
   * Retrieves or creates a Cocos2d Texture2D from the aura canvas or custom image.
   * @param {string} colorType - 'green' or 'red'
   * @returns {cc.Texture2D|HTMLCanvasElement|Image}
   */
  function getAuraTexture(colorType) {
    if (textureCache[colorType]) return textureCache[colorType];

    const custom = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {};
    const isImageMode = (custom.mode === 'image');
    const customImgData = (colorType === 'green') ? custom.customImageMy : custom.customImageOpp;

    // 1. If Image Mode with custom base64 image data
    if (isImageMode && customImgData && customImgData.startsWith('data:image')) {
      try {
        const img = new Image();
        img.src = customImgData;
        if (window.cc && cc.Texture2D) {
          const tex = new cc.Texture2D();
          if (typeof tex.initWithElement === 'function') {
            tex.initWithElement(img);
            if (typeof tex.handleLoadedTexture === 'function') {
              tex.handleLoadedTexture();
            }
            textureCache[colorType] = tex;
            return tex;
          }
        }
        textureCache[colorType] = img;
        return img;
      } catch (e) {
        console.warn('[AN Mod] Failed to load custom image texture, falling back to neon canvas:', e);
      }
    }

    // 2. Neon Canvas Mode
    const canvas = createAuraCanvas(colorType);

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
   * Creates a Cocos2d Sprite from the aura texture.
   * @param {string} colorType
   * @returns {cc.Sprite|null}
   */
  function createAuraSprite(colorType) {
    const tex = getAuraTexture(colorType);
    if (!window.cc) return null;

    try {
      if (typeof cc.Sprite === 'function') {
        return new cc.Sprite(tex);
      } else if (cc.Sprite && typeof cc.Sprite.create === 'function') {
        return cc.Sprite.create(tex);
      }
    } catch (e) {
      console.warn('[AN Mod] cc.Sprite creation failed:', e);
    }
    return null;
  }

  /**
   * Starts a smooth pulse animation on an aura sprite.
   * @param {cc.Sprite} sprite
   * @param {number} baseScale
   */
  function startAuraPulse(sprite, baseScale) {
    if (!sprite || !window.cc) return;

    try {
      sprite.stopAllActions();
      sprite.setScale(baseScale);

      const scaleUp = cc.scaleTo(0.7, baseScale * 1.08);
      const scaleDown = cc.scaleTo(0.7, baseScale * 0.96);
      const fadeOut = cc.fadeTo(0.7, 100);
      const fadeIn = cc.fadeTo(0.7, 255);

      const pulseAction = cc.sequence(
        cc.spawn(scaleUp, fadeIn),
        cc.spawn(scaleDown, fadeOut)
      ).repeatForever();

      sprite.runAction(pulseAction);
    } catch (e) {
      console.warn('[AN Mod] Failed to start pulse action:', e);
    }
  }

  /**
   * Calculates dynamic base scale for an aura sprite to wrap snugly around a chess piece.
   * Automatically adapts to any texture size (128px canvas, 256px preset PNG, or custom uploads).
   * @param {cc.Sprite} sprite
   * @param {number} pieceWidth
   * @param {string} colorType - 'green' or 'red'
   * @returns {number}
   */
  function calculateAuraBaseScale(sprite, pieceWidth, colorType) {
    const custom = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {};
    const userScaleFactor = (typeof custom.scale === 'number' && custom.scale > 0) ? custom.scale : 1.0;

    let sprW = 0;
    if (sprite && sprite.getContentSize) {
      const sz = sprite.getContentSize();
      if (sz && sz.width > 0) sprW = sz.width;
    }

    if (!sprW || sprW <= 0) {
      const isImg = (custom.mode === 'image');
      const imgData = (colorType === 'green') ? custom.customImageMy : custom.customImageOpp;
      sprW = (isImg && imgData) ? 256 : 128;
    }

    // In both Neon Canvas (128px) and Preset PNGs (256px), the ring has radius 0.42 (diameter 0.84 * sprW)
    const ringDiameterInTex = sprW * 0.84;

    // Desired ring diameter on piece: 1.04x piece width so it hugs just outside the wooden rim
    const targetRingDiameter = pieceWidth * 1.04 * userScaleFactor;

    return targetRingDiameter / ringDiameterInTex;
  }

  /**
   * Attaches Green and Red aura child sprites directly to a Cocos2d piece sprite.
   * Because they are children of the piece, their coordinates are 100% pixel-perfect.
   * @param {cc.Sprite} piece
   */
  function attachAuraToPiece(piece) {
    if (!piece) return;

    // If already attached, remove previous sprites first to allow clean texture reload
    if (piece.__zigaAuraGreen) {
      try { piece.__zigaAuraGreen.removeFromParent(true); } catch (e) {}
      piece.__zigaAuraGreen = null;
    }
    if (piece.__zigaAuraRed) {
      try { piece.__zigaAuraRed.removeFromParent(true); } catch (e) {}
      piece.__zigaAuraRed = null;
    }

    piece.__zigaAuraAttached = true;

    try {
      const size = piece.getContentSize ? piece.getContentSize() : { width: 55, height: 55 };
      const w = size.width || 55;
      const h = size.height || 55;
      const cx = w / 2;
      const cy = h / 2;

      // 1. Green Aura Sprite (My Turn)
      const greenSprite = createAuraSprite('green');
      if (greenSprite) {
        greenSprite.setPosition(cx, cy);
        if (greenSprite.setAnchorPoint) greenSprite.setAnchorPoint(0.5, 0.5);
        greenSprite.setVisible(false);
        const greenBaseScale = calculateAuraBaseScale(greenSprite, w, 'green');
        startAuraPulse(greenSprite, greenBaseScale);
        piece.addChild(greenSprite, 10);
        piece.__zigaAuraGreen = greenSprite;
      }

      // 2. Red Aura Sprite (Opponent Turn)
      const redSprite = createAuraSprite('red');
      if (redSprite) {
        redSprite.setPosition(cx, cy);
        if (redSprite.setAnchorPoint) redSprite.setAnchorPoint(0.5, 0.5);
        redSprite.setVisible(false);
        const redBaseScale = calculateAuraBaseScale(redSprite, w, 'red');
        startAuraPulse(redSprite, redBaseScale);
        piece.addChild(redSprite, 10);
        piece.__zigaAuraRed = redSprite;
      }
    } catch (err) {
      console.warn('[AN Mod] attachAuraToPiece failed:', err);
    }
  }

  /**
   * Reloads all aura textures and updates existing piece sprites in real-time.
   * Called when user saves new color palette, theme, or custom images in the Popup Modal.
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
  }

  /**
   * Scans legal capture moves on the board for the current turn.
   * @param {Object} gameLayer - Active Cocos2d game layer
   * @param {number} attackerColor - Color of the player whose turn it is (0: Red, 1: Black)
   * @param {number} defenderColor - Color of the opposing player (1 - attackerColor)
   * @returns {Object} { targets: Map, attackers: Map, captures: Array }
   */
  function scanBoardCaptures(gameLayer, attackerColor, defenderColor) {
    const targets = new Map();   // targetIdx -> targetPiece
    const attackers = new Map(); // attackerIdx -> atkPiece
    const captures = [];

    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) {
      return { targets, attackers, captures };
    }

    // 1. Build 9x10 grid of piece indices for living pieces
    const grid = Array.from({ length: 9 }, () => Array(10).fill(-1));
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p && !p.pa && p.fa >= 0 && p.fa < 9 && p.rowIndex >= 0 && p.rowIndex < 10) {
        grid[p.fa][p.rowIndex] = i;
      }
    }

    // 2. Identify living defender pieces to check against
    const livingDefenders = [];
    for (let j = 0; j < 32; j++) {
      const p = gameLayer.V[j];
      if (p && !p.pa && p.ka === defenderColor) {
        livingDefenders.push({ piece: p, index: j, col: p.fa, row: p.rowIndex });
      }
    }

    if (livingDefenders.length === 0) {
      return { targets, attackers, captures };
    }

    // 3. Loop through living attacker pieces
    for (let i = 0; i < 32; i++) {
      const atkPiece = gameLayer.V[i];
      if (!atkPiece || atkPiece.pa || atkPiece.ka !== attackerColor) continue;

      const pieceHelper = gameLayer.hq ? gameLayer.hq(i) : null;
      if (!pieceHelper || !gameLayer.IM) continue;

      for (let d = 0; d < livingDefenders.length; d++) {
        const def = livingDefenders[d];
        const targetIdx = def.index;
        const targetPiece = def.piece;
        const col = def.col;
        const row = def.row;
        const sq = row * 9 + col;

        try {
          if (gameLayer.IM(pieceHelper, i, sq, grid)) {
            const isBlocked = (gameLayer.BM && gameLayer.BM(pieceHelper, i, col, row, grid)) ||
                              (gameLayer.DM && gameLayer.DM(0, pieceHelper, i, col, row, grid));

            if (!isBlocked) {
              targets.set(targetIdx, targetPiece);
              attackers.set(i, atkPiece);
              captures.push({ attackerIdx: i, targetIdx: targetIdx });
            }
          }
        } catch (e) {
          // Safeguard
        }
      }
    }

    return { targets, attackers, captures };
  }

  /**
   * Cleans up any deprecated DOM overlay elements.
   */
  function removeOldDomAuraLayer() {
    const old = document.getElementById('ziga-board-aura-layer');
    if (old && old.parentElement) {
      old.parentElement.removeChild(old);
    }
  }

  /**
   * Hides all aura sprites across all 32 pieces.
   * @param {Object} gameLayer
   */
  function clearBoardAura(gameLayer) {
    removeOldDomAuraLayer();

    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return;

    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p) {
        if (p.__zigaAuraGreen) p.__zigaAuraGreen.setVisible(false);
        if (p.__zigaAuraRed) p.__zigaAuraRed.setVisible(false);
      }
    }
  }

  /**
   * Main function called by game update loop.
   * @param {Object} data - Active game data from ZigaMod.getActiveGameData()
   */
  function updateBoardAura(data) {
    // 1. Honor user setting
    if (!ZigaMod.userSettings || !ZigaMod.userSettings.liveBoardAura) {
      clearBoardAura(data ? data.gameLayer : null);
      return;
    }

    if (!data || !data.gameLayer || !data.gameLayer.V || !Array.isArray(data.gameLayer.V)) {
      clearBoardAura(null);
      return;
    }

    const gameLayer = data.gameLayer;

    // Remove legacy DOM overlay if present
    removeOldDomAuraLayer();

    // 2. Check if the match is actively in progress
    const isPlaying = (gameLayer.T && typeof gameLayer.T === 'function')
      ? (gameLayer.T().Fb === 2)
      : (gameLayer.Yc !== undefined && gameLayer.Yc >= 0);

    if (!isPlaying) {
      clearBoardAura(gameLayer);
      return;
    }

    // 3. Ensure aura sprites are attached to all 32 piece sprites
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p && !p.__zigaAuraAttached) {
        attachAuraToPiece(p);
      }
    }

    // 4. Determine whose turn it is
    const currentTurn = gameLayer.Yc; // 0: Red, 1: Black
    if (currentTurn === undefined || currentTurn < 0) {
      clearBoardAura(gameLayer);
      return;
    }

    const myColor = data.myColor;
    const isMyTurn = (currentTurn === myColor);
    const auraColor = isMyTurn ? 'green' : 'red';
    const attackerColor = currentTurn;
    const defenderColor = 1 - currentTurn;

    // 5. Scan legal captures on the board
    const { targets, attackers } = scanBoardCaptures(gameLayer, attackerColor, defenderColor);

    // Mode: 'targets' (default - only pieces that can be captured), 'all' (both attacker and target)
    const auraMode = ZigaMod.userSettings.liveAuraMode || 'targets';

    // 6. Update visibility for each piece
    for (let i = 0; i < 32; i++) {
      const piece = gameLayer.V[i];
      if (!piece) continue;

      let shouldShow = false;

      if (!piece.pa) {
        if (targets.has(i)) {
          // Target piece that can be captured
          shouldShow = true;
        } else if (auraMode === 'all' && attackers.has(i)) {
          // Attacker piece with capture moves available
          shouldShow = true;
        }
      }

      if (shouldShow) {
        if (auraColor === 'green') {
          if (piece.__zigaAuraGreen) piece.__zigaAuraGreen.setVisible(true);
          if (piece.__zigaAuraRed) piece.__zigaAuraRed.setVisible(false);
        } else {
          if (piece.__zigaAuraGreen) piece.__zigaAuraGreen.setVisible(false);
          if (piece.__zigaAuraRed) piece.__zigaAuraRed.setVisible(true);
        }
      } else {
        if (piece.__zigaAuraGreen) piece.__zigaAuraGreen.setVisible(false);
        if (piece.__zigaAuraRed) piece.__zigaAuraRed.setVisible(false);
      }
    }
  }

  // Export to namespace
  ZigaMod.createAuraCanvas = createAuraCanvas;
  ZigaMod.hexToRgba = hexToRgba;
  ZigaMod.scanBoardCaptures = scanBoardCaptures;
  ZigaMod.updateBoardAura = updateBoardAura;
  ZigaMod.clearBoardAura = clearBoardAura;
  ZigaMod.reloadAuraTextures = reloadAuraTextures;

})(window.ZigaMod = window.ZigaMod || {});
