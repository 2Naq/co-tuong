// src/features/xiangqi_fen.js - Xiangqi FEN & UCI Coordinate Serializer / Deserializer
// Conforms to AN Xiangqi AI Agent Specification (04-rules.md §1, §7 & 09-pikafish.md §3)

const FEN_PIECE_TO_TYPE = {
  k: { type: 0, color: 1 },
  a: { type: 1, color: 1 },
  b: { type: 2, color: 1 },
  r: { type: 3, color: 1 },
  c: { type: 4, color: 1 },
  n: { type: 5, color: 1 },
  p: { type: 6, color: 1 },
  K: { type: 0, color: 0 },
  A: { type: 1, color: 0 },
  B: { type: 2, color: 0 },
  R: { type: 3, color: 0 },
  C: { type: 4, color: 0 },
  N: { type: 5, color: 0 },
  P: { type: 6, color: 0 },
};

const TYPE_TO_FEN_CHAR = [
  ["K", "k"], // 0: King
  ["A", "a"], // 1: Advisor
  ["B", "b"], // 2: Bishop
  ["R", "r"], // 3: Rook
  ["C", "c"], // 4: Cannon
  ["N", "n"], // 5: Knight
  ["P", "p"], // 6: Pawn
];

export const START_FEN =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";

/**
 * Converts internal pieces array + side to Xiangqi standard FEN string.
 * @param {Array<{col: number, row: number, type: number, color: number}>} pieces
 * @param {number} side 0 for Red, 1 for Black
 * @param {number} halfmoveClock
 * @param {number} fullmoveNumber
 * @returns {string} FEN string
 */
export function piecesToFen(pieces, side = 0, halfmoveClock = 0, fullmoveNumber = 1) {
  const grid = Array.from({ length: 10 }, () => new Array(9).fill(null));

  for (const pc of pieces || []) {
    if (pc.col >= 0 && pc.col <= 8 && pc.row >= 0 && pc.row <= 9) {
      grid[pc.row][pc.col] = pc;
    }
  }

  const fenRows = [];
  // FEN row 9 (Black baseline) down to row 0 (Red baseline)
  for (let r = 9; r >= 0; r--) {
    let emptyCount = 0;
    let rowStr = "";
    for (let c = 0; c <= 8; c++) {
      const pc = grid[r][c];
      if (!pc) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowStr += emptyCount;
          emptyCount = 0;
        }
        const colorIdx = pc.color === 0 ? 0 : 1;
        const char = TYPE_TO_FEN_CHAR[pc.type]?.[colorIdx] || "P";
        rowStr += char;
      }
    }
    if (emptyCount > 0) {
      rowStr += emptyCount;
    }
    fenRows.push(rowStr);
  }

  const activeColor = side === 1 ? "b" : "w";
  return `${fenRows.join("/")} ${activeColor} - - ${halfmoveClock} ${fullmoveNumber}`;
}

/**
 * Parses a standard Xiangqi FEN string into pieces array and side.
 * @param {string} fen
 * @returns {{ pieces: Array<{col: number, row: number, type: number, color: number}>, side: number, halfmoveClock: number, fullmoveNumber: number }}
 */
export function fenToPieces(fen) {
  if (!fen || typeof fen !== "string") {
    return { pieces: [], side: 0, halfmoveClock: 0, fullmoveNumber: 1 };
  }

  const parts = fen.trim().split(/\s+/);
  const rows = parts[0].split("/");
  const activeColor = parts[1] || "w";
  const halfmoveClock = parseInt(parts[4], 10) || 0;
  const fullmoveNumber = parseInt(parts[5], 10) || 1;

  const pieces = [];

  for (let fenRowIdx = 0; fenRowIdx < rows.length && fenRowIdx < 10; fenRowIdx++) {
    const r = 9 - fenRowIdx; // Row 0 of FEN is row 9 on board
    const rowStr = rows[fenRowIdx];
    let c = 0;

    for (let i = 0; i < rowStr.length && c <= 8; i++) {
      const char = rowStr[i];
      if (char >= "1" && char <= "9") {
        c += parseInt(char, 10);
      } else if (FEN_PIECE_TO_TYPE[char]) {
        const { type, color } = FEN_PIECE_TO_TYPE[char];
        pieces.push({ col: c, row: r, type, color });
        c++;
      }
    }
  }

  const side = activeColor.toLowerCase() === "b" ? 1 : 0;
  return { pieces, side, halfmoveClock, fullmoveNumber };
}

/**
 * Converts UCI move string (e.g. "b2e2", "h2e2", "b0c2") to coordinate object.
 * @param {string} uci
 * @returns {{ fromCol: number, fromRow: number, toCol: number, toRow: number } | null}
 */
export function uciToMove(uci) {
  if (!uci || typeof uci !== "string" || uci.length < 4) return null;
  const fromCol = uci.charCodeAt(0) - 97; // 'a' -> 0, 'b' -> 1
  const fromRow = parseInt(uci[1], 10);
  const toCol = uci.charCodeAt(2) - 97;
  const toRow = parseInt(uci[3], 10);

  if (
    fromCol < 0 ||
    fromCol > 8 ||
    fromRow < 0 ||
    fromRow > 9 ||
    toCol < 0 ||
    toCol > 8 ||
    toRow < 0 ||
    toRow > 9
  ) {
    return null;
  }

  return { fromCol, fromRow, toCol, toRow };
}

/**
 * Converts coordinate object to UCI move string (e.g. "b2e2").
 * @param {{ fromCol: number, fromRow: number, toCol: number, toRow: number }} move
 * @returns {string}
 */
export function moveToUci(move) {
  if (!move || move.fromCol == null || move.fromRow == null || move.toCol == null || move.toRow == null) {
    return "";
  }
  const fc = String.fromCharCode(97 + move.fromCol);
  const fr = move.fromRow;
  const tc = String.fromCharCode(97 + move.toCol);
  const tr = move.toRow;
  return `${fc}${fr}${tc}${tr}`;
}

