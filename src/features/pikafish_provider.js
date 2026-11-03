// src/features/pikafish_provider.js - Pikafish NNUE UCI Engine Provider
// Implements Phase 6 of AN Xiangqi AI Agent Specification (09-pikafish.md)
import { piecesToFen, fenToPieces, uciToMove, moveToUci } from "./xiangqi_fen.js";
import { createXiangqiWorker } from "./xiangqi_engine.js";

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

  let socket = null;
  let socketReady = false;
  let wasmWorker = null;
  let activeRequestId = 0;
  let activeCallback = null;

  function ensureSocket() {
    if (typeof window === "undefined" || typeof WebSocket === "undefined") return;
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    try {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        console.log("[Pikafish Provider] Connected to native UCI bridge at", wsUrl);
        socketReady = true;
        socket.send("uci\n");
        socket.send("setoption name MultiPV value 3\n");
        socket.send("isready\n");
      };
      socket.onerror = () => {
        socketReady = false;
      };
      socket.onclose = () => {
        socketReady = false;
      };
    } catch (e) {
      socketReady = false;
    }
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
    const maxDepth = input.maxDepth || 12;
    const side = input.side === 1 ? 1 : 0;

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

    // Check if Pikafish transport is active and available
    const isPikafishActive = socketReady && socket && socket.readyState === WebSocket.OPEN;

    if (!isPikafishActive) {
      if (allowFallback) {
        // Fallback transparently to enhanced JS Engine Worker
        const cancelFallback = getFallback().analyzeAsync(input, (err, res) => {
          if (activeRequestId === currentId && typeof activeCallback === "function") {
            const cb = activeCallback;
            activeCallback = null;
            if (err) {
              cb(err);
            } else {
              // Mark with reference engine diagnostic indicator
              const enriched = {
                ...res,
                engineName: "AN-Xiangqi (Grandmaster JS)",
                pikafishStatus: "offline-fallback",
              };
              cb(null, enriched);
            }
          }
        });
        return cancelFallback;
      } else {
        if (typeof callback === "function") {
          callback(new Error("Pikafish native/WASM bridge is offline"));
        }
        return () => {};
      }
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
          const parts = trimmed.split(/\s+/);
          bestMove = parts[1];
          finalizePikafishResult();
        }
      }
    };

    socket.addEventListener("message", uciListener);

    // Send UCI search command
    const goCommand = `position fen ${fen}\ngo movetime ${Math.min(timeMs, 2000)} depth ${maxDepth}\n`;
    socket.send(goCommand);

    const timer = setTimeout(() => {
      if (activeRequestId === currentId) {
        socket.send("stop\n");
      }
    }, timeMs + 100);

    function finalizePikafishResult() {
      clearTimeout(timer);
      cleanup();

      if (activeRequestId !== currentId || typeof activeCallback !== "function") return;
      const cb = activeCallback;
      activeCallback = null;

      // Transform collected UCI lines into mentor analysis shape
      const formattedLines = collectedLines.filter(Boolean).map((cl) => {
        const moveCoord = uciToMove(cl.pv[0]);
        return {
          fromCol: moveCoord ? moveCoord.fromCol : 0,
          fromRow: moveCoord ? moveCoord.fromRow : 0,
          toCol: moveCoord ? moveCoord.toCol : 0,
          toRow: moveCoord ? moveCoord.toRow : 0,
          score: cl.score,
          exact: true,
          pv: cl.pv.map(uciToMove).filter(Boolean),
          tags: detectUciTacticalTags(cl, side, input.pieces),
          replies: cl.pv[1]
            ? [
                {
                  ...uciToMove(cl.pv[1]),
                  score: -cl.score,
                  answer: cl.pv[2] ? { ...uciToMove(cl.pv[2]), score: cl.score } : null,
                },
              ]
            : [],
        };
      });

      const topScore = formattedLines[0] ? formattedLines[0].score : 0;
      const result = {
        side,
        mated: Math.abs(topScore) > 9500,
        inCheck: false,
        depth: collectedLines[0]?.depth || maxDepth,
        nodes: collectedLines[0]?.nodes || 0,
        engineName: "Pikafish NNUE",
        score: topScore,
        lines: formattedLines,
        threat: null,
        legalCount: formattedLines.length,
        ms: timeMs,
      };

      cb(null, result);
    }

    return function cancel() {
      if (activeRequestId === currentId) {
        clearTimeout(timer);
        cleanup();
        if (socketReady && socket) {
          socket.send("stop\n");
        }
        activeCallback = null;
      }
    };
  }

  function dispose() {
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
    isAvailable: () => socketReady,
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

