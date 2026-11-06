// src/features/pikafish_provider.js - Pikafish NNUE UCI Engine Provider
// Implements Phase 6 of AN Xiangqi AI Agent Specification (09-pikafish.md)
import { piecesToFen, fenToPieces, uciToMove, moveToUci, isBoardFlipped } from "./xiangqi_fen.js";
import { createXiangqiWorker } from "./xiangqi_engine.js";

/**
 * Checks if a position is Cờ Úp (has face-down/unopened pieces or non-standard piece quantities).
 * Standard Pikafish UCI strictly expects standard Xiangqi; Cờ Úp must be handled by the specialized JS Engine.
 */
function isCoUpPosition(pieces, isCoUpFlag = false) {
  if (isCoUpFlag) return true;
  if (
    typeof window !== "undefined" &&
    window.ZigaMod &&
    typeof window.ZigaMod.getActiveGameData === "function"
  ) {
    try {
      const data = window.ZigaMod.getActiveGameData();
      if (
        data &&
        data.gameLayer &&
        window.ZigaMod.isCoUpGame &&
        window.ZigaMod.isCoUpGame(data.gameLayer)
      ) {
        return true;
      }
    } catch (e) {}
  }
  if (!Array.isArray(pieces)) return false;
  if (pieces.some((p) => p && (p.ac === 0 || p.unopened))) return true;
  const counts = { 0: {}, 1: {} };
  for (const p of pieces) {
    if (!p) continue;
    const c = p.color === 0 ? 0 : 1;
    counts[c][p.type] = (counts[c][p.type] || 0) + 1;
  }
  for (const c of [0, 1]) {
    if ((counts[c][0] || 0) > 1) return true; // >1 King
    if ((counts[c][1] || 0) > 2) return true; // >2 Advisors
    if ((counts[c][2] || 0) > 2) return true; // >2 Bishops
    if ((counts[c][3] || 0) > 2) return true; // >2 Rooks
    if ((counts[c][4] || 0) > 2) return true; // >2 Cannons
    if ((counts[c][5] || 0) > 2) return true; // >2 Knights (e.g. 3 Red Knights in Cờ Úp)
    if ((counts[c][6] || 0) > 5) return true; // >5 Pawns
  }
  return false;
}

/**
 * Creates a Pikafish Engine Provider compatible with the unified EngineProvider contract.
 * Supports multiple transports:
 * 1. Native WebSocket UCI Bridge (e.g. ws://localhost:8765 or ws://127.0.0.1:8765)
 * 2. In-browser WebAssembly Worker (Pikafish WASM)
 * 3. Node.js child_process (for automated benchmarking and test harness)
 * 4. Automatic transparent fallback to the built-in Grandmaster JS Worker if Pikafish is offline
 *
 * @param {Object} [options]
 * @param {string} [options.wsUrl] WebSocket UCI Bridge URL (default: "ws://127.0.0.1:8765")
 * @param {string} [options.wasmWorkerUrl] URL to pikafish.worker.js
 * @param {boolean} [options.allowFallback=true] Fallback to js-engine if Pikafish unavailable
 * @returns {Object} EngineProvider interface
 */
