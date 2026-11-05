// scripts/pikafish_bridge.js - Native WebSocket UCI Bridge for Pikafish NNUE
// Connects Chrome Extension frontend (PikafishProvider) to the official Pikafish binary.
const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { WebSocketServer, WebSocket } = require("ws");

const PORT = parseInt(
  process.env.PORT || process.env.PIKAFISH_PORT || "8765",
  10,
);
const HOST = "127.0.0.1";

function resolvePikafishExe() {
  const dir = path.resolve(__dirname, "../third_party/pikafish");
  const candidates = [
    path.join(dir, "Pikafish-Windows-x86-64-universal.exe"),
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
console.log(
  "==================================================================",
);
console.log("🦆 AN XIANQI - PIKAFISH NNUE NATIVE WEBSOCKET BRIDGE");
console.log(
  "==================================================================",
);
console.log(`📍 Engine binary: ${exePath}`);
console.log(`🧠 Model file:    ${path.join(exeDir, "pikafish.nnue")}`);

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
        engine: "Pikafish NNUE",
        binary: path.basename(exePath),
        port: PORT,
      }),
    );
    return;
  }

  res.writeHead(404);
  res.end();
});

// Attach WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const clientAddr = req.socket.remoteAddress;
  console.log(`[Bridge] 🟢 Client connected from ${clientAddr}`);

  // Spawn isolated Pikafish instance for this connection
  let engine = null;
  try {
    engine = spawn(exePath, [], { cwd: exeDir });
    // Pre-configure Pikafish in Hardcore Grandmaster Mode (4 Threads, 64MB Hash, MultiPV 3, Skill 20)
    engine.stdin.write(
      "uci\nsetoption name Threads value 4\nsetoption name Hash value 64\nsetoption name MultiPV value 3\nsetoption name Skill Level value 20\nisready\n",
    );
  } catch (err) {
    console.error("[Bridge] Failed to spawn Pikafish:", err);
    ws.send(`err Failed to spawn engine: ${err.message}\n`);
    ws.close();
    return;
  }

  engine.stdout.on("data", (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data.toString());
    }
  });

  engine.stderr.on("data", (data) => {
    console.warn(`[Pikafish stderr] ${data.toString()}`);
  });

  engine.on("close", (code) => {
    console.log(`[Bridge] Pikafish process exited with code ${code}`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  ws.on("message", (msg) => {
    const str = msg.toString();
    if (engine && engine.stdin.writable) {
      engine.stdin.write(str.endsWith("\n") ? str : str + "\n");
    }
  });

  ws.on("close", () => {
    console.log(`[Bridge] ⛔ Client disconnected (${clientAddr})`);
    if (engine) {
      try {
        engine.stdin.write("quit\n");
      } catch (e) {}
      setTimeout(() => {
        try {
          engine.kill();
        } catch (e) {}
      }, 500);
    }
  });

  ws.on("error", (err) => {
    console.error(`[Bridge] WebSocket error:`, err);
  });
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
