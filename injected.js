// injected.js - Unified bundle built from src/ modules
(function () {

// ===== Module: src/constants.js =====
// src/constants.js - Chess piece definitions, display order, and default settings
(function (ZigaMod) {
  'use strict';

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

  const DISPLAY_ORDER = [3, 4, 5, 6, 1, 2, 0];

  // Default Settings configuration
  const DEFAULT_SETTINGS = {
    showLostPieces: true,        // Hiển thị danh sách quân đã bị ăn
    highlightTactics: true,      // Highlight tầm đánh trên bàn cờ khi chọn quân
    showTacticalHud: true,       // Hiển thị bảng phân tích tầm đánh trên HUD
    showCoUpTracker: true,       // Thống kê cờ úp & tính xác suất lật quân
    threatAlert: true,           // Cảnh báo quân của bạn đang bị đe dọa / bắt quân
    materialAdvantage: true,     // Thanh chênh lệch điểm quân
    showKeyPieces: true,         // Thống kê Xe-Pháo-Mã còn lại
    vietnameseLabels: false,     // Hiển thị chữ tiếng Việt (X, P, M...) thay vì chữ Hán
    showRowNumbers: true,        // Đánh số hàng (1-10) ở 2 bên mép bàn cờ
    cleanAdView: true            // Ẩn bớt quảng cáo che vướng bàn cờ
  };

  // Coordinate converter according to standard Vietnamese Xiangqi notation:
  // - Bên Đỏ: Cột 1..9 từ PHẢI sang TRÁI (9 - col), Hàng 1..10 từ DƯỚI lên TRÊN (row + 1)
  // - Bên Đen: Cột 1..9 từ PHẢI sang TRÁI của Đen (col + 1), Hàng 1..10 từ TRÊN xuống DƯỚI (10 - row)
  function formatXiangqiCoord(col, row, color) {
    if (color === 0) {
      const c = 9 - col;
      const r = row + 1;
      return { col: c, row: r, text: `C${c}·H${r}`, fullText: `Cột ${c}, Hàng ${r}` };
    } else {
      const c = col + 1;
      const r = 10 - row;
      return { col: c, row: r, text: `C${c}·H${r}`, fullText: `Cột ${c}, Hàng ${r}` };
    }
  }

  // Export to namespace
  ZigaMod.PIECE_DEFS = PIECE_DEFS;
  ZigaMod.DISPLAY_ORDER = DISPLAY_ORDER;
  ZigaMod.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
  ZigaMod.formatXiangqiCoord = formatXiangqiCoord;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/storage.js =====
// src/storage.js - User settings, piece character formatter, and position/size persistence
(function (ZigaMod) {
  'use strict';

  let userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS);

  function loadSettings() {
    try {
      const saved = localStorage.getItem('ziga_mod_settings');
      if (saved) {
        userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS, JSON.parse(saved));
      }
    } catch (e) { }
  }

  function saveSettings() {
    try {
      localStorage.setItem('ziga_mod_settings', JSON.stringify(userSettings));
    } catch (e) { }
  }

  // Load initially
  loadSettings();

  function getPieceChar(type, color) {
    const def = ZigaMod.PIECE_DEFS[type] || { name: 'Quân', redChar: '?', blackChar: '?', short: '?' };
    if (userSettings.vietnameseLabels) {
      return def.short;
    }
    return color === 0 ? def.redChar : def.blackChar;
  }

  function loadSavedPosition() {
    try {
      const saved = localStorage.getItem('ziga_mod_pos');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  }

  function savePosition(x, y) {
    try {
      localStorage.setItem('ziga_mod_pos', JSON.stringify({ x, y }));
    } catch (e) { }
  }

  function loadSavedSize() {
    try {
      const saved = localStorage.getItem('ziga_mod_size');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  }

  function saveSize(w, h) {
    try {
      localStorage.setItem('ziga_mod_size', JSON.stringify({ w, h }));
    } catch (e) { }
  }

  // Export to namespace
  ZigaMod.getUserSettings = function () { return userSettings; };
  ZigaMod.setUserSettings = function (newSettings) { userSettings = newSettings; };
  ZigaMod.loadSettings = loadSettings;
  ZigaMod.saveSettings = saveSettings;
  ZigaMod.getPieceChar = getPieceChar;
  ZigaMod.loadSavedPosition = loadSavedPosition;
  ZigaMod.savePosition = savePosition;
  ZigaMod.loadSavedSize = loadSavedSize;
  ZigaMod.saveSize = saveSize;

  // Convenient direct reference
  Object.defineProperty(ZigaMod, 'userSettings', {
    get: function () { return userSettings; },
    set: function (val) { userSettings = val; },
    configurable: true
  });

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/threat_scanner.js =====
// src/threat_scanner.js - Under-attack threat scanner and threat alert UI
(function (ZigaMod) {
  'use strict';

  function scanThreats(gameLayer, myColor, oppColor) {
    const threats = [];
    if (!gameLayer || !gameLayer.V || !ZigaMod.userSettings.threatAlert) return threats;

    // Build 9x10 grid of piece indices
    const grid = Array.from({ length: 9 }, () => Array(10).fill(-1));
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p && !p.pa) {
        grid[p.fa][p.rowIndex] = i;
      }
    }

    // Loop through living opponent pieces
    for (let i = 0; i < 32; i++) {
      const oppPiece = gameLayer.V[i];
      if (!oppPiece || oppPiece.pa || oppPiece.ka !== oppColor) continue;

      const pieceHelper = gameLayer.hq ? gameLayer.hq(i) : null;
      if (!pieceHelper || !gameLayer.IM) continue;

      for (let sq = 0; sq < 90; sq++) {
        const c = sq % 9;
        const r = Math.floor(sq / 9);
        const targetIdx = grid[c][r];

        if (targetIdx >= 0) {
          const myPiece = gameLayer.V[targetIdx];
          if (myPiece && !myPiece.pa && myPiece.ka === myColor) {
            try {
              if (gameLayer.IM(pieceHelper, i, sq, grid)) {
                if (!gameLayer.BM || !gameLayer.BM(pieceHelper, i, c, r, grid)) {
                  const coord = ZigaMod.formatXiangqiCoord
                    ? ZigaMod.formatXiangqiCoord(c, r, myPiece.ka)
                    : { col: (myPiece.ka === 0 ? 9 - c : c + 1), row: (myPiece.ka === 0 ? r + 1 : 10 - r), text: `C${myPiece.ka === 0 ? 9 - c : c + 1}·H${myPiece.ka === 0 ? r + 1 : 10 - r}`, fullText: `Cột ${myPiece.ka === 0 ? 9 - c : c + 1}, Hàng ${myPiece.ka === 0 ? r + 1 : 10 - r}` };

                  threats.push({
                    attacker: oppPiece,
                    target: myPiece,
                    attackerName: ZigaMod.PIECE_DEFS[oppPiece.Ga] ? ZigaMod.PIECE_DEFS[oppPiece.Ga].name : 'Quân',
                    targetName: ZigaMod.PIECE_DEFS[myPiece.Ga] ? ZigaMod.PIECE_DEFS[myPiece.Ga].name : 'Quân',
                    attackerChar: ZigaMod.getPieceChar(oppPiece.Ga, oppPiece.ka),
                    targetChar: ZigaMod.getPieceChar(myPiece.Ga, myPiece.ka),
                    targetValue: ZigaMod.PIECE_DEFS[myPiece.Ga] ? ZigaMod.PIECE_DEFS[myPiece.Ga].value : 0,
                    col: c,
                    row: r,
                    displayCol: coord.col,
                    displayRow: coord.row,
                    coordText: coord.text,
                    fullCoordText: coord.fullText
                  });
                }
              }
            } catch (e) { }
          }
        }
      }
    }

    // Sort by threatened piece value descending (Xe -> Pháo -> Mã...)
    threats.sort((a, b) => b.targetValue - a.targetValue);
    return threats;
  }

  function updateThreatUi(threats) {
    const wrapper = document.getElementById('ziga-threat-wrapper');
    const itemsContainer = document.getElementById('ziga-threat-items');
    if (!wrapper || !itemsContainer) return;

    if (!ZigaMod.userSettings.threatAlert || !threats || threats.length === 0) {
      wrapper.style.display = 'none';
      itemsContainer.innerHTML = '';
      return;
    }

    wrapper.style.display = 'flex';
    let html = '';
    threats.slice(0, 5).forEach(t => {
      html += `
        <div class="ziga-threat-pill">
          <div class="ziga-threat-combat">
            <span class="ziga-threat-enemy">[Địch] ${t.attackerName} [${t.attackerChar}]</span>
            <span class="ziga-threat-arrow">➔</span>
            <span class="ziga-threat-my">[Ní] ${t.targetName} [${t.targetChar}]</span>
          </div>
          <span class="ziga-threat-coord" title="Vị trí bị đe dọa: ${t.fullCoordText}">${t.coordText}</span>
        </div>
      `;
    });
    itemsContainer.innerHTML = html;
  }

  // Export to namespace
  ZigaMod.scanThreats = scanThreats;
  ZigaMod.updateThreatUi = updateThreatUi;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/coup_tracker.js =====
// src/coup_tracker.js - Cờ Úp face-down pieces remaining probability tracker
(function (ZigaMod) {
  'use strict';

  function isCoUpGame(gameLayer) {
    if (!gameLayer) return false;
    // Check if layer is BkCoUpGameLayer or has face-down pieces (ac === 0)
    if (window.BkCoUpGameLayer && gameLayer instanceof window.BkCoUpGameLayer) return true;
    if (gameLayer.V && Array.isArray(gameLayer.V)) {
      return gameLayer.V.some(p => p && p.ac === 0);
    }
    return false;
  }

  function computeCoUpStats(gameLayer, myColor, oppColor) {
    if (!gameLayer || !gameLayer.V) return null;

    function getStatsForSide(color) {
      let unopenedCount = 0;
      const revealed = { 3: 0, 4: 0, 5: 0, 1: 0, 2: 0, 6: 0 };

      for (let i = 0; i < 32; i++) {
        const p = gameLayer.V[i];
        if (!p) continue;
        const pColor = p.ka !== undefined ? p.ka : Math.floor(i / 16);
        if (pColor !== color) continue;

        if (p.ac === 0) {
          unopenedCount++;
        } else if (p.ac === 1 && p.Ga !== 0) { // revealed non-king piece
          revealed[p.Ga] = (revealed[p.Ga] || 0) + 1;
        }
      }

      // Initial non-king counts: 2 Xe, 2 Pháo, 2 Mã, 2 Sĩ, 2 Tượng, 5 Tốt
      const hiddenXe = Math.max(0, 2 - (revealed[3] || 0));
      const hiddenPhao = Math.max(0, 2 - (revealed[4] || 0));
      const hiddenMa = Math.max(0, 2 - (revealed[5] || 0));
      const hiddenPhe = Math.max(0, 4 - ((revealed[1] || 0) + (revealed[2] || 0))); // Sĩ + Tượng
      const hiddenTot = Math.max(0, 5 - (revealed[6] || 0));

      const probXe = unopenedCount > 0 ? ((hiddenXe / unopenedCount) * 100).toFixed(0) : 0;
      const probPhao = unopenedCount > 0 ? ((hiddenPhao / unopenedCount) * 100).toFixed(0) : 0;
      const probMa = unopenedCount > 0 ? ((hiddenMa / unopenedCount) * 100).toFixed(0) : 0;
      const probPhe = unopenedCount > 0 ? ((hiddenPhe / unopenedCount) * 100).toFixed(0) : 0;

      return {
        unopenedCount,
        hiddenXe, hiddenPhao, hiddenMa, hiddenPhe, hiddenTot,
        probXe, probPhao, probMa, probPhe
      };
    }

    return {
      opp: getStatsForSide(oppColor),
      self: getStatsForSide(myColor)
    };
  }

  function updateCoUpUi(stats, oppName, myName) {
    const wrapper = document.getElementById('ziga-coup-wrapper');
    const content = document.getElementById('ziga-coup-content');
    if (!wrapper || !content) return;

    if (!ZigaMod.userSettings.showCoUpTracker || !stats || (stats.opp.unopenedCount === 0 && stats.self.unopenedCount === 0)) {
      wrapper.style.display = 'none';
      content.innerHTML = '';
      return;
    }

    const safeOpp = (oppName || 'Đối thủ').slice(0, 10);
    const safeSelf = (myName || 'Bạn').slice(0, 10);

    wrapper.style.display = 'flex';
    content.innerHTML = `
      <div class="ziga-coup-row">
        <div class="ziga-coup-side-head">
          <span>🔴 ${safeOpp}</span>
          <span class="ziga-coup-unopened">Còn ${stats.opp.unopenedCount} quân úp</span>
        </div>
        <div class="ziga-coup-chips">
          <span class="ziga-prob-badge xe" title="Xác suất mở Xe">Xe: ${stats.opp.hiddenXe} (${stats.opp.probXe}%)</span>
          <span class="ziga-prob-badge phao" title="Xác suất mở Pháo">Pháo: ${stats.opp.hiddenPhao} (${stats.opp.probPhao}%)</span>
          <span class="ziga-prob-badge ma" title="Xác suất mở Mã">Mã: ${stats.opp.hiddenMa} (${stats.opp.probMa}%)</span>
          <span class="ziga-prob-badge phe" title="Xác suất mở Sĩ/Tượng">Sĩ-Tượng: ${stats.opp.hiddenPhe} (${stats.opp.probPhe}%)</span>
        </div>
      </div>
      <div class="ziga-coup-row">
        <div class="ziga-coup-side-head">
          <span>⚫ ${safeSelf} (Bạn)</span>
          <span class="ziga-coup-unopened">Còn ${stats.self.unopenedCount} quân úp</span>
        </div>
        <div class="ziga-coup-chips">
          <span class="ziga-prob-badge xe" title="Xác suất mở Xe">Xe: ${stats.self.hiddenXe} (${stats.self.probXe}%)</span>
          <span class="ziga-prob-badge phao" title="Xác suất mở Pháo">Pháo: ${stats.self.hiddenPhao} (${stats.self.probPhao}%)</span>
          <span class="ziga-prob-badge ma" title="Xác suất mở Mã">Mã: ${stats.self.hiddenMa} (${stats.self.probMa}%)</span>
          <span class="ziga-prob-badge phe" title="Xác suất mở Sĩ/Tượng">Sĩ-Tượng: ${stats.self.hiddenPhe} (${stats.self.probPhe}%)</span>
        </div>
      </div>
    `;
  }

  // Export to namespace
  ZigaMod.isCoUpGame = isCoUpGame;
  ZigaMod.computeCoUpStats = computeCoUpStats;
  ZigaMod.updateCoUpUi = updateCoUpUi;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/engine_hook.js =====
// src/engine_hook.js - Cocos2d in-engine hooks for piece sprite enhancement and click handling
(function (ZigaMod) {
  'use strict';

  function enhancePieceSprite(piece) {
    if (!piece || piece.__zigaEnhancedKj) return;
    piece.__zigaEnhancedKj = true;

    piece.kj = function (show) {
      if (!this.rd) return;

      // Honor user setting for in-engine highlight
      if (!ZigaMod.userSettings.highlightTactics) {
        this.rd.setVisible(false);
        this.rd.stopAllActions();
        return;
      }

      this.rd.setVisible(!!show);

      if (show) {
        this.rd.stopAllActions();
        if (this.rd.WT) this.rd.WT.stopAllActions();

        // Scale to 0.95 to embrace piece diameter perfectly
        this.rd.setScale(0.95);

        // Pulse animation
        var fadeOut = cc.fadeTo(0.35, 60);
        var fadeIn = cc.fadeTo(0.35, 255);
        var pulse = cc.sequence(fadeOut, fadeIn).repeatForever();
        this.rd.runAction(pulse);

        if (this.rd.WT) {
          var targetH = this.rd.getContentSize().height;
          var wtH = this.rd.WT.getContentSize().height;
          if (wtH > 0) {
            this.rd.WT.setScale(targetH / wtH);
          }
          this.rd.WT.runAction(pulse.clone());
        }
      } else {
        this.rd.stopAllActions();
        if (this.rd.WT) this.rd.WT.stopAllActions();
        this.rd.setScale(0.5);
      }
    };
  }

  function hookGameLayer(gameLayer) {
    if (!gameLayer || gameLayer.__zigaInEngineHooked) return;
    gameLayer.__zigaInEngineHooked = true;

    console.log('[Ziga Mod] In-engine hooks active (nT, pA, fU).');

    if (gameLayer.V && Array.isArray(gameLayer.V)) {
      for (let i = 0; i < gameLayer.V.length; i++) {
        enhancePieceSprite(gameLayer.V[i]);
      }
    }

    // Initialize board row numbers (1-10 on left and right wooden rims)
    setupRowNumbers(gameLayer);

    // 1. OVERRIDE nT (checks all 32 pieces for captures)
    gameLayer.nT = function (pieceIndex) {
      if (pieceIndex < 0 || pieceIndex >= 32 || !this.V[pieceIndex]) return;

      var b = Array(9);
      for (var c = 0; 10 > c; c++) b[c] = Array(10);
      this.ZC(b);

      var pieceHelper = this.hq(pieceIndex);
      this.Vp = [];
      var attacker = this.V[pieceIndex];
      var attackerColor = attacker.ka;
      var capturableList = [];

      for (var d = 0, e = 0; 90 > e; e++) {
        if (this.IM(pieceHelper, pieceIndex, e, b)) {
          var f = e % 9, g = Math.floor(e / 9);

          if (this.BM(pieceHelper, pieceIndex, f, g, b) || this.DM(0, pieceHelper, pieceIndex, f, g, b)) {
            if (this.tc[d]) {
              this.tc[d].setPosition(this.Pb(f), this.Qb(g));
              this.tc[d].Ir = g;
              this.tc[d].cq = f;
              this.tc[d].setVisible(false);
            }
          } else {
            var isEnemyCapture = false;

            for (var k = 0; k < 32; k++) {
              var targetPiece = this.V[k];
              if (targetPiece && !targetPiece.pa && targetPiece.ka !== attackerColor && targetPiece.fa === f && targetPiece.rowIndex === g) {
                isEnemyCapture = true;
                if (ZigaMod.userSettings.highlightTactics) {
                  targetPiece.kj(true);
                }
                this.Vp.push([f, g]);

                capturableList.push({
                  piece: targetPiece,
                  type: targetPiece.Ga,
                  color: targetPiece.ka,
                  col: f,
                  row: g,
                  name: ZigaMod.PIECE_DEFS[targetPiece.Ga] ? ZigaMod.PIECE_DEFS[targetPiece.Ga].name : 'Quân',
                  char: ZigaMod.getPieceChar(targetPiece.Ga, targetPiece.ka),
                  value: ZigaMod.PIECE_DEFS[targetPiece.Ga] ? ZigaMod.PIECE_DEFS[targetPiece.Ga].value : 0
                });
                break;
              }
            }

            if (!isEnemyCapture && this.tc[d]) {
              this.tc[d].setPosition(this.Pb(f), this.Qb(g));
              this.tc[d].Ir = g;
              this.tc[d].cq = f;
              this.tc[d].setVisible(true);
            }
          }
          d++;
        }
      }

      ZigaMod.selectedAttackerIndex = pieceIndex;
      if (ZigaMod.userSettings.showTacticalHud) {
        ZigaMod.updateTacticalHud(attacker, capturableList);
      }
    };

    // 2. OVERRIDE pA (clears highlights across all 32 pieces)
    gameLayer.pA = function () {
      for (var a = 0; a < 20; a++) {
        if (this.tc[a]) {
          this.tc[a].setPosition(-100, -100);
          this.tc[a].Ir = -1;
          this.tc[a].cq = -1;
        }
      }

      for (var a = 0; a < 32; a++) {
        if (this.V[a] && typeof this.V[a].kj === 'function') {
          this.V[a].kj(false);
        }
      }

      ZigaMod.selectedAttackerIndex = -1;
      ZigaMod.clearTacticalHud();
    };

    // 3. HOOK fU (handles click on opponent pieces)
    const origFU = gameLayer.fU;
    gameLayer.fU = function (touchX, touchY) {
      const col = this.xq(touchX);
      const row = this.Cq(touchY);
      const clickedIdx = this.QK(col, row);

      if (clickedIdx >= 0) {
        const clickedPiece = this.V[clickedIdx];
        const myColor = (this.Nj !== undefined && this.Nj >= 0) ? this.Nj : 0;
        const isMyTurn = (this.T && this.T().Fb === 2 && this.Yc === this.Nj);

        if (this.le >= 0 && isMyTurn && this.HM && this.HM(col, row)) {
          origFU.call(this, touchX, touchY);
          return;
        }

        if (clickedPiece && (clickedPiece.ka !== myColor || !isMyTurn)) {
          if (this.le === clickedIdx) {
            this.fp();
          } else {
            this.pA();
            this.le = clickedIdx;

            this.ij.setPosition(this.Pb(clickedPiece.fa), this.Qb(clickedPiece.rowIndex) + 1);
            if (!this.Fr) {
              this.Fr = cc.rotateBy(2, 360).repeatForever();
            }
            this.ij.stopAllActions();
            this.ij.runAction(this.Fr);
            this.ij.setVisible(true);

            this.nT(clickedIdx);
          }
          return;
        }
      }

      origFU.call(this, touchX, touchY);
    };
  }

  // ==========================================
  // BOARD ROW NUMBERS (1 to 10 on Wooden Rims)
  // ==========================================

  function setupRowNumbers(gameLayer) {
    if (!gameLayer || typeof gameLayer.Pb !== 'function' || typeof gameLayer.Qb !== 'function') return;

    const ROW_FONT_SIZE = 16;

    // Nếu đã tạo nhãn với đúng cỡ chữ này thì chỉ cập nhật ẩn/hiện
    if (gameLayer.__zigaRowLabels && gameLayer.__zigaRowLabels.length > 0 && gameLayer.__zigaRowLabelsFontSize === ROW_FONT_SIZE) {
      updateRowLabelsVisibility(gameLayer);
      return;
    }

    // Nếu cỡ chữ thay đổi hoặc cần tạo mới, gỡ bỏ nhãn cũ trước
    if (gameLayer.__zigaRowLabels && Array.isArray(gameLayer.__zigaRowLabels)) {
      for (let i = 0; i < gameLayer.__zigaRowLabels.length; i++) {
        const lbl = gameLayer.__zigaRowLabels[i];
        if (lbl && typeof lbl.removeFromParent === 'function') {
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

          if (typeof cc.LabelTTF === 'function') {
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
        console.warn('[Ziga Mod] Cocos2d LabelTTF init failed:', err);
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
    let overlay = document.getElementById('ziga-dom-row-numbers');
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ziga-dom-row-numbers';
      overlay.style.position = 'absolute';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '50';
      const parent = canvas.parentElement || document.body;
      if (window.getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
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

    overlay.innerHTML = '';
    for (let r = 0; r < 10; r++) {
      const cocosY = gameLayer.Qb(r);
      const domY = (canvas.height - cocosY) * scaleY + (rect.top - parentRect.top);
      const domLeftX = leftX * scaleX + (rect.left - parentRect.left);
      const domRightX = rightX * scaleX + (rect.left - parentRect.left);
      const numText = (r + 1).toString();

      const spanL = document.createElement('span');
      spanL.className = 'ziga-board-row-num';
      spanL.textContent = numText;
      spanL.style.position = 'absolute';
      spanL.style.left = domLeftX + 'px';
      spanL.style.top = domY + 'px';
      spanL.style.transform = 'translate(-50%, -50%)';
      overlay.appendChild(spanL);

      const spanR = document.createElement('span');
      spanR.className = 'ziga-board-row-num';
      spanR.textContent = numText;
      spanR.style.position = 'absolute';
      spanR.style.left = domRightX + 'px';
      spanR.style.top = domY + 'px';
      spanR.style.transform = 'translate(-50%, -50%)';
      overlay.appendChild(spanR);
    }
  }

  function updateRowLabelsVisibility(gameLayer) {
    const show = !!ZigaMod.userSettings.showRowNumbers;
    if (gameLayer && gameLayer.__zigaRowLabels) {
      for (let i = 0; i < gameLayer.__zigaRowLabels.length; i++) {
        const lbl = gameLayer.__zigaRowLabels[i];
        if (lbl && typeof lbl.setVisible === 'function') {
          lbl.setVisible(show);
        }
      }
    }
    const domOverlay = document.getElementById('ziga-dom-row-numbers');
    if (domOverlay) {
      domOverlay.style.display = show ? 'block' : 'none';
    }
  }

  // Export to namespace
  ZigaMod.enhancePieceSprite = enhancePieceSprite;
  ZigaMod.hookGameLayer = hookGameLayer;
  ZigaMod.setupRowNumbers = setupRowNumbers;
  ZigaMod.updateRowLabelsVisibility = updateRowLabelsVisibility;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/ui.js =====
// src/ui.js - HUD DOM creation, dragging, resizing, tactical target cards, and settings visibility
(function (ZigaMod) {
  'use strict';

  let widgetEl = null;
  let isMinimized = false;
  let isSettingsOpen = false;
  let savedExpandedWidth = '';
  let savedExpandedHeight = '';

  function toggleMinimize(forceState) {
    const nextState = forceState !== undefined ? !!forceState : !isMinimized;
    if (nextState === isMinimized && forceState !== undefined) return;
    isMinimized = nextState;

    if (!widgetEl) return;
    const minBtn = document.getElementById('ziga-mod-btn-min');

    if (isMinimized) {
      // Save current expanded dimensions before minimizing
      savedExpandedWidth = widgetEl.style.width;
      savedExpandedHeight = widgetEl.style.height;

      // Close settings drawer if open
      if (isSettingsOpen) {
        isSettingsOpen = false;
        const settingsPanel = document.getElementById('ziga-settings-panel');
        const settingsBtn = document.getElementById('ziga-mod-btn-settings');
        if (settingsPanel) settingsPanel.style.display = 'none';
        if (settingsBtn) settingsBtn.classList.remove('active');
      }

      // Close material tooltip if open
      const matTooltip = document.getElementById('ziga-material-tooltip');
      if (matTooltip) matTooltip.style.display = 'none';

      widgetEl.classList.add('minimized');
      widgetEl.setAttribute('title', 'Bấm để mở rộng bảng công cụ | Kéo để di chuyển');
      if (minBtn) {
        minBtn.textContent = '⤢';
        minBtn.title = 'Mở rộng bảng công cụ';
      }

      // Clear inline width & height so docking bubble CSS takes full control
      widgetEl.style.width = '';
      widgetEl.style.height = '';
    } else {
      widgetEl.classList.remove('minimized');
      widgetEl.removeAttribute('title');
      if (minBtn) {
        minBtn.textContent = '_';
        minBtn.title = 'Thu nhỏ thành bong bóng';
      }

      // Restore saved dimensions
      if (savedExpandedWidth) {
        widgetEl.style.width = savedExpandedWidth;
      } else {
        const savedSize = ZigaMod.loadSavedSize ? ZigaMod.loadSavedSize() : null;
        widgetEl.style.width = (savedSize && savedSize.w ? savedSize.w : 320) + 'px';
      }

      if (savedExpandedHeight) {
        widgetEl.style.height = savedExpandedHeight;
        const body = document.getElementById('ziga-mod-body');
        if (body) {
          const headerH = document.getElementById('ziga-mod-drag-handle')?.offsetHeight || 42;
          const hVal = parseInt(savedExpandedHeight, 10);
          if (!isNaN(hVal)) {
            body.style.maxHeight = Math.max(120, hVal - headerH) + 'px';
            body.style.height = Math.max(120, hVal - headerH) + 'px';
          }
        }
      }

      // Ensure widget doesn't clip outside viewport after expanding
      const rect = widgetEl.getBoundingClientRect();
      const curW = widgetEl.offsetWidth || 320;
      const curH = widgetEl.offsetHeight || 420;
      let adjLeft = rect.left;
      let adjTop = rect.top;

      if (adjLeft + curW > window.innerWidth - 10) {
        adjLeft = Math.max(10, window.innerWidth - curW - 10);
      }
      if (adjTop + curH > window.innerHeight - 10) {
        adjTop = Math.max(10, window.innerHeight - curH - 10);
      }

      widgetEl.style.left = adjLeft + 'px';
      widgetEl.style.top = adjTop + 'px';
      if (ZigaMod.savePosition) {
        ZigaMod.savePosition(adjLeft, adjTop);
      }
    }
  }

  function createOverlay() {
    if (document.getElementById('ziga-mod-widget')) {
      widgetEl = document.getElementById('ziga-mod-widget');
      return widgetEl;
    }

    widgetEl = document.createElement('div');
    widgetEl.id = 'ziga-mod-widget';
    widgetEl.className = 'ziga-mod-container';
    widgetEl.style.zIndex = '2147483647';

    const savedSize = ZigaMod.loadSavedSize();
    if (savedSize && savedSize.w) {
      widgetEl.style.width = Math.max(270, Math.min(window.innerWidth - 20, savedSize.w)) + 'px';
    } else {
      widgetEl.style.width = '320px';
    }
    if (savedSize && savedSize.h) {
      widgetEl.style.height = Math.max(220, Math.min(window.innerHeight - 20, savedSize.h)) + 'px';
    }

    const savedPos = ZigaMod.loadSavedPosition();
    if (savedPos && savedPos.x !== undefined && savedPos.y !== undefined) {
      widgetEl.style.left = savedPos.x + 'px';
      widgetEl.style.top = savedPos.y + 'px';
    } else {
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

    const userSettings = ZigaMod.userSettings;

    widgetEl.innerHTML = `
      <div class="ziga-mod-header" id="ziga-mod-drag-handle">
        <div class="ziga-mod-title">
          <span class="ziga-mod-badge-icon">
            <svg viewBox="0 0 512 512" width="20" height="20" style="border-radius: 4px; vertical-align: middle; display: inline-block; box-shadow: 0 0 6px rgba(212, 175, 55, 0.4); border: 1px solid rgba(212, 175, 55, 0.5);">
              <rect width="512" height="512" rx="64" fill="#000000"></rect>
              <path d="M118.141 347H76.9482L139.714 165.182H189.253L251.93 347H210.737L165.194 206.73H163.773L118.141 347ZM115.567 275.533H212.868V305.54H115.567V275.533ZM425.892 165.182V347H392.689L313.587 232.565H312.255V347H273.814V165.182H307.55L386.03 279.528H387.628V165.182H425.892Z" fill="#ffffff"></path>
            </svg>
          </span>
          <span class="ziga-mod-title-text">TOOLS SUPPORT</span>
        </div>
        <div class="ziga-mod-actions">
          <button class="ziga-mod-btn-icon" title="Truy cập tài liệu về Industrial Automation (PLC, Investor, Robot công nghiệp ...) tại [Automation Note]">
           <a  href="https://2naq.github.io/shareme/about" target="_blank" style="cursor: pointer;  text-decoration: none !important">
           🔗
          </a>
          </button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-settings" title="Cài đặt tính năng">⚙</button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-min" title="Thu gọn / Mở rộng">_</button>
        </div>
      </div>

      <!-- Settings Drawer Panel -->
      <div class="ziga-settings-drawer" id="ziga-settings-panel" style="display:none;">
        <div class="ziga-settings-header">
          <span class="ziga-settings-heading">⚙️ CÀI ĐẶT TÍNH NĂNG</span>
          <button class="ziga-settings-close-btn" id="ziga-settings-close">✕</button>
        </div>
        <div class="ziga-settings-list">
          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Quân đã bị ăn</strong>
              <small>Thống kê quân đã mất của 2 bên</small>
            </span>
            <input type="checkbox" id="set-showLostPieces" ${userSettings.showLostPieces ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Highlight tầm đánh trên bàn cờ</strong>
              <small>Bấm vào quân để nhấp nháy quân ăn được</small>
            </span>
            <input type="checkbox" id="set-highlightTactics" ${userSettings.highlightTactics ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Bảng tầm đánh trên HUD</strong>
              <small>Hiển thị chi tiết quân đang chọn & mục tiêu</small>
            </span>
            <input type="checkbox" id="set-showTacticalHud" ${userSettings.showTacticalHud ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Thống kê & Xác suất Cờ Úp</strong>
              <small>Đếm quân úp còn lại và tính % mở Xe, Pháo...</small>
            </span>
            <input type="checkbox" id="set-showCoUpTracker" ${userSettings.showCoUpTracker ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Cảnh báo quân bị đe dọa</strong>
              <small>Báo động khi quân của bạn đang bị nhắm ăn</small>
            </span>
            <input type="checkbox" id="set-threatAlert" ${userSettings.threatAlert ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Thanh chênh lệch điểm quân</strong>
              <small>Đo lường ưu thế lực lượng (+9 Xe, +4.5 Pháo...)</small>
            </span>
            <input type="checkbox" id="set-materialAdvantage" ${userSettings.materialAdvantage ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Đếm Xe - Pháo - Mã còn lại</strong>
              <small>Thống kê số lượng chủ lực còn sống</small>
            </span>
            <input type="checkbox" id="set-showKeyPieces" ${userSettings.showKeyPieces ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Ký hiệu tiếng Việt (X, P, M...)</strong>
              <small>Hiển thị chữ quốc ngữ thay cho chữ Hán</small>
            </span>
            <input type="checkbox" id="set-vietnameseLabels" ${userSettings.vietnameseLabels ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Đánh số hàng (1-10) bàn cờ</strong>
              <small>Hiển thị số hàng ở 2 mép gỗ bàn cờ</small>
            </span>
            <input type="checkbox" id="set-showRowNumbers" ${userSettings.showRowNumbers ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Ẩn quảng cáo che khuất</strong>
              <small>Xóa các banner quảng cáo nổi vướng bàn cờ</small>
            </span>
            <input type="checkbox" id="set-cleanAdView" ${userSettings.cleanAdView ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>
        </div>
        <div class="ziga-settings-footer">
          <button class="ziga-btn-reset-settings" id="ziga-btn-reset-default">Khôi phục mặc định</button>
        </div>
      </div>

      <div class="ziga-mod-content" id="ziga-mod-body">
        <div class="ziga-mod-match-status" id="ziga-mod-match-info">
          <span class="ziga-mod-dot waiting"></span>
          <span id="ziga-status-text">Đang kết nối game...</span>
        </div>

        <!-- Threat Warning Alert Box -->
        <div class="ziga-threat-box" id="ziga-threat-wrapper" style="display:none;">
          <div class="ziga-threat-header">
            <span class="ziga-threat-icon__">⚠️</span>
            <span class="ziga-threat-title" id="ziga-threat-title">CẢNH BÁO NÍ SẮP BỊ LỤM</span>
          </div>
          <div class="ziga-threat-list" id="ziga-threat-items"></div>
        </div>

        <!-- Material Advantage Indicator -->
        <div class="ziga-material-bar-wrapper" id="ziga-material-wrapper" style="display:none;">
          <div class="ziga-material-left">
            <span class="ziga-material-label">Chênh lệch quân</span>
            <span class="ziga-help-btn" id="ziga-material-help-btn" title="Bấm hoặc rê chuột để xem quy tắc tính điểm">?</span>
            <span class="ziga-material-colon">:</span>
          </div>
          <div class="ziga-material-val" id="ziga-material-score">Bằng điểm</div>

          <!-- Material Tooltip Popover -->
          <div class="ziga-material-tooltip" id="ziga-material-tooltip" style="display:none;">
            <div class="ziga-mat-tt-header">
              <span class="ziga-mat-tt-title">⚖️ TÍNH ĐIỂM CHÊNH LỆCH</span>
              <span class="ziga-mat-tt-close" id="ziga-mat-tt-close" title="Đóng">✕</span>
            </div>

            <!-- Live breakdown section -->
            <div class="ziga-mat-tt-live-section">
              <div class="ziga-mat-tt-live-title">📊 CHI TIẾT VÁN ĐẤU HIỆN TẠI</div>
              <div class="ziga-mat-tt-live-calc" id="ziga-mat-tt-live-calc">
                <div style="text-align: center; color: #94a3b8; font-style: italic;">Chờ vào ván cờ (Mỗi bên xuất phát với 50.5đ)</div>
              </div>
              <div class="ziga-mat-tt-table-wrap">
                <table class="ziga-mat-tt-table">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Quân cờ</th>
                      <th>Bạn</th>
                      <th>Địch</th>
                      <th style="text-align: right;">± Điểm</th>
                    </tr>
                  </thead>
                  <tbody id="ziga-mat-tt-tbody">
                    <tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 6px; font-style: italic;">Chưa bắt đầu ván đấu</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Reference points section -->
            <div class="ziga-mat-tt-ref-section">
              <div class="ziga-mat-tt-ref-title">📖 HỆ SỐ ĐIỂM QUY CHUẨN</div>
              <div class="ziga-mat-tt-grid">
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Xe (俥/車)</span><span class="ziga-mat-tt-pts">+9.0đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Pháo (炮/砲)</span><span class="ziga-mat-tt-pts">+4.5đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Mã (傌/馬)</span><span class="ziga-mat-tt-pts">+4.0đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Sĩ (仕/士)</span><span class="ziga-mat-tt-pts">+2.0đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Tượng (相/象)</span><span class="ziga-mat-tt-pts">+2.0đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Tốt (兵/卒)</span><span class="ziga-mat-tt-pts">+1.5đ</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Co Up Hidden Pieces Probability Box (Cờ Úp Only) -->
        <div class="ziga-coup-box" id="ziga-coup-wrapper" style="display:none;">
          <div class="ziga-coup-header">
            <span class="ziga-coup-icon">🎲</span>
            <span class="ziga-coup-title">XÁC SUẤT QUÂN CỜ ÚP</span>
          </div>
          <div class="ziga-coup-content" id="ziga-coup-content"></div>
        </div>

        <!-- Section 1: Opponent Captured Pieces (quân đối thủ đã mất) -->
        <div class="ziga-player-section opponent-section" id="ziga-opp-lost-section">
          <div class="ziga-section-header">
            <span class="ziga-player-label" id="ziga-opp-label">🔴 ĐỐI THỦ ĐÃ MẤT</span>
            <span class="ziga-count-tag" id="ziga-opp-dead-count">0/16</span>
          </div>
          <div class="ziga-pieces-grid" id="ziga-opp-pieces">
            <div class="ziga-empty-note">Chưa mất quân nào</div>
          </div>
        </div>

        <div class="ziga-divider" id="ziga-lost-divider"></div>

        <!-- Section 2: Player Lost Pieces (quân mình đã mất) -->
        <div class="ziga-player-section self-section" id="ziga-self-lost-section">
          <div class="ziga-section-header">
            <span class="ziga-player-label" id="ziga-self-label">⚫ BẠN ĐÃ MẤT</span>
            <span class="ziga-count-tag" id="ziga-self-dead-count">0/16</span>
          </div>
          <div class="ziga-pieces-grid" id="ziga-self-pieces">
            <div class="ziga-empty-note">Chưa mất quân nào</div>
          </div>
        </div>

        <!-- Section 3: Tactical Target Inspector -->
        <div class="ziga-divider" id="ziga-tactical-divider"></div>
        <div class="ziga-tactical-section" id="ziga-tactical-box">
          <div class="ziga-tactical-header">
            <span class="ziga-tactical-title">🎯 TẦM đánh</span>
            <button class="ziga-btn-clear-select" id="ziga-btn-clear-highlight" title="Xóa highlight">✕ Bỏ chọn</button>
          </div>
          <div class="ziga-selected-display" id="ziga-selected-piece-info">
            <span class="ziga-empty-note">Bấm vào bất kỳ quân nào trên bàn cờ (của mình hoặc đối thủ) để xem quân đó ăn được quân nào!</span>
          </div>
          <div class="ziga-targets-container" id="ziga-targets-list" style="display:none;"></div>
        </div>

        <!-- Section 4: Remaining Key Pieces Tracker -->
        <div class="ziga-divider" id="ziga-summary-divider"></div>
        <div class="ziga-summary-section" id="ziga-summary-box">
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

      <!-- Resize Grips -->
      <div class="ziga-mod-resize-edge-r" id="ziga-mod-resize-edge-r" title="Kéo mép để chỉnh chiều rộng"></div>
      <div class="ziga-mod-resize-edge-b" id="ziga-mod-resize-edge-b" title="Kéo mép để chỉnh chiều cao"></div>
      <div class="ziga-mod-resize-handle" id="ziga-mod-resize-handle" title="Kéo góc để phóng to / thu nhỏ (Click đúp để về mặc định)"></div>
    `;

    document.body.appendChild(widgetEl);

    if (savedSize && savedSize.h) {
      const body = document.getElementById('ziga-mod-body');
      if (body) {
        const headerH = document.getElementById('ziga-mod-drag-handle')?.offsetHeight || 42;
        body.style.maxHeight = Math.max(120, savedSize.h - headerH) + 'px';
        body.style.height = Math.max(120, savedSize.h - headerH) + 'px';
      }
    }

    // Draggable
    setupDraggable(widgetEl, document.getElementById('ziga-mod-drag-handle'));

    // Resizable
    setupResizable(
      widgetEl,
      document.getElementById('ziga-mod-resize-handle'),
      document.getElementById('ziga-mod-resize-edge-r'),
      document.getElementById('ziga-mod-resize-edge-b')
    );

    // Minimize toggle
    const minBtn = document.getElementById('ziga-mod-btn-min');
    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMinimize();
      });
    }

    // Settings panel toggle
    const settingsBtn = document.getElementById('ziga-mod-btn-settings');
    const settingsPanel = document.getElementById('ziga-settings-panel');
    const settingsClose = document.getElementById('ziga-settings-close');

    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isSettingsOpen = !isSettingsOpen;
      settingsPanel.style.display = isSettingsOpen ? 'block' : 'none';
      settingsBtn.classList.toggle('active', isSettingsOpen);
    });

    settingsClose.addEventListener('click', (e) => {
      e.stopPropagation();
      isSettingsOpen = false;
      settingsPanel.style.display = 'none';
      settingsBtn.classList.remove('active');
    });

    // Bind settings toggles
    Object.keys(ZigaMod.DEFAULT_SETTINGS).forEach(key => {
      const checkbox = document.getElementById(`set-${key}`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          ZigaMod.userSettings[key] = e.target.checked;
          ZigaMod.saveSettings();
          applySettingsVisibility();
          ZigaMod.lastStateHash = ''; // Force immediate UI refresh
        });
      }
    });

    // Reset default settings
    const resetBtn = document.getElementById('ziga-btn-reset-default');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ZigaMod.userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS);
        ZigaMod.saveSettings();
        Object.keys(ZigaMod.DEFAULT_SETTINGS).forEach(key => {
          const checkbox = document.getElementById(`set-${key}`);
          if (checkbox) checkbox.checked = ZigaMod.userSettings[key];
        });
        applySettingsVisibility();
        ZigaMod.lastStateHash = '';
      });
    }

    // Clear highlight button
    const clearBtn = document.getElementById('ziga-btn-clear-highlight');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gameLayer = ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null;
        if (gameLayer && typeof gameLayer.pA === 'function') {
          gameLayer.pA();
        }
        if (gameLayer && gameLayer.ij) {
          gameLayer.ij.setPosition(-100, -100);
        }
        clearTacticalHud();
      });
    }

    // Material Advantage Help Tooltip (Hover & Click toggle)
    const matHelpBtn = document.getElementById('ziga-material-help-btn');
    const matTooltip = document.getElementById('ziga-material-tooltip');
    const matCloseBtn = document.getElementById('ziga-mat-tt-close');
    let isMatPinned = false;
    let matTimer = null;

    function showMatTip() {
      clearTimeout(matTimer);
      if (matTooltip) matTooltip.style.display = 'block';
    }

    function hideMatTip(force) {
      clearTimeout(matTimer);
      if (force) isMatPinned = false;
      if (!isMatPinned) {
        matTimer = setTimeout(() => {
          if (!isMatPinned && matTooltip) matTooltip.style.display = 'none';
        }, 180);
      }
    }

    if (matHelpBtn && matTooltip) {
      matHelpBtn.addEventListener('mouseenter', showMatTip);
      matHelpBtn.addEventListener('mouseleave', () => hideMatTip(false));

      matTooltip.addEventListener('mouseenter', showMatTip);
      matTooltip.addEventListener('mouseleave', () => hideMatTip(false));

      matHelpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMatPinned = !isMatPinned;
        if (isMatPinned) showMatTip();
        else hideMatTip(true);
      });

      if (matCloseBtn) {
        matCloseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          hideMatTip(true);
        });
      }

      document.addEventListener('click', (e) => {
        if (matTooltip.style.display !== 'none' && !matTooltip.contains(e.target) && e.target !== matHelpBtn) {
          hideMatTip(true);
        }
      });
    }

    applySettingsVisibility();
    return widgetEl;
  }

  function applySettingsVisibility() {
    const userSettings = ZigaMod.userSettings;
    const lostOpp = document.getElementById('ziga-opp-lost-section');
    const lostSelf = document.getElementById('ziga-self-lost-section');
    const lostDiv = document.getElementById('ziga-lost-divider');
    const matWrapper = document.getElementById('ziga-material-wrapper');
    const tacticalBox = document.getElementById('ziga-tactical-box');
    const tacticalDiv = document.getElementById('ziga-tactical-divider');
    const summaryBox = document.getElementById('ziga-summary-box');
    const summaryDiv = document.getElementById('ziga-summary-divider');

    if (lostOpp) lostOpp.style.display = userSettings.showLostPieces ? 'flex' : 'none';
    if (lostSelf) lostSelf.style.display = userSettings.showLostPieces ? 'flex' : 'none';
    if (lostDiv) lostDiv.style.display = userSettings.showLostPieces ? 'block' : 'none';

    if (matWrapper && !userSettings.materialAdvantage) matWrapper.style.display = 'none';

    if (tacticalBox) tacticalBox.style.display = userSettings.showTacticalHud ? 'flex' : 'none';
    if (tacticalDiv) tacticalDiv.style.display = userSettings.showTacticalHud ? 'block' : 'none';

    if (summaryBox) summaryBox.style.display = userSettings.showKeyPieces ? 'flex' : 'none';
    if (summaryDiv) summaryDiv.style.display = userSettings.showKeyPieces ? 'block' : 'none';

    if (userSettings.cleanAdView) {
      document.body.classList.add('ziga-clean-ads-active');
    } else {
      document.body.classList.remove('ziga-clean-ads-active');
    }

    if (ZigaMod.updateRowLabelsVisibility) {
      const gameLayer = ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null;
      ZigaMod.updateRowLabelsVisibility(gameLayer);
    }
  }

  function setupDraggable(container, handle) {
    let isDragging = false;
    let hasMoved = false;
    let startX, startY, initX, initY;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      isDragging = true;
      hasMoved = false;
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
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
      }
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
        if (hasMoved) {
          const rect = container.getBoundingClientRect();
          if (ZigaMod.savePosition) {
            ZigaMod.savePosition(rect.left, rect.top);
          }
        } else if (isMinimized) {
          // Clicked bubble without dragging -> expand back
          toggleMinimize(false);
        }
      }
    });
  }

  function setupResizable(container, cornerHandle, rightHandle, bottomHandle) {
    let isResizing = false;
    let resizeType = '';
    let startX, startY, initW, initH;

    function startResize(e, type) {
      if (isMinimized) return;
      isResizing = true;
      resizeType = type;
      startX = e.clientX;
      startY = e.clientY;
      initW = container.offsetWidth;
      initH = container.offsetHeight;
      document.body.style.userSelect = 'none';
      e.preventDefault();
      e.stopPropagation();
    }

    if (cornerHandle) {
      cornerHandle.addEventListener('mousedown', (e) => startResize(e, 'both'));
      cornerHandle.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        container.style.width = '320px';
        container.style.height = 'auto';
        const body = document.getElementById('ziga-mod-body');
        if (body) {
          body.style.maxHeight = '560px';
          body.style.height = 'auto';
        }
        ZigaMod.saveSize(320, null);
      });
    }

    if (rightHandle) {
      rightHandle.addEventListener('mousedown', (e) => startResize(e, 'width'));
    }

    if (bottomHandle) {
      bottomHandle.addEventListener('mousedown', (e) => startResize(e, 'height'));
    }

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newW = initW;
      let newH = initH;

      if (resizeType === 'both' || resizeType === 'width') {
        newW = Math.max(270, Math.min(window.innerWidth - container.offsetLeft - 10, initW + dx));
        container.style.width = newW + 'px';
      }

      if (resizeType === 'both' || resizeType === 'height') {
        newH = Math.max(220, Math.min(window.innerHeight - container.offsetTop - 10, initH + dy));
        container.style.height = newH + 'px';
        const body = document.getElementById('ziga-mod-body');
        if (body) {
          const headerEl = document.getElementById('ziga-mod-drag-handle');
          const headerH = headerEl ? headerEl.offsetHeight : 42;
          body.style.maxHeight = Math.max(120, newH - headerH) + 'px';
          body.style.height = Math.max(120, newH - headerH) + 'px';
        }
      }
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = '';
        ZigaMod.saveSize(container.offsetWidth, container.offsetHeight);
      }
    });
  }

  function clearTacticalHud() {
    const selectedDisplay = document.getElementById('ziga-selected-piece-info');
    const targetsList = document.getElementById('ziga-targets-list');
    if (selectedDisplay) {
      selectedDisplay.innerHTML = `<span class="ziga-empty-note">Bấm vào bất kỳ quân nào trên bàn cờ (của mình hoặc đối thủ) để xem quân đó ăn được quân nào!</span>`;
    }
    if (targetsList) {
      targetsList.style.display = 'none';
      targetsList.innerHTML = '';
    }
  }

  function updateTacticalHud(attacker, capturableList) {
    const selectedDisplay = document.getElementById('ziga-selected-piece-info');
    const targetsList = document.getElementById('ziga-targets-list');
    if (!selectedDisplay || !targetsList) return;

    const attackerColor = attacker.ka !== undefined ? attacker.ka : 0;
    const attackerType = attacker.Ga !== undefined ? attacker.Ga : 6;
    const def = ZigaMod.PIECE_DEFS[attackerType] || { name: 'Quân', redChar: '?', blackChar: '?' };
    const char = ZigaMod.getPieceChar(attackerType, attackerColor);
    const colorLabel = attackerColor === 0 ? '🔴 Phe Đỏ' : '⚫ Phe Đen';
    const colorClass = attackerColor === 0 ? 'red-piece' : 'black-piece';

    const attackerCoord = ZigaMod.formatXiangqiCoord
      ? ZigaMod.formatXiangqiCoord(attacker.fa, attacker.rowIndex, attackerColor)
      : { col: (attackerColor === 0 ? 9 - attacker.fa : attacker.fa + 1), row: (attackerColor === 0 ? attacker.rowIndex + 1 : 10 - attacker.rowIndex) };

    selectedDisplay.innerHTML = `
      <div class="ziga-inspect-card">
        <div class="ziga-piece-chip ${colorClass} inspect-active">
          <div class="ziga-piece-token">
            <span class="ziga-token-char">${char}</span>
          </div>
          <div class="ziga-piece-info">
            <span class="ziga-piece-name">${colorLabel} - ${def.name}</span>
            <span class="ziga-pos-badge">(Cột ${attackerCoord.col}, Hàng ${attackerCoord.row})</span>
          </div>
        </div>
      </div>
    `;

    targetsList.style.display = 'flex';

    if (!capturableList || capturableList.length === 0) {
      targetsList.innerHTML = `
        <div class="ziga-tactical-empty">
          <span>⚔️ Hiện tại <strong>không có quân đối phương nào</strong> nằm trong tầm đánh.</span>
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
        const targetCoord = ZigaMod.formatXiangqiCoord
          ? ZigaMod.formatXiangqiCoord(item.col, item.row, item.color)
          : { col: (item.color === 0 ? 9 - item.col : item.col + 1), row: (item.color === 0 ? item.row + 1 : 10 - item.row) };

        targetsHtml += `
          <div class="ziga-target-item ${targetColorClass}">
            <span class="ziga-target-token">${item.char}</span>
            <span class="ziga-target-name">${item.name}</span>
            <span class="ziga-target-pos">(C${targetCoord.col}, H${targetCoord.row})</span>
            <span class="ziga-target-val">+${item.value}đ</span>
          </div>
        `;
      });

      targetsHtml += `</div>`;
      targetsList.innerHTML = targetsHtml;
    }
  }

  function renderPieceList(deadPieces, color) {
    if (!deadPieces || deadPieces.length === 0) {
      return '<div class="ziga-empty-note">Chưa bị ăn quân nào</div>';
    }

    const counts = {};
    ZigaMod.DISPLAY_ORDER.forEach(type => { counts[type] = 0; });
    deadPieces.forEach(p => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });

    let html = '';
    ZigaMod.DISPLAY_ORDER.forEach(type => {
      const count = counts[type];
      if (count > 0) {
        const def = ZigaMod.PIECE_DEFS[type] || { name: '?', total: 1 };
        const char = ZigaMod.getPieceChar(type, color);
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

  const PIECE_TYPES_ORDER = [3, 4, 5, 1, 2, 6]; // Xe, Pháo, Mã, Sĩ, Tượng, Tốt

  function updateMaterialTooltipLive(mat, myName, oppName) {
    const calcEl = document.getElementById('ziga-mat-tt-live-calc');
    const tbody = document.getElementById('ziga-mat-tt-tbody');
    if (!calcEl || !tbody) return;

    if (!mat) {
      calcEl.innerHTML = `<div style="text-align: center; color: #94a3b8; font-style: italic;">Chờ vào ván cờ (Mỗi bên xuất phát với 50.5đ)</div>`;
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 6px; font-style: italic;">Chưa bắt đầu ván đấu</td></tr>`;
      return;
    }

    const myNameShort = myName ? myName.slice(0, 10) : 'Bạn';
    const oppNameShort = oppName ? oppName.slice(0, 10) : 'Địch';

    let diffClass = 'neutral';
    let diffText = '0đ (Cân bằng)';
    if (mat.diff > 0) {
      diffClass = 'green';
      diffText = `+${mat.diff}đ (Bạn ưu thế)`;
    } else if (mat.diff < 0) {
      diffClass = 'red';
      diffText = `${mat.diff}đ (Đối thủ ưu thế)`;
    }

    calcEl.innerHTML = `
      <div class="ziga-mat-tt-score-row">
        <span class="ziga-mat-tt-player-sc my">🔵 [${myNameShort}]: <strong>${mat.myScore}đ</strong></span>
        <span class="ziga-mat-tt-vs">vs</span>
        <span class="ziga-mat-tt-player-sc opp">🔴 [${oppNameShort}]: <strong>${mat.oppScore}đ</strong></span>
      </div>
      <div class="ziga-mat-tt-diff-row">
        <span>Phép tính: <strong>${mat.myScore}</strong> − <strong>${mat.oppScore}</strong> = </span>
        <strong class="${diffClass}">${diffText}</strong>
      </div>
    `;

    let rowsHtml = '';
    PIECE_TYPES_ORDER.forEach(type => {
      const def = ZigaMod.PIECE_DEFS[type];
      if (!def) return;
      const myC = (mat.myCounts && mat.myCounts[type]) || 0;
      const oppC = (mat.oppCounts && mat.oppCounts[type]) || 0;
      const pointDiff = (myC - oppC) * def.value;

      let diffTag = '<span style="color:#94a3b8;">=</span>';
      if (pointDiff > 0) {
        diffTag = `<span class="green">+${pointDiff}đ</span>`;
      } else if (pointDiff < 0) {
        diffTag = `<span class="red">${pointDiff}đ</span>`;
      }

      rowsHtml += `
        <tr>
          <td class="ziga-mat-col-name">${def.name} <small style="color:#94a3b8;">(${def.value}đ)</small></td>
          <td class="ziga-mat-col-num ${myC > oppC ? 'bold-green' : ''}">${myC}</td>
          <td class="ziga-mat-col-num ${oppC > myC ? 'bold-red' : ''}">${oppC}</td>
          <td class="ziga-mat-col-diff">${diffTag}</td>
        </tr>
      `;
    });

    rowsHtml += `
      <tr class="ziga-mat-row-total">
        <td><strong>Tổng điểm</strong></td>
        <td><strong>${mat.myScore}đ</strong></td>
        <td><strong>${mat.oppScore}đ</strong></td>
        <td><strong class="${diffClass}">${mat.diff > 0 ? '+' + mat.diff : mat.diff}đ</strong></td>
      </tr>
    `;

    tbody.innerHTML = rowsHtml;
  }

  // Export to namespace
  ZigaMod.createOverlay = createOverlay;
  ZigaMod.toggleMinimize = toggleMinimize;
  ZigaMod.updateMaterialTooltipLive = updateMaterialTooltipLive;
  ZigaMod.applySettingsVisibility = applySettingsVisibility;
  ZigaMod.setupDraggable = setupDraggable;
  ZigaMod.setupResizable = setupResizable;
  ZigaMod.clearTacticalHud = clearTacticalHud;
  ZigaMod.updateTacticalHud = updateTacticalHud;
  ZigaMod.renderPieceList = renderPieceList;
  ZigaMod.getWidgetEl = function () { return widgetEl; };

  Object.defineProperty(ZigaMod, 'widgetEl', {
    get: function () { return widgetEl; },
    set: function (val) { widgetEl = val; },
    configurable: true
  });

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/main.js =====
// src/main.js - Game data extraction, material calculation, ad cleaner, and main update loop
(function (ZigaMod) {
  'use strict';

  console.log('[Ziga Mod] Main module initializing...');

  let lastStateHash = '';

  function getActiveGameLayer() {
    if (!window.BkGlobal || !window.BkGlobal.Yj) return null;
    return window.BkGlobal.Yj.ja ? window.BkGlobal.Yj.ja() : null;
  }

  function getActiveGameData() {
    if (!window.BkGlobal || !window.BkGlobal.Yj) return null;
    const gameLayer = window.BkGlobal.Yj.ja ? window.BkGlobal.Yj.ja() : null;
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V) || gameLayer.V.length !== 32) {
      return null;
    }

    const logicMgr = window.BkLogicManager ? window.BkLogicManager.na() : null;
    const myPlayer = logicMgr && logicMgr.Ba ? logicMgr.Ba() : null;

    let myColor = 0;
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

  function computeMaterialScore(aliveMy, aliveOpp) {
    let myScore = 0;
    let oppScore = 0;
    const myCounts = { 3: 0, 4: 0, 5: 0, 1: 0, 2: 0, 6: 0 };
    const oppCounts = { 3: 0, 4: 0, 5: 0, 1: 0, 2: 0, 6: 0 };

    aliveMy.forEach(p => {
      const def = ZigaMod.PIECE_DEFS[p.type];
      if (def) {
        myScore += def.value;
        if (myCounts[p.type] !== undefined) myCounts[p.type]++;
      }
    });

    aliveOpp.forEach(p => {
      const def = ZigaMod.PIECE_DEFS[p.type];
      if (def) {
        oppScore += def.value;
        if (oppCounts[p.type] !== undefined) oppCounts[p.type]++;
      }
    });

    const diff = myScore - oppScore;
    return { myScore, oppScore, diff, myCounts, oppCounts };
  }

  function countKeyPieces(alivePieces) {
    let xe = 0, phao = 0, ma = 0;
    alivePieces.forEach(p => {
      if (p.type === 3) xe++;
      if (p.type === 4) phao++;
      if (p.type === 5) ma++;
    });
    return `${xe}X · ${phao}P · ${ma}M`;
  }

  function cleanObstructingAds() {
    const adSelectors = [
      'ins.adsbygoogle',
      '.google-auto-placed',
      'iframe[id^="aswift"]',
      'iframe[name^="aswift"]',
      'div[id^="aswift"]',
      'div[id^="google_ads"]',
      'iframe[id^="google_ads"]',
      '.ads-frame',
      '[id*="banner_left"]',
      '[id*="banner_right"]',
      '[class*="banner-left"]',
      '[class*="banner-right"]'
    ];

    for (let i = 0; i < adSelectors.length; i++) {
      const nodes = document.querySelectorAll(adSelectors[i]);
      for (let j = 0; j < nodes.length; j++) {
        const el = nodes[j];
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('z-index', '-9999', 'important');
        el.style.setProperty('width', '0', 'important');
        el.style.setProperty('height', '0', 'important');
      }
    }

    if (document.body) {
      const children = document.body.children;
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (!el || el.id === 'ziga-mod-widget' || el.id === 'gameCanvas' || el.id === 'Cocos2dGameContainer' || el.classList.contains('modal')) {
          continue;
        }
        try {
          const comp = window.getComputedStyle(el);
          if (comp.position === 'fixed') {
            if (el.querySelector('iframe') || el.querySelector('ins') || el.tagName === 'IFRAME' || el.tagName === 'INS' || (el.className && typeof el.className === 'string' && el.className.includes('google')) || (comp.zIndex && Number(comp.zIndex) > 1000)) {
              el.style.setProperty('display', 'none', 'important');
              el.style.setProperty('z-index', '-9999', 'important');
            }
          }
        } catch (e) { }
      }
    }

    const widgetEl = ZigaMod.widgetEl || document.getElementById('ziga-mod-widget');
    if (widgetEl) {
      widgetEl.style.setProperty('z-index', '2147483647', 'important');
      widgetEl.style.setProperty('position', 'fixed', 'important');
      if (document.body && document.body.lastElementChild !== widgetEl) {
        document.body.appendChild(widgetEl);
      }
    }
  }

  function updateMod() {
    ZigaMod.createOverlay();
    cleanObstructingAds();

    const widgetEl = ZigaMod.widgetEl || document.getElementById('ziga-mod-widget');
    if (!widgetEl) return;

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
        if (statusDot) statusDot.className = 'ziga-mod-dot waiting';
        if (statusText) statusText.textContent = 'Chờ vào ván cờ...';
        if (materialWrapper) materialWrapper.style.display = 'none';
        if (oppDeadCount) oppDeadCount.textContent = '0/16';
        if (selfDeadCount) selfDeadCount.textContent = '0/16';
        if (oppPiecesContainer) oppPiecesContainer.innerHTML = '<div class="ziga-empty-note">Chờ bắt đầu ván đấu...</div>';
        if (selfPiecesContainer) selfPiecesContainer.innerHTML = '<div class="ziga-empty-note">Chờ bắt đầu ván đấu...</div>';
        if (statOppVal) statOppVal.textContent = '-';
        if (statSelfVal) statSelfVal.textContent = '-';
        ZigaMod.clearTacticalHud();
        ZigaMod.updateThreatUi([]);
        ZigaMod.updateCoUpUi(null);
        if (ZigaMod.updateMaterialTooltipLive) {
          ZigaMod.updateMaterialTooltipLive(null);
        }
      }
      ZigaMod.applySettingsVisibility();
      return;
    }

    // Hook game engine for native highlights & row numbers
    ZigaMod.hookGameLayer(data.gameLayer);
    if (ZigaMod.setupRowNumbers) {
      ZigaMod.setupRowNumbers(data.gameLayer);
    }

    // Threat Scanner (Under-Attack Alert)
    const threats = ZigaMod.scanThreats(data.gameLayer, data.myColor, data.oppColor);
    ZigaMod.updateThreatUi(threats);

    // Co Up Probability Tracker
    if (ZigaMod.isCoUpGame(data.gameLayer)) {
      const coUpStats = ZigaMod.computeCoUpStats(data.gameLayer, data.myColor, data.oppColor);
      ZigaMod.updateCoUpUi(coUpStats, data.oppName, data.myName);
    } else {
      ZigaMod.updateCoUpUi(null);
    }

    const userSettings = ZigaMod.userSettings;
    const currentHash = `${data.myColor}_${data.deadMyPieces.length}_${data.deadOppPieces.length}_${userSettings.vietnameseLabels}_${threats.length}`;
    if (currentHash === lastStateHash) {
      return;
    }
    lastStateHash = currentHash;

    // In game status
    if (statusDot) statusDot.className = 'ziga-mod-dot active';
    if (statusText) statusText.textContent = data.isSpectator ? `Đang xem ván (${data.myName} vs ${data.oppName})` : `Trận đấu: Bạn vs ${data.oppName}`;

    const oppColorName = data.oppColor === 0 ? 'Đỏ 🔴' : 'Đen ⚫';
    const selfColorName = data.myColor === 0 ? 'Đỏ 🔴' : 'Đen ⚫';

    if (oppLabel) oppLabel.textContent = `${oppColorName} [${data.oppName}] ĐÃ MẤT`;
    if (oppDeadCount) oppDeadCount.textContent = `${data.deadOppPieces.length}/16`;

    if (selfLabel) selfLabel.textContent = `${selfColorName} [${data.myName}] ĐÃ MẤT`;
    if (selfDeadCount) selfDeadCount.textContent = `${data.deadMyPieces.length}/16`;

    if (oppPiecesContainer) oppPiecesContainer.innerHTML = ZigaMod.renderPieceList(data.deadOppPieces, data.oppColor);
    if (selfPiecesContainer) selfPiecesContainer.innerHTML = ZigaMod.renderPieceList(data.deadMyPieces, data.myColor);

    // Material Advantage
    if (userSettings.materialAdvantage) {
      const mat = computeMaterialScore(data.aliveMyPieces, data.aliveOppPieces);
      if (materialWrapper) materialWrapper.style.display = 'flex';
      if (materialScore) {
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
      }
      if (ZigaMod.updateMaterialTooltipLive) {
        ZigaMod.updateMaterialTooltipLive(mat, data.myName, data.oppName);
      }
    } else if (materialWrapper) {
      materialWrapper.style.display = 'none';
    }

    if (statOppName) statOppName.textContent = `${data.oppName.slice(0, 10)}`;
    if (statOppVal) statOppVal.textContent = countKeyPieces(data.aliveOppPieces);
    if (statSelfName) statSelfName.textContent = `${data.myName.slice(0, 10)}`;
    if (statSelfVal) statSelfVal.textContent = countKeyPieces(data.aliveMyPieces);

    ZigaMod.applySettingsVisibility();
  }

  // Export to namespace
  ZigaMod.getActiveGameLayer = getActiveGameLayer;
  ZigaMod.getActiveGameData = getActiveGameData;
  ZigaMod.computeMaterialScore = computeMaterialScore;
  ZigaMod.countKeyPieces = countKeyPieces;
  ZigaMod.cleanObstructingAds = cleanObstructingAds;
  ZigaMod.updateMod = updateMod;
  ZigaMod.lastStateHash = lastStateHash;

  // Start polling loop
  setInterval(updateMod, 300);

  // Initial trigger
  window.addEventListener('load', () => {
    setTimeout(updateMod, 1000);
  });

  console.log('[Ziga Mod] Advanced Xiangqi & Co Up Helper initialized.');

})(window.ZigaMod = window.ZigaMod || {});


})();