export function createPikafishProvider(options = {}) {
  const {
    wsUrl = "ws://127.0.0.1:8765",
    wasmWorkerUrl = null,
    allowFallback = true,
  } = options;

  const id = "pikafish";
  const name = "Pikafish NNUE (Grandmaster Reference Engine)";

  // Dedicated fallback JS engine instance
  let fallbackWorker = null;
  function getFallback() {
    if (!fallbackWorker) {
      fallbackWorker = createXiangqiWorker();
    }
    return fallbackWorker;
  }

  function checkSideInCheck(pieces, side) {
    if (!pieces || !Array.isArray(pieces)) return false;
    try {
      const fbEngine = getFallback().engine;
      if (
        fbEngine &&
        typeof fbEngine.setup === "function" &&
        typeof fbEngine.inCheck === "function"
      ) {
        fbEngine.setup(pieces);
        return Boolean(fbEngine.inCheck(side));
      }
    } catch (e) {}
    return false;
  }

  let socket = null;
  let socketReady = false;
  let socketFailedOnce = false;
  let lastSocketAttempt = 0;
  let wasmWorker = null;
  let activeRequestId = 0;
  let activeCallback = null;
  let reconnectTimer = null;
  let heartbeatTimer = null;

  function safeSend(cmd) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(cmd);
        return true;
      } catch (e) {
        console.warn("[Pikafish Provider] safeSend failed:", e);
        return false;
      }
    }
    return false;
  }

  function scheduleAutoReconnect(delayMs = 1200) {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      ensureSocket(true);
    }, delayMs);
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Gửi lệnh isready giữ cho TCP connection luôn ấm, tránh Windows / Chrome idle timeout
        safeSend("isready\n");
      } else if (!socket || socket.readyState === WebSocket.CLOSED) {
        scheduleAutoReconnect(500);
      }
    }, 10000);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function ensureSocket(force = false) {
    if (typeof window === "undefined" || typeof WebSocket === "undefined") return;
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const now = Date.now();
    // Tự động kết nối lại nhanh (cooldown 1.5s thay vì 4s)
    if (!force && socketFailedOnce && now - lastSocketAttempt < 1500) {
      return;
    }

    lastSocketAttempt = now;

    function notifyStatusChange() {
      if (
        typeof window !== "undefined" &&
        typeof window.dispatchEvent === "function"
      ) {
        window.dispatchEvent(
          new CustomEvent("ZIGA_PIKAFISH_STATUS_CHANGE", {
            detail: {
              type:
                socketReady && socket && socket.readyState === WebSocket.OPEN
                  ? "native-ws"
                  : "cloud-nnue",
              label:
                socketReady && socket && socket.readyState === WebSocket.OPEN
                  ? "WS: 8765"
                  : "Cloud D30+",
            },
          }),
        );
      }
    }

    try {
      if (socket) {
        try {
          socket.close();
        } catch (e) {}
      }
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        console.log(
          "[Pikafish Provider] Connected to native UCI bridge at",
          wsUrl,
          "(Hardcore Grandmaster Mode)",
        );
        socketReady = true;
        socketFailedOnce = false;
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        safeSend("uci\n");
        safeSend("setoption name Threads value 4\n");
        safeSend("setoption name Hash value 128\n");
        safeSend("setoption name MultiPV value 3\n");
        safeSend("isready\n");
        notifyStatusChange();
        startHeartbeat();
      };
      socket.onerror = () => {
        socketReady = false;
        socketFailedOnce = true;
        stopHeartbeat();
        notifyStatusChange();
        scheduleAutoReconnect(1500);
      };
      socket.onclose = () => {
        socketReady = false;
        socketFailedOnce = true;
        stopHeartbeat();
        notifyStatusChange();
        scheduleAutoReconnect(1500);
      };
    } catch (e) {
      socketReady = false;
      socketFailedOnce = true;
      notifyStatusChange();
      scheduleAutoReconnect(2000);
    }
  }

  // Khởi động watchdog nền vĩnh viễn (kiểm tra mỗi 2.5s)
  if (typeof window !== "undefined") {
    if (window.__zigaPikafishWatchdog) {
      clearInterval(window.__zigaPikafishWatchdog);
    }
    window.__zigaPikafishWatchdog = setInterval(() => {
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        ensureSocket(false);
      }
    }, 2500);
  }

  // Initialize transport if in browser environment
  if (typeof window !== "undefined") {
    ensureSocket();

    // 2. Try WASM Worker if provided
    if (!socketReady && wasmWorkerUrl && typeof Worker !== "undefined") {
      try {
        wasmWorker = new Worker(wasmWorkerUrl);
        wasmWorker.postMessage({ type: "uci" });
        wasmWorker.postMessage({ type: "setoption", name: "MultiPV", value: 3 });
        wasmWorker.postMessage({ type: "isready" });
      } catch (err) {
        console.warn("[Pikafish Provider] Failed to initialize WASM worker:", err);
      }
    }
  }

  /**
   * Queries ChessDB Cloud Pikafish API (action=queryall & action=querypv)
   * Provides instant Grandmaster Pikafish NNUE (Depth 30-62) without local Node.js or native binaries.
   */
  function queryChessDbCloud(fen, side, pieces, cb) {
    let active = true;
    const reqId = "cdb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

    const onMessage = (event) => {
      if (!active) return;
      if (!event.data || event.data.type !== "ZIGA_CHESSDB_RESPONSE" || event.data.id !== reqId) return;

      if (typeof window !== "undefined") {
        window.removeEventListener("message", onMessage);
      }
      clearTimeout(timer);

      if (event.data.success && event.data.text) {
        processChessDbResponse(event.data.text);
      } else {
        cb(new Error(event.data.error || "ChessDB fetch failed"));
      }
    };

    const timer = setTimeout(() => {
      if (!active) return;
      active = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("message", onMessage);
      }
      cb(new Error("ChessDB request timed out"));
    }, 2200);

    function processChessDbResponse(allText) {
      if (!active) return;
      if (!allText || allText.startsWith("unknown") || allText.startsWith("invalid")) {
        active = false;
        return cb(new Error("Position not in ChessDB: " + allText.slice(0, 30)));
      }

      // Parse candidate moves
      const items = allText.trim().split("|");
      const candidates = [];
      for (const item of items) {
        const parts = item.split(",");
        const map = {};
        for (const p of parts) {
          const [k, v] = p.split(":");
          if (k && v !== undefined) map[k] = v;
        }
        if (map.move) {
          candidates.push({
            move: map.move,
            score: parseInt(map.score, 10) || 0,
            winrate: parseFloat(map.winrate) || 50,
            rank: parseInt(map.rank, 10) || 0,
            note: map.note || "",
          });
        }
      }

      if (candidates.length === 0) {
        active = false;
        return cb(new Error("No valid candidates from ChessDB"));
      }

      // Format top candidate lines
      const isFlipped = isBoardFlipped(pieces);
      const top3 = candidates.slice(0, 3);
      const formattedLines = top3.map((cand) => {
        const moveCoord = uciToMove(cand.move, isFlipped);
        return {
          fromCol: moveCoord ? moveCoord.fromCol : 0,
          fromRow: moveCoord ? moveCoord.fromRow : 0,
          toCol: moveCoord ? moveCoord.toCol : 0,
          toRow: moveCoord ? moveCoord.toRow : 0,
          score: cand.score,
          winrate: cand.winrate,
          exact: true,
          pv: moveCoord ? [moveCoord] : [],
          tags: detectUciTacticalTags({ pv: [cand.move], isMate: Math.abs(cand.score) > 9000 }, side, pieces),
          replies: [],
        };
      });

      // Now fetch querypv to enrich the top candidate with deep 60-ply PV and counter responses
      const pvReqId = "cdbpv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      let pvResolved = false;

      const onPvMessage = (e) => {
        if (!e.data || e.data.type !== "ZIGA_CHESSDB_RESPONSE" || e.data.id !== pvReqId) return;
        if (pvResolved) return;
        pvResolved = true;
        if (typeof window !== "undefined") {
          window.removeEventListener("message", onPvMessage);
        }

        let depth = 30;
        if (e.data.success && e.data.text && !e.data.text.startsWith("unknown")) {
          const pvParts = e.data.text.split(",");
          let pvMoves = [];
          for (const part of pvParts) {
            const [k, v] = part.split(":");
            if (k === "depth") depth = parseInt(v, 10) || 30;
            if (k === "pv") pvMoves = v.trim().split(/[|\s]+/);
          }
          if (pvMoves.length > 0 && formattedLines[0]) {
            formattedLines[0].pv = pvMoves.map((mv) => uciToMove(mv, isFlipped)).filter(Boolean);
            if (pvMoves[1]) {
              const oppMv = uciToMove(pvMoves[1], isFlipped);
              const ansMv = pvMoves[2] ? uciToMove(pvMoves[2], isFlipped) : null;
              const step4Mv = pvMoves[3] ? uciToMove(pvMoves[3], isFlipped) : null;
              const step5Mv = pvMoves[4] ? uciToMove(pvMoves[4], isFlipped) : null;
              if (oppMv) {
                formattedLines[0].replies = [
                  {
                    ...oppMv,
                    score: -formattedLines[0].score,
                    answer: ansMv ? { ...ansMv, score: formattedLines[0].score } : null,
                    step4: step4Mv ? { ...step4Mv, score: -formattedLines[0].score } : null,
                    step5: step5Mv ? { ...step5Mv, score: formattedLines[0].score } : null,
                  },
                ];
              }
            }
          }
        }

        finalizeCloudResult(depth);
      };

      if (typeof window !== "undefined" && typeof window.postMessage === "function") {
        window.addEventListener("message", onPvMessage);
        window.postMessage(
          {
            type: "ZIGA_CHESSDB_FETCH",
            id: pvReqId,
            url: `https://www.chessdb.cn/chessdb.php?action=querypv&board=${encodeURIComponent(fen)}`,
          },
          "*"
        );

        setTimeout(() => {
          if (!pvResolved && active) {
            pvResolved = true;
            if (typeof window !== "undefined") {
              window.removeEventListener("message", onPvMessage);
            }
            finalizeCloudResult(30);
          }
        }, 800);
      } else {
        finalizeCloudResult(30);
      }

      function finalizeCloudResult(depth) {
        if (!active) return;
        active = false;
        const topScore = formattedLines[0] ? formattedLines[0].score : 0;
        const isSideInCheck = checkSideInCheck(pieces, side);
        cb(null, {
          side,
          mated: Math.abs(topScore) > 9500,
          inCheck: isSideInCheck,
          depth,
          nodes: 50000000,
          engineName: `Pikafish 17 NNUE (Cloud Depth ${depth})`,
          pikafishStatus: "cloud-nnue",
          score: topScore,
          lines: formattedLines,
          threat: null,
          legalCount: formattedLines.length,
          ms: 250,
        });
      }
    }

    if (typeof window !== "undefined" && typeof window.postMessage === "function") {
      window.addEventListener("message", onMessage);
      window.postMessage(
        {
          type: "ZIGA_CHESSDB_FETCH",
          id: reqId,
          url: `https://www.chessdb.cn/chessdb.php?action=queryall&board=${encodeURIComponent(fen)}`,
        },
        "*"
      );
    } else if (typeof fetch === "function") {
      fetch(`https://www.chessdb.cn/chessdb.php?action=queryall&board=${encodeURIComponent(fen)}`)
        .then((r) => r.text())
        .then((txt) => {
          clearTimeout(timer);
          processChessDbResponse(txt);
        })
        .catch((err) => {
          clearTimeout(timer);
          cb(err);
        });
    } else {
      clearTimeout(timer);
      cb(new Error("No postMessage or fetch available"));
    }

    return () => {
      active = false;
      clearTimeout(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("message", onMessage);
      }
    };
  }

  /**
   * Evaluates position quickly via local engine or returns null.
   */
  function quickEvaluate(pieces, side) {
    return getFallback().quickEvaluate(pieces, side);
  }

  /**
   * Recreates the Mentor multi-layer analysis structure (T6.5):
   * 1. Lines: candidate moves with MultiPV
   * 2. Replies: opponent's best responses
   * 3. Answer: our counter-response
   * 4. Threat: opponent's threat if we pass
   */
  function analyzeAsync(input, callback) {
    const currentId = ++activeRequestId;
    activeCallback = callback;

    const timeMs = input.timeMs || 1500;
    const maxDepth = input.maxDepth || 28;
    const side = input.side === 1 ? 1 : 0;
    const isFlipped = isBoardFlipped(input.pieces);

    // Phát hiện thế cờ Cờ Úp (quân úp hoặc số lượng quân đặc thù như 3 Mã, Tượng qua sông):
    // Model Pikafish tiêu chuẩn UCI chỉ hỗ trợ Cờ Tướng chuẩn. Khi gặp Cờ Úp, tự động định tuyến
    // sang Engine JS Grandmaster chuyên dụng để tránh crash hoặc đứng hình tính toán.
    if (input.isCoUp || isCoUpPosition(input.pieces, input.isCoUp)) {
      if (allowFallback) {
        return getFallback().analyzeAsync(input, (err, res) => {
          if (activeRequestId === currentId && typeof activeCallback === "function") {
            const cb = activeCallback;
            activeCallback = null;
            if (err) {
              cb(err);
            } else {
              cb(null, {
                ...res,
                engineName: "AN Grandmaster JS (Cờ Úp Chuyên Dụng)",
                pikafishStatus: "co-up-js",
              });
            }
          }
        });
      }
    }

    let fen = input.fen;
    if (!fen && input.pieces) {
      fen = piecesToFen(input.pieces, side);
    }

    if (!fen) {
      if (typeof callback === "function") {
        callback(new Error("Pikafish analyze: Missing position (pieces or fen required)"));
      }
      return () => {};
    }

    // Ensure connection to native UCI bridge
    ensureSocket();

    function runRoutine() {
      // Check if Pikafish transport is active and available
      const isPikafishActive =
        socketReady && socket && socket.readyState === WebSocket.OPEN;

    if (!isPikafishActive) {
      // 1. Try ChessDB Cloud Pikafish API (Depth 30-62 Grandmaster evaluation)
      let isCancelled = false;
      const cancelChessDb = queryChessDbCloud(fen, side, input.pieces, (cErr, cResult) => {
        if (isCancelled) return;
        if (!cErr && cResult && cResult.lines && cResult.lines.length > 0) {
          if (activeRequestId === currentId && typeof activeCallback === "function") {
            const cb = activeCallback;
            activeCallback = null;
            cb(null, cResult);
          }
          return;
        }

        // 2. Fallback to upgraded JS Engine if ChessDB is offline or position unknown
        if (allowFallback) {
          const cancelFallback = getFallback().analyzeAsync(input, (err, res) => {
            if (activeRequestId === currentId && typeof activeCallback === "function") {
              const cb = activeCallback;
              activeCallback = null;
              if (err) {
                cb(err);
              } else {
                const enriched = {
                  ...res,
                  engineName: "AN Grandmaster JS (Engine Dự Phòng)",
                  pikafishStatus: "offline-fallback",
                };
                cb(null, enriched);
              }
            }
          });
          return cancelFallback;
        } else if (typeof callback === "function") {
          callback(new Error("Pikafish native bridge and ChessDB Cloud are offline"));
        }
      });

      return () => {
        isCancelled = true;
        if (typeof cancelChessDb === "function") cancelChessDb();
      };
    }

    // Pikafish UCI Interaction Routine
    let collectedLines = [];
    let bestMove = null;
    let uciListener = null;

    const cleanup = () => {
      if (socket && uciListener) {
        socket.removeEventListener("message", uciListener);
        uciListener = null;
      }
    };

    // Hard fallback timeout: nếu Pikafish không gửi bestmove trong timeMs + 350ms,
    // tự động chuyển sang JS Engine để không bao giờ để UI bị treo (Kế Sách (0))
    const hardTimeoutMs = Math.min(timeMs + 350, 2500);
    let hardTimeout = setTimeout(() => {
      if (activeRequestId === currentId && typeof activeCallback === "function") {
        console.warn("[Pikafish Provider] Engine response timed out, switching to JS fallback");
        cleanup();
        if (allowFallback) {
          getFallback().analyzeAsync(input, (err, res) => {
            if (activeRequestId === currentId && typeof activeCallback === "function") {
              const cb = activeCallback;
              activeCallback = null;
              if (err) cb(err);
              else {
                cb(null, {
                  ...res,
                  engineName: "AN Grandmaster JS (Engine Dự Phòng)",
                  pikafishStatus: "offline-fallback",
                });
              }
            }
          });
        } else {
          finalizePikafishResult();
        }
      }
    }, hardTimeoutMs);

    const searchStartTime = Date.now();
    uciListener = (event) => {
      if (activeRequestId !== currentId) return;
      const text = typeof event.data === "string" ? event.data : "";
      const lines = text.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("info ") && trimmed.includes("multipv ")) {
          // Parse info line
          const parsed = parseUciInfo(trimmed);
          if (parsed && parsed.multipv > 0) {
            collectedLines[parsed.multipv - 1] = parsed;
          }
        } else if (trimmed.startsWith("bestmove ")) {
          // Bỏ qua bestmove rác của lệnh search trước vừa bị stop nếu chưa kịp nhận info lines nào trong 150ms đầu
          if (collectedLines.length === 0 && Date.now() - searchStartTime < 150) {
            console.log("[Pikafish Provider] Ignored trailing bestmove from previous search");
            continue;
          }
          const parts = trimmed.split(/\s+/);
          bestMove = parts[1];
          finalizePikafishResult();
        }
      }
    };

    socket.addEventListener("message", uciListener);

    // Send UCI search command
    const goCommand = `position fen ${fen}\ngo movetime ${Math.min(timeMs, 2000)} depth ${maxDepth}\n`;
    safeSend(goCommand);

    const timer = setTimeout(() => {
      if (activeRequestId === currentId) {
        safeSend("stop\n");
      }
    }, timeMs + 100);

    function finalizePikafishResult() {
      clearTimeout(timer);
      if (hardTimeout) {
        clearTimeout(hardTimeout);
        hardTimeout = null;
      }
      cleanup();

      if (activeRequestId !== currentId || typeof activeCallback !== "function") return;
      const cb = activeCallback;
      activeCallback = null;

      // Transform collected UCI lines into mentor analysis shape
      const formattedLines = [];
      for (const cl of collectedLines) {
        if (!cl || !cl.pv || !cl.pv[0]) continue;
        const moveCoord = uciToMove(cl.pv[0], isFlipped);
        if (!moveCoord) continue;
        formattedLines.push({
          fromCol: moveCoord.fromCol,
          fromRow: moveCoord.fromRow,
          toCol: moveCoord.toCol,
          toRow: moveCoord.toRow,
          score: cl.score,
          isMate: Boolean(cl.isMate || Math.abs(cl.score) >= 9500),
          delivermate: Boolean(cl.isMate || Math.abs(cl.score) >= 9500),
          exact: true,
          pv: cl.pv.map((mv) => uciToMove(mv, isFlipped)).filter(Boolean),
          tags: detectUciTacticalTags(cl, side, input.pieces),
          replies: cl.pv[1]
            ? [
                {
                  ...uciToMove(cl.pv[1], isFlipped),
                  score: -cl.score,
                  answer: cl.pv[2]
                    ? { ...uciToMove(cl.pv[2], isFlipped), score: cl.score }
                    : null,
                  step4: cl.pv[3]
                    ? { ...uciToMove(cl.pv[3], isFlipped), score: -cl.score }
                    : null,
                  step5: cl.pv[4]
                    ? { ...uciToMove(cl.pv[4], isFlipped), score: cl.score }
                    : null,
                },
              ]
            : [],
        });
      }

      const topScore = formattedLines[0] ? formattedLines[0].score : 0;
      const isSideInCheck = checkSideInCheck(input.pieces, side);
      const result = {
        side,
        mated: Math.abs(topScore) > 9500,
        inCheck: isSideInCheck,
        depth: collectedLines[0]?.depth || maxDepth,
        nodes: collectedLines[0]?.nodes || 0,
        engineName: "Pikafish NNUE (Native WS: 8765)",
        pikafishStatus: "native-ws",
        score: topScore,
        lines: formattedLines,
        threat: null,
        legalCount: formattedLines.length,
        ms: timeMs,
      };

      // Bảo vệ tuyệt đối: nếu vì bất kỳ lý do gì không thu được nước đi nào (tránh Kế Sách (0) làm đơ bàn cờ),
      // tự động chuyển ngay sang JS Grandmaster engine để đảm bảo luôn có kế sách
      if (formattedLines.length === 0 && allowFallback) {
        console.warn("[Pikafish Provider] Pikafish returned 0 lines, seamlessly routing to JS Grandmaster engine");
        getFallback().analyzeAsync(input, (fErr, fRes) => {
          if (typeof cb === "function") {
            if (fErr || !fRes) {
              cb(null, result);
            } else {
              cb(null, {
                ...fRes,
                engineName: "AN Grandmaster JS (Engine Dự Phòng)",
                pikafishStatus: "offline-fallback",
              });
            }
          }
        });
        return;
      }

      cb(null, result);
    }

      return function cancel() {
        if (activeRequestId === currentId) {
          clearTimeout(timer);
          if (hardTimeout) {
            clearTimeout(hardTimeout);
            hardTimeout = null;
          }
          cleanup();
          safeSend("stop\n");
          activeCallback = null;
        }
      };
    }

    // Nếu socket đang trong quá trình kết nối (CONNECTING), đợi tối đa 350ms thay vì vội vàng bỏ Pikafish!
    if (socket && socket.readyState === WebSocket.CONNECTING) {
      let isCancelled = false;
      let cancelSub = null;
      let checkCount = 0;
      const pollTimer = setInterval(() => {
        checkCount++;
        if (isCancelled) {
          clearInterval(pollTimer);
          return;
        }
        if (socketReady && socket && socket.readyState === WebSocket.OPEN) {
          clearInterval(pollTimer);
          cancelSub = runRoutine();
        } else if (
          checkCount >= 14 ||
          !socket ||
          socket.readyState !== WebSocket.CONNECTING
        ) {
          clearInterval(pollTimer);
          cancelSub = runRoutine();
        }
      }, 25);

      return () => {
        isCancelled = true;
        clearInterval(pollTimer);
        if (typeof cancelSub === "function") cancelSub();
      };
    }

    return runRoutine();
  }

  function dispose() {
    stopHeartbeat();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (socket) {
      try {
        socket.close();
      } catch (e) {}
      socket = null;
      socketReady = false;
    }
    if (wasmWorker) {
      try {
        wasmWorker.terminate();
      } catch (e) {}
      wasmWorker = null;
    }
  }

  return {
    id,
    name,
    analyzeAsync,
    quickEvaluate,
    dispose,
    ensureSocket,
    reconnect: () => ensureSocket(true),
    getTransportStatus: () => {
      if (socketReady && socket && socket.readyState === WebSocket.OPEN) {
        return {
          type: "native-ws",
          label: "WS: 8765",
          statusText: "WS Native (8765)",
          color: "emerald",
        };
      }
      return {
        type: "cloud-nnue",
        label: "Cloud D30+",
        statusText: "Cloud NNUE (D30+)",
        color: "cyan",
      };
    },
    isAvailable: () => true, // Available via Cloud Pikafish NNUE or Native UCI Bridge
  };
}

