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
    highlightTactics: true,      // Highlight tầm ăn trên bàn cờ khi chọn quân
    showTacticalHud: true,       // Hiển thị bảng phân tích tầm ăn trên HUD
    showCoUpTracker: true,       // Thống kê cờ úp & tính xác suất lật quân
    threatAlert: true,           // Cảnh báo quân của bạn đang bị đe dọa / bắt quân
    materialAdvantage: true,     // Thanh chênh lệch điểm quân
    showKeyPieces: true,         // Thống kê Xe-Pháo-Mã còn lại
    vietnameseLabels: false,     // Hiển thị chữ tiếng Việt (X, P, M...) thay vì chữ Hán
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
