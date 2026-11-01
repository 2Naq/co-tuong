// src/constants.js - Chess piece definitions, display order, and default settings

// Chess piece definitions
// Type ID in Ziga: 0: Tướng, 1: Sĩ, 2: Tượng, 3: Xe, 4: Pháo, 5: Mã, 6: Tốt
export const PIECE_DEFS = {
  0: {
    name: "Tướng",
    redChar: "帥",
    blackChar: "將",
    value: 0,
    total: 1,
    short: "Tg",
  },
  3: {
    name: "Xe",
    redChar: "俥",
    blackChar: "車",
    value: 9,
    total: 2,
    short: "X",
  },
  4: {
    name: "Pháo",
    redChar: "炮",
    blackChar: "砲",
    value: 4.5,
    total: 2,
    short: "P",
  },
  5: {
    name: "Mã",
    redChar: "傌",
    blackChar: "馬",
    value: 4,
    total: 2,
    short: "M",
  },
  1: {
    name: "Sĩ",
    redChar: "仕",
    blackChar: "士",
    value: 2,
    total: 2,
    short: "S",
  },
  2: {
    name: "Tượng",
    redChar: "相",
    blackChar: "象",
    value: 2,
    total: 2,
    short: "T",
  },
  6: {
    name: "Tốt",
    redChar: "兵",
    blackChar: "卒",
    value: 1.5,
    total: 5,
    short: "B",
  },
};

export const DISPLAY_ORDER = [3, 4, 5, 6, 1, 2, 0];

// Default Settings configuration
export const DEFAULT_SETTINGS = {
  showLostPieces: true, // Hiển thị danh sách quân đã bị ăn
  highlightTactics: true, // Highlight tầm đánh trên bàn cờ khi chọn quân
  highlight: true, // Alias cho highlightTactics
  showTacticalHud: false, // Hiển thị bảng phân tích tầm đánh trên HUD
  showCoUpTracker: false, // Thống kê cờ úp & tính xác suất lật quân
  threatAlert: false, // Cảnh báo quân của bạn đang bị đe dọa / bắt quân
  materialAdvantage: true, // Thanh chênh lệch điểm quân
  showKeyPieces: true, // Thống kê Xe-Pháo-Mã còn lại
  vietnameseLabels: false, // Hiển thị chữ tiếng Việt (X, P, M...) thay vì chữ Hán
  showRowNumbers: true, // Đánh số hàng (1-10) ở 2 bên mép bàn cờ
  rowNumbers: true, // Alias cho showRowNumbers
  cleanAdView: true, // Ẩn bớt quảng cáo che vướng bàn cờ
  showMoveHistory: false, // Ghi biên bản ván đấu chuẩn tiếng Việt & xuất FEN/PGN
  tacticalDrawing: false, // Vẽ mũi tên chiến thuật bằng chuột phải trên bàn cờ
  openingBook: false, // Nhận diện hơn 60 thế khai cuộc cờ tướng kinh điển
  voiceAnnouncer: false, // Giọng đọc tiếng Việt (Chiếu tướng, bắt Xe...)
  timerAlertVoice: true, // Cảnh báo nhịp tim & đếm ngược khi sắp hết giờ
  evalBar: true, // Thanh đo thế trận thời gian thực (Eval Bar)
  bestMoveArrow: false, // Mũi tên gợi ý nước đi tối ưu (Best Move)
  mentorCoach: false, // Gia Sư Cờ Tướng Đồng Hành: Phân tích thế trận, gợi ý kế sách & rèn luyện tư duy
  liveBoardAura: true, // Tự động hiển thị viền xanh/đỏ focus quân có thể ăn trực tiếp trên bàn cờ
  boardAura: true, // Alias cho liveBoardAura
  liveAuraMode: "targets", // 'targets': Chỉ quân cờ có thể ăn được (chuẩn xác, gọn gàng), 'all': Cả quân ăn và bị ăn
  auraCustom: {
    mode: "neon", // 'neon' hoặc 'image'
    theme: "default", // 'default', 'ice_fire', 'gold_purple', 'cyberpunk', 'jade_crimson', 'thunder_magma', 'royal_blood', 'toxic_violet', 'custom'
    animation: "spin", // 'spin_pulse', 'spin', 'pulse', 'heartbeat', 'static'
    spinSpeed: 3.5, // Thời gian 1 vòng quay 360° (1.0s - 8.0s, mặc định 3.5s)
    myColor: "#39ff14", // Màu viền lượt tôi
    oppColor: "#ff1744", // Màu viền lượt đối thủ
    presetMy: "", // ID mẫu Aura có sẵn lượt tôi (nếu dùng preset)
    presetOpp: "", // ID mẫu Aura có sẵn lượt đối thủ (nếu dùng preset)
    customImageMy: "", // Base64 DataURL ảnh PNG tùy chọn lượt tôi
    customImageOpp: "", // Base64 DataURL ảnh PNG tùy chọn lượt đối thủ
    scale: 1.0, // Tỷ lệ độ lớn vòng Aura (0.7 đến 1.3, mặc định 1.0)
  },
  hudStyle: {
    preset: "default_orange",
    customColor: "#f97316",
    bgMode: "glass", // 'glass' (Kính mờ), 'solid' (Đặc), 'clear' (Trong suốt)
    borderGlow: true, // Hiệu ứng viền neon phát sáng
    borderRadius: "rounded_xl", // 'rounded_xl', 'rounded_lg', 'rounded_sm'
    cardOpacity: "default", // 'default', 'transparent', 'solid'
    hudScale: 1.0, // Tỷ lệ thu phóng HUD (0.85 - 1.15)
  },
};

