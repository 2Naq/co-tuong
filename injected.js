// injected.js - Runs in MAIN world of zigavn.com
(function () {
  console.log('[Ziga Mod] Xiangqi Helper with Capture Highlight injected successfully.');

  // Chess piece definitions
  // Type ID in Ziga: 0: Tướng, 1: Sĩ, 2: Tượng, 3: Xe, 4: Pháo, 5: Mã, 6: Tốt
  const PIECE_DEFS = {
    0: { name: 'Tướng', redChar: '帥', blackChar: '將', value: 0, total: 1, short: 'Tg' },
    3: { name: 'Xe', redChar: '俥', blackChar: '車', value: 9, total: 2, short: 'X' },
    4: { name: 'Pháo', redChar: '炮', blackChar: '砲', value: 4.5, total: 2, short: 'P' },
    5: { name: 'Mã', redChar: '傌', blackChar: '馬', value: 4, total: 2, short: 'M' },
    1: { name: 'Sĩ', redChar: '仕', blackChar: '士', value: 2, total: 2, short: 'S' },
    2: { name: 'Tượng', redChar: '相', blackChar: '象', value: 2, total: 2, short: 'T' },
    6: { name: 'Tốt', redChar: '兵', blackChar: '卒', value: 1.5, total: 5, short: 'B' }
  };

  // Desired display order for tactical awareness (Xe -> Pháo -> Mã -> Tốt -> Sĩ -> Tượng -> Tướng)
  const DISPLAY_ORDER = [3, 4, 5, 6, 1, 2, 0];

  let widgetEl = null;
  let isMinimized = false;
  let lastStateHash = '';

  // Capture highlight state
  let selectedPieceIndex = -1;
  let currentCapturablePieces = [];
  let svgOverlay = null;
  let canvasListenerAttached = false;
  let lastBoardPositionsHash = '';

  // Load saved position
  function loadSavedPosition() {
    try {
      const saved = localStorage.getItem('ziga_mod_pos');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) { }
    return null;
  }

  function savePosition(x, y) {
    try {
      localStorage.setItem('ziga_mod_pos', JSON.stringify({ x, y }));
    } catch (e) { }
  }

  // Create or get SVG overlay over canvas
  function getOrCreateSvgOverlay() {
    if (svgOverlay && document.body.contains(svgOverlay)) {
      return svgOverlay;
    }

    svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgOverlay.id = 'ziga-board-svg';
    svgOverlay.setAttribute('class', 'ziga-svg-overlay');
    svgOverlay.innerHTML = `
      <defs>
        <marker id="ziga-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
        </marker>
        <filter id="ziga-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g id="ziga-svg-content"></g>
    `;

    document.body.appendChild(svgOverlay);
    return svgOverlay;
  }

  // Create UI overlay
  function createOverlay() {
    if (document.getElementById('ziga-mod-widget')) return;

    widgetEl = document.createElement('div');
    widgetEl.id = 'ziga-mod-widget';
    widgetEl.className = 'ziga-mod-container';

    // Position widget next to canvas or saved pos
    const savedPos = loadSavedPosition();
    if (savedPos && savedPos.x !== undefined && savedPos.y !== undefined) {
      widgetEl.style.left = savedPos.x + 'px';
      widgetEl.style.top = savedPos.y + 'px';
    } else {
      // Default position docked near canvas
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        widgetEl.style.left = Math.max(10, rect.right + 15) + 'px';
        widgetEl.style.top = Math.max(10, rect.top) + 'px';
      } else {
        widgetEl.style.right = '20px';
        widgetEl.style.top = '100px';
      }
    }

    widgetEl.innerHTML = `
      <div class="ziga-mod-header" id="ziga-mod-drag-handle">
        <div class="ziga-mod-title">
          <span class="ziga-mod-badge-icon">♟</span>
          <span class="ziga-mod-title-text">Cờ tướng trợ thủ</span>
        </div>
        <div class="ziga-mod-actions">
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-min" title="Thu gọn / Mở rộng">_</button>
        </div>
      </div>

      <div class="ziga-mod-content" id="ziga-mod-body">
        <div class="ziga-mod-match-status" id="ziga-mod-match-info">
          <span class="ziga-mod-dot waiting"></span>
          <span id="ziga-status-text">Đang kết nối game...</span>
        </div>

        <!-- Material Advantage Indicator -->
        <div class="ziga-material-bar-wrapper" id="ziga-material-wrapper" style="display:none;">
          <div class="ziga-material-label">Chênh lệch quân:</div>
          <div class="ziga-material-val" id="ziga-material-score">Bằng điểm</div>
        </div>

        <!-- Section 1: Opponent Captured Pieces (quân đối thủ đã mất) -->
        <div class="ziga-player-section opponent-section">
          <div class="ziga-section-header">
            <span class="ziga-player-label" id="ziga-opp-label">🔴 ĐỐI THỦ ĐÃ MẤT</span>
            <span class="ziga-count-tag" id="ziga-opp-dead-count">0/16</span>
          </div>
          <div class="ziga-pieces-grid" id="ziga-opp-pieces">
            <div class="ziga-empty-note">Chưa mất quân nào</div>
          </div>
        </div>

        <div class="ziga-divider"></div>

        <!-- Section 2: Player Lost Pieces (quân mình đã mất) -->
        <div class="ziga-player-section self-section">
          <div class="ziga-section-header">
            <span class="ziga-player-label" id="ziga-self-label">⚫ BẠN ĐÃ MẤT</span>
            <span class="ziga-count-tag" id="ziga-self-dead-count">0/16</span>
          </div>
          <div class="ziga-pieces-grid" id="ziga-self-pieces">
            <div class="ziga-empty-note">Chưa mất quân nào</div>
          </div>
        </div>

        <!-- Section 3: Tactical Target Inspector (Highlight quân có thể ăn) -->
        <div class="ziga-divider"></div>
        <div class="ziga-tactical-section" id="ziga-tactical-box">
          <div class="ziga-tactical-header">
            <span class="ziga-tactical-title">🎯 TẦM ĂN & CHIẾN THUẬT</span>
            <button class="ziga-btn-clear-select" id="ziga-btn-clear-highlight" title="Xóa highlight">✕ Bỏ chọn</button>
          </div>
          <div class="ziga-selected-display" id="ziga-selected-piece-info">
            <span class="ziga-empty-note">Bấm vào bất kỳ quân nào trên bàn cờ (của mình hoặc đối thủ) để xem nó ăn được những quân nào!</span>
          </div>
          <div class="ziga-targets-container" id="ziga-targets-list" style="display:none;">
            <!-- Target piece items dynamically added -->
          </div>
        </div>

        <!-- Section 4: Remaining Key Pieces Tracker -->
        <div class="ziga-divider"></div>
        <div class="ziga-summary-section">
          <div class="ziga-summary-title">LỰC LƯỢNG CHÍNH CÒN LẠI (Xe - Pháo - Mã)</div>
          <div class="ziga-summary-stats" id="ziga-remaining-stats">
            <div class="ziga-stat-col">
              <span class="ziga-stat-head" id="ziga-stat-opp-name">Đối thủ</span>
              <span class="ziga-stat-val" id="ziga-stat-opp-val">-</span>
            </div>
            <div class="ziga-stat-vs">VS</div>
            <div class="ziga-stat-col">
              <span class="ziga-stat-head" id="ziga-stat-self-name">Bạn</span>
              <span class="ziga-stat-val" id="ziga-stat-self-val">-</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widgetEl);

    // Make Draggable
    setupDraggable(widgetEl, document.getElementById('ziga-mod-drag-handle'));

    // Setup Minimize
    const minBtn = document.getElementById('ziga-mod-btn-min');
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isMinimized = !isMinimized;
      widgetEl.classList.toggle('minimized', isMinimized);
      minBtn.textContent = isMinimized ? '▢' : '_';
    });

    // Clear highlight button
    const clearBtn = document.getElementById('ziga-btn-clear-highlight');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gameLayer = getActiveGameLayer();
        clearCaptureHighlights(gameLayer);
      });
    }

    // Attach canvas click listener for piece interaction
    attachCanvasClickListener();
  }

  // Get active game layer
  function getActiveGameLayer() {
    if (!window.BkGlobal || !window.BkGlobal.Yj) return null;
    return window.BkGlobal.Yj.ja ? window.BkGlobal.Yj.ja() : null;
  }

  // Attach click listener to gameCanvas
  function attachCanvasClickListener() {
    if (canvasListenerAttached) return;
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
      handleCanvasClick(e, canvas);
    }, true);

    canvasListenerAttached = true;
    console.log('[Ziga Mod] Canvas click listener attached for tactical piece highlight.');
  }

  // Dragging logic
  function setupDraggable(container, handle) {
    let isDragging = false;
    let startX, startY, initX, initY;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = container.getBoundingClientRect();
      initX = rect.left;
      initY = rect.top;
      handle.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newX = Math.max(10, Math.min(window.innerWidth - container.offsetWidth - 10, initX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - container.offsetHeight - 10, initY + dy));
      container.style.left = newX + 'px';
      container.style.top = newY + 'px';
      container.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        handle.style.cursor = 'grab';
        const rect = container.getBoundingClientRect();
        savePosition(rect.left, rect.top);
      }
    });
  }

  // Coordinate conversion: Piece (Cocos coordinates) to Viewport (Screen)
  function pieceToScreen(piece, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    // Cocos Y is 0 at bottom, canvas DOM Y is 0 at top
    const screenX = rect.left + piece.x * scaleX;
    const screenY = rect.top + (canvas.height - piece.y) * scaleY;
    return { x: screenX, y: screenY };
  }

  // ==========================================
  // CHINESE CHESS CAPTURE ENGINE & TACTICAL ANALYSIS
  // ==========================================

  // Check if attacker can capture target on standard Xiangqi board
  function canPieceCaptureXiangqi(attacker, target, grid) {
    if (attacker.color === target.color) return false;
    if (attacker.col === target.col && attacker.row === target.row) return false;

    const dx = target.col - attacker.col;
    const dy = target.row - attacker.row;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    switch (attacker.type) {
      case 3: { // Xe (Rook/Chariot)
        if (dx !== 0 && dy !== 0) return false;
        let obstacles = 0;
        if (dx === 0) {
          const step = dy > 0 ? 1 : -1;
          for (let r = attacker.row + step; r !== target.row; r += step) {
            if (grid[attacker.col][r] >= 0) obstacles++;
          }
        } else {
          const step = dx > 0 ? 1 : -1;
          for (let c = attacker.col + step; c !== target.col; c += step) {
            if (grid[c][attacker.row] >= 0) obstacles++;
          }
        }
        return obstacles === 0;
      }

      case 4: { // Pháo (Cannon)
        if (dx !== 0 && dy !== 0) return false;
        // Pháo eats ONLY when jumping over exactly 1 piece (ngòi pháo)
        let obstacles = 0;
        if (dx === 0) {
          const step = dy > 0 ? 1 : -1;
          for (let r = attacker.row + step; r !== target.row; r += step) {
            if (grid[attacker.col][r] >= 0) obstacles++;
          }
        } else {
          const step = dx > 0 ? 1 : -1;
          for (let c = attacker.col + step; c !== target.col; c += step) {
            if (grid[c][attacker.row] >= 0) obstacles++;
          }
        }
        return obstacles === 1;
      }

      case 5: { // Mã (Horse/Knight)
        // L-shape: (1, 2) or (2, 1)
        if (!((absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1))) return false;
        let legCol = attacker.col;
        let legRow = attacker.row;
        if (absDx === 2) {
          legCol += (dx > 0 ? 1 : -1);
        } else {
          legRow += (dy > 0 ? 1 : -1);
        }
        // Horse leg must be free
        return grid[legCol][legRow] < 0;
      }

      case 2: { // Tượng (Elephant)
        if (absDx !== 2 || absDy !== 2) return false;
        // Cannot cross river:
        // Rows 0-4 is bottom side, rows 5-9 is top side
        if (attacker.row <= 4 && target.row > 4) return false;
        if (attacker.row >= 5 && target.row < 5) return false;
        // Elephant eye must be free
        const eyeCol = attacker.col + dx / 2;
        const eyeRow = attacker.row + dy / 2;
        return grid[eyeCol][eyeRow] < 0;
      }

      case 1: { // Sĩ (Advisor)
        if (absDx !== 1 || absDy !== 1) return false;
        // Must stay in palace (col 3-5, row 0-2 or row 7-9)
        if (target.col < 3 || target.col > 5) return false;
        if (attacker.row <= 2) {
          return target.row >= 0 && target.row <= 2;
        } else if (attacker.row >= 7) {
          return target.row >= 7 && target.row <= 9;
        }
        return false;
      }

      case 0: { // Tướng (King/General)
        // Orthogonal 1 step in palace
        if ((absDx === 1 && absDy === 0) || (absDx === 0 && absDy === 1)) {
          if (target.col >= 3 && target.col <= 5) {
            if (attacker.row <= 2 && target.row >= 0 && target.row <= 2) return true;
            if (attacker.row >= 7 && target.row >= 7 && target.row <= 9) return true;
          }
        }
        // Flying General (Face-to-face King capture)
        if (dx === 0 && target.type === 0) {
          let obstacles = 0;
          const step = dy > 0 ? 1 : -1;
          for (let r = attacker.row + step; r !== target.row; r += step) {
            if (grid[attacker.col][r] >= 0) obstacles++;
          }
          if (obstacles === 0) return true;
        }
        return false;
      }

      case 6: { // Tốt (Pawn/Soldier)
        let forwardDir = 1;
        if (attacker.row <= 4) {
          forwardDir = 1; // Moving towards row 9
        } else {
          forwardDir = -1; // Moving towards row 0
        }

        const hasCrossedRiver = (forwardDir > 0 && attacker.row >= 5) || (forwardDir < 0 && attacker.row <= 4);

        // Step forward
        if (dx === 0 && dy === forwardDir) return true;

        // Step sideways (after river)
        if (hasCrossedRiver && absDx === 1 && dy === 0) return true;

        return false;
      }

      default:
        return false;
    }
  }

  // Calculate all capturable enemy pieces for a given piece index
  function getCapturablePieces(gameLayer, pieceIndex) {
    const results = [];
    if (!gameLayer || !gameLayer.V || pieceIndex < 0 || pieceIndex >= 32) return results;

    const attacker = gameLayer.V[pieceIndex];
    if (!attacker || attacker.pa) return results;

    // Build 9x10 grid
    const grid = Array.from({ length: 9 }, () => Array(10).fill(-1));
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p && !p.pa) {
        grid[p.fa][p.rowIndex] = i;
      }
    }

    const attackerColor = attacker.ka !== undefined ? attacker.ka : Math.floor(pieceIndex / 16);
    const attackerType = attacker.Ga !== undefined ? attacker.Ga : 6;
    const attackerData = {
      col: attacker.fa,
      row: attacker.rowIndex,
      type: attackerType,
      color: attackerColor
    };

    // Helper piece instance from game layer if available
    const pieceHelper = gameLayer.hq ? gameLayer.hq(pieceIndex) : null;

    for (let i = 0; i < 32; i++) {
      const target = gameLayer.V[i];
      if (!target || target.pa) continue;

      const targetColor = target.ka !== undefined ? target.ka : Math.floor(i / 16);
      if (targetColor === attackerColor) continue; // Only enemy pieces

      const targetType = target.Ga !== undefined ? target.Ga : 6;
      const targetData = {
        col: target.fa,
        row: target.rowIndex,
        type: targetType,
        color: targetColor
      };

      let canCapture = false;

      // Try game engine's native calculation first
      if (pieceHelper && gameLayer.IM) {
        try {
          const square = target.fa + 9 * target.rowIndex;
          canCapture = !!gameLayer.IM(pieceHelper, pieceIndex, square, grid);
        } catch (e) {
          canCapture = false;
        }
      }

      // Fallback Xiangqi rule validator if engine is inconclusive
      if (!canCapture) {
        canCapture = canPieceCaptureXiangqi(attackerData, targetData, grid);
      }

      // Verify King safety / Lộ mặt tướng if engine method is available
      if (canCapture && gameLayer.BM) {
        try {
          if (gameLayer.BM(pieceHelper || attackerData, pieceIndex, target.fa, target.rowIndex, grid)) {
            canCapture = false;
          }
        } catch (e) { }
      }

      if (canCapture) {
        const def = PIECE_DEFS[targetType] || { name: 'Quân', redChar: '?', blackChar: '?' };
        const char = targetColor === 0 ? def.redChar : def.blackChar;
        results.push({
          index: i,
          piece: target,
          type: targetType,
          color: targetColor,
          col: target.fa,
          row: target.rowIndex,
          x: target.x,
          y: target.y,
          name: def.name,
          char: char,
          value: def.value
        });
      }
    }

    return results;
  }

  // Handle click on canvas to select ANY piece (User's OR Opponent's!)
  function handleCanvasClick(e, canvas) {
    const gameLayer = getActiveGameLayer();
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V) || gameLayer.V.length !== 32) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Convert DOM click to internal Cocos canvas coordinates
    const clickCanvasX = (e.clientX - rect.left) * scaleX;
    const clickCanvasY = canvas.height - ((e.clientY - rect.top) * scaleY); // Cocos Y inverted

    // Find closest piece
    let clickedIndex = -1;
    let minDistance = 50; // Touch radius threshold

    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      const dist = Math.hypot(p.x - clickCanvasX, p.y - clickCanvasY);
      if (dist < minDistance) {
        minDistance = dist;
        clickedIndex = i;
      }
    }

    if (clickedIndex >= 0) {
      if (selectedPieceIndex === clickedIndex) {
        // Toggle off if clicking same piece again
        clearCaptureHighlights(gameLayer);
      } else {
        selectPieceAndHighlight(gameLayer, clickedIndex);
      }
    } else {
      // Clicked on empty space: clear highlight after small delay (unless moving)
      setTimeout(() => {
        const currentLayer = getActiveGameLayer();
        if (currentLayer && (!currentLayer.le || currentLayer.le < 0)) {
          clearCaptureHighlights(currentLayer);
        }
      }, 150);
    }
  }

  // Select a piece and highlight its capture targets
  function selectPieceAndHighlight(gameLayer, pieceIndex) {
    clearCaptureHighlights(gameLayer);

    selectedPieceIndex = pieceIndex;
    const attacker = gameLayer.V[pieceIndex];
    if (!attacker || attacker.pa) return;

    currentCapturablePieces = getCapturablePieces(gameLayer, pieceIndex);

    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    // 1. Activate Cocos native pulsing animation on capturable target pieces
    currentCapturablePieces.forEach(targetItem => {
      if (targetItem.piece && typeof targetItem.piece.kj === 'function') {
        try {
          targetItem.piece.kj(true);
        } catch (e) { }
      }
    });

    // 2. Render SVG overlay (Golden selected aura, Pulsing Red target reticles, Animated attack arrows)
    renderSvgHighlights(gameLayer, attacker, currentCapturablePieces, canvas);

    // 3. Update HUD Assistant panel with detailed info
    updateTacticalHud(attacker, currentCapturablePieces);
  }

  // Clear all capture highlights
  function clearCaptureHighlights(gameLayer) {
    // Stop Cocos native pulsing
    if (gameLayer && gameLayer.V) {
      for (let i = 0; i < 32; i++) {
        const p = gameLayer.V[i];
        if (p && typeof p.kj === 'function') {
          try {
            p.kj(false);
          } catch (e) { }
        }
      }
    }

    // Clear SVG overlay content
    if (svgOverlay) {
      const content = svgOverlay.querySelector('#ziga-svg-content');
      if (content) content.innerHTML = '';
    }

    selectedPieceIndex = -1;
    currentCapturablePieces = [];

    // Reset HUD section
    const selectedDisplay = document.getElementById('ziga-selected-piece-info');
    const targetsList = document.getElementById('ziga-targets-list');
    if (selectedDisplay) {
      selectedDisplay.innerHTML = `<span class="ziga-empty-note">Bấm vào bất kỳ quân nào trên bàn cờ (của mình hoặc đối thủ) để xem nó ăn được những quân nào!</span>`;
    }
    if (targetsList) {
      targetsList.style.display = 'none';
      targetsList.innerHTML = '';
    }
  }

  // Render SVG highlights (rings, crosshairs, attack arrows)
  function renderSvgHighlights(gameLayer, attacker, capturableList, canvas) {
    const overlay = getOrCreateSvgOverlay();
    const content = overlay.querySelector('#ziga-svg-content');
    if (!content) return;

    let svgHtml = '';

    const attackerPos = pieceToScreen(attacker, canvas);
    const attackerColor = attacker.ka !== undefined ? attacker.ka : 0;
    const ringColor = attackerColor === 0 ? '#ef4444' : '#60a5fa';

    // 1. Golden aura around the selected piece
    svgHtml += `
      <circle cx="${attackerPos.x}" cy="${attackerPos.y}" r="26" class="ziga-svg-selected-ring" />
      <circle cx="${attackerPos.x}" cy="${attackerPos.y}" r="31" class="ziga-svg-selected-pulse" />
    `;

    // 2. Red target reticles & attack lines to each capturable enemy piece
    capturableList.forEach(target => {
      const targetPos = pieceToScreen(target.piece, canvas);

      // Attack arrow line
      svgHtml += `
        <line x1="${attackerPos.x}" y1="${attackerPos.y}" x2="${targetPos.x}" y2="${targetPos.y}"
              class="ziga-svg-attack-line" marker-end="url(#ziga-arrow-red)" />
      `;

      // Target pulsing reticle & crosshair
      svgHtml += `
        <circle cx="${targetPos.x}" cy="${targetPos.y}" r="27" class="ziga-svg-target-ring" />
        <circle cx="${targetPos.x}" cy="${targetPos.y}" r="34" class="ziga-svg-target-pulse" />
        <line x1="${targetPos.x - 12}" y1="${targetPos.y}" x2="${targetPos.x + 12}" y2="${targetPos.y}" class="ziga-svg-crosshair" />
        <line x1="${targetPos.x}" y1="${targetPos.y - 12}" x2="${targetPos.x}" y2="${targetPos.y + 12}" class="ziga-svg-crosshair" />
      `;
    });

    content.innerHTML = svgHtml;
  }

  // Update Tactical Inspector in HUD Assistant
  function updateTacticalHud(attacker, capturableList) {
    const selectedDisplay = document.getElementById('ziga-selected-piece-info');
    const targetsList = document.getElementById('ziga-targets-list');
    if (!selectedDisplay || !targetsList) return;

    const attackerColor = attacker.ka !== undefined ? attacker.ka : 0;
    const attackerType = attacker.Ga !== undefined ? attacker.Ga : 6;
    const def = PIECE_DEFS[attackerType] || { name: 'Quân', redChar: '?', blackChar: '?' };
    const char = attackerColor === 0 ? def.redChar : def.blackChar;
    const colorLabel = attackerColor === 0 ? '🔴 Phe Đỏ' : '⚫ Phe Đen';
    const colorClass = attackerColor === 0 ? 'red-piece' : 'black-piece';

    selectedDisplay.innerHTML = `
      <div class="ziga-inspect-card">
        <div class="ziga-piece-chip ${colorClass} inspect-active">
          <div class="ziga-piece-token">
            <span class="ziga-token-char">${char}</span>
          </div>
          <div class="ziga-piece-info">
            <span class="ziga-piece-name">${colorLabel} - ${def.name}</span>
            <span class="ziga-pos-badge">(Cột ${attacker.fa + 1}, Hàng ${attacker.rowIndex + 1})</span>
          </div>
        </div>
      </div>
    `;

    targetsList.style.display = 'flex';

    if (capturableList.length === 0) {
      targetsList.innerHTML = `
        <div class="ziga-tactical-empty">
          <span>⚔️ Hiện tại <strong>không có quân nào</strong> của đối phương nằm trong tầm ăn.</span>
        </div>
      `;
    } else {
      let targetsHtml = `
        <div class="ziga-target-subhead">
          <span>⚔️ CÓ THỂ ĂN (${capturableList.length} quân):</span>
        </div>
        <div class="ziga-target-items">
      `;

      capturableList.forEach(item => {
        const targetColorClass = item.color === 0 ? 'red-piece' : 'black-piece';
        targetsHtml += `
          <div class="ziga-target-item ${targetColorClass}">
            <span class="ziga-target-token">${item.char}</span>
            <span class="ziga-target-name">${item.name}</span>
            <span class="ziga-target-pos">(C${item.col + 1}, H${item.row + 1})</span>
            <span class="ziga-target-val">+${item.value}đ</span>
          </div>
        `;
      });

      targetsHtml += `</div>`;
      targetsList.innerHTML = targetsHtml;
    }
  }

  // ==========================================
  // GAME DATA EXTRACTION & GENERAL MOD UPDATER
  // ==========================================

  // Extract active game data
  function getActiveGameData() {
    if (!window.BkGlobal || !window.BkGlobal.Yj) return null;
    const gameLayer = window.BkGlobal.Yj.ja ? window.BkGlobal.Yj.ja() : null;
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V) || gameLayer.V.length !== 32) {
      return null;
    }

    const logicMgr = window.BkLogicManager ? window.BkLogicManager.na() : null;
    const myPlayer = logicMgr && logicMgr.Ba ? logicMgr.Ba() : null;

    // Determine colors
    let myColor = 0; // 0 = Red, 1 = Black
    let isSpectator = false;

    if (myPlayer) {
      isSpectator = !!myPlayer.Ka;
      if (!isSpectator && myPlayer.ka !== undefined) {
        myColor = myPlayer.ka;
      } else if (gameLayer.Nj !== undefined && gameLayer.Nj >= 0) {
        myColor = gameLayer.Nj;
      }
    } else if (gameLayer.Nj !== undefined && gameLayer.Nj >= 0) {
      myColor = gameLayer.Nj;
    }

    const oppColor = 1 - myColor;

    // Player names
    let myName = myPlayer && myPlayer.getName ? myPlayer.getName() : (myColor === 0 ? 'Bên Đỏ' : 'Bên Đen');
    let oppName = (oppColor === 0 ? 'Bên Đỏ' : 'Bên Đen');

    if (gameLayer.gc && gameLayer.gc.Z) {
      if (myColor === 0) myName = gameLayer.gc.Z.userName || myName;
      else oppName = gameLayer.gc.Z.userName || oppName;
    }
    if (gameLayer.dc && gameLayer.dc.Z) {
      if (myColor === 1) myName = gameLayer.dc.Z.userName || myName;
      else oppName = gameLayer.dc.Z.userName || oppName;
    }

    // Process 32 pieces
    const deadMyPieces = [];
    const deadOppPieces = [];
    const aliveMyPieces = [];
    const aliveOppPieces = [];

    for (let i = 0; i < gameLayer.V.length; i++) {
      const p = gameLayer.V[i];
      if (!p) continue;

      const isDead = !!p.pa;
      const color = p.ka !== undefined ? p.ka : Math.floor(i / 16);
      const type = p.Ga !== undefined ? p.Ga : 6;

      const item = {
        index: i,
        type: type,
        color: color,
        isDead: isDead
      };

      if (color === myColor) {
        if (isDead) deadMyPieces.push(item);
        else aliveMyPieces.push(item);
      } else {
        if (isDead) deadOppPieces.push(item);
        else aliveOppPieces.push(item);
      }
    }

    return {
      gameLayer,
      myColor,
      oppColor,
      myName,
      oppName,
      isSpectator,
      deadMyPieces,
      deadOppPieces,
      aliveMyPieces,
      aliveOppPieces
    };
  }

  // Build HTML for a list of pieces
  function renderPieceList(deadPieces, color) {
    if (!deadPieces || deadPieces.length === 0) {
      return '<div class="ziga-empty-note">Chưa bị ăn quân nào</div>';
    }

    const counts = {};
    DISPLAY_ORDER.forEach(type => { counts[type] = 0; });
    deadPieces.forEach(p => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });

    let html = '';
    DISPLAY_ORDER.forEach(type => {
      const count = counts[type];
      if (count > 0) {
        const def = PIECE_DEFS[type] || { name: '?', redChar: '?', blackChar: '?', total: 1 };
        const char = color === 0 ? def.redChar : def.blackChar;
        const colorClass = color === 0 ? 'red-piece' : 'black-piece';

        html += `
          <div class="ziga-piece-chip ${colorClass}" title="${def.name} (${count}/${def.total} đã bị ăn)">
            <div class="ziga-piece-token">
              <span class="ziga-token-char">${char}</span>
            </div>
            <div class="ziga-piece-info">
              <span class="ziga-piece-name">${def.name}</span>
              <span class="ziga-piece-count">×${count}</span>
            </div>
          </div>
        `;
      }
    });

    return html;
  }

  // Calculate material difference
  function computeMaterialScore(aliveMy, aliveOpp) {
    let myScore = 0;
    let oppScore = 0;

    aliveMy.forEach(p => {
      const def = PIECE_DEFS[p.type];
      if (def) myScore += def.value;
    });

    aliveOpp.forEach(p => {
      const def = PIECE_DEFS[p.type];
      if (def) oppScore += def.value;
    });

    const diff = myScore - oppScore;
    return { myScore, oppScore, diff };
  }

  // Count Xe, Pháo, Mã remaining
  function countKeyPieces(alivePieces) {
    let xe = 0, phao = 0, ma = 0;
    alivePieces.forEach(p => {
      if (p.type === 3) xe++;
      if (p.type === 4) phao++;
      if (p.type === 5) ma++;
    });
    return `${xe}X · ${phao}P · ${ma}M`;
  }

  // Main update tick
  function updateMod() {
    createOverlay();

    const data = getActiveGameData();

    const statusDot = widgetEl.querySelector('.ziga-mod-dot');
    const statusText = document.getElementById('ziga-status-text');
    const materialWrapper = document.getElementById('ziga-material-wrapper');
    const materialScore = document.getElementById('ziga-material-score');

    const oppLabel = document.getElementById('ziga-opp-label');
    const oppDeadCount = document.getElementById('ziga-opp-dead-count');
    const oppPiecesContainer = document.getElementById('ziga-opp-pieces');

    const selfLabel = document.getElementById('ziga-self-label');
    const selfDeadCount = document.getElementById('ziga-self-dead-count');
    const selfPiecesContainer = document.getElementById('ziga-self-pieces');

    const statOppName = document.getElementById('ziga-stat-opp-name');
    const statOppVal = document.getElementById('ziga-stat-opp-val');
    const statSelfName = document.getElementById('ziga-stat-self-name');
    const statSelfVal = document.getElementById('ziga-stat-self-val');

    if (!data) {
      if (lastStateHash !== 'waiting') {
        lastStateHash = 'waiting';
        statusDot.className = 'ziga-mod-dot waiting';
        statusText.textContent = 'Chờ vào ván cờ...';
        materialWrapper.style.display = 'none';
        oppDeadCount.textContent = '0/16';
        selfDeadCount.textContent = '0/16';
        oppPiecesContainer.innerHTML = '<div class="ziga-empty-note">Chờ bắt đầu ván đấu...</div>';
        selfPiecesContainer.innerHTML = '<div class="ziga-empty-note">Chờ bắt đầu ván đấu...</div>';
        statOppVal.textContent = '-';
        statSelfVal.textContent = '-';
        clearCaptureHighlights(null);
      }
      return;
    }

    // Attach click listener if not attached yet
    attachCanvasClickListener();

    // Check if board positions changed (a move was played) -> clear stale highlight
    const positionsHash = data.gameLayer.V.map(p => `${p.fa},${p.rowIndex},${p.pa ? 1 : 0}`).join('|');
    if (lastBoardPositionsHash && positionsHash !== lastBoardPositionsHash) {
      // Board changed, refresh highlights if a piece was selected
      if (selectedPieceIndex >= 0) {
        selectPieceAndHighlight(data.gameLayer, selectedPieceIndex);
      }
    }
    lastBoardPositionsHash = positionsHash;

    // State hash check to avoid redundant DOM re-rendering
    const currentHash = `${data.myColor}_${data.deadMyPieces.length}_${data.deadOppPieces.length}_${data.deadMyPieces.map(p => p.index).join(',')}_${data.deadOppPieces.map(p => p.index).join(',')}`;
    if (currentHash === lastStateHash) {
      return;
    }
    lastStateHash = currentHash;

    // In game
    statusDot.className = 'ziga-mod-dot active';
    statusText.textContent = data.isSpectator ? `Đang xem ván (${data.myName} vs ${data.oppName})` : `Trận đấu: Bạn vs ${data.oppName}`;

    // Color indicators
    const oppColorName = data.oppColor === 0 ? 'Đỏ 🔴' : 'Đen ⚫';
    const selfColorName = data.myColor === 0 ? 'Đỏ 🔴' : 'Đen ⚫';

    oppLabel.textContent = `${oppColorName} ${data.oppName} ĐÃ MẤT`;
    oppDeadCount.textContent = `${data.deadOppPieces.length}/16`;

    selfLabel.textContent = `${selfColorName} ${data.myName} ĐÃ MẤT`;
    selfDeadCount.textContent = `${data.deadMyPieces.length}/16`;

    // Render piece grids
    oppPiecesContainer.innerHTML = renderPieceList(data.deadOppPieces, data.oppColor);
    selfPiecesContainer.innerHTML = renderPieceList(data.deadMyPieces, data.myColor);

    // Compute material advantage
    const mat = computeMaterialScore(data.aliveMyPieces, data.aliveOppPieces);
    materialWrapper.style.display = 'flex';
    if (mat.diff > 0) {
      materialScore.className = 'ziga-material-val advantage-positive';
      materialScore.textContent = `+${mat.diff} điểm (Bạn ưu thế)`;
    } else if (mat.diff < 0) {
      materialScore.className = 'ziga-material-val advantage-negative';
      materialScore.textContent = `${mat.diff} điểm (Đối thủ ưu thế)`;
    } else {
      materialScore.className = 'ziga-material-val';
      materialScore.textContent = 'Cân bằng lực lượng';
    }

    // Key remaining pieces summary
    statOppName.textContent = `${data.oppName.slice(0, 10)}`;
    statOppVal.textContent = countKeyPieces(data.aliveOppPieces);
    statSelfName.textContent = `${data.myName.slice(0, 10)}`;
    statSelfVal.textContent = countKeyPieces(data.aliveMyPieces);
  }

  // Start polling loop (every 300ms)
  setInterval(updateMod, 300);

  // Initial trigger
  window.addEventListener('load', () => {
    setTimeout(updateMod, 1000);
  });
})();
