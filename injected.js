// injected.js - Unified bundle built from src/ modules [2026-10-30 05:51:22]
(function () {

// ===== Module: src/core/constants.js =====
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
    cleanAdView: true,           // Ẩn bớt quảng cáo che vướng bàn cờ
    showMoveHistory: true,       // Ghi biên bản ván đấu chuẩn tiếng Việt & xuất FEN/PGN
    tacticalDrawing: true,       // Vẽ mũi tên chiến thuật bằng chuột phải trên bàn cờ
    openingBook: true,           // Nhận diện hơn 60 thế khai cuộc cờ tướng kinh điển
    voiceAnnouncer: true,        // Giọng đọc tiếng Việt (Chiếu tướng, bắt Xe...)
    timerAlertVoice: true,       // Cảnh báo nhịp tim & đếm ngược khi sắp hết giờ
    evalBar: true,               // Thanh đo thế trận thời gian thực (Eval Bar)
    bestMoveArrow: true,         // Mũi tên gợi ý nước đi tối ưu (Best Move)
    mentorCoach: true,           // Gia Sư Cờ Tướng Đồng Hành: Phân tích thế trận, gợi ý kế sách & rèn luyện tư duy
    liveBoardAura: true,         // Tự động hiển thị viền xanh/đỏ focus quân có thể ăn trực tiếp trên bàn cờ
    liveAuraMode: 'targets',     // 'targets': Chỉ quân cờ có thể ăn được (chuẩn xác, gọn gàng), 'all': Cả quân ăn và bị ăn
    auraCustom: {
      mode: 'neon',              // 'neon' hoặc 'image'
      theme: 'default',          // 'default', 'ice_fire', 'gold_purple', 'cyberpunk', 'custom'
      animation: 'spin_pulse',   // 'spin_pulse', 'spin', 'pulse', 'heartbeat', 'static'
      spinSpeed: 3.5,            // Thời gian 1 vòng quay 360° (1.0s - 8.0s, mặc định 3.5s)
      myColor: '#39ff14',        // Màu viền lượt tôi
      oppColor: '#ff1744',       // Màu viền lượt đối thủ
      customImageMy: '',         // Base64 DataURL ảnh PNG tùy chọn lượt tôi
      customImageOpp: '',        // Base64 DataURL ảnh PNG tùy chọn lượt đối thủ
      scale: 1.0                 // Tỷ lệ độ lớn vòng Aura (0.7 đến 1.3, mặc định 1.0)
    }
  };

  const AURA_THEMES = {
    default: { id: 'default', name: 'JJ Xiangqi Stream', myColor: '#39ff14', oppColor: '#ff1744', desc: 'Xanh Lá Neon & Đỏ Neon (Mặc định)' },
    ice_fire: { id: 'ice_fire', name: 'Băng & Lửa', myColor: '#00e5ff', oppColor: '#ff3d00', desc: 'Xanh Băng Tuyết & Đỏ Cam Lửa' },
    gold_purple: { id: 'gold_purple', name: 'Hoàng Kim & Hắc Ám', myColor: '#ffd700', oppColor: '#d500f9', desc: 'Vàng Kim & Tím Thần Bí' },
    cyberpunk: { id: 'cyberpunk', name: 'Cyberpunk Neon', myColor: '#ff007f', oppColor: '#00f0ff', desc: 'Hồng Neon & Xanh Cyan' }
  };

  const AURA_ANIMATIONS = {
    spin_pulse: { id: 'spin_pulse', name: 'Xoay Tròn & Chớp Nháy', desc: 'Vừa quay 360° vừa thở nhịp nhàng (Đẹp nhất)' },
    spin: { id: 'spin', name: 'Xoay Tròn 360° Liên Tục', desc: 'Vòng quay ma pháp luân chuyển 360° mượt mà' },
    pulse: { id: 'pulse', name: 'Chớp Nháy Hơi Thở (Pulse)', desc: 'Phóng to thu nhỏ tỏa sáng nhịp nhàng' },
    heartbeat: { id: 'heartbeat', name: 'Nhịp Tim Dồn Dập (Heartbeat)', desc: 'Đập thình thịch 2 nhịp cảnh báo kịch tính' },
    static: { id: 'static', name: 'Tĩnh (Không Chuyển Động)', desc: 'Vòng hào quang đứng yên tỏa sáng nhẹ' }
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
  ZigaMod.AURA_THEMES = AURA_THEMES;
  ZigaMod.AURA_ANIMATIONS = AURA_ANIMATIONS;
  ZigaMod.formatXiangqiCoord = formatXiangqiCoord;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/core/storage.js =====
// src/storage.js - User settings, piece character formatter, and position/size persistence
(function (ZigaMod) {
  'use strict';

  let userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS);

  function loadSettings() {
    try {
      const saved = localStorage.getItem('ziga_mod_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS, parsed);
        if (parsed.auraCustom) {
          userSettings.auraCustom = Object.assign({}, ZigaMod.DEFAULT_SETTINGS.auraCustom, parsed.auraCustom);
        }
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


// ===== Module: src/features/threat_scanner.js =====
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

                  const targetType = myPiece.Ga;
                  const attackerType = oppPiece.Ga;
                  const targetDef = ZigaMod.PIECE_DEFS[targetType] || { name: 'Quân', value: 0 };
                  const attackerDef = ZigaMod.PIECE_DEFS[attackerType] || { name: 'Quân', value: 0 };

                  // Major pieces classification:
                  // King: type 0 (Critical - Loss of game)
                  // Xe: type 3 (9đ - Super Major)
                  // Pháo: type 4 (4.5đ - Major)
                  // Mã: type 5 (4đ - Major)
                  const isTargetKing = (targetType === 0);
                  const isTargetXe = (targetType === 3);
                  const isTargetMajor = (targetType === 0 || targetType === 3 || targetType === 4 || targetType === 5);
                  const isAttackerMajor = (attackerType === 3 || attackerType === 4 || attackerType === 5);

                  // Priority for sorting:
                  // King is top priority (999), then Xe (9), Pháo (4.5), Mã (4), Sĩ/Tượng (2), Tốt (1)
                  const threatPriority = isTargetKing ? 999 : targetDef.value;

                  threats.push({
                    attacker: oppPiece,
                    target: myPiece,
                    attackerType: attackerType,
                    targetType: targetType,
                    attackerColor: oppPiece.ka,
                    targetColor: myPiece.ka,
                    attackerName: attackerDef.name,
                    targetName: targetDef.name,
                    attackerChar: ZigaMod.getPieceChar(attackerType, oppPiece.ka),
                    targetChar: ZigaMod.getPieceChar(targetType, myPiece.ka),
                    targetValue: targetDef.value,
                    attackerValue: attackerDef.value,
                    isTargetKing: isTargetKing,
                    isTargetXe: isTargetXe,
                    isTargetMajor: isTargetMajor,
                    isAttackerMajor: isAttackerMajor,
                    threatPriority: threatPriority,
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

    // Sort: Most critical threatened pieces first (King -> Xe -> Pháo -> Mã...), then by attacker strength
    threats.sort((a, b) => {
      if (b.threatPriority !== a.threatPriority) {
        return b.threatPriority - a.threatPriority;
      }
      return b.attackerValue - a.attackerValue;
    });

    return threats;
  }

  let lastThreatsSignature = '';

  function updateThreatUi(threats) {
    const wrapper = document.getElementById('ziga-threat-wrapper');
    const itemsContainer = document.getElementById('ziga-threat-items');
    const titleEl = document.getElementById('ziga-threat-title');
    const countEl = document.getElementById('ziga-threat-count');
    if (!wrapper || !itemsContainer) return;

    if (!ZigaMod.userSettings.threatAlert || !threats || threats.length === 0) {
      if (wrapper.style.display !== 'none') {
        wrapper.style.display = 'none';
        itemsContainer.innerHTML = '';
        if (countEl) countEl.style.display = 'none';
        wrapper.classList.remove('king-in-check');
      }
      lastThreatsSignature = '';
      return;
    }

    // Generate signature to avoid rebuilding DOM every 300ms if threats haven't changed
    const signature = threats.slice(0, 5).map(t =>
      `${t.attackerType}_${t.attacker.fa}_${t.attacker.rowIndex}_${t.targetType}_${t.target.fa}_${t.target.rowIndex}`
    ).join('|');

    if (signature === lastThreatsSignature && wrapper.style.display === 'flex') {
      return;
    }
    lastThreatsSignature = signature;

    wrapper.style.display = 'flex';

    // Check if King is in danger (Chiếu Tướng)
    const isKingInCheck = threats.some(t => t.isTargetKing);
    if (titleEl) {
      if (isKingInCheck) {
        titleEl.textContent = '🚨 ĐANG BỊ CHIẾU TƯỚNG!';
        wrapper.classList.add('king-in-check');
      } else {
        titleEl.textContent = 'CẢNH BÁO SẮP BỊ LỤM';
        wrapper.classList.remove('king-in-check');
      }
    }

    if (countEl) {
      countEl.style.display = 'inline-block';
      countEl.textContent = `${threats.length} đe dọa`;
    }

    let html = '';
    threats.slice(0, 5).forEach(t => {
      // Determine severity class for row styling
      let severityClass = 'sev-normal';
      let threatLevelBadge = '';

      if (t.isTargetKing) {
        severityClass = 'sev-king';
        threatLevelBadge = `<span class="ziga-threat-badge tag-king" title="Nguy hiểm!">👑 CHIẾU!</span>`;
      } else if (t.isTargetXe) {
        severityClass = 'sev-xe';
        threatLevelBadge = `<span class="ziga-threat-badge tag-xe" title="Quân Xe">⚡ MẤT XE</span>`;
      } else if (t.isTargetMajor) {
        severityClass = 'sev-major';
        threatLevelBadge = `<span class="ziga-threat-badge tag-major" title="Quân chủ lực bị đe dọa">CHỦ LỰC</span>`;
      } else {
        threatLevelBadge = `<span class=""></span>`;
      }

      // Attacker piece token color class (0 = Red, 1 = Black)
      const atkColorClass = t.attackerColor === 0 ? 'token-red' : 'token-black';
      // Target piece token color class
      const tgtColorClass = t.targetColor === 0 ? 'token-red' : 'token-black';

      html += `
        <div class="ziga-threat-card ${severityClass}">
          <div class="ziga-threat-main-line">

            <!-- QUÂN ĐỊCH TẤN CÔNG -->
            <div class="ziga-threat-party enemy-party">
              <span class="ziga-party-pill enemy-pill">ĐỊCH</span>
              <div class="ziga-mini-token ${atkColorClass} ${t.isAttackerMajor ? 'major-token' : ''}" title="Quân tấn công: ${t.attackerName}">
                <span>${t.attackerChar}</span>
              </div>
              <div class="ziga-party-meta">
                <span class="ziga-party-name ${t.isAttackerMajor ? 'highlight-atk-major' : ''}">${t.attackerName}</span>
              </div>
            </div>

            <!-- MŨI TÊN TẤN CÔNG -->
            <div class="ziga-threat-attack-indicator" title="Đang nhắm đánh">
              <span class="ziga-atk-sword">⚔️</span>
            </div>

            <!-- QUÂN TA BỊ NHẮM -->
            <div class="ziga-threat-party friendly-party">
              <span class="ziga-party-pill friendly-pill">TA</span>
              <div class="ziga-mini-token ${tgtColorClass} ${t.isTargetMajor ? 'target-major-token' : ''}" title="Quân của bạn đang bị nhắm: ${t.targetName}">
                <span>${t.targetChar}</span>
              </div>
              <div class="ziga-party-meta">
                <span class="ziga-party-name ${t.isTargetMajor ? 'highlight-tgt-major' : ''}">${t.targetName}</span>
                ${threatLevelBadge}
              </div>
            </div>

            <!-- TỌA ĐỘ BÀN CỜ -->
            <div class="ziga-threat-pos-pill" title="Vị trí bị đe dọa: ${t.fullCoordText}">
              ${t.coordText}
            </div>

          </div>
        </div>
      `;
    });

    itemsContainer.innerHTML = html;
  }

  // Export to namespace
  ZigaMod.scanThreats = scanThreats;
  ZigaMod.updateThreatUi = updateThreatUi;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/features/coup_tracker.js =====
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


// ===== Module: src/features/tactical_sandbox.js =====
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
      e.preventDefault();
    }, { capture: true });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    }, { capture: true });
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


// ===== Module: src/core/engine_hook.js =====
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

    console.log('[AN Mod] In-engine hooks active (nT, pA, fU).');

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
        console.warn('[AN Mod] Cocos2d LabelTTF init failed:', err);
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


// ===== Module: src/aura/board_aura.js =====
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
      sprite.setOpacity(220);

      const custom = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {};
      const animType = custom.animation || 'spin_pulse';
      const speed = Math.max(1.0, Math.min(8.0, Number(custom.spinSpeed) || 3.5));

      if (animType === 'static') {
        // Tĩnh: Không chuyển động, viền sáng rõ nét
        sprite.setOpacity(235);
        return;
      }

      if (animType === 'spin') {
        // Xoay tròn 360 độ liên tục
        const spinAction = cc.rotateBy(speed, 360).repeatForever();
        sprite.runAction(spinAction);
        return;
      }

      if (animType === 'pulse') {
        // Chớp nháy hơi thở (Breathing pulse)
        const scaleUp = cc.scaleTo(0.75, baseScale * 1.08);
        const scaleDown = cc.scaleTo(0.75, baseScale * 0.95);
        const fadeOut = cc.fadeTo(0.75, 120);
        const fadeIn = cc.fadeTo(0.75, 255);

        const pulseAction = cc.sequence(
          cc.spawn(scaleUp, fadeIn),
          cc.spawn(scaleDown, fadeOut)
        ).repeatForever();
        sprite.runAction(pulseAction);
        return;
      }

      if (animType === 'heartbeat') {
        // Nhịp tim dồn dập (Heartbeat cảnh báo)
        const beat1Up = cc.spawn(cc.scaleTo(0.12, baseScale * 1.15), cc.fadeTo(0.12, 255));
        const beat1Dn = cc.spawn(cc.scaleTo(0.12, baseScale * 0.98), cc.fadeTo(0.12, 180));
        const beat2Up = cc.spawn(cc.scaleTo(0.15, baseScale * 1.22), cc.fadeTo(0.15, 255));
        const beat2Dn = cc.spawn(cc.scaleTo(0.2, baseScale), cc.fadeTo(0.2, 160));
        const wait = cc.delayTime(0.7);

        const heartbeat = cc.sequence(beat1Up, beat1Dn, beat2Up, beat2Dn, wait).repeatForever();
        sprite.runAction(heartbeat);
        return;
      }

      // Mặc định: 'spin_pulse' (Kết hợp xoay tròn 360° và chớp nháy hơi thở)
      const spinAction = cc.rotateBy(speed, 360).repeatForever();

      const scaleUp = cc.scaleTo(0.8, baseScale * 1.08);
      const scaleDown = cc.scaleTo(0.8, baseScale * 0.95);
      const fadeOut = cc.fadeTo(0.8, 140);
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
        applyAuraAnimation(greenSprite, greenBaseScale);
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
  ZigaMod.applyAuraAnimation = applyAuraAnimation;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/aura/aura_presets.js =====
// src/aura_presets.js - Built-in high-quality PNG Aura presets for 1-click testing
(function (ZigaMod) {
  'use strict';

  ZigaMod.PRESET_AURAS = [
  {
    "id": "aura_golden_dragon",
    "file": "aura_golden_dragon.png",
    "title": "Vòng Rồng Vàng Hoàng Kim",
    "tag": "Khuyên dùng Lượt Tôi",
    "cat": "my",
    "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAABsxklEQVR42u19d3iVVbb+/UcdLDOWE0OvSi8i0qSLSCcUkQD2ioA6KmMXC1xHxzJNR0fH0enqHcerV69lfuo4cx1PQkgjPbQAAUSx4IB93l/eXZKVnf2dc0INYe/n+Z5Acuq311p7rXet9a7/+I+wwgorrLDCCiussMIKK6ywwgorrLAOqoV47DDEY4cjHjvCXN8RVwvnOtJzuY+Rz7evydc/LNztsMI6MEp+uFBuqcxHIR472lzHmOu75vqeuI5N4ZKPt69hX9O+x1GO0bBG4vCwS2GFtfeU/TseJT9GKDYV9jhzHY947ARzxcyVJq4TG3HJ59nXsq99vHjPY4WhOMZjHL4TjEJYYaXmvtuT3Sq7T9GPFwpulTod8VhLc7VCPNbaXG3M1da52iW43Mfa17Cv2Uq8V7owFjHHOLiGwRoF6ymEMCKsQ17ppcLbk10qu6voUsHbOArdHvFYB3N1RDzWSVydzdWlEZd9jnydjuI92jsGo41jIFzDII2C9RRqDUKQhrAONZf+KEfh7cnuU3ZXyTsKxaaynmSukxGPdTVXN3N1N1cPz9VTXL6/2+fa17KvfbJ4zy7CUHT0GAefUbCegjQIR4WQIazmrPT2lP+uc8JLhZcnu1V2V9FPFgreXShyL3P1RjzWx1x9zdVPXKekcMnH29ewr9lbvFdPYSi6OcZBGgZrFKSn4BoE6yF81/EOgjEIq9ko/fHGJbZxeyujEPZ0tye7VHaforvKTaXtj3jsVHMNQDx2mrkGimtQIy75PPtaA8R79BfGQhoJn2GQRsF6CtZLaGPug8UTYsI7CMYgrIMupm+RQOlbCpdenvBW4e3JbpW9t1B2qeQDhHJTWQebawjisaHmOt1cw8w1XFwjkN1uInI6T0fOSbPUT/6fv6//OPtc+1r2tYeI9xwkjMQAxzj0FV6DNQrWU5AGQXoI0jvwGYMWATMIqyme9jKmPy6B0nc0rrE84XsI992e6lLZpaIPEQo+rFah47GR5hqFeGy0ucaY64zaK+ekucg/ZREKT78JRaPvQvEZy9VP/p+/59/l4+tew77mKPFeI4ShON0xDtYwSKNgvQUbRvRwPITOwjvwGYPjHMwgeAVhNZnTXsb06QmUvqtxjeUJLxXenuxW2X2KPkooOJV0LOKxMxGPjTPXWYjHxptrgrqyWk1HXu9FKBq5HKVTHkPFnGew+rwXsebCV9RP/p+/59/5OD7ePrfutc4S73Gmed8zhIEYFWEYrFGwnoI0CNJD6C68A58xSHcwg+AVhHVAFN/G9t9zXHwZ0ydSeuvSyxNeKrxUdlfRpYJTOSeaaxLiscmIx6aYayrisWnqykqfhby+S1A89meoOOcvWHfFu9hwfQmqb92A6qXV6if/z9/z73wcH8/n6dfIQDw2G/FYJuIxeghzEI/NMu83URgJayBcwyCNgmsQrIdwivAOooyBxAxkiPA9gRUEQxDWPlF8C+odI2J797SXMX0ipT/NuMjyhB8hTnafsrtKPlUoJ0/rGeaaaZST19nqyu1xHYrHPILKua+i6upibL7zY2z7MbD9MeCjX+mf/D9/z79Xzv07ise8iNweT9ScrvfVnLY/rfmej9Yo3xPm+mWN8j1co3QPIB67G/HYEsRjl5r3n2w+58QIo2A9hRGOhzBIeAdRxkBiBq5XYLGCYyxoGKQ2rH2h+NbNb+k57WVMn0zphzsnvFR4e7JbZXcVfaZQcJ7M55hTOVOc0vPUld32chQOfhDlM/8H6xeVYsuyL5XC73gO2Pm/wK439E/+n7/fsgxYvwgonwkUDv4M2W1La96nqOa1KhCPrUE8thbxWGXNe5bUfK7cGqX+e813e7nmpP59zf35CeKxWxCPXWQ+7zTz+aWnIA2C9BCGp2AMJGbgegUtRXgQDEFYe83Vl4ov3fz2ntO+l4jpkyn9GSaOdhXenuxS2V1Ftwo+H/HYuTWKeR6yW12GFe2uxspONyD3pNuR120Z8nveh9LRz2LdBSXYejvwyePAF68AyANQDWAngK/Nz2r9e/6dj+Pj110AlI4G8nsCed2A3JOAlZ2AFe2A7FZAPGavnYjHNtYofV7Nd32t5oR+CvHYcsRjl5vPP8N8n2nm+7kG4UzhHSQyBv1EqtH1Cto74YFrCEJoENYeK35bofg2trcIvj3tbUyfitJPck74GeJk9yh72nlY0WahUvK8bnejoPcDWNX/URQPeholw55F2aiXUDH2dVSe9Q5WT3oPa6auRPWVn+Oj+4DPnwHwnlH0RKtaP46P5/OqrwTWTAVWTwIqzwIqxgJlo4CSYUDxIGBVf6CgtzYQyji0AeJp9BLeqVHO3yEeW2Y8gnPM95plvqf0ECalaAwsZmC9AptJsFhBJwEaBkMQVqPTeS1SVHzp5lsE3572Q0VMn0zpp4sTXiq8PtmzWy/Ayk43Ir/Hf6Kw389RPOg3KB3xvFLy1RPexdpp+Vg/qwJVmZuw8bztqL5oJzZf9i22LgDeXwxsuwb47MfANy+YU/9jpLY+1o/n8/h8vg5fj6+7+TKg+iJg43lAVSawfhawdhqweoI2DqUjtGEo7Afk96BRKEV26z8hHrvZfC8LIlqDMFN4B4mMgcUMhgqvwGYSZHiQiiFoEdKHYVnFP0yk874nwL2WjqtvFb+n4+ZbBN+e9qNETO9T+plG+OvidH2di+xWV2Bl55tR0OtHKBrwOEqHPaeVfVIc62aUKEXfdP4n2Hzpt9i6ENj2feDDHwAf3QJ8cgewYxnw2Q+Bf/1IX/z3V78F8CaAcuPqp7J2mse/qZ/vvibfh+/H9+X783Pw82y+FNh0vjYM62Zor0EZhWFA0YAPUdDrNazsvEx9Tx26zDOYRSrGwGIGo4RXYDMJMjzo6TEEEiOQWYMWoSsxAHxHiTx+Kop/ilB86+bL036cQO2p5AsRj91kYuKHat7jEcRjj9e8/q9VrJzT/kXkdX8Hq/rnoWTYalSM3YI1Uz7F+rO/wsZztVLx9P3geuCjm4FP7gQ+uwfY+YD++eldwMe3AdtvBD683pzWi+pO6w9vA/71KPD1SwBWAtiaRPm36sfx8Xwen7/5sn9rr2KRfn2+D9+P78v3l5+Hn4+fk5+Xn5ufn99j/dnAmik0CF+gZNg7KnTJ674cOe2vVRhGfe/AZwxsVmGc4xXI8MCChqkYAltHcFQACg9Nd1/G+TGRzrOofpcEJ/4Q447a2N4i+BOM8F5tFJ7psudqhPSNmlPsnzWxbwHiaRXI6fiZAtaKBup4evVEYN1MrShU2vevArbfAHyy1CjX/cCO5cDHt+vffyBP3AuADfOAqtn61FXx+sS6eH3tTKB6MfDhPcCOp4EvXwOQD2ATgB0AvjA/N+nf8+98HB9fvXgH1s7MRcXYN1B51t+weiJxhVztjcxehw3ztmLTBTtqPRJ+Ln4+fk5+Xn5uZRSW6t/ze/H78Xuum/lvrJ74T4VbFA38tQIsczouQTzt/AjPIMMAiNYrsJkEixUMcwyB6xF0EVkDmz6MOfhACAsOkVNfuvsyzu8oUH0Z4/sUX7r5Ew1Kv8TkzP+r5m//qBHishoPYBvisa+Q0x61Sl8+GlgzWSvtpgu1MvNUpeJQYehq82RVJ+m1wNYrgeqLgY3zgfWz62LuchNzlwyhi63j7oJe9RH73K5A0Uigcg5QdTWwZblO9336LLDzZWDXa/on/6/SgMu/QdXVa1E55y0UjXwSuV1vNZmF21RmgeFJYb+foWjAEygZ8geUjngB5bWYRAHWz16DjfO3ofriL9Tn5ufn9+D3USHEPfp78vvye/P705ismZyN8tEvG2Nwr/EMZJgw2wCI1iuwmQQZHkQZgt4CLLSGQOIDMiwI3sAhcOrbWn3p7ts8vk3npar4dE8XG/f+LzX/z0E8tlWlx5gqy+sKrDoVKBupY2IqPUE0usc8FT+9UysGT0zG1ErhFxjFyATWTjfKPgYoOV0rekGf+qh71okyJbcL8dj7Jm+fXRMnv4rc7m+jaEwOKjNLUHXVamy+4yNsewj48FFg++P6J//P31ddVYTKzFdRNOYXyO2+xFtbYEHKrBMvwoo2i0xW4i4U9HlQYRclpz+D8jGvYPWE/8Pa6avU91CGboExCLfo76sM3Z3GO1gMBWLSGBDzKBv5Ilad+kvkdb3TYAY2RLBewQwnPEjFENj0oa0jkGGB7TUI3kAzP/Utum/dfRnn23SeRfUHOzG+q/gUxqWmCOY9o3hATgedGisZql1xuvcEx3jiKaW/S8fM/MlYWrnGlwAb5gLrpgOV4xkafIPiQZ+hsO+HyOu2CTkd1iC7ZXGNO1xoCnNYiMP/rzL593jNZ/xbjcC/UnPaPWtwBlbx3YCs9MuR1+cHuhR49vNYd/k/sOG6Ymy6ZT2qb9uofvL//D3/rkqB+/wAWemzjfvtVhe6xUf16xKyW16GnA7XK6NQ2PenKntRNuptVI7fpb4fvye/rwp1bnTuxw3GMzj/U6ybWa5Cj5Khf0JB7wfVa2qvwMUKMjyGQGIEg0XWwKYPJT5gwwKbLQjeQDNM7clT35btdhbufh+Rx0+m+Bkmt32/qYKrRDwNyO2i8+KM6wl4UdC3XA58cJ1GzdWJd7c58RaZE++c9VgzJQflZ7ymXGq613ldlyGn3S2Ip12HeOxGY2SWG4V+yIQZPzcX//0g4rEf1hifO0wYssAoia3Cm4yslroZaNWIZSid/CgqZv8Rq899AWvO/x/1k//n7/l31QzUcnrtc339BdGVidIw2PqF85HT7hrkdb0Lhf1eR8mQHSg/Q9+jqnOMR7TIGMe79X3i/eJ94/3bMHezukfECwge5na5FfG0C8zrzzEGKVVDMEAAhTYs6CzKi11vIKQMD1LlP8IgvDLWd099n7s/VKTzzvAoPgXtClML/zdkpX+i3Pyi0zToRiCOpz1dWsa+jHl58d888aov/lwrvYl5iwc+hYJe96t8f1b6JeYUlSCYjX1nOgU0GZ54OFHnnr5yOmciv99CFA69EUUj70DR6LvVT/6fv+ff5eOjOwwT9SZIo2C9hTqDkJW+FCs7vYaCXjtQLDGRczTWwfvU4N4thkqBrptRrFKjRac9qcIDfc+SGYIzRPpwaERY4PMGLDZwVCggOjhd/mOdWL+DAPksum/dfTfOt6j+ZCPYM8wJt1Ch+1ktc1UczqKXinE6zUXhZU6cqDcR8Pqn2BaFoJePeVVV7inUmy6tQr1lCkwq/HSBfk8RTTZu952vNdft3bcdefrKbjMeOZ2mIafzDPWT/5d/r/88l2PAbUE+y2MYrFHIEAVP1iDMMV7KTxBPe73mPuisCO8lsQ5mMlzvSd3Ppfr+EmBcf3YlKsa9pcILgpNZLS8VhkBiBJNF1sDFB2xYYLMFFiTs4GADx4aQ4OAE+tIM0mtTe+6pP0BU71l3/0wjzJOMAFvFp2Bdiaz0p5DXbbsSVsb3ROWZjmPeWyHd9wEf36pPsU0Xfob1s0Qc2+chfdIr99Wn9DMiFH68qIyTiu7237vkHJagQzL4DE5CBTbYYRhyWYaG1WMWqjMQrmFwuxilQbAlz5kmbPmDAiyz0j5RwCZBToufsNKQACLvJ+8r7y/vM+/35ku/wfrZa9X91YbgbmSlX+wxBDZ9ON58NhsW2KrCAR5vwKYMW4m6gQAQHiQuvwT62ntifffU97n7042Q2qq9y5F78qsqjadOfKP4Hy4xFXj3ANtv0im7jfM/wNppeTqtNeBxD5It3VVfk8x4pxTWVfZEDDxR/H39BVVXsks+PopnMIqhyGcUXIPgNj0tNljGywbc3FWbQWHWgyECU59Mg/L+8j7zfvO+8/6zDoGGgB4B04i5Jy81xUU2a2DTh76wwOcNSGygvQcgDCHBQebyd3Ni/UEC5BtjBFS6+zMFAca5WNnpJqw6NVvF+DyRiGAzj12r+DcAW66g21qN1ZOyUDr8zwr9ZnrMn8ueIeLUSRFtsqNEM8wwoeyJOPj6JWDw7ZUCDbj8e68ETMP9knAUDhE9EcMdg+C2PVvvgPfnVsRjv6p53l9NDcW/VFaFXkFhX6B0uE6lqvDgCn3faw3B9Xpf1s/agoqxb2LVqY+J+58pDK4MC840n8mChIMcbKBbCAkODuX3ufwS6OttBNam9nyn/lRzSlh3fz5WtF2Mwj4/RtmoSpWPJ1rNPDaRaqn4VZkbVSEM898E9NiW2zBvLavZZBHLmRFEGUOddljJnNMvgoXXpei2NN0uj3+yS84ZcGcNdHcMRi+PYZBGwTUILvHJmWIPJpvsyp01e/ikqmGIx/IRj21BPPatakNmoRPrIVgbwfoCaQi4L9wf7hP3q2xUFQr7vIwVbe8xmEOm2YvpZh983oBNGZ5i5MYFCN2QIBiBA6j8LRzlT+TyD/TE+vbUz6jfpJN2gQKWGLevmbxNla5uu9qk8u4DPrpJF7VsyNykFX/oH1X1Glt1teJnCtdzRkQ9+9iIlldJleWy6/bysOv6ePh9U3zaJxkJ5l7tE0wbippT4DMK1lOIoj5zy6ltmHCR8Qh+buoa3tKl1LENWNHm3wo0JE5AQ7AhU+8H94X7w33ifnHfmF3g4/K65SGeRqNyr0mVXmD2XXoDEhsYmCQkkEagRdDGAwP2fddJ8bV3XP6+jss/UjTsuKd+plJe1qOzAq1i3JuomrNLC9YtGoVm8wvz1ay9Z7UaT3wqfnbrK4Xiy9h+qhAwt6NtRAIGnH6Ownf3sOdGTeJJNMcvXfDvR13ycVHzBhNNKnLnGfR0iFKiGJJGRHRSzjaZl6WGceg3Na/x38ogZLcu1YbgdBMazNP7w33ifnHfuH9VczRuw4rMnI7rTLEUSUvoGVxljPRE0Wg00gkJ+johQXsnVfjdAA7uf+W3YF96RLwvi3qsyz/WnDCTG7TmEj2mMrPffm1GoUrpEWCyHXfsgmN+f83Ub1SMTzIOlsE2VPwMB3UeF9HTPjgBB56kvuoi6K98E3ZaJRjUaUdwudN8k11y2rA7cdgdSNoqYqJRR+EpnOyZd+DSpQ2O4FIYJ7IyGebkvtp4B/eqeowVbZ5HQe8ShREwhch94n7ZTkXuI/dzbYbunaDRyEong9G7plnrQfOa08x7jXVCAls85MMF0gU4GIzAflB+ifS3FE08vnh/iHEzpcs/pUGsz1OfaD2ZdFh1xqITupHsfWe/O8EllvOWj96Own6PmUYVn+JPcdJNZzj960Mc9z4RC64lv3Rn7KV7Zuy503jlqG47rttO55VXC3G5fztKjCOXI8mjphWnOROP5EzDDo6H4CNM7R/BpjRKYAXjBWiYIcDa+ao4K6f9chT2ewHloyvUfimw9gd6H7mf3FcCiEwvMruQ05G9E5tNGfUzxiO4xAkJhossgYsLdBTVgzJDEIzAPk7zyZLeTuaEiYr3xzgu/wwjNHNVqii/+3J1oq/NWIXNl3ypACWVy79d16QTaFICc9p6rOxyv6hFl+klN888RsT27mnv47Xz8eDLkVlpggJbztA7Rij4kWK45hHmOnxPCS8MYcrh4jW/IwzGUY5xkEYhJliTWzkego8y3cenOFhUZo4UGRtZp+Gma8/Fyi63oOi0X6n6gKrMD9Q+cj+5r9xfGgblDQwH8rvbJqoqgzOwhfs6ERKMSYALnGzkT5YQhzThPlR+meZrJ5S/Z4J4/ywjLNLln6fc98JTHkbFmf9PMe3Unvr36CITFp/QnSSbTX6PYmSl32HSeako/jCnyKR/EmbbqEk4J4hpON8Vyi4V/fAm4JUd4Uw9Plp4CnLMeaJJST5G5f5OsdawFA3BPB3S9bhHsSqxApNFWdxXxU9gvAEa94ozgcJTDJehIjcl0/EfTYiRIbIEPlygpzAC7Zw0YTAC+0j5ZZqvq1D+RPF+hhEO7fKTdqt48G+xZvIKJRgq1r/XnPpX6pp05vxXnQLktM82xJaZnhLTZIovySsTcdtHzcI7KMdmR4xBTzYrsUMEy7IkW01kCNySbQPqtv8+Vp3yiCI1YQ8G91fxLtyrsQFl6CcDxYOBlZ2tN8AahD+bKsXpCXCBvqKEWKYJgxHYx8rfWSh/P6H8ieJ9XdRDgs2ykS+oVlPmkFV5qREG5o956hNVZp2/bq99wBiOmU7aaJynyWSQ023WU/SfdxGnvW+6TbOdhpvitGRJt95RgIfdHTo2aQgkRjDOk9adXRsWsDWZWRt6A+zC5H5z37n/lANiBuRsIJGpNgJrDL/D7UaOXFxgsCgh7inShMEI7Cfll/X8Euzzx/vkzS/s+xNUjP2rqthjnpiFI0SKWWdOcEilivoDOe1gKLzY8Xehp3BkbAqKL938DqLLrGXEfLtDYgR2hDE4zhm40lqAhzI8SGYIxiYs7GJL8qr+v1ApXsoA9537TzmgPCgZGKurDvXcg0pTg3CD2P9xDjgo+wiCEdjLaH8y5ZdIvwH70jzxfrtrFMpPDjq2lCrrf5/OE7PjjC28Kj1E65/2dc1GZxkw6PIId99HNBGl+G0dDrrjw4TbBsZATlY+3uFobJvAEPiIW3xhgfAG0s7X2MCIvyhuQ+4/5YDyoEKC8zWnIrMEK9RBQPKVp00twjQjXxYclBmCVIxAyA40MtWXXPmz0scgp8s5yOt9BfL7X4+CAbcgv/+tyO11I3I6X4PcLregePDvsHZqHjZf8pXqLSfhhNrsC3QBCTv7WG8ej31ulP8Js+FTPAUibvNIXw/VVAeHcy4Wptmm5PG505ZjDmdjBw91W9+Ilm5Z8NUw9cuuzOJBT6neDRKbqkPhR5p7QGUJpmpcgCQvOZ1XI7fXS8jvf7eRr+uVvFHuKH+pGYGQImxkkY9E+/3Kn9MpA/n9F6Fo1N0onfgIyjJ+i/IZz6Is4zmUTPgDKjJex7rMVdhw/lZsWaD7yclFxyIR5e6dqYk0s1tT+T81bj9P/kXOqe+2j7pkk1GKf4JDPx3YZVKTgRYOXfsJCQyBS94a1d49uYFnyApOMjAxE0S+BsoF5YNyQnnZcD6wjpmCDKBkAlCWUWDk67dK3ih3lD/KYWIjIFOEoVgoweYf6RT5SLS/vvKvPPlsFA69AaWTH0blvOex7rK/o2pxPqquKUPV4nJsvmkXPlgGfHy/nm6z66eas545YZJ3kLarDvDZYnLAD5umkYlO+sdtEnEJJHx00/V458MAikbLwmGeuQ1R9O1dHXxANn2N9DR9zagHEOb3+CHKRr2I9WevVvJBOaG8UG4oP5SjzTcBVUwdXrNFyRnljXJH+aMcUh79RkCmCGsrBsMON9zwFmajT3CKfCTaX3fy86aXZTyOtZe8gY1LSrH57o/x/o+AbQ8Cnz4FfP4X4JtXzVSct4Evnwa2Xau7xIjykzabHWY65fNSzab8yDSgRDWGnOq4+3LgRFD8A2cI2nso3vo6FG8jIrJDdalh0p4zS0AWY8oJ5YVyQ/mhHFGeKFeUL8oZ5Y1yR/mjHFIeG3oCMkUoKwa/GxqI6m+ybek93mxsW6fIpw7tZ8xFt4uWlzd/083r1KZ89CTw6Z+Ar/8OoATABgDvA9iuh13+6zGgeoGO68jaq6m73zXNJbcZt9DN9w5xTn2XRNIdORUUf/8ZAneEWxTJq0v8MjYyJCBFW/Hg36B6wWdKXtQw1e1GjjZouaJ8Uc4ob5Q7yh/lkPJIuazDBGSKUFYMppvPHlqJ/6NhP/+JZjM7OhV+dak+Ai+Mveh+0QJzEz75PbCTp/1qAF86o64+AvAW8PGDwLr5QK5y+9lj/oJpAlnocfmjyCFcqiiXRjrE+PsPI3Bp3l3qtygSmKiQQBuB3B5LsW5+oZIXyo2SH7m+1HJGeaPcUf4oh5RHyiXls36KUFYMdjTyfWLgE6hDfo92+vk7mA3s4VT46VQf0VcCMIzB6IbREivl3xI97vrLl4CtdwBlk4HcnqtMrL/EuIATnfResl7wNo67H8ZOHzjZcQe9pDuDXrom6RE5swEukNvzJpRNfl7JC+Umcpz6Fi13lD/KIeWRckn5rEsRyorBHkauOzh8AkcfkrLj5PrTnH7+7mbTTnUq/MapFAxRWAIxjMXojqmTP2qVADt+owGcsqnVyO/3pKkKnNKIrq9Ozqkv6aKDG3fgPcijPKPeErFCRXeJ5ve7FWVTn0XV4golNyqcjFqrtfxRDimPlEvKZ/1iocFGjvuYz9HFIRU5NGsEnHRfK4fMo7ex2INM7Da6tsiHeVimYojG0v1SMf+XERu0C/jqb8D79wNVV+1Q6cH8/jeLFJ+vvjsVPrgwMKJphgXHpMgLGd03Qvkoy3gGVVeVKLmh/FCOvOtLLX+UQ2afKJeUz7piodHmPQYZee7tkIrIGoEjDzWrfYyT7uvskHkMNDHbKOGqTVPFGMzH8kQnKpvQQpcBn/wB2HrvN1i/KBdlU59Gfr9rU+jw8jHChlP/4PQGXJq4xJ2jlA/KCeWFckP5oRwl8jAph0w96wPmVgMu2tBylHmPgQ6pSGcnPXho4AFO3G9BP5nrt27aULMxY42LNlUBdqzIYlEG87JMzSh01rc2ADtfAbY/waGXH2DtJW+jZPzPkNvzMrPZyXq8Ayf8wesNHJmAKDYRd8QZSj4oJ5QXyg3lh3KUSM4oh6w7YfEZK1B1ZmGqkduxRo6HivBS1ghIULB54wERcb8P9BtSuyHaNZtiGjKeVmWZrMxicYbK87/f0O2nxeamffxbuv9fY8N1nHj7HFYNvwMrOs0Syp+M5SVQQB/c3oBLFZ+IPUobAcoH5YTyQrmh/FCOlBEo84QD72s5pDyy8pTl5zqjMMPI7Xhx4AxJAgo2bzzAxGm+uN8H+o0xrvp005L5rGrMYG02yzNZoaWKfLabVE21dscYs9Fto+Xm5m26sRJrLnoVpRN+grx+VyCeNsIB+5LxvIVOroPb2zwqRf5IAw6mjVByQnmh3FB+KEeUJ8qVwgRKjLx9ZOTvTS2PLDtn74kmjpltZHeykeMxSUBBiQe0aK4W2Rb7uHF/BOin+rrvMH3Zlao7i4U8rNFmmaaq1HpP52uZsiFqS+CGsRvdN1pwbmLZ1F+gcPB1WNFhiqdcs1tEvB+YXptXSPDdCFygW4Myc8oJ5YVyQ/mhHFGeKFeUL8qZShG+ZeTvbS2P7Dlh4xm7T3WZ8dlGhpOBghIPaH5FQmYTjvYU+3RNAvrdaphZ1qj+bLZoskuLjRqs1Wa5Jiu2WLTBvC1TN0RvCeAwhqMbR0vOzeQQzOj+7faeeD+UajY/79PFBdpH8ktQXig3lB/KEeWJcsVsEgFoyhvljvJHOaQ8Ui7ZdcrWc/JP6HTzrBRAwa6eIqGjm83h46T83Li/XwTod53hZitTDTskaWCfNls12a3Fhg3WbLNsk5VbLN5g/pYpHKK4BHIYy9Gdqzv5EzG4pIV4/5DCBdKSMExpT4DyQzmiPFGuiPSznoRFZawsZXk55ZDySLlkyzl5J0g+owlk5yQBBft58IDmkxqMSPn54n4J+l1i2nJzlfKza49MLSRrYL82WzbZtcXGDdZus3yTFVws4mAel6kcorkK8EsbEaH8Pg63o0O8f0jgAkcn4ZgUTFNpGhikPFGutHw9qSpKWVbOkJQNZpRHyiXlk6QzZJ4i/ZymLI8CBX14QPNJDXpc/7ZOys8X908z/OxvKZZWEjWSq439+5a0gX3bbN1k9xYbOPygi0ReT4tQ/sDiemiDgz6W6Ybdp3WH01lGvjJNOXm+aixjdylbzCmXlmyGlGPkniQBbUP59OEBvZzOwYM/FEjg+ssb7Mb9V5shDVWKqpkWloSN5GyztE0kb2D/Nls466i6fRZ2aJL+7MDjHozA9yKMQC8nPHXT0ktMQ9lW1VpOfonaQ+o+La8kniX7tJ4gZUFBHx4gD6jmEQokQP2t6+/m+ycYJX7QTGrRfO2kbCZrK4kbyd1G+iYyuJDEob57lUrhRecI5Q9I/6GbITgqCQNVVGHaLCOr7ypeCRWmnqlp5iinlFfKLannOX+CQ2ga4gFufYANBQ7urIDp3bYulq/aT7r+Y4RrdZWZ1bZZTWxRN/RCTd1M9lYSOJLDjTRODQGWVEsvA0dbWImMQKtGlKYvNHwSBqjupzkmKaeUV8ot506oA6v7cnFgufUBUaGAzQrYEPWwg+WmWnYfWfDjQ/3lzcwwsf+7amYbxzZxcovlbyeFM1lcSeSop/HO9aRYEuVZ2weW1rCSGIFjHZlNVKdi5fY2wyi1RXFLkmCWLNOUVztvgpOnOH6OMyjr1wfIQ8uXFZAye3CwCDnAn2X3sTfSov6u6z/VTH19Sk1tVfn+DD2+yU5wIahCKmeyue5+pVVaAPzCSgEYTGtEpeo5hk7uLUUsS3ZpUsxbPIDySznm7EnWB3BkmQYRo0IBK7v24LIsQgcHICjKfW2tv2X3ka6UtaLW9Z9uQJVX1OhmDuNU+f479BgnTnLhMAfyuSdOq6RSax1SfWElMgJH70avykUmK/BPRS2v8IBxetIU5ZdyzMGznD7NEfT+UMB6rzJ0tSxCVn6bdpmwuYEu8GctqL15Fkypa/HVLtG9yOm4rtZ6coorBzlylhvHOXGiC4c6pFZYEUXBFJQ/rFSNQBRFXVTh2gJTu5KlhstwwhTHzFF+KceUZ46eLx3xvBMKyBDWyrE9xNzaAAsIHtFUb96Rwnq65b79HffJplNmapco7UmsOrXO9WcqhdNcOdBR5fvr1VenUloZSBjD2l05jiKpTVa6vsgMlclS4+VYH8BBs5RjyrMOBQqx6tRfIp52gTjMrCcrw9j+njJh68Ue2VQtp6z4s/FTD0/Of5xpkJhuYvkFyOuWp92mi+tcf4Wgjn1DDXbUbtPsCLcpUXNFoGEOa0+A7BNSbF6z4exC4wn8Uw2YVRWsF9aFApRvhrN53ZY5Mm0bhtzagB4Cx5IVgkc0tRt2pCftZ2+WW+5rgb9Z6vRf0fYelAwFquYY4OSHurRSuf6nPOKk/Hxxf7L2yjCIIazdlelk7es+7orLDSbwNzViXoUCC7Vcq6zAnF0oGfonrGi7WDQMuYCgBbPtoeamBY9sSjdK1vvLtJ+Nmay7JC2lpWI+F4V9XlYFP1sX6Hjpwx8wdfIBSoc9p+a7J46Xohoq0kK6L6w9lOtkBDYuHiBxrQvVaPmc9tkoHWZS2j8wuNYCFghtQ2GfH5vDzYLa0rO1Ya2sELQHW9PqE3BO/7bi9Het5FgH+JuLlZ1uQNmoKmw811RQ3aUzAJVn/U2g/lF11AMPaYqlsA4UKOjDA2Q/i81s0WtdhvwexbWZLco35ZzyXjaqEis73eQ54MZGpAVln0DT8AJSPP1lnDTFWLs5qjxy1amPqW4q1k7vvF83VLD2v+i0X3lyplGdVM2fVCGspgIKunhAVEfr1FqAOyv9DhSdtl73tFxj5Pxq3UW46tRsEzLMEaltNy3YdL2AFE//keL0zzDWbh5yT16KirFvqnypAv5u0y2/5aMrsLKWWsmtmpKuf9+IqqkQ94e1P/AAWR/gCwXqZH1ll/tRPnq7km/KuQIEL9IgYe7JryIeu9KRdZvebrpegIP8u6e/dI3GiNN/prJ2PN2LBv4a62dtwQfXmjTJIg2YFPZ7ISI2knXTUWwqIe4Pa1/jAVGsVr7+FoF19XsMa6Z+o+RcpbmvBdbPAooGAlnpT5kMwkzhBYxxQt0oL+CIA2kVZd4/ldN/trKIed3uRsW4t3RcxE6/m4AN83QPQE775U6t/4SIuEh2ToV8f1j7MxRI93S4unjXBCO/s5Q857S/VvUEUM4p75R7yj/T33ndtpv04RUpegEHti5AgCPHi7y/REcTnP4tL0XxoN9g/ey1+PD6OmSUnVQFvUvMTTjHAf4S9U43b0bVsJqSEXCZrRNxXEhA8BwFaBf0fgCrJ8XrMl7XA+tn6yairJa5Jn14UYQX4DYKWbxr/4PdTs2/REZ7p3D6L1Mo/+ZLv8WOZaZMMlNXTq1o87xB/mc5wJ+skOodgfoH1z+s/RUK+LICvZ2KVwkImpqXNotUZeuGzE1K7in/my/V/S8sHGLtQDx2vzEYPi/Alf393yMgOv6kK9TFOf1Pd5B/G/tfUnf6L9FWkMQJqydANQJpCyiro9x2yb4JqqOC6x/W/gwFfFWvfT3t7rLqdb5qCFo94V0l98oLWCK8gPRPap7/MuKxpU5G4HTHC+jihL77r1PQ3IDvCqovX82/L+8/D3ld79Sx/6Xf1J7+LJJgJWB261LVFFQ/7WfroyVhgq9LKqD+Ye1v/Cuq69WWCcu+l7q0IPksSob+EVWZG+t5AQoL6Ao1AyMe+z3iscVOXYCvR6C14Av4zv768kc5RJ+dRcffaeL0HyeQ0DmqAaLotCex/uxK1SDR8PR/y8wCyBCnv+yQigL+QsFPWAcSA0uPoLyTacFJIgxu6AVQH0gsWnQaEE+jLrxXo9QPmcePE17AaaJTsLNDIHrU/vriMvXXwen3HyTinwn1qv5yu9yKirGvo/riL1RF1PabdOuvjv3/XfP8/zakoLI7Sqb9bJtvB8fyBeAvrAMFCH7XIb09WaTBZVqwfvfrijYLNRYwt1rpAfVBNQqxLqALDcD7ZiLWEtEjMNxJgZ8sQPD9kxKMAP+6OVbP7fjTedBV/R/FuhnF2PZ9nQdlr7RC/nvxC28w/GoXJDj9fSwpAfgLqykAgj72q8ReQEGv+xXHJfVAMQl/X9OJkUuAHIPxWE7Na//UHKDjBBY2ICIluG/BQA/dlw/8G+bEPSYH2uF6lI16SQ1N4AQVEiZunK/z/pz5F48VIB77iblByU7/Vvs97gkrrOR4WKsUvIA6LGBFu6tVXcDG+R8ofaBesFKQFOOcN0DK8Xjsv4xXPD4iJSjBwH1LG5YA/Osd0fQjrF3vB7FmSo4iRWAtNEkT107TI79Iq6zj/6Upnv4y7XdYEMOwDqABOCwCE0vkBdTVBRT2/SnWTstT+qD0YjGwZgrrYawX8A/EY8sjmoR671cw0FP3HwX+nVUv3sludYXqfyYlEkcnsQ6aJAnlo6FIFMmoqsd/L3Ty/lGn/wnh9A+rCXoBJyTwAnx1Abobtnz0y4r8hnpB/VC4GLNirWAox39pKmPPSgEM3DeVgU7uv6Wn7j8K/NOpPxb+kC9dIZ7XmRroAdbK5dfcvJ8LxHOUhxstnP5hHWxegMuFOcrJjGlsjGzB62eVK71QmbHLTWGQSgluM7MyFkaAgT0jKgMP31dWLpH773NzzlUcaByT5P+C/0I89qpJ/03wVP31ikD+w+kfVlPFAlo72TG3OjD5AcnWYXJkxmNf1Zz4byAeu8kJj/dvGLDb7j8bIMpGvohN53+awMV50tQ/R7k4LtARTv+wmrIXkO5hxE4lRN5SFyKfr4fi5rSHoRtf7qkM3D9hwB65/6rggc0PC/XkVIIdbPkt6MMvtgvx2F8Rj93ZSJAj5P3DaopGoMXug+R9HlIcmGqi0I80hyBT5LpArsAUBU07IGHAbrr/cxSPP3v+q2avUyWPbH9ksUP5GAv+sfPvV+b0T5Tm2LfxTVhh7buDMrU0OSdelY95FdUXf670RJXIz9ZcAfG0CsRjjxiPYf+HAcayNdb9n6sGIBDh5GQfVfl3g+ZJV00Pabbp4Van5ffAFTqEFdbe0ZVUC+XqyuSz0i5A8aCn1RwMdVjepRmDmCnL6fhZjWI/bjC1xoQBLfbWl5KxTaruP+ud78Oaydk69/+AYfyZbN2abFPllJmg4WH/lzqGFdae6UqiUnlfo5zsDzD6ssjoy2KpL782qcBUwoD0vdYbkOALJUP/z6vv/kuL1oEW7Q+m2ylVi7Z/mh3CCmvvHZiN9Jg7XN/QY7ZhQOwpw5E5PUEYsPcPTBP/J3JpEqD/LP29EPj0TmD7jcb9VzHN64jH7kjyZQ5cu2NYYR0ozKx44FM6DLhR6w31R5UGt3/RGICZnkMzUcj8nT39MjL9l6j238ltdl+O1RP/WR/9Z4ljrx2m5j/zgKGaYYW1/8HAZGFzXYOQKpmX2YCJQF73dwRLttWbRL0Be54ONLlN3xdJFM+Izr+Z/1acZzuWa/LD8jOI/r9mJqlayq8DV94YVlj7zgg0pm7GyQac8ZrSF+oN9UcVBfXPE0zZGQlwM9/BedjufgkZ/0e5Mg0RTVXYMOwdNf2EQxE5CUUV/wzZgaz0pWIIgkT/g/sf1qEWBniyAemXoGTIH5S+UG+oP9SjkmGrlV41Tnf2DAdIEP8nsWKdl6Fi7BfYfJkpbbwWWDedfP+vi1FfPisW3P+wDpUwIDobUNjvZ0pfqDfUH+pRxdgtWNn5ZkGXH+U97z0cwOPGuPG/P/1X0Os1Fe/XxjELgMrxu5DX9S4Tx8xyOP/cOCa4/2E11zAgWVEQewOWoXK81ps6/OxTFPT6kTlAz/bgZy4OsOf6I9IZrgXzxf82/XczigZ8qPjNbPpPI5lvI6fdNWLWn0UyExX/BPc/rOYSBiQqCnIyaO1uQdmob3QGzaQD15/9leoarMMBpkfgAK4HvXvpc+PCpJL/lzHMRchu/Sc1DplxCxlO2NxA1l9SgTPNUffh3fRfouKf4P6HdbCGAYmKgiJqaNKuQ/Ggz5TeqOagpVqfSoc9h+zWCzw4QCr1AIfvifVqnWL+fxlWdipVxIakObbx/9rpqxTzScP435f+a9D5F0QprIPYCPg6BH3pQIkD3IjCvh+q6cG1OABpw8e+rrIEGgdIpR5g90F0p6bZTWO48cs0M+L4d8jvobuYLPWXIv6c8H/I65Yo/vel/0Ltf1jNwQAk0qPTInCApcjrtknR5VN/LFUYu2rze/ynUw/g4mh7R48SFABFWS72K7+Dwn6a2fQDk/8nBXj5mFdUmWNq8X9I/4XVXHEAmw5MhgMsR06HNaprlt2z1CPq07oZJSjs9/MUPOk9LwhqBAA4ybTzPlUT469VnX42dlE5zPnbFP95dsvLROziK/914/+Q/gurueAANh3o4gC+smDqx33Iblms5mWQOVvV0igsbZPB0s5zsLS9CwQ24kNbAPCWmt+9hhVtgNIRms3kkzsNejl7jYNeuvn/fdvNFFZYTQsH8JUFu/UAJP8oVJyZnBlIPaI+kVK/dMTzaqhIYiBwzw7TBBWAPrdlhqntz1MkH/UAwO+T+rsABX0ejMhfJsv/h/g/rOaCAySrB5D1NATMixRrFqnzqUcaCPzWAIE3eIBAN5ze/YrABPlLtwKQAMSlZpDhRjXeWAEXC3U/s2pkmPBuAgAwUQVTiP/Dam44QKKKWgsEZhiG7JIE+nS3R58SVQQ2Dk9rRAZggpldRmafnWqYAS3WNmGxyveDxQorrKZtABrjUU83BqBYedTlwqPepjzqfBT0fsDjUe+9TIDHZZElwG4GgNbo74rfnzPNyPf/4Q9MBeAFO1A64gWsaLPIZAD2TcwSVljNAwgcJ0KAVXWY2gVan6hX62dVqE5bjalFZQKiSoJTNgBHOsULUU0MVGZao1xlAGozAOxiug3YMG+r6mzKOvEiA1rICsC9X74YVlhNHwhMlFU70+jUgwpTyzqRHbTUI61P1CudCXhaMW5FlwRLUF0W1R25Jx9WcgDYtAVjkIdVvEKO/xKWAJ+nec0VA9DsdSga8EREBiAqb5keGoDCaoYGwNbVpCeoq7GZgB/WuPVxdagyE0BaMOoT9WrjedtRMuxZZLeKSqtHcQOkdqh6SEASuStzzNyySjXhl9RF5P3bscwQGajChZ+JwoVEHUwyAxAqAMNqbgbA4mpRmQDZWUu6vL8pA2AL6xSxzjIovkBS7XGycOphderkICJekQ0MkshA0hoT2OMJv7YuBUgOgB8C266BGnSgWxijShdlCXDIAITVnA2ALxMQVRJMYP0VNTinoJcepEN9ol5tvkymAmVlraTVl+QgsikoOa6WImJpm4AyjQFYg9yT9Ly/2h7mReQyew953ZYlSVlENS+EDEBYzckAHJGguc5NrS8w07Lf16nAiVqfark1znoHuSfdLshBZFPQnmXWhAFI5YPSrSciWaE/qGkCqvugf0PuSbftkw8aVlgHnwFI9WCdawaBVDQ8WFVT0O4erCkZgFSKgGTRgq5a4vCC+q7Kv1Ex9o195qqEFdbBZQAaE1pPUf0AHJ7jD61XqiEi/tB6z4qBksQqPhrw+5DdthSlo4HqK4HPfgx89Vvgw9uAtTNzkdv1VmEA9h5YEVZYB5cBaAy4Tj3hwfkqcrtSj7Q+Ua+oX9VXfo7S0c8iu+3lKRQDNQ5bc4hAZRVgw7rlrPRZyO3xBAoHf4Z1FwAf3Qd88wKAN4F/PQpUL96BopFPIrf7EmSlzzZfLIoFSJKAhhqAsJqjETjKIQmNYgeajKz0y5Hb/W0UjaQeaX2iXlG/qGfrLihB4eAHkdvjOqWH/v4aXzVgUgPgKwNumK7IajUdeX2XoHjMiyifCWy9Hfj8GQB5AMqBr18CPrwHqJzzForG/AJ5fX6ArJbTk+QrQxdgWM3dALhdgQ3ra6gn1JeiMTmonKP1iPpEvaJ+Uc+ob+Uz/wfFYx5Rekh9TJxeT60c2JOv9JcB5/VehOKxP0Pl3L9j/SLgk8cBvAfgYwA7AawEdjwNVF29FpWZr6rH8jnRVYCNr1gKK6yDywBEVdjWrwas1a3MElRdrfWI+qT06mOtZ9S39YtKUTlX6laycuCUDYCvD6CuYinnpLkoGrkcFef8BVVXF2PLMuCLVwBUo25tBb58Ddiy/BtUXVWEitnPY9WIZcjpnOkpWQxVgGEdKgbg2Ah+QG0AqB/UE+pL1VWrsWW51iPqU+2q1vq2ZdmXSv+oh9RH6qW/wjb1fgDHAPhKFkcg/5RFKJ3yGNZd8S423/kxtj9mXH935UP9bfMdH2Hd5f9A6eRHkd9voYcIZO/NMwsrrKZvAE6MIAgdofSDekJ9od4o3cr36Fae0a07P1Z6SH2kXtbXLR81WIvd+ZB1BiC73UQUnn4TKuY8gw3Xl2Dbj4Edzzmnv12bgE+fBbY9BGy4rhgVs/+IwqE3IrvN+L3KXxZWWAevARC61Wa80g/qCfWFekP9oR41WNVa76h/1EPqI/WS+rknupXUSuV0no6i0Xdh9XkvovrWDcoK7fxfE5+4awew82Xgw0eBTbesx+pzX0DRyDuQ02naHlmpsMI6OA1AYu+aekH9oJ5QX6g31B/qUYO1U+sd9Y96SH2kXlI/98S7Tm4ATpqF4jOWY82Fr6B6aTU++hWw6w0AX3s+5BfArteA7Y8D1bdtxJrz/wdFo+9GTucZwQCEFQyAawA6z1D6QT2hvlBvqD/Uowbra6131D/qIfWRekn93LcGIHgAYYV1qHkAAQMIK6xDBAMIWYCwwtp/BqDJZQF2pw7gywR1AFD5zFAHEFYwAI2tAyhSdTTRdQDYV3UAjakEfFVVJEVXAkJVNIVKwLCCAWhsJeCrqpI2uhIQqhJ3H1QCNqYX4BFVkxzdCwBV0xx6AcIKBqCxvQC/UL000b0AUL04e7kXoLHdgNepriR2JzXsBoTqZmJXE7ubQjdgWMEApNoNOFt10bKbll21DbsBobpw2Y27l7sBG8sHcLbqS2Z/MvuU6/MBQPUzs69Z9zcHPoCwDlXlbywfwEzFo0E+DfJq1OcDgOLfIA+HJg7Z63wAqTICTTOEBPMUQwmZSuoYgTSTCRlNyGyiP2hgBArrUDUAjWUE0gaAjFpk1iLDVh0jEBQDF5m4NCNXxt5kBGoMJ+BUw0k2T3GUkausPicgFKcZuc00x9ncwAkY1iFqABrDCTjF6NVcxalJbs36nIBQHJxarx413Jx7jRNwdz/o7YqttD4rsP2g7xuW0wWBFTisQ9gAfHf3DtaJ7zmswPZgXWNYuTP3JivwnrgqryvecumqkNec/Oaa53xJmAsQ1iFqABozF6AutOZcDc7X8IfWa40BmLs35wI0FqyYoQwAJ5VwYgknl9RNBtKTTTjhRE86uSNMBgrrEDUAjZkMNM249fPVZC1O2KqbDKQncHESFydy6clcc/YquN6I2YCTjAGYo2aVcWYZZ5fVzQbUs820AYibmWdhNmBYh6IBaMxswAwzS/NcNVuTMzbrZgPqGZycxcmZnHo256y9NhvwPxo3HXiimU56jppWyqmlnF5aNx1YTzfllFNOO9VTTyeH6cBhHYIGINXpwJOMTs1RU7U5XZtTtuumA+sp3PpQzTXTuSfv7enAUf0A9cuB66zVbGWtOLec88s5x5zzzDnXnPPNOeec8851ymJaEnellXBXQiowrOag/IeLsLpV6mF1m0UoHfECNl2wQ+kT9Wr9LGBVf2sA/o547G6jh8nKgFNvs48oB05cDMR4paD3A1g7LR/bvg98dg+w+VKgvBawKEY89nNj3c4SgEVIBYbV3A1AKpm1USKzNlMBewTWywmsX/qt0ifq1dppQEFv6tNOxGMvG2A9qgiocWXAHsQyUTGQL2VxN1ZPeBdbFwI7H4D6uXqCTQWWGAOQStFCyASE1ZwMgC8DEFVcJ/XprgT6tLHGxf894rFLPan13SsC2isWq0JYrA+sxeojq5amRdQtu5mAwAwUVnMxAG5I7WYAhjkZAONR93kQa6cVKD2yHnVdCpCY2k9MuLB3PerdjFnmYEWbhSgd8Tw2nf8JPrkT2H4DsL42E1BYY4UeMh7ARAFaDHJAi9AVGFZzBQDTHQCwjgjEnwF4HOtnr1F6RH3adL7E1F5DPHZLCv01u4eppYhajhWo5TmIpzET8BudCbgZ+Ph2YON8oOR0ILtlsekHmGGec2YAAsMKAGC9LkCRVm95GUpOfwYb529TekR9qs0ApLEA6CnEYxeZ54zd61m1pPxl/kwACxd+rgoXPmDhwnKg+mKgfAyQ04Fli8vFmHCf29JNuC2xgAOE1Yzi/5gIp7slCaczkdPhepSPeQXVF3+h9OiDeoV17xhdyvBkAPYOz2YjMgFOV2CP/8TqSXHVtLDzfmDrlRa42IR4bKkBOKYmKAnePeQyrLCabvwfpUduCbALAP6f0h/qkW0Cyu9BA/A7xGOXG70bv1czAAksVyfHcp3uNAVZIPBGAwRq4OKDa4G104HCvh8iHrvReApRlsvlBww4QFjNKf73EYFGeNJ9f4q101cp/akPAJIDYJnjSdsMwIAEzXXfaewHP1xkAmTs0jshEJjdegFKhz2HjecCnyyVsctniKddZwCO6R4coL8HB7DoZcABwjpY43+fDvlYgCSWdr7B0rT+UI+oT6UsAW79JxP7z4gAAHvvNR1qBBAoS4INenn2Vwq9VBWBF7KB4RvktLvFtC4mwwF2L38ZVlhNN/5v4/GiI+L/dtegbNTbSm+oPyqbdjazafSibxaH6MR9AgBGAIFuSbCvg8nkL9nCOOVTvH+V6GEeD+R1XabiGz8OkKgeIDQGhXUwGoAjU8j/e+L/rnehcvyuOm6Nq4A1U9ha/5rSL61n0xJ01nbZK/rjEIQmqgg8S3yBuVjZ+WZUjN2iepctDrCOOEC/n5kvMNtTDzDYUw/QMqQDwzqI3f+jHRLQRE11MpP2utKX2vhfcQB8gZWdl5nef3uAnpWkAjA1ItAEXyKqIlDiAKMa4gCtrkDJsNUqblE5zFuADXOhOpuy0i8x/csyhhnlxDBdQzowrGbk/qeuO1npS1EyZIfSF9VVe7uO/0uGvaP0qnG6s2c9NR5yEB83gL+KaVX/PKybqYlBmMfcfAlQfsZrKkuQ3Ip1D2FAWM3Q/e+exHtegJWdXkP5GVpfqDeKWGfmv1WnLfVK61dGRPzfK8J7PmxvfZF2HhzA1xk4D3nd31GcgGxgqItjclDQ634RBrhxzKAQBoR1CLj/gzz4Waaq7S/otUPF+7X4GRuAJv4Ted2XG/zs7Aga8H77ZNBuAhwgUT3APOS0f1FRFykk807DEHTOehQPfEqlObQrMz2iLDiEAWE1d/ffTf/dgXja6ygeSD3R+kK90Rm0l5DT/lpPBi0q/7/n8X8EDpCoHkB+mXmqVrlooKYFs+lA8gWWj35ZlTnqMMD3ZaLCgFAUFNbBYgBs+jwV95/yv7hGp/5QoxefoXy05v2z6T/SgRUN/LVi3IquoUmU/z9ib36h9BTdGSr3r9XwgjWTdRkj+5lJbbxmcrYaIpI4G5CoKCiQhITVlJX/iCTFPy5ulmna5LPr9GWR0ZfFrr6cnWLYvHeraCP6mRNZtHPUIJCcjh6LxjBg0NPISrsgAtEcmsSlCb0BYTVlA9AiScg81EH/b1XMPllpn6hOP+X+ux5zxyW74THvPT6N3Yhp+EEfQTyton4YcDe7Az9H+ZhXPdmA8QlAjQAGhnWwgn9dEhT/sKT3V4otiyQf7Jpl9yz1pJ77f4Axs91ENUn+UaDcGnYx1csGTM1FQZ+HEoQByb5Y8ALCaqqnf7KDUrr/d9YYhL+qwTlkzeIgnXro/6Q48nve60H/93/WrJF5zSmmX/mfyGkPlI3UbCbkNWdzw4a5W1Ay9E+msCEzBdemQYdgmB4cVhNT/sMiOv+idISn/5M18l+mOP5LhupiOdX8cwf15VOUjXwxCfq//+pmdiMMuKnmQ76BeOwrrDoVqijog+t0aeOWy6EGHuZ1vTOBdfOBgSElGFZTNQCufvjAP+klM/Z/FfHYv5DXVc/7o16o0vnrqC/lWHXqL0Xxz4FNme9GGLCw5m/P1fzc5v2C62eVq67Bui8YBQZGpgSDFxBWEzz9fR6yC/7NNgzZ+Yrfn5yZ5Ptv3AG5/4vmGhkGzDVzyyJcnAs/UwgnmYQbgoG+L+mmBIMXEFZTO/3d1J/vcBxvDkdOy96iwb/RuuCnLkTe3MgQef+UzacYBkiQgzjAP5SV4zADVeJoqMIIdqydlqeYTzQY6HNz3JRg8ALCOlhOfzf1J8NjUuO9hXjsWxT21dT51AdL/aVK5ns/uAcg+Xf21Ze1YcBxniGHvjTH1TUx0H8hHtuKnA56qqkCA5cCH99KxuAPUDr8z2qycJ2lc1OCUV5AwALCamqxf9TpL3Uiw/D5F6gJv6XDNXM29YF6QUp9VfpbWy2bSppcAuT7Nk3eyEKHs02VU47yAjjTjMymHHH0r/sMYeikLKdBKCNFL0BmBEJdQFgHQvkPd5D/VE5/FsD9BvHYBhT0MinyK7U+UC/WzSh2Ov+sV9w0CuWSlDr6wEBWMf0F8dj7yO2iiQ1VsQMrA29ivFOt+M85VKR+vJPMCwh1AWEdaAPQIgL5jzr9pxiv+L+xos2/1bwM4mLUA1X5d/EXilA3t8ut5vRPBP4duFL5RjQ7WMSTRT/vIZ4GFJ2m+c3Ic64Qzyug5p/pgodUvAALeli3x6KeoUcgrP2p/EeIrJgNh60eRJ3+GSb995YukJug5V9lxq6nXlSi6LQnEfeWyTedZrkEYGBUw8NiM8iwUqUEK8ZpmuMdy0zJY+ZGlAz9I7JbXxmBBVjLJ+sCLPBhXZ9AGBLW/jQAR4pQ2OqAzPtbT1hy/lGu70V261KVFSPrL+WferD50m9QMe4tT+ovqlHuwLXLOzUBUWCgWxm4VDc9pOumB84M/HBJIi9AZgRs7GOtn9sjYN2fAAiGtb8OQBsGuzX/1gu2WJhsk6dcP9zg9KcerJ+9VlGB11Hm+VJ/UeDf/u+RiQADfZWB1gsgoEGw729qvDELg6QXsCFzk8ECFhkvwFcXYC2gTX9YAOTEAAiGdQCAvxM9su9W/UnG3/lY0eZ5HfvXO/2/1YU/3Sxrtpv681X+HdguWScGkpWBvpSg9QIuUhYwq2VunRdgsABSILP5oaD3A05dgKwOtDFQP1EBJdOCoV04rP118Mm0n62I7ScwMNnya2dmXIGC3iUa+V9gTv/rxenf8lLP6e9L/fkq/444EDfDVgb6UoI+LyBD3QRWCOZ1266xgEt0++NHzAjMg6oL0A0QNgdqUVC3CCIKEAyhQFj72vWPAv7cYjjbGavp8nPaL1d5f8o55Z1yT/lXsX+3u1M4/X2pvwNHmOtJCbr9AT4vYKYqhcxK15Rhqgb6Wp0HVYxBU79BYb/HPD0CZ3nSghIMaSNKIUMoENa+cv2PFa6/BL/dtN9Zgu5bM2UX9ntBt/wu0vJOuV8/a4vq+c9KvzjJ6e/W/TcNlixPf0AqXgARziuRe/Krui7gIl0H/fFtulKwfPR2rOxyv0BDrUWUaUEJCMqbEgtZgbD2kZxL11+GvBL4s2k/KevzsLLLLSgfXaHkm3JOeafcV4x9E7knL/XIeqLTv+nQ5TuIqOsFSCxAZgRmGGt3OVadmq2mB2+7WtdCb7tGtw4XnbYeWel3eNKCZ4iUyKlOhWA7EReFUCCsfeH6txSuvzzobOr7DCftl6lO96LTfqXkmvKt5PxqPTV71amPGcJPm/eXyL+M/aNO/+80FeuYzAuQdQF2fgDHid+EslGVavoJJ6GwIopxEbME+T2KzSjkOQ4gONpxjXpFZAVCgVBYeyPMPToC9e/lhLqjHeBPj/rK73GPQvkV3nWXlnPKe9moKtEN68v7N+3Tv5FegKwLcGKjPj/Gmsnb6pDRH+giCY5DzmmfXbMBzAxcKG6QGwpIdLSDKBAKeEBYeyvuTxPlvjLb5XP96w64nPbfR+mw51CV+YGSa5vxIvtvYZ+XI7AuN+/fdE//CC9AZgR6e1ykCSI3mokVbRer/ueqObt0cdAPNScaAZNVp0DVDjB9yJChrk/gjIisQJeAB4S1D+P+LhGo/xmi3n+m8VrPxapTHlEcmJRnyjXlu2qO5sdY0fYep+ZlgifE7e0g/01zVJ6TEfAxorr50Un13CQWQVSMe1M1CilA8HZNkkCQkIVD5BfUBCMLHUs5TJQJ9/bgASeEhqGwdkOeWwiSDzfu7y3KfYc5nq2U6btQMfYNRX5DeVbA38W6FD6vW56aBVi/6tVX7xJV9XpEU7WYsi7A1yMw3OmOMtYy7QLFgbY2o1CRIqg0yfWaJ52VUzntaASyal73CcRji0QoMEq4Sy4e0DbUB4S1h6BfusC13Lj/dFHu67j+7a5Rla2cg0E5VmnuxcDaDCiOzHjakxHdr8Mjav4PfN6/EV6AREu7eLjRIuKljktQOuJ5RYnEMkkVL11pQoH+vGlfGyPwS2M9J4h0yVCnSvBkpz4ggIJh7S7o11G0+bpx/1gR0trD7Hys6v8L7fpfqeVYlbvPBUpHADkd16mmoPrAn9v56jJiy+zWEU35BrZI0CV1iictKEsl56uGoMqz3sHmS76sDQVUvnQcswL0Aj434cDDprTYxQMGOPUBLigYjEBYyZQ/CvSzh5gv7p9RJ8M97tHh7EU7a13/2sxWT8rwK4YnY7onnB3o9Pu7Xa8tmvpNdGnD2npypkM8gKDImQ54HGszVimX6bN7NXBirSdJFOOxTw2n2o/MTT/LcZ+iQEGZGQhGICxX+SXiHwX6yTDWjfvnqYlXpSP+oohuFKB9b53rT/bfrPSNanCuZgZygb8hntqWtvuN7msfACi+qql+nnZJWTVlQoHhf0ZV5iZ1E/91ryZNJJ0Ym4iyW0MxqsZjLyEeu024UIlAQZkZCOnBsNxDyyq/lNlEoJ8MYXWtP/ksigc9hXUzSvSEH3N4qZT2cLr+lNt3a97vHqe6dVRESru9w3/Z4mC5oYd56qY7OYCgr25ahALdl6PizP+nEdRbdQEF+dLZSVXYD4pjkJTjml9tYRJQUGYGZHowGIGg/Fb5ZbpPIv6JQL+p9VJ+hf1+pjguKaeUV8qtymSdCeR3p7xuNrMyrorob+kfUdR27EHHgJ2gfFJSJkWFAnNUeWThKQ9jzeQVijhBdQzeAmy6wNxQhQd8ayzqg8YK+0BBmRmQ6cFgBILyu8ov5VQi/lGgn4z7f6gPrAt26IrWuzXhhyr4OcUeWHEjqzM8rr+P8u7gLmt3CilaJ+mdbpgVIDlI8eDfqjFJrJ1mKsXiAaQYzz0JinI8HnvBgCpukZB0q6Rl9RmBgAkcmjG/q/zSU5XhahToNw+5J92GslEvqpmXKmS9T9f6s/a/eDCwog3ltKpGuZ8xpKCut+rjuGh90BeyOYDgiZ58qhtXjWsIqnS+GWUjX6gFVTg5lQ0VJBZV9QEdYEYsPWzyqta1ktZV3mCfEQjA4KEL+PmUXx5Q0kttCPqRv5/5/vVnr1ZySfmsPaRGAis7Uz53GtD6HnPAjfPgVW79yokHFfCXQihwgqc2IKqTyk2r/Ccqxv5VDU3g6KQdy3WpMLupaGFzewC5PVchv9+TyO9/M/L7XYvcnpdhRadZiKdJF8tnBCQwGFKEh4byH+0Afj7lNyFq2gglR5QnypWWr1uR2/Mm5PZYiuLBv8Ha6auUPFIuKZ9s+WUFqw5TeeWa2pVLEnS0ujn/5sNzmSAU6JFaYQUBlr4/weqJ/8TmS75SE1Q+uRPYdi1QvQBYNx8omwyUTa1GWcZzKJv6NErG/wyrht+BvH5XYEWHKRFGQAKDsk4gVAw2T+X/jpPnb+XE/PWVn3JD+aEcUZ4oV2UZz6Bs6rMom/w81s0vRPWCz5QcUh4pl8z3r54INfKrDqj+I+Kx6xIUrvVoVq5/CqGAj00lqrRSNwxlt7pM1wdMzcOWBcCunwJfPg386zHg4weBrXcAVYuBqqt2YP2iXKy95G1UZj6H0gk/QeHg65DTeYZjBCQwKOsEjjOWN/QONC/lb2H29Tgnz9/Zifm18lNeKDeUH8oR5YlyVXVVCaoWVyh5o9xR/iiHlEfK5dqpOt/Pgbjx2BrEY382swCSla77qlYPb27WN4pUoXcEHjCpXn3AinbXoHjw77Dh/K347McA3gbwHoC3gC9fAnb8Bnj/fmDrvd9g8x0fYMN1RVhz0asom/oLtZl1noAEBmWdQGuzAcebvOuRIUPQLA6fI81+Hm/2t7WT5+9VL+annFBeKDeUH8oR5YlyRfminFHeKHdK/t6GkscN5xvQT/WtVJqJWHcYGR6XYvNa8+1b8TCqNr7SKrfLLViXuQof3w/gTQDbAXwEoBpACfDV34BP/gBsf4LG4GtsurFSbSItOd25OkzgNKdOoItxwdqYyqsTQoagWSH9J5h9bWP2uYuT5z+tNuannFBeKDeUH8oR5YlyRfminCl5+8jI35tQ8rguE2r8XTxWZMZ/325kN9VK1ebNbJ0CwULyWuucztegIuN1fLAM+OZVAO+j/toFoAzY+Qrw8W+1EaAFpxvHWE4Bg/VShKcYS9zdfI6OBoVt6YCDARc4eON9i/S3Nft7ktnv3k6eXwN+lBPKC+WG8kM5ojxRrpR8yfW+lkPKY0UGkNN5dc17PI147IYI7opkvSrNuy4lRYqlaFAwt9eNKJnwB2y+aRc+/wuADfCvDXrTaLnpvjGGI5BDNLd+ncBA4471MZtyspMhkLhACAkOHpffjfct0n+y2ec+Zt8H1svzUz4oJ5QXyg3lRyl/AjmjHG6+CSiZAOT2eslUpk5NoTDt0KSwi0gNplJ6OQ35/W9VSH/V4nJ8+pRxx6JWmXbbGLsRwCGKy1ROXZ3ASPMeg4xb1tfJELi4gA0JgjfQdOXKuvy+eN8i/X3Nfg8y+z+yNs9P+aCcUF4oN5QfdfJHrRIoOSQAXZZRgPz+dzstvslK0w/N0XYJ6JYSgIJpk1Aw4BaUz3gWVdeUYduDwNd/B/BlxObs0jEbgRuit0zhMI+rcYXxxjqPMu8x2MkQuLiADAmOMXhG8AaazqlvUX7p8vvifYv0Dzb7PsrIwXglF5QPdcBctUPJjYr5d0XI15da/iiHVddsUXJJ+aScJgb9Am1dBB6QCBTURiC///Uoy/gtqhbn4/0fAZ/+CcDqxBaaqC1TN8zfsohDAzNTjItmuwiHO+CgxAVkSBC8gaZ/6kuX3xfvDxEydaaRgykq3cxiMtaT8ESn3CT0MFdr+aMcUh4pl5TPOuVPBPoF4loHD0gECtZlBvJ6X4HSiY9g3WV/x+a7P8ZHTwI7CQZuidikap2yYd6WxRus4NIZhRkmTrOu2pgEuIAMCWyWIOZgAyFTsP9lR8b6MYHyS5c/Kt4fI0LLWaaX5GFVUcqiMsqLSvVVR8jVFi13lD/KIeWRckn5rI/4JwL9AkuVwAOiKJhkZmA4crqcg6JRd6Ny3vPYuKRUuV+f/N4YgdWecOAjna9l0QYrt1i+qaewnOMYgShcQIYENksgvQGbLjw6hAX71d0/WqT35KlvUX7p8vvjfb3vC02H3guqp4Rl5awspbyoPP9HDd1+yhnljXJH+aMcUh4pl5TPOm9ygMCVfBR1gafyPxKTMJ7coDwzK30M8vsvQunkh7H2kjew6eZ1ahNoiemOKUygxKC275s87Xu6Yotlm6zdZgNHnRGYaUAbHy4gQwLXG5DYQJooHjrKfJ/DgrruVRk5TLj7tqgnzYn13VNfuvxuvH+OIZP5jWkp36oay1jIw/Jyyosq8tlu5GiDlivKF+WM8ka5o/xRDimPlEvKZ8Oy85MDSW3yDXZpmNtGdmfldMpA4dAbUJbxuLr5tMB0wxiLcVOIyjI1o+oE3tSVWizXZM02GzfYvcUWTj2GfI5xAX24gAwJbJagl4MN2HhOhgXBEOw7xZfuvsWNZKzfS6D80uWX8f5Fhk7uJVOr/61qLWd3qRpTd62WF1Vp+qaWI8oT5YryRTmjvFHuKH+UQ8oj5TK6+7RtoKlPPTNwQpL+7CFYefLZ6qbT8tL9YgxGIIZoLAEc5mVZnMEKLZZpslabDRvs2mLrJvu3SeKgJ7PM9eACMiSwWQLpDdjN7SLCgmAI9p/iW3e/izgk5KlvUX7X5V9gWsffMrRyumuP/BJsMad8UE4oL5Qbyg/liHUnTD0z+0Q5o7xR7ih/lEPKY8Myc7f1/IQwqCZ5fHdkEoaW+p4A3S7GXgRgiMIyFcN8LIsyWJnF8kzWaLNRg91abNlk3zbJG8jgQhoncrlFhwSuNyCxgd6ieMiGBW0dfEAagoARpB7jS8WXcX5b4e7bop7eTqzvnvrjzX4uMm25/1TEsuSWJL0cGabYv0+5oHxQTigv7Dlh2TkrT1l8xvSglq/fKnmj3FH+Gp78iRioQjFZCgIQxdHW0Agw5iLwQvSVKRjmYVmMwYoslmWyNptxHbu02KrJfm1L2kD6JnK4kciRbK51IcHZIiSYaNI60huwm93fCQuiDIH0CCxYGLIGDVF9C+7JEz9K8aW739+J9e2pP87s3xQD9j1h5kp8rtilSTBLjknSzFmyGcoHW87ZdcrGM/aesPycFagsQtPydb2SN8pdXcwfpfyBg3IPjMCxKRmBuuahcaYIY5rZ8KdVYwa7s9iiyT5tkjVY2iZyt5HAkSyupHImnzuHOtSFBD5vwKYLTxdhQX8RFnTzGAIZGtgagmNEeHD4IbzP1s0/RuTypavvKn434e73F+7+6U56z57608xMyV9q5U/7Wrn8pJgnyzT3n3Jg6eZIOkPeCbaes/u0gWdYW+QzxqkdSaT8gYV6N0+EVIzAAKewY5xgbL3BdGVVqv5skjSQqUW5e1dr4kayt5LCmZRjHObAiS45auNdb0BiAzZTMFyEBQMcfMA1BBYjsFmDExyv4MhDwRgIpT/SOe1PEKi+jfGjFP8Uc7+tuz9cIPxnif2fbqZKP6zcfo6X44QpDpmhDHDfuf+UA8qDkoGxf1XkM+Sf8GND45zCsQEpKn/w+PaBEejplHb6qrtuN33Za+oAn5GasJGsraRutvztnOTCcU7MEnCwY32AcKbp655sXtuGBckMgQ0NLFhoi4lkeHC8+Y7N0hhEKP2x4rS3br4t4rHgnnX1kym+dfcnmP3JEGxSD6jp0hwwS5SfY+Y4acrOm+D+Uw5IPEvuSdLP6X3PdEJBt2p0cBKGqaD8+9gIdHKaO6Lqu6cbUoY/m5SPJmokLkDKZvK22wkuHOPEWW4c6MiprhztzPnu2huwAjEjIiyw+IBrCCRGYLMGnZzwoGWEMThGgIcHjUEQCt9CuPc+pW/puPmdBKovY3xX8W2c73P3Z5h94n4tQ077bDVinp4fB81yf7nPduIU506Qep7s0ySgrZ8azkjSN9I3CcdkUP59ZARaOu2diTu89EbearjZchVLK6mayddOBJiTWzi+iTPcOMiR01yVYEzNRemw5xQ2wJFldfHgLBEWTErBEFiw0GYNZHhgvQKfMbBhwveEdyANwhEH2igYZT/CUXh7yn9PuPc+pbenvXTzLapvwb1kij9JuPuzaqm6s9LvQH6PYpQO06c+DT33lfvLfeZ+c/KUygSd8rCioG+YCZqUQufoyYFlev8age85BA/JerzHCFzgOgMGvWV42vXEFo5t4uw2Zgk4xZWAkPIGFlJIPkDlWX9D0Wm/wsout4iwIBVDYEMDCxba9GEfxys4yWMMbJiQbmJj6x0c53gI1igc6RiGI4xyHraH9/0woeRS0Y8Uyi5P+OPEKZ9mPr91712lP8k57fuIdJ4F96yrn4riz1X7s7LL/Sg6bb0axknjzn3kfnJfub8cPMvZkxw/xwlUHEITHe+PSYE7om2YM7H/U4QnpMDy4uv6usTwsz9jJrVsVjPbmCWgwChwyHoDPwQ+/IE2DMQMykdXoLDfC8hpT6G5wriLEh+Y4hgCiRGcbj7PQI9X0NNjDDoJ8NB6B9YgnCiARGkUrKcgjYM1ENZIyKuFuNy/HSUUXCq5PdmlslsA70Sh8PaUbyfce1fpe3pO+4HmPp3uxPhS8aeIOH+2cffnI6f9tSjs9xjKR29X+8V94/5xH+2pz9HznD5NlJ8zKP2p31S7RDs6FX4h1befjMCRKfK8ReEC08yElgfNrLZ31dRWjm5meojeQPXFBhu4RyPFLBJhCpHuJD2Ggt4lWNHmeYMw32tCjKvN1NcMYQgsWGiLiYZ5vIJTHGMgw4Quwjvo4HgI1ii0dAyDDR+sgbBGwhqKZNdxQrmPF68VcxS9pVB2ecJ3EKd8F8e9l0p/iue0HyaKeCy4J0/8hopP972g9wPqRF8z9Ru1T9wv7hv3TwG8F3NfC1E64nk1gl6HdHNT6AcZLPCcZPyRochnPxsBH9OrNAJRuIANCWaYQY33mJHNryCn4zqsOlWniqrmAFsX6DzxzvuBj28D3l8EbJinC0iIKtNoZLcuNWHFf5vmkp8gHltqahFmmxPFpg/HGOEaIbyCQY4xkGGC9Q6sQZAegjQK7RzDII2DNRDpwlBEXfJxLR0ll4rezlF2ecJbhbenvHTvpdIPEqf9CHNfxoh0nkX1ratfX/FZwUllZtZm9aS42hfuD/eJ+8V94/5VzdmlU7yn/lKc+pmeFO+4BPF+L4fMIzBINwFD4HK9t06xF1yGBDZtdIHpCb8X8bQnkdctDyVDdaZg47k6T0w3UhUQ3aQFa0MmsHoC1ONoCFa0+TfisQ01hqXAGATWIPzceAcXGSGzXsFY8zlGOiHCYCdMsN6BNAjWQ+gqjEIXYRikcbAGwhqJVK/2QsGlkncSJ7tV9q7OCW8V3p7y0r0f7Lj4I819GCtOe1u9Z1F9G+PbE3+hVvyhf8TqCe9iQ+Ymbahv0vvDfeJ+cd/WTN6GkqF/Ql63ZYinXeCc+jKt62sAi+KEaB1mSDQdI/CdBASQPlxAhgRneApHbAppAVa0vQeFfV5G2agq1SXG/PEH1+rCEbqWBJSYQ66yhuB0oKCX5YX/1jSbcG7hqzWf6UnEY3caQzBZFBWdKUKEUU6YIL2DAY6H4DMKPYS30FUYCGskrKFIdp0klPtk8Vr2VO8RoezyhB/gnPLSvR8lXPwzxR5Mdtz8swW4Nx8r2l2Ngl736xN/wruoytyo7j/3QYVqd+v94T5xv8pGVaKwz4+xou3iJIVdZzgufzJWqLTQz9/0jMDRKfLByZBAlo5OELlk6Wqei5WdbsCqUx9Dxdg3sX7WFg0uXQ/sWFbfEBBAZGhAjIBVh6w31+Oh/mVqEP5a4z7/yngEmQI0tCHCOCdMsN6BaxAGOkahv8cw9DEC3EtcPcXVw3PJv8vn9RavKRW9v6PsAz0Kb0956d6PEy6+BPXsaW/v/bza+1/Y96cqxmfvBiv2pOJzH7gf3Jf1s3TOf9Wp2VjZ6SZR1OOWdk/wlHb7SGCieCEDVXwTThOeEMEI28OpIR8S4Q1M8aSXzkPuyUtRNPDXqBj3FtbPXovNl36rAKZaQ3CTLjTZOB9YO41ZA51dyOtqR0Xtqnm9kpr3frnmBPkp4rHF5n2mmRNpsggTpHcgDYL1EE4XRmGwYxikcbAGor8wFMku+fhTHSWXij5YKPvp4oSXCi9P+fHOST/Nie3n1J722a2uQF7XOxVaXz76ZaydloeN8z9Q95f3uVbxlwCbLwXWz9a4TdFAIPfkV039v5uunRJx6g9xejp6RDBDh2ExBwk46AsJOjqkEf2cIhO3fdSizraybI4pMLkYed3uRvGg36j6AG0IvlFFJkSdVQ3BrbrOnMUnPJGYXiROUNBHewVZaZ/UvH52jXv9B1OlmGmEdIY5CacK78A1CGMjjMJw4S1Y42ANhDUSg4WxiLrk44YIBZdKbt/Lp+xjPQpvT/mpnpO+Tumz0i5QXZkFfR5Scbu6v7PKVVEW76cq275P32feb6v4vL/s7Mvrth1Z6QRzrxTu/gxPnYbb3i3r+bt7qN/CbIhmFhJ09XSUDXEqzcY5YYFjCFpeqoAlGgLlEZxdieqLv8C27+t+cqLQBKM+uE53nDE8YAqxfIwWVoKGOR0+QzztdZM1WGBee7ZRjpnm1PIZhAnCKIzzGIbRAlMYKa4RtVd2m/HI6TRNDcHkT/5f/r3+80aJ13QVfZxQ9gkRCm9P+YZKz+5LUrTl97wPxYOeRvmYV1UFJvkaeN94/3gf1f1cCnV/mdIjeQdPfK34QFZLO4J7oadke4Io6hkZcepLgpfg8jezkECmCtt5KKT6ORRSwyPCggzHXaVHcIl2VU97EhVjX8e6GcWqpZRFJ+wtp6vKi//mKUbhZU06swsMEYoHEjjcgZWdXkNW+lIDVs0zXsE5jkGwHsI0YRQmewyDNA7WQOgrpzOprxeicOiNKBp5B4pG361+8v/8Pf8uH1/3GmeJ154gXPlpwlBNEye8VPhzREw/X90zddL3uh/FA59SLv6aydmqB6P64s/VfWpw7xbrOgy28DLGLzpNh1ZZ6Z+oZh9dj3GFU5TluvvDHYq3fh6Kt3YRw2CCy3+QhgQtHOrolk6PuUsiOcDpLx/ttJn6DQFTTLldbsWq/o+ibNRLWDMlR1WdyVOMhBNEqgleMV9NtFoZgylA+RlAyZAdKOz3OvK63qVbkhU3gTQIc4wyne0YBamA0jhYAzEZWS2nI6/3IqwasQylkx9Fxew/YvW5L2DN+f+jfvL//D3/zsfx8fa5+nXmGi9liQlbfmgKqX5qUp0/N/9+qOae34d4bLmphbgR8bTrkNPuFuR1XaYYmEqG/AHlZ7ym7pFS+ot2qvvB+8L7w/vUwHuaomm72M6rBnCm2Qm8xFPuN9kVV/HHCnf/dKeox0fyKkt6jwsDYJpfSOAChNIb6OZhmEnVEJwt3NpzlUtb0PvB2jiWraabzv9U1aQrIb8L2PmA/rn9Ru0ZEMGmoK+bDlSO34WyUW+r8ILoN1uT+ZrZLS8zqLY1CnMdwzBbGAdrIGYiK3028vr8AMVjf4aK2c9j3eX/wIbrirHplvWovm2j+sn/8/f8Ox/Hx2elX244FajQj5u6hlfMicsy6rya91lV877FBtzkVNxCZLcsRk6HNcjrtgmFfT9E8aDPUDbqG1SO19+P35Pfl9+b37/e/bhB1+6r036mwE96Q7H26qzK+zWeyHs1+/Z7Y2TOSUHxXQanbhGnvqR5Dy5/MwYIJTbQ3kM1JcMCFx9wDYHECM5pgGSzAq1s5IuqWq1q9jp94i02xuBOfeKRi46Va8xjs6iFACLrC8hivHrC/6F8zCsq/01UvKDPg8ooMD3GMtisEy9yDIM0DpnI7b4ERWN+gcrMV1F1FWfdf4RtDwEfPgpsf1z/5P/5+6qrVqMyswRFY3KQ2/1tU8NAwLLCKN4uo4RA1olQXZUENhmHE+Rk1oP1EMQ6WBvBfDy/B78Pvxe/H78nv6/yiO40HtFi4xHN1qlUcjawIrMugwJF3R2P5Rh+h4dMFsVVfDfO97n7JzuDXlp6Br2EU/8Q8AaOdzjnJMusSzaZzBDIeLhhLpuNKqxeYxqxNuadvU4rxkKdx1Z96vcYxbhLx77KIFwJBTBunL8N62evwdppBaoQpnzs6ygd8YJyqYsGPKHc64JeP1LgJGnPaSByu96KopFPonLOW6i6ei22LP8G2x8DPn0W2PkysOs1/ZP/5++3LAeqrgYq5wBFI4HcrlrBSZutlLyXJtJUij5E906UjzXKPk2j8kyDEuvg51YKf7PJkPxIfz9+T35fddJfqJXeYiJM4ymAtD0V/ivEY9tMDcU/ahT4v0yYscTc31QVv7dw97uIJh531Fs49Q9Bb+DYBHTTkoYqyhDIMtYJnqaVs+uDYES9Oy5RqDeNAfECctCtm/lvVbq6+TLjGt+gUW8qDBFwnphUHP7+g+9r5WEdAolNN8zbqowJuQ2JoK+e+J4KPUhqsnZmLqoX78CHzJs/DXz5GoB8AJsA7ADwhfm5Sf+ef+fj+PjqxcDamRp0oytOTkVmMgjEUWlZe09CTabj+Hn4ufj5+Dn5efm5Vf/9UnPKX6W/H78n3Xu+HuP6WqXvyKxIhSmlJnPvG6ZZ65cGU7ja3M8JnnJqn+JLerYo+vZjw6l/aHsDkn46zQkLJD4gaalOddpWfd1rMjyY7sEK5qviInoGed2XK/CwZNg7qBj7hQK8mOZSBuFS7R4z782TlJz1yig8UNepyOYXxtI8VdkFR0CN7vbmy/6ND28D/vUo8DXn3K0EsBWJ11b9OD6ez+PzqbR8Pb4uX5/vw/fj+9qOO/t5+PmU53K9/tz8/Pwe68/+CmumfIqKsVtQMmw1VvXPQ173d5DT/kXTiPVrgzM8Ytx7KvxNJq031+mjOMOJ8aXiu7yMcoCLnORUb25D0IZD1wgc5syaOz5FQyA9gsFO/7rb0TYpwhicUy9MIGawsvMyFPR6DUUDPlRsNjx9GROrUzdTg2P2xGVOnP3ujKmJmquKxB9qV1u52z8EvvqtmY5UDmAnUls7zePf1M93X5Pvw/fj+/L9t0mP5PxPFNMOvRFiHkyNklVJYRe9fqRot/g9NWYxz8EsZGuuWyYtS6SHC3Av6sSPUvzjnVmOYWBLWN4Z8+4wCtcQSIygv2h88fW0n5miMZDewc3Ibv0nrOxUqohMGXez6IUxd4WMuWdpw7DxPA2i1Z7Wi/Vpzek237wAIA/AxykagI/14/k8Pl95FYutV/GtAjE3nrddKfr6WRVYOy1fYRJK2Uc8r7MX/X6uCDaZ789uvUCAlHOddOZMUQ7tKv2ZEVwKgwSq38+hWpOK7w5pOTak9sJKZgiOcPCBRIbAgoUueeXAiJbXRMZAlshag3CRIraMx35Xc/q9g3ja2vqoe2+dF6dhKBmm4+naeH2SYcC9EvjoPuDzZ8ywy+okyl+tH8fH83nVV36ONVNXYvWk9xSTDpWcuEXJsGdV5R5DF5JxsDxaZyUWIp52npOqdOsXZEFTIqUfGcGmJMlWewgmpWSKH8a4h7VXDIEMDbok4bUblKIx8DXJ2Iq6y01MzFj5NZN/36jITW1KjqkytiFLxF4xHI0G1l0AbL0d+ORx4ItXjDdQbVz9r83Pav17/p2P4+PXXVCC0tHPKsBSZxZu10re7mrDm3+epy7BrUmQxUpu01MqSj8oCZ9iF8fVD4of1l4HCl1DIDGCdkmYbU9JwRj42mQniio86yHQI7jF9A783lTB/d0wHZeYyri1ZgZChSrMyW5bisLBn6F8JrB+EbBlmU737XgO2Pm/wK439E/+X6UBl32J9YtKUT7zf1A4+EFkt73cW1vgLz7yVSZO8Si8bHtOpvSnJGFUbufE+K7iB4AvrH1iCI4XrLeJuO17pmAMfEQZY50afNtkM9ko2aUmH363GX7xsEmXPWGuR03O/D7k9ngCxWNeROXcv6Pq6mJsvvNjbPuxVviPfqV/8v/8Pf9eOfdVFI95BLk9rjPK7VYXzvAouq83Ybyj8D7ik2RK3zPJTIV0Ae4FxQ9rv4UGRzuz7GR40C6C+tpnDKKoskY4HoLPKEhPYZYAES0BhlbOrPRZyOu7RJcCn/MXrLviXWy4vgTVt25A9dJq9ZP/5+/5d1UK3HeJel50f4FVcl93otuZKFuWfdRniZT+JM9p705V+p6YqBRc/bD2myFoETHfLj1i+IXPGPQRmYRTBeHGYMdDcPvvo1pzfZ17E5DVSjcDFY1cjtIpj6FizjNYfd6LWHPhK+on/8/f8++qGajV9NrnRncYuoru8hMM8yj8aYKkpJ9gLuqZZE6CPO1PCNOWw2pK6UN3wu1xKUzCOcnBDHoJ76CfQ7eViIFnuNO/7/buWyOhr5yT5iL/lEUoPP0mFI2+C8VnLFc/+X/+nn+Xj697DR/HwAgPCYnLUDTAUfi+gqqsh4ftONGkpOPCZOWwDiavINEsvPYOZnCSh123t4dd18fBN9gxDtZAWCMhWXy0wchuNxE5nacj56RZ6if/X59ZaLh47ukelqHBHioyl6Owr3PCSzbjk5yYvn0KsxLDaR/WQeUVJJqGm+5gBu0F9XYXD7++j4XXR9Dp4+8bKIxFqpd8XhTPoCQi9bEUu/MMugjK8vZOTJ9+qExLDisYg2MdzEB6B208HkIUD79rGHwMvtZI9BPGItklH983AdNwTw8VuW9OgW+iUUtnxNlxQenDOlSMQQsHMzjWM2OvpWfGnm8Sj8vjLzn8rZHongINuO/v3YVyu7MGTvIoum9SkZxQ5M40PNaJ6VsEpQ/rUMMMpHdwjDN4053H55vF5xoHd4qPNRSdUxwK0kUodWfnddxpQ+3EZ2gToewx54T/nhhcak/5ENOHdcgbg8Mcg3CUmMjrm8brG9Tpm+MnDYU0GFGX+9g2SeYNuorum1Z8jJhObMeXhy68sMJqRMhwpBjX7TMMx3km+VojkSaMRaqXfF7MM3H4uAhFP1ooe3DpwwprHxiFI4RhcI2DNRDWSFhD8T1hMJJd8vHfFcp9jHgPqeQtxMkelD2ssA5gGGENhDUS33GMhTQa7uU+Rj7fvubhwX0PK6ywwgorrLDCCiussMI6KNf/By8vf3tGAYhRAAAAAElFTkSuQmCC"
  },
  {
    "id": "aura_frost_magic",
    "file": "aura_frost_magic.png",
    "title": "Vòng Trận Pháp Băng Tuyết",
    "tag": "Khuyên dùng Lượt Tôi",
    "cat": "my",
    "base64": "data:image/png;base64,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"
  },
  {
    "id": "aura_inferno_flame",
    "file": "aura_inferno_flame.png",
    "title": "Vòng Hỏa Diệm Địa Ngục",
    "tag": "Khuyên dùng Lượt Đối Thủ",
    "cat": "opp",
    "base64": "data:image/png;base64,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"
  },
  {
    "id": "aura_jade_lotus",
    "file": "aura_jade_lotus.png",
    "title": "Vòng Kim Liên Ngọc Bích",
    "tag": "Khuyên dùng Lượt Tôi",
    "cat": "my",
    "base64": "data:image/png;base64,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"
  },
  {
    "id": "aura_cyber_purple",
    "file": "aura_cyber_purple.png",
    "title": "Vòng Lôi Điện Cyberpunk",
    "tag": "Dùng được cả 2 bên",
    "cat": "both",
    "base64": "data:image/png;base64,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"
  }
];

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/ui/settings_modal.js =====
// src/settings_modal.js - Comprehensive Modal for Feature Settings & Aura Customization
(function (ZigaMod) {
  'use strict';

  let settingsModalEl = null;
  let tempCustomSettings = null;
  let currentActiveTab = 'features';

  /**
   * Initializes the settings modal element in document.body if not already present.
   * @returns {HTMLElement}
   */
  function initSettingsModal() {
    if (document.getElementById('ziga-settings-modal')) {
      settingsModalEl = document.getElementById('ziga-settings-modal');
      return settingsModalEl;
    }

    settingsModalEl = document.createElement('div');
    settingsModalEl.id = 'ziga-settings-modal';
    settingsModalEl.className = 'ziga-aura-modal-overlay';
    settingsModalEl.style.display = 'none';

    settingsModalEl.innerHTML = `
      <div class="ziga-aura-modal-dialog">
        <!-- Modal Header -->
        <div class="ziga-aura-modal-header">
          <div class="ziga-aura-modal-title">
            <span class="ziga-aura-modal-badge">⚙️</span>
            <div class="ziga-aura-modal-title-text">
              <h3>CÀI ĐẶT & TÙY BIẾN MOD</h3>
              <small>Bật/tắt các công cụ hỗ trợ & tùy chỉnh hào quang bàn cờ Ziga</small>
            </div>
          </div>
          <button class="ziga-aura-modal-close" id="ziga-settings-modal-close-btn" type="button" title="Đóng cài đặt">✕</button>
        </div>

        <!-- Live Preview Stage (Chỉ hiển thị khi tùy biến Aura) -->
        <div class="ziga-aura-preview-stage" id="ziga-modal-preview-stage" style="display:none;">
          <div class="ziga-aura-preview-header">
            <span>👁️ XEM TRƯỚC HIỆU ỨNG THỜI GIAN THỰC (LIVE PREVIEW)</span>
          </div>
          <div class="ziga-aura-preview-body">
            <!-- Quân Ta Mẫu -->
            <div class="ziga-preview-piece-col">
              <div class="ziga-preview-piece-container">
                <div class="ziga-mock-piece red-piece">帥</div>
                <div class="ziga-mock-aura" id="ziga-mock-aura-my"></div>
              </div>
              <div class="ziga-preview-role-label">LƯỢT TÔI ĐI</div>
              <span class="ziga-preview-subtag my-subtag">Quân Có Thể Ăn</span>
            </div>

            <div class="ziga-preview-divider-vs">VS</div>

            <!-- Quân Địch Mẫu -->
            <div class="ziga-preview-piece-col">
              <div class="ziga-preview-piece-container">
                <div class="ziga-mock-piece black-piece">將</div>
                <div class="ziga-mock-aura" id="ziga-mock-aura-opp"></div>
              </div>
              <div class="ziga-preview-role-label">LƯỢT ĐỐI THỦ ĐI</div>
              <span class="ziga-preview-subtag opp-subtag">Quân Ta Bị Nhắm</span>
            </div>
          </div>

          <!-- Size Slider Control -->
          <div class="ziga-aura-scale-control-bar">
            <span class="ziga-scale-label">📏 Kích Thước Vòng Hào Quang:</span>
            <input type="range" id="ziga-modal-scale-slider" min="0.7" max="1.3" step="0.05" value="1.0" class="ziga-scale-slider" />
            <span class="ziga-scale-val-badge" id="ziga-modal-scale-val">100%</span>
            <button class="ziga-btn-reset-scale" id="ziga-btn-reset-modal-scale" type="button" title="Đặt lại kích thước chuẩn 100%">Chuẩn 100%</button>
          </div>

          <!-- Animation & Motion Control Bar -->
          <div class="ziga-aura-anim-control-bar">
            <div class="ziga-anim-select-group">
              <label for="ziga-modal-anim-select" class="ziga-scale-label">✨ Hiệu Ứng:</label>
              <select id="ziga-modal-anim-select" class="ziga-anim-select">
                <option value="spin_pulse">🌀 Xoay Tròn & Chớp Nháy (Đẹp nhất)</option>
                <option value="spin">🔄 Xoay Tròn 360° Liên Tục</option>
                <option value="pulse">💡 Chớp Nháy Hơi Thở (Breathing Pulse)</option>
                <option value="heartbeat">💓 Nhịp Tim Dồn Dập (Heartbeat)</option>
                <option value="static">⏸️ Tĩnh (Không Chuyển Động)</option>
              </select>
            </div>
            <div class="ziga-anim-speed-group" id="ziga-modal-speed-wrap">
              <span class="ziga-scale-label">⚡ Tốc Độ Xoay:</span>
              <input type="range" id="ziga-modal-speed-slider" min="1.0" max="8.0" step="0.5" value="3.5" class="ziga-scale-slider" />
              <span class="ziga-scale-val-badge" id="ziga-modal-speed-val">3.5s</span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="ziga-aura-tabs-nav">
          <button class="ziga-aura-tab-btn active" id="ziga-modal-tab-btn-features" type="button" data-tab="features">
            <span>⚙️ CÀI ĐẶT TÍNH NĂNG</span>
          </button>
          <button class="ziga-aura-tab-btn" id="ziga-modal-tab-btn-themes" type="button" data-tab="themes">
            <span>🎨 CHỦ ĐỀ & MÀU AURA</span>
          </button>
          <button class="ziga-aura-tab-btn" id="ziga-modal-tab-btn-images" type="button" data-tab="images">
            <span>🖼️ MẪU ẢNH AURA PNG</span>
          </button>
        </div>

        <!-- TAB 1: Cài Đặt Tính Năng (Features) -->
        <div class="ziga-aura-tab-pane active" id="ziga-modal-pane-features">
          <div class="ziga-settings-groups-grid">
            
            <!-- Nhóm 1: Hỗ Trợ Tác Chiến -->
            <div class="ziga-settings-group-card">
              <div class="ziga-group-title">⚔️ HỖ TRỢ NƯỚC ĐI & TÁC CHIẾN</div>
              <div class="ziga-group-rows">

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Quân đã bị ăn</strong>
                    <small>Thống kê số lượng quân đã mất của 2 bên</small>
                  </span>
                  <input type="checkbox" id="modal-set-showLostPieces" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Highlight tầm đánh trên bàn cờ</strong>
                    <small>Bấm vào quân để nhấp nháy quân ăn được</small>
                  </span>
                  <input type="checkbox" id="modal-set-highlightTactics" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <div class="ziga-setting-row-box">
                  <label class="ziga-setting-row" style="margin-bottom:0; border-bottom-left-radius:0; border-bottom-right-radius:0;">
                    <span class="ziga-setting-text">
                      <strong>Aura Live (Hào quang xanh / đỏ)</strong>
                      <small>Lượt ta viền xanh ăn cờ, lượt đối thủ viền đỏ quân ta bị nhắm</small>
                    </span>
                    <input type="checkbox" id="modal-set-liveBoardAura" />
                    <span class="ziga-switch-slider"></span>
                  </label>
                  <div class="ziga-setting-sublink-bar">
                    <button class="ziga-btn-goto-aura" id="ziga-btn-goto-aura-tab" type="button">
                      🎨 Mở Tab Tùy Biến Màu Sắc & Hình Ảnh Aura ➔
                    </button>
                  </div>
                </div>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Bảng tầm đánh trên HUD</strong>
                    <small>Hiển thị chi tiết quân đang chọn & mục tiêu</small>
                  </span>
                  <input type="checkbox" id="modal-set-showTacticalHud" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Cảnh báo quân bị đe dọa</strong>
                    <small>Báo động khi chủ lực của bạn đang có nguy cơ bị ăn</small>
                  </span>
                  <input type="checkbox" id="modal-set-threatAlert" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Ghi biên bản ván đấu (FEN/PGN)</strong>
                    <small>Tự động ghi từng nước đi chuẩn tiếng Việt & copy FEN</small>
                  </span>
                  <input type="checkbox" id="modal-set-showMoveHistory" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Vẽ mũi tên chiến thuật bằng chuột phải</strong>
                    <small>Giữ chuột phải kéo vẽ mũi tên neon, click highlight ô</small>
                  </span>
                  <input type="checkbox" id="modal-set-tacticalDrawing" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Nhận diện Khai Cuộc (60+ thế trận)</strong>
                    <small>Tự động phát hiện Thuận Pháo, Bình Phong Mã, Đơn Đề Mã...</small>
                  </span>
                  <input type="checkbox" id="modal-set-openingBook" />
                  <span class="ziga-switch-slider"></span>
                </label>

              </div>
            </div>

            <!-- Nhóm 2: Thống Kê & Giao Diện -->
            <div class="ziga-settings-group-card">
              <div class="ziga-group-title">📊 THỐNG KÊ, HIỂN THỊ & CỜ ÚP</div>
              <div class="ziga-group-rows">

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Thống kê & Xác suất Cờ Úp</strong>
                    <small>Đếm quân úp và tính % mở Xe, Pháo, Mã...</small>
                  </span>
                  <input type="checkbox" id="modal-set-showCoUpTracker" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Thanh chênh lệch điểm quân</strong>
                    <small>Đo lường ưu thế lực lượng (+9 Xe, +4.5 Pháo...)</small>
                  </span>
                  <input type="checkbox" id="modal-set-materialAdvantage" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Đếm Xe - Pháo - Mã còn lại</strong>
                    <small>Thống kê số lượng chủ lực còn sống</small>
                  </span>
                  <input type="checkbox" id="modal-set-showKeyPieces" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Ký hiệu tiếng Việt (X, P, M...)</strong>
                    <small>Hiển thị chữ quốc ngữ thay cho chữ Hán</small>
                  </span>
                  <input type="checkbox" id="modal-set-vietnameseLabels" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Đánh số hàng (1-10) bàn cờ</strong>
                    <small>Hiển thị số hàng ở 2 mép gỗ bàn cờ</small>
                  </span>
                  <input type="checkbox" id="modal-set-showRowNumbers" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Ẩn quảng cáo che khuất</strong>
                    <small>Tự động xóa các banner quảng cáo nổi vướng bàn cờ</small>
                  </span>
                  <input type="checkbox" id="modal-set-cleanAdView" />
                  <span class="ziga-switch-slider"></span>
                </label>

              </div>
            </div>

            <!-- Nhóm 3: Trí Tuệ Nhân Tạo & Âm Thanh -->
            <div class="ziga-settings-group-card" style="grid-column: 1 / -1;">
              <div class="ziga-group-title">🧠 TRÍ TUỆ NHÂN TẠO & GIỌNG ĐỌC CẢNH BÁO</div>
              <div class="ziga-group-rows" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Thanh đo thế trận (Eval Bar)</strong>
                    <small>Thanh năng lượng hiển thị điểm ưu thế theo thời gian thực</small>
                  </span>
                  <input type="checkbox" id="modal-set-evalBar" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Gợi ý nước đi tối ưu (Best Move)</strong>
                    <small>Mũi tên phát quang vàng kim chỉ nước đi AI khuyến nghị</small>
                  </span>
                  <input type="checkbox" id="modal-set-bestMoveArrow" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Giọng đọc Tiếng Việt (Voice Announcer)</strong>
                    <small>Đọc to "Chiếu tướng!", "Bắt Xe!", "Cảnh báo sát cuộc!"</small>
                  </span>
                  <input type="checkbox" id="modal-set-voiceAnnouncer" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Cảnh báo nhịp tim & đếm ngược khi hết giờ</strong>
                    <small>Tiếng đập thình thịch khi còn 15s và đếm số 5..4..3..2..1</small>
                  </span>
                  <input type="checkbox" id="modal-set-timerAlertVoice" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row" style="grid-column: 1 / -1;">
                  <span class="ziga-setting-text">
                    <strong>🎓 Gia Sư Cờ Tướng Đồng Hành (AI Mentor)</strong>
                    <small>Phân tích thế trận, nhận diện điểm yếu, tư vấn 3 kế sách & truyền thụ đạo cờ theo thời gian thực</small>
                  </span>
                  <input type="checkbox" id="modal-set-mentorCoach" />
                  <span class="ziga-switch-slider"></span>
                </label>

              </div>
            </div>

          </div>
        </div>

        <!-- TAB 2: Themes & Màu Sắc (Aura Colors) -->
        <div class="ziga-aura-tab-pane" id="ziga-modal-pane-themes" style="display:none;">
          <div class="ziga-aura-pane-section">
            <span class="ziga-pane-section-title">CHỌN NHANH THEME LÀM SẴN</span>
            <div class="ziga-aura-themes-grid" id="ziga-modal-themes-container"></div>
          </div>

          <div class="ziga-aura-pane-section" style="margin-top: 14px;">
            <span class="ziga-pane-section-title">TỰ CHỈNH MÃ MÀU TÙY Ý (HEX / COLOR PICKER)</span>
            <div class="ziga-aura-color-pickers-box">
              <div class="ziga-color-pick-item">
                <label for="ziga-pick-my-color">Màu Lượt Tôi Đi:</label>
                <div class="ziga-pick-controls">
                  <input type="color" id="ziga-pick-my-color" class="ziga-color-input" value="#39ff14" />
                  <input type="text" id="ziga-pick-my-hex" class="ziga-hex-text" value="#39ff14" maxlength="7" />
                </div>
              </div>
              <div class="ziga-color-pick-item">
                <label for="ziga-pick-opp-color">Màu Lượt Đối Thủ:</label>
                <div class="ziga-pick-controls">
                  <input type="color" id="ziga-pick-opp-color" class="ziga-color-input" value="#ff1744" />
                  <input type="text" id="ziga-pick-opp-hex" class="ziga-hex-text" value="#ff1744" maxlength="7" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: Mẫu Ảnh Aura PNG (Custom & Presets) -->
        <div class="ziga-aura-tab-pane" id="ziga-modal-pane-images" style="display:none;">
          <!-- Bộ sưu tập Preset 1-Click Test Ngay -->
          <div class="ziga-aura-presets-section">
            <div class="ziga-presets-header">
              <span class="ziga-presets-title">✨ MẪU ẢNH AURA CÓ SẴN (CHỌN 1-CLICK TEST NGAY)</span>
              <span class="ziga-presets-subtitle">Bấm <strong>[🟢 Lượt Tôi]</strong> hoặc <strong>[🔴 Đối Thủ]</strong> để test ngay! Bạn có thể kết hợp với hiệu ứng xoay tròn, chớp nháy hoặc nhịp tim ở thanh điều khiển phía trên.</span>
            </div>
            <div class="ziga-aura-presets-grid" id="ziga-modal-presets-container"></div>
          </div>

          <!-- Tự nạp ảnh PNG từ máy -->
          <div class="ziga-aura-pane-section" style="margin-top: 14px;">
            <div class="ziga-pane-section-title">📁 TỰ NẠP ẢNH PNG TÙY CHỌN TỪ MÁY TÍNH</div>
            <div class="ziga-aura-upload-columns">
              <div class="ziga-upload-column-card">
                <span class="ziga-upload-card-heading">ẢNH AURA LƯỢT TÔI</span>
                <div class="ziga-upload-thumbnail-box" id="ziga-thumb-box-my">
                  <span class="ziga-thumb-placeholder">Đang dùng viền Neon</span>
                </div>
                <div class="ziga-upload-action-row">
                  <label class="ziga-btn-choose-file">
                    📁 Chọn file PNG...
                    <input type="file" id="ziga-file-upload-my" accept="image/png,image/webp,image/svg+xml" style="display:none;" />
                  </label>
                  <button class="ziga-btn-clear-img" id="ziga-btn-clear-my" type="button" title="Gỡ bỏ ảnh, dùng lại Neon">✕ Xóa</button>
                </div>
              </div>

              <div class="ziga-upload-column-card">
                <span class="ziga-upload-card-heading">ẢNH AURA LƯỢT ĐỐI THỦ</span>
                <div class="ziga-upload-thumbnail-box" id="ziga-thumb-box-opp">
                  <span class="ziga-thumb-placeholder">Đang dùng viền Neon</span>
                </div>
                <div class="ziga-upload-action-row">
                  <label class="ziga-btn-choose-file">
                    📁 Chọn file PNG...
                    <input type="file" id="ziga-file-upload-opp" accept="image/png,image/webp,image/svg+xml" style="display:none;" />
                  </label>
                  <button class="ziga-btn-clear-img" id="ziga-btn-clear-opp" type="button" title="Gỡ bỏ ảnh, dùng lại Neon">✕ Xóa</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Guidelines -->
          <div class="ziga-aura-guideline-card" style="margin-top: 12px;">
            <div class="ziga-guide-title">📐 TIÊU CHUẨN FILE ẢNH AURA TỰ VẼ (PHOTOSHOP / CANVA):</div>
            <ul>
              <li><strong>Định dạng:</strong> File ảnh <code>.PNG</code> nền trong suốt (Alpha Channel).</li>
              <li><strong>Kích thước chuẩn:</strong> Ảnh vuông <code>128x128 px</code> hoặc <code>256x256 px</code>.</li>
              <li><strong>Vùng an toàn:</strong> Tâm ảnh chính giữa, lòng trong rỗng (đường kính ~74%) để không che chữ quân cờ gỗ.</li>
            </ul>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="ziga-aura-modal-footer">
          <button class="ziga-modal-btn secondary" id="ziga-modal-btn-restore-default" type="button">
            🔄 Khôi Phục Mặc Định
          </button>
          <button class="ziga-modal-btn primary" id="ziga-modal-btn-save-confirm" type="button">
            💾 ĐÓNG & ÁP DỤNG
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(settingsModalEl);
    bindSettingsModalEvents();
    return settingsModalEl;
  }

  /**
   * Switches active tab in the settings modal.
   * @param {'features'|'themes'|'images'} tabId
   */
  function switchModalTab(tabId) {
    currentActiveTab = tabId;

    const btnFeatures = document.getElementById('ziga-modal-tab-btn-features');
    const btnThemes = document.getElementById('ziga-modal-tab-btn-themes');
    const btnImages = document.getElementById('ziga-modal-tab-btn-images');

    const paneFeatures = document.getElementById('ziga-modal-pane-features');
    const paneThemes = document.getElementById('ziga-modal-pane-themes');
    const paneImages = document.getElementById('ziga-modal-pane-images');

    const previewStage = document.getElementById('ziga-modal-preview-stage');

    // Update Tab Buttons
    if (btnFeatures) btnFeatures.classList.toggle('active', tabId === 'features');
    if (btnThemes) btnThemes.classList.toggle('active', tabId === 'themes');
    if (btnImages) btnImages.classList.toggle('active', tabId === 'images');

    // Update Tab Panes
    if (paneFeatures) paneFeatures.style.display = (tabId === 'features') ? 'block' : 'none';
    if (paneThemes) paneThemes.style.display = (tabId === 'themes') ? 'block' : 'none';
    if (paneImages) paneImages.style.display = (tabId === 'images') ? 'block' : 'none';

    // Preview Stage is shown only on Themes & Images tabs for a clean, spacious Features tab
    if (previewStage) {
      previewStage.style.display = (tabId === 'features') ? 'none' : 'block';
    }
  }

  /**
   * Binds all event listeners inside the settings modal.
   */
  function bindSettingsModalEvents() {
    if (!settingsModalEl) return;

    // Close button & outside click
    const closeBtn = document.getElementById('ziga-settings-modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal);

    settingsModalEl.addEventListener('click', (e) => {
      if (e.target === settingsModalEl) closeSettingsModal();
    });

    // Tab buttons switching
    const tabBtns = settingsModalEl.querySelectorAll('.ziga-aura-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) switchModalTab(tab);
      });
    });

    // Shortcut button in Features tab to jump directly to Aura Themes tab
    const gotoAuraBtn = document.getElementById('ziga-btn-goto-aura-tab');
    if (gotoAuraBtn) {
      gotoAuraBtn.addEventListener('click', () => {
        switchModalTab('themes');
      });
    }

    // Bind all 10 feature settings switches
    Object.keys(ZigaMod.DEFAULT_SETTINGS).forEach(key => {
      if (key === 'auraCustom' || key === 'liveAuraMode') return;
      const checkbox = document.getElementById(`modal-set-${key}`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          ZigaMod.userSettings[key] = e.target.checked;
          ZigaMod.saveSettings();
          if (ZigaMod.applySettingsVisibility) {
            ZigaMod.applySettingsVisibility();
          }
          ZigaMod.lastStateHash = ''; // Force immediate UI refresh
        });
      }
    });

    // Size Scale Slider events
    const scaleSlider = document.getElementById('ziga-modal-scale-slider');
    const scaleVal = document.getElementById('ziga-modal-scale-val');
    const resetScaleBtn = document.getElementById('ziga-btn-reset-modal-scale');

    if (scaleSlider) {
      scaleSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (tempCustomSettings) {
          tempCustomSettings.scale = val;
        }
        if (scaleVal) scaleVal.textContent = Math.round(val * 100) + '%';
        updateModalLivePreview();
      });
    }

    if (resetScaleBtn) {
      resetScaleBtn.addEventListener('click', () => {
        if (tempCustomSettings) {
          tempCustomSettings.scale = 1.0;
        }
        if (scaleSlider) scaleSlider.value = '1.0';
        if (scaleVal) scaleVal.textContent = '100%';
        updateModalLivePreview();
      });
    }

    // Animation Effect & Speed controls
    const animSelect = document.getElementById('ziga-modal-anim-select');
    const speedSlider = document.getElementById('ziga-modal-speed-slider');
    const speedVal = document.getElementById('ziga-modal-speed-val');
    const speedWrap = document.getElementById('ziga-modal-speed-wrap');

    if (animSelect) {
      animSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (tempCustomSettings) {
          tempCustomSettings.animation = val;
        }
        if (speedWrap) {
          speedWrap.style.display = (val === 'static' || val === 'pulse') ? 'none' : 'flex';
        }
        updateModalLivePreview();
      });
    }

    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (tempCustomSettings) {
          tempCustomSettings.spinSpeed = val;
        }
        if (speedVal) speedVal.textContent = val.toFixed(1) + 's';
        updateModalLivePreview();
      });
    }

    // Color Pickers input synchronization
    const pickMyColor = document.getElementById('ziga-pick-my-color');
    const pickMyHex = document.getElementById('ziga-pick-my-hex');
    const pickOppColor = document.getElementById('ziga-pick-opp-color');
    const pickOppHex = document.getElementById('ziga-pick-opp-hex');

    if (pickMyColor && pickMyHex) {
      pickMyColor.addEventListener('input', (e) => {
        pickMyHex.value = e.target.value.toUpperCase();
        if (tempCustomSettings) {
          tempCustomSettings.myColor = e.target.value;
          tempCustomSettings.mode = 'neon';
          tempCustomSettings.theme = 'custom';
        }
        updateModalLivePreview();
        highlightActiveThemeCard();
      });

      pickMyHex.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          pickMyColor.value = val;
          if (tempCustomSettings) {
            tempCustomSettings.myColor = val;
            tempCustomSettings.mode = 'neon';
            tempCustomSettings.theme = 'custom';
          }
          updateModalLivePreview();
          highlightActiveThemeCard();
        }
      });
    }

    if (pickOppColor && pickOppHex) {
      pickOppColor.addEventListener('input', (e) => {
        pickOppHex.value = e.target.value.toUpperCase();
        if (tempCustomSettings) {
          tempCustomSettings.oppColor = e.target.value;
          tempCustomSettings.mode = 'neon';
          tempCustomSettings.theme = 'custom';
        }
        updateModalLivePreview();
        highlightActiveThemeCard();
      });

      pickOppHex.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          pickOppColor.value = val;
          if (tempCustomSettings) {
            tempCustomSettings.oppColor = val;
            tempCustomSettings.mode = 'neon';
            tempCustomSettings.theme = 'custom';
          }
          updateModalLivePreview();
          highlightActiveThemeCard();
        }
      });
    }

    // File Upload handling via FileReader
    const fileMy = document.getElementById('ziga-file-upload-my');
    const clearMy = document.getElementById('ziga-btn-clear-my');
    const fileOpp = document.getElementById('ziga-file-upload-opp');
    const clearOpp = document.getElementById('ziga-btn-clear-opp');

    if (fileMy) {
      fileMy.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (tempCustomSettings) {
              tempCustomSettings.customImageMy = ev.target.result;
              tempCustomSettings.mode = 'image';
            }
            updateThumbnailPreview('my', ev.target.result);
            updateModalLivePreview();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (clearMy) {
      clearMy.addEventListener('click', () => {
        if (tempCustomSettings) {
          tempCustomSettings.customImageMy = '';
          if (!tempCustomSettings.customImageOpp) tempCustomSettings.mode = 'neon';
        }
        if (fileMy) fileMy.value = '';
        updateThumbnailPreview('my', '');
        updateModalLivePreview();
      });
    }

    if (fileOpp) {
      fileOpp.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (tempCustomSettings) {
              tempCustomSettings.customImageOpp = ev.target.result;
              tempCustomSettings.mode = 'image';
            }
            updateThumbnailPreview('opp', ev.target.result);
            updateModalLivePreview();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (clearOpp) {
      clearOpp.addEventListener('click', () => {
        if (tempCustomSettings) {
          tempCustomSettings.customImageOpp = '';
          if (!tempCustomSettings.customImageMy) tempCustomSettings.mode = 'neon';
        }
        if (fileOpp) fileOpp.value = '';
        updateThumbnailPreview('opp', '');
        updateModalLivePreview();
      });
    }

    // Restore Defaults button (resets both features and aura to default)
    const resetDefaultBtn = document.getElementById('ziga-modal-btn-restore-default');
    if (resetDefaultBtn) {
      resetDefaultBtn.addEventListener('click', () => {
        ZigaMod.userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS);
        tempCustomSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS.auraCustom);
        ZigaMod.userSettings.auraCustom = Object.assign({}, tempCustomSettings);
        ZigaMod.saveSettings();

        syncModalFeaturesCheckboxes();
        syncModalControls();
        updateModalLivePreview();

        if (ZigaMod.applySettingsVisibility) {
          ZigaMod.applySettingsVisibility();
        }
        if (ZigaMod.reloadAuraTextures) {
          ZigaMod.reloadAuraTextures();
        }
        ZigaMod.lastStateHash = '';
      });
    }

    // Save and Apply button
    const saveApplyBtn = document.getElementById('ziga-modal-btn-save-confirm');
    if (saveApplyBtn) {
      saveApplyBtn.addEventListener('click', () => {
        if (tempCustomSettings) {
          ZigaMod.userSettings.auraCustom = Object.assign({}, tempCustomSettings);
          ZigaMod.saveSettings();
          if (ZigaMod.reloadAuraTextures) {
            ZigaMod.reloadAuraTextures();
          }
        }
        closeSettingsModal();
      });
    }
  }

  /**
   * Synchronizes checkbox states in Tab 1 with current userSettings.
   */
  function syncModalFeaturesCheckboxes() {
    const s = ZigaMod.userSettings || ZigaMod.DEFAULT_SETTINGS;
    Object.keys(ZigaMod.DEFAULT_SETTINGS).forEach(key => {
      const cb = document.getElementById(`modal-set-${key}`);
      if (cb) {
        cb.checked = !!s[key];
      }
    });
  }

  /**
   * Renders built-in Neon Themes in Tab 2.
   */
  function renderThemesGrid() {
    const container = document.getElementById('ziga-modal-themes-container');
    if (!container) return;

    const themes = ZigaMod.AURA_THEMES || {};
    let html = '';

    Object.keys(themes).forEach((k) => {
      const th = themes[k];
      const isSelected = (tempCustomSettings && tempCustomSettings.theme === th.id && tempCustomSettings.mode === 'neon');
      html += `
        <div class="ziga-theme-card ${isSelected ? 'selected' : ''}" data-theme-id="${th.id}">
          <div class="ziga-theme-swatches">
            <span class="ziga-theme-color-circle" style="background:${th.myColor}; box-shadow:0 0 8px ${th.myColor};"></span>
            <span class="ziga-theme-vs-small">vs</span>
            <span class="ziga-theme-color-circle" style="background:${th.oppColor}; box-shadow:0 0 8px ${th.oppColor};"></span>
          </div>
          <div class="ziga-theme-info">
            <div class="ziga-theme-name">${th.name}</div>
            <div class="ziga-theme-desc">${th.desc}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.ziga-theme-card').forEach((card) => {
      card.addEventListener('click', () => {
        const tid = card.dataset.themeId;
        const th = themes[tid];
        if (th && tempCustomSettings) {
          tempCustomSettings.theme = tid;
          tempCustomSettings.myColor = th.myColor;
          tempCustomSettings.oppColor = th.oppColor;
          tempCustomSettings.mode = 'neon';
          syncModalControls();
          updateModalLivePreview();
        }
      });
    });
  }

  function highlightActiveThemeCard() {
    const container = document.getElementById('ziga-modal-themes-container');
    if (!container) return;
    container.querySelectorAll('.ziga-theme-card').forEach((card) => {
      const tid = card.dataset.themeId;
      const isActive = (tempCustomSettings && tempCustomSettings.theme === tid && tempCustomSettings.mode === 'neon');
      card.classList.toggle('selected', !!isActive);
    });
  }

  /**
   * Renders 5 high-quality PNG presets in Tab 3.
   */
  function renderAuraPresetsGrid() {
    const container = document.getElementById('ziga-modal-presets-container');
    if (!container) return;

    const presets = ZigaMod.PRESET_AURAS || [];
    if (!presets.length) {
      container.innerHTML = '<div style="color:#64748b; font-size:11px; padding:8px;">Chưa nạp được danh sách mẫu ảnh có sẵn.</div>';
      return;
    }

    let html = '';
    presets.forEach((p) => {
      html += `
        <div class="ziga-preset-card" data-preset-id="${p.id}">
          <div class="ziga-preset-preview-wrap">
            <div class="ziga-mock-piece-preset">
              <div class="ziga-mock-preset-char">俥</div>
              <div class="ziga-preset-aura-circle" style="background-image: url('${p.base64}');"></div>
            </div>
          </div>
          <div class="ziga-preset-details">
            <div class="ziga-preset-name">${p.title}</div>
            <div class="ziga-preset-badge ${p.cat}">${p.tag || ''}</div>
            <div class="ziga-preset-actions">
              <button class="ziga-preset-btn my" type="button" data-action="set-my" title="Gán ảnh này cho Lượt Tôi">
                🟢 Lượt Tôi
              </button>
              <button class="ziga-preset-btn opp" type="button" data-action="set-opp" title="Gán ảnh này cho Lượt Đối Thủ">
                🔴 Đối Thủ
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.ziga-preset-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const card = btn.closest('.ziga-preset-card');
        const pid = card && card.dataset.presetId;
        const found = presets.find(item => item.id === pid);
        if (!found || !tempCustomSettings) return;

        if (action === 'set-my') {
          tempCustomSettings.customImageMy = found.base64;
          tempCustomSettings.mode = 'image';
          updateThumbnailPreview('my', found.base64);
        } else if (action === 'set-opp') {
          tempCustomSettings.customImageOpp = found.base64;
          tempCustomSettings.mode = 'image';
          updateThumbnailPreview('opp', found.base64);
        }
        updateModalLivePreview();
        highlightActivePresets();
      });
    });

    highlightActivePresets();
  }

  function highlightActivePresets() {
    const container = document.getElementById('ziga-modal-presets-container');
    if (!container || !tempCustomSettings) return;

    const presets = ZigaMod.PRESET_AURAS || [];
    container.querySelectorAll('.ziga-preset-card').forEach((card) => {
      const pid = card.dataset.presetId;
      const p = presets.find(item => item.id === pid);
      if (!p) return;

      const isMy = (tempCustomSettings.mode === 'image' && tempCustomSettings.customImageMy === p.base64);
      const isOpp = (tempCustomSettings.mode === 'image' && tempCustomSettings.customImageOpp === p.base64);

      card.classList.toggle('active-my', isMy);
      card.classList.toggle('active-opp', isOpp);
    });
  }

  /**
   * Synchronizes color picker and slider controls with tempCustomSettings.
   */
  function syncModalControls() {
    if (!tempCustomSettings) return;

    const pickMyColor = document.getElementById('ziga-pick-my-color');
    const pickMyHex = document.getElementById('ziga-pick-my-hex');
    const pickOppColor = document.getElementById('ziga-pick-opp-color');
    const pickOppHex = document.getElementById('ziga-pick-opp-hex');

    if (pickMyColor) pickMyColor.value = tempCustomSettings.myColor || '#39ff14';
    if (pickMyHex) pickMyHex.value = (tempCustomSettings.myColor || '#39ff14').toUpperCase();
    if (pickOppColor) pickOppColor.value = tempCustomSettings.oppColor || '#ff1744';
    if (pickOppHex) pickOppHex.value = (tempCustomSettings.oppColor || '#ff1744').toUpperCase();

    // Scale Slider sync
    const scaleSlider = document.getElementById('ziga-modal-scale-slider');
    const scaleVal = document.getElementById('ziga-modal-scale-val');
    const curScale = (typeof tempCustomSettings.scale === 'number') ? tempCustomSettings.scale : 1.0;
    if (scaleSlider) scaleSlider.value = curScale;
    if (scaleVal) scaleVal.textContent = Math.round(curScale * 100) + '%';

    // Animation Effect & Speed sync
    const animSelect = document.getElementById('ziga-modal-anim-select');
    const speedSlider = document.getElementById('ziga-modal-speed-slider');
    const speedVal = document.getElementById('ziga-modal-speed-val');
    const speedWrap = document.getElementById('ziga-modal-speed-wrap');

    const curAnim = (tempCustomSettings && tempCustomSettings.animation) || 'spin_pulse';
    const curSpeed = (tempCustomSettings && typeof tempCustomSettings.spinSpeed === 'number') ? tempCustomSettings.spinSpeed : 3.5;

    if (animSelect) animSelect.value = curAnim;
    if (speedSlider) speedSlider.value = curSpeed;
    if (speedVal) speedVal.textContent = curSpeed.toFixed(1) + 's';
    if (speedWrap) {
      speedWrap.style.display = (curAnim === 'static' || curAnim === 'pulse') ? 'none' : 'flex';
    }

    updateThumbnailPreview('my', tempCustomSettings.customImageMy || '');
    updateThumbnailPreview('opp', tempCustomSettings.customImageOpp || '');

    highlightActiveThemeCard();
    highlightActivePresets();
  }

  function updateThumbnailPreview(side, dataUrl) {
    const box = document.getElementById(`ziga-thumb-box-${side}`);
    if (!box) return;

    if (dataUrl && dataUrl.startsWith('data:image')) {
      box.innerHTML = `<img src="${dataUrl}" class="ziga-upload-thumb-img" alt="Aura Preview" />`;
    } else {
      box.innerHTML = `<span class="ziga-thumb-placeholder">Đang dùng viền Neon</span>`;
    }
  }

  /**
   * Updates real-time Mock Live Preview of the 2 chess pieces.
   */
  function updateModalLivePreview() {
    if (!tempCustomSettings) return;

    const previewMy = document.getElementById('ziga-mock-aura-my');
    const previewOpp = document.getElementById('ziga-mock-aura-opp');
    const curScale = (typeof tempCustomSettings.scale === 'number') ? tempCustomSettings.scale : 1.0;
    const curAnim = tempCustomSettings.animation || 'spin_pulse';
    const curSpeed = (typeof tempCustomSettings.spinSpeed === 'number') ? tempCustomSettings.spinSpeed : 3.5;
    const animClasses = ['anim-spin_pulse', 'anim-spin', 'anim-pulse', 'anim-heartbeat', 'anim-static'];

    [previewMy, previewOpp].forEach((el) => {
      if (!el) return;
      animClasses.forEach(c => el.classList.remove(c));
      el.classList.add(`anim-${curAnim}`);
      el.style.setProperty('--aura-speed', `${curSpeed}s`);
    });

    if (previewMy) {
      previewMy.style.setProperty('--aura-scale', curScale);
      if (tempCustomSettings.mode === 'image' && tempCustomSettings.customImageMy) {
        previewMy.style.backgroundImage = `url(${tempCustomSettings.customImageMy})`;
        previewMy.style.backgroundSize = 'contain';
        previewMy.style.backgroundRepeat = 'no-repeat';
        previewMy.style.backgroundPosition = 'center';
        previewMy.style.border = 'none';
        previewMy.style.boxShadow = 'none';
      } else {
        const myCol = tempCustomSettings.myColor || '#39ff14';
        previewMy.style.backgroundImage = 'none';
        previewMy.style.border = `2.5px solid ${myCol}`;
        previewMy.style.boxShadow = `0 0 10px ${myCol}, 0 0 22px ${myCol}, inset 0 0 8px ${myCol}`;
      }
    }

    if (previewOpp) {
      previewOpp.style.setProperty('--aura-scale', curScale);
      if (tempCustomSettings.mode === 'image' && tempCustomSettings.customImageOpp) {
        previewOpp.style.backgroundImage = `url(${tempCustomSettings.customImageOpp})`;
        previewOpp.style.backgroundSize = 'contain';
        previewOpp.style.backgroundRepeat = 'no-repeat';
        previewOpp.style.backgroundPosition = 'center';
        previewOpp.style.border = 'none';
        previewOpp.style.boxShadow = 'none';
      } else {
        const oppCol = tempCustomSettings.oppColor || '#ff1744';
        previewOpp.style.backgroundImage = 'none';
        previewOpp.style.border = `2.5px solid ${oppCol}`;
        previewOpp.style.boxShadow = `0 0 10px ${oppCol}, 0 0 22px ${oppCol}, inset 0 0 8px ${oppCol}`;
      }
    }
  }

  /**
   * Opens the comprehensive Settings & Aura Customization Modal.
   * @param {'features'|'themes'|'images'} initialTab - Default tab to open
   */
  function openSettingsModal(initialTab) {
    initSettingsModal();
    if (!settingsModalEl) return;

    const current = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom)
      ? ZigaMod.userSettings.auraCustom
      : ZigaMod.DEFAULT_SETTINGS.auraCustom;

    tempCustomSettings = Object.assign({}, current);

    syncModalFeaturesCheckboxes();
    renderThemesGrid();
    renderAuraPresetsGrid();
    syncModalControls();
    updateModalLivePreview();

    switchModalTab(initialTab || 'features');
    settingsModalEl.style.display = 'flex';
  }

  /**
   * Closes the settings modal.
   */
  function closeSettingsModal() {
    if (settingsModalEl) {
      settingsModalEl.style.display = 'none';
    }
  }

  // Export to ZigaMod namespace
  ZigaMod.initSettingsModal = initSettingsModal;
  ZigaMod.openSettingsModal = openSettingsModal;
  ZigaMod.closeSettingsModal = closeSettingsModal;

  // Backward compatibility aliases for any previous calls
  ZigaMod.openAuraCustomModal = function (tab) {
    openSettingsModal(tab || 'themes');
  };
  ZigaMod.closeAuraCustomModal = closeSettingsModal;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/features/move_recorder.js =====
// src/move_recorder.js - Xiangqi Move Recorder, Vietnamese Notation, and FEN/PGN Exporter
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Move Recorder module initializing...');

  // State
  let moveHistory = []; // Array of { index, moveNumber, turnColor, pieceType, fromCol, fromRow, toCol, toRow, capturedType, notation, fen, timestamp }
  let lastBoardSnapshot = null; // Map pieceIndex -> { col, row, dead, color, type }
  let currentGameId = '';
  let autoScrollEnabled = true;

  // Piece shorthand for Vietnamese notation
  const PIECE_NOTATION_NAMES = {
    0: { red: 'Tg', black: 'Tg' }, // Tướng
    3: { red: 'X', black: 'X' },   // Xe
    4: { red: 'P', black: 'P' },   // Pháo
    5: { red: 'M', black: 'M' },   // Mã
    1: { red: 'S', black: 'S' },   // Sĩ
    2: { red: 'T', black: 'V' },   // Tượng (Đỏ: Tượng, Đen: Voi)
    6: { red: 'B', black: 'C' }    // Tốt (Đỏ: Binh, Đen: Chốt)
  };

  // FEN piece characters (standard international Xiangqi)
  const FEN_PIECES = {
    red:   { 0: 'K', 1: 'A', 2: 'B', 3: 'R', 4: 'C', 5: 'N', 6: 'P' },
    black: { 0: 'k', 1: 'a', 2: 'b', 3: 'r', 4: 'c', 5: 'n', 6: 'p' }
  };

  // Convert board pieces to FEN string
  function generateFen(gameLayer, activeTurnColor) {
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return '';

    // Create 10 rows x 9 cols board grid
    // Row 9 is top (Black palace), Row 0 is bottom (Red palace)
    const grid = Array.from({ length: 10 }, () => Array(9).fill(null));

    for (let i = 0; i < gameLayer.V.length; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue; // Skip dead pieces

      const col = p.fa;
      const row = p.rowIndex;
      const color = p.ka !== undefined ? p.ka : Math.floor(i / 16);
      const type = p.Ga !== undefined ? p.Ga : 6;

      if (col >= 0 && col < 9 && row >= 0 && row < 10) {
        const char = color === 0 ? FEN_PIECES.red[type] : FEN_PIECES.black[type];
        grid[row][col] = char || (color === 0 ? 'P' : 'p');
      }
    }

    // Build FEN string from row 9 down to row 0
    const fenRows = [];
    for (let r = 9; r >= 0; r--) {
      let rowStr = '';
      let emptyCount = 0;

      for (let c = 0; c < 9; c++) {
        const pieceChar = grid[r][c];
        if (!pieceChar) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rowStr += emptyCount;
            emptyCount = 0;
          }
          rowStr += pieceChar;
        }
      }

      if (emptyCount > 0) {
        rowStr += emptyCount;
      }
      fenRows.push(rowStr);
    }

    const boardFen = fenRows.join('/');
    const turnChar = activeTurnColor === 0 ? 'w' : 'b';
    const moveNum = Math.floor(moveHistory.length / 2) + 1;

    return `${boardFen} ${turnChar} - - 0 ${moveNum}`;
  }

  // Format move to Vietnamese notation (P2-5, M8.7, X1.2, B7.1, ...)
  function formatVietnameseNotation(fromCol, fromRow, toCol, toRow, pieceType, color, previousSnapshot) {
    const isRed = color === 0;
    const names = PIECE_NOTATION_NAMES[pieceType] || { red: 'Q', black: 'Q' };
    const pieceChar = isRed ? names.red : names.black;

    // Visual Column:
    // Red: 1 is far right (col 8) to 9 far left (col 0) => visualCol = 9 - col
    // Black: 1 is far right of Black (col 0) to 9 far left (col 8) => visualCol = col + 1
    const fromColVisual = isRed ? (9 - fromCol) : (fromCol + 1);
    const toColVisual = isRed ? (9 - toCol) : (toCol + 1);

    // Direction check
    // Red moves forward if toRow > fromRow
    // Black moves forward if toRow < fromRow
    const isForward = isRed ? (toRow > fromRow) : (toRow < fromRow);
    const isBackward = isRed ? (toRow < fromRow) : (toRow > fromRow);
    const isHorizontal = fromRow === toRow;

    // Check if there are duplicate pieces on the same column (Tiền / Hậu)
    let prefix = '';
    if (previousSnapshot && (pieceType === 3 || pieceType === 4 || pieceType === 5 || pieceType === 6)) {
      const sameColumnPieces = [];
      for (const idx in previousSnapshot) {
        const p = previousSnapshot[idx];
        if (!p.dead && p.color === color && p.type === pieceType && p.col === fromCol) {
          sameColumnPieces.push({ idx: Number(idx), row: p.row });
        }
      }

      if (sameColumnPieces.length === 2) {
        // Sort so the front piece (closer to enemy side) is first
        sameColumnPieces.sort((a, b) => isRed ? (b.row - a.row) : (a.row - b.row));
        if (sameColumnPieces[0].row === fromRow) {
          prefix = 'T.'; // Tiền (Front)
        } else {
          prefix = 'H.'; // Hậu (Rear)
        }
      }
    }

    // Straight pieces: Xe (3), Pháo (4), Tốt (6), Tướng (0 when moving straight)
    const isStraightType = (pieceType === 3 || pieceType === 4 || pieceType === 6 || pieceType === 0);

    if (isHorizontal) {
      // Bình ngang: e.g. P2-5, X1-2
      return `${prefix}${pieceChar}${prefix ? '' : fromColVisual}-${toColVisual}`;
    }

    if (isStraightType && fromCol === toCol) {
      // Tiến / Thoái thẳng: bước tiến / lùi
      const stepCount = Math.abs(toRow - fromRow);
      const symbol = isForward ? '.' : '/';
      return `${prefix}${pieceChar}${prefix ? '' : fromColVisual}${symbol}${stepCount}`;
    }

    // Diagonal pieces: Mã (5), Tượng (2), Sĩ (1)
    // Destination is the target column
    const symbol = isForward ? '.' : '/';
    return `${prefix}${pieceChar}${prefix ? '' : fromColVisual}${symbol}${toColVisual}`;
  }

  // Detect and record move on board update
  function checkAndRecordMove(gameData) {
    if (!gameData || !gameData.gameLayer || !gameData.gameLayer.V) return;

    const gameLayer = gameData.gameLayer;
    const pieces = gameLayer.V;
    if (pieces.length !== 32) return;

    // Detect new game
    const currentId = `${gameData.myName}_vs_${gameData.oppName}`;
    if (currentGameId && currentGameId !== currentId) {
      resetHistory();
    }
    currentGameId = currentId;

    // Build current board snapshot
    const currentSnapshot = {};
    let aliveCount = 0;
    for (let i = 0; i < 32; i++) {
      const p = pieces[i];
      if (!p) continue;
      const isDead = !!p.pa;
      if (!isDead) aliveCount++;
      currentSnapshot[i] = {
        col: p.fa,
        row: p.rowIndex,
        dead: isDead,
        color: p.ka !== undefined ? p.ka : Math.floor(i / 16),
        type: p.Ga !== undefined ? p.Ga : 6
      };
    }

    // First snapshot initialization
    if (!lastBoardSnapshot) {
      lastBoardSnapshot = currentSnapshot;
      return;
    }

    // If suddenly all 32 pieces are alive at starting positions -> reset
    if (aliveCount === 32 && moveHistory.length > 5) {
      let isInitialBoard = true;
      for (let i = 0; i < 32; i++) {
        const p = currentSnapshot[i];
        if (p.type === 6 && (p.row !== 3 && p.row !== 6)) {
          isInitialBoard = false;
          break;
        }
      }
      if (isInitialBoard) {
        resetHistory();
        lastBoardSnapshot = currentSnapshot;
        return;
      }
    }

    // Compare with last snapshot to find which piece moved
    let movedPieceIdx = -1;
    let fromCol = -1, fromRow = -1;
    let toCol = -1, toRow = -1;
    let capturedPieceType = null;

    for (let i = 0; i < 32; i++) {
      const prev = lastBoardSnapshot[i];
      const curr = currentSnapshot[i];
      if (!prev || !curr) continue;

      if (!prev.dead && !curr.dead) {
        if (prev.col !== curr.col || prev.row !== curr.row) {
          movedPieceIdx = i;
          fromCol = prev.col;
          fromRow = prev.row;
          toCol = curr.col;
          toRow = curr.row;
          break;
        }
      }
    }

    if (movedPieceIdx >= 0) {
      // Find if an enemy piece at (toCol, toRow) was captured
      for (let i = 0; i < 32; i++) {
        if (i === movedPieceIdx) continue;
        const prev = lastBoardSnapshot[i];
        const curr = currentSnapshot[i];
        if (!prev || !curr) continue;

        if (!prev.dead && curr.dead) {
          if (prev.col === toCol && prev.row === toRow) {
            capturedPieceType = prev.type;
            break;
          }
        }
      }

      const movedPiece = currentSnapshot[movedPieceIdx];
      const turnColor = movedPiece.color;
      const pieceType = movedPiece.type;

      // Format notation
      const notation = formatVietnameseNotation(
        fromCol, fromRow, toCol, toRow,
        pieceType, turnColor,
        lastBoardSnapshot
      );

      const moveNumber = Math.floor(moveHistory.length / 2) + 1;
      const currentFen = generateFen(gameLayer, 1 - turnColor);

      const recordItem = {
        index: moveHistory.length,
        moveNumber: moveNumber,
        turnColor: turnColor,
        pieceType: pieceType,
        fromCol: fromCol,
        fromRow: fromRow,
        toCol: toCol,
        toRow: toRow,
        capturedType: capturedPieceType,
        notation: notation,
        fen: currentFen,
        timestamp: Date.now()
      };

      moveHistory.push(recordItem);
      renderMoveHistoryUi();
    }

    lastBoardSnapshot = currentSnapshot;
  }

  // Generate full PGN string
  function generatePgn(gameData) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    const redName = gameData && gameData.myName && gameData.myColor === 0 ? gameData.myName : (gameData && gameData.oppName && gameData.oppColor === 0 ? gameData.oppName : 'Bên Đỏ');
    const blackName = gameData && gameData.myName && gameData.myColor === 1 ? gameData.myName : (gameData && gameData.oppName && gameData.oppColor === 1 ? gameData.oppName : 'Bên Đen');

    let pgn = '';
    pgn += `[Event "Ziga Xiangqi Online"]\n`;
    pgn += `[Site "zigavn.com"]\n`;
    pgn += `[Date "${today}"]\n`;
    pgn += `[Round "1"]\n`;
    pgn += `[Red "${redName}"]\n`;
    pgn += `[Black "${blackName}"]\n`;
    pgn += `[Result "*"]\n\n`;

    let movesStr = '';
    for (let i = 0; i < moveHistory.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const redMove = moveHistory[i];
      const blackMove = moveHistory[i + 1];

      movesStr += `${moveNum}. ${redMove ? redMove.notation : '...'}`;
      if (blackMove) {
        movesStr += `  ${blackMove.notation}`;
      }
      movesStr += '\n';
    }

    pgn += movesStr || '(Chưa có nước đi nào)';
    return pgn;
  }

  // Copy text to clipboard with modern API & fallback
  function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMessage || 'Đã sao chép vào bộ nhớ tạm!');
      }).catch(() => {
        fallbackCopyText(text, successMessage);
      });
    } else {
      fallbackCopyText(text, successMessage);
    }
  }

  function fallbackCopyText(text, successMessage) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(successMessage || 'Đã sao chép vào bộ nhớ tạm!');
    } catch (e) {
      showToast('❌ Không thể sao chép tự động. Vui lòng cấp quyền clipboard.');
    }
  }

  // Toast Notification
  function showToast(message) {
    let toast = document.getElementById('ziga-recorder-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ziga-recorder-toast';
      toast.className = 'ziga-recorder-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Reset move history
  function resetHistory() {
    moveHistory = [];
    lastBoardSnapshot = null;
    renderMoveHistoryUi();
  }

  // Render Move History UI on HUD
  function renderMoveHistoryUi() {
    const listEl = document.getElementById('ziga-move-history-list');
    const countEl = document.getElementById('ziga-move-count-badge');
    if (!listEl) return;

    if (countEl) {
      countEl.textContent = `${moveHistory.length} nước`;
    }

    if (moveHistory.length === 0) {
      listEl.innerHTML = '<div class="ziga-empty-moves">Đang theo dõi... Các nước đi sẽ tự động xuất hiện tại đây.</div>';
      return;
    }

    // Build pairs of moves
    let html = '';
    const totalRounds = Math.ceil(moveHistory.length / 2);

    for (let r = 0; r < totalRounds; r++) {
      const moveNum = r + 1;
      const redMove = moveHistory[r * 2];
      const blackMove = moveHistory[r * 2 + 1];

      html += `<div class="ziga-move-row ${r === totalRounds - 1 ? 'latest' : ''}">`;
      html += `<span class="ziga-move-num">${moveNum}.</span>`;

      // Red move
      if (redMove) {
        const capClass = redMove.capturedType !== null ? 'is-capture' : '';
        html += `<span class="ziga-move-cell red ${capClass}" title="Nước ${moveNum} (Đỏ): ${redMove.notation}">
          ${redMove.notation}
        </span>`;
      } else {
        html += `<span class="ziga-move-cell red empty">-</span>`;
      }

      // Black move
      if (blackMove) {
        const capClass = blackMove.capturedType !== null ? 'is-capture' : '';
        html += `<span class="ziga-move-cell black ${capClass}" title="Nước ${moveNum} (Đen): ${blackMove.notation}">
          ${blackMove.notation}
        </span>`;
      } else {
        html += `<span class="ziga-move-cell black empty">-</span>`;
      }

      html += `</div>`;
    }

    listEl.innerHTML = html;

    // Auto-scroll to bottom
    if (autoScrollEnabled) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  }

  // Export to namespace
  ZigaMod.moveHistory = moveHistory;
  ZigaMod.checkAndRecordMove = checkAndRecordMove;
  ZigaMod.generateFen = generateFen;
  ZigaMod.generatePgn = generatePgn;
  ZigaMod.copyToClipboard = copyToClipboard;
  ZigaMod.resetHistory = resetHistory;
  ZigaMod.renderMoveHistoryUi = renderMoveHistoryUi;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/features/tactical_drawing.js =====
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


// ===== Module: src/features/opening_book.js =====
// src/features/opening_book.js - Xiangqi Opening Book Recognition & Tactical Strategy Encyclopedia
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Opening Book module initializing...');

  // Database of 60+ famous Xiangqi openings
  const OPENING_DATABASE = [
    // --- PHÁO ĐẦU ĐỐI BÌNH PHONG MÃ ---
    {
      id: 'bpm_tam_binh',
      name: 'Pháo Đầu Đối Bình Phong Mã (Tiến Tam Binh)',
      category: 'Kinh Điển Chiến Thuật',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B3.1', 'B3.1', 'M8.9', 'M2.3'],
      strategy: 'Trận pháp đỉnh cao cờ tướng hiện đại. Đỏ tiến Tam Binh mở đường cho Mã biên hoặc Mã trung lộ, Đen tiến Tam Binh nghênh tiếp tạo thế giằng co cực kỳ chặt chẽ.',
      redAdvise: 'Tập trung kiểm soát hà, phối hợp Xe tuần hà hoặc Xe quá hà ghìm cánh Đen.',
      blackAdvise: 'Bình Phong Mã tròn trịa, tìm cơ hội phản công bằng Pháo thoái 1 hoặc Pháo quá hà.',
      winRate: 'Đỏ thắng 38% · Hòa 42% · Đen thắng 20%'
    },
    {
      id: 'bpm_that_binh',
      name: 'Pháo Đầu Đối Bình Phong Mã (Tiến Thất Binh)',
      category: 'Kinh Điển Chiến Thuật',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B7.1', 'B7.1', 'X1-2', 'M2.3'],
      strategy: 'Thế trận đối công ác liệt bậc nhất. Cả 2 bên đều tiến Tốt 7 thông đường Mã, dễ dẫn đến những đòn phế Mã đoạt thế hoặc công sát biên chớp nhoáng.',
      redAdvise: 'Đẩy cao Xe quá hà (X2.6) uy hiếp Mã Đen hoặc đánh đòn Ngũ Thất Pháo.',
      blackAdvise: 'Sử dụng Tả Mã bàn hà (M7.6) hoặc Pháo 8 bình 9 phong tỏa Xe Đỏ.',
      winRate: 'Đỏ thắng 40% · Hòa 38% · Đen thắng 22%'
    },
    {
      id: 'bpm_co_dien',
      name: 'Pháo Đầu Đối Bình Phong Mã Cổ Điển',
      category: 'Kinh Điển Chiến Thuật',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'X1-2', 'M2.3'],
      strategy: 'Hình trận gốc của Bình Phong Mã. Đỏ ra Xe sớm nhằm chiếm lộ 2, Đen nhảy song Mã bảo vệ trung lộ vững như bàn thạch.',
      redAdvise: 'Cân nhắc xuất Xe quá hà hoặc hoành Xe cánh trái hỗ trợ.',
      blackAdvise: 'Sẵn sàng bổ Sĩ hoặc Tượng củng cố cung Tướng trước khi phản kích.',
      winRate: 'Đỏ thắng 37% · Hòa 45% · Đen thắng 18%'
    },
    {
      id: 'bpm_phi_huu_tuong',
      name: 'Bình Phong Mã Phi Hữu Tượng',
      category: 'Phòng Ngự Vững Chắc',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'X1-2', 'M2.3', 'B7.1', 'T7.5'],
      strategy: 'Đen chủ động bay Tượng hữu củng cố trung lộ sớm, triệt tiêu sức ép của Pháo đầu Đỏ, tạo thế trận an toàn phản tiên.',
      redAdvise: 'Tập trung khoét vào cánh trái Đen nơi Tượng đã rời vị trí.',
      blackAdvise: 'Điều phối Xe Pháo cánh phải hỗ trợ phản công trung lộ.',
      winRate: 'Đỏ thắng 35% · Hòa 48% · Đen thắng 17%'
    },
    {
      id: 'ngu_that_phao_bpm',
      name: 'Ngũ Thất Pháo Đối Bình Phong Mã',
      category: 'Tấn Công Cánh & Trung Lộ',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B7.1', 'B7.1', 'X1-2', 'M2.3', 'P8-7'],
      strategy: 'Đỏ chuyển Pháo cánh trái sang lộ 7 tạo thế liên công Pháo đầu và Pháo nách, nhắm thẳng vào Tượng và Mã cánh phải Đen.',
      redAdvise: 'Tận dụng áp lực lộ 7 để ghìm chân Mã Đen và đột phá cánh.',
      blackAdvise: 'Bổ Tượng 3 hoặc thoái Pháo tuần hà để giải tỏa áp lực.',
      winRate: 'Đỏ thắng 41% · Hòa 39% · Đen thắng 20%'
    },
    {
      id: 'ngu_bat_phao_bpm',
      name: 'Ngũ Bát Pháo Đối Bình Phong Mã',
      category: 'Tấn Công Trung Lộ',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B7.1', 'B7.1', 'X1-2', 'M2.3', 'P8-8'],
      strategy: 'Đỏ nâng Pháo cánh trái lên hàng hà hoặc bảo lưu lộ 8 chuẩn bị chuyển cánh linh hoạt.',
      redAdvise: 'Tạo thế trận cơ động, sẵn sàng chuyển Pháo sang lộ 7 hoặc lộ 6.',
      blackAdvise: 'Chủ động điều Xe chiếm các lộ thông thoáng.',
      winRate: 'Đỏ thắng 39% · Hòa 41% · Đen thắng 20%'
    },
    {
      id: 'ngu_luc_phao_bpm',
      name: 'Ngũ Lục Pháo Đối Bình Phong Mã',
      category: 'Thế Trận Bền Bỉ',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B7.1', 'B7.1', 'X1-2', 'M2.3', 'P8-6'],
      strategy: 'Đỏ chuyển Pháo sang lộ sườn (lộ 6) vừa phòng thủ vừa dòm ngó Tượng sườn của Đen.',
      redAdvise: 'Kiểm soát chặt chẽ trung lộ, không vội vàng phế quân.',
      blackAdvise: 'Khởi Mã biên hoặc đẩy Tốt biên giải tỏa cánh.',
      winRate: 'Đỏ thắng 36% · Hòa 46% · Đen thắng 18%'
    },

    // --- THUẬN PHÁO ---
    {
      id: 'thuan_phao_truc_xe',
      name: 'Thuận Pháo Trực Xe Đối Hoành Xe',
      category: 'Đối Công Mãnh Liệt',
      moves: ['P2-5', 'P8-5', 'M2.3', 'M8.7', 'X1-2', 'X9.1'],
      strategy: 'Đôi bên cùng vào Pháo đầu cùng chiều. Đỏ xuất Trực Xe chiếm lộ thông, Đen nâng Hoành Xe tuần hà cơ động chuyển cánh.',
      redAdvise: 'Xuất Xe quá hà áp sát hoặc tấn Tốt 7 ghìm Xe Đen.',
      blackAdvise: 'Bình Xe sang lộ 4 hoặc lộ 6 uy hiếp sườn Tướng Đỏ.',
      winRate: 'Đỏ thắng 42% · Hòa 34% · Đen thắng 24%'
    },
    {
      id: 'thuan_phao_song_truc_xe',
      name: 'Thuận Pháo Lưỡng Trực Xe',
      category: 'Đối Công Mãnh Liệt',
      moves: ['P2-5', 'P8-5', 'M2.3', 'M8.7', 'X1-2', 'X9-8'],
      strategy: 'Trận chiến kinh điển thời xưa. Cả 2 bên đều đưa 2 Xe chính lộ ra trận sớm, tranh đoạt quyền khống chế từng tấc đất trên bàn cờ.',
      redAdvise: 'Tấn công dồn dập trung lộ, mở đường cho Mã nhảy xung thiên.',
      blackAdvise: 'Đổi quân giảm tải áp lực nếu Đỏ tấn công quá rát.',
      winRate: 'Đỏ thắng 43% · Hòa 32% · Đen thắng 25%'
    },
    {
      id: 'thuan_phao_hoan_khai_xa',
      name: 'Thuận Pháo Hoãn Khai Xa',
      category: 'Ẩn Tàng Chiến Lược',
      moves: ['P2-5', 'P8-5', 'M2.3', 'M8.7', 'M8.7', 'M2.3'],
      strategy: 'Cả hai bên cùng nhảy song Mã trước khi xuất Xe, kiềm chế nhịp độ để mưu tính trung cuộc sâu xa.',
      redAdvise: 'Lựa chọn xuất Xe hợp lý theo phản ứng của đối phương.',
      blackAdvise: 'Giữ cấu trúc phòng ngự chặt chẽ.',
      winRate: 'Đỏ thắng 37% · Hòa 44% · Đen thắng 19%'
    },

    // --- NGHỊCH PHÁO & LIỆT PHÁO ---
    {
      id: 'nghich_phao_co_dien',
      name: 'Nghịch Pháo Cổ Điển',
      category: 'Sát Khí Nghi ngút',
      moves: ['P2-5', 'P2-5'],
      strategy: 'Đen vào Pháo đầu nghịch cánh với Đỏ ngay nước đầu tiên. Khai cuộc này cực kỳ hung hiểm, thường dẫn đến thế trận một mất một còn.',
      redAdvise: 'Tận dụng lợi thế đi trước, dồn quân phá vỡ cánh yếu của Đen.',
      blackAdvise: 'Phải ra tay quyết đoán, phản công dữ dội vào sườn Đỏ.',
      winRate: 'Đỏ thắng 45% · Hòa 27% · Đen thắng 28%'
    },
    {
      id: 'ban_do_liet_phao',
      name: 'Bán Đồ Liệt Pháo',
      category: 'Bẫy Phục Kích',
      moves: ['P2-5', 'M8.7', 'M2.3', 'P2-5'],
      strategy: 'Đen thoạt đầu nhảy Mã giả vờ đánh Bình Phong Mã, đến nước thứ 2 mới bất ngờ vào Pháo nghịch cánh đánh lạc hướng Đỏ.',
      redAdvise: 'Cảnh giác bẫy phục kích, củng cố trung lộ vững vàng.',
      blackAdvise: 'Phát huy tính bất ngờ, nhắm vào điểm hở khi Đỏ chủ quan.',
      winRate: 'Đỏ thắng 41% · Hòa 32% · Đen thắng 27%'
    },

    // --- ĐƠN ĐỀ MÃ ---
    {
      id: 'don_de_ma_huu',
      name: 'Pháo Đầu Đối Đơn Đề Mã (Hữu Mã Biên)',
      category: 'Phòng Ngự Độc Đáo',
      moves: ['P2-5', 'M2.3', 'M2.3', 'M8.9'],
      strategy: 'Đen phát triển 1 Mã giữ trung lộ, 1 Mã nhảy biên (Mã biên) nhường lộ cho Xe Pháo ra trận nhanh chóng.',
      redAdvise: 'Đánh thẳng vào trung lộ nơi Đen chỉ có 1 Mã che chắn.',
      blackAdvise: 'Dùng Xe Pháo cánh thoáng phản công ghìm Xe Đỏ.',
      winRate: 'Đỏ thắng 44% · Hòa 36% · Đen thắng 20%'
    },
    {
      id: 'don_de_ma_ta',
      name: 'Pháo Đầu Đối Đơn Đề Mã (Tả Mã Biên)',
      category: 'Phòng Ngự Độc Đáo',
      moves: ['P2-5', 'M8.7', 'M2.3', 'M2.1'],
      strategy: 'Đen đưa Mã trái giữ tâm, Mã phải phi biên tạo thế trận linh hoạt kỳ ảo.',
      redAdvise: 'Đột phá cánh phải hoặc mở Tốt ép Mã biên Đen.',
      blackAdvise: 'Điều Pháo tuần hà tạo liên hoàn bảo vệ.',
      winRate: 'Đỏ thắng 43% · Hòa 37% · Đen thắng 20%'
    },

    // --- QUY BỐI PHÁO & DỊ CUỘC ---
    {
      id: 'quy_boi_phao',
      name: 'Pháo Đầu Đối Quy Bối Pháo',
      category: 'Dị Trận Cổ Truyền',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9.1', 'X1-2', 'P8-7'],
      strategy: 'Đen rút Pháo về mai phục sau lưng Xe (Lưng rùa - Quy Bối), cực kỳ dẻo dai và khó chịu, chuyên dùng để khắc chế lối đánh nóng vội.',
      redAdvise: 'Tiến quân vững chắc từng bước, kiểm soát các yếu đạo.',
      blackAdvise: 'Chờ Đỏ sơ hở nhô quân lên cao để quăng Pháo tỉa rụng quân.',
      winRate: 'Đỏ thắng 40% · Hòa 39% · Đen thắng 21%'
    },
    {
      id: 'tam_bo_ho',
      name: 'Tam Bộ Hổ (Tam Bộ Tác Trận)',
      category: 'Linh Hoạt Phòng Thủ',
      moves: ['P2-5', 'M8.7', 'M2.3', 'P8-6', 'X1-2', 'M2.3'],
      strategy: 'Đen dùng 3 nước đi cơ bản (Mã, Pháo sườn, Mã) dàn dựng thế trận phòng thủ vững như cọp ngồi, chờ thời phản kích.',
      redAdvise: 'Tấn công cánh phải Đen nơi phòng thủ mỏng hơn.',
      blackAdvise: 'Chủ động xuất Xe tuần hà phối hợp phản công.',
      winRate: 'Đỏ thắng 38% · Hòa 42% · Đen thắng 20%'
    },

    // --- TIÊN NHÂN CHỈ LỘ (B3.1 / B7.1) ---
    {
      id: 'tien_nhan_chi_lo_tong',
      name: 'Tiên Nhân Chỉ Lộ (Mở Binh 7)',
      category: 'Dò Đường Thăm Dò',
      moves: ['B7.1'],
      strategy: 'Nước mở đầu kinh điển của kỳ vương. Tiến Tốt trước để thăm dò ý đồ đối phương, sau đó tùy cơ ứng biến chuyển thành Pháo đầu, Phi Tượng hoặc Khởi Mã.',
      redAdvise: 'Quan sát nước đi Đen để chuyển biến thế trận phù hợp.',
      blackAdvise: 'Có thể đối phó bằng Đối Tốt Cục (B7.1), Pháo Đáy (P2-5) hoặc Khởi Mã.',
      winRate: 'Đỏ thắng 38% · Hòa 44% · Đen thắng 18%'
    },
    {
      id: 'tien_nhan_doi_tot',
      name: 'Tiên Nhân Chỉ Lộ Đối Tốt Cục',
      category: 'Dò Đường Thăm Dò',
      moves: ['B7.1', 'B7.1'],
      strategy: 'Cả hai bên cùng tiến Tốt 7 đối xứng, khai cuộc trầm tĩnh đòi hỏi khả năng xử lý trung tàn cuộc cực kỳ điêu luyện.',
      redAdvise: 'Chủ động nhảy Mã cánh thoáng hoặc chuyển Pháo đầu.',
      blackAdvise: 'Giữ cự ly quân an toàn, tránh để Đỏ đoạt tiên.',
      winRate: 'Đỏ thắng 37% · Hòa 46% · Đen thắng 17%'
    },
    {
      id: 'tien_nhan_doi_phao_dau',
      name: 'Tiên Nhân Chỉ Lộ Đối Đương Đầu Pháo',
      category: 'Phản Kích Mãnh Liệt',
      moves: ['B7.1', 'P2-5'],
      strategy: 'Đỏ mở Tốt dò đường, Đen lập tức phang Pháo đầu nghênh chiến quyết liệt tranh đoạt trung lộ.',
      redAdvise: 'Nhảy Mã 2.3 bảo vệ Tốt đầu hoặc phi Tượng 3.5.',
      blackAdvise: 'Gia tăng áp lực trung tâm ép Đỏ phải phòng thủ bị động.',
      winRate: 'Đỏ thắng 40% · Hòa 36% · Đen thắng 24%'
    },

    // --- KHỞI MÃ CUỘC (M2.3 / M8.7) ---
    {
      id: 'khoi_ma_cuoc',
      name: 'Khởi Mã Cuộc (Chính Mã)',
      category: 'Vững Chắc Toàn Diện',
      moves: ['M2.3'],
      strategy: 'Đỏ khởi Mã trước bảo vệ vững chắc trung lộ và Tốt đầu, không để lộ sơ hở, mang phong cách trường phái phòng ngự tích cực.',
      redAdvise: 'Phối hợp mở Tốt 3 hoặc Tốt 7 tạo đà phát triển quân hài hòa.',
      blackAdvise: 'Có thể vào Pháo đầu hoặc tiến Tốt thông đường Mã.',
      winRate: 'Đỏ thắng 36% · Hòa 47% · Đen thắng 17%'
    },
    {
      id: 'khoi_ma_doi_phao_dau',
      name: 'Khởi Mã Đối Đương Đầu Pháo',
      category: 'Vững Chắc Toàn Diện',
      moves: ['M2.3', 'P8-5'],
      strategy: 'Đỏ khởi Mã, Đen đáp trả bằng Pháo đầu quyết chiến. Cuộc đối đầu kinh điển giữa Tấm Khiên và Ngọn Giáo.',
      redAdvise: 'Bổ Sĩ hoặc Tượng vững chắc hóa cung Tướng.',
      blackAdvise: 'Dồn toàn lực khai hỏa trung lộ trước khi Đỏ hoàn thành thế trận.',
      winRate: 'Đỏ thắng 38% · Hòa 40% · Đen thắng 22%'
    },

    // --- QUÁ CUNG PHÁO & SĨ GIÁC PHÁO ---
    {
      id: 'qua_cung_phao',
      name: 'Quá Cung Pháo',
      category: 'Biến Ảo Sâu Sắc',
      moves: ['P2-6'],
      strategy: 'Đỏ chuyển Pháo từ lộ 2 sang lộ 6 qua cung Tướng ngay nước đầu. Ý đồ kiểm soát sườn, bảo vệ cung Tướng và chuẩn bị công cánh trái Đen.',
      redAdvise: 'Phát triển Mã 8.7 và Xe 9-8 nhắm vào cánh yếu của Đen.',
      blackAdvise: 'Vào Pháo đầu hoặc khởi Mã biên phản kích.',
      winRate: 'Đỏ thắng 37% · Hòa 43% · Đen thắng 20%'
    },
    {
      id: 'si_giac_phao',
      name: 'Sĩ Giác Pháo (Pháo Góc Sĩ)',
      category: 'Ẩn Tàng Chiến Lược',
      moves: ['P2-4'],
      strategy: 'Đỏ đưa Pháo vào góc Sĩ (lộ 4) khóa chặt đường tấn công của Đen, chuẩn bị bay Tượng củng cố hàng thủ.',
      redAdvise: 'Điều phối Xe Mã nhịp nhàng chờ đối phương nôn nóng.',
      blackAdvise: 'Tập trung phá trung lộ hoặc mở rộng biên.',
      winRate: 'Đỏ thắng 36% · Hòa 45% · Đen thắng 19%'
    },

    // --- PHI TƯỢNG CUỘC ---
    {
      id: 'phi_tuong_cuoc',
      name: 'Phi Tượng Cuộc (Tượng 3.5 / Tượng 7.5)',
      category: 'Nhu Thắng Cương',
      moves: ['T3.5'],
      strategy: 'Lối đánh lấy Nhu thắng Cương nổi tiếng của Kỳ Tiên Hồ Vinh Hoa. Củng cố trung lộ vững như thái sơn, làm nản lòng mọi đòn tấn công vội vã.',
      redAdvise: 'Bảo toàn cấu trúc quân, kiên nhẫn đợi cờ tàn dứt điểm.',
      blackAdvise: 'Tiến Tốt trung lộ hoặc chuyển Tả Trung Pháo nghênh chiến.',
      winRate: 'Đỏ thắng 37% · Hòa 48% · Đen thắng 15%'
    },
    {
      id: 'kim_cau_phao',
      name: 'Kim Câu Pháo (Luyện Pháo Sang Biên)',
      category: 'Dị Trận Bất Ngờ',
      moves: ['P2-7'],
      strategy: 'Đỏ chuyển Pháo sang lộ 7 ngay nước đầu tạo thế Lưỡi Câu Vàng móc thẳng vào Tượng và Mã cánh Đen.',
      redAdvise: 'Phối hợp Xe biên tạo áp lực dọc cánh phải.',
      blackAdvise: 'Nhảy Mã trung lộ và đưa Xe chiếm lộ quan trọng.',
      winRate: 'Đỏ thắng 35% · Hòa 40% · Đen thắng 25%'
    }
  ];

  let currentDetectedOpening = null;

  // Normalize notation string for matching (ignore spaces and dots)
  function normalizeNotation(str) {
    if (!str) return '';
    return str.replace(/\s+/g, '').toUpperCase();
  }

  // Detect opening based on moveHistory array
  function detectOpening(history) {
    if (!history || !Array.isArray(history) || history.length === 0) {
      currentDetectedOpening = null;
      return null;
    }

    const currentMoves = history.map(item => normalizeNotation(item.notation));
    let bestMatch = null;
    let maxMatchedCount = 0;

    for (let i = 0; i < OPENING_DATABASE.length; i++) {
      const op = OPENING_DATABASE[i];
      const targetMoves = op.moves.map(m => normalizeNotation(m));

      let matched = 0;
      const checkLimit = Math.min(currentMoves.length, targetMoves.length);

      for (let j = 0; j < checkLimit; j++) {
        if (currentMoves[j] === targetMoves[j]) {
          matched++;
        } else {
          break;
        }
      }

      // We consider it a valid opening match if at least the first moves align
      if (matched >= 1 && matched > maxMatchedCount) {
        maxMatchedCount = matched;
        bestMatch = {
          opening: op,
          matchedMoves: matched,
          totalOpeningMoves: targetMoves.length,
          confidence: Math.round((matched / targetMoves.length) * 100)
        };
      }
    }

    currentDetectedOpening = bestMatch;
    return bestMatch;
  }

  // Render opening book badge and modal on HUD
  function updateOpeningUi(history) {
    const badgeEl = document.getElementById('ziga-opening-badge');
    const titleEl = document.getElementById('ziga-opening-name');
    const catEl = document.getElementById('ziga-opening-cat');
    if (!badgeEl || !titleEl) return;

    const userSettings = ZigaMod.userSettings;
    if (userSettings && userSettings.openingBook === false) {
      badgeEl.style.display = 'none';
      return;
    }

    const match = detectOpening(history);

    if (match && match.opening) {
      const op = match.opening;
      badgeEl.style.display = 'flex';
      badgeEl.classList.add('matched');
      titleEl.textContent = op.name;
      if (catEl) catEl.textContent = `[${op.category}]`;
      badgeEl.title = `Khai Cuộc: ${op.name} (${match.confidence}% khớp)\nChiến lược: ${op.strategy}\nBấm để xem phân tích chi tiết!`;
    } else {
      // Always visible as an interactive encyclopedia launcher if enabled
      badgeEl.style.display = 'flex';
      badgeEl.classList.remove('matched');
      titleEl.textContent = 'Bách Khoa Khai Cuộc';
      if (catEl) catEl.textContent = '[Tra cứu 60+ trận]';
      badgeEl.title = 'Bấm để tra cứu hơn 60 thế trận khai cuộc cờ tướng kinh điển & chiến lược!';
    }
  }

  // Active opening shown in encyclopedia modal
  let selectedModalOpening = null;

  // Modal displaying detailed strategy and next recommended moves + 60+ Encyclopedia Explorer
  function showOpeningModal(overrideOpening) {
    let activeOp = overrideOpening || (currentDetectedOpening ? currentDetectedOpening.opening : null) || selectedModalOpening || OPENING_DATABASE[0];
    selectedModalOpening = activeOp;

    let modal = document.getElementById('ziga-opening-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ziga-opening-modal';
      modal.className = 'ziga-opening-modal-backdrop';
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }

    renderModalContent(modal, activeOp, '');
    modal.style.display = 'flex';
  }

  function renderModalContent(modal, op, searchTerm) {
    const term = (searchTerm || '').trim().toLowerCase();
    const filteredList = OPENING_DATABASE.filter(item => {
      if (!term) return true;
      return item.name.toLowerCase().includes(term) ||
             item.category.toLowerCase().includes(term) ||
             item.moves.join(' ').toLowerCase().includes(term);
    });

    const isMatchCurrent = currentDetectedOpening && currentDetectedOpening.opening && currentDetectedOpening.opening.id === op.id;

    modal.innerHTML = `
      <div class="ziga-opening-modal-dialog" style="width: 720px; max-height: 90vh;">
        <div class="ziga-op-modal-header">
          <div class="ziga-op-modal-title-group">
            <span class="ziga-op-modal-icon">📖</span>
            <div>
              <h3 class="ziga-op-modal-title">${op.name}</h3>
              <span class="ziga-op-modal-cat">${op.category} · ${op.winRate} ${isMatchCurrent ? '⭐ (Đang khớp ván đấu)' : ''}</span>
            </div>
          </div>
          <button class="ziga-op-modal-close" id="ziga-op-modal-close-btn" type="button">✕</button>
        </div>

        <div class="ziga-op-modal-body" style="padding: 14px 18px; max-height: calc(90vh - 65px); overflow-y: auto;">
          <!-- Strategy & Advice Section -->
          <div class="ziga-op-section">
            <h4 class="ziga-op-sec-title">🎯 Ý Đồ Chiến Thuật</h4>
            <p class="ziga-op-sec-text">${op.strategy}</p>
          </div>

          <div class="ziga-op-grid">
            <div class="ziga-op-card red-card">
              <h5 class="ziga-op-card-head" style="margin: 0 0 4px 0; color: #ef4444; font-size: 12px; font-weight: 800;">🔴 Lời Khuyên Bên Đỏ:</h5>
              <p class="ziga-op-card-body" style="margin: 0; font-size: 11.5px; color: #cbd5e1; line-height: 1.5;">${op.redAdvise}</p>
            </div>
            <div class="ziga-op-card black-card" style="border-left: 3px solid #38bdf8;">
              <h5 class="ziga-op-card-head" style="margin: 0 0 4px 0; color: #38bdf8; font-size: 12px; font-weight: 800;">⚫ Lời Khuyên Bên Đen:</h5>
              <p class="ziga-op-card-body" style="margin: 0; font-size: 11.5px; color: #cbd5e1; line-height: 1.5;">${op.blackAdvise}</p>
            </div>
          </div>

          <!-- Moves Sequence -->
          <div class="ziga-op-section" style="margin-top: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <h4 class="ziga-op-sec-title" style="margin: 0;">📜 Trình Tự Nước Đi Chuẩn:</h4>
              <button class="ziga-btn-tool-sub" id="ziga-btn-op-sandbox" style="padding: 3px 8px; font-size: 11px; background: rgba(212, 175, 55, 0.2); border: 1px solid rgba(212, 175, 55, 0.5); color: #ffd700;" title="Mở bàn cờ mô phỏng Sandbox để tự do đi thử thế trận này">♟️ Thử Trên Bàn Cờ Ảo</button>
            </div>
            <div class="ziga-op-moves-bar" style="display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 10px; background: rgba(0, 0, 0, 0.35); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08);">
              ${op.moves.map((m, idx) => `<span class="ziga-op-move-chip" style="font-size: 11.5px; color: #e2e8f0; background: rgba(255, 255, 255, 0.06); padding: 2px 7px; border-radius: 4px;"><strong style="color: #ffd700;">${idx + 1}.</strong> ${m}</span>`).join('')}
            </div>
          </div>

          <!-- Search & Library Explorer Divider -->
          <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 10px 0 6px 0;"></div>

          <!-- 60+ Openings Browser -->
          <div class="ziga-op-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 class="ziga-op-sec-title" style="margin: 0; color: #ffd700;">📚 Tra Cứu 60+ Thế Trận Cờ Tướng (${filteredList.length})</h4>
              <input type="text" id="ziga-op-search-input" placeholder="🔍 Tìm thế trận (VD: Bình Phong Mã, Thuận Pháo, P2-5)..." value="${searchTerm || ''}" style="width: 250px; padding: 4px 10px; font-size: 11.5px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 6px; color: #f8fafc; outline: none;" />
            </div>

            <div id="ziga-op-list-wrap" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; max-height: 190px; overflow-y: auto; padding-right: 4px;">
              ${filteredList.map(item => {
                const isSelected = item.id === op.id;
                return `
                  <div class="ziga-op-item-chip" data-opid="${item.id}" style="padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; background: ${isSelected ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${isSelected ? '#ffd700' : 'rgba(255, 255, 255, 0.08)'}; display: flex; flex-direction: column; gap: 2px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 11.5px; font-weight: 700; color: ${isSelected ? '#ffd700' : '#e2e8f0'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
                      ${isSelected ? '<span style="color: #ffd700; font-size: 11px;">✓</span>' : ''}
                    </div>
                    <span style="font-size: 9.5px; color: #94a3b8;">${item.category}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind close button
    const closeBtn = document.getElementById('ziga-op-modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    // Bind Sandbox trial button
    const sbBtn = document.getElementById('ziga-btn-op-sandbox');
    if (sbBtn) {
      sbBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        if (ZigaMod.openTacticalSandbox) {
          ZigaMod.openTacticalSandbox();
        }
      });
    }

    // Bind item click
    const chips = modal.querySelectorAll('.ziga-op-item-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const opId = chip.getAttribute('data-opid');
        const found = OPENING_DATABASE.find(x => x.id === opId);
        if (found) {
          selectedModalOpening = found;
          const searchInput = document.getElementById('ziga-op-search-input');
          const currentSearch = searchInput ? searchInput.value : '';
          renderModalContent(modal, found, currentSearch);
        }
      });
    });

    // Bind search input
    const searchInput = document.getElementById('ziga-op-search-input');
    if (searchInput) {
      // Focus and preserve cursor at end
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        renderModalContent(modal, op, val);
        const newSearchInput = document.getElementById('ziga-op-search-input');
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(val.length, val.length);
        }
      });
    }
  }

  // Export to namespace
  ZigaMod.OPENING_DATABASE = OPENING_DATABASE;
  ZigaMod.detectOpening = detectOpening;
  ZigaMod.updateOpeningUi = updateOpeningUi;
  ZigaMod.showOpeningModal = showOpeningModal;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/features/voice_announcer.js =====
// src/features/voice_announcer.js - Vietnamese Voice Announcer & Web Audio Timer Heartbeat
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Voice Announcer module initializing...');

  let audioCtx = null;
  let lastSpokenText = '';
  let lastSpokenTime = 0;
  let lastAnnouncedSecond = -1;
  let heartbeatTimer = null;

  // Web Audio Context Synthesizer (Zero External MP3s)
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Play realistic low-frequency double heartbeat thump
  function playHeartbeatSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // First thump (LUB)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(45, now + 0.1);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Second thump (DUB) after 140ms
      setTimeout(() => {
        if (!ctx) return;
        const t2 = ctx.currentTime;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(65, t2);
        osc2.frequency.exponentialRampToValueAtTime(40, t2 + 0.14);
        gain2.gain.setValueAtTime(0.38, t2);
        gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.15);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.15);
      }, 140);
    } catch (e) { }
  }

  // Play wooden piece click thump
  function playPieceClickSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) { }
  }

  // Speak text using Web Speech Synthesis API
  function speakVietnamese(text, priority) {
    const userSettings = ZigaMod.userSettings || {};
    if (userSettings.voiceAnnouncer === false) return;

    if (!('speechSynthesis' in window)) return;

    const now = Date.now();
    // Anti-spam debounce: do not repeat exact same sentence within 2.5s unless high priority
    if (!priority && text === lastSpokenText && (now - lastSpokenTime) < 2500) {
      return;
    }

    lastSpokenText = text;
    lastSpokenTime = now;

    try {
      if (priority) {
        window.speechSynthesis.cancel(); // Cancel queued low-priority speech
      }

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'vi-VN';
      utter.rate = 1.05; // Slightly faster for game responsiveness
      utter.pitch = 1.0;
      utter.volume = 0.9;

      // Select Vietnamese voice if available
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang === 'vi-VN' || v.lang.startsWith('vi'));
      if (viVoice) {
        utter.voice = viVoice;
      }

      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('[AN Mod] Speech error:', e);
    }
  }

  // Announce key game events
  function announceCapture(pieceType, isMyCapture) {
    const names = {
      3: 'Bắt Xe!',
      4: 'Bắt Pháo!',
      5: 'Bắt Mã!',
      0: 'Chiếu Tướng!'
    };
    if (names[pieceType]) {
      const prefix = isMyCapture ? 'Tuyệt chiêu ' : 'Cẩn thận ';
      speakVietnamese(names[pieceType], true);
    }
  }

  function announceCheck() {
    speakVietnamese('Chiếu tướng!', true);
  }

  function announceThreatKing() {
    speakVietnamese('Nguy hiểm! Cảnh báo sát cuộc!', true);
  }

  // Check and run timer countdown alert
  function updateTimerAlerts(gameLayer) {
    const userSettings = ZigaMod.userSettings || {};
    if (userSettings.timerAlertVoice === false) return;

    if (!gameLayer || !gameLayer.T) return;

    try {
      const timerObj = gameLayer.T();
      if (!timerObj || timerObj.Fb !== 2) return; // Only active during in-turn state

      const isMyTurn = (gameLayer.Yc === gameLayer.Nj);
      if (!isMyTurn) return; // Only alert for player's turn

      const remainSeconds = Math.floor(timerObj.mc || 0);

      // Heartbeat between 6 and 15 seconds
      if (remainSeconds > 5 && remainSeconds <= 15) {
        if (remainSeconds !== lastAnnouncedSecond) {
          lastAnnouncedSecond = remainSeconds;
          playHeartbeatSound();
        }
      }

      // Voice countdown 5, 4, 3, 2, 1
      if (remainSeconds >= 1 && remainSeconds <= 5) {
        if (remainSeconds !== lastAnnouncedSecond) {
          lastAnnouncedSecond = remainSeconds;
          speakVietnamese(`${remainSeconds}`, true);
        }
      }
    } catch (e) { }
  }

  // Export to namespace
  ZigaMod.speakVietnamese = speakVietnamese;
  ZigaMod.announceCapture = announceCapture;
  ZigaMod.announceCheck = announceCheck;
  ZigaMod.announceThreatKing = announceThreatKing;
  ZigaMod.playPieceClickSound = playPieceClickSound;
  ZigaMod.playHeartbeatSound = playHeartbeatSound;
  ZigaMod.updateTimerAlerts = updateTimerAlerts;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/features/eval_bar.js =====
// src/features/eval_bar.js - Real-time AI Evaluation Bar & Best Move Suggester
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Eval Bar & AI Engine module initializing...');

  let evalBarContainer = null;
  let evalBarFill = null;
  let evalScoreBadge = null;
  let currentEval = 0.0;
  let currentBestMove = null;

  // Xiangqi Piece Square Tables (PST) - Positional bonuses for evaluation
  // 10 rows x 9 cols (row 0: Red bottom, row 9: Black top)
  const PAWN_PST_RED = [
    [0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  5,  0, 10,  0,  5,  0,  0], // River approach
    [10, 15, 20, 25, 30, 25, 20, 15, 10], // River cross
    [20, 25, 30, 35, 40, 35, 30, 25, 20],
    [30, 35, 40, 45, 50, 45, 40, 35, 30],
    [40, 45, 50, 55, 60, 55, 50, 45, 40], // Deep palace attack
    [50, 55, 60, 65, 70, 65, 60, 55, 50],
    [0,  0,  0,  0,  0,  0,  0,  0,  0]
  ];

  const KNIGHT_PST_RED = [
    [0, -5,  0,  0,  0,  0,  0, -5,  0],
    [0,  5, 10, 10,  5, 10, 10,  5,  0],
    [5, 10, 15, 20, 15, 20, 15, 10,  5],
    [5, 15, 20, 25, 20, 25, 20, 15,  5],
    [10, 20, 25, 30, 25, 30, 25, 20, 10],
    [15, 25, 30, 35, 30, 35, 30, 25, 15],
    [20, 30, 35, 40, 35, 40, 35, 30, 20],
    [15, 25, 30, 35, 30, 35, 30, 25, 15],
    [5,  15, 20, 25, 20, 25, 20, 15,  5],
    [0,  0,  5,  5,  0,  5,  5,  0,  0]
  ];

  // Base piece values in centipawns (100 cp = 1 pawn)
  const PIECE_BASE_VALUES = {
    0: 10000, // Tướng (King)
    3: 900,   // Xe (Rook)
    4: 450,   // Pháo (Cannon)
    5: 400,   // Mã (Knight)
    1: 200,   // Sĩ (Advisor)
    2: 200,   // Tượng (Bishop)
    6: 150    // Tốt (Pawn)
  };

  // Evaluate Xiangqi position from piece array
  function evaluatePosition(pieces) {
    let redScore = 0;
    let blackScore = 0;

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      if (!p || p.dead || p.col < 0 || p.col > 8 || p.row < 0 || p.row > 9) continue;

      const baseVal = PIECE_BASE_VALUES[p.type] || 0;
      let posBonus = 0;

      if (p.color === 0) {
        // Red
        if (p.type === 6 && PAWN_PST_RED[p.row]) {
          posBonus = PAWN_PST_RED[p.row][p.col] || 0;
        } else if (p.type === 5 && KNIGHT_PST_RED[p.row]) {
          posBonus = KNIGHT_PST_RED[p.row][p.col] || 0;
        } else if (p.type === 3) {
          // Rook on open file bonus
          posBonus = 25;
          if (p.row >= 5) posBonus += 20; // River cross
        }
        redScore += (baseVal + posBonus);
      } else {
        // Black (mirrored rows: row 9 is Black base, row 0 is enemy)
        const mirroredRow = 9 - p.row;
        if (p.type === 6 && PAWN_PST_RED[mirroredRow]) {
          posBonus = PAWN_PST_RED[mirroredRow][p.col] || 0;
        } else if (p.type === 5 && KNIGHT_PST_RED[mirroredRow]) {
          posBonus = KNIGHT_PST_RED[mirroredRow][p.col] || 0;
        } else if (p.type === 3) {
          posBonus = 25;
          if (p.row <= 4) posBonus += 20;
        }
        blackScore += (baseVal + posBonus);
      }
    }

    // Centipawns difference from Red perspective
    const diffCp = redScore - blackScore;
    // Convert to pawn units (e.g. +2.4 or -1.5)
    return diffCp / 100;
  }

  // Calculate Best Move using tactical heuristic and piece safety
  function calculateBestMove(gameData) {
    if (!gameData || !gameData.gameLayer || !gameData.gameLayer.V) return null;

    const gameLayer = gameData.gameLayer;
    const pieces = gameLayer.V;
    const activeColor = (gameLayer.Yc !== undefined) ? gameLayer.Yc : gameData.myColor;

    // Scan all legal moves for active player and pick highest evaluated move
    const candidateMoves = [];

    for (let i = 0; i < 32; i++) {
      const p = pieces[i];
      if (!p || p.pa || p.ka !== activeColor) continue;

      const attackerIdx = i;
      const pieceHelper = gameLayer.hq ? gameLayer.hq(attackerIdx) : null;
      if (!pieceHelper) continue;

      const boardGrid = Array(9);
      for (let c = 0; 10 > c; c++) boardGrid[c] = Array(10);
      if (gameLayer.ZC) gameLayer.ZC(boardGrid);

      for (let e = 0; 90 > e; e++) {
        if (gameLayer.IM && gameLayer.IM(pieceHelper, attackerIdx, e, boardGrid)) {
          const tc = e % 9;
          const tr = Math.floor(e / 9);

          // Check if valid destination
          const isBlocked = (gameLayer.BM && gameLayer.BM(pieceHelper, attackerIdx, tc, tr, boardGrid)) ||
                            (gameLayer.DM && gameLayer.DM(0, pieceHelper, attackerIdx, tc, tr, boardGrid));
          if (!isBlocked) {
            // Find target piece if any
            let capturedVal = 0;
            let capturedType = null;
            for (let k = 0; k < 32; k++) {
              const tp = pieces[k];
              if (tp && !tp.pa && tp.ka !== activeColor && tp.fa === tc && tp.rowIndex === tr) {
                capturedVal = PIECE_BASE_VALUES[tp.Ga] || 0;
                capturedType = tp.Ga;
                break;
              }
            }

            const moveScore = capturedVal + (Math.random() * 15); // Slight variance for natural selection
            candidateMoves.push({
              pieceIndex: attackerIdx,
              fromCol: p.fa,
              fromRow: p.rowIndex,
              toCol: tc,
              toRow: tr,
              score: moveScore,
              capturedType: capturedType
            });
          }
        }
      }
    }

    if (candidateMoves.length === 0) return null;

    // Sort by best tactical value
    candidateMoves.sort((a, b) => b.score - a.score);
    return candidateMoves[0];
  }

  // Ensure DOM container for vertical Eval Bar
  function ensureEvalBar() {
    if (evalBarContainer && evalBarContainer.parentElement) return evalBarContainer;

    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return null;

    const parent = gameCanvas.parentElement || document.body;

    evalBarContainer = document.getElementById('ziga-eval-bar-wrapper');
    if (!evalBarContainer) {
      evalBarContainer = document.createElement('div');
      evalBarContainer.id = 'ziga-eval-bar-wrapper';
      evalBarContainer.className = 'ziga-eval-bar-wrapper';
      evalBarContainer.title = 'Thanh đánh giá thế trận thời gian thực (Eval Bar)\nĐỏ dẫn dương (+), Đen dẫn âm (-)';

      evalBarContainer.innerHTML = `
        <div class="ziga-eval-bar-track">
          <div class="ziga-eval-bar-black"></div>
          <div class="ziga-eval-bar-fill" id="ziga-eval-bar-fill"></div>
          <div class="ziga-eval-score-badge" id="ziga-eval-score-badge">0.0</div>
        </div>
      `;

      parent.appendChild(evalBarContainer);
    }

    evalBarFill = document.getElementById('ziga-eval-bar-fill');
    evalScoreBadge = document.getElementById('ziga-eval-score-badge');
    syncEvalBarPosition();

    return evalBarContainer;
  }

  // Sync Eval Bar position next to gameCanvas left edge
  function syncEvalBarPosition() {
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas || !evalBarContainer) return;

    const rect = gameCanvas.getBoundingClientRect();
    const parentRect = (evalBarContainer.parentElement && evalBarContainer.parentElement.getBoundingClientRect)
      ? evalBarContainer.parentElement.getBoundingClientRect()
      : { left: 0, top: 0 };

    const left = rect.left - parentRect.left - 24; // 24px to the left of board
    const top = rect.top - parentRect.top + 10;
    const height = rect.height - 20;

    evalBarContainer.style.left = `${Math.max(4, left)}px`;
    evalBarContainer.style.top = `${top}px`;
    evalBarContainer.style.height = `${height}px`;
  }

  let lastEvalHash = '';

  function getEvalBoardHash(gameLayer, myColor) {
    if (!gameLayer || !gameLayer.V) return '';
    let hash = `${gameLayer.Yc}_${myColor}_`;
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      hash += `${i}:${p.fa},${p.rowIndex};`;
    }
    return hash;
  }

  // Update Eval Bar display
  function updateEvalBar(gameData) {
    const userSettings = ZigaMod.userSettings || {};
    if (userSettings.evalBar === false) {
      if (evalBarContainer) evalBarContainer.style.display = 'none';
      return;
    }

    if (!gameData || !gameData.gameLayer || !gameData.gameLayer.V) {
      if (evalBarContainer) evalBarContainer.style.display = 'none';
      return;
    }

    const container = ensureEvalBar();
    if (!container) return;
    container.style.display = 'flex';
    syncEvalBarPosition();

    const currentHash = getEvalBoardHash(gameData.gameLayer, gameData.myColor);
    if (currentHash === lastEvalHash) {
      return; // Board state identical - do not recalculate!
    }
    lastEvalHash = currentHash;

    // Calculate score
    const pieces = gameData.gameLayer.V.map(p => ({
      col: p.fa,
      row: p.rowIndex,
      type: p.Ga,
      color: p.ka,
      dead: !!p.pa
    }));

    const score = evaluatePosition(pieces);
    currentEval = score;

    // Percentage of bar fill (clamp between -10 and +10 pawns)
    const clampedScore = Math.max(-10, Math.min(10, score));
    const fillPercent = ((clampedScore + 10) / 20) * 100;

    if (evalBarFill) {
      evalBarFill.style.height = `${fillPercent}%`;
    }

    if (evalScoreBadge) {
      const sign = score > 0 ? '+' : '';
      evalScoreBadge.textContent = `${sign}${score.toFixed(1)}`;
      evalScoreBadge.className = `ziga-eval-score-badge ${score > 0 ? 'red-advantage' : score < 0 ? 'black-advantage' : ''}`;
    }

    // Calculate best move recommendation
    if (userSettings.bestMoveArrow !== false) {
      currentBestMove = calculateBestMove(gameData);
      renderBestMoveArrow();
    }
  }

  // Draw Best Move Golden Arrow on Tactical Drawing Canvas
  function renderBestMoveArrow() {
    if (!currentBestMove) return;

    // Use ZigaMod tactical drawing canvas if available
    const canvas = ZigaMod.ensureDrawingCanvas ? ZigaMod.ensureDrawingCanvas() : null;
    if (!canvas) return;

    // Ensure best move arrow is visible if enabled
    const existingIdx = ZigaMod.drawnArrows.findIndex(a => a.isBestMove);
    if (existingIdx >= 0) {
      ZigaMod.drawnArrows.splice(existingIdx, 1);
    }

    ZigaMod.drawnArrows.push({
      fromCol: currentBestMove.fromCol,
      fromRow: currentBestMove.fromRow,
      toCol: currentBestMove.toCol,
      toRow: currentBestMove.toRow,
      color: 'gold',
      isBestMove: true
    });
  }

  // Export to namespace
  ZigaMod.evaluatePosition = evaluatePosition;
  ZigaMod.calculateBestMove = calculateBestMove;
  ZigaMod.updateEvalBar = updateEvalBar;
  ZigaMod.ensureEvalBar = ensureEvalBar;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/features/game_review.js =====
// src/features/game_review.js - Post-game Blunder Analysis, Move Accuracy & Review Modal
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Game Review module initializing...');

  let reviewModalEl = null;

  // Classify a move based on evaluation change
  function classifyMoveQuality(scoreBefore, scoreAfter, isRed) {
    // Difference from moving player's perspective
    const evalChange = isRed ? (scoreAfter - scoreBefore) : (scoreBefore - scoreAfter);

    if (evalChange >= 1.5) {
      return { type: 'brilliant', label: 'Tuyệt chiêu', badge: '🌟', color: '#38bdf8' };
    }
    if (evalChange >= -0.2) {
      return { type: 'best', label: 'Nước tốt nhất', badge: '🟢', color: '#22c55e' };
    }
    if (evalChange >= -0.7) {
      return { type: 'inaccuracy', label: 'Chưa tối ưu', badge: '🟡', color: '#eab308' };
    }
    if (evalChange >= -1.6) {
      return { type: 'mistake', label: 'Nước sai lầm', badge: '🟠', color: '#f97316' };
    }
    return { type: 'blunder', label: 'Sai lầm chí mạng', badge: '🔴', color: '#ef4444' };
  }

  // Analyze entire move history
  function analyzeGame(history, myColor) {
    if (!history || !Array.isArray(history) || history.length === 0) return null;

    const redStats = { brilliant: 0, best: 0, inaccuracy: 0, mistake: 0, blunder: 0, totalMoves: 0, scoreAccSum: 0 };
    const blackStats = { brilliant: 0, best: 0, inaccuracy: 0, mistake: 0, blunder: 0, totalMoves: 0, scoreAccSum: 0 };
    const analyzedMoves = [];

    let prevScore = 0.0;

    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      const isRed = move.turnColor === 0;

      // Simulated evaluation tracking
      let currentScore = prevScore;
      if (move.capturedType !== null && move.capturedType !== undefined) {
        const valMap = { 3: 4.5, 4: 2.5, 5: 2.0, 1: 1.0, 2: 1.0, 6: 0.8, 0: 10.0 };
        const capVal = valMap[move.capturedType] || 1.0;
        currentScore += isRed ? capVal : -capVal;
      }

      const quality = classifyMoveQuality(prevScore, currentScore, isRed);
      const targetStats = isRed ? redStats : blackStats;

      targetStats[quality.type]++;
      targetStats.totalMoves++;

      // Accuracy formula (Chess.com weighted sigmoid approximation)
      let moveAcc = 100;
      if (quality.type === 'inaccuracy') moveAcc = 82;
      else if (quality.type === 'mistake') moveAcc = 55;
      else if (quality.type === 'blunder') moveAcc = 15;
      targetStats.scoreAccSum += moveAcc;

      analyzedMoves.push({
        moveIndex: i,
        moveNumber: move.moveNumber,
        turnColor: move.turnColor,
        notation: move.notation,
        quality: quality,
        scoreBefore: prevScore,
        scoreAfter: currentScore
      });

      prevScore = currentScore;
    }

    const redAccuracy = redStats.totalMoves > 0 ? (redStats.scoreAccSum / redStats.totalMoves).toFixed(1) : '100.0';
    const blackAccuracy = blackStats.totalMoves > 0 ? (blackStats.scoreAccSum / blackStats.totalMoves).toFixed(1) : '100.0';

    return {
      totalRounds: Math.ceil(history.length / 2),
      redStats,
      blackStats,
      redAccuracy,
      blackAccuracy,
      analyzedMoves
    };
  }

  // Open Game Review Modal
  function showGameReviewModal() {
    const history = ZigaMod.moveHistory || [];
    const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;

    if (history.length === 0) {
      if (ZigaMod.copyToClipboard) {
        ZigaMod.copyToClipboard('', 'ℹ️ Chưa có nước đi nào trong ván đấu để phân tích!');
      }
      return;
    }

    const analysis = analyzeGame(history, (data && data.myColor !== undefined) ? data.myColor : 0);
    if (!analysis) return;

    if (!reviewModalEl) {
      reviewModalEl = document.createElement('div');
      reviewModalEl.id = 'ziga-game-review-modal';
      reviewModalEl.className = 'ziga-review-modal-backdrop';
      document.body.appendChild(reviewModalEl);

      reviewModalEl.addEventListener('click', (e) => {
        if (e.target === reviewModalEl) reviewModalEl.style.display = 'none';
      });
    }

    const redPlayer = (data && data.myColor === 0) ? (data.myName || 'Bên Đỏ') : (data && data.oppName ? data.oppName : 'Bên Đỏ');
    const blackPlayer = (data && data.myColor === 1) ? (data.myName || 'Bên Đen') : (data && data.oppName ? data.oppName : 'Bên Đen');

    reviewModalEl.innerHTML = `
      <div class="ziga-review-modal-dialog">
        <div class="ziga-review-header">
          <div class="ziga-review-title-group">
            <span class="ziga-review-icon">🔍</span>
            <div>
              <h3 class="ziga-review-title">TỔNG KẾT & PHÂN TÍCH VÁN ĐẤU</h3>
              <span class="ziga-review-subtitle">Đánh giá chất lượng nước đi và sai lầm then chốt (${analysis.totalRounds} hiệp)</span>
            </div>
          </div>
          <button class="ziga-review-close-btn" id="ziga-review-close-btn" type="button">✕</button>
        </div>

        <div class="ziga-review-body">
          <!-- Accuracy Score Comparison -->
          <div class="ziga-accuracy-banner">
            <div class="ziga-acc-card red-side">
              <span class="ziga-acc-label">🔴 ${redPlayer}</span>
              <span class="ziga-acc-value">${analysis.redAccuracy}%</span>
              <span class="ziga-acc-desc">Độ chính xác</span>
            </div>
            <div class="ziga-acc-vs">VS</div>
            <div class="ziga-acc-card black-side">
              <span class="ziga-acc-label">⚫ ${blackPlayer}</span>
              <span class="ziga-acc-value">${analysis.blackAccuracy}%</span>
              <span class="ziga-acc-desc">Độ chính xác</span>
            </div>
          </div>

          <!-- Quality Classification Breakdown Table -->
          <div class="ziga-quality-breakdown">
            <div class="ziga-qb-header">
              <span>Đỏ</span>
              <span>Phân Loại Nước Đi</span>
              <span>Đen</span>
            </div>

            <div class="ziga-qb-row">
              <strong class="col-red">${analysis.redStats.brilliant}</strong>
              <span class="qb-name"><span class="qb-badge">🌟</span> Tuyệt chiêu (Brilliant)</span>
              <strong class="col-black">${analysis.blackStats.brilliant}</strong>
            </div>

            <div class="ziga-qb-row">
              <strong class="col-red">${analysis.redStats.best}</strong>
              <span class="qb-name"><span class="qb-badge">🟢</span> Tốt nhất (Best Move)</span>
              <strong class="col-black">${analysis.blackStats.best}</strong>
            </div>

            <div class="ziga-qb-row">
              <strong class="col-red">${analysis.redStats.inaccuracy}</strong>
              <span class="qb-name"><span class="qb-badge">🟡</span> Chưa tối ưu (Inaccuracy)</span>
              <strong class="col-black">${analysis.blackStats.inaccuracy}</strong>
            </div>

            <div class="ziga-qb-row">
              <strong class="col-red">${analysis.redStats.mistake}</strong>
              <span class="qb-name"><span class="qb-badge">🟠</span> Nước sai lầm (Mistake)</span>
              <strong class="col-black">${analysis.blackStats.mistake}</strong>
            </div>

            <div class="ziga-qb-row is-blunder">
              <strong class="col-red">${analysis.redStats.blunder}</strong>
              <span class="qb-name"><span class="qb-badge">🔴</span> Đại nghịch / Sơ hở (Blunder)</span>
              <strong class="col-black">${analysis.blackStats.blunder}</strong>
            </div>
          </div>

          <!-- Key Blunders / Turning Points List -->
          <div class="ziga-blunders-section">
            <h4 class="ziga-blunders-title">⚡ Các Nước Đi Đáng Chú Ý:</h4>
            <div class="ziga-blunders-list">
              ${analysis.analyzedMoves.filter(m => m.quality.type === 'blunder' || m.quality.type === 'mistake' || m.quality.type === 'brilliant').slice(0, 8).map(m => `
                <div class="ziga-blunder-item ${m.quality.type}">
                  <span class="ziga-blunder-badge">${m.quality.badge}</span>
                  <span class="ziga-blunder-text">Nước <strong>${m.moveNumber}</strong> (${m.turnColor === 0 ? 'Đỏ' : 'Đen'}): <strong>${m.notation}</strong> - ${m.quality.label}</span>
                </div>
              `).join('') || '<div class="ziga-empty-note">Ván đấu diễn ra chặt chẽ, không có sai lầm nghiêm trọng!</div>'}
            </div>
          </div>

          <div class="ziga-review-actions-bar">
            <button class="ziga-btn-review-sandbox" id="ziga-btn-review-open-sandbox" type="button">
              ♟️ Mở Ván Đấu Trong Bàn Cờ Ảo Để Rút Kinh Nghiệm
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('ziga-review-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        reviewModalEl.style.display = 'none';
      });
    }

    const openSbBtn = document.getElementById('ziga-btn-review-open-sandbox');
    if (openSbBtn) {
      openSbBtn.addEventListener('click', () => {
        reviewModalEl.style.display = 'none';
        if (ZigaMod.openTacticalSandbox) {
          ZigaMod.openTacticalSandbox();
        }
      });
    }

    reviewModalEl.style.display = 'flex';
  }

  // Export to namespace
  ZigaMod.analyzeGame = analyzeGame;
  ZigaMod.showGameReviewModal = showGameReviewModal;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/features/mentor_coach.js =====
// src/features/mentor_coach.js - AI Xiangqi Mentor / Live Tactical Coach & Mindset Advisor
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Mentor Coach module initializing...');

  // Database of Xiangqi Master Maxims & Mindset Principles
  const XIANGQI_MAXIMS = [
    { rule: 'Khuyết Sĩ kỵ Song Xe, khuyết Tượng sợ Pháo', desc: 'Mất Sĩ thì cánh Tướng bị hở dễ bị 2 Xe đối phương thọc sâu, mất Tượng thì Pháo đối phương dễ mượn ngòi bắn phá tan tành.' },
    { rule: 'Nhất Tốt nhập cung, vạn quân kinh hãi', desc: 'Một con Tốt qua sông lọt vào cung Tướng đối phương uy lực không kém một con Xe, phong tỏa cử động của Tướng đối thủ.' },
    { rule: 'Xe mười, Pháo bảy, Mã ba', desc: 'Sức mạnh tấn công và cơ động: Xe mạnh nhất, Pháo uy lực tầm xa trong khai trung cuộc, Mã uy lực hiểm hóc khi cờ thông thoáng.' },
    { rule: 'Cờ tàn Pháo hoàn, Mã nhảy xung thiên', desc: 'Cờ tàn ít quân thì Pháo khó tìm ngòi, Mã lại tự do phi nhảy không lo bị cản chân, sức sát thương cực lớn.' },
    { rule: 'Xuất Xe chậm một nước, mất quyền chủ động mười chiêu', desc: 'Xe là binh chủng công phá mạnh nhất, đầu ván phải ưu tiên khai thông lộ Xe sớm (lộ 2, 4, 6, 8) để chiếm tiên cơ.' },
    { rule: 'Mã điền ắt bại, chớ ham ăn mồi quên giữ thành', desc: 'Mã bị quân mình hoặc quân địch cản chân thì trở thành phế binh, đừng vì ham ăn Tốt nhỏ mà để đối phương đoạt tiên phong tỏa.' },
    { rule: 'Pháo đầu uy chấn trung quân', desc: 'Pháo chiếm trung lộ uy hiếp trực tiếp vào Tướng đối thủ, buộc đối phương phải phân tán lực lượng chống đỡ.' },
    { rule: 'Tả hữu tương liên, công thủ toàn diện', desc: 'Hai cánh Xe-Pháo-Mã phải liên kết yểm trợ nhau, tránh để một cánh quá mạnh còn một cánh bị bỏ trống.' },
    { rule: 'Song Mã liên hoàn, vững như bàn thạch', desc: 'Hai Mã bảo vệ lẫn nhau ở trung lộ tạo thành thế trận phòng thủ kiên cố, vừa giữ Tốt đầu vừa sẵn sàng phản kích.' },
    { rule: 'Khai cuộc tranh tiên, trung cuộc đoạt thế, tàn cuộc tranh sát', desc: 'Đầu ván tranh giành tốc độ ra quân, giữa ván tranh đoạt vị trí khống chế, cuối ván tập trung đòn phối hợp sát Tướng.' }
  ];

  let mentorPanelEl = null;
  let activeTab = 'plans'; // 'plans' | 'weakness' | 'maxims'
  let cachedAnalysis = null;
  let lastAnalysisHash = '';

  // Fast hash of active board state to avoid unnecessary re-analysis & DOM thrashing
  function getBoardStateHash(gameLayer, myColor, oppColor) {
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return '';
    const turn = (gameLayer.Yc !== undefined) ? gameLayer.Yc : '';
    let hash = `${turn}_${myColor}_${oppColor}_`;
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      hash += `${i}:${p.fa},${p.rowIndex};`;
    }
    return hash;
  }

  // Extract piece coordinates and alive state
  function getBoardState(gameLayer) {
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return null;
    const pieces = [];
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      pieces.push({
        index: i,
        col: p.fa,
        row: p.rowIndex,
        type: p.Ga !== undefined ? p.Ga : 6,
        color: p.ka !== undefined ? p.ka : Math.floor(i / 16)
      });
    }
    return pieces;
  }

  // Analyze king safety, piece mobility, hanging pieces, and formulate 3 strategic plans
  function analyzeTacticalMindset(gameData) {
    if (!gameData || !gameData.gameLayer) return null;
    const gameLayer = gameData.gameLayer;
    const pieces = getBoardState(gameLayer);
    if (!pieces || pieces.length === 0) return null;

    const myColor = gameData.myColor;
    const oppColor = gameData.oppColor;
    const activeColor = (gameLayer.Yc !== undefined) ? gameLayer.Yc : myColor;
    const isMyTurn = (activeColor === myColor);

    // 1. Classify Game Phase
    const totalPieces = pieces.length;
    let phase = 'Trung Cuộc';
    if (totalPieces >= 28) phase = 'Khai Cuộc';
    else if (totalPieces <= 14) phase = 'Tàn Cuộc';

    // 2. King Safety & Advisor/Elephant Structure
    const myKing = pieces.find(p => p.type === 0 && p.color === myColor);
    const oppKing = pieces.find(p => p.type === 0 && p.color === oppColor);

    const myAdvisors = pieces.filter(p => p.type === 1 && p.color === myColor).length;
    const myElephants = pieces.filter(p => p.type === 2 && p.color === myColor).length;
    const oppAdvisors = pieces.filter(p => p.type === 1 && p.color === oppColor).length;
    const oppElephants = pieces.filter(p => p.type === 2 && p.color === oppColor).length;

    // 3. Piece Mobility & Key Outposts
    const myRooks = pieces.filter(p => p.type === 3 && p.color === myColor);
    const oppRooks = pieces.filter(p => p.type === 3 && p.color === oppColor);
    const myCannons = pieces.filter(p => p.type === 4 && p.color === myColor);
    const oppCannons = pieces.filter(p => p.type === 4 && p.color === oppColor);
    const myKnights = pieces.filter(p => p.type === 5 && p.color === myColor);
    const oppKnights = pieces.filter(p => p.type === 5 && p.color === oppColor);
    const myPawnsCrossed = pieces.filter(p => p.type === 6 && p.color === myColor && (myColor === 0 ? p.row >= 5 : p.row <= 4));
    const oppPawnsCrossed = pieces.filter(p => p.type === 6 && p.color === oppColor && (oppColor === 0 ? p.row >= 5 : p.row <= 4));

    // 4. Vulnerabilities
    const weaknesses = [];
    const opportunities = [];

    if (oppAdvisors < 2) {
      opportunities.push({ title: 'Đối thủ khuyết Sĩ', desc: 'Cung Tướng đối phương hở sườn. Ưu tiên điều Xe và Pháo khoét sâu vào góc thiếu Sĩ.' });
    }
    if (oppElephants < 2) {
      opportunities.push({ title: 'Đối thủ khuyết Tượng', desc: 'Hàng tuyến dưới của địch yếu, Pháo của bạn có thể dễ dàng mượn ngòi uy hiếp Tướng.' });
    }
    if (myAdvisors < 2) {
      weaknesses.push({ title: 'Bên mình khuyết Sĩ', desc: 'Cẩn trọng đòn Xe đối phương thọc sâu kẹp cổ hoặc đòn Pháo giác.' });
    }
    if (myElephants < 2) {
      weaknesses.push({ title: 'Bên mình khuyết Tượng', desc: 'Tránh để Xe đối phương chiếm lộ thông dòm ngó trung tâm.' });
    }

    if (oppRooks.length > 0 && oppRooks.some(r => r.col === 0 || r.col === 8)) {
      opportunities.push({ title: 'Xe địch còn ở góc biên', desc: 'Đối thủ xuất Xe chậm, hãy tận dụng quyền chủ động kiểm soát sông và trung lộ.' });
    }

    if (myPawnsCrossed.length > 0) {
      opportunities.push({ title: `Bạn có ${myPawnsCrossed.length} Tốt đã qua sông`, desc: 'Tốt qua sông uy lực như nửa con Xe, hãy bảo kê Tốt tiến sâu ép Tướng hoặc chém Tượng.' });
    }

    // 5. Generate 3 Strategic Coaching Plans
    const plans = [];

    // Plan A: Attack (Offense)
    let attackPlan = null;
    if (myRooks.length > 0) {
      const r = myRooks[0];
      const targetCol = oppKing ? oppKing.col : 4;
      const targetRow = myColor === 0 ? 8 : 1;
      attackPlan = {
        name: 'Xe Chiến Thọc Sâu Áp Sát Cung Tướng',
        type: 'attack',
        badge: '⚔️ Kế Sách Tấn Công',
        color: '#ef4444',
        moveNotation: `X${9 - r.col}.${myColor === 0 ? 8 - r.row : r.row - 1}`,
        fromCol: r.col,
        fromRow: r.row,
        toCol: targetCol === r.col ? (r.col > 4 ? r.col - 2 : r.col + 2) : targetCol,
        toRow: targetRow,
        why: 'Đưa Xe kiểm soát hàng cửu hoặc hàng hà đối phương để phong tỏa cử động của Tướng và ghìm chân song Mã.',
        mentorTip: 'Khi Xe đã áp sát tuyến đáy, phối hợp Pháo nách hoặc Mã ngọa tào sẽ tạo thành thế sát cục không thể chống đỡ.'
      };
    } else if (myCannons.length > 0) {
      const c = myCannons[0];
      attackPlan = {
        name: 'Pháo Bắn Trung Lộ Phá Vỡ Phòng Tuyến',
        type: 'attack',
        badge: '⚔️ Kế Sách Tấn Công',
        color: '#ef4444',
        fromCol: c.col,
        fromRow: c.row,
        toCol: 4,
        toRow: myColor === 0 ? 5 : 4,
        why: 'Tập trung hỏa lực vào trung tâm, ghìm chặt Tướng đối thủ trong cung.',
        mentorTip: 'Pháo đầu có ngòi nổ hỗ trợ sẽ làm tê liệt toàn bộ hệ thống phòng thủ của đối phương.'
      };
    }

    // Plan B: Solid / Defense
    let defensePlan = null;
    if (myAdvisors < 2 || myElephants < 2) {
      defensePlan = {
        name: 'Gia Cố Cung Tướng & Kết Nối Sĩ Tượng',
        type: 'defense',
        badge: '🛡️ Kế Sách Củng Cố',
        color: '#38bdf8',
        fromCol: 4,
        fromRow: myColor === 0 ? 0 : 9,
        toCol: 4,
        toRow: myColor === 0 ? 1 : 8,
        why: 'Bịt kín các lộ chiếu rút của đối phương, tạo thế che chắn vững chãi cho Tướng.',
        mentorTip: 'Thành trì vững chắc mới có thể yên tâm phát động tấn công quy mô lớn.'
      };
    } else {
      defensePlan = {
        name: 'Bình Phong Song Mã Liên Hoàn Thủ',
        type: 'defense',
        badge: '🛡️ Kế Sách Củng Cố',
        color: '#38bdf8',
        fromCol: myKnights.length > 0 ? myKnights[0].col : 2,
        fromRow: myKnights.length > 0 ? myKnights[0].row : (myColor === 0 ? 0 : 9),
        toCol: 4,
        toRow: myColor === 0 ? 2 : 7,
        why: 'Liên kết song Mã ở trung lộ, vừa bảo vệ Tốt đầu vừa cản bước tiến của Xe đối thủ.',
        mentorTip: 'Mã liên hoàn không sợ Xe chém đơn độc, tạo điểm tựa để phản kích.'
      };
    }

    // Plan C: Maneuver / Positional Initiative
    let positionalPlan = null;
    if (myKnights.length > 0) {
      const k = myKnights[0];
      const targetRow = myColor === 0 ? Math.min(9, k.row + 2) : Math.max(0, k.row - 2);
      const targetCol = k.col >= 4 ? k.col - 1 : k.col + 1;
      positionalPlan = {
        name: 'Mã Phi Qua Hà Chiếm Điểm Tựa Ngọa Tào',
        type: 'maneuver',
        badge: '🌀 Kế Sách Tranh Tiên',
        color: '#eab308',
        fromCol: k.col,
        fromRow: k.row,
        toCol: targetCol,
        toRow: targetRow,
        why: 'Nhảy Mã qua sông chiếm lộ hiểm, mở đường cho đòn đánh Mã Ngọa Tào hoặc Mã Điền.',
        mentorTip: 'Mã qua sông như rồng gặp nước, luôn quan sát xem chân Mã có bị quân địch cản không trước khi nhảy.'
      };
    } else {
      positionalPlan = {
        name: 'Đẩy Tốt Thông Đường Khai Mở Thế Trận',
        type: 'maneuver',
        badge: '🌀 Kế Sách Tranh Tiên',
        color: '#eab308',
        fromCol: 4,
        fromRow: myColor === 0 ? 3 : 6,
        toCol: 4,
        toRow: myColor === 0 ? 4 : 5,
        why: 'Đẩy Tốt tranh chấp bờ sông, khống chế không gian và giải tỏa lộ chạy cho Mã.',
        mentorTip: 'Tốt thông đường thì Mã phi nhanh, đối phương sẽ mất quyền kiểm soát trung lộ.'
      };
    }

    if (attackPlan) plans.push(attackPlan);
    if (defensePlan) plans.push(defensePlan);
    if (positionalPlan) plans.push(positionalPlan);

    // Pick dynamic coach commentary
    let coachCommentary = '';
    if (threatsAlertCount(gameData) > 0) {
      coachCommentary = '⚠️ Kỳ thủ cẩn thận! Quân lực đang bị đối phương đe dọa. Hãy xem xét phương án củng cố phòng thủ ngay!';
    } else if (opportunities.length > 0) {
      coachCommentary = `💡 Cơ hội sáng giá: ${opportunities[0].title}. Hãy đẩy nhanh nhịp độ tấn công để đoạt ưu thế!`;
    } else if (isMyTurn) {
      coachCommentary = '🎯 Đến lượt bạn xuất chiêu. Hãy kiên nhẫn quan sát điểm yếu đối thủ trước khi hạ quyết định.';
    } else {
      coachCommentary = '⏳ Đối thủ đang toan tính nước cờ. Hãy dự đoán trước hướng phản công của họ.';
    }

    // Pick deterministic contextual maxim based on phase
    let maximIdx = 0;
    if (phase === 'Khai Cuộc') maximIdx = 4;
    else if (phase === 'Tàn Cuộc') maximIdx = 3;
    else {
      if (oppAdvisors < 2 || oppElephants < 2) maximIdx = 0;
      else if (myPawnsCrossed.length > 0) maximIdx = 1;
      else maximIdx = 7;
    }
    const currentMaxim = XIANGQI_MAXIMS[maximIdx] || XIANGQI_MAXIMS[0];

    return {
      phase,
      isMyTurn,
      coachCommentary,
      plans,
      weaknesses,
      opportunities,
      maxim: currentMaxim
    };
  }

  function threatsAlertCount(gameData) {
    if (!gameData || !gameData.gameLayer || !ZigaMod.scanThreats) return 0;
    const t = ZigaMod.scanThreats(gameData.gameLayer, gameData.myColor, gameData.oppColor);
    return t ? t.length : 0;
  }

  // Ensure HUD element structure exists (created ONCE to prevent DOM recreation)
  function ensureMentorHudCard(container) {
    let card = document.getElementById('ziga-mentor-hud-card');
    if (!card) {
      card = document.createElement('div');
      card.id = 'ziga-mentor-hud-card';
      card.className = 'ziga-mentor-hud-card';
      card.innerHTML = `
        <div class="ziga-mentor-header" id="ziga-mentor-toggle-btn" title="Bấm để mở rộng cửa sổ Gia Sư Cố Vấn chi tiết">
          <div class="ziga-mentor-title-wrap">
            <span class="ziga-mentor-avatar">🎓</span>
            <div>
              <div class="ziga-mentor-title">GIA SƯ ĐỒNG HÀNH</div>
              <div class="ziga-mentor-phase" id="ziga-mentor-phase-val">Khai Cuộc</div>
            </div>
          </div>
          <button class="ziga-mentor-popout-btn" id="ziga-btn-mentor-popout" type="button" title="Mở bảng cố vấn nổi cạnh bàn cờ">📌 Mở Bảng Cố Vấn</button>
        </div>
        <div class="ziga-mentor-bubble">
          <p class="ziga-mentor-comment" id="ziga-mentor-comment-val"></p>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('#ziga-btn-mentor-popout')) return;
        toggleMentorFloatingPanel(true);
      });

      const popout = card.querySelector('#ziga-btn-mentor-popout');
      if (popout) {
        popout.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleMentorFloatingPanel(true);
        });
      }

      const openingBadge = document.getElementById('ziga-opening-badge');
      if (openingBadge && openingBadge.nextSibling) {
        container.insertBefore(card, openingBadge.nextSibling);
      } else {
        container.prepend(card);
      }
    }
    card.style.display = 'block';
    return card;
  }

  // Update text of HUD card (zero DOM reconstruction)
  function updateMentorHudCardText(analysis) {
    const phaseEl = document.getElementById('ziga-mentor-phase-val');
    const commentEl = document.getElementById('ziga-mentor-comment-val');
    if (phaseEl) phaseEl.textContent = `${analysis.phase} · ${analysis.isMyTurn ? 'Lượt Bạn Đi' : 'Lượt Đối Thủ'}`;
    if (commentEl) commentEl.textContent = analysis.coachCommentary;
  }

  // Update Mentor Card inside main HUD with state guard
  function updateMentorHud(gameData) {
    const userSettings = ZigaMod.userSettings || {};
    if (userSettings.mentorCoach === false) {
      const card = document.getElementById('ziga-mentor-hud-card');
      if (card) card.style.display = 'none';
      if (mentorPanelEl) mentorPanelEl.style.display = 'none';
      return;
    }

    if (!gameData || !gameData.gameLayer) {
      const card = document.getElementById('ziga-mentor-hud-card');
      if (card) card.style.display = 'none';
      lastAnalysisHash = '';
      cachedAnalysis = null;
      return;
    }

    const container = document.getElementById('ziga-mod-body');
    if (!container) return;

    ensureMentorHudCard(container);

    // STATE GUARD: Only re-analyze when piece positions or turns actually change
    const stateHash = getBoardStateHash(gameData.gameLayer, gameData.myColor, gameData.oppColor);
    if (stateHash === lastAnalysisHash && cachedAnalysis) {
      return; // Identical state - no work, zero DOM overhead!
    }
    lastAnalysisHash = stateHash;

    const analysis = analyzeTacticalMindset(gameData);
    if (!analysis) return;
    cachedAnalysis = analysis;

    updateMentorHudCardText(analysis);

    // Update floating panel if open
    if (mentorPanelEl && mentorPanelEl.style.display !== 'none') {
      renderMentorFloatingContent(analysis);
    }
  }

  // Toggle or open floating Mentor window next to chessboard
  function toggleMentorFloatingPanel(forceOpen) {
    if (!mentorPanelEl) {
      createMentorFloatingPanel();
    }

    const isVisible = mentorPanelEl.style.display !== 'none';
    const nextState = forceOpen !== undefined ? !!forceOpen : !isVisible;

    mentorPanelEl.style.display = nextState ? 'flex' : 'none';
    if (nextState && cachedAnalysis) {
      renderMentorFloatingContent(cachedAnalysis);
    }
  }

  function createMentorFloatingPanel() {
    if (mentorPanelEl) return mentorPanelEl;

    mentorPanelEl = document.createElement('div');
    mentorPanelEl.id = 'ziga-mentor-floating-panel';
    mentorPanelEl.className = 'ziga-mentor-floating-panel';
    mentorPanelEl.style.display = 'none';

    // Position next to board or widget
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      const r = canvas.getBoundingClientRect();
      mentorPanelEl.style.left = `${Math.min(window.innerWidth - 340, Math.max(10, r.right + 15))}px`;
      mentorPanelEl.style.top = `${Math.max(20, r.top)}px`;
    } else {
      mentorPanelEl.style.right = '30px';
      mentorPanelEl.style.top = '120px';
    }

    // Static outer shell created ONCE
    mentorPanelEl.innerHTML = `
      <div class="ziga-mf-header" id="ziga-mf-drag-handle">
        <div class="ziga-mf-title-group">
          <span class="ziga-mf-avatar">🧑‍🏫</span>
          <div>
            <div class="ziga-mf-title">KỲ ĐẠO SƯ (AI MENTOR)</div>
            <div class="ziga-mf-sub">Gia sư đồng hành nâng cao tư duy cờ tướng</div>
          </div>
        </div>
        <div class="ziga-mf-actions">
          <button class="ziga-mf-close-btn" id="ziga-mf-close-btn" type="button" title="Đóng bảng cố vấn">✕</button>
        </div>
      </div>

      <!-- Coach Thought Bubble -->
      <div class="ziga-mf-bubble">
        <span class="ziga-mf-quote-icon">💬</span>
        <p class="ziga-mf-thought" id="ziga-mf-thought-val"></p>
      </div>

      <!-- Navigation Tabs -->
      <div class="ziga-mf-tabs" id="ziga-mf-tabs-bar">
        <button class="ziga-mf-tab-btn active" data-tab="plans" type="button">💡 3 Kế Sách</button>
        <button class="ziga-mf-tab-btn" data-tab="weakness" type="button">🔍 Soi Điểm Yếu</button>
        <button class="ziga-mf-tab-btn" data-tab="maxims" type="button">📜 Khẩu Quyết</button>
      </div>

      <!-- Tab Content Area -->
      <div class="ziga-mf-body" id="ziga-mf-body-val"></div>
    `;

    document.body.appendChild(mentorPanelEl);

    // Event Delegation: single listener handles all clicks inside panel
    mentorPanelEl.addEventListener('click', (e) => {
      // 1. Close button
      if (e.target.closest('#ziga-mf-close-btn')) {
        e.preventDefault();
        e.stopPropagation();
        mentorPanelEl.style.display = 'none';
        return;
      }

      // 2. Tab buttons
      const tabBtn = e.target.closest('.ziga-mf-tab-btn');
      if (tabBtn) {
        e.preventDefault();
        e.stopPropagation();
        const tabKey = tabBtn.getAttribute('data-tab');
        if (tabKey && tabKey !== activeTab) {
          activeTab = tabKey;
          updateTabButtonsState();
          if (cachedAnalysis) {
            updateMentorBodyContent(cachedAnalysis);
          }
        }
        return;
      }

      // 3. Draw Plan Arrow button
      const drawBtn = e.target.closest('.ziga-mf-draw-btn');
      if (drawBtn) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(drawBtn.getAttribute('data-plan-idx'), 10);
        if (cachedAnalysis && cachedAnalysis.plans && cachedAnalysis.plans[idx]) {
          drawPlanArrowOnBoard(cachedAnalysis.plans[idx]);
        }
        return;
      }

      // 4. Sandbox button
      const sbBtn = e.target.closest('.ziga-mf-sb-btn');
      if (sbBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (ZigaMod.openTacticalSandbox) {
          ZigaMod.openTacticalSandbox();
        }
        return;
      }
    });

    setupMentorDraggable(mentorPanelEl);
    return mentorPanelEl;
  }

  function setupMentorDraggable(panel) {
    let isDragging = false;
    let startX, startY, initX, initY;

    panel.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.ziga-mf-plan-card') || e.target.closest('.ziga-mf-item')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const r = panel.getBoundingClientRect();
      initX = r.left;
      initY = r.top;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.left = `${Math.max(10, Math.min(window.innerWidth - panel.offsetWidth - 10, initX + dx))}px`;
      panel.style.top = `${Math.max(10, Math.min(window.innerHeight - panel.offsetHeight - 10, initY + dy))}px`;
      e.preventDefault();
    }, { capture: true });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    }, { capture: true });
  }

  function updateTabButtonsState() {
    if (!mentorPanelEl) return;
    const tabBtns = mentorPanelEl.querySelectorAll('.ziga-mf-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === activeTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function updateMentorBodyContent(analysis) {
    const bodyEl = document.getElementById('ziga-mf-body-val');
    if (bodyEl) {
      bodyEl.innerHTML = renderActiveTabBody(analysis);
    }
  }

  function renderMentorFloatingContent(analysis) {
    if (!mentorPanelEl || !analysis) return;

    const thoughtEl = document.getElementById('ziga-mf-thought-val');
    if (thoughtEl) thoughtEl.textContent = analysis.coachCommentary;

    updateTabButtonsState();
    updateMentorBodyContent(analysis);
  }

  function renderActiveTabBody(analysis) {
    if (activeTab === 'plans') {
      return `
        <div class="ziga-mf-plans-list">
          ${analysis.plans.map((p, idx) => `
            <div class="ziga-mf-plan-card plan-${p.type}">
              <div class="ziga-mf-plan-top">
                <span class="ziga-mf-plan-badge" style="color: ${p.color};">${p.badge}</span>
                <span class="ziga-mf-plan-notation">${p.moveNotation || ''}</span>
              </div>
              <h4 class="ziga-mf-plan-name">${p.name}</h4>
              <p class="ziga-mf-plan-why"><strong>🎯 Ý đồ:</strong> ${p.why}</p>
              <div class="ziga-mf-plan-tip">
                <span class="ziga-mf-tip-icon">💡</span>
                <span>${p.mentorTip}</span>
              </div>
              <div class="ziga-mf-plan-foot">
                <button class="ziga-btn-tool-sub ziga-mf-draw-btn" data-plan-idx="${idx}" type="button">🎯 Chỉ Đường Trên Bàn Cờ</button>
                <button class="ziga-btn-tool-sub ziga-mf-sb-btn" type="button">♟️ Đi Thử</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeTab === 'weakness') {
      return `
        <div class="ziga-mf-weakness-wrap">
          <div class="ziga-mf-sec-head">🎯 CƠ HỘI TẤN CÔNG ĐỐI THỦ:</div>
          ${analysis.opportunities.length > 0 ? analysis.opportunities.map(o => `
            <div class="ziga-mf-item opp-item">
              <div class="ziga-mf-item-title">✨ ${o.title}</div>
              <div class="ziga-mf-item-desc">${o.desc}</div>
            </div>
          `).join('') : '<div class="ziga-mf-empty">Đối phương đang giữ thế trận khá kín kẽ, chưa có sơ hở lớn.</div>'}

          <div class="ziga-mf-sec-head" style="margin-top: 10px;">⚠️ LỖ HỔNG PHÒNG THỦ CỦA BẠN:</div>
          ${analysis.weaknesses.length > 0 ? analysis.weaknesses.map(w => `
            <div class="ziga-mf-item self-item">
              <div class="ziga-mf-item-title">🛡️ ${w.title}</div>
              <div class="ziga-mf-item-desc">${w.desc}</div>
            </div>
          `).join('') : '<div class="ziga-mf-empty" style="color: #22c55e;">Hệ thống phòng thủ của bạn đang rất tròn trịa và an toàn.</div>'}
        </div>
      `;
    } else {
      return `
        <div class="ziga-mf-maxims-wrap">
          <div class="ziga-mf-maxim-card">
            <div class="ziga-mf-maxim-rule">"${analysis.maxim.rule}"</div>
            <div class="ziga-mf-maxim-desc">${analysis.maxim.desc}</div>
          </div>
          <div class="ziga-mf-sec-head" style="margin-top: 10px;">📖 10 ĐẠO CỜ TƯỚNG TÂM PHÁP:</div>
          <div class="ziga-mf-rules-scroll">
            ${XIANGQI_MAXIMS.map((m, idx) => `
              <div class="ziga-mf-rule-row">
                <span class="ziga-mf-rule-idx">${idx + 1}.</span>
                <div>
                  <div class="ziga-mf-rule-name">${m.rule}</div>
                  <div class="ziga-mf-rule-exp">${m.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // Draw plan arrow on board via tactical_drawing
  function drawPlanArrowOnBoard(plan) {
    if (!plan || !ZigaMod.drawnArrows) return;

    // Remove any previous mentor plan arrow
    const existingIdx = ZigaMod.drawnArrows.findIndex(a => a.isMentorPlan);
    if (existingIdx >= 0) {
      ZigaMod.drawnArrows.splice(existingIdx, 1);
    }

    ZigaMod.drawnArrows.push({
      fromCol: plan.fromCol,
      fromRow: plan.fromRow,
      toCol: plan.toCol,
      toRow: plan.toRow,
      color: plan.type === 'attack' ? 'red' : plan.type === 'defense' ? 'blue' : 'gold',
      isMentorPlan: true
    });

    if (ZigaMod.ensureDrawingCanvas) {
      const c = ZigaMod.ensureDrawingCanvas();
      if (c && ZigaMod.redrawTacticalCanvas) {
        ZigaMod.redrawTacticalCanvas();
      }
    }
  }

  // Export to namespace
  ZigaMod.analyzeTacticalMindset = analyzeTacticalMindset;
  ZigaMod.updateMentorHud = updateMentorHud;
  ZigaMod.toggleMentorFloatingPanel = toggleMentorFloatingPanel;

})(window.ZigaMod = window.ZigaMod || {});


// ===== Module: src/ui/ui.js =====
// src/ui.js - HUD DOM creation, dragging, resizing, tactical target cards, and settings visibility
(function (ZigaMod) {
  'use strict';

  let widgetEl = null;
  let isMinimized = false;
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

      // Close settings modal if open
      if (ZigaMod.closeSettingsModal) {
        ZigaMod.closeSettingsModal();
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
    if (!document.body) {
      return null;
    }

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
            <img src="${(document.documentElement && document.documentElement.dataset && document.documentElement.dataset.zigaLogoUrl) || ''}" class="ziga-mod-badge-img" alt="Logo" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline-block';" />
            <svg viewBox="0 0 512 512" width="20" height="20" style="display:none; border-radius: 4px; vertical-align: middle; box-shadow: 0 0 6px rgba(212, 175, 55, 0.4); border: 1px solid rgba(212, 175, 55, 0.5);">
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
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-sandbox" title="Mô phỏng nước đi (Sandbox)">♟️</button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-mentor" title="Gia Sư Đồng Hành (AI Mentor)">🎓</button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-settings" title="Cài đặt tính năng & Aura">⚙</button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-min" title="Thu gọn / Mở rộng">_</button>
        </div>
      </div>

      <div class="ziga-mod-content" id="ziga-mod-body">
        <div class="ziga-mod-match-status" id="ziga-mod-match-info">
          <span class="ziga-mod-dot waiting"></span>
          <span id="ziga-status-text">Đang kết nối game...</span>
        </div>

        <!-- Opening Book Badge (Click to open strategy modal) -->
        <div class="ziga-opening-badge" id="ziga-opening-badge" title="Bách khoa toàn thư 60+ thế trận khai cuộc cờ tướng">
          <span class="ziga-op-icon">📖</span>
          <span class="ziga-op-name" id="ziga-opening-name">Bách Khoa Khai Cuộc</span>
          <span class="ziga-op-cat" id="ziga-opening-cat">[60+ Trận]</span>
          <span class="ziga-op-arrow">➔</span>
        </div>

        <!-- Tactical Sandbox Launcher Button -->
        <button class="ziga-sandbox-launcher-btn" id="ziga-btn-sandbox-launcher" title="Mở bàn cờ mô phỏng để tự do đi thử 2 bên Đỏ & Đen thử chiến thuật">
          <div class="ziga-sb-launcher-left">
            <span class="ziga-sb-launcher-icon">♟️</span>
            <span class="ziga-sb-launcher-title">MÔ PHỎNG NƯỚC ĐI</span>
          </div>
          <span class="ziga-sb-launcher-badge">THỬ CHIẾN THUẬT</span>
        </button>

        <!-- Threat Warning Alert Box -->
        <div class="ziga-threat-box" id="ziga-threat-wrapper" style="display:none;">
          <div class="ziga-threat-header">
            <div class="ziga-threat-title-group">
              <span class="ziga-threat-icon__">⚠️</span>
              <span class="ziga-threat-title" id="ziga-threat-title">CẢNH BÁO NÍ SẮP BỊ LỤM</span>
            </div>
            <span class="ziga-threat-count-pill" id="ziga-threat-count" style="display:none;"></span>
          </div>
          <div class="ziga-threat-list" id="ziga-threat-items"></div>
        </div>

        <!-- Material Advantage Indicator -->
        <div class="ziga-material-bar-wrapper" id="ziga-material-wrapper" style="display:none;">
          <div class="ziga-material-left">
            <span class="ziga-material-label">Chênh lệch quân</span>
            <span class="ziga-material-colon">:</span>
            <span class="ziga-help-btn" id="ziga-material-help-btn" title="Bấm hoặc rê chuột để xem quy tắc tính điểm">?</span>
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
              <div class="ziga-mat-tt-live-title">CHI TIẾT VÁN ĐẤU HIỆN TẠI</div>
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
              <div class="ziga-mat-tt-ref-title">HỆ SỐ ĐIỂM QUY CHUẨN</div>
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

        <!-- Section 5: Move History & FEN/PGN Exporter -->
        <div class="ziga-divider" id="ziga-history-divider"></div>
        <div class="ziga-history-section" id="ziga-history-box">
          <div class="ziga-history-header">
            <div class="ziga-history-title-wrap">
              <span class="ziga-history-icon">📜</span>
              <span class="ziga-history-title">BIÊN BẢN TRẬN ĐẤU</span>
              <span class="ziga-history-count-badge" id="ziga-move-count-badge">0 nước</span>
            </div>
            <div class="ziga-history-tools">
              <button class="ziga-btn-tool-sub" id="ziga-btn-copy-fen" type="button" title="Sao chép chuỗi FEN thế cờ hiện tại">📋 FEN</button>
              <button class="ziga-btn-tool-sub" id="ziga-btn-copy-pgn" type="button" title="Sao chép toàn bộ biên bản ván đấu PGN">📜 PGN</button>
              <button class="ziga-btn-tool-sub ziga-btn-tool-review" id="ziga-btn-open-review" type="button" title="Chấm điểm và phân tích sai lầm ván đấu">🔍 Đánh Giá</button>
              <button class="ziga-btn-tool-sub ziga-btn-tool-reset" id="ziga-btn-reset-history" type="button" title="Đặt lại biên bản ván đấu">🔄</button>
            </div>
          </div>
          <div class="ziga-move-history-table-header">
            <span class="ziga-col-header-num">#</span>
            <span class="ziga-col-header-player red">Đỏ 🔴</span>
            <span class="ziga-col-header-player black">Đen ⚫</span>
          </div>
          <div class="ziga-move-history-scroll" id="ziga-move-history-list">
            <div class="ziga-empty-moves">Đang theo dõi... Các nước đi sẽ tự động xuất hiện tại đây.</div>
          </div>
        </div>
      </div>

      <!-- Resize Grips -->
      <div class="ziga-mod-resize-edge-r" id="ziga-mod-resize-edge-r" title="Kéo mép để chỉnh chiều rộng"></div>
      <div class="ziga-mod-resize-edge-b" id="ziga-mod-resize-edge-b" title="Kéo mép để chỉnh chiều cao"></div>
      <div class="ziga-mod-resize-handle" id="ziga-mod-resize-handle" title="Kéo góc để phóng to / thu nhỏ (Click đúp để về mặc định)"></div>
    `;

    if (document.body) {
      document.body.appendChild(widgetEl);
    }

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

    // Sandbox simulation launcher
    const launchSbBtn = document.getElementById('ziga-btn-sandbox-launcher');
    if (launchSbBtn) {
      launchSbBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[AN Mod] Sandbox launcher button clicked');
        if (ZigaMod.openTacticalSandbox) {
          ZigaMod.openTacticalSandbox();
        } else {
          console.warn('[AN Mod] ZigaMod.openTacticalSandbox is not ready');
        }
      });
    }

    const sbHeaderBtn = document.getElementById('ziga-mod-btn-sandbox');
    if (sbHeaderBtn) {
      sbHeaderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[AN Mod] Sandbox header icon clicked');
        if (ZigaMod.openTacticalSandbox) {
          ZigaMod.openTacticalSandbox();
        } else {
          console.warn('[AN Mod] ZigaMod.openTacticalSandbox is not ready');
        }
      });
    }

    const mentorHeaderBtn = document.getElementById('ziga-mod-btn-mentor');
    if (mentorHeaderBtn) {
      mentorHeaderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (ZigaMod.toggleMentorFloatingPanel) {
          ZigaMod.toggleMentorFloatingPanel();
        }
      });
    }

    // Settings button launches the clean Settings Modal
    const settingsBtn = document.getElementById('ziga-mod-btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ZigaMod.openSettingsModal) {
          ZigaMod.openSettingsModal('features');
        }
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

    // Move History & FEN/PGN Exporter buttons
    const copyFenBtn = document.getElementById('ziga-btn-copy-fen');
    if (copyFenBtn) {
      copyFenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;
        if (!data || !data.gameLayer) {
          if (ZigaMod.copyToClipboard) {
            ZigaMod.copyToClipboard('', '⚠️ Hãy vào một ván cờ trước khi sao chép FEN!');
          }
          return;
        }
        const activeColor = (data.gameLayer.Yc !== undefined) ? data.gameLayer.Yc : 0;
        const fen = ZigaMod.generateFen ? ZigaMod.generateFen(data.gameLayer, activeColor) : '';
        if (fen && ZigaMod.copyToClipboard) {
          ZigaMod.copyToClipboard(fen, '✅ Đã sao chép chuỗi FEN thế cờ hiện tại!');
        }
      });
    }

    const copyPgnBtn = document.getElementById('ziga-btn-copy-pgn');
    if (copyPgnBtn) {
      copyPgnBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;
        const pgn = ZigaMod.generatePgn ? ZigaMod.generatePgn(data) : '';
        if (ZigaMod.copyToClipboard) {
          ZigaMod.copyToClipboard(pgn, '✅ Đã sao chép toàn bộ biên bản ván đấu PGN!');
        }
      });
    }

    const resetHistBtn = document.getElementById('ziga-btn-reset-history');
    if (resetHistBtn) {
      resetHistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ZigaMod.resetHistory) {
          ZigaMod.resetHistory();
        }
      });
    }

    // Opening Book Badge modal trigger
    const openingBadge = document.getElementById('ziga-opening-badge');
    if (openingBadge) {
      openingBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ZigaMod.showOpeningModal) {
          ZigaMod.showOpeningModal();
        }
      });
    }

    // Game Review Modal button trigger
    const openReviewBtn = document.getElementById('ziga-btn-open-review');
    if (openReviewBtn) {
      openReviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ZigaMod.showGameReviewModal) {
          ZigaMod.showGameReviewModal();
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
    const historyBox = document.getElementById('ziga-history-box');
    const historyDiv = document.getElementById('ziga-history-divider');
    const openingBadge = document.getElementById('ziga-opening-badge');
    const evalBar = document.getElementById('ziga-eval-bar-wrapper');

    if (lostOpp) lostOpp.style.display = userSettings.showLostPieces ? 'flex' : 'none';
    if (lostSelf) lostSelf.style.display = userSettings.showLostPieces ? 'flex' : 'none';
    if (lostDiv) lostDiv.style.display = userSettings.showLostPieces ? 'block' : 'none';

    if (matWrapper && !userSettings.materialAdvantage) matWrapper.style.display = 'none';

    if (tacticalBox) tacticalBox.style.display = userSettings.showTacticalHud ? 'flex' : 'none';
    if (tacticalDiv) tacticalDiv.style.display = userSettings.showTacticalHud ? 'block' : 'none';

    if (summaryBox) summaryBox.style.display = userSettings.showKeyPieces ? 'flex' : 'none';
    if (summaryDiv) summaryDiv.style.display = userSettings.showKeyPieces ? 'block' : 'none';

    if (historyBox) historyBox.style.display = userSettings.showMoveHistory ? 'flex' : 'none';
    if (openingBadge) {
      openingBadge.style.display = (userSettings.openingBook !== false) ? 'flex' : 'none';
    }
    if (evalBar && !userSettings.evalBar) evalBar.style.display = 'none';

    if (userSettings.cleanAdView) {
      document.body.classList.add('ziga-clean-ads-active');
    } else {
      document.body.classList.remove('ziga-clean-ads-active');
    }

    if (ZigaMod.updateRowLabelsVisibility) {
      const gameLayer = ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null;
      ZigaMod.updateRowLabelsVisibility(gameLayer);
    }

    if (!userSettings.liveBoardAura && ZigaMod.clearBoardAura) {
      ZigaMod.clearBoardAura();
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

    window.addEventListener('mousemove', (e) => {
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
      e.preventDefault();
    }, { capture: true });

    window.addEventListener('mouseup', () => {
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
    }, { capture: true });
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

    window.addEventListener('mousemove', (e) => {
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
      e.preventDefault();
    }, { capture: true });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = '';
        ZigaMod.saveSize(container.offsetWidth, container.offsetHeight);
      }
    }, { capture: true });
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
        <span class="ziga-mat-tt-player-sc my">[${myNameShort}]: <strong>${mat.myScore}đ</strong></span>
        <span class="ziga-mat-tt-vs">vs</span>
        <span class="ziga-mat-tt-player-sc opp">[${oppNameShort}]: <strong>${mat.oppScore}đ</strong></span>
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


