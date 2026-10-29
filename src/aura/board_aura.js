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
   * @param {Object} piece - { col, row, type, color, baseRow }
   * @param {number} targetCol
   * @param {number} targetRow
   * @param {Array} grid - 9x10 grid of living piece objects (or null if empty)
   * @returns {boolean}
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
      // Normal palace step
      if (targetCol >= 3 && targetCol <= 5 && targetRow >= minR && targetRow <= maxR) {
        if (Math.abs(c - targetCol) + Math.abs(r - targetRow) === 1) return true;
      }
      // Flying general check: facing opponent King along open file
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
        if (grid[curC][curR]) return false; // Obstacle found
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
      return screens === 1; // Needs exactly 1 piece to jump over
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

      // Forward step
      if (targetCol === c && targetRow === r + forward) return true;

      // Sideways step after river
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

    // 1. Collect living pieces
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

    // 2. Determine base row for Red and Black to know advance direction
    let redBaseRow = 0;
    let blackBaseRow = 9;
    const redKing = pieces.find(p => p.type === 0 && p.color === 0);
    const blackKing = pieces.find(p => p.type === 0 && p.color === 1);
    if (redKing) redBaseRow = (redKing.row <= 2) ? 0 : 9;
    if (blackKing) blackBaseRow = (blackKing.row <= 2) ? 0 : 9;

    pieces.forEach(p => {
      p.baseRow = (p.color === 0) ? redBaseRow : blackBaseRow;
    });

    // 3. Build 9x10 grid of piece references
    const grid = Array.from({ length: 9 }, () => Array(10).fill(null));
    pieces.forEach(p => {
      grid[p.col][p.row] = p;
    });

    const myPieces = pieces.filter(p => p.color === myColor);
    const oppPieces = pieces.filter(p => p.color === oppColor);

    // 4. Evaluate GREEN AURAS (Opportunities: opponent pieces player can capture safely)
    oppPieces.forEach(target => {
      // Find which of my pieces can attack this opponent piece
      const myAttackers = myPieces.filter(a => canPieceAttackSquare(a, target.col, target.row, grid));
      if (myAttackers.length === 0) return;

      // Find all opponent defenders of this target piece
      const oppDefenders = oppPieces.filter(d => d.index !== target.index && canPieceAttackSquare(d, target.col, target.row, grid));

      const targetVal = getPieceValue(target.type, target.row, target.baseRow);

      let canCaptureSafely = false;
      if (oppDefenders.length === 0) {
        // Target has ZERO defenders -> 100% free capture!
        canCaptureSafely = true;
      } else {
        // Target is defended: ONLY safe if attacker has significantly lower value (profitable exchange)
        // e.g. Pawn (1.5) eats Knight (4.0), Cannon (4.5), Chariot (9.0)
        // e.g. Knight/Cannon (4.0/4.5) eats Chariot (9.0)
        canCaptureSafely = myAttackers.some(a => {
          const atkVal = getPieceValue(a.type, a.row, a.baseRow);
          return (targetVal - atkVal >= 1.5);
        });
      }

      if (canCaptureSafely) {
        greenTargets.add(target.index);
      }
    });

    // 5. Evaluate RED AURAS (Threats: player pieces that opponent can capture profitably / hanging)
    myPieces.forEach(myTarget => {
      // Find which opponent pieces can attack my piece
      const oppAttackers = oppPieces.filter(e => canPieceAttackSquare(e, myTarget.col, myTarget.row, grid));
      if (oppAttackers.length === 0) return;

      // Find all my defenders of this piece
      const myDefenders = myPieces.filter(d => d.index !== myTarget.index && canPieceAttackSquare(d, myTarget.col, myTarget.row, grid));

      const targetVal = getPieceValue(myTarget.type, myTarget.row, myTarget.baseRow);

      let isUnderRealDanger = false;
      if (myDefenders.length === 0) {
        // My piece is completely hanging (zero defenders)!
        isUnderRealDanger = true;
      } else {
        // My piece is defended: opponent will only trade if their attacker is significantly cheaper
        // e.g. Opponent Pawn attacks my Chariot/Horse/Cannon
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
   * Accurately displays Green (Free Capture) and Red (Hanging Threat) auras simultaneously.
   * Automatically clears all auras between moves so no aura ever lingers!
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

    // 4. CRITICAL RESET: Hide all auras on all pieces FIRST to guarantee no old auras linger!
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p) {
        if (p.__zigaAuraGreen) p.__zigaAuraGreen.setVisible(false);
        if (p.__zigaAuraRed) p.__zigaAuraRed.setVisible(false);
      }
    }

    // 5. Compute accurate tactical target auras
    const { greenTargets, redTargets } = analyzeBoardAuras(gameLayer, data.myColor, data.oppColor);

    // 6. Display Green Auras on safe capture targets
    greenTargets.forEach(idx => {
      const piece = gameLayer.V[idx];
      if (piece && !piece.pa && piece.__zigaAuraGreen) {
        piece.__zigaAuraGreen.setVisible(true);
      }
    });

    // 7. Display Red Auras on unprotected threatened pieces
    redTargets.forEach(idx => {
      const piece = gameLayer.V[idx];
      if (piece && !piece.pa && piece.__zigaAuraRed) {
        piece.__zigaAuraRed.setVisible(true);
      }
    });
  }

  // Export to namespace
  ZigaMod.createAuraCanvas = createAuraCanvas;
  ZigaMod.hexToRgba = hexToRgba;
  ZigaMod.canPieceAttackSquare = canPieceAttackSquare;
  ZigaMod.analyzeBoardAuras = analyzeBoardAuras;
  ZigaMod.updateBoardAura = updateBoardAura;
  ZigaMod.clearBoardAura = clearBoardAura;
  ZigaMod.reloadAuraTextures = reloadAuraTextures;

})(window.ZigaMod = window.ZigaMod || {});
