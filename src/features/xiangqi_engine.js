// src/features/xiangqi_engine.js - Self-contained Xiangqi search engine for the AI Mentor
//
// Kiến trúc (tham khảo XQWLight / ElephantEye):
//   - Bàn cờ mảng phẳng 90 ô (sq = row * 9 + col), Đỏ (color 0) ở hàng 0..2, Đen ở hàng 7..9.
//   - Mã quân: type + 1 (1 Tướng, 2 Sĩ, 3 Tượng, 4 Xe, 5 Pháo, 6 Mã, 7 Tốt); Đỏ dương, Đen âm.
//   - Đánh giá: bảng điểm vị trí (Piece-Square Tables) đã gộp giá trị quân, cập nhật tăng dần.
//   - Tìm kiếm: Negamax Alpha-Beta + Iterative Deepening + Quiescence (chỉ xét nước ăn quân)
//     + Check Extension + sắp xếp nước (PV, MVV-LVA, Killer, History) + MultiPV tại gốc.
//   - Luật: kiểm tra Tướng bị chiếu, luật "lộ mặt Tướng" (hai Tướng đối mặt), hết nước = thua.
//
// QUAN TRỌNG: Toàn bộ engine nằm trong MỘT hàm factory không tham chiếu biến bên ngoài,
// để có thể chuyển thành chuỗi (Function.toString) và chạy trong Web Worker không chặn UI.

