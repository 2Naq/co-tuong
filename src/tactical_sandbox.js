// src/tactical_sandbox.js - Tactical simulation board with free 2-side movement, undo history & real-match timer alerts
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Tactical Sandbox module initializing...');

  let modalEl = null;
  let isOpen = false;
  let watcherTimer = null;

  // Sandbox state
  let initialPiecesSnapshot = [];
  let currentPieces = []; // 32 pieces with current simulated pos & dead state
  let selectedPiece = null;
  let legalDestinations = [];
  let moveHistory = []; // stack of { pieceIndex, fromCol, fromRow, toCol, toRow, capturedPiece, turnColor }
  let currentTurn = 0; // 0: Red, 1: Black
  let freeMoveMode = false; // true: bypass Xiangqi movement rules
  let boardOrientation = 0; // 0: Red at bottom, 1: Black at bottom

  // Persistent Real Match Tracking & Countdown (runs continuously across modal open/close)
  let realMatchCurrentTurn = -1;
  let realMatchTurnStartTime = Date.now();
  let realMatchTotalDuration = 60;
  let realMatchLiveSeconds = null;
  let realMatchLiveProgressPct = null;
  let realMatchTotalTimeStr = null;
  let lastLiveSyncTime = 0;
  let userDismissedAlertThisTurn = false;
  let hasAlertedForTurn = false;

  // ==========================================
  // Web Audio Synthesizer (Zero External Files)
  // ==========================================
  let audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'move') {
        osc.frequency.setValueAtTime(480, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'capture') {
        osc.frequency.setValueAtTime(260, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);

        setTimeout(() => {
          if (!audioCtx) return;
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          const t2 = audioCtx.currentTime;
          osc2.frequency.setValueAtTime(1100, t2);
          gain2.gain.setValueAtTime(0.28, t2);
          gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.15);
          osc2.start(t2);
          osc2.stop(t2 + 0.15);
        }, 160);
      }
    } catch (e) { }
  }

  // ==========================================
  // Xiangqi Legal Movement Rules Engine
  // ==========================================
  function buildBoardGrid(pieces) {
    const grid = Array.from({ length: 9 }, () => Array(10).fill(null));
    pieces.forEach(p => {
      if (!p.dead && p.col >= 0 && p.col <= 8 && p.row >= 0 && p.row <= 9) {
        grid[p.col][p.row] = p;
      }
    });
    return grid;
  }

  function getLegalMoves(piece, grid) {
    if (freeMoveMode) {
      // In Free Move mode: can move to any square on board except friendly occupied
      const moves = [];
      for (let c = 0; c < 9; c++) {
        for (let r = 0; r < 10; r++) {
          if (c === piece.col && r === piece.row) continue;
          const target = grid[c][r];
          if (!target || target.color !== piece.color) {
            moves.push({ col: c, row: r, capture: !!target });
          }
        }
      }
      return moves;
    }

    const moves = [];
    const c = piece.col;
    const r = piece.row;
    const color = piece.color;
    const type = piece.type; // 0: Tg, 1: S, 2: T, 3: X, 4: P, 5: M, 6: B

    function canLand(col, row) {
      if (col < 0 || col > 8 || row < 0 || row > 9) return false;
      const target = grid[col][row];
      if (!target) return true;
      return target.color !== color;
    }

    // 0: Tướng (General) - 1 step in Palace
    if (type === 0) {
      const palaceRows = color === 0 ? [0, 1, 2] : [7, 8, 9];
      const deltas = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      deltas.forEach(([dc, dr]) => {
        const tc = c + dc;
        const tr = r + dr;
        if (tc >= 3 && tc <= 5 && palaceRows.includes(tr) && canLand(tc, tr)) {
          moves.push({ col: tc, row: tr, capture: !!grid[tc][tr] });
        }
      });
      // Flying General check
      const oppKing = currentPieces.find(p => !p.dead && p.type === 0 && p.color !== color);
      if (oppKing && oppKing.col === c) {
        let hasObstacle = false;
        const minR = Math.min(r, oppKing.row);
        const maxR = Math.max(r, oppKing.row);
        for (let rowBetween = minR + 1; rowBetween < maxR; rowBetween++) {
          if (grid[c][rowBetween]) {
            hasObstacle = true;
            break;
          }
        }
        if (!hasObstacle) {
          moves.push({ col: oppKing.col, row: oppKing.row, capture: true });
        }
      }
    }

    // 1: Sĩ (Advisor) - 1 diagonal step in Palace
    else if (type === 1) {
      const palaceRows = color === 0 ? [0, 1, 2] : [7, 8, 9];
      const deltas = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      deltas.forEach(([dc, dr]) => {
        const tc = c + dc;
        const tr = r + dr;
        if (tc >= 3 && tc <= 5 && palaceRows.includes(tr) && canLand(tc, tr)) {
          moves.push({ col: tc, row: tr, capture: !!grid[tc][tr] });
        }
      });
    }

    // 2: Tượng (Elephant) - 2 diagonal steps, blocked by eye, cannot cross river
    else if (type === 2) {
      const deltas = [
        [2, 2, 1, 1],
        [2, -2, 1, -1],
        [-2, 2, -1, 1],
        [-2, -2, -1, -1]
      ];
      deltas.forEach(([dc, dr, eyeDc, eyeDr]) => {
        const tc = c + dc;
        const tr = r + dr;
        const eyeC = c + eyeDc;
        const eyeR = r + eyeDr;
        const riverOk = color === 0 ? tr <= 4 : tr >= 5;
        if (tc >= 0 && tc <= 8 && tr >= 0 && tr <= 9 && riverOk) {
          if (!grid[eyeC][eyeR] && canLand(tc, tr)) {
            moves.push({ col: tc, row: tr, capture: !!grid[tc][tr] });
          }
        }
      });
    }

    // 3: Xe (Rook) - Slides orthogonally
    else if (type === 3) {
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      dirs.forEach(([dc, dr]) => {
        let tc = c + dc;
        let tr = r + dr;
        while (tc >= 0 && tc <= 8 && tr >= 0 && tr <= 9) {
          const target = grid[tc][tr];
          if (!target) {
            moves.push({ col: tc, row: tr, capture: false });
          } else {
            if (target.color !== color) {
              moves.push({ col: tc, row: tr, capture: true });
            }
            break;
          }
          tc += dc;
          tr += dr;
        }
      });
    }

    // 4: Pháo (Cannon) - Slides, captures by jumping exactly 1 piece
    else if (type === 4) {
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      dirs.forEach(([dc, dr]) => {
        let tc = c + dc;
        let tr = r + dr;
        let screenFound = false;

        while (tc >= 0 && tc <= 8 && tr >= 0 && tr <= 9) {
          const target = grid[tc][tr];
          if (!screenFound) {
            if (!target) {
              moves.push({ col: tc, row: tr, capture: false });
            } else {
              screenFound = true;
            }
          } else {
            if (target) {
              if (target.color !== color) {
                moves.push({ col: tc, row: tr, capture: true });
              }
              break;
            }
          }
          tc += dc;
          tr += dr;
        }
      });
    }

    // 5: Mã (Horse) - "L" steps, blocked by leg
    else if (type === 5) {
      const horseMoves = [
        [2, 1, 1, 0],
        [2, -1, 1, 0],
        [-2, 1, -1, 0],
        [-2, -1, -1, 0],
        [1, 2, 0, 1],
        [-1, 2, 0, 1],
        [1, -2, 0, -1],
        [-1, -2, 0, -1]
      ];
      horseMoves.forEach(([dc, dr, legDc, legDr]) => {
        const tc = c + dc;
        const tr = r + dr;
        const legC = c + legDc;
        const legR = r + legDr;
        if (tc >= 0 && tc <= 8 && tr >= 0 && tr <= 9) {
          if (!grid[legC][legR] && canLand(tc, tr)) {
            moves.push({ col: tc, row: tr, capture: !!grid[tc][tr] });
          }
        }
      });
    }

    // 6: Tốt (Pawn) - 1 step forward, sideways after river
    else if (type === 6) {
      const forward = color === 0 ? 1 : -1;
      const isCrossRiver = color === 0 ? r >= 5 : r <= 4;

      // Always forward
      const fRow = r + forward;
      if (canLand(c, fRow)) {
        moves.push({ col: c, row: fRow, capture: !!grid[c][fRow] });
      }

      // Sideways after river
      if (isCrossRiver) {
        if (canLand(c - 1, r)) moves.push({ col: c - 1, row: r, capture: !!grid[c - 1][r] });
        if (canLand(c + 1, r)) moves.push({ col: c + 1, row: r, capture: !!grid[c + 1][r] });
      }
    }

    return moves;
  }

  // ==========================================
  // Board Snapshot & Clone
  // ==========================================
  function createSnapshot() {
    const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;
    if (!data || !data.gameLayer || !data.gameLayer.V) {
      console.warn('[AN Mod] createSnapshot: No active game layer or pieces array');
      return null;
    }

    boardOrientation = (data.myColor !== undefined && data.myColor >= 0) ? data.myColor : 0;
    currentTurn = data.gameLayer.Yc !== undefined ? data.gameLayer.Yc : (data.myColor || 0);

    const pieces = [];
    for (let i = 0; i < 32; i++) {
      const p = data.gameLayer.V[i];
      if (p) {
        const pType = (p.Ga !== undefined) ? p.Ga : 6;
        const pColor = (p.ka !== undefined) ? p.ka : (i < 16 ? 0 : 1);
        const pCol = (p.fa !== undefined) ? p.fa : 0;
        const pRow = (p.rowIndex !== undefined) ? p.rowIndex : 0;
        const pDead = !!p.pa;

        pieces.push({
          index: i,
          type: pType,
          color: pColor,
          col: pCol,
          row: pRow,
          dead: pDead,
          name: (ZigaMod.PIECE_DEFS && ZigaMod.PIECE_DEFS[pType]) ? ZigaMod.PIECE_DEFS[pType].name : 'Quân',
          char: (ZigaMod.getPieceChar) ? ZigaMod.getPieceChar(pType, pColor) : '?'
        });
      }
    }

    return {
      pieces: JSON.parse(JSON.stringify(pieces)),
      myColor: data.myColor,
      oppColor: data.oppColor,
      oppName: data.oppName,
      myName: data.myName,
      currentTurn: currentTurn,
      boardOrientation: boardOrientation
    };
  }

  // ==========================================
  // DOM Creation & Event Handling
  // ==========================================
  function ensureSandboxDom() {
    if (!document.body) return null;

    if (modalEl && document.body.contains(modalEl)) {
      return modalEl;
    }

    const existing = document.getElementById('ziga-sandbox-modal');
    if (existing) {
      modalEl = existing;
      return modalEl;
    }

    modalEl = document.createElement('div');
    modalEl.id = 'ziga-sandbox-modal';
    modalEl.className = 'ziga-sandbox-overlay hidden';
    modalEl.style.setProperty('display', 'none', 'important');

    const logoUrl = (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.zigaLogoUrl) || '';

    modalEl.innerHTML = `
      <div class="ziga-sb-card" id="ziga-sb-card">

        <!-- Left Flank Alert (Bên hông trái bàn cờ duy nhất) -->
        <div class="ziga-sb-flank ziga-sb-flank-left state-opp-turn" id="ziga-sb-flank-left">
          <div class="ziga-sb-flank-header">
            <span class="ziga-sb-flank-icon" id="ziga-sb-flank-l-icon">⏳</span>
            <span class="ziga-sb-flank-tag" id="ziga-sb-flank-l-tag">Ván đấu</span>
          </div>
          <div class="ziga-sb-flank-title" id="ziga-sb-flank-l-title">Chờ đối thủ đi...</div>
          <div class="ziga-sb-flank-desc" id="ziga-sb-flank-l-desc">Đối thủ đang vắt óc suy nghĩ nước đi tiếp theo</div>

          <!-- 1. Thời gian nước đi (Đồng bộ theo Vòng Xanh trên Avatar) -->
          <div class="ziga-sb-time-block turn-block" id="ziga-sb-flank-turn-block" title="Thời gian của lượt đi hiện tại (theo vòng tròn màu xanh trên avatar)">
            <div class="ziga-sb-time-head">
              <span class="ziga-sb-time-badge turn-badge" id="ziga-sb-turn-badge">🟢 LƯỢT ĐI (VÒNG XANH)</span>
            </div>
            <div class="ziga-sb-time-display">
              <span class="ziga-sb-time-num" id="ziga-sb-flank-l-time">--:--</span>
            </div>
            <div class="ziga-sb-progress-track" title="Thanh tiến trình đồng bộ vòng tròn xanh">
              <div class="ziga-sb-progress-bar" id="ziga-sb-flank-l-progress" style="width: 100%;"></div>
            </div>
          </div>

          <!-- 2. Tổng thời gian ván đấu (Đồng hồ tổng ván cờ) -->
          <div class="ziga-sb-time-block total-block" id="ziga-sb-flank-total-block" title="Tổng thời gian còn lại của cả ván đấu">
            <div class="ziga-sb-time-head">
              <span class="ziga-sb-time-badge total-badge">⏳ TỔNG VÁN (ĐỒNG HỒ)</span>
            </div>
            <div class="ziga-sb-time-display total">
              <span class="ziga-sb-total-num" id="ziga-sb-flank-l-total-time">--:--</span>
            </div>
          </div>

          <button class="ziga-sb-flank-jump-btn calm" id="ziga-sb-flank-jump" title="Quay lại trận đấu thật ngay lập tức">
            <span id="ziga-sb-flank-jump-text">QUAY LẠI VÁN ĐẤU</span>
          </button>
          <button class="ziga-sb-flank-dismiss-btn" id="ziga-sb-flank-dismiss" style="display:none;" title="Tắt cảnh báo nhấp nháy lượt này">
            <span>✕ Tắt nháy lượt này</span>
          </button>
        </div>

        <!-- Header -->
        <div class="ziga-sb-header" id="ziga-sb-drag-handle">
          <div class="ziga-sb-title-group">
            <span class="ziga-sb-logo-icon">
              <img src="${logoUrl}" class="ziga-sb-logo-img" alt="Logo" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline-block';" />
              <svg class="ziga-sb-logo-svg-fallback" viewBox="0 0 512 512" width="22" height="22" style="display:none; border-radius: 4px; vertical-align: middle; box-shadow: 0 0 6px rgba(212, 175, 55, 0.4); border: 1px solid rgba(212, 175, 55, 0.5);">
                <rect width="512" height="512" rx="64" fill="#000000"></rect>
                <path d="M118.141 347H76.9482L139.714 165.182H189.253L251.93 347H210.737L165.194 206.73H163.773L118.141 347ZM115.567 275.533H212.868V305.54H115.567V275.533ZM425.892 165.182V347H392.689L313.587 232.565H312.255V347H273.814V165.182H307.55L386.03 279.528H387.628V165.182H425.892Z" fill="#ffffff"></path>
              </svg>
            </span>
            <div class="ziga-sb-titles">
              <span class="ziga-sb-title">MÔ PHỎNG CHIẾN THUẬT (SANDBOX)</span>
              <span class="ziga-sb-subtitle">Tự do đi thử cả 2 phe Đỏ & Đen để tính nước</span>
            </div>
          </div>
          <div class="ziga-sb-header-meta">
            <button class="ziga-sb-btn-close" id="ziga-sb-btn-close" title="Đóng & quay lại trận đấu">✕</button>
          </div>
        </div>

        <!-- Subheader Controls -->
        <div class="ziga-sb-subbar">
          <div class="ziga-sb-turn-toggle-wrap">
            <span class="ziga-sb-subbar-label">LƯỢT ĐI:</span>
            <button class="ziga-sb-turn-btn" id="ziga-sb-turn-btn" title="Bấm để đổi phe đi cờ">
              <span class="ziga-sb-turn-dot red" id="ziga-sb-turn-dot"></span>
              <span id="ziga-sb-turn-text">Phe Đỏ</span>
            </button>
          </div>

          <div class="ziga-sb-mode-toggle">
            <label class="ziga-sb-checkbox-label" title="Bật để cho phép di chuyển quân tự do không bị giới hạn bởi luật cờ">
              <input type="checkbox" id="ziga-sb-free-mode-check" />
              <span>Đi tự do</span>
            </label>
          </div>

          <div class="ziga-sb-history-count" id="ziga-sb-move-counter">
            Đã thử: <strong>0</strong> nước
          </div>
        </div>

        <!-- Board Area -->
        <div class="ziga-sb-board-container" id="ziga-sb-board-area">
          <div class="ziga-sb-board-bg" id="ziga-sb-board-bg">
            <!-- Authentic Xiangqi lines & River -->
            <svg class="ziga-sb-svg-grid" viewBox="0 0 400 450" preserveAspectRatio="none">
              <!-- Border -->
              <rect x="20" y="20" width="360" height="410" fill="none" stroke="#b08a55" stroke-width="2.5"></rect>
              <rect x="25" y="25" width="350" height="400" fill="none" stroke="#8c6239" stroke-width="1.2"></rect>

              <!-- Horizontal Grid Lines (10 lines) -->
              <line x1="25" y1="25" x2="375" y2="25" stroke="#8c6239" stroke-width="1"></line>
              <line x1="25" y1="69.4" x2="375" y2="69.4" stroke="#8c6239" stroke-width="1"></line>
              <line x1="25" y1="113.8" x2="375" y2="113.8" stroke="#8c6239" stroke-width="1"></line>
              <line x1="25" y1="158.2" x2="375" y2="158.2" stroke="#8c6239" stroke-width="1"></line>
              <line x1="25" y1="202.6" x2="375" y2="202.6" stroke="#8c6239" stroke-width="1"></line>
              <line x1="25" y1="247.4" x2="375" y2="247.4" stroke="#8c6239" stroke-width="1"></line>
              <line x1="25" y1="291.8" x2="375" y2="291.8" stroke="#8c6239" stroke-width="1"></line>
              <line x1="25" y1="336.2" x2="375" y2="336.2" stroke="#8c6239" stroke-width="1"></line>
              <line x1="25" y1="380.6" x2="375" y2="380.6" stroke="#8c6239" stroke-width="1"></line>
              <line x1="25" y1="425" x2="375" y2="425" stroke="#8c6239" stroke-width="1"></line>

              <!-- Vertical Lines (Top & Bottom halves separated by river) -->
              <line x1="25" y1="25" x2="25" y2="425" stroke="#8c6239" stroke-width="1"></line>
              <line x1="68.75" y1="25" x2="68.75" y2="202.6" stroke="#8c6239" stroke-width="1"></line>
              <line x1="68.75" y1="247.4" x2="68.75" y2="425" stroke="#8c6239" stroke-width="1"></line>
              <line x1="112.5" y1="25" x2="112.5" y2="202.6" stroke="#8c6239" stroke-width="1"></line>
              <line x1="112.5" y1="247.4" x2="112.5" y2="425" stroke="#8c6239" stroke-width="1"></line>
              <line x1="156.25" y1="25" x2="156.25" y2="202.6" stroke="#8c6239" stroke-width="1"></line>
              <line x1="156.25" y1="247.4" x2="156.25" y2="425" stroke="#8c6239" stroke-width="1"></line>
              <line x1="200" y1="25" x2="200" y2="202.6" stroke="#8c6239" stroke-width="1"></line>
              <line x1="200" y1="247.4" x2="200" y2="425" stroke="#8c6239" stroke-width="1"></line>
              <line x1="243.75" y1="25" x2="243.75" y2="202.6" stroke="#8c6239" stroke-width="1"></line>
              <line x1="243.75" y1="247.4" x2="243.75" y2="425" stroke="#8c6239" stroke-width="1"></line>
              <line x1="287.5" y1="25" x2="287.5" y2="202.6" stroke="#8c6239" stroke-width="1"></line>
              <line x1="287.5" y1="247.4" x2="287.5" y2="425" stroke="#8c6239" stroke-width="1"></line>
              <line x1="331.25" y1="25" x2="331.25" y2="202.6" stroke="#8c6239" stroke-width="1"></line>
              <line x1="331.25" y1="247.4" x2="331.25" y2="425" stroke="#8c6239" stroke-width="1"></line>
              <line x1="375" y1="25" x2="375" y2="425" stroke="#8c6239" stroke-width="1"></line>

              <!-- Palaces (Diagonal Crosses) -->
              <!-- Top Palace -->
              <line x1="156.25" y1="25" x2="243.75" y2="113.8" stroke="#8c6239" stroke-width="1"></line>
              <line x1="243.75" y1="25" x2="156.25" y2="113.8" stroke="#8c6239" stroke-width="1"></line>
              <!-- Bottom Palace -->
              <line x1="156.25" y1="336.2" x2="243.75" y2="425" stroke="#8c6239" stroke-width="1"></line>
              <line x1="243.75" y1="336.2" x2="156.25" y2="425" stroke="#8c6239" stroke-width="1"></line>

              <!-- River Text -->
              <text x="100" y="230" font-family="'KaiTi', serif" font-size="16" fill="#8c6239" font-weight="bold" opacity="0.8">楚 河</text>
              <text x="260" y="230" font-family="'KaiTi', serif" font-size="16" fill="#8c6239" font-weight="bold" opacity="0.8">漢 界</text>
            </svg>

            <!-- Interactive Piece Layer -->
            <div class="ziga-sb-pieces-layer" id="ziga-sb-pieces-layer"></div>
            <!-- Destination Markers Layer -->
            <div class="ziga-sb-dest-layer" id="ziga-sb-dest-layer"></div>
          </div>
        </div>

        <!-- Footer Action Toolbar -->
        <div class="ziga-sb-footer">
          <div class="ziga-sb-footer-left">
            <button class="ziga-sb-btn secondary" id="ziga-sb-btn-undo" title="Lùi lại 1 nước đi vừa thử">
              <span>↩️ Lùi 1 nước</span>
            </button>
            <button class="ziga-sb-btn secondary" id="ziga-sb-btn-reset" title="Đặt lại thế cờ ban đầu như lúc vừa mở mô phỏng">
              <span>🔄 Về ban đầu</span>
            </button>
          </div>
          <div class="ziga-sb-footer-right">
            <button class="ziga-sb-btn primary" id="ziga-sb-btn-exit" title="Quay về tiếp tục thi đấu bàn cờ thật">
              <span>✕ Quay lại ván đấu</span>
            </button>
          </div>
        </div>

      </div>
    `;

    if (document.body && !document.body.contains(modalEl)) {
      document.body.appendChild(modalEl);
    }

    // Wire events with safe null checks
    const btnClose = document.getElementById('ziga-sb-btn-close');
    if (btnClose) btnClose.addEventListener('click', closeTacticalSandbox);

    const btnExit = document.getElementById('ziga-sb-btn-exit');
    if (btnExit) btnExit.addEventListener('click', closeTacticalSandbox);

    const flankJump = document.getElementById('ziga-sb-flank-jump');
    if (flankJump) flankJump.addEventListener('click', closeTacticalSandbox);

    const flankDismiss = document.getElementById('ziga-sb-flank-dismiss');
    if (flankDismiss) {
      flankDismiss.addEventListener('click', (e) => {
        e.stopPropagation();
        userDismissedAlertThisTurn = true;
        const flankL = document.getElementById('ziga-sb-flank-left');
        const boardArea = document.getElementById('ziga-sb-board-area');
        if (flankL) flankL.classList.remove('urgent');
        if (boardArea) boardArea.classList.remove('flank-alert-active');
        flankDismiss.style.display = 'none';
      });
    }

    const btnUndo = document.getElementById('ziga-sb-btn-undo');
    if (btnUndo) btnUndo.addEventListener('click', undoMove);

    const btnReset = document.getElementById('ziga-sb-btn-reset');
    if (btnReset) btnReset.addEventListener('click', resetBoard);

    const turnBtn = document.getElementById('ziga-sb-turn-btn');
    if (turnBtn) {
      turnBtn.addEventListener('click', () => {
        currentTurn = 1 - currentTurn;
        selectedPiece = null;
        legalDestinations = [];
        updateTurnIndicator();
        renderBoard();
      });
    }

    const freeCheck = document.getElementById('ziga-sb-free-mode-check');
    if (freeCheck) {
      freeCheck.addEventListener('change', (e) => {
        freeMoveMode = e.target.checked;
        if (selectedPiece) {
          const grid = buildBoardGrid(currentPieces);
          legalDestinations = getLegalMoves(selectedPiece, grid);
          renderDestinations();
        }
      });
    }

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeTacticalSandbox();
      }
    });

    // Make modal draggable by header
    setupModalDrag();

    return modalEl;
  }

  function setupModalDrag() {
    const handle = document.getElementById('ziga-sb-drag-handle');
    const card = document.getElementById('ziga-sb-card');
    if (!handle || !card) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = card.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;
      card.style.position = 'fixed';
      card.style.margin = '0';
      card.style.left = origLeft + 'px';
      card.style.top = origTop + 'px';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      card.style.left = Math.max(10, Math.min(window.innerWidth - card.offsetWidth - 10, origLeft + dx)) + 'px';
      card.style.top = Math.max(10, Math.min(window.innerHeight - card.offsetHeight - 10, origTop + dy)) + 'px';
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // ==========================================
  // Coordinate Calculation (Grid to Percentages)
  // ==========================================
  // Board SVG viewBox is 400x450
  // Columns 0-8: x ranges from 25px (6.25%) to 375px (93.75%) -> step = 43.75px (10.9375%)
  // Rows 0-9: y ranges from 25px (5.55%) to 425px (94.44%) -> step = 44.44px (9.876%)
  function getSquarePosPercent(col, row) {
    let displayCol = col;
    let displayRow = row;

    if (boardOrientation === 0) {
      // Red at bottom: row 0 is bottom (y = 425px), row 9 is top (y = 25px)
      displayRow = 9 - row;
    } else {
      // Black at bottom: row 9 is bottom, row 0 is top
      displayRow = row;
      displayCol = 8 - col;
    }

    const leftPct = (25 + displayCol * 43.75) / 400 * 100;
    const topPct = (25 + displayRow * 44.44) / 450 * 100;
    return { leftPct, topPct };
  }

  // ==========================================
  // Board Rendering
  // ==========================================
  function renderBoard() {
    const piecesLayer = document.getElementById('ziga-sb-pieces-layer');
    if (!piecesLayer) return;

    piecesLayer.innerHTML = '';

    currentPieces.forEach(p => {
      if (p.dead) return;

      const { leftPct, topPct } = getSquarePosPercent(p.col, p.row);
      const isSelected = selectedPiece && selectedPiece.index === p.index;
      const isCapturableTarget = selectedPiece && legalDestinations.some(d => d.col === p.col && d.row === p.row && d.capture);
      const isTurnPiece = freeMoveMode || (p.color === currentTurn);

      const pieceEl = document.createElement('div');
      pieceEl.className = `ziga-sb-piece ${p.color === 0 ? 'red-piece' : 'black-piece'} ${isSelected ? 'selected' : ''} ${isTurnPiece ? 'active-turn' : 'inactive-turn'} ${isCapturableTarget ? 'capturable' : ''}`;
      pieceEl.style.left = leftPct + '%';
      pieceEl.style.top = topPct + '%';
      pieceEl.title = `${p.color === 0 ? 'Phe Đỏ' : 'Phe Đen'}: ${p.name}${!isTurnPiece && !freeMoveMode ? ' (Chờ đến lượt)' : ''}`;

      pieceEl.innerHTML = `
        <div class="ziga-sb-piece-inner">
          <span class="ziga-sb-piece-char">${p.char}</span>
        </div>
      `;

      pieceEl.addEventListener('click', (e) => {
        e.stopPropagation();
        handlePieceClick(p);
      });

      piecesLayer.appendChild(pieceEl);
    });

    renderDestinations();
    updateSubbarStats();
  }

  function renderDestinations() {
    const destLayer = document.getElementById('ziga-sb-dest-layer');
    if (!destLayer) return;

    destLayer.innerHTML = '';

    if (!selectedPiece || legalDestinations.length === 0) return;

    legalDestinations.forEach(dest => {
      const { leftPct, topPct } = getSquarePosPercent(dest.col, dest.row);

      const marker = document.createElement('div');
      marker.className = `ziga-sb-dest-dot ${dest.capture ? 'capture' : 'move'}`;
      marker.style.left = leftPct + '%';
      marker.style.top = topPct + '%';
      marker.title = dest.capture ? `Ăn quân tại ô (${dest.col}, ${dest.row})` : `Đi đến ô (${dest.col}, ${dest.row})`;

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        executeMove(selectedPiece, dest.col, dest.row);
      });

      destLayer.appendChild(marker);
    });
  }

  function handlePieceClick(p) {
    // If a piece is already selected and we click an enemy target in legalDestinations: execute capture!
    if (selectedPiece && legalDestinations.some(d => d.col === p.col && d.row === p.row && d.capture)) {
      executeMove(selectedPiece, p.col, p.row);
      return;
    }

    // Toggle select if clicked same piece
    if (selectedPiece && selectedPiece.index === p.index) {
      selectedPiece = null;
      legalDestinations = [];
      renderBoard();
      return;
    }

    // RULE ENFORCEMENT: Only the side whose turn it is can select pieces to move!
    if (!freeMoveMode && p.color !== currentTurn) {
      return;
    }

    // Select piece
    selectedPiece = p;
    const grid = buildBoardGrid(currentPieces);
    legalDestinations = getLegalMoves(p, grid);
    renderBoard();
  }

  function executeMove(piece, toCol, toRow) {
    const destPiece = currentPieces.find(p => !p.dead && p.col === toCol && p.row === toRow);

    // Save to history with pieceColor tracking
    moveHistory.push({
      pieceIndex: piece.index,
      fromCol: piece.col,
      fromRow: piece.row,
      toCol: toCol,
      toRow: toRow,
      pieceColor: piece.color,
      capturedPiece: destPiece ? { ...destPiece } : null,
      previousTurn: currentTurn
    });

    // Execute capture
    if (destPiece) {
      destPiece.dead = true;
      playSound('capture');
    } else {
      playSound('move');
    }

    // Move piece
    piece.col = toCol;
    piece.row = toRow;

    // Switch turn
    currentTurn = 1 - piece.color;
    updateTurnIndicator();

    // Clear selection
    selectedPiece = null;
    legalDestinations = [];

    renderBoard();
  }

  function undoMove() {
    if (moveHistory.length === 0) return;

    const last = moveHistory.pop();
    const piece = currentPieces.find(p => p.index === last.pieceIndex);
    if (piece) {
      piece.col = last.fromCol;
      piece.row = last.fromRow;
    }

    // Restore captured piece if any
    if (last.capturedPiece) {
      const captured = currentPieces.find(p => p.index === last.capturedPiece.index);
      if (captured) {
        captured.dead = false;
        captured.col = last.capturedPiece.col;
        captured.row = last.capturedPiece.row;
      }
    }

    currentTurn = last.previousTurn;
    updateTurnIndicator();

    selectedPiece = null;
    legalDestinations = [];

    playSound('move');
    renderBoard();
  }

  function resetBoard() {
    if (!initialPiecesSnapshot || initialPiecesSnapshot.length === 0) return;

    currentPieces = JSON.parse(JSON.stringify(initialPiecesSnapshot));
    moveHistory = [];
    selectedPiece = null;
    legalDestinations = [];

    updateTurnIndicator();
    playSound('move');
    renderBoard();
  }

  function updateTurnIndicator() {
    const dot = document.getElementById('ziga-sb-turn-dot');
    const txt = document.getElementById('ziga-sb-turn-text');
    if (!dot || !txt) return;

    if (currentTurn === 0) {
      dot.className = 'ziga-sb-turn-dot red';
      txt.textContent = 'Phe Đỏ';
    } else {
      dot.className = 'ziga-sb-turn-dot black';
      txt.textContent = 'Phe Đen';
    }
  }

  function updateSubbarStats() {
    const counter = document.getElementById('ziga-sb-move-counter');
    const undoBtn = document.getElementById('ziga-sb-btn-undo');
    if (counter) {
      const redMoves = moveHistory.filter(m => m.pieceColor === 0).length;
      const blackMoves = moveHistory.filter(m => m.pieceColor === 1).length;
      counter.innerHTML = `Đã thử: <span class="ziga-sb-move-tag red" title="Nước đã thử phe Đỏ">🔴 Đỏ: <strong>${redMoves}</strong></span> <span class="ziga-sb-move-tag black" title="Nước đã thử phe Đen">⚫ Đen: <strong>${blackMoves}</strong></span>`;
    }
    if (undoBtn) {
      undoBtn.disabled = moveHistory.length === 0;
      undoBtn.style.opacity = moveHistory.length === 0 ? '0.45' : '1';
      undoBtn.style.cursor = moveHistory.length === 0 ? 'not-allowed' : 'pointer';
    }
  }

  // ==========================================
  // Real Match Watcher & Countdown Timer Alert
  // ==========================================
  // ==========================================
  // Real Match Watcher & Continuous Turn Timer
  // ==========================================
  function detectTurnDuration(data) {
    if (!data || !data.gameLayer) return 60;
    const gl = data.gameLayer;

    // Check table from gameLayer.T()
    try {
      const table = (gl.T && typeof gl.T === 'function') ? gl.T() : null;
      if (table) {
        for (const p of ['timePerTurn', 'turnTime', 'timeCountDown', 'countDownTime', 'turnDuration', 'maxTurnTime']) {
          if (typeof table[p] === 'number' && table[p] >= 10 && table[p] <= 300) {
            return table[p];
          }
        }
      }
    } catch (e) { }

    // Check LogicManager
    try {
      const logicMgr = window.BkLogicManager ? window.BkLogicManager.na() : null;
      if (logicMgr) {
        const table = logicMgr.curTable || logicMgr.tableData || logicMgr.oa;
        if (table) {
          for (const p of ['timePerTurn', 'turnTime', 'timeCountDown', 'countDownTime', 'turnDuration', 'maxTurnTime']) {
            if (typeof table[p] === 'number' && table[p] >= 10 && table[p] <= 300) {
              return table[p];
            }
          }
        }
      }
    } catch (e) { }

    // Direct gameLayer properties
    const props = ['turnTime', 'timePerTurn', 'timeCountDown', 'countDownTime', 'maxTurnTime', 'turnDuration', 'timeOut'];
    for (const p of props) {
      if (typeof gl[p] === 'number' && gl[p] >= 10 && gl[p] <= 300) {
        return gl[p];
      }
    }

    // Player node properties
    const pNode = (data.myColor === 0) ? gl.gc : gl.dc;
    if (pNode) {
      for (const p of ['turnTime', 'maxTurnTime', 'timePerTurn']) {
        if (typeof pNode[p] === 'number' && pNode[p] >= 10 && pNode[p] <= 300) {
          return pNode[p];
        }
      }
      if (pNode.Z) {
        for (const p of ['turnTime', 'maxTurnTime', 'timePerTurn']) {
          if (typeof pNode.Z[p] === 'number' && pNode.Z[p] >= 10 && pNode.Z[p] <= 300) {
            return pNode.Z[p];
          }
        }
      }
    }

    return 60;
  }

  // 1. Dedicated Extractor for Green Radial Progress Ring (cc.ProgressTimer around avatar)
  function findGreenProgressTimer(gl, targetColor) {
    if (!gl) return null;
    const pNode = (targetColor === 0) ? gl.gc : gl.dc;
    if (!pNode) return null;

    function searchProgress(node, depth) {
      if (!node || depth < 0) return null;

      // Direct getPercentage() check (standard Cocos2d cc.ProgressTimer)
      try {
        if (typeof node.getPercentage === 'function') {
          const p = node.getPercentage();
          if (typeof p === 'number' && !isNaN(p) && p >= 0 && p <= 100) {
            return p;
          }
        }
      } catch (e) { }

      // Direct percentage properties
      for (const prop of ['_percentage', 'percentage', '_percent', 'percent']) {
        if (typeof node[prop] === 'number' && !isNaN(node[prop]) && node[prop] >= 0 && node[prop] <= 100) {
          return node[prop];
        }
      }

      // Cocos2d ProgressTimer distinctive signatures (midPoint / barChangeRate)
      if (node.midPoint && (node.barChangeRate || typeof node.getType === 'function')) {
        const p = (typeof node._percentage === 'number') ? node._percentage : node.percentage;
        if (typeof p === 'number' && !isNaN(p) && p >= 0 && p <= 100) return p;
      }

      // Check known member variables on node
      for (const k of ['progressTimer', 'progress', 'timer', 'cdTimer', 'cd', 'avatarTimer', 'circleProgress', 'timePrg', 'remainTimer', 'prgTimer']) {
        if (node[k]) {
          const res = searchProgress(node[k], depth - 1);
          if (res !== null) return res;
        }
      }

      // Recursively search children
      if (node.getChildren && typeof node.getChildren === 'function') {
        try {
          const children = node.getChildren();
          if (children && children.length) {
            for (let i = 0; i < children.length; i++) {
              const res = searchProgress(children[i], depth - 1);
              if (res !== null) return res;
            }
          }
        } catch (e) { }
      }
      return null;
    }

    return searchProgress(pNode, 6);
  }

  // 2. Dedicated Extractor for Total Match Clock (e.g. 12:26 under avatar)
  function findTotalMatchTime(gl, targetColor) {
    if (!gl) return null;
    const pNode = (targetColor === 0) ? gl.gc : gl.dc;

    function searchForTimeStr(node, depth) {
      if (!node || depth < 0) return null;
      try {
        if (typeof node.isVisible === 'function' && !node.isVisible()) return null;
      } catch (e) { }

      if (typeof node.getString === 'function') {
        try {
          const str = (node.getString() || '').trim();
          const m = str.match(/(?:^|[^\d])(\d{1,2}:\d{2})(?:[^\d]|$)/);
          if (m) return m[1];
        } catch (e) { }
      }

      for (const prop of ['string', '_string', 'text', '_text']) {
        if (typeof node[prop] === 'string') {
          const m = node[prop].trim().match(/(?:^|[^\d])(\d{1,2}:\d{2})(?:[^\d]|$)/);
          if (m) return m[1];
        }
      }

      if (node.getChildren && typeof node.getChildren === 'function') {
        try {
          const children = node.getChildren();
          if (children && children.length) {
            for (let i = 0; i < children.length; i++) {
              const res = searchForTimeStr(children[i], depth - 1);
              if (res) return res;
            }
          }
        } catch (e) { }
      }
      return null;
    }

    // First search in player node
    if (pNode) {
      const found = searchForTimeStr(pNode, 6);
      if (found) return found;
    }

    // Then search other gameLayer children
    if (gl.getChildren && typeof gl.getChildren === 'function') {
      try {
        const children = gl.getChildren();
        if (children) {
          for (let i = 0; i < children.length; i++) {
            const c = children[i];
            if (c && c !== gl.gc && c !== gl.dc) {
              const found = searchForTimeStr(c, 3);
              if (found) return found;
            }
          }
        }
      } catch (e) { }
    }

    return null;
  }

  function searchCocosNodeForCountdown(node, maxDepth) {
    if (!node || maxDepth < 0) return null;

    try {
      if (typeof node.isVisible === 'function' && !node.isVisible()) {
        return null;
      }
    } catch (e) { }

    // Direct string value check
    if (typeof node.getString === 'function') {
      try {
        const str = (node.getString() || '').trim();
        if (str) {
          const ss = str.match(/^(\d{1,3})s?$/);
          if (ss) {
            const s = parseInt(ss[1], 10);
            if (s >= 0 && s <= 300) return s;
          }
        }
      } catch (e) { }
    }

    // Direct numeric property check
    for (const k of ['remainTime', 'countDown', 'currentTime', 'timeRemain', 'turnRemainTime', 'currentRemainTime', '_remainTime', '_time']) {
      if (typeof node[k] === 'number' && node[k] >= 0 && node[k] <= 300) {
        return Math.round(node[k]);
      }
    }

    // Recursive search on children
    if (node.getChildren && typeof node.getChildren === 'function') {
      try {
        const children = node.getChildren();
        if (children && children.length) {
          for (let i = 0; i < children.length; i++) {
            const found = searchCocosNodeForCountdown(children[i], maxDepth - 1);
            if (found !== null) return found;
          }
        }
      } catch (e) { }
    }

    return null;
  }

  function getLiveCountdown(data, targetColor) {
    if (!data || !data.gameLayer) return null;
    const gl = data.gameLayer;
    const color = (targetColor !== undefined) ? targetColor : data.myColor;
    const pNode = (color === 0) ? gl.gc : gl.dc;

    // 1. Search player node view and data
    if (pNode) {
      const pFound = searchCocosNodeForCountdown(pNode, 4);
      if (pFound !== null) return pFound;

      if (pNode.Z) {
        for (const k of ['remainTime', 'countDown', 'time', 'turnTime', 'timeRemain']) {
          if (typeof pNode.Z[k] === 'number' && pNode.Z[k] >= 0 && pNode.Z[k] <= 300) {
            return Math.round(pNode.Z[k]);
          }
        }
      }
    }

    // 2. Search gameLayer direct properties
    for (const p of ['remainTime', 'countDown', 'currentTime', 'timeRemain', 'turnRemainTime']) {
      if (typeof gl[p] === 'number' && gl[p] >= 0 && gl[p] <= 300) {
        return Math.round(gl[p]);
      }
    }

    // 3. Search table object
    try {
      const table = (gl.T && typeof gl.T === 'function') ? gl.T() : null;
      if (table) {
        for (const p of ['remainTime', 'countDown', 'currentTime', 'timeRemain', 'turnRemainTime']) {
          if (typeof table[p] === 'number' && table[p] >= 0 && table[p] <= 300) {
            return Math.round(table[p]);
          }
        }
      }
    } catch (e) { }

    return null;
  }

  function formatCountdown(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return mm > 0 ? `${mm}:${ss < 10 ? '0' : ''}${ss}` : `${ss}s`;
  }

  function getRemainingTurnData() {
    let remainingSec = 60;
    let progressPct = 100;

    if (realMatchLiveProgressPct !== null && (Date.now() - lastLiveSyncTime) < 2500) {
      const elapsedSinceLive = (Date.now() - lastLiveSyncTime) / 1000;
      const pctDrop = (elapsedSinceLive / realMatchTotalDuration) * 100;
      progressPct = Math.max(0, Math.min(100, realMatchLiveProgressPct - pctDrop));
      remainingSec = Math.max(0, Math.round(realMatchTotalDuration * (progressPct / 100)));
    } else if (realMatchLiveSeconds !== null && (Date.now() - lastLiveSyncTime) < 2500) {
      const elapsedSinceLive = (Date.now() - lastLiveSyncTime) / 1000;
      remainingSec = Math.max(0, Math.ceil(realMatchLiveSeconds - elapsedSinceLive));
      progressPct = Math.max(0, Math.min(100, (remainingSec / realMatchTotalDuration) * 100));
    } else {
      const elapsed = (Date.now() - realMatchTurnStartTime) / 1000;
      remainingSec = Math.max(0, Math.ceil(realMatchTotalDuration - elapsed));
      progressPct = Math.max(0, Math.min(100, (remainingSec / realMatchTotalDuration) * 100));
    }

    return {
      seconds: remainingSec,
      percentage: progressPct
    };
  }

  function updateSandboxFlankUi(data, isMyTurnInReal) {
    const flankL = document.getElementById('ziga-sb-flank-left');
    if (!flankL) return;

    const flankLIcon = document.getElementById('ziga-sb-flank-l-icon');
    const flankLTag = document.getElementById('ziga-sb-flank-l-tag');
    const flankLTitle = document.getElementById('ziga-sb-flank-l-title');
    const flankLDesc = document.getElementById('ziga-sb-flank-l-desc');
    const flankLTime = document.getElementById('ziga-sb-flank-l-time');
    const flankLProgress = document.getElementById('ziga-sb-flank-l-progress');
    const flankLTotalTime = document.getElementById('ziga-sb-flank-l-total-time');
    const flankJumpBtn = document.getElementById('ziga-sb-flank-jump');
    const flankJumpText = document.getElementById('ziga-sb-flank-jump-text');
    const flankDismissBtn = document.getElementById('ziga-sb-flank-dismiss');
    const boardArea = document.getElementById('ziga-sb-board-area');

    const turnData = getRemainingTurnData();
    const remainingSeconds = turnData.seconds;
    const progressPct = turnData.percentage;
    const timeStr = formatCountdown(remainingSeconds);

    if (flankLTime) flankLTime.textContent = timeStr;
    if (flankLProgress) {
      flankLProgress.style.width = Math.max(0, Math.min(100, progressPct)).toFixed(1) + '%';
    }
    if (flankLTotalTime) {
      flankLTotalTime.textContent = realMatchTotalTimeStr || '--:--';
    }

    if (isMyTurnInReal) {
      const isUrgent = remainingSeconds <= 15;

      flankL.className = 'ziga-sb-flank ziga-sb-flank-left state-my-turn' + (isUrgent && !userDismissedAlertThisTurn ? ' urgent' : '');
      if (flankLProgress) {
        if (isUrgent && !userDismissedAlertThisTurn) flankLProgress.classList.add('urgent');
        else flankLProgress.classList.remove('urgent');
      }

      if (flankLIcon) flankLIcon.textContent = isUrgent ? '🚨' : '⚠️';
      if (flankLTag) flankLTag.textContent = 'CẢNH BÁO';
      if (flankLTitle) flankLTitle.textContent = isUrgent ? 'SẮP HẾT GIỜ!' : 'ĐẾN LƯỢT NÍ!';
      if (flankLDesc) flankLDesc.textContent = isUrgent ? 'Mau quay lại đánh ĐI nghĩ chi nhiều!' : 'Đối thủ đã đi xong, đến lượt ní ra đòn!';

      if (flankJumpBtn) flankJumpBtn.className = 'ziga-sb-flank-jump-btn urgent-pulse';
      if (flankJumpText) flankJumpText.textContent = isUrgent ? '⚡ VÀO ĐÁNH NGAY' : 'QUAY LẠI VÁN ĐẤU';
      if (flankDismissBtn) flankDismissBtn.style.display = (isUrgent && !userDismissedAlertThisTurn) ? 'block' : 'none';

      if (boardArea) {
        if (!userDismissedAlertThisTurn) {
          boardArea.classList.add('flank-alert-active');
          boardArea.classList.remove('state-opp-turn');
        } else {
          boardArea.classList.remove('flank-alert-active');
        }
      }

      if (remainingSeconds <= 10 && remainingSeconds % 3 === 0) {
        playSound('alert');
      }

    } else {
      // Opponent's turn
      hasAlertedForTurn = false;

      flankL.className = 'ziga-sb-flank ziga-sb-flank-left state-opp-turn';
      if (flankLProgress) flankLProgress.classList.remove('urgent');
      if (flankLIcon) flankLIcon.textContent = '⏳';
      if (flankLTag) flankLTag.textContent = 'Ván đấu';
      if (flankLTitle) flankLTitle.textContent = 'Chờ đối thủ đi...';
      if (flankLDesc) flankLDesc.textContent = 'Đối thủ đang vắt óc suy nghĩ nước đi tiếp theo';

      if (flankJumpBtn) flankJumpBtn.className = 'ziga-sb-flank-jump-btn calm';
      if (flankJumpText) flankJumpText.textContent = 'QUAY LẠI VÁN ĐẤU';
      if (flankDismissBtn) flankDismissBtn.style.display = 'none';

      if (boardArea) {
        boardArea.classList.remove('flank-alert-active');
        boardArea.classList.add('state-opp-turn');
      }
    }
  }

  function updateRealMatchTracker() {
    const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;
    if (!data || !data.gameLayer) return;

    const realTurnColor = data.gameLayer.Yc;
    const myColor = data.myColor;
    const isMyTurnInReal = (realTurnColor === myColor);

    // 1. Detect turn change on real match board
    if (realMatchCurrentTurn !== -1 && realMatchCurrentTurn !== realTurnColor) {
      realMatchTurnStartTime = Date.now();
      realMatchTotalDuration = detectTurnDuration(data);
      realMatchLiveSeconds = null;
      realMatchLiveProgressPct = null;
      lastLiveSyncTime = 0;
      userDismissedAlertThisTurn = false;

      if (isMyTurnInReal) {
        hasAlertedForTurn = true;
        playSound('alert');
      } else {
        hasAlertedForTurn = false;
      }
    } else if (realMatchCurrentTurn === -1) {
      realMatchTurnStartTime = Date.now();
      realMatchTotalDuration = detectTurnDuration(data);
    }
    realMatchCurrentTurn = realTurnColor;

    // 2. Poll Green Progress Ring (cc.ProgressTimer around avatar)
    const greenPct = findGreenProgressTimer(data.gameLayer, realTurnColor);
    if (greenPct !== null && greenPct >= 0 && greenPct <= 100) {
      realMatchLiveProgressPct = greenPct;
      realMatchLiveSeconds = Math.max(0, Math.round(realMatchTotalDuration * (greenPct / 100)));
      lastLiveSyncTime = Date.now();
    } else {
      // Fallback: search numeric countdown properties
      const liveSec = getLiveCountdown(data, realTurnColor);
      if (liveSec !== null && liveSec >= 0) {
        realMatchLiveSeconds = liveSec;
        realMatchLiveProgressPct = Math.max(0, Math.min(100, (liveSec / realMatchTotalDuration) * 100));
        lastLiveSyncTime = Date.now();
      }
    }

    // 3. Poll Total Match Clock (e.g. 12:26 under avatar)
    const totalClockStr = findTotalMatchTime(data.gameLayer, realTurnColor);
    if (totalClockStr) {
      realMatchTotalTimeStr = totalClockStr;
    }

    // 4. Render Flank UI if modal is open
    if (isOpen) {
      updateSandboxFlankUi(data, isMyTurnInReal);
    }
  }

  // Start continuous tracker immediately in background (persists across modal open/close)
  setInterval(updateRealMatchTracker, 250);

  // ==========================================
  // Public Open & Close API
  // ==========================================
  function openTacticalSandbox() {
    console.log('[AN Mod] openTacticalSandbox invoked');
    const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;
    if (!data || !data.gameLayer || !data.gameLayer.V) {
      alert('Vui lòng vào một ván cờ trên Ziga (hoặc vào xem ván) để bắt đầu mô phỏng thế cờ!');
      return;
    }

    const snapshot = createSnapshot();
    if (!snapshot || !snapshot.pieces || snapshot.pieces.length === 0) {
      alert('Không thể đọc dữ liệu ván cờ để mô phỏng. Vui lòng thử lại!');
      return;
    }

    initialPiecesSnapshot = JSON.parse(JSON.stringify(snapshot.pieces));
    currentPieces = JSON.parse(JSON.stringify(snapshot.pieces));
    moveHistory = [];
    selectedPiece = null;
    legalDestinations = [];
    currentTurn = snapshot.currentTurn;
    boardOrientation = snapshot.boardOrientation;
    isOpen = true;

    const el = ensureSandboxDom();
    if (!el) {
      console.error('[AN Mod] Cannot create sandbox modal DOM');
      return;
    }

    el.classList.remove('hidden');
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('z-index', '2147483647', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');

    // Center card
    const card = document.getElementById('ziga-sb-card');
    if (card) {
      card.style.position = '';
      card.style.left = '';
      card.style.top = '';
      card.style.margin = 'auto';
    }

    updateTurnIndicator();
    renderBoard();

    // Render current countdown immediately without resetting turnStartTime!
    updateRealMatchTracker();

    console.log('[AN Mod] Tactical Sandbox opened successfully with ' + currentPieces.length + ' pieces.');
  }

  function closeTacticalSandbox() {
    isOpen = false;
    userDismissedAlertThisTurn = false;

    if (modalEl) {
      modalEl.classList.add('hidden');
      modalEl.style.setProperty('display', 'none', 'important');
      modalEl.style.setProperty('visibility', 'hidden', 'important');
      modalEl.style.setProperty('pointer-events', 'none', 'important');
      const boardArea = document.getElementById('ziga-sb-board-area');
      if (boardArea) {
        boardArea.classList.remove('flank-alert-active');
        boardArea.classList.remove('state-opp-turn');
      }
    }

    selectedPiece = null;
    legalDestinations = [];

    console.log('[AN Mod] Tactical Sandbox closed. Returned to live match.');
  }

  // Export to namespace
  ZigaMod.openTacticalSandbox = openTacticalSandbox;
  ZigaMod.closeTacticalSandbox = closeTacticalSandbox;
  ZigaMod.isSandboxOpen = function () { return isOpen; };

})(window.ZigaMod = window.ZigaMod || {});
