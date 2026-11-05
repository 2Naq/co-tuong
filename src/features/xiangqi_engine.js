// src/features/xiangqi_engine.js - Grandmaster Xiangqi Search Engine for AI Mentor
//
// Kiến trúc (Pikafish / ElephantEye / XQWLight inspired):
//   - Bàn cờ mảng phẳng 90 ô (sq = row * 9 + col), Đỏ ở hàng 0..2, Đen ở hàng 7..9.
//   - Mã quân: type + 1 (1 Tướng, 2 Sĩ, 3 Tượng, 4 Xe, 5 Pháo, 6 Mã, 7 Tốt); Đỏ dương, Đen âm.
//   - Zobrist Hashing 64-bit qua cặp Uint32Array (hashLo, hashHi) cập nhật O(1) tăng dần.
//   - Transposition Table (TT) 2^18 entries phẳng TypedArray, zero-GC, chuẩn hóa Mate.
//   - Tìm kiếm PVS (Principal Variation Search) + Null-Move Pruning + Late Move Reductions (LMR).
//   - Sắp xếp nước đi 6 tầng (TT Move, MVV-LVA, Killer Moves, History Heuristic).
//   - Hàm đánh giá Đại Kiện Tướng: Tapered Game Phase, King Safety (phạt khuyết Sĩ khi địch còn Xe),
//     Pháo Trống (Hollow Cannon), Pháo Đầu (Central Cannon), Cản chân Mã, và Xe Lộ Thông.
//   - Sách Khai cuộc Tinh hoa (Opening Book) nhúng trực tiếp, hỗ trợ nén đối xứng gương.
//   - Hệ thống giải thích tư duy (Explainable Tactical Tags & Evaluation Breakdown).
//
// QUAN TRỌNG: Toàn bộ engine nằm trọn trong MỘT hàm factory không tham chiếu biến bên ngoài,
// để tương thích hoàn toàn Function.toString() khi chạy trong Web Worker qua Blob URL.

