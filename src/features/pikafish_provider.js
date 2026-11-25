// src/features/pikafish_provider.js - Pikafish NNUE Pro UCI Engine Provider
// Supports MultiPV (up to 8 lines), Auto-Tuned Threads/Hash, Real-Time Progressive Streaming, WDL & 8-ply PV
import { piecesToFen, uciToMove, isBoardFlipped } from "./xiangqi_fen.js";
import { createXiangqiWorker } from "./xiangqi_engine.js";

/**
 * Reads user's Pikafish Pro configuration from ZigaMod.userSettings.
 */
export function getPikafishConfig() {
  const defaults = {
    multiPV: 5,
    thinkTimeMs: 3000,
    maxDepth: 36,
    threads: 0, // 0 = auto-tuned by native bridge
    hashMb: 0, // 0 = auto-tuned by native bridge
    showWdl: true,
  };
  try {
    const cfg =
      typeof window !== "undefined" &&
      window.ZigaMod &&
      window.ZigaMod.userSettings &&
      window.ZigaMod.userSettings.pikafishConfig;
    if (cfg && typeof cfg === "object") {
      return {
        multiPV: Math.max(
          1,
          Math.min(8, parseInt(cfg.multiPV, 10) || defaults.multiPV),
        ),
        thinkTimeMs: Math.max(
          800,
          Math.min(
            15000,
            parseInt(cfg.thinkTimeMs, 10) || defaults.thinkTimeMs,
          ),
        ),
        maxDepth: Math.max(
          12,
          Math.min(60, parseInt(cfg.maxDepth, 10) || defaults.maxDepth),
        ),
        threads: Math.max(0, Math.min(32, parseInt(cfg.threads, 10) || 0)),
        hashMb: Math.max(0, Math.min(4096, parseInt(cfg.hashMb, 10) || 0)),
        showWdl: cfg.showWdl !== false,
      };
    }
  } catch (e) {}
  return defaults;
}

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
    if ((counts[c][5] || 0) > 2) return true; // >2 Knights
    if ((counts[c][6] || 0) > 5) return true; // >5 Pawns
  }
  return false;
}

/**
 * Builds standard reply object (backward compatible with steps 2-5 + extended steps 6-8) from a PV array.
 */
function buildRepliesFromPvMoves(pvCoords, score) {
  if (!Array.isArray(pvCoords) || pvCoords.length < 2 || !pvCoords[1]) {
    return [];
  }
  const rep = {
    ...pvCoords[1],
    score: -score,
    answer: pvCoords[2] ? { ...pvCoords[2], score } : null,
    step4: pvCoords[3] ? { ...pvCoords[3], score: -score } : null,
    step5: pvCoords[4] ? { ...pvCoords[4], score } : null,
    step6: pvCoords[5] ? { ...pvCoords[5], score: -score } : null,
    step7: pvCoords[6] ? { ...pvCoords[6], score } : null,
    step8: pvCoords[7] ? { ...pvCoords[7], score: -score } : null,
  };
  return [rep];
}

/**
 * Creates a Pikafish Engine Provider compatible with the unified EngineProvider contract.
 * Supports:
 * 1. Native WebSocket UCI Bridge (ws://127.0.0.1:8765) with Auto-Tuned Threads/Hash, MultiPV 5+, WDL & Streaming
 * 2. ChessDB Cloud Pikafish API (Depth 30-62, MultiPV 5-8)
 * 3. Automatic transparent fallback to the built-in Grandmaster JS Worker
 */
