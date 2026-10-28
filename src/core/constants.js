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
    liveBoardAura: true,         // Tự động hiển thị viền xanh/đỏ focus quân có thể ăn trực tiếp trên bàn cờ
    liveAuraMode: 'targets',     // 'targets': Chỉ quân cờ có thể ăn được (chuẩn xác, gọn gàng), 'all': Cả quân ăn và bị ăn
    auraCustom: {
      mode: 'neon',              // 'neon' hoặc 'image'
      theme: 'default',          // 'default', 'ice_fire', 'gold_purple', 'cyberpunk', 'custom'
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
  ZigaMod.formatXiangqiCoord = formatXiangqiCoord;

})(window.ZigaMod = window.ZigaMod || {});
