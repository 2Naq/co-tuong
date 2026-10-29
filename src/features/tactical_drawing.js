// src/features/tactical_drawing.js - Right-click tactical arrow & square highlight drawing canvas
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Tactical Drawing module initializing...');

  let canvasEl = null;
  let ctx = null;
  let isRightDragging = false;
  let dragStartCol = -1;
  let dragStartRow = -1;
  let dragStartPos = null;
  let dragCurrentPos = null;
  let currentKeyModifiers = { shift: false, alt: false, ctrl: false };

  // Stored tactical drawings:
  // arrows: [ { fromCol, fromRow, toCol, toRow, color } ]
  // highlights: [ { col, row, color } ]
  let drawnArrows = [];
  let drawnHighlights = [];

  const COLOR_PALETTES = {
    green:  { main: '#22c55e', shadow: 'rgba(34, 197, 94, 0.65)' }, // Default: Attack path / Plan
    red:    { main: '#ef4444', shadow: 'rgba(239, 68, 68, 0.7)' },  // Shift: Threat
    gold:   { main: '#eab308', shadow: 'rgba(234, 179, 8, 0.7)' },   // Alt: Coordination / Key square
    blue:   { main: '#38bdf8', shadow: 'rgba(56, 189, 248, 0.7)' }   // Ctrl: Defense
  };

  function getDrawingColor(modifiers) {
    if (modifiers.shift) return 'red';
    if (modifiers.alt) return 'gold';
    if (modifiers.ctrl) return 'blue';
    return 'green';
  }

  // Ensure drawing canvas overlay is attached to Cocos2dGameContainer or body
  function ensureDrawingCanvas() {
    if (canvasEl && canvasEl.parentElement) return canvasEl;

    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return null;

    const parent = gameCanvas.parentElement || document.body;

    canvasEl = document.getElementById('ziga-tactical-drawing-canvas');
    if (!canvasEl) {
      canvasEl = document.createElement('canvas');
      canvasEl.id = 'ziga-tactical-drawing-canvas';
      canvasEl.className = 'ziga-tactical-drawing-canvas';
      canvasEl.style.position = 'absolute';
      canvasEl.style.top = '0';
      canvasEl.style.left = '0';
      canvasEl.style.pointerEvents = 'none';
      canvasEl.style.zIndex = '15'; // Above game canvas, below mod UI
      parent.appendChild(canvasEl);
    }

    ctx = canvasEl.getContext('2d');
    syncCanvasBounds();
    bindMouseEvents(gameCanvas);

    return canvasEl;
  }

  // Sync size and position with gameCanvas
  function syncCanvasBounds() {
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas || !canvasEl) return;

    const rect = gameCanvas.getBoundingClientRect();
    const parentRect = (canvasEl.parentElement && canvasEl.parentElement.getBoundingClientRect)
      ? canvasEl.parentElement.getBoundingClientRect()
      : { left: 0, top: 0 };

    const left = rect.left - parentRect.left;
    const top = rect.top - parentRect.top;

    if (canvasEl.width !== gameCanvas.width || canvasEl.height !== gameCanvas.height) {
      canvasEl.width = gameCanvas.width;
      canvasEl.height = gameCanvas.height;
    }

    canvasEl.style.left = `${left}px`;
    canvasEl.style.top = `${top}px`;
    canvasEl.style.width = `${rect.width}px`;
    canvasEl.style.height = `${rect.height}px`;
  }

  // Convert board (col, row) to pixel center in HTML5 canvas coordinates (top-left origin)
  function boardToCanvasPixel(col, row) {
    const gameLayer = ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null;
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return { x: 0, y: 0 };

    if (gameLayer && typeof gameLayer.Pb === 'function' && typeof gameLayer.Qb === 'function') {
      return {
        x: gameLayer.Pb(col),
        y: gameCanvas.height - gameLayer.Qb(row)
      };
    }

    const dx = gameCanvas.width / 9;
    const dy = gameCanvas.height / 10;
    return {
      x: col * dx + dx / 2,
      y: gameCanvas.height - (row * dy + dy / 2)
    };
  }

  // Convert mouse client coordinates to board (col, row) with high precision snap
  function clientToBoardCoord(clientX, clientY) {
    const gameLayer = ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null;
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return null;

    const rect = gameCanvas.getBoundingClientRect();
    const scaleX = gameCanvas.width / rect.width;
    const scaleY = gameCanvas.height / rect.height;

    // 1. Tọa độ Canvas DOM (top-left)
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    // 2. Tọa độ Cocos2d (bottom-left)
    const cocosX = canvasX;
    const cocosY = gameCanvas.height - canvasY;

    if (gameLayer && typeof gameLayer.Pb === 'function' && typeof gameLayer.Qb === 'function') {
      const p0 = gameLayer.Pb(0);
      const p1 = gameLayer.Pb(1);
      const q0 = gameLayer.Qb(0);
      const q1 = gameLayer.Qb(1);
      const cellW = Math.abs(p1 - p0) || 57;
      const cellH = Math.abs(q1 - q0) || 57;
      const maxThreshold = Math.max(cellW, cellH) * 0.72;
      const maxThreshSq = maxThreshold * maxThreshold;

      // Find the nearest intersection among all 90 grid intersections
      let bestCol = -1;
      let bestRow = -1;
      let minDistanceSq = Infinity;

      for (let c = 0; c < 9; c++) {
        const px = gameLayer.Pb(c);
        const dx = cocosX - px;
        if (Math.abs(dx) > maxThreshold) continue;

        for (let r = 0; r < 10; r++) {
          const py = gameLayer.Qb(r);
          const dy = cocosY - py;
          const dSq = dx * dx + dy * dy;

          if (dSq < minDistanceSq && dSq <= maxThreshSq) {
            minDistanceSq = dSq;
            bestCol = c;
            bestRow = r;
          }
        }
      }

      if (bestCol >= 0 && bestRow >= 0) {
        return { col: bestCol, row: bestRow, cocosX, cocosY, canvasX, canvasY };
      }
    }

    // Mathematical fallback if gameLayer functions unavailable
    const dx = gameCanvas.width / 9;
    const dy = gameCanvas.height / 10;
    const col = Math.floor(canvasX / dx);
    const row = Math.floor((gameCanvas.height - canvasY) / dy);
    if (col >= 0 && col <= 8 && row >= 0 && row <= 9) {
      return { col, row, cocosX, cocosY, canvasX, canvasY };
    }

    return null;
  }

  function isClickOnModUI(e) {
    if (!e || !e.target) return false;
    return !!(
      e.target.closest('#ziga-mod-widget') ||
      e.target.closest('#ziga-mentor-floating-panel') ||
      e.target.closest('.ziga-settings-modal') ||
      e.target.closest('.ziga-tactical-sandbox-modal') ||
      e.target.closest('.ziga-op-modal') ||
      e.target.closest('.ziga-review-modal')
    );
  }

  // Mouse event listeners for drawing (Capture Phase ensures full tracking across Cocos2d canvas)
  let mouseListenersBound = false;
  function bindMouseEvents(targetEl) {
    if (mouseListenersBound) return;
    mouseListenersBound = true;

    // 1. Prevent default right-click context menu when on or near game canvas
    window.addEventListener('contextmenu', (e) => {
      if (isClickOnModUI(e)) return;
      const gameCanvas = document.getElementById('gameCanvas');
      if (gameCanvas) {
        const rect = gameCanvas.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
      if (isRightDragging) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, { capture: true });

    // 2. Mouse Down (Capture Phase): Intercept right-clicks directly on game canvas
    window.addEventListener('mousedown', (e) => {
      if (isClickOnModUI(e)) return;
      const userSettings = ZigaMod.userSettings;
      if (userSettings && userSettings.tacticalDrawing === false) return;

      const gameCanvas = document.getElementById('gameCanvas');
      if (!gameCanvas) return;

      const rect = gameCanvas.getBoundingClientRect();
      const isInside = (e.clientX >= rect.left && e.clientX <= rect.right &&
                        e.clientY >= rect.top && e.clientY <= rect.bottom);

      // Left click on board: Clear drawings if any are present
      if (e.button === 0 && isInside) {
        if (drawnArrows.length > 0 || drawnHighlights.length > 0) {
          clearDrawings();
        }
        return;
      }

      // Right click on board: Start drawing tactical arrow or highlight
      if (e.button === 2 && isInside) {
        const boardPos = clientToBoardCoord(e.clientX, e.clientY);
        if (!boardPos) return;

        isRightDragging = true;
        dragStartCol = boardPos.col;
        dragStartRow = boardPos.row;
        dragStartPos = boardToCanvasPixel(boardPos.col, boardPos.row);
        dragCurrentPos = { x: boardPos.canvasX, y: boardPos.canvasY };

        currentKeyModifiers = {
          shift: !!e.shiftKey,
          alt: !!e.altKey,
          ctrl: !!e.ctrlKey
        };

        e.preventDefault();
        e.stopPropagation();
      }
    }, { capture: true });

    // 3. Mouse Move (Capture Phase): Seamless tracking inside and outside board
    window.addEventListener('mousemove', (e) => {
      if (!isRightDragging) return;

      const gameCanvas = document.getElementById('gameCanvas');
      if (!gameCanvas) return;

      const rect = gameCanvas.getBoundingClientRect();
      const scaleX = gameCanvas.width / rect.width;
      const scaleY = gameCanvas.height / rect.height;

      dragCurrentPos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };

      currentKeyModifiers = {
        shift: !!e.shiftKey,
        alt: !!e.altKey,
        ctrl: !!e.ctrlKey
      };

      redrawCanvas();
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true });

    // 4. Mouse Up (Capture Phase): Complete arrow or square highlight
    window.addEventListener('mouseup', (e) => {
      if (e.button === 2 && isRightDragging) {
        e.preventDefault();
        e.stopPropagation();
        isRightDragging = false;

        const endBoard = clientToBoardCoord(e.clientX, e.clientY);
        const colorKey = getDrawingColor(currentKeyModifiers);

        if (endBoard) {
          if (endBoard.col === dragStartCol && endBoard.row === dragStartRow) {
            // Clicked single square: toggle highlight circle
            toggleSquareHighlight(endBoard.col, endBoard.row, colorKey);
          } else {
            // Dragged to another square: toggle arrow
            toggleArrow(dragStartCol, dragStartRow, endBoard.col, endBoard.row, colorKey);
          }
        }

        dragStartCol = -1;
        dragStartRow = -1;
        dragStartPos = null;
        dragCurrentPos = null;

        redrawCanvas();
      }
    }, { capture: true });
  }

  function toggleSquareHighlight(col, row, color) {
    const existingIdx = drawnHighlights.findIndex(h => h.col === col && h.row === row);
    if (existingIdx >= 0) {
      if (drawnHighlights[existingIdx].color === color) {
        drawnHighlights.splice(existingIdx, 1);
      } else {
        drawnHighlights[existingIdx].color = color;
      }
    } else {
      drawnHighlights.push({ col, row, color });
    }
  }

  function toggleArrow(fromCol, fromRow, toCol, toRow, color) {
    const existingIdx = drawnArrows.findIndex(a =>
      a.fromCol === fromCol && a.fromRow === fromRow &&
      a.toCol === toCol && a.toRow === toRow
    );

    if (existingIdx >= 0) {
      if (drawnArrows[existingIdx].color === color) {
        drawnArrows.splice(existingIdx, 1);
      } else {
        drawnArrows[existingIdx].color = color;
      }
    } else {
      drawnArrows.push({ fromCol, fromRow, toCol, toRow, color });
    }
  }

  function clearDrawings() {
    drawnArrows.length = 0;
    drawnHighlights.length = 0;
    if (ctx && canvasEl) {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
  }

  // Render all tactical elements on canvas
  function redrawCanvas() {
    if (!ctx || !canvasEl) return;
    syncCanvasBounds();

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // 1. Draw highlighted squares
    drawnHighlights.forEach(h => {
      const p = boardToCanvasPixel(h.col, h.row);
      const pal = COLOR_PALETTES[h.color] || COLOR_PALETTES.green;
      drawHighlightCircle(ctx, p.x, p.y, pal);
    });

    // 2. Draw stored arrows
    drawnArrows.forEach(a => {
      const start = boardToCanvasPixel(a.fromCol, a.fromRow);
      const end = boardToCanvasPixel(a.toCol, a.toRow);
      const pal = COLOR_PALETTES[a.color] || COLOR_PALETTES.green;
      drawNeonArrow(ctx, start.x, start.y, end.x, end.y, pal.main, pal.shadow);
    });

    // 3. Draw live active dragging arrow
    if (isRightDragging && dragStartPos && dragCurrentPos) {
      const colorKey = getDrawingColor(currentKeyModifiers);
      const pal = COLOR_PALETTES[colorKey] || COLOR_PALETTES.green;
      drawNeonArrow(ctx, dragStartPos.x, dragStartPos.y, dragCurrentPos.x, dragCurrentPos.y, pal.main, pal.shadow, true);
    }
  }

  // Draw circular pulse highlight on target square
  function drawHighlightCircle(c, x, y, palette) {
    c.save();
    c.beginPath();
    c.arc(x, y, 26, 0, Math.PI * 2);
    c.fillStyle = palette.shadow.replace('0.7', '0.25').replace('0.65', '0.25');
    c.fill();

    c.lineWidth = 3;
    c.strokeStyle = palette.main;
    c.shadowColor = palette.shadow;
    c.shadowBlur = 10;
    c.stroke();
    c.restore();
  }

  // Draw high-quality neon tactical arrow with head
  function drawNeonArrow(c, x1, y1, x2, y2, color, shadowColor, isLive) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 12) return; // Too short to draw

    const angle = Math.atan2(dy, dx);
    const headLength = Math.min(22, dist * 0.35);
    const headWidth = Math.min(18, dist * 0.3);
    const shaftWidth = 6.5;

    // Shorten end slightly so arrow head points cleanly at piece center
    const stopOffset = isLive ? 4 : 14;
    const adjustedEndX = x2 - Math.cos(angle) * stopOffset;
    const adjustedEndY = y2 - Math.sin(angle) * stopOffset;

    const baseEndX = adjustedEndX - Math.cos(angle) * headLength;
    const baseEndY = adjustedEndY - Math.sin(angle) * headLength;

    c.save();
    c.shadowColor = shadowColor;
    c.shadowBlur = isLive ? 12 : 9;

    // Draw Shaft Line
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(baseEndX, baseEndY);
    c.strokeStyle = color;
    c.lineWidth = shaftWidth;
    c.lineCap = 'round';
    c.stroke();

    // Draw Arrow Head Triangle
    c.beginPath();
    c.moveTo(adjustedEndX, adjustedEndY);
    c.lineTo(
      baseEndX + Math.cos(angle + Math.PI / 2) * (headWidth / 2),
      baseEndY + Math.sin(angle + Math.PI / 2) * (headWidth / 2)
    );
    c.lineTo(
      baseEndX + Math.cos(angle - Math.PI / 2) * (headWidth / 2),
      baseEndY + Math.sin(angle - Math.PI / 2) * (headWidth / 2)
    );
    c.closePath();
    c.fillStyle = color;
    c.fill();

    c.restore();
  }

  // Update loop hook (ensures canvas exists when in-game)
  function updateTacticalDrawing() {
    const userSettings = ZigaMod.userSettings;
    if (userSettings && userSettings.tacticalDrawing === false) {
      if (canvasEl) canvasEl.style.display = 'none';
      return;
    }

    const c = ensureDrawingCanvas();
    if (c) {
      c.style.display = 'block';
      syncCanvasBounds();
    }
  }

  // Export to namespace
  ZigaMod.ensureDrawingCanvas = ensureDrawingCanvas;
  ZigaMod.clearTacticalDrawings = clearDrawings;
  ZigaMod.updateTacticalDrawing = updateTacticalDrawing;
  ZigaMod.redrawTacticalCanvas = redrawCanvas;
  ZigaMod.drawnArrows = drawnArrows;
  ZigaMod.drawnHighlights = drawnHighlights;

})(window.ZigaMod = window.ZigaMod || {});