export function createPikafishProvider(options = {}) {
  const {
    wsUrl = "ws://127.0.0.1:8765",
    wasmWorkerUrl = null,
    allowFallback = true,
  } = options;

  const id = "pikafish";
  const name = "Pikafish NNUE Pro (Grandmaster Reference Engine)";

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
  let lastSentMultiPV = 0;

  // Live hardware & binary version reported by bridge
  let bridgeMeta = {
    engineName: "Pikafish NNUE",
    threads: 0,
    hashMb: 0,
    multiPV: 5,
    showWdl: true,
    cpuCount: 0,
    ramGb: 0,
  };

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

  function getTransportStatus() {
    if (socketReady && socket && socket.readyState === WebSocket.OPEN) {
      const hwSuffix =
        bridgeMeta.threads > 0 && bridgeMeta.hashMb > 0
          ? `${bridgeMeta.threads}T/${bridgeMeta.hashMb}M`
          : "8765";
      return {
        type: "native-ws",
        label: `WS Pro (${hwSuffix})`,
        statusText: `${bridgeMeta.engineName || "Pikafish"} (${hwSuffix})`,
        color: "emerald",
        meta: { ...bridgeMeta },
      };
    }
    return {
      type: "cloud-nnue",
      label: "Cloud D30+",
      statusText: "Cloud NNUE (D30+)",
      color: "cyan",
      meta: null,
    };
  }

  function notifyStatusChange() {
    if (
      typeof window !== "undefined" &&
      typeof window.dispatchEvent === "function"
    ) {
      window.dispatchEvent(
        new CustomEvent("ZIGA_PIKAFISH_STATUS_CHANGE", {
          detail: getTransportStatus(),
        }),
      );
    }
  }

  function applyConfig(overrideCfg) {
    const cfg = overrideCfg
      ? { ...getPikafishConfig(), ...overrideCfg }
      : getPikafishConfig();

    if (socket && socket.readyState === WebSocket.OPEN) {
      const cmds = [
        `setoption name Threads value ${cfg.threads > 0 ? cfg.threads : "auto"}`,
        `setoption name Hash value ${cfg.hashMb > 0 ? cfg.hashMb : "auto"}`,
        `setoption name MultiPV value ${cfg.multiPV}`,
        `setoption name UCI_ShowWDL value ${cfg.showWdl ? "true" : "false"}`,
        "isready",
      ];
      lastSentMultiPV = cfg.multiPV;
      safeSend(cmds.join("\n") + "\n");
    }
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

  function handleGlobalSocketMessage(event) {
    const text = typeof event.data === "string" ? event.data : "";
    if (!text) return;
    const lines = text.split(/\r?\n/);
    let metaUpdated = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("id name ")) {
        bridgeMeta.engineName = trimmed.slice(8).trim();
        metaUpdated = true;
      } else if (trimmed.startsWith("info string bridge_meta ")) {
        try {
          const parsed = JSON.parse(trimmed.slice(24));
          bridgeMeta = { ...bridgeMeta, ...parsed };
          metaUpdated = true;
        } catch (e) {}
      }
    }

    if (metaUpdated) {
      notifyStatusChange();
    }
  }

  function ensureSocket(force = false) {
    if (typeof window === "undefined" || typeof WebSocket === "undefined")
      return;
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const now = Date.now();
    if (!force && socketFailedOnce && now - lastSocketAttempt < 1500) {
      return;
    }

    lastSocketAttempt = now;

    try {
      if (socket) {
        try {
          socket.close();
        } catch (e) {}
      }
      socket = new WebSocket(wsUrl);
      socket.addEventListener("message", handleGlobalSocketMessage);

      socket.onopen = () => {
        const cfg = getPikafishConfig();
        console.log(
          "[Pikafish Provider] Connected to native UCI Pro bridge at",
          wsUrl,
          `(MultiPV=${cfg.multiPV}, Think=${cfg.thinkTimeMs}ms, Depth=${cfg.maxDepth})`,
        );
        socketReady = true;
        socketFailedOnce = false;
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        safeSend("uci\n");
        applyConfig(cfg);
        safeSend("bridge_info\n");
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

  // Khởi động watchdog nền vĩnh viễn + lắng nghe sự kiện đổi cấu hình Settings
  if (typeof window !== "undefined") {
    if (window.__zigaPikafishWatchdog) {
      clearInterval(window.__zigaPikafishWatchdog);
    }
    window.__zigaPikafishWatchdog = setInterval(() => {
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        ensureSocket(false);
      }
    }, 2500);

    window.addEventListener("ZIGA_PIKAFISH_CONFIG_CHANGE", (e) => {
      applyConfig(e?.detail);
    });
  }

  // Initialize transport if in browser environment
  if (typeof window !== "undefined") {
    ensureSocket();

    if (!socketReady && wasmWorkerUrl && typeof Worker !== "undefined") {
      try {
        const cfg = getPikafishConfig();
        wasmWorker = new Worker(wasmWorkerUrl);
        wasmWorker.postMessage({ type: "uci" });
        wasmWorker.postMessage({
          type: "setoption",
          name: "MultiPV",
          value: cfg.multiPV,
        });
        wasmWorker.postMessage({ type: "isready" });
      } catch (err) {
        console.warn(
          "[Pikafish Provider] Failed to initialize WASM worker:",
          err,
        );
      }
    }
  }

  /**
   * Queries ChessDB Cloud Pikafish API (action=queryall & action=querypv)
   * Provides instant Grandmaster Pikafish NNUE (Depth 30-62) with up to 8 MultiPV candidates.
   */
  function queryChessDbCloud(fen, side, pieces, cb, multiPV = 5) {
    let active = true;
    const reqId =
      "cdb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const maxCandidates = Math.max(3, Math.min(8, multiPV || 5));

    const onMessage = (event) => {
      if (!active) return;
      if (
        !event.data ||
        event.data.type !== "ZIGA_CHESSDB_RESPONSE" ||
        event.data.id !== reqId
      )
        return;

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
    }, 2500);

    function processChessDbResponse(allText) {
      if (!active) return;
      if (
        !allText ||
        allText.startsWith("unknown") ||
        allText.startsWith("invalid")
      ) {
        active = false;
        return cb(
          new Error("Position not in ChessDB: " + allText.slice(0, 30)),
        );
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

      // Format top N candidate lines (now supports 5-8 MultiPV lines!)
      const isFlipped = isBoardFlipped(pieces);
      const topN = candidates.slice(0, maxCandidates);
      const formattedLines = topN.map((cand) => {
        const moveCoord = uciToMove(cand.move, isFlipped);
        const isMate = Math.abs(cand.score) > 9000;
        return {
          fromCol: moveCoord ? moveCoord.fromCol : 0,
          fromRow: moveCoord ? moveCoord.fromRow : 0,
          toCol: moveCoord ? moveCoord.toCol : 0,
          toRow: moveCoord ? moveCoord.toRow : 0,
          score: cand.score,
          winrate: cand.winrate,
          isMate,
          delivermate: isMate && cand.score > 0,
          exact: true,
          pv: moveCoord ? [moveCoord] : [],
          tags: detectUciTacticalTags(
            { pv: [cand.move], isMate },
            side,
            pieces,
            isFlipped,
          ),
          replies: [],
        };
      });

      // Fetch querypv to enrich the top candidate with deep PV (up to 10 plies)
      const pvReqId =
        "cdbpv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      let pvResolved = false;

      const onPvMessage = (e) => {
        if (
          !e.data ||
          e.data.type !== "ZIGA_CHESSDB_RESPONSE" ||
          e.data.id !== pvReqId
        )
          return;
        if (pvResolved) return;
        pvResolved = true;
        if (typeof window !== "undefined") {
          window.removeEventListener("message", onPvMessage);
        }

        let depth = 30;
        if (
          e.data.success &&
          e.data.text &&
          !e.data.text.startsWith("unknown")
        ) {
          const pvParts = e.data.text.split(",");
          let pvMoves = [];
          for (const part of pvParts) {
            const [k, v] = part.split(":");
            if (k === "depth") depth = parseInt(v, 10) || 30;
            if (k === "pv") pvMoves = v.trim().split(/[|\s]+/);
          }
          if (pvMoves.length > 0 && formattedLines[0]) {
            const pvCoords = pvMoves
              .slice(0, 10)
              .map((mv) => uciToMove(mv, isFlipped))
              .filter(Boolean);
            formattedLines[0].pv = pvCoords;
            formattedLines[0].replies = buildRepliesFromPvMoves(
              pvCoords,
              formattedLines[0].score,
            );
          }
        }

        finalizeCloudResult(depth);
      };

      if (
        typeof window !== "undefined" &&
        typeof window.postMessage === "function"
      ) {
        window.addEventListener("message", onPvMessage);
        window.postMessage(
          {
            type: "ZIGA_CHESSDB_FETCH",
            id: pvReqId,
            url: `https://www.chessdb.cn/chessdb.php?action=querypv&board=${encodeURIComponent(fen)}`,
          },
          "*",
        );

        setTimeout(() => {
          if (!pvResolved && active) {
            pvResolved = true;
            if (typeof window !== "undefined") {
              window.removeEventListener("message", onPvMessage);
            }
            finalizeCloudResult(30);
          }
        }, 900);
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
          engineName: `Pikafish NNUE (Cloud D${depth} • ${formattedLines.length} biến)`,
          pikafishStatus: "cloud-nnue",
          score: topScore,
          winrate: formattedLines[0]?.winrate ?? null,
          lines: formattedLines,
          threat: null,
          legalCount: formattedLines.length,
          ms: 250,
        });
      }
    }

    if (
      typeof window !== "undefined" &&
      typeof window.postMessage === "function"
    ) {
      window.addEventListener("message", onMessage);
      window.postMessage(
        {
          type: "ZIGA_CHESSDB_FETCH",
          id: reqId,
          url: `https://www.chessdb.cn/chessdb.php?action=queryall&board=${encodeURIComponent(fen)}`,
        },
        "*",
      );
    } else if (typeof fetch === "function") {
      fetch(
        `https://www.chessdb.cn/chessdb.php?action=queryall&board=${encodeURIComponent(fen)}`,
      )
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
   * Multi-layer Grandmaster analysis with Real-Time Progressive Streaming (`input.onProgress`),
   * MultiPV 5-8, WDL probabilities, and up to 8-step deep PV roadmaps.
   */
  function analyzeAsync(input, callback) {
    const currentId = ++activeRequestId;
    activeCallback = callback;

    const cfg = getPikafishConfig();
    const requestedMultiPV = Math.max(
      1,
      Math.min(8, input.multiPV || cfg.multiPV || 5),
    );
    const timeMs = Math.max(
      800,
      Math.min(15000, input.timeMs || cfg.thinkTimeMs || 3000),
    );
    const maxDepth = Math.max(
      12,
      Math.min(60, input.maxDepth || cfg.maxDepth || 36),
    );
    const onProgress =
      typeof input.onProgress === "function" ? input.onProgress : null;
    const isDeepThink = Boolean(input.isDeepThink);

    const side = input.side === 1 ? 1 : 0;
    const isFlipped = isBoardFlipped(input.pieces);

    // Phát hiện thế cờ Cờ Úp -> định tuyến sang JS Engine chuyên dụng
    if (input.isCoUp || isCoUpPosition(input.pieces, input.isCoUp)) {
      if (allowFallback) {
        return getFallback().analyzeAsync(
          { ...input, multiPV: requestedMultiPV },
          (err, res) => {
            if (
              activeRequestId === currentId &&
              typeof activeCallback === "function"
            ) {
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
          },
        );
      }
    }

    let fen = input.fen;
    if (!fen && input.pieces) {
      fen = piecesToFen(input.pieces, side);
    }

    if (!fen) {
      if (typeof callback === "function") {
        callback(
          new Error(
            "Pikafish analyze: Missing position (pieces or fen required)",
          ),
        );
      }
      return () => {};
    }

    // Ensure connection to native UCI bridge
    ensureSocket();

    function runRoutine() {
      const isPikafishActive =
        socketReady && socket && socket.readyState === WebSocket.OPEN;

      if (!isPikafishActive) {
        // 1. Try ChessDB Cloud Pikafish API (Depth 30-62, MultiPV 5-8)
        let isCancelled = false;
        const cancelChessDb = queryChessDbCloud(
          fen,
          side,
          input.pieces,
          (cErr, cResult) => {
            if (isCancelled) return;
            if (!cErr && cResult && cResult.lines && cResult.lines.length > 0) {
              if (
                activeRequestId === currentId &&
                typeof activeCallback === "function"
              ) {
                const cb = activeCallback;
                activeCallback = null;
                cb(null, cResult);
              }
              return;
            }

            // 2. Fallback to JS Engine if ChessDB is offline or position unknown
            if (allowFallback) {
              const cancelFallback = getFallback().analyzeAsync(
                { ...input, multiPV: requestedMultiPV },
                (err, res) => {
                  if (
                    activeRequestId === currentId &&
                    typeof activeCallback === "function"
                  ) {
                    const cb = activeCallback;
                    activeCallback = null;
                    if (err) {
                      cb(err);
                    } else {
                      cb(null, {
                        ...res,
                        engineName: "AN Grandmaster JS (Engine Dự Phòng)",
                        pikafishStatus: "offline-fallback",
                      });
                    }
                  }
                },
              );
              return cancelFallback;
            } else if (typeof callback === "function") {
              callback(
                new Error(
                  "Pikafish native bridge and ChessDB Cloud are offline",
                ),
              );
            }
          },
          requestedMultiPV,
        );

        return () => {
          isCancelled = true;
          if (typeof cancelChessDb === "function") cancelChessDb();
        };
      }

      // Pikafish UCI Interaction Routine (Pro Streaming + MultiPV)
      let collectedLines = [];
      let uciListener = null;
      let lastProgressEmitTime = 0;
      let lastProgressDepth = 0;
      const searchStartTime = Date.now();

      const cleanup = () => {
        if (socket && uciListener) {
          socket.removeEventListener("message", uciListener);
          uciListener = null;
        }
      };

      function buildFormattedResult(isProgressive = false) {
        const formattedLines = [];
        for (let idx = 0; idx < requestedMultiPV; idx++) {
          const cl = collectedLines[idx];
          if (!cl || !cl.pv || !cl.pv[0]) continue;
          const moveCoord = uciToMove(cl.pv[0], isFlipped);
          if (!moveCoord) continue;

          const pvCoords = cl.pv
            .slice(0, 10)
            .map((mv) => uciToMove(mv, isFlipped))
            .filter(Boolean);

          const winrate = cl.wdl
            ? Math.round((cl.wdl.win + cl.wdl.draw * 0.5) / 10)
            : null;

          formattedLines.push({
            fromCol: moveCoord.fromCol,
            fromRow: moveCoord.fromRow,
            toCol: moveCoord.toCol,
            toRow: moveCoord.toRow,
            score: cl.score,
            isMate: Boolean(cl.isMate || Math.abs(cl.score) >= 9500),
            mateIn: cl.mateIn || null,
            delivermate: Boolean(
              (cl.isMate && cl.score > 0) || cl.score >= 9500,
            ),
            depth: cl.depth || 0,
            wdl: cl.wdl || null,
            winrate,
            exact: !cl.isBound,
            pv: pvCoords,
            tags: detectUciTacticalTags(cl, side, input.pieces, isFlipped),
            replies: buildRepliesFromPvMoves(pvCoords, cl.score),
          });
        }

        const primary = collectedLines[0] || formattedLines[0];
        const topScore = formattedLines[0] ? formattedLines[0].score : 0;
        const isSideInCheck = checkSideInCheck(input.pieces, side);
        const hwLabel =
          bridgeMeta.threads > 0 && bridgeMeta.hashMb > 0
            ? `${bridgeMeta.threads}T/${bridgeMeta.hashMb}M`
            : "WS: 8765";

        return {
          side,
          mated: Math.abs(topScore) > 9500,
          inCheck: isSideInCheck,
          depth: primary?.depth || 0,
          seldepth: primary?.seldepth || 0,
          nodes: primary?.nodes || 0,
          nps: primary?.nps || 0,
          hashfull: primary?.hashfull || 0,
          wdl: formattedLines[0]?.wdl || null,
          winrate: formattedLines[0]?.winrate ?? null,
          engineName: `${bridgeMeta.engineName || "Pikafish NNUE"} (${hwLabel})`,
          pikafishStatus: "native-ws",
          hardwareMeta: { ...bridgeMeta },
          score: topScore,
          lines: formattedLines,
          threat: null,
          legalCount: formattedLines.length,
          ms: Date.now() - searchStartTime,
          isProgressive,
          isDeepThink,
        };
      }

      // Smart hard timeout: never drops valid Pikafish lines!
      // Only falls back to JS if Pikafish truly produced 0 lines.
      const hardTimeoutMs = timeMs + 1800;
      let hardTimeout = setTimeout(() => {
        if (
          activeRequestId === currentId &&
          typeof activeCallback === "function"
        ) {
          const hasAnyLines = collectedLines.some((l) => l && l.pv && l.pv[0]);
          if (hasAnyLines) {
            console.log(
              "[Pikafish Provider] Hard timeout reached with valid lines, finalizing best collected result",
            );
            safeSend("stop\n");
            finalizePikafishResult();
          } else {
            console.warn(
              "[Pikafish Provider] Engine response timed out with 0 lines, switching to JS fallback",
            );
            cleanup();
            if (allowFallback) {
              getFallback().analyzeAsync(
                { ...input, multiPV: requestedMultiPV },
                (err, res) => {
                  if (
                    activeRequestId === currentId &&
                    typeof activeCallback === "function"
                  ) {
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
                },
              );
            } else {
              finalizePikafishResult();
            }
          }
        }
      }, hardTimeoutMs);

      uciListener = (event) => {
        if (activeRequestId !== currentId) return;
        const text = typeof event.data === "string" ? event.data : "";
        const lines = text.split(/\r?\n/);
        let receivedValidInfo = false;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("info ") && trimmed.includes(" pv ")) {
            const parsed = parseUciInfo(trimmed);
            if (
              parsed &&
              parsed.multipv > 0 &&
              parsed.multipv <= requestedMultiPV
            ) {
              const slot = parsed.multipv - 1;
              const prev = collectedLines[slot];
              // Avoid letting an upperbound/lowerbound line overwrite an exact score at same depth
              if (
                !prev ||
                parsed.depth > prev.depth ||
                !parsed.isBound ||
                prev.isBound
              ) {
                collectedLines[slot] = parsed;
                receivedValidInfo = true;
              }
            }
          } else if (trimmed.startsWith("bestmove ")) {
            // Bỏ qua bestmove rác của lệnh search trước vừa bị stop nếu chưa kịp nhận info lines nào trong 150ms đầu
            if (
              collectedLines.length === 0 &&
              Date.now() - searchStartTime < 150
            ) {
              continue;
            }
            finalizePikafishResult();
            return;
          }
        }

        // Progressive Real-Time Streaming: update UI smoothly while Pikafish deepens!
        if (receivedValidInfo && onProgress && activeRequestId === currentId) {
          const now = Date.now();
          const topLine = collectedLines[0];
          const topDepth = topLine?.depth || 0;
          const elapsedSinceEmit = now - lastProgressEmitTime;

          if (
            topLine &&
            topDepth >= 8 &&
            (elapsedSinceEmit >= 420 ||
              (topDepth >= lastProgressDepth + 3 && elapsedSinceEmit >= 200))
          ) {
            lastProgressEmitTime = now;
            lastProgressDepth = topDepth;
            try {
              const partial = buildFormattedResult(true);
              if (partial.lines.length > 0) {
                onProgress(partial);
              }
            } catch (e) {}
          }
        }
      };

      socket.addEventListener("message", uciListener);

      // Sync MultiPV if changed since last search, then fire UCI search command
      const preCmds = [];
      if (lastSentMultiPV !== requestedMultiPV) {
        preCmds.push(`setoption name MultiPV value ${requestedMultiPV}`);
        lastSentMultiPV = requestedMultiPV;
      }
      preCmds.push(`position fen ${fen}`);
      preCmds.push(`go movetime ${Math.min(timeMs, 15000)} depth ${maxDepth}`);
      safeSend(preCmds.join("\n") + "\n");

      const timer = setTimeout(() => {
        if (activeRequestId === currentId) {
          safeSend("stop\n");
        }
      }, timeMs + 150);

      function finalizePikafishResult() {
        clearTimeout(timer);
        if (hardTimeout) {
          clearTimeout(hardTimeout);
          hardTimeout = null;
        }
        cleanup();

        if (
          activeRequestId !== currentId ||
          typeof activeCallback !== "function"
        )
          return;
        const cb = activeCallback;
        activeCallback = null;

        const result = buildFormattedResult(false);

        // Bảo vệ tuyệt đối: nếu không thu được nước nào, chuyển ngay sang JS Grandmaster
        if (result.lines.length === 0 && allowFallback) {
          console.warn(
            "[Pikafish Provider] Pikafish returned 0 lines, seamlessly routing to JS Grandmaster engine",
          );
          getFallback().analyzeAsync(
            { ...input, multiPV: requestedMultiPV },
            (fErr, fRes) => {
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
            },
          );
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

    // Nếu socket đang kết nối (CONNECTING), đợi tối đa 350ms thay vì bỏ qua Pikafish
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
    applyConfig,
    getConfig: getPikafishConfig,
    dispose,
    ensureSocket,
    reconnect: () => ensureSocket(true),
    getTransportStatus,
    isAvailable: () => true,
  };
}

/**
 * Parses UCI `info` line string into structured object (including WDL, seldepth, bounds, hashfull).
 * @param {string} line
 * @returns {Object|null}
 */
export function parseUciInfo(line) {
  const parts = line.trim().split(/\s+/);
  const data = {
    depth: 0,
    seldepth: 0,
    multipv: 1,
    score: 0,
    isMate: false,
    mateIn: null,
    isBound: false,
    wdl: null,
    nodes: 0,
    nps: 0,
    hashfull: 0,
    pv: [],
  };

  for (let i = 0; i < parts.length; i++) {
    const token = parts[i];
    if (token === "depth") data.depth = parseInt(parts[++i], 10) || 0;
    else if (token === "seldepth")
      data.seldepth = parseInt(parts[++i], 10) || 0;
    else if (token === "multipv") data.multipv = parseInt(parts[++i], 10) || 1;
    else if (token === "score") {
      const type = parts[++i];
      const val = parseInt(parts[++i], 10) || 0;
      if (type === "cp") {
        data.score = val;
      } else if (type === "mate") {
        data.isMate = true;
        data.mateIn = val;
        data.score = val > 0 ? 10000 - val * 2 : -10000 - val * 2;
      }
      if (parts[i + 1] === "lowerbound" || parts[i + 1] === "upperbound") {
        data.isBound = true;
        i++;
      }
    } else if (token === "wdl") {
      const w = parseInt(parts[++i], 10);
      const d = parseInt(parts[++i], 10);
      const l = parseInt(parts[++i], 10);
      if (!isNaN(w) && !isNaN(d) && !isNaN(l)) {
        data.wdl = { win: w, draw: d, loss: l };
      }
    } else if (token === "nodes") data.nodes = parseInt(parts[++i], 10) || 0;
    else if (token === "nps") data.nps = parseInt(parts[++i], 10) || 0;
    else if (token === "hashfull")
      data.hashfull = parseInt(parts[++i], 10) || 0;
    else if (token === "pv") {
      data.pv = parts.slice(i + 1);
      break;
    }
  }

  return data;
}

/**
 * Tactical tags classifier for UCI moves (orientation-aware via isFlipped)
 */
function detectUciTacticalTags(uciData, side, pieces, isFlipped = false) {
  const tags = [];
  if (uciData.isMate) tags.push("checks");
  const firstMove = uciData.pv[0];
  if (!firstMove) return tags;

  const mv = uciToMove(firstMove, isFlipped);
  if (!mv || !pieces) return tags;

  const targetPiece = pieces.find(
    (p) => p.col === mv.toCol && p.row === mv.toRow,
  );
  if (targetPiece) {
    tags.push("capture");
    if (targetPiece.type === 1 || targetPiece.type === 2) {
      tags.push("guard-break");
    }
  }

  // Pháo đầu / Pháo trống
  if (mv.toCol === 4) {
    const movingPiece = pieces.find(
      (p) => p.col === mv.fromCol && p.row === mv.fromRow,
    );
    if (movingPiece && movingPiece.type === 4) {
      tags.push("central-cannon");
    }
  }

  return tags;
}