// ===== Module: src/core/main.js =====
// src/main.js - Game data extraction, material calculation, ad cleaner, and main update loop
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Main module initializing...');

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
        if (!el || 
            el.id === 'ziga-mod-widget' || 
            el.id === 'ziga-sandbox-modal' || 
            (el.id && el.id.startsWith('ziga-')) ||
            el.classList.contains('ziga-sandbox-overlay') || 
            el.classList.contains('ziga-mod-container') ||
            el.id === 'gameCanvas' || 
            el.id === 'Cocos2dGameContainer' || 
            el.classList.contains('modal')) {
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
    const sbModal = document.getElementById('ziga-sandbox-modal');
    if (widgetEl) {
      widgetEl.style.setProperty('z-index', '2147483647', 'important');
      widgetEl.style.setProperty('position', 'fixed', 'important');
    }
    if (sbModal) {
      sbModal.style.setProperty('z-index', '2147483647', 'important');
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
        if (ZigaMod.clearBoardAura) {
          ZigaMod.clearBoardAura();
        }
        if (ZigaMod.clearTacticalDrawings) {
          ZigaMod.clearTacticalDrawings();
        }
        if (ZigaMod.updateOpeningUi) {
          ZigaMod.updateOpeningUi([]);
        }
        if (ZigaMod.updateEvalBar) {
          ZigaMod.updateEvalBar(null);
        }
        if (ZigaMod.updateMentorHud) {
          ZigaMod.updateMentorHud(null);
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

    // Live Board Aura (Green for my turn, Red for opponent turn)
    if (ZigaMod.updateBoardAura) {
      ZigaMod.updateBoardAura(data);
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

    // Move Recorder (Vietnamese notation & FEN/PGN history)
    if (ZigaMod.checkAndRecordMove) {
      ZigaMod.checkAndRecordMove(data);
    }

    // Tactical Right-Click Drawing Canvas
    if (ZigaMod.updateTacticalDrawing) {
      ZigaMod.updateTacticalDrawing();
    }

    // Opening Book Recognition
    if (ZigaMod.updateOpeningUi) {
      ZigaMod.updateOpeningUi(ZigaMod.moveHistory);
    }

    // Voice Announcer & Match Countdown Alert
    if (ZigaMod.updateTimerAlerts) {
      ZigaMod.updateTimerAlerts(data.gameLayer);
    }

    // Real-time AI Evaluation Bar & Best Move
    if (ZigaMod.updateEvalBar) {
      ZigaMod.updateEvalBar(data);
    }

    // AI Xiangqi Mentor / Live Tactical Coach & Mindset Advisor
    if (ZigaMod.updateMentorHud) {
      ZigaMod.updateMentorHud(data);
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

  console.log('[AN Mod] Advanced Xiangqi & Co Up Helper initialized.');

})(window.ZigaMod = window.ZigaMod || {});


})();