export const DEFAULT_HUD_STYLE = {
  preset: "default_orange",
  customColor: "#f97316",
  bgMode: "glass",
  borderGlow: true,
  borderRadius: "rounded_xl",
  cardOpacity: "default",
  hudScale: 1.0,
};

export const HUD_STYLE_PRESETS = [
  {
    id: "default_orange",
    name: "Cam Ziga",
    color: "#f97316",
    desc: "Màu cam rực rỡ đặc trưng phong cách Ziga",
  },
  {
    id: "cyber_cyan",
    name: "Thần Long Lam",
    color: "#06b6d4",
    desc: "Xanh Cyan ma pháp lôi điện, sắc sảo",
  },
  {
    id: "crimson_red",
    name: "Huyết Nguyệt",
    color: "#ef4444",
    desc: "Đỏ chiến ý cuồn cuộn, khí thế áp đảo",
  },
  {
    id: "emerald_jade",
    name: "Ngọc Lục Bảo",
    color: "#10b981",
    desc: "Xanh ngọc điềm tĩnh, tĩnh tâm kỳ đạo",
  },
  {
    id: "imperial_gold",
    name: "Hoàng Kim",
    color: "#eab308",
    desc: "Vàng kim quý phái, quyền uy hoàng gia",
  },
  {
    id: "neon_purple",
    name: "Tử Điện",
    color: "#a855f7",
    desc: "Tím huyền ảo, bí ẩn và cuốn hút",
  },
  {
    id: "sakura_pink",
    name: "Hồng Anh Đào",
    color: "#ec4899",
    desc: "Hồng tinh tế thanh nhã, nổi bật độc đáo",
  },
  {
    id: "pure_oled",
    name: "Hắc Ám OLED",
    color: "#64748b",
    desc: "Đen tuyền sâu thẳm, tối giản tập trung",
  },
];

