// scripts/pikafish_bridge.js - Native WebSocket UCI Bridge for Pikafish NNUE (Pro Auto-Tuned)
// Connects Chrome Extension frontend (PikafishProvider) to the official Pikafish binary.
const http = require("http");
const os = require("os");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { WebSocketServer, WebSocket } = require("ws");

const PORT = parseInt(
  process.env.PORT || process.env.PIKAFISH_PORT || "8765",
  10,
);
const HOST = "127.0.0.1";

// =========================================================================
// AUTO-TUNED HARDWARE DETECTION (Threads & Hash Table)
// =========================================================================
const CPU_COUNT = (os.cpus() || []).length || 4;
const TOTAL_RAM_GB = Math.round((os.totalmem() / (1024 * 1024 * 1024)) * 10) / 10;

// Leave 2 logical threads free for Chrome/OS on 6+ thread CPUs so board stays 60fps
const AUTO_THREADS =
  parseInt(process.env.PIKAFISH_THREADS || "0", 10) ||
  (CPU_COUNT >= 6
    ? Math.min(16, CPU_COUNT - 2)
    : Math.max(1, CPU_COUNT - 1));

// Scale Hash Table cleanly with system RAM (128MB -> 256MB -> 512MB -> 1024MB)
const AUTO_HASH_MB =
  parseInt(process.env.PIKAFISH_HASH || "0", 10) ||
  (TOTAL_RAM_GB >= 30
    ? 1024
    : TOTAL_RAM_GB >= 14
      ? 512
      : TOTAL_RAM_GB >= 7
        ? 256
        : 128);

const DEFAULT_MULTIPV = Math.max(
  1,
  Math.min(12, parseInt(process.env.PIKAFISH_MULTIPV || "5", 10) || 5),
);

function resolvePikafishExe() {
  const possibleDirs = [
    path.resolve(path.dirname(process.execPath), "third_party/pikafish"),
    path.resolve(process.cwd(), "third_party/pikafish"),
    path.resolve(__dirname, "../third_party/pikafish"),
    path.resolve(__dirname, "./third_party/pikafish"),
  ];

  for (const dir of possibleDirs) {
    const candidates = [
      path.join(dir, "Pikafish-Windows-x86-64-universal.exe"),
      path.join(dir, "pikafish-avx512.exe"),
      path.join(dir, "pikafish-bmi2.exe"),
      path.join(dir, "pikafish-avx2.exe"),
      path.join(dir, "pikafish.exe"),
      path.join(dir, "Pikafish-Linux-x86-64-universal"),
      path.join(dir, "Pikafish-MacOS-universal"),
      path.join(dir, "pikafish"),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return c;
      }
    }

    // Tự động giải nén Pikafish.7z nếu có sẵn trong thư mục
    const archivePath = path.join(dir, "Pikafish.7z");
    if (fs.existsSync(archivePath)) {
      console.log(
        "📦 Đang tự động giải nén Pikafish.7z qua lệnh tar hệ thống...",
      );
      try {
        const { execSync } = require("child_process");
        execSync(`tar -xf "${archivePath}" -C "${dir}"`, { stdio: "inherit" });
        for (const c of candidates) {
          if (fs.existsSync(c)) return c;
        }
      } catch (e) {
        console.warn("⚠️ Tự động giải nén thất bại:", e.message);
      }
    }
  }

  return null;
}

const exePath = resolvePikafishExe();
if (!exePath) {
  console.error(
    "❌ ERROR: Pikafish executable not found in third_party/pikafish/",
  );
  console.error(
    "Please ensure Pikafish binary exists in third_party/pikafish/",
  );
  process.exit(1);
}

const exeDir = path.dirname(exePath);
const nnuePath = path.join(exeDir, "pikafish.nnue");
const nnueSizeMb = fs.existsSync(nnuePath)
  ? (fs.statSync(nnuePath).size / (1024 * 1024)).toFixed(1)
  : "N/A";

let detectedEngineName = "Pikafish NNUE";

console.log(
  "==================================================================",
);
console.log("🦆 AN XIANGQI - PIKAFISH NNUE PRO WEBSOCKET BRIDGE");
console.log(
  "==================================================================",
);
console.log(`📍 Engine binary: ${exePath}`);
console.log(`🧠 Model file:    ${nnuePath} (${nnueSizeMb} MB)`);
console.log(
  `⚙️  Hardware Auto: ${CPU_COUNT} CPU threads / ${TOTAL_RAM_GB} GB RAM`,
);
console.log(
  `🚀 Engine Config: Threads=${AUTO_THREADS} | Hash=${AUTO_HASH_MB}MB | MultiPV=${DEFAULT_MULTIPV} | WDL=ON`,
);