/**
 * Parses UCI `info` line string into structured object.
 * @param {string} line
 * @returns {Object|null}
 */
export function parseUciInfo(line) {
  const parts = line.trim().split(/\s+/);
  const data = {
    depth: 0,
    multipv: 1,
    score: 0,
    isMate: false,
    nodes: 0,
    nps: 0,
    pv: [],
  };

  for (let i = 0; i < parts.length; i++) {
    const token = parts[i];
    if (token === "depth") data.depth = parseInt(parts[++i], 10);
    else if (token === "multipv") data.multipv = parseInt(parts[++i], 10);
    else if (token === "score") {
      const type = parts[++i];
      const val = parseInt(parts[++i], 10);
      if (type === "cp") {
        data.score = val;
      } else if (type === "mate") {
        data.isMate = true;
        data.score = val > 0 ? 10000 - val * 2 : -10000 - val * 2;
      }
    } else if (token === "nodes") data.nodes = parseInt(parts[++i], 10);
    else if (token === "nps") data.nps = parseInt(parts[++i], 10);
    else if (token === "pv") {
      data.pv = parts.slice(i + 1);
      break;
    }
  }

  return data;
}

/**
 * Tactical tags classifier for UCI moves
 */
function detectUciTacticalTags(uciData, side, pieces) {
  const tags = [];
  if (uciData.isMate) tags.push("checks");
  const firstMove = uciData.pv[0];
  if (!firstMove) return tags;

  const mv = uciToMove(firstMove);
  if (!mv || !pieces) return tags;

  const targetPiece = pieces.find((p) => p.col === mv.toCol && p.row === mv.toRow);
  if (targetPiece) {
    tags.push("capture");
    if (targetPiece.type === 1 || targetPiece.type === 2) {
      tags.push("guard-break");
    }
  }

  // Pháo đầu / Pháo trống
  if (mv.toCol === 4) {
    const movingPiece = pieces.find((p) => p.col === mv.fromCol && p.row === mv.fromRow);
    if (movingPiece && movingPiece.type === 4) {
      tags.push("central-cannon");
    }
  }

  return tags;
}