export const AURA_THEMES = {
  default: {
    id: "default",
    name: "JJ Xiangqi Stream",
    myColor: "#39ff14",
    oppColor: "#ff1744",
    desc: "Xanh Lá Neon & Đỏ Neon (Mặc định)",
  },
  ice_fire: {
    id: "ice_fire",
    name: "Băng & Lửa",
    myColor: "#00e5ff",
    oppColor: "#ff3d00",
    desc: "Xanh Băng Tuyết & Đỏ Cam Lửa",
  },
  gold_purple: {
    id: "gold_purple",
    name: "Hoàng Kim & Hắc Ám",
    myColor: "#ffd700",
    oppColor: "#d500f9",
    desc: "Vàng Kim & Tím Thần Bí",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    myColor: "#00f0ff",
    oppColor: "#ff007f",
    desc: "Xanh Cyan & Hồng Neon",
  },
  jade_crimson: {
    id: "jade_crimson",
    name: "Ngọc Bích & Chu Sa",
    myColor: "#00ff9d",
    oppColor: "#ff1e56",
    desc: "Xanh Ngọc Lục Bảo & Đỏ Huyết Kiếm",
  },
  thunder_magma: {
    id: "thunder_magma",
    name: "Lôi Điện & Dung Nham",
    myColor: "#38bdf8",
    oppColor: "#f97316",
    desc: "Xanh Tia Chớp & Cam Dung Nham",
  },
  royal_blood: {
    id: "royal_blood",
    name: "Đế Vương & Huyết Nguyệt",
    myColor: "#facc15",
    oppColor: "#ef4444",
    desc: "Vàng Long Bào & Đỏ Huyết Nguyệt",
  },
  toxic_violet: {
    id: "toxic_violet",
    name: "Lục Quang & Tử Tinh",
    myColor: "#a3e635",
    oppColor: "#c026d3",
    desc: "Xanh Lục Quang & Tím Ma Giới",
  },
};

export const AURA_ANIMATIONS = {
  spin_pulse: {
    id: "spin_pulse",
    name: "Xoay Tròn & Chớp Nháy",
    desc: "Vừa quay 360° vừa thở nhịp nhàng",
  },
  spin: {
    id: "spin",
    name: "Xoay Tròn 360° Liên Tục",
    desc: "Vòng quay ma pháp luân chuyển 360° mượt mà",
  },
  pulse: {
    id: "pulse",
    name: "Chớp Nháy Hơi Thở (Pulse)",
    desc: "Phóng to thu nhỏ tỏa sáng nhịp nhàng",
  },
  heartbeat: {
    id: "heartbeat",
    name: "Nhịp Tim Dồn Dập (Heartbeat)",
    desc: "Đập thình thịch 2 nhịp cảnh báo kịch tính",
  },
  static: {
    id: "static",
    name: "Tĩnh (Không Chuyển Động)",
    desc: "Vòng hào quang đứng yên tỏa sáng nhẹ",
  },
};

// Coordinate converter according to standard Vietnamese Xiangqi notation:
// - Bên Đỏ: Cột 1..9 từ PHẢI sang TRÁI (9 - col), Hàng 1..10 từ DƯỚI lên TRÊN (row + 1)
// - Bên Đen: Cột 1..9 từ PHẢI sang TRÁI của Đen (col + 1), Hàng 1..10 từ TRÊN xuống DƯỚI (10 - row)
export function formatXiangqiCoord(col, row, color) {
  if (color === 0) {
    const c = 9 - col;
    const r = row + 1;
    return {
      col: c,
      row: r,
      text: `C${c}·H${r}`,
      fullText: `Cột ${c}, Hàng ${r}`,
    };
  } else {
    const c = col + 1;
    const r = 10 - row;
    return {
      col: c,
      row: r,
      text: `C${c}·H${r}`,
      fullText: `Cột ${c}, Hàng ${r}`,
    };
  }
}

// Export to global ZigaMod namespace for legacy runtime compatibility
if (typeof window !== "undefined") {
  const ZigaMod = (window.ZigaMod = window.ZigaMod || {});
  ZigaMod.PIECE_DEFS = PIECE_DEFS;
  ZigaMod.DISPLAY_ORDER = DISPLAY_ORDER;
  ZigaMod.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
  ZigaMod.DEFAULT_HUD_STYLE = DEFAULT_HUD_STYLE;
  ZigaMod.HUD_STYLE_PRESETS = HUD_STYLE_PRESETS;
  ZigaMod.AURA_THEMES = AURA_THEMES;
  ZigaMod.AURA_ANIMATIONS = AURA_ANIMATIONS;
  ZigaMod.formatXiangqiCoord = formatXiangqiCoord;
}