// Create HTTP server for health check & status
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/status" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ready",
        engine: detectedEngineName,
        binary: path.basename(exePath),
        nnueSizeMb,
        port: PORT,
        hardware: {
          cpuCount: CPU_COUNT,
          ramGb: TOTAL_RAM_GB,
          autoThreads: AUTO_THREADS,
          autoHashMb: AUTO_HASH_MB,
          defaultMultiPV: DEFAULT_MULTIPV,
        },
      }),
    );
    return;
  }

  res.writeHead(404);
  res.end();
});

let sessionCounter = 0;

// Attach WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const sessionId = ++sessionCounter;
  const sessionTag = `[Session #${sessionId}]`;
  const clientAddr = req.socket.remoteAddress;

  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  // Track active UCI parameters for this session
  const sessionState = {
    engineName: detectedEngineName,
    threads: AUTO_THREADS,
    hashMb: AUTO_HASH_MB,
    multiPV: DEFAULT_MULTIPV,
    showWdl: true,
    cpuCount: CPU_COUNT,
    ramGb: TOTAL_RAM_GB,
    nnueSizeMb,
  };

  function sendBridgeMeta() {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(`info string bridge_meta ${JSON.stringify(sessionState)}\n`);
      } catch (e) {}
    }
  }

  // Isolated Pikafish instance manager for this connection
  let engine = null;

  function spawnEngine() {
    try {
      const eng = spawn(exePath, [], { cwd: exeDir });
      console.log(
        `${sessionTag} 🟢 Spawned Pikafish (PID: ${eng.pid}) for client ${clientAddr} [${sessionState.threads}T / ${sessionState.hashMb}MB / MultiPV ${sessionState.multiPV}]`,
      );

      // Prevent unhandled EPIPE crash if Pikafish process exits
      eng.stdin.on("error", (err) => {
        console.warn(`${sessionTag} [Engine stdin error]:`, err.message);
      });

      eng.on("error", (err) => {
        console.error(`${sessionTag} ❌ Engine process error:`, err.message);
      });

      // Pre-configure Pikafish in Auto-Tuned Grandmaster Pro Mode
      try {
        eng.stdin.write(
          [
            "uci",
            `setoption name Threads value ${sessionState.threads}`,
            `setoption name Hash value ${sessionState.hashMb}`,
            `setoption name MultiPV value ${sessionState.multiPV}`,
            "setoption name UCI_ShowWDL value true",
            "isready",
          ].join("\n") + "\n",
        );
      } catch (e) {
        console.warn(`${sessionTag} Error initializing engine:`, e.message);
      }

      eng.stdout.on("data", (data) => {
        const text = data.toString();

        // Capture exact Pikafish binary version string (e.g. "id name Pikafish 2026-09-06")
        const idMatch = text.match(/id name ([^\r\n]+)/);
        if (idMatch && idMatch[1]) {
          detectedEngineName = idMatch[1].trim();
          sessionState.engineName = detectedEngineName;
        }

        if (text.includes("uciok")) {
          sendBridgeMeta();
        }
        if (text.includes("readyok")) {
          console.log(
            `${sessionTag} ⚡ ${sessionState.engineName} ready (${sessionState.threads}T, ${sessionState.hashMb}MB Hash, MultiPV ${sessionState.multiPV})`,
          );
          sendBridgeMeta();
        }
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(text);
          } catch (e) {
            console.warn(`${sessionTag} Error sending to client:`, e.message);
          }
        }
      });

      eng.stderr.on("data", (data) => {
        console.warn(`${sessionTag} [Pikafish stderr] ${data.toString()}`);
      });

      eng.on("close", (code) => {
        console.log(
          `${sessionTag} 🏁 Engine PID ${eng.pid} closed (code: ${code ?? 0})`,
        );
      });

      return eng;
    } catch (err) {
      console.error(`${sessionTag} ❌ Failed to spawn Pikafish:`, err);
      return null;
    }
  }

  engine = spawnEngine();
  if (!engine) {
    try {
      ws.send("err Failed to spawn engine\n");
      ws.close();
    } catch (e) {}
    return;
  }

  function normalizeUciLine(rawLine) {
    const trimmed = rawLine.trim();
    if (!trimmed) return null;

    if (trimmed === "ping") {
      try {
        ws.send("pong\n");
      } catch (e) {}
      return null;
    }

    if (trimmed === "bridge_info") {
      sendBridgeMeta();
      return null;
    }

    // Intercept setoption to resolve "auto" / "0" values cleanly and track state
    const optMatch = trimmed.match(/^setoption\s+name\s+(.+?)\s+value\s+(.+)$/i);
    if (optMatch) {
      const optName = optMatch[1].trim();
      const optValRaw = optMatch[2].trim();
      const lowerName = optName.toLowerCase();

      if (lowerName === "threads") {
        const parsed =
          optValRaw.toLowerCase() === "auto"
            ? AUTO_THREADS
            : parseInt(optValRaw, 10) || AUTO_THREADS;
        const clamped = Math.max(1, Math.min(CPU_COUNT, parsed));
        sessionState.threads = clamped;
        return `setoption name Threads value ${clamped}`;
      }

      if (lowerName === "hash") {
        const parsed =
          optValRaw.toLowerCase() === "auto"
            ? AUTO_HASH_MB
            : parseInt(optValRaw, 10) || AUTO_HASH_MB;
        const clamped = Math.max(16, Math.min(4096, parsed));
        sessionState.hashMb = clamped;
        return `setoption name Hash value ${clamped}`;
      }

      if (lowerName === "multipv") {
        const parsed = parseInt(optValRaw, 10) || DEFAULT_MULTIPV;
        const clamped = Math.max(1, Math.min(12, parsed));
        sessionState.multiPV = clamped;
        return `setoption name MultiPV value ${clamped}`;
      }

      if (lowerName === "uci_showwdl") {
        const isTrue = optValRaw.toLowerCase() === "true";
        sessionState.showWdl = isTrue;
        return `setoption name UCI_ShowWDL value ${isTrue ? "true" : "false"}`;
      }
    }

    return trimmed;
  }

  ws.on("message", (msg) => {
    ws.isAlive = true;
    const raw = msg.toString();
    if (!raw.trim()) return;

    const lines = raw.split(/\r?\n/);
    const outCommands = [];
    let configChanged = false;

    for (const l of lines) {
      const normalized = normalizeUciLine(l);
      if (normalized) {
        if (normalized.startsWith("setoption ")) configChanged = true;
        outCommands.push(normalized);
      }
    }

    if (outCommands.length === 0) return;

    if (
      !engine ||
      engine.exitCode !== null ||
      !engine.stdin ||
      !engine.stdin.writable
    ) {
      console.log(`${sessionTag} 🔄 Engine process dead, respawning...`);
      engine = spawnEngine();
    }

    if (engine && engine.stdin && engine.stdin.writable) {
      try {
        engine.stdin.write(outCommands.join("\n") + "\n");
        if (configChanged) {
          sendBridgeMeta();
        }
      } catch (e) {
        console.warn(`${sessionTag} Stdin write failed:`, e.message);
      }
    } else if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send("bestmove (none)\n");
      } catch (e) {}
    }
  });

  ws.on("close", () => {
    console.log(
      `${sessionTag} ⛔ Client disconnected, stopping engine PID ${engine?.pid || "unknown"}...`,
    );
    if (engine && engine.exitCode === null) {
      try {
        engine.stdin.write("quit\n");
      } catch (e) {}
      setTimeout(() => {
        try {
          if (engine && engine.exitCode === null && !engine.killed) {
            engine.kill();
          }
        } catch (e) {}
      }, 1000);
    }
  });

  ws.on("error", (err) => {
    console.error(`${sessionTag} ⚠️ WebSocket error:`, err);
  });
});

// Periodic ping/pong heartbeat to keep TCP alive and sweep dead connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log(
        "[Bridge] Client ping timed out, terminating inactive connection...",
      );
      return ws.terminate();
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch (e) {}
  });
}, 20000);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Bridge listening at ws://${HOST}:${PORT}`);
  console.log(`🌐 Ready for AN Xiangqi extension connection!`);
  console.log(
    "==================================================================",
  );
});

// Graceful exit
process.on("SIGINT", () => {
  console.log("\n[Bridge] Shutting down bridge...");
  wss.close();
  server.close();
  process.exit(0);
});