export function createXiangqiEngine() {
  "use strict";

  const MATE = 10000;
  const INF = 32000;
  const MAXPLY = 64;

  // ---------------------------------------------------------------------------
  // Piece-Square Tables (góc nhìn Đỏ; hàng t = 0 là hàng đáy của Đen, t = 9 là hàng đáy Đỏ)
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

  // VAL[p + 7][sq]: giá trị (đã gồm vật chất) của quân mã p đứng tại ô sq
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
  // Trạng thái bàn cờ
  // ---------------------------------------------------------------------------
  const board = new Int8Array(90);
  const kingSq = [-1, -1];
  let vl = [0, 0];

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

  function setup(pieces) {
    board.fill(0);
    kingSq[0] = -1;
    kingSq[1] = -1;
    vl = [0, 0];
    for (const pc of pieces) {
      if (pc.col < 0 || pc.col > 8 || pc.row < 0 || pc.row > 9) continue;
      const sq = pc.row * 9 + pc.col;
      const code = (pc.type | 0) + 1;
      const p = pc.color === 0 ? code : -code;
      board[sq] = p;
      if (code === 1) kingSq[pc.color === 0 ? 0 : 1] = sq;
      vl[pc.color === 0 ? 0 : 1] += VAL[p + 7][sq];
    }
  }

  function evaluate(side) {
    const s = vl[0] - vl[1];
    return (side === 0 ? s : -s) + 3; // +3: lợi thế nước đi (tempo)
  }

  function makeMove(m) {
    const f = m & 127;
    const t = m >> 7;
    const p = board[f];
    const cap = board[t];
    const side = p > 0 ? 0 : 1;
    vl[side] += VAL[p + 7][t] - VAL[p + 7][f];
    if (cap) vl[1 - side] -= VAL[cap + 7][t];
    board[t] = p;
    board[f] = 0;
    if (p === 1) kingSq[0] = t;
    else if (p === -1) kingSq[1] = t;
    return cap;
  }

  function unmakeMove(m, cap) {
    const f = m & 127;
    const t = m >> 7;
    const p = board[t];
    const side = p > 0 ? 0 : 1;
    vl[side] -= VAL[p + 7][t] - VAL[p + 7][f];
    if (cap) vl[1 - side] += VAL[cap + 7][t];
    board[f] = p;
    board[t] = cap;
    if (p === 1) kingSq[0] = f;
    else if (p === -1) kingSq[1] = f;
  }

  // ---------------------------------------------------------------------------
  // Sinh nước đi (giả hợp lệ)
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

  function genMoves(side, capOnly) {
    const moves = [];
    const sign = side === 0 ? 1 : -1;
    for (let sq = 0; sq < 90; sq++) {
      const p = board[sq];
      if (!p || (p > 0 ? 0 : 1) !== side) continue;
      const code = p * sign;
      const c = sq % 9;
      const r = (sq / 9) | 0;

      const push = (tc, tr) => {
        const t = tr * 9 + tc;
        const q = board[t];
        if (q) {
          if ((q > 0 ? 0 : 1) === side) return;
        } else if (capOnly) return;
        moves.push(sq | (t << 7));
      };

      if (code === 1 || code === 2) {
        const dirs = code === 1 ? ORTHO : DIAG;
        const rMin = side === 0 ? 0 : 7;
        const rMax = side === 0 ? 2 : 9;
        for (const [dc, dr] of dirs) {
          const tc = c + dc;
          const tr = r + dr;
          if (tc >= 3 && tc <= 5 && tr >= rMin && tr <= rMax) push(tc, tr);
        }
      } else if (code === 3) {
        for (const [dc, dr] of DIAG) {
          const tc = c + 2 * dc;
          const tr = r + 2 * dr;
          if (tc < 0 || tc > 8 || tr < 0 || tr > 9) continue;
          if (side === 0 ? tr > 4 : tr < 5) continue;
          if (board[(r + dr) * 9 + (c + dc)]) continue;
          push(tc, tr);
        }
      } else if (code === 6) {
        for (const [dc, dr, lc, lr] of KNIGHT_D) {
          const tc = c + dc;
          const tr = r + dr;
          if (tc < 0 || tc > 8 || tr < 0 || tr > 9) continue;
          if (board[(r + lr) * 9 + (c + lc)]) continue;
          push(tc, tr);
        }
      } else if (code === 4 || code === 5) {
        for (const [dc, dr] of ORTHO) {
          let tc = c + dc;
          let tr = r + dr;
          let screen = false;
          while (tc >= 0 && tc <= 8 && tr >= 0 && tr <= 9) {
            const q = board[tr * 9 + tc];
            if (code === 4) {
              if (!q) {
                if (!capOnly) moves.push(sq | ((tr * 9 + tc) << 7));
              } else {
                if ((q > 0 ? 0 : 1) !== side)
                  moves.push(sq | ((tr * 9 + tc) << 7));
                break;
              }
            } else if (!screen) {
              if (!q) {
                if (!capOnly) moves.push(sq | ((tr * 9 + tc) << 7));
              } else screen = true;
            } else if (q) {
              if ((q > 0 ? 0 : 1) !== side)
                moves.push(sq | ((tr * 9 + tc) << 7));
              break;
            }
            tc += dc;
            tr += dr;
          }
        }
      } else if (code === 7) {
        const fwd = side === 0 ? 1 : -1;
        const tr = r + fwd;
        if (tr >= 0 && tr <= 9) push(c, tr);
        const crossed = side === 0 ? r >= 5 : r <= 4;
        if (crossed) {
          if (c > 0) push(c - 1, r);
          if (c < 8) push(c + 1, r);
        }
      }
    }
    return moves;
  }

  // Tướng của `side` có đang bị chiếu không (gồm cả luật lộ mặt Tướng)
  function inCheck(side) {
    const ks = kingSq[side];
    if (ks < 0) return true;
    const kc = ks % 9;
    const kr = (ks / 9) | 0;
    const e = side === 0 ? -1 : 1; // hệ số dấu quân địch

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

  function legalMoves(side) {
    const out = [];
    for (const m of genMoves(side, false)) {
      const cap = makeMove(m);
      if (!inCheck(side)) out.push(m);
      unmakeMove(m, cap);
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // Sắp xếp nước đi
  // ---------------------------------------------------------------------------
  function orderMoves(moves, ply, pvMove) {
    const scored = new Array(moves.length);
    const k = killers[ply] || [0, 0];
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      let s;
      if (m === pvMove) s = 1e7;
      else {
        const cap = board[m >> 7];
        if (cap) {
          const victim = ORDER_VAL[cap > 0 ? cap : -cap];
          const att = board[m & 127];
          s = 1e6 + victim * 100 - ORDER_VAL[att > 0 ? att : -att];
        } else if (m === k[0]) s = 9e5;
        else if (m === k[1]) s = 8e5;
        else s = history[m];
      }
      scored[i] = { m, s };
    }
    scored.sort((a, b) => b.s - a.s);
    for (let i = 0; i < moves.length; i++) moves[i] = scored[i].m;
    return moves;
  }

  function timeUp() {
    if (canStop && (nodes & 1023) === 0 && Date.now() > deadline) stop = true;
    return stop;
  }

  // ---------------------------------------------------------------------------
  // Quiescence Search: chỉ xét nước ăn quân (hoặc mọi nước khi đang bị chiếu)
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
    }
    if (qd > 8 || ply >= MAXPLY - 2) return evaluate(side);

    const moves = orderMoves(genMoves(side, !chk), ply, 0);
    let legal = 0;
    for (const m of moves) {
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
  // Negamax Alpha-Beta
  // ---------------------------------------------------------------------------
  function search(depth, alpha, beta, ply, side, extLeft) {
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

    // Mate-distance pruning
    const mateAlpha = -MATE + ply;
    const mateBeta = MATE - ply - 1;
    if (alpha < mateAlpha) alpha = mateAlpha;
    if (beta > mateBeta) beta = mateBeta;
    if (alpha >= beta) return alpha;

    const moves = orderMoves(genMoves(side, false), ply, prevPV[ply] || 0);
    let legal = 0;
    let best = -INF;
    for (const m of moves) {
      const cap = makeMove(m);
      if (inCheck(side)) {
        unmakeMove(m, cap);
        continue;
      }
      legal++;
      const score = -search(
        depth - 1,
        -beta,
        -alpha,
        ply + 1,
        1 - side,
        extLeft,
      );
      unmakeMove(m, cap);
      if (stop) return 0;
      if (score > best) {
        best = score;
        if (score > alpha) {
          alpha = score;
          const row = pvTable[ply];
          const next = pvTable[ply + 1];
          row[ply] = m;
          for (let i = ply + 1; i < pvLen[ply + 1]; i++) row[i] = next[i];
          pvLen[ply] = Math.max(pvLen[ply + 1], ply + 1);
          if (score >= beta) {
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
    if (legal === 0) return -MATE + ply; // Cờ tướng: hết nước đi = thua
    return best;
  }

  // ---------------------------------------------------------------------------
  // Root MultiPV Search with Iterative Deepening
  // ---------------------------------------------------------------------------
  function searchRoot(side, maxDepth, timeMs, multiPV, minDepth) {
    const start = Date.now();
    deadline = start + Math.max(10, timeMs);
    stop = false;
    nodes = 0;
    killers.forEach((k) => {
      k[0] = 0;
      k[1] = 0;
    });
    history.fill(0);
    prevPV = [];

    let rootMoves = orderMoves(legalMoves(side), 0, 0);
    if (rootMoves.length === 0) {
      return {
        mated: true,
        depth: 0,
        nodes: 0,
        lines: [],
        inCheck: inCheck(side),
      };
    }

    let completed = null;
    let lastScores = new Map();

    for (let d = 1; d <= maxDepth; d++) {
      canStop = d > (minDepth || 1);
      const iter = [];
      for (const m of rootMoves) {
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
        const score = -search(d - 1, -INF, -alpha, 1, 1 - side, 6);
        unmakeMove(m, cap);
        if (stop) break;
        const exact = score > alpha;
        const pv = [m];
        if (exact) for (let i = 1; i < pvLen[1]; i++) pv.push(pvTable[1][i]);
        iter.push({ move: m, score, pv, exact });
      }
      if (stop && completed) break;

      // Cập nhật kết quả (kể cả lượt dở dang nếu chưa có lượt hoàn chỉnh nào)
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
      if (Math.abs(merged[0].score) > MATE - 100) break; // đã tìm thấy sát cục
      if (Date.now() - start > timeMs * 0.55) break; // không đủ thời gian cho lượt sâu hơn
    }

    canStop = false;
    return {
      mated: false,
      depth: completed.depth,
      nodes,
      lines: completed.lines.slice(0, multiPV),
      allCount: rootMoves.length,
      inCheck: inCheck(side),
    };
  }

  function decode(m) {
    const f = m & 127;
    const t = m >> 7;
    return {
      fromCol: f % 9,
      fromRow: (f / 9) | 0,
      toCol: t % 9,
      toRow: (t / 9) | 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Public API: phân tích đa nhánh (nước ta → 2-3 phương án đáp của địch → nước ta đáp lại)
  // ---------------------------------------------------------------------------
  function analyze(input) {
    const started = Date.now();
    const budget = input.timeMs || 1500;
    const side = input.side === 1 ? 1 : 0;
    setup(input.pieces || []);

    if (kingSq[0] < 0 || kingSq[1] < 0) {
      return { error: "missing-king" };
    }

    const staticEval = evaluate(side);
    const main = searchRoot(
      side,
      input.maxDepth || 8,
      budget * 0.5,
      input.multiPV || 3,
      2,
    );
    if (main.mated) {
      return {
        side,
        mated: true,
        inCheck: main.inCheck,
        depth: 0,
        nodes: 0,
        lines: [],
        ms: Date.now() - started,
      };
    }

    let totalNodes = main.nodes;
    const replyDepth = Math.max(2, Math.min(5, main.depth - 1));
    const answerDepth = Math.max(1, Math.min(4, main.depth - 2));
    const lines = [];

    for (const line of main.lines) {
      const out = {
        ...decode(line.move),
        score: line.score,
        exact: line.exact,
        pv: line.pv.map(decode),
        replies: [],
      };
      const cap1 = makeMove(line.move);
      const rep = searchRoot(1 - side, replyDepth, budget * 0.09, 3, 1);
      totalNodes += rep.nodes;
      if (!rep.mated) {
        for (const r of rep.lines) {
          const reply = { ...decode(r.move), score: -r.score, answer: null };
          const cap2 = makeMove(r.move);
          const ans = searchRoot(side, answerDepth, budget * 0.025, 1, 1);
          totalNodes += ans.nodes;
          if (ans.mated) reply.answerMated = true;
          else if (ans.lines[0]) {
            reply.answer = {
              ...decode(ans.lines[0].move),
              score: ans.lines[0].score,
            };
          }
          unmakeMove(r.move, cap2);
          out.replies.push(reply);
        }
      } else {
        out.delivermate = true;
      }
      unmakeMove(line.move, cap1);
      lines.push(out);
    }

    // Mối đe dọa của đối thủ: nếu ta "bỏ lượt", đối thủ sẽ làm gì? (chỉ khi không bị chiếu)
    let threat = null;
    if (!main.inCheck) {
      const oppStatic = evaluate(1 - side);
      const th = searchRoot(1 - side, 3, budget * 0.08, 1, 1);
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
      staticEval,
      score: lines[0] ? lines[0].score : staticEval,
      lines,
      threat,
      legalCount: main.allCount,
      ms: Date.now() - started,
    };
  }

  function quickEvaluate(pieces, side) {
    const s = side === 1 ? 1 : 0;
    setup(pieces || []);
    if (kingSq[0] < 0 || kingSq[1] < 0) {
      return { error: "missing-king" };
    }
    const score = evaluate(s);
    return {
      side: s,
      score,
      inCheck: inCheck(s),
    };
  }

  return { analyze, quickEvaluate, setup, evaluate, inCheck, MATE };
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
