// src/features/engine_provider.js - Unified Engine Provider Architecture
// Conforms to AN Xiangqi AI Agent Specification (09-pikafish.md & 08_API_AND_INTEGRATION_CONTRACT.md)
import { createXiangqiWorker } from "./xiangqi_engine.js";
import { createPikafishProvider } from "./pikafish_provider.js";

/**
 * Creates the standard Grandmaster JavaScript Engine Provider.
 * Wraps createXiangqiWorker() with unified EngineProvider interface.
 * @returns {Object} EngineProvider
 */
export function createJsEngineProvider() {
  const worker = createXiangqiWorker();
  return {
    id: "js-engine",
    name: "AN Grandmaster Engine (In-Browser Web Worker)",
    analyzeAsync: worker.analyzeAsync,
    quickEvaluate: worker.quickEvaluate,
    dispose: () => {},
    isAvailable: () => true,
    engine: worker.engine,
    MATE: worker.MATE,
  };
}

let activeProviderId = "pikafish";
let jsEngineInstance = null;
let pikafishInstance = null;

/**
 * Gets the current active Engine Provider (defaults to "pikafish").
 * @param {"js-engine" | "pikafish"} [requestedId]
 * @returns {Object} EngineProvider
 */
export function getEngineProvider(requestedId) {
  const targetId = requestedId || activeProviderId;

  if (targetId === "pikafish") {
    if (!pikafishInstance) {
      pikafishInstance = createPikafishProvider({ allowFallback: true });
    }
    return pikafishInstance;
  }

  if (!jsEngineInstance) {
    jsEngineInstance = createJsEngineProvider();
  }
  return jsEngineInstance;
}

/**
 * Sets the active Engine Provider for AN Mentor.
 * @param {"js-engine" | "pikafish"} providerId
 */
export function setEngineProvider(providerId) {
  if (providerId === "pikafish" || providerId === "js-engine") {
    activeProviderId = providerId;
    console.log(`[Engine Provider] Switched active provider to: "${providerId}"`);
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("ZIGA_PIKAFISH_STATUS_CHANGE", { detail: getEngineTransportStatus() }));
    }
  }
}

/**
 * Gets transport status of current engine provider.
 */
export function getEngineTransportStatus() {
  if (activeProviderId === "pikafish") {
    const pika = getEngineProvider("pikafish");
    if (pika && typeof pika.getTransportStatus === "function") {
      return pika.getTransportStatus();
    }
    return {
      type: "cloud-nnue",
      label: "Cloud D30+",
      color: "cyan",
    };
  }
  return {
    type: "js-engine",
    label: "JS Worker",
    color: "cyan",
  };
}

/**
 * Forces WebSocket reconnection attempt to local Pikafish bridge.
 */
export function reconnectPikafish() {
  const pika = getEngineProvider("pikafish");
  if (pika && typeof pika.reconnect === "function") {
    pika.reconnect();
  }
}

/**
 * Lists available engine providers with their connection status.
 */
export function listEngineProviders() {
  const js = getEngineProvider("js-engine");
  const pika = getEngineProvider("pikafish");
  return [
    {
      id: "js-engine",
      name: js.name,
      isActive: activeProviderId === "js-engine",
      available: true,
      description: "Động cơ Cờ Tướng JavaScript thuần tích hợp sẵn, độ trễ thấp, Zero GC.",
    },
    {
      id: "pikafish",
      name: pika.name,
      isActive: activeProviderId === "pikafish",
      available: pika.isAvailable(),
      description: "Động cơ đại cao thủ Pikafish NNUE (kết nối qua Native Bridge hoặc WASM).",
    },
  ];
}