export function createXiangqiEngine() {
  "use strict";

  const MATE = 10000;
  const INF = 32000;
  const MAXPLY = 64;

  // ---------------------------------------------------------------------------
  // Piece-Square Tables (góc nhìn Đỏ; hàng t = 0 là hàng đáy Đen, t = 9 là hàng đáy Đỏ)
  // ---------------------------------------------------------------------------
  const Z = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const PST_KING = [
    Z,
    Z,
    Z,
    Z,
    Z,
    Z,
    Z,
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 11, 15, 11, 0, 0, 0],
  ];
  const PST_ADVISOR = [
    Z,
    Z,
    Z,
    Z,
    Z,
    Z,
    Z,
    [0, 0, 0, 20, 0, 20, 0, 0, 0],
    [0, 0, 0, 0, 23, 0, 0, 0, 0],
    [0, 0, 0, 20, 0, 20, 0, 0, 0],
  ];
  const PST_BISHOP = [
    Z,
    Z,
    Z,
    Z,
    Z,
    [0, 0, 20, 0, 0, 0, 20, 0, 0],
    Z,
    [18, 0, 0, 0, 23, 0, 0, 0, 18],
    Z,
    [0, 0, 20, 0, 0, 0, 20, 0, 0],
  ];
  const PST_ROOK = [
    [206, 208, 207, 213, 214, 213, 207, 208, 206],
    [206, 212, 209, 216, 233, 216, 209, 212, 206],
    [206, 208, 207, 214, 216, 214, 207, 208, 206],
    [206, 213, 213, 216, 216, 216, 213, 213, 206],
    [208, 211, 211, 214, 215, 214, 211, 211, 208],
    [208, 212, 212, 214, 215, 214, 212, 212, 208],
    [204, 209, 204, 212, 214, 212, 204, 209, 204],
    [198, 208, 204, 212, 212, 212, 204, 208, 198],
    [200, 208, 206, 212, 200, 212, 206, 208, 200],
    [194, 206, 204, 212, 200, 212, 204, 206, 194],
  ];
  const PST_CANNON = [
    [100, 100, 96, 91, 90, 91, 96, 100, 100],
    [98, 98, 96, 92, 89, 92, 96, 98, 98],
    [97, 97, 96, 91, 92, 91, 96, 97, 97],
    [96, 99, 99, 98, 100, 98, 99, 99, 96],
    [96, 96, 96, 96, 100, 96, 96, 96, 96],
    [95, 96, 99, 96, 100, 96, 99, 96, 95],
    [96, 96, 96, 96, 96, 96, 96, 96, 96],
    [97, 96, 100, 99, 101, 99, 100, 96, 97],
    [96, 97, 98, 98, 98, 98, 98, 97, 96],
    [96, 96, 97, 99, 99, 99, 97, 96, 96],
  ];
  const PST_KNIGHT = [
    [90, 90, 90, 96, 90, 96, 90, 90, 90],
    [90, 96, 103, 97, 94, 97, 103, 96, 90],
    [92, 98, 99, 103, 99, 103, 99, 98, 92],
    [93, 108, 100, 107, 100, 107, 100, 108, 93],
    [90, 100, 99, 103, 104, 103, 99, 100, 90],
    [90, 98, 101, 102, 103, 102, 101, 98, 90],
    [92, 94, 98, 95, 98, 95, 98, 94, 92],
    [93, 92, 94, 95, 92, 95, 94, 92, 93],
    [85, 90, 92, 93, 78, 93, 92, 90, 85],
    [88, 85, 90, 88, 90, 88, 90, 85, 88],
  ];
  const PST_PAWN = [
    [9, 9, 9, 11, 13, 11, 9, 9, 9],
    [19, 24, 34, 42, 44, 42, 34, 24, 19],
    [19, 24, 32, 37, 37, 37, 32, 24, 19],
    [19, 23, 27, 29, 30, 29, 27, 23, 19],
    [14, 18, 20, 27, 29, 27, 20, 18, 14],
    [7, 0, 13, 0, 16, 0, 13, 0, 7],
    [7, 0, 7, 0, 15, 0, 7, 0, 7],
    Z,
    Z,
    Z,
  ];
  const PST = [
    null,
    PST_KING,
    PST_ADVISOR,
    PST_BISHOP,
    PST_ROOK,
    PST_CANNON,
    PST_KNIGHT,
    PST_PAWN,
  ];

  // VAL[p + 7][sq]: giá trị PST tích hợp sẵn cho quân p tại sq
  const VAL = [];
  for (let p = -7; p <= 7; p++) {
    const arr = new Int16Array(90);
    if (p !== 0) {
      const code = p > 0 ? p : -p;
      for (let sq = 0; sq < 90; sq++) {
        const c = sq % 9;
        const r = (sq / 9) | 0;
        arr[sq] = p > 0 ? PST[code][9 - r][c] : PST[code][r][8 - c];
      }
    }
    VAL.push(arr);
  }

  // Giá trị thô cho MVV-LVA
  const ORDER_VAL = [0, 100, 2, 2, 9, 5, 4, 1];

  // ---------------------------------------------------------------------------
  // 1. ZOBRIST HASHING (64-bit qua cặp Uint32Array) & PRNG CỐ ĐỊNH
  // ---------------------------------------------------------------------------
  let rngSeed = 0x12345678;
  function rand32() {
    rngSeed ^= rngSeed << 13;
    rngSeed ^= rngSeed >>> 17;
    rngSeed ^= rngSeed << 5;
    return rngSeed >>> 0;
  }

  const ZOBRIST_SIZE = 15 * 90;
  const zobristLo = new Uint32Array(ZOBRIST_SIZE);
  const zobristHi = new Uint32Array(ZOBRIST_SIZE);
  for (let i = 0; i < ZOBRIST_SIZE; i++) {
    zobristLo[i] = rand32();
    zobristHi[i] = rand32();
  }
  const sideLo = rand32();
  const sideHi = rand32();

  let hashLo = 0 >>> 0;
  let hashHi = 0 >>> 0;

  // Lịch sử lặp nước (Repetition History)
  const repHistLo = new Uint32Array(512);
  const repHistHi = new Uint32Array(512);
  let gamePly = 0;

  function isRepetition(ply) {
    if (ply <= 1) return false;
    for (let i = gamePly - 2; i >= gamePly - ply && i >= 0; i -= 2) {
      if (repHistLo[i] === hashLo && repHistHi[i] === hashHi) {
        return true;
      }
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // 2. TRANSPOSITION TABLE (2^18 = 262,144 entries, Flat TypedArrays)
  // ---------------------------------------------------------------------------
  const TT_SIZE = 1 << 18; // 262,144 entries (~4MB RAM)
  const TT_MASK = TT_SIZE - 1;

  const ttKeyHi = new Uint32Array(TT_SIZE);
  const ttMove = new Uint16Array(TT_SIZE);
  const ttScore = new Int16Array(TT_SIZE);
  const ttDepth = new Int8Array(TT_SIZE);
  const ttFlag = new Uint8Array(TT_SIZE);

  const TT_EMPTY = 0;
  const TT_EXACT = 1;
  const TT_LOWER = 2; // Beta cutoff (score >= beta)
  const TT_UPPER = 3; // Alpha fail-low (score <= alpha)

  let ttHits = 0;
  let probeCutoff = false;
  let probeScore = 0;
  let probeMove = 0;

  function ttProbe(ply, alpha, beta, depth) {
    const idx = hashLo & TT_MASK;
    const expectedKey = (hashHi ^ hashLo) >>> 0;
    if (ttKeyHi[idx] !== expectedKey || ttFlag[idx] === TT_EMPTY) {
      probeCutoff = false;
      probeScore = 0;
      probeMove = 0;
      return false;
    }
    ttHits++;
    probeMove = ttMove[idx];
    let score = ttScore[idx];

    // Chuẩn hóa điểm sát cục
    if (score > MATE - 200) score -= ply;
    else if (score < -MATE + 200) score += ply;
    probeScore = score;

    if (ttDepth[idx] >= depth) {
      const flag = ttFlag[idx];
      if (flag === TT_EXACT) {
        probeCutoff = true;
        return true;
      }
      if (flag === TT_LOWER && score >= beta) {
        probeCutoff = true;
        return true;
      }
      if (flag === TT_UPPER && score <= alpha) {
        probeCutoff = true;
        return true;
      }
    }
    probeCutoff = false;
    return true;
  }

  function ttStore(ply, depth, score, flag, move) {
    const idx = hashLo & TT_MASK;
    const expectedKey = (hashHi ^ hashLo) >>> 0;
    const keyChanged = ttKeyHi[idx] !== expectedKey;
    if (
      ttFlag[idx] === TT_EMPTY ||
      depth >= ttDepth[idx] ||
      keyChanged
    ) {
      let storedScore = score;
      if (score > MATE - 200) storedScore = score + ply;
      else if (score < -MATE + 200) storedScore = score - ply;

      ttKeyHi[idx] = expectedKey;
      if (move !== 0) {
        ttMove[idx] = move;
      } else if (keyChanged) {
        ttMove[idx] = 0;
      }
      ttScore[idx] = storedScore;
      ttDepth[idx] = depth;
      ttFlag[idx] = flag;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. TRẠNG THÁI BÀN CỜ & ZERO-ALLOCATION MOVE BUFFER
  // ---------------------------------------------------------------------------
  const board = new Int8Array(90);
  const kingSq = [-1, -1];
  let vl = [0, 0];
  const majors = [0, 0];

  let nodes = 0;
  let deadline = 0;
  let stop = false;
  let canStop = false;

  const killers = [];
  for (let i = 0; i < MAXPLY; i++) killers.push([0, 0]);
  const history = new Int32Array(128 * 90);
  const pvTable = [];
  for (let i = 0; i < MAXPLY; i++) pvTable.push(new Int32Array(MAXPLY));
  const pvLen = new Int32Array(MAXPLY);
  let prevPV = [];

  const MOVE_BUF_LEN = MAXPLY * 128;
  const moveBuf = new Uint16Array(MOVE_BUF_LEN);
  const scoreBuf = new Int32Array(MOVE_BUF_LEN);
  const moveBase = new Int16Array(MAXPLY + 1);
  const moveLen = new Int16Array(MAXPLY + 1);
  for (let p = 0; p <= MAXPLY; p++) {
    moveBase[p] = p * 128;
  }

  let boardFlipped = false;

  function setup(piecesInput, history) {
    board.fill(0);
    kingSq[0] = -1;
    kingSq[1] = -1;
    vl = [0, 0];
    majors[0] = 0;
    majors[1] = 0;
    hashLo = 0 >>> 0;
    hashHi = 0 >>> 0;
    gamePly = 0;
    boardFlipped = false;

    let pieces = piecesInput;
    if (typeof piecesInput === "string") {
      pieces = [];
      const parts = piecesInput.trim().split(/\s+/);
      const rows = parts[0].split("/");
      const fenMap = {
        k: [0, 1],
        a: [1, 1],
        b: [2, 1],
        r: [3, 1],
        c: [4, 1],
        n: [5, 1],
        p: [6, 1],
        K: [0, 0],
        A: [1, 0],
        B: [2, 0],
        R: [3, 0],
        C: [4, 0],
        N: [5, 0],
        P: [6, 0],
      };
      for (let fRow = 0; fRow < rows.length && fRow < 10; fRow++) {
        const r = 9 - fRow;
        const rowStr = rows[fRow];
        let c = 0;
        for (let i = 0; i < rowStr.length && c <= 8; i++) {
          const ch = rowStr[i];
          if (ch >= "1" && ch <= "9") {
            c += ch.charCodeAt(0) - 48;
          } else if (fenMap[ch]) {
            const [t, col] = fenMap[ch];
            pieces.push({ col: c, row: r, type: t, color: col });
            c++;
          }
        }
      }
    }

    if (Array.isArray(pieces)) {
      // Auto-detect if coordinates are passed inverted (e.g. Red at row 7..9 or Black at row 0..2)
      for (const pc of pieces) {
        if (pc.type === 0 && pc.color === 0 && pc.row >= 7) {
          boardFlipped = true;
          break;
        }
        if (pc.type === 0 && pc.color === 1 && pc.row <= 2) {
          boardFlipped = true;
          break;
        }
      }

      for (const pc of pieces) {
        if (pc.col < 0 || pc.col > 8 || pc.row < 0 || pc.row > 9) continue;
        const actualRow = boardFlipped ? 9 - pc.row : pc.row;
        const actualCol = boardFlipped ? 8 - pc.col : pc.col;
        const sq = actualRow * 9 + actualCol;
        const code = (pc.type | 0) + 1;
        const p = pc.color === 0 ? code : -code;
        board[sq] = p;
        if (code === 1) kingSq[pc.color === 0 ? 0 : 1] = sq;
        vl[pc.color === 0 ? 0 : 1] += VAL[p + 7][sq];
        if (code >= 4 && code <= 6) majors[pc.color === 0 ? 0 : 1]++;

        const zIdx = (p + 7) * 90 + sq;
        hashLo ^= zobristLo[zIdx];
        hashHi ^= zobristHi[zIdx];
      }
    }

    repHistLo[0] = hashLo;
    repHistHi[0] = hashHi;

    if (Array.isArray(history)) {
      for (let i = 0; i < history.length && i < 256; i++) {
        const h = history[i];
        if (typeof h === "object" && h && h.hashLo != null) {
          repHistLo[i] = h.hashLo >>> 0;
          repHistHi[i] = h.hashHi >>> 0;
          gamePly = i + 1;
        }
      }
    }
  }

  function toFen(side) {
    const chars = ["", "K", "A", "B", "R", "C", "N", "P"];
    const rows = [];
    for (let r = 9; r >= 0; r--) {
      let empty = 0;
      let s = "";
      for (let c = 0; c <= 8; c++) {
        const p = board[r * 9 + c];
        if (!p) {
          empty++;
        } else {
          if (empty > 0) {
            s += empty;
            empty = 0;
          }
          const code = p > 0 ? p : -p;
          const ch = chars[code] || "P";
          s += p > 0 ? ch : ch.toLowerCase();
        }
      }
      if (empty > 0) s += empty;
      rows.push(s);
    }
    return rows.join("/") + (side === 1 ? " b - - 0 1" : " w - - 0 1");
  }

  function makeMove(m) {
    const f = m & 127;
    const t = m >> 7;
    const p = board[f];
    const cap = board[t];
    const side = p > 0 ? 0 : 1;

    vl[side] += VAL[p + 7][t] - VAL[p + 7][f];
    if (cap) {
      vl[1 - side] -= VAL[cap + 7][t];
      const capCode = cap > 0 ? cap : -cap;
      if (capCode >= 4 && capCode <= 6) majors[1 - side]--;
    }

    const zF = (p + 7) * 90 + f;
    const zT = (p + 7) * 90 + t;
    hashLo ^= zobristLo[zF] ^ zobristLo[zT];
    hashHi ^= zobristHi[zF] ^ zobristHi[zT];

    if (cap) {
      const zCap = (cap + 7) * 90 + t;
      hashLo ^= zobristLo[zCap];
      hashHi ^= zobristHi[zCap];
    }

    hashLo ^= sideLo;
    hashHi ^= sideHi;

    board[t] = p;
    board[f] = 0;
    if (p === 1) kingSq[0] = t;
    else if (p === -1) kingSq[1] = t;

    gamePly++;
    if (gamePly < 512) {
      repHistLo[gamePly] = hashLo;
      repHistHi[gamePly] = hashHi;
    }

    return cap;
  }

  function unmakeMove(m, cap) {
    const f = m & 127;
    const t = m >> 7;
    const p = board[t];
    const side = p > 0 ? 0 : 1;

    vl[side] -= VAL[p + 7][t] - VAL[p + 7][f];
    if (cap) {
      vl[1 - side] += VAL[cap + 7][t];
      const capCode = cap > 0 ? cap : -cap;
      if (capCode >= 4 && capCode <= 6) majors[1 - side]++;
    }

    const zF = (p + 7) * 90 + f;
    const zT = (p + 7) * 90 + t;
    hashLo ^= zobristLo[zF] ^ zobristLo[zT];
    hashHi ^= zobristHi[zF] ^ zobristHi[zT];

    if (cap) {
      const zCap = (cap + 7) * 90 + t;
      hashLo ^= zobristLo[zCap];
      hashHi ^= zobristHi[zCap];
    }

    hashLo ^= sideLo;
    hashHi ^= sideHi;

    board[f] = p;
    board[t] = cap;
    if (p === 1) kingSq[0] = f;
    else if (p === -1) kingSq[1] = f;

    if (gamePly > 0) gamePly--;
  }

  function makeNullMove() {
    hashLo ^= sideLo;
    hashHi ^= sideHi;
    gamePly++;
    if (gamePly < 512) {
      repHistLo[gamePly] = hashLo;
      repHistHi[gamePly] = hashHi;
    }
  }

  function unmakeNullMove() {
    hashLo ^= sideLo;
    hashHi ^= sideHi;
    if (gamePly > 0) gamePly--;
  }

  // ---------------------------------------------------------------------------
  // 4. HƯỚNG DI CHUYỂN & KIỂM TRA CHIẾU TƯỚNG (INCHECK)
  // ---------------------------------------------------------------------------
  const KNIGHT_D = [
    [1, 2, 0, 1],
    [-1, 2, 0, 1],
    [1, -2, 0, -1],
    [-1, -2, 0, -1],
    [2, 1, 1, 0],
    [2, -1, 1, 0],
    [-2, 1, -1, 0],
    [-2, -1, -1, 0],
  ];
  const ORTHO = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  const DIAG = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  function inCheck(side) {
    const ks = kingSq[side];
    if (ks < 0) return true;
    const kc = ks % 9;
    const kr = (ks / 9) | 0;
    const e = side === 0 ? -1 : 1;

    // Xe / Pháo / Tướng đối mặt
    for (const [dc, dr] of ORTHO) {
      let tc = kc + dc;
      let tr = kr + dr;
      let found = 0;
      while (tc >= 0 && tc <= 8 && tr >= 0 && tr <= 9) {
        const q = board[tr * 9 + tc];
        if (q) {
          if (found === 0) {
            if (q === 4 * e) return true;
            if (q === 1 * e && dc === 0) return true;
            found = 1;
          } else {
            if (q === 5 * e) return true;
            break;
          }
        }
        tc += dc;
        tr += dr;
      }
    }

    // Mã
    for (const [dc, dr] of KNIGHT_D) {
      const ac = kc - dc;
      const ar = kr - dr;
      if (ac < 0 || ac > 8 || ar < 0 || ar > 9) continue;
      if (board[ar * 9 + ac] !== 6 * e) continue;
      const lc = Math.abs(dc) === 2 ? ac + dc / 2 : ac;
      const lr = Math.abs(dc) === 2 ? ar : ar + dr / 2;
      if (!board[lr * 9 + lc]) return true;
    }

    // Tốt
    const front = side === 0 ? kr + 1 : kr - 1;
    if (front >= 0 && front <= 9 && board[front * 9 + kc] === 7 * e)
      return true;
    if (kc > 0 && board[kr * 9 + kc - 1] === 7 * e) return true;
    if (kc < 8 && board[kr * 9 + kc + 1] === 7 * e) return true;

    return false;
  }

  // ---------------------------------------------------------------------------
  // 5. ZERO-ALLOCATION MOVE GENERATION
  // ---------------------------------------------------------------------------
  function generateMoves(side, capOnly, ply) {
    const base = moveBase[ply];
    let count = 0;
    const sign = side === 0 ? 1 : -1;

    for (let sq = 0; sq < 90; sq++) {
      const p = board[sq];
      if (!p || (p > 0 ? 0 : 1) !== side) continue;
      const code = p * sign;
      const c = sq % 9;
      const r = (sq / 9) | 0;

      if (code === 1 || code === 2) {
        const dirs = code === 1 ? ORTHO : DIAG;
        const rMin = side === 0 ? 0 : 7;
        const rMax = side === 0 ? 2 : 9;
        for (const [dc, dr] of dirs) {
          const tc = c + dc;
          const tr = r + dr;
          if (tc >= 3 && tc <= 5 && tr >= rMin && tr <= rMax) {
            const t = tr * 9 + tc;
            const q = board[t];
            if (q) {
              if ((q > 0 ? 0 : 1) !== side)
                moveBuf[base + count++] = sq | (t << 7);
            } else if (!capOnly) {
              moveBuf[base + count++] = sq | (t << 7);
            }
          }
        }
      } else if (code === 3) {
        for (const [dc, dr] of DIAG) {
          const tc = c + 2 * dc;
          const tr = r + 2 * dr;
          if (tc < 0 || tc > 8 || tr < 0 || tr > 9) continue;
          if (side === 0 ? tr > 4 : tr < 5) continue;
          if (board[(r + dr) * 9 + (c + dc)]) continue;
          const t = tr * 9 + tc;
          const q = board[t];
          if (q) {
            if ((q > 0 ? 0 : 1) !== side)
              moveBuf[base + count++] = sq | (t << 7);
          } else if (!capOnly) {
            moveBuf[base + count++] = sq | (t << 7);
          }
        }
      } else if (code === 6) {
        for (const [dc, dr, lc, lr] of KNIGHT_D) {
          const tc = c + dc;
          const tr = r + dr;
          if (tc < 0 || tc > 8 || tr < 0 || tr > 9) continue;
          if (board[(r + lr) * 9 + (c + lc)]) continue;
          const t = tr * 9 + tc;
          const q = board[t];
          if (q) {
            if ((q > 0 ? 0 : 1) !== side)
              moveBuf[base + count++] = sq | (t << 7);
          } else if (!capOnly) {
            moveBuf[base + count++] = sq | (t << 7);
          }
        }
      } else if (code === 4 || code === 5) {
        for (const [dc, dr] of ORTHO) {
          let tc = c + dc;
          let tr = r + dr;
          let screen = false;
          while (tc >= 0 && tc <= 8 && tr >= 0 && tr <= 9) {
            const t = tr * 9 + tc;
            const q = board[t];
            if (code === 4) {
              if (!q) {
                if (!capOnly) moveBuf[base + count++] = sq | (t << 7);
              } else {
                if ((q > 0 ? 0 : 1) !== side)
                  moveBuf[base + count++] = sq | (t << 7);
                break;
              }
            } else if (!screen) {
              if (!q) {
                if (!capOnly) moveBuf[base + count++] = sq | (t << 7);
              } else screen = true;
            } else if (q) {
              if ((q > 0 ? 0 : 1) !== side)
                moveBuf[base + count++] = sq | (t << 7);
              break;
            }
            tc += dc;
            tr += dr;
          }
        }
      } else if (code === 7) {
        const fwd = side === 0 ? 1 : -1;
        const tr = r + fwd;
        if (tr >= 0 && tr <= 9) {
          const t = tr * 9 + c;
          const q = board[t];
          if (q) {
            if ((q > 0 ? 0 : 1) !== side)
              moveBuf[base + count++] = sq | (t << 7);
          } else if (!capOnly) {
            moveBuf[base + count++] = sq | (t << 7);
          }
        }
        const crossed = side === 0 ? r >= 5 : r <= 4;
        if (crossed) {
          if (c > 0) {
            const t = r * 9 + (c - 1);
            const q = board[t];
            if (q) {
              if ((q > 0 ? 0 : 1) !== side)
                moveBuf[base + count++] = sq | (t << 7);
            } else if (!capOnly) {
              moveBuf[base + count++] = sq | (t << 7);
            }
          }
          if (c < 8) {
            const t = r * 9 + (c + 1);
            const q = board[t];
            if (q) {
              if ((q > 0 ? 0 : 1) !== side)
                moveBuf[base + count++] = sq | (t << 7);
            } else if (!capOnly) {
              moveBuf[base + count++] = sq | (t << 7);
            }
          }
        }
      }
    }
    moveLen[ply] = count;
    return count;
  }

  // ---------------------------------------------------------------------------
  // 6. SẮP XẾP NƯỚC ĐI 6 TẦNG (IN-PLACE SELECTION SORT)
  // ---------------------------------------------------------------------------
  function scoreAndOrderMoves(ply, ttMoveChosen) {
    const base = moveBase[ply];
    const count = moveLen[ply];
    const k = killers[ply] || [0, 0];

    for (let i = 0; i < count; i++) {
      const m = moveBuf[base + i];
      let s = 0;
      if (m === ttMoveChosen && ttMoveChosen !== 0) {
        s = 20000000;
      } else {
        const cap = board[m >> 7];
        if (cap) {
          const victim = ORDER_VAL[cap > 0 ? cap : -cap];
          const att = board[m & 127];
          const attVal = ORDER_VAL[att > 0 ? att : -att];
          if (victim > attVal) {
            s = 10000000 + victim * 100 - attVal; // Bắt hơn quân (Tốt ăn Xe, Mã ăn Xe)
          } else if (victim === attVal) {
            s = 7200000 + victim * 100 - attVal;  // Đổi ngang quân (Xếp sau Killer moves để ưu tiên thế công)
          } else {
            s = 3000000 + victim * 100 - attVal;  // Đổi lỗ quân (Chỉ duyệt khi không có nước khác)
          }
        } else if (m === k[0]) {
          s = 9000000;
        } else if (m === k[1]) {
          s = 8000000;
        } else {
          s = history[m];
        }
      }
      scoreBuf[base + i] = s;
    }
  }

  function pickNextMove(ply, startIndex) {
    const base = moveBase[ply];
    const count = moveLen[ply];
    let bestIdx = startIndex;
    let bestScore = scoreBuf[base + startIndex];

    for (let i = startIndex + 1; i < count; i++) {
      if (scoreBuf[base + i] > bestScore) {
        bestScore = scoreBuf[base + i];
        bestIdx = i;
      }
    }

    if (bestIdx !== startIndex) {
      const tmpM = moveBuf[base + startIndex];
      moveBuf[base + startIndex] = moveBuf[base + bestIdx];
      moveBuf[base + bestIdx] = tmpM;

      const tmpS = scoreBuf[base + startIndex];
      scoreBuf[base + startIndex] = scoreBuf[base + bestIdx];
      scoreBuf[base + bestIdx] = tmpS;
    }
    return moveBuf[base + startIndex];
  }

  function legalMoves(side) {
    generateMoves(side, false, 0);
    const count = moveLen[0];
    const out = [];
    for (let i = 0; i < count; i++) {
      const m = moveBuf[i];
      const cap = makeMove(m);
      if (!inCheck(side)) out.push(m);
      unmakeMove(m, cap);
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // 7. GRANDMASTER TAPERED EVALUATION (ZERO-ALLOCATION CHO HOT PATH)
  // ---------------------------------------------------------------------------
  function evaluate(side) {
    let materialDiff = vl[0] - vl[1];
    let positional = 0;
    let kingSafety = 0;
    let mobility = 0;
    let cannonTactics = 0;

    let adv0 = 0,
      adv1 = 0;
    let bis0 = 0,
      bis1 = 0;
    let rook0 = 0,
      rook1 = 0;
    let cannon0 = 0,
      cannon1 = 0;

    for (let sq = 0; sq < 90; sq++) {
      const p = board[sq];
      if (!p) continue;
      const code = p > 0 ? p : -p;
      if (p > 0) {
        if (code === 2) adv0++;
        else if (code === 3) bis0++;
        else if (code === 4) rook0++;
        else if (code === 5) cannon0++;
      } else {
        if (code === 2) adv1++;
        else if (code === 3) bis1++;
        else if (code === 4) rook1++;
        else if (code === 5) cannon1++;
      }
    }

    const phase = Math.min(
      32,
      (rook0 + rook1) * 4 +
        (cannon0 + cannon1) * 2 +
        (majors[0] + majors[1] - rook0 - rook1 - cannon0 - cannon1) * 2,
    );

    // An toàn Cung Tướng & Phạt Khuyết Sĩ Tượng (Đỏ)
    let ks0 = 0;
    if (adv0 === 2 && bis0 === 2) ks0 += 30;
    if (adv0 < 2 && rook1 > 0) ks0 -= 70 * (2 - adv0) * rook1;
    if (bis0 < 2 && cannon1 > 0) ks0 -= 30 * (2 - bis0) * cannon1;

    // An toàn Cung Tướng & Phạt Khuyết Sĩ Tượng (Đen)
    let ks1 = 0;
    if (adv1 === 2 && bis1 === 2) ks1 += 30;
    if (adv1 < 2 && rook0 > 0) ks1 -= 70 * (2 - adv1) * rook0;
    if (bis1 < 2 && cannon0 > 0) ks1 -= 30 * (2 - bis1) * cannon0;

    kingSafety = ks0 - ks1;

    // Quét chi tiết bàn cờ (Pháo, Xe, Mã, Tốt)
    for (let sq = 0; sq < 90; sq++) {
      const p = board[sq];
      if (!p) continue;
      const s = p > 0 ? 0 : 1;
      const sign = s === 0 ? 1 : -1;
      const opp = 1 - s;
      const code = p > 0 ? p : -p;
      const c = sq % 9;
      const r = (sq / 9) | 0;

      if (code === 5) {
        // Pháo chiến thuật
        const oppKs = kingSq[opp];
        if (oppKs >= 0) {
          const oppKc = oppKs % 9;
          const oppKr = (oppKs / 9) | 0;

          // Pháo Đầu
          if (c === 4 && oppKc === 4) cannonTactics += sign * 28;

          // Pháo Trống (Không Đầu Pháo): 0 quân cản giữa Pháo và Tướng trên cùng lộ
          if (c === oppKc && majors[s] >= 2) {
            const minR = Math.min(r, oppKr);
            const maxR = Math.max(r, oppKr);
            let screens = 0;
            for (let rowScan = minR + 1; rowScan < maxR; rowScan++) {
              if (board[rowScan * 9 + c]) screens++;
            }
            if (screens === 0) {
              cannonTactics += sign * 40;
            }
          }
        }
      } else if (code === 4) {
        // Xe uy lực: Lộ thông
        let friendlyPawn = false;
        let enemyPawn = false;
        for (let rowScan = 0; rowScan < 10; rowScan++) {
          const q = board[rowScan * 9 + c];
          if (q === (s === 0 ? 7 : -7)) friendlyPawn = true;
          if (q === (s === 0 ? -7 : 7)) enemyPawn = true;
        }
        if (!friendlyPawn) {
          mobility += sign * 20;
          if (!enemyPawn) mobility += sign * 10;
        }
        if (c >= 3 && c <= 5) positional += sign * 15;
        if (r === 4 || r === 5) positional += sign * 16;

        // Phạt Xe tù góc chỉ khi đã qua khai cuộc
        if (gamePly > 10 && phase < 30) {
          if (
            (s === 0 && (sq === 0 || sq === 8)) ||
            (s === 1 && (sq === 81 || sq === 89))
          ) {
            let freeCount = 0;
            for (const [dc, dr] of ORTHO) {
              const nc = c + dc;
              const nr = r + dr;
              if (nc >= 0 && nc <= 8 && nr >= 0 && nr <= 9) {
                const dest = board[nr * 9 + nc];
                if (!dest || (dest > 0 ? 0 : 1) !== s) freeCount++;
              }
            }
            if (freeCount <= 1) mobility -= sign * 35;
          }
        }
      } else if (code === 6) {
        // Mã độ linh hoạt & cản chân
        let jumps = 0;
        for (const [dc, dr, lc, lr] of KNIGHT_D) {
          const tc = c + dc;
          const tr = r + dr;
          if (tc < 0 || tc > 8 || tr < 0 || tr > 9) continue;
          if (board[(r + lr) * 9 + (c + lc)]) continue;
          const target = board[tr * 9 + tc];
          if (!target || (target > 0 ? 0 : 1) !== s) jumps++;
        }
        if (jumps === 0) mobility -= sign * 45;
        else if (jumps === 1) mobility -= sign * 20;
        else if (jumps >= 5) mobility += sign * 15;

        // Mã Ngọa Tào / Mã Quỳ
        if (s === 0) {
          if (r === 7 && (c === 2 || c === 6 || c === 3 || c === 5))
            positional += sign * 35;
        } else {
          if (r === 2 && (c === 2 || c === 6 || c === 3 || c === 5))
            positional += sign * 35;
        }
      } else if (code === 7) {
        // Tốt liên kết qua sông
        const crossed = s === 0 ? r >= 5 : r <= 4;
        if (crossed) {
          if (c > 0 && board[r * 9 + (c - 1)] === (s === 0 ? 7 : -7))
            positional += sign * 25;
          if (c < 8 && board[r * 9 + (c + 1)] === (s === 0 ? 7 : -7))
            positional += sign * 25;
        }
      }

      // Thưởng quân chủ lực (Xe, Pháo, Mã) qua sông tạo thế công (Trade Reluctance: Giữ quân công, tránh đổi bậy)
      if (code >= 4 && code <= 6) {
        const isPastRiver = s === 0 ? r >= 5 : r <= 4;
        if (isPastRiver) {
          positional += sign * 25;
        }
      }

      // An toàn quân chủ lực (Xe, Pháo, Mã) trước Tốt địch
      if (code >= 4 && code <= 6) {
        const pawnFwd = s === 0 ? 1 : -1;
        const pawnRow = r + pawnFwd;
        const enemyPawn = s === 0 ? -7 : 7;
        let attackedByPawn = false;
        if (pawnRow >= 0 && pawnRow <= 9 && board[pawnRow * 9 + c] === enemyPawn) {
          attackedByPawn = true;
        } else if ((s === 0 && r >= 5) || (s === 1 && r <= 4)) {
          if (c > 0 && board[r * 9 + (c - 1)] === enemyPawn) attackedByPawn = true;
          if (c < 8 && board[r * 9 + (c + 1)] === enemyPawn) attackedByPawn = true;
        }
        if (attackedByPawn) {
          if (code === 4) positional -= sign * 140; // Xe bị Tốt dọa
          else positional -= sign * 60;             // Pháo/Mã bị Tốt dọa
        }
      }
    }

    const totalScoreRed =
      materialDiff + positional + kingSafety + mobility + cannonTactics;
    return (side === 0 ? totalScoreRed : -totalScoreRed) + 3;
  }

  function getEvalBreakdown(side) {
    let materialDiff = vl[0] - vl[1];
    let positional = 0;
    let kingSafety = 0;
    let mobility = 0;
    let cannonTactics = 0;

    let adv0 = 0,
      adv1 = 0;
    let bis0 = 0,
      bis1 = 0;
    let rook0 = 0,
      rook1 = 0;
    let cannon0 = 0,
      cannon1 = 0;

    for (let sq = 0; sq < 90; sq++) {
      const p = board[sq];
      if (!p) continue;
      const code = p > 0 ? p : -p;
      if (p > 0) {
        if (code === 2) adv0++;
        else if (code === 3) bis0++;
        else if (code === 4) rook0++;
        else if (code === 5) cannon0++;
      } else {
        if (code === 2) adv1++;
        else if (code === 3) bis1++;
        else if (code === 4) rook1++;
        else if (code === 5) cannon1++;
      }
    }

    let ks0 = 0;
    if (adv0 === 2 && bis0 === 2) ks0 += 30;
    if (adv0 < 2 && rook1 > 0) ks0 -= 70 * (2 - adv0) * rook1;
    if (bis0 < 2 && cannon1 > 0) ks0 -= 30 * (2 - bis0) * cannon1;

    let ks1 = 0;
    if (adv1 === 2 && bis1 === 2) ks1 += 30;
    if (adv1 < 2 && rook0 > 0) ks1 -= 70 * (2 - adv1) * rook0;
    if (bis1 < 2 && cannon0 > 0) ks1 -= 30 * (2 - bis1) * cannon0;

    kingSafety = ks0 - ks1;

    for (let sq = 0; sq < 90; sq++) {
      const p = board[sq];
      if (!p) continue;
      const s = p > 0 ? 0 : 1;
      const sign = s === 0 ? 1 : -1;
      const opp = 1 - s;
      const code = p > 0 ? p : -p;
      const c = sq % 9;
      const r = (sq / 9) | 0;

      if (code === 5) {
        const oppKs = kingSq[opp];
        if (oppKs >= 0) {
          const oppKc = oppKs % 9;
          const oppKr = (oppKs / 9) | 0;
          if (c === 4 && oppKc === 4) cannonTactics += sign * 28;
          if (c === oppKc && majors[s] >= 2) {
            const minR = Math.min(r, oppKr);
            const maxR = Math.max(r, oppKr);
            let screens = 0;
            for (let rowScan = minR + 1; rowScan < maxR; rowScan++) {
              if (board[rowScan * 9 + c]) screens++;
            }
            if (screens === 0) cannonTactics += sign * 40;
          }
        }
      } else if (code === 4) {
        let friendlyPawn = false;
        let enemyPawn = false;
        for (let rowScan = 0; rowScan < 10; rowScan++) {
          const q = board[rowScan * 9 + c];
          if (q === (s === 0 ? 7 : -7)) friendlyPawn = true;
          if (q === (s === 0 ? -7 : 7)) enemyPawn = true;
        }
        if (!friendlyPawn) {
          mobility += sign * 20;
          if (!enemyPawn) mobility += sign * 10;
        }
        if (c >= 3 && c <= 5) positional += sign * 15;
      }
      if (code >= 4 && code <= 6) {
        const isPastRiver = s === 0 ? r >= 5 : r <= 4;
        if (isPastRiver) positional += sign * 25;
      }
    }

    return {
      material: side === 0 ? materialDiff : -materialDiff,
      positional: side === 0 ? positional : -positional,
      kingSafety: side === 0 ? kingSafety : -kingSafety,
      mobility: side === 0 ? mobility : -mobility,
      cannonTactics: side === 0 ? cannonTactics : -cannonTactics,
    };
  }

  function timeUp() {
    if (canStop && (nodes & 1023) === 0 && Date.now() > deadline) stop = true;
    return stop;
  }

  // ---------------------------------------------------------------------------
  // 8. QUIESCENCE SEARCH
  // ---------------------------------------------------------------------------
  function quiesce(alpha, beta, ply, side, qd) {
    nodes++;
    pvLen[ply] = ply;
    if (timeUp()) return 0;

    const chk = inCheck(side);
    let best = -INF;
    if (!chk) {
      const stand = evaluate(side);
      if (stand >= beta) return stand;
      if (stand > alpha) alpha = stand;
      best = stand;
      if (stand + 230 < alpha) return alpha;
    }
    if (qd > 8 || ply >= MAXPLY - 2) return evaluate(side);

    generateMoves(side, !chk, ply);
    scoreAndOrderMoves(ply, 0);

    const count = moveLen[ply];
    let legal = 0;

    for (let i = 0; i < count; i++) {
      const m = pickNextMove(ply, i);
      const cap = makeMove(m);
      if (inCheck(side)) {
        unmakeMove(m, cap);
        continue;
      }
      legal++;
      const score = -quiesce(-beta, -alpha, ply + 1, 1 - side, qd + 1);
      unmakeMove(m, cap);
      if (stop) return 0;
      if (score > best) {
        best = score;
        if (score > alpha) {
          alpha = score;
          if (score >= beta) return score;
        }
      }
    }
    if (chk && legal === 0) return -MATE + ply;
    return best;
  }

  // ---------------------------------------------------------------------------
  // 9. NÂNG CẤP NEGAMAX ALPHA-BETA (PVS + NULL-MOVE + LMR + TT + ZERO-ALLOC)
  // ---------------------------------------------------------------------------
  function search(depth, alpha, beta, ply, side, extLeft, allowNull) {
    pvLen[ply] = ply;
    const chk = inCheck(side);
    if (chk && extLeft > 0) {
      depth++;
      extLeft--;
    }
    if (depth <= 0) return quiesce(alpha, beta, ply, side, 0);
    nodes++;
    if (timeUp()) return 0;
    if (ply >= MAXPLY - 2) return evaluate(side);

    // Phát hiện lặp lại thế cờ (Repetition Draw)
    if (ply > 0 && isRepetition(ply)) {
      return 0;
    }

    // Mate-distance pruning
    const mateAlpha = -MATE + ply;
    const mateBeta = MATE - ply - 1;
    if (alpha < mateAlpha) alpha = mateAlpha;
    if (beta > mateBeta) beta = mateBeta;
    if (alpha >= beta) return alpha;

    // TT Probe (Zero-Allocation qua registers)
    if (ttProbe(ply, alpha, beta, depth) && probeCutoff && ply > 0) {
      return probeScore;
    }
    const ttMoveChosen = probeMove || prevPV[ply] || 0;

    // NULL-MOVE PRUNING: Cắt nhánh nước đi rỗng
    if (
      allowNull !== false &&
      !chk &&
      depth >= 3 &&
      ply > 0 &&
      majors[side] > 0
    ) {
      const R = depth >= 6 ? 3 : 2;
      makeNullMove();
      const nullScore = -search(
        depth - 1 - R,
        -beta,
        -beta + 1,
        ply + 1,
        1 - side,
        extLeft,
        false,
      );
      unmakeNullMove();
      if (stop) return 0;
      if (nullScore >= beta) {
        return beta; // Fail-high cutoff
      }
    }

    // Sinh và sắp xếp nước đi
    generateMoves(side, false, ply);
    scoreAndOrderMoves(ply, ttMoveChosen);

    const count = moveLen[ply];
    let legal = 0;
    let best = -INF;
    let bestMove = 0;
    let ttFlagToStore = TT_UPPER;

    for (let i = 0; i < count; i++) {
      const m = pickNextMove(ply, i);
      const cap = makeMove(m);
      if (inCheck(side)) {
        unmakeMove(m, cap);
        continue;
      }
      legal++;

      let score;
      // PRINCIPAL VARIATION SEARCH (PVS)
      if (legal === 1) {
        score = -search(
          depth - 1,
          -beta,
          -alpha,
          ply + 1,
          1 - side,
          extLeft,
          true,
        );
      } else {
        // LATE MOVE REDUCTIONS (LMR) cho các nước đi muộn
        let reduction = 0;
        const k = killers[ply] || [0, 0];
        const givesCheck = inCheck(1 - side);
        if (
          depth >= 3 &&
          legal > 3 &&
          !cap &&
          !chk &&
          !givesCheck &&
          m !== k[0] &&
          m !== k[1]
        ) {
          reduction = 1 + (legal > 8 && depth >= 5 ? 1 : 0);
        }

        score = -search(
          depth - 1 - reduction,
          -alpha - 1,
          -alpha,
          ply + 1,
          1 - side,
          extLeft,
          true,
        );

        if (reduction > 0 && score > alpha) {
          score = -search(
            depth - 1,
            -alpha - 1,
            -alpha,
            ply + 1,
            1 - side,
            extLeft,
            true,
          );
        }
        if (score > alpha && score < beta) {
          score = -search(
            depth - 1,
            -beta,
            -alpha,
            ply + 1,
            1 - side,
            extLeft,
            true,
          );
        }
      }

      // Luôn luôn unmakeMove TRƯỚC KHI xử lý kết quả hoặc return!
      unmakeMove(m, cap);
      if (stop) return 0;

      if (score > best) {
        best = score;
        bestMove = m;
        if (score > alpha) {
          alpha = score;
          ttFlagToStore = TT_EXACT;

          const row = pvTable[ply];
          const next = pvTable[ply + 1];
          row[ply] = m;
          for (let pIdx = ply + 1; pIdx < pvLen[ply + 1]; pIdx++)
            row[pIdx] = next[pIdx];
          pvLen[ply] = Math.max(pvLen[ply + 1], ply + 1);

          if (score >= beta) {
            ttStore(ply, depth, score, TT_LOWER, m);
            if (!cap) {
              const k = killers[ply];
              if (k[0] !== m) {
                k[1] = k[0];
                k[0] = m;
              }
              history[m] += depth * depth;
            }
            return score;
          }
        }
      }
    }

    if (legal === 0) return -MATE + ply;

    ttStore(ply, depth, best, ttFlagToStore, bestMove);
    return best;
  }

  // ---------------------------------------------------------------------------
  // 10. GRANDMASTER COMPACT OPENING BOOK (PHI ĐAO NHÚNG TRỰC TIẾP)
  // ---------------------------------------------------------------------------
  const BOOK_MOVES = {
    initial: [
      { move: 19 | (22 << 7), name: "Trung Pháo (Pháo 2 bình 5)", weight: 100 },
      { move: 25 | (22 << 7), name: "Trung Pháo (Pháo 8 bình 5)", weight: 95 },
      {
        move: 33 | (42 << 7),
        name: "Tiên Nhân Chỉ Lộ (Binh 7 tấn 1)",
        weight: 85,
      },
      {
        move: 29 | (38 << 7),
        name: "Tiên Nhân Chỉ Lộ (Binh 3 tấn 1)",
        weight: 85,
      },
      {
        move: 2 | (22 << 7),
        name: "Phi Tượng Cuộc (Tượng 3 tấn 5)",
        weight: 75,
      },
      {
        move: 6 | (22 << 7),
        name: "Phi Tượng Cuộc (Tượng 7 tấn 5)",
        weight: 75,
      },
      { move: 7 | (24 << 7), name: "Khởi Mã Cuộc (Mã 2 tấn 3)", weight: 70 },
      { move: 1 | (20 << 7), name: "Khởi Mã Cuộc (Mã 8 tấn 7)", weight: 70 },
      {
        move: 19 | (23 << 7),
        name: "Quá Cung Pháo (Pháo 2 bình 6)",
        weight: 65,
      },
      {
        move: 25 | (21 << 7),
        name: "Quá Cung Pháo (Pháo 8 bình 4)",
        weight: 65,
      },
    ],
    after_P2_5: [
      { move: 82 | (65 << 7), name: "Bình Phong Mã (Mã 8 tấn 7)", weight: 100 },
      { move: 88 | (69 << 7), name: "Bình Phong Mã (Mã 2 tấn 3)", weight: 90 },
      { move: 64 | (67 << 7), name: "Thuận Pháo (Pháo 8 bình 5)", weight: 85 },
      { move: 70 | (67 << 7), name: "Nghịch Pháo (Pháo 2 bình 5)", weight: 80 },
      { move: 88 | (79 << 7), name: "Đơn Đề Mã (Mã 2 tấn 1)", weight: 70 },
      {
        move: 70 | (68 << 7),
        name: "Phản Cung Mã (Pháo 2 bình 4)",
        weight: 75,
      },
    ],
    after_B7_1: [
      {
        move: 60 | (51 << 7),
        name: "Đối Binh Cuộc (Tốt 7 tấn 1)",
        weight: 100,
      },
      { move: 64 | (67 << 7), name: "Tốt Để Pháo (Pháo 8 bình 5)", weight: 90 },
      { move: 88 | (69 << 7), name: "Bình Phong Mã (Mã 2 tấn 3)", weight: 80 },
    ],
  };

  function probeOpeningBook(side) {
    if (gamePly > 4) return null;

    let totalPieces = 0;
    for (let sq = 0; sq < 90; sq++) if (board[sq]) totalPieces++;
    if (totalPieces === 32 && side === 0) {
      return {
        list: BOOK_MOVES["initial"],
        openingName: "Khai cuộc Tiêu Chuẩn",
      };
    }
    if (
      totalPieces === 32 &&
      side === 1 &&
      board[22] === 5 &&
      (board[19] === 0 || board[25] === 0)
    ) {
      return {
        list: BOOK_MOVES["after_P2_5"],
        openingName: "Trung Pháo Khai Cuộc",
      };
    }
    if (
      totalPieces === 32 &&
      side === 1 &&
      (board[42] === 7 || board[38] === 7)
    ) {
      return {
        list: BOOK_MOVES["after_B7_1"],
        openingName: "Tiên Nhân Chỉ Lộ",
      };
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // 11. SEARCH ROOT MULTIPV (ROOT PVS + ITERATIVE DEEPENING & TT PERSISTENCE)
  // ---------------------------------------------------------------------------
  function searchRoot(side, maxDepth, timeMs, multiPV, minDepth) {
    const start = Date.now();
    deadline = start + Math.max(10, timeMs);
    stop = false;
    nodes = 0;
    ttHits = 0;
    killers.forEach((k) => {
      k[0] = 0;
      k[1] = 0;
    });
    history.fill(0);
    prevPV = [];

    const bookMatch = probeOpeningBook(side);
    let rootMoves = legalMoves(side);
    if (rootMoves.length === 0) {
      return {
        mated: true,
        depth: 0,
        nodes: 0,
        lines: [],
        inCheck: inCheck(side),
        openingName: null,
      };
    }

    if (bookMatch && bookMatch.list) {
      const bookMoveMap = new Set(bookMatch.list.map((b) => b.move));
      rootMoves.sort((a, b) => {
        const aBook = bookMoveMap.has(a);
        const bBook = bookMoveMap.has(b);
        if (aBook && !bBook) return -1;
        if (!aBook && bBook) return 1;
        return 0;
      });
    }

    let completed = null;
    let lastScores = new Map();

    for (let d = 1; d <= maxDepth; d++) {
      canStop = d > (minDepth || 1);
      const iter = [];

      for (let mIdx = 0; mIdx < rootMoves.length; mIdx++) {
        const m = rootMoves[mIdx];
        let alpha = -INF;
        if (iter.length >= multiPV) {
          const sorted = iter.map((x) => x.score).sort((a, b) => b - a);
          alpha = sorted[multiPV - 1];
        }
        prevPV =
          completed && completed.lines[0] && completed.lines[0].move === m
            ? [0].concat(completed.lines[0].pv.slice(1))
            : [];

        const cap = makeMove(m);
        let score;

        // Root PVS
        if (mIdx < multiPV) {
          score = -search(d - 1, -INF, -alpha, 1, 1 - side, 6, true);
        } else {
          // Null-window search
          score = -search(d - 1, -alpha - 1, -alpha, 1, 1 - side, 6, true);
          if (score > alpha) {
            score = -search(d - 1, -INF, -alpha, 1, 1 - side, 6, true);
          }
        }

        unmakeMove(m, cap);
        if (stop) break;

        const exact = score > alpha;
        const pv = [m];
        if (exact) {
          for (let i = 1; i < pvLen[1]; i++) pv.push(pvTable[1][i]);
        }
        iter.push({ move: m, score, pv, exact });
      }

      if (stop && completed) break;

      const merged = iter.slice();
      if (stop) {
        for (const m of rootMoves) {
          if (!merged.some((x) => x.move === m)) {
            merged.push({
              move: m,
              score: lastScores.get(m) ?? -INF,
              pv: [m],
              exact: false,
            });
          }
        }
      }
      merged.sort((a, b) => b.score - a.score);
      completed = { depth: d, lines: merged };
      lastScores = new Map(merged.map((x) => [x.move, x.score]));
      rootMoves = merged.map((x) => x.move);

      if (stop) break;
      if (Math.abs(merged[0].score) > MATE - 100) break;
      if (Date.now() - start > timeMs * 0.8) break;
    }

    canStop = false;
    return {
      mated: false,
      depth: completed ? completed.depth : 1,
      nodes,
      ttHits,
      lines: completed ? completed.lines.slice(0, multiPV) : [],
      allCount: rootMoves.length,
      inCheck: inCheck(side),
      openingName: bookMatch ? bookMatch.openingName : null,
    };
  }

  function decode(m) {
    const f = m & 127;
    const t = m >> 7;
    let fc = f % 9;
    let fr = (f / 9) | 0;
    let tc = t % 9;
    let tr = (t / 9) | 0;
    if (boardFlipped) {
      fc = 8 - fc;
      fr = 9 - fr;
      tc = 8 - tc;
      tr = 9 - tr;
    }
    return {
      fromCol: fc,
      fromRow: fr,
      toCol: tc,
      toRow: tr,
    };
  }

  // ---------------------------------------------------------------------------
  // 12. PHÂN LOẠI NHÃN CHIẾN THUẬT (EXPLAINABLE TACTICAL TAGS)
  // ---------------------------------------------------------------------------
  function classifyTactics(move, lineScore, side) {
    const tags = [];
    const f = move & 127;
    const t = move >> 7;
    const p = board[f];
    const cap = board[t];
    const code = p > 0 ? p : -p;
    const capCode = cap ? (cap > 0 ? cap : -cap) : 0;

    if (cap) tags.push("capture");
    if (capCode === 2 || capCode === 3) tags.push("guard-break");

    const captured = makeMove(move);
    if (inCheck(1 - side)) tags.push("checks");

    // Pháo Đầu / Pháo Trống
    if (code === 5) {
      const tc = t % 9;
      const tr = (t / 9) | 0;
      if (tc === 4) tags.push("central-cannon");
      const oppKs = kingSq[1 - side];
      if (oppKs >= 0) {
        const oppKc = oppKs % 9;
        const oppKr = (oppKs / 9) | 0;
        if (oppKc === tc) {
          let sCount = 0;
          const minR = Math.min(tr, oppKr);
          const maxR = Math.max(tr, oppKr);
          for (let rScan = minR + 1; rScan < maxR; rScan++) {
            if (board[rScan * 9 + tc]) sCount++;
          }
          if (sCount === 0) tags.push("hollow-cannon");
        } else if (oppKr === tr) {
          let sCount = 0;
          const minC = Math.min(tc, oppKc);
          const maxC = Math.max(tc, oppKc);
          for (let cScan = minC + 1; cScan < maxC; cScan++) {
            if (board[tr * 9 + cScan]) sCount++;
          }
          if (sCount === 0) tags.push("hollow-cannon");
        }
      }
    }

    // Lộ thông Xe
    if (code === 4) {
      const tc = t % 9;
      let friendlyPawn = false;
      for (let r = 0; r < 10; r++) {
        if (board[r * 9 + tc] === (side === 0 ? 7 : -7)) friendlyPawn = true;
      }
      if (!friendlyPawn) tags.push("open-file-rook");
    }

    // Cản chân Mã
    for (let sq = 0; sq < 90; sq++) {
      const q = board[sq];
      if (q === (side === 0 ? -6 : 6)) {
        const mc = sq % 9;
        const mr = (sq / 9) | 0;
        const tc = t % 9;
        const tr = (t / 9) | 0;
        if (Math.abs(tc - mc) + Math.abs(tr - mr) === 1) {
          tags.push("knight-block");
          break;
        }
      }
    }

    unmakeMove(move, captured);
    return tags;
  }

  // ---------------------------------------------------------------------------
  // 13. PUBLIC API: ANALYZE & QUICK_EVALUATE
  // ---------------------------------------------------------------------------
  function analyze(input) {
    const started = Date.now();
    const budget = input.timeMs || 1500;
    let side = input.side === 1 ? 1 : 0;
    const pieces = input.fen || input.pieces || [];
    if (typeof input.fen === "string" && input.side == null) {
      const parts = input.fen.trim().split(/\s+/);
      if (parts[1] && parts[1].toLowerCase() === "b") side = 1;
    }
    setup(pieces, input.history);

    if (kingSq[0] < 0 || kingSq[1] < 0) {
      return { error: "missing-king" };
    }

    const staticEval = evaluate(side);
    const evalBreakdown = getEvalBreakdown(side);

    // Lượt tìm kiếm chính (90% budget cho depth cao nhất)
    const main = searchRoot(
      side,
      input.maxDepth || 12,
      budget * 0.90,
      input.multiPV || 3,
      2,
    );

    if (main.mated) {
      return {
        side,
        mated: true,
        inCheck: main.inCheck,
        depth: 0,
        nodes: main.nodes,
        lines: [],
        evalBreakdown,
        ms: Date.now() - started,
      };
    }

    let totalNodes = main.nodes;
    const lines = [];

    for (const line of main.lines) {
      const tags = classifyTactics(line.move, line.score, side);
      const out = {
        ...decode(line.move),
        score: line.score,
        exact: line.exact,
        pv: line.pv.map(decode),
        tags,
        replies: [],
      };

      // Trích xuất đòn đối kháng và phản kích trực tiếp từ PV & TT (Grandmaster PV Analysis)
      const cap1 = makeMove(line.move);
      let oppReplyMove = 0;
      let friendlyAnsMove = 0;

      if (line.pv && line.pv.length >= 2) {
        oppReplyMove = line.pv[1];
      }
      if (line.pv && line.pv.length >= 3) {
        friendlyAnsMove = line.pv[2];
      }

      if (!oppReplyMove) {
        if (ttProbe(1, -INF, INF, 1) && probeMove) {
          oppReplyMove = probeMove;
        }
      }

      if (oppReplyMove) {
        const reply = { ...decode(oppReplyMove), score: -line.score, answer: null };
        const cap2 = makeMove(oppReplyMove);
        if (!friendlyAnsMove) {
          if (ttProbe(2, -INF, INF, 1) && probeMove) {
            friendlyAnsMove = probeMove;
          }
        }
        if (friendlyAnsMove) {
          reply.answer = {
            ...decode(friendlyAnsMove),
            score: line.score,
          };
        }
        if (line.pv && line.pv.length >= 4 && line.pv[3]) {
          reply.step4 = {
            ...decode(line.pv[3]),
            score: -line.score,
          };
        }
        if (line.pv && line.pv.length >= 5 && line.pv[4]) {
          reply.step5 = {
            ...decode(line.pv[4]),
            score: line.score,
          };
        }
        unmakeMove(oppReplyMove, cap2);
        out.replies.push(reply);

        // Bổ sung thêm biến dự phòng từ legal moves nếu cần
        const altMoves = legalMoves(1 - side);
        for (const alt of altMoves) {
          if (alt !== oppReplyMove && out.replies.length < 3) {
            out.replies.push({
              ...decode(alt),
              score: -line.score - 35,
              answer: friendlyAnsMove ? { ...decode(friendlyAnsMove), score: line.score } : null,
            });
          }
        }

        // Kiểm tra phế quân
        const movedPieceCode = Math.abs(board[line.move & 127]);
        if (ORDER_VAL[movedPieceCode] >= 4 && out.replies[0]) {
          const rep0 = out.replies[0];
          if (rep0.toCol === out.toCol && rep0.toRow === out.toRow) {
            if (line.score > 50 || out.delivermate) {
              if (!out.tags.includes("sacrifice")) out.tags.push("sacrifice");
            }
          }
        }
      } else {
        if (inCheck(1 - side)) out.delivermate = true;
      }
      unmakeMove(line.move, cap1);
      lines.push(out);
    }

    // Mối đe dọa nếu bỏ lượt
    let threat = null;
    if (!main.inCheck) {
      const oppStatic = evaluate(1 - side);
      const th = searchRoot(1 - side, 3, budget * 0.05, 1, 1);
      totalNodes += th.nodes;
      if (!th.mated && th.lines[0]) {
        const gain = th.lines[0].score - oppStatic;
        threat = {
          ...decode(th.lines[0].move),
          gain,
          score: th.lines[0].score,
        };
      }
    }

    return {
      side,
      mated: false,
      inCheck: main.inCheck,
      depth: main.depth,
      nodes: totalNodes,
      ttHits: main.ttHits,
      openingName: main.openingName,
      staticEval,
      score: lines[0] ? lines[0].score : staticEval,
      evalBreakdown,
      lines,
      threat,
      legalCount: main.allCount,
      ms: Date.now() - started,
    };
  }

  function quickEvaluate(piecesInput, side) {
    let s = side === 1 ? 1 : 0;
    if (typeof piecesInput === "string" && side == null) {
      const parts = piecesInput.trim().split(/\s+/);
      if (parts[1] && parts[1].toLowerCase() === "b") s = 1;
    }
    setup(piecesInput || []);
    if (kingSq[0] < 0 || kingSq[1] < 0) {
      return { error: "missing-king" };
    }
    return {
      side: s,
      score: evaluate(s),
      inCheck: inCheck(s),
      evalBreakdown: getEvalBreakdown(s),
    };
  }

  // Perft: đếm số nút hợp lệ để kiểm chứng bộ sinh nước (chuẩn: 44, 1920, 79666, 3290240)
  function perftRec(depth, side, ply) {
    if (depth === 0) return 1;
    generateMoves(side, false, ply);
    const count = moveLen[ply];
    const base = moveBase[ply];
    let total = 0;
    for (let i = 0; i < count; i++) {
      const m = moveBuf[base + i];
      const cap = makeMove(m);
      if (!inCheck(side)) total += perftRec(depth - 1, 1 - side, ply + 1);
      unmakeMove(m, cap);
    }
    return total;
  }
  function perft(piecesOrFen, side, depth) {
    setup(piecesOrFen || []);
    return perftRec(depth | 0, side === 1 ? 1 : 0, 0);
  }

  return { analyze, quickEvaluate, setup, evaluate, inCheck, toFen, perft, MATE };
}

// ---------------------------------------------------------------------------
// Asynchronous Web Worker Manager: Offloads 100% of calculation from UI thread
// ---------------------------------------------------------------------------
export function createXiangqiWorker() {
  let worker = null;
  let requestId = 0;
  let activeCallback = null;
  let isWorkerFailed = false;

  const localEngine = createXiangqiEngine();

  try {
    if (
      typeof window !== "undefined" &&
      typeof Worker !== "undefined" &&
      typeof Blob !== "undefined" &&
      typeof URL !== "undefined" &&
      typeof URL.createObjectURL === "function"
    ) {
      const workerScript = `
        "use strict";
        const createXiangqiEngine = ${createXiangqiEngine.toString()};
        const engine = createXiangqiEngine();

        self.onmessage = function (e) {
          const data = e.data || {};
          if (data.type === "analyze") {
            try {
              const res = engine.analyze(data.input);
              self.postMessage({ id: data.id, ok: true, result: res });
            } catch (err) {
              self.postMessage({ id: data.id, ok: false, error: err ? err.message : "Analysis failed" });
            }
          }
        };
      `;

      const blob = new Blob([workerScript], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl);

      worker.onmessage = function (e) {
        const data = e.data || {};
        if (data.id === requestId && typeof activeCallback === "function") {
          const cb = activeCallback;
          activeCallback = null;
          if (data.ok) {
            cb(null, data.result);
          } else {
            cb(new Error(data.error || "Worker analysis error"));
          }
        }
      };

      worker.onerror = function (err) {
        console.warn("[AN Mod] Xiangqi Web Worker error, falling back:", err);
        isWorkerFailed = true;
      };
    } else {
      isWorkerFailed = true;
    }
  } catch (err) {
    console.warn("[AN Mod] Web Worker creation failed, using fallback:", err);
    isWorkerFailed = true;
  }

  function analyzeAsync(input, callback) {
    const currentId = ++requestId;
    activeCallback = callback;

    if (!isWorkerFailed && worker) {
      worker.postMessage({ id: currentId, type: "analyze", input });
      return function cancel() {
        if (requestId === currentId) {
          activeCallback = null;
        }
      };
    }

    // Fallback: non-blocking setTimeout with budget cap so UI stays responsive
    const timer = setTimeout(() => {
      if (requestId !== currentId) return;
      try {
        const reducedInput = {
          ...input,
          timeMs: Math.min(input.timeMs || 250, 80),
          maxDepth: Math.min(input.maxDepth || 4, 4),
        };
        const res = localEngine.analyze(reducedInput);
        if (typeof activeCallback === "function" && requestId === currentId) {
          const cb = activeCallback;
          activeCallback = null;
          cb(null, res);
        }
      } catch (err) {
        if (typeof activeCallback === "function" && requestId === currentId) {
          const cb = activeCallback;
          activeCallback = null;
          cb(err);
        }
      }
    }, 16);

    return function cancel() {
      if (requestId === currentId) {
        clearTimeout(timer);
        activeCallback = null;
      }
    };
  }

  function quickEvaluate(pieces, side) {
    return localEngine.quickEvaluate(pieces, side);
  }

  return {
    analyzeAsync,
    quickEvaluate,
    engine: localEngine,
    MATE: localEngine.MATE,
  };
}
