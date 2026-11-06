// src/main.js - Game data extraction, material calculation, ad cleaner, and main update loop
(function (ZigaMod) {
  "use strict";

  console.log("[AN Mod] Main module initializing...");

  let lastStateHash = "";

  function getActiveGameLayer() {
    if (!window.BkGlobal || !window.BkGlobal.Yj) return null;
    return window.BkGlobal.Yj.ja ? window.BkGlobal.Yj.ja() : null;
  }

  function getActiveGameData() {
    if (!window.BkGlobal || !window.BkGlobal.Yj) return null;
    const gameLayer = window.BkGlobal.Yj.ja ? window.BkGlobal.Yj.ja() : null;
    if (
      !gameLayer ||
      !gameLayer.V ||
      !Array.isArray(gameLayer.V) ||
      gameLayer.V.length !== 32
    ) {
      return null;
    }

    const logicMgr = window.BkLogicManager ? window.BkLogicManager.na() : null;
    const myPlayer = logicMgr && logicMgr.Ba ? logicMgr.Ba() : null;

    let myColor = 0;
    let isSpectator = false;

    // 1. Lấy thông tin định danh người chơi cục bộ
    let localUserName = "";
    if (myPlayer && typeof myPlayer.getName === "function") {
      localUserName = myPlayer.getName() || "";
    }
    if (!localUserName && window.BkGlobal && window.BkGlobal.Z && window.BkGlobal.Z.userName) {
      localUserName = window.BkGlobal.Z.userName || "";
    }

    const localUserId =
      (myPlayer && (myPlayer.id || myPlayer.userId)) ||
      (window.BkGlobal && window.BkGlobal.Z && (window.BkGlobal.Z.id || window.BkGlobal.Z.userId)) ||
      "";

    const redUserName =
      gameLayer.gc && gameLayer.gc.Z ? gameLayer.gc.Z.userName : "";
    const blackUserName =
      gameLayer.dc && gameLayer.dc.Z ? gameLayer.dc.Z.userName : "";
    const redUserId =
      gameLayer.gc && gameLayer.gc.Z ? (gameLayer.gc.Z.id || gameLayer.gc.Z.userId) : "";
    const blackUserId =
      gameLayer.dc && gameLayer.dc.Z ? (gameLayer.dc.Z.id || gameLayer.dc.Z.userId) : "";

    if (myPlayer) {
      isSpectator = !!myPlayer.Ka;
    }

    // 2. Định vị quân Tướng (type 0) trên bàn cờ để xác định phe nào đang ở nửa dưới (bàn cờ của người chơi):
    // Trên Ziga, người chơi trực tiếp luôn luôn được xếp ngồi ở nửa dưới màn hình.
    let bottomKingColor = null;
    let redKingSprite = null;
    let blackKingSprite = null;

    for (let i = 0; i < gameLayer.V.length; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      const type = p.Ga !== undefined ? p.Ga : 6;
      const color = p.ka !== undefined ? p.ka : Math.floor(i / 16);
      if (type === 0) {
        if (color === 0) redKingSprite = p;
        else if (color === 1) blackKingSprite = p;
      }
    }

    if (redKingSprite && blackKingSprite) {
      const redY =
        typeof redKingSprite.getPositionY === "function"
          ? redKingSprite.getPositionY()
          : redKingSprite.y;
      const blackY =
        typeof blackKingSprite.getPositionY === "function"
          ? blackKingSprite.getPositionY()
          : blackKingSprite.y;

      if (typeof redY === "number" && typeof blackY === "number" && redY !== blackY) {
        // Tọa độ Cocos2d y nhỏ hơn là ở phía dưới đáy màn hình
        bottomKingColor = blackY < redY ? 1 : 0;
      } else if (
        typeof redKingSprite.rowIndex === "number" &&
        typeof blackKingSprite.rowIndex === "number"
      ) {
        if (blackKingSprite.rowIndex <= 2 && redKingSprite.rowIndex >= 7) {
          bottomKingColor = 1;
        } else if (redKingSprite.rowIndex <= 2 && blackKingSprite.rowIndex >= 7) {
          bottomKingColor = 0;
        }
      }
    }

    // 3. Định vị ghế avatar người chơi: Trên Ziga, avatar người chơi cục bộ luôn ở bên trái bàn cờ
    let avatarColor = null;
    if (gameLayer.gc && gameLayer.dc) {
      const gcx =
        typeof gameLayer.gc.getPositionX === "function"
          ? gameLayer.gc.getPositionX()
          : gameLayer.gc.x;
      const dcx =
        typeof gameLayer.dc.getPositionX === "function"
          ? gameLayer.dc.getPositionX()
          : gameLayer.dc.x;
      if (typeof gcx === "number" && typeof dcx === "number" && gcx !== dcx) {
        avatarColor = dcx < gcx ? 1 : 0;
      }
    }

    // 4. Quyết định phe người chơi (0: Đỏ, 1: Đen) với cơ chế nhiều lớp bảo vệ:
    if (localUserId && blackUserId && localUserId === blackUserId) {
      myColor = 1;
    } else if (localUserId && redUserId && localUserId === redUserId) {
      myColor = 0;
    } else if (
      localUserName &&
      blackUserName &&
      localUserName === blackUserName &&
      localUserName !== redUserName
    ) {
      myColor = 1;
    } else if (
      localUserName &&
      redUserName &&
      localUserName === redUserName &&
      localUserName !== blackUserName
    ) {
      myColor = 0;
    } else if (!isSpectator && bottomKingColor !== null) {
      // Ưu tiên cực cao: Tướng ở nửa dưới bàn cờ chính là phe của người chơi thực tế
      myColor = bottomKingColor;
    } else if (!isSpectator && avatarColor !== null) {
      // Ưu tiên phụ: Avatar ghế người chơi nằm bên trái
      myColor = avatarColor;
    } else if (
      !isSpectator &&
      myPlayer &&
      myPlayer.ka !== undefined &&
      (myPlayer.ka === 0 || myPlayer.ka === 1)
    ) {
      myColor = myPlayer.ka;
    } else if (
      gameLayer.Nj !== undefined &&
      (gameLayer.Nj === 0 || gameLayer.Nj === 1)
    ) {
      myColor = gameLayer.Nj;
    } else if (bottomKingColor !== null) {
      myColor = bottomKingColor;
    }

    const oppColor = 1 - myColor;

    let myName =
      localUserName ||
      (myColor === 0 ? redUserName || "Bên Đỏ" : blackUserName || "Bên Đen");
    let oppName =
      oppColor === 0 ? redUserName || "Bên Đỏ" : blackUserName || "Bên Đen";

    const deadMyPieces = [];
    const deadOppPieces = [];
    const aliveMyPieces = [];
    const aliveOppPieces = [];

    for (let i = 0; i < gameLayer.V.length; i++) {
      const p = gameLayer.V[i];
      if (!p) continue;

      const isDead = !!p.pa;
      const color = p.ka !== undefined ? p.ka : Math.floor(i / 16);
      const type = p.Ga !== undefined ? p.Ga : 6;

      const item = {
        index: i,
        type: type,
        color: color,
        isDead: isDead,
      };

      if (color === myColor) {
        if (isDead) deadMyPieces.push(item);
        else aliveMyPieces.push(item);
      } else {
        if (isDead) deadOppPieces.push(item);
        else aliveOppPieces.push(item);
      }
    }

    return {
      gameLayer,
      myColor,
      oppColor,
      myName,
      oppName,
      isSpectator,
      deadMyPieces,
      deadOppPieces,
      aliveMyPieces,
      aliveOppPieces,
    };
  }

  function computeMaterialScore(aliveMy, aliveOpp) {
    let myScore = 0;
    let oppScore = 0;
    const myCounts = { 3: 0, 4: 0, 5: 0, 1: 0, 2: 0, 6: 0 };
    const oppCounts = { 3: 0, 4: 0, 5: 0, 1: 0, 2: 0, 6: 0 };

    aliveMy.forEach((p) => {
      const def = ZigaMod.PIECE_DEFS[p.type];
      if (def) {
        myScore += def.value;
        if (myCounts[p.type] !== undefined) myCounts[p.type]++;
      }
    });

    aliveOpp.forEach((p) => {
      const def = ZigaMod.PIECE_DEFS[p.type];
      if (def) {
        oppScore += def.value;
        if (oppCounts[p.type] !== undefined) oppCounts[p.type]++;
      }
    });

    const diff = myScore - oppScore;
    return { myScore, oppScore, diff, myCounts, oppCounts };
  }

  function countKeyPieces(alivePieces) {
    let xe = 0,
      phao = 0,
      ma = 0;
    alivePieces.forEach((p) => {
      if (p.type === 3) xe++;
      if (p.type === 4) phao++;
      if (p.type === 5) ma++;
    });
    return `${xe}X · ${phao}P · ${ma}M`;
  }

  function cleanObstructingAds() {
    const adSelectors = [
      "ins.adsbygoogle",
      ".google-auto-placed",
      'iframe[id^="aswift"]',
      'iframe[name^="aswift"]',
      'div[id^="aswift"]',
      'div[id^="google_ads"]',
      'iframe[id^="google_ads"]',
      ".ads-frame",
      '[id*="banner_left"]',
      '[id*="banner_right"]',
      '[class*="banner-left"]',
      '[class*="banner-right"]',
    ];

    for (let i = 0; i < adSelectors.length; i++) {
      const nodes = document.querySelectorAll(adSelectors[i]);
      for (let j = 0; j < nodes.length; j++) {
        const el = nodes[j];
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("pointer-events", "none", "important");
        el.style.setProperty("z-index", "-9999", "important");
        el.style.setProperty("width", "0", "important");
        el.style.setProperty("height", "0", "important");
      }
    }

    if (document.body) {
      const children = document.body.children;
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (
          !el ||
          el.id === "ziga-mod-widget" ||
          el.id === "ziga-sandbox-modal" ||
          (el.id && el.id.startsWith("ziga-")) ||
          el.classList.contains("ziga-shadcn-root") ||
          el.classList.contains("ziga-sandbox-overlay") ||
          el.classList.contains("ziga-mod-container") ||
          el.hasAttribute("data-base-ui-portal") ||
          el.hasAttribute("data-slot") ||
          el.querySelector("[data-slot]") ||
          el.id === "gameCanvas" ||
          el.id === "Cocos2dGameContainer" ||
          el.classList.contains("modal")
        ) {
          continue;
        }
        try {
          const comp = window.getComputedStyle(el);
          if (comp.position === "fixed") {
            if (
              el.querySelector("iframe") ||
              el.querySelector("ins") ||
              el.tagName === "IFRAME" ||
              el.tagName === "INS" ||
              (el.className &&
                typeof el.className === "string" &&
                el.className.includes("google")) ||
              (comp.zIndex && Number(comp.zIndex) > 1000)
            ) {
              el.style.setProperty("display", "none", "important");
              el.style.setProperty("z-index", "-9999", "important");
            }
          }
        } catch (e) {}
      }
    }

    const widgetEl =
      ZigaMod.widgetEl || document.getElementById("ziga-mod-widget");
    const sbModal = document.getElementById("ziga-sandbox-modal");
    if (widgetEl) {
      widgetEl.style.setProperty("z-index", "2147483600", "important");
      widgetEl.style.setProperty("position", "fixed", "important");
    }
    if (sbModal) {
      sbModal.style.setProperty("z-index", "2147483647", "important");
    }
  }

  function updateMod() {
    if (typeof ZigaMod.createOverlay === "function") {
      ZigaMod.createOverlay();
    }
    cleanObstructingAds();

    const widgetEl =
      ZigaMod.widgetEl || document.getElementById("ziga-mod-widget");
    if (!widgetEl) return;

    const data = getActiveGameData();

    if (!data) {
      if (lastStateHash !== "waiting") {
        lastStateHash = "waiting";
        if (ZigaMod.uiStore) {
          ZigaMod.uiStore.resetGameState();
        }
        if (typeof ZigaMod.clearTacticalHud === "function")
          ZigaMod.clearTacticalHud();
        if (typeof ZigaMod.updateThreatUi === "function")
          ZigaMod.updateThreatUi([]);
        if (typeof ZigaMod.updateCoUpUi === "function")
          ZigaMod.updateCoUpUi(null);
        if (ZigaMod.updateMaterialTooltipLive) {
          ZigaMod.updateMaterialTooltipLive(null);
        }
        if (ZigaMod.clearBoardAura) {
          ZigaMod.clearBoardAura();
        }
        if (ZigaMod.clearTacticalDrawings) {
          ZigaMod.clearTacticalDrawings();
        }
        if (ZigaMod.updateOpeningUi) {
          ZigaMod.updateOpeningUi([]);
        }
        if (ZigaMod.updateEvalBar) {
          ZigaMod.updateEvalBar(null);
        }
        if (ZigaMod.updateMentorHud) {
          ZigaMod.updateMentorHud(null);
        }
      }
      if (typeof ZigaMod.applySettingsVisibility === "function") {
        ZigaMod.applySettingsVisibility();
      }
      return;
    }

    // Hook game engine for native highlights & row numbers
    if (typeof ZigaMod.hookGameLayer === "function") {
      ZigaMod.hookGameLayer(data.gameLayer);
    }
    if (ZigaMod.setupRowNumbers) {
      ZigaMod.setupRowNumbers(data.gameLayer);
    }

    // Live Board Aura (Green for my turn, Red for opponent turn)
    if (ZigaMod.updateBoardAura) {
      ZigaMod.updateBoardAura(data);
    }

    // Threat Scanner (Under-Attack Alert)
    const threats = ZigaMod.scanThreats
      ? ZigaMod.scanThreats(data.gameLayer, data.myColor, data.oppColor)
      : [];
    if (ZigaMod.updateThreatUi) {
      ZigaMod.updateThreatUi(threats);
    }

    // Co Up Probability Tracker
    if (ZigaMod.isCoUpGame && ZigaMod.isCoUpGame(data.gameLayer)) {
      const coUpStats = ZigaMod.computeCoUpStats(
        data.gameLayer,
        data.myColor,
        data.oppColor,
      );
      ZigaMod.updateCoUpUi(coUpStats, data.oppName, data.myName);
    } else if (ZigaMod.updateCoUpUi) {
      ZigaMod.updateCoUpUi(null);
    }

    // Move Recorder (Vietnamese notation & FEN/PGN history)
    if (ZigaMod.checkAndRecordMove) {
      ZigaMod.checkAndRecordMove(data);
    }

    // Tactical Right-Click Drawing Canvas
    if (ZigaMod.updateTacticalDrawing) {
      ZigaMod.updateTacticalDrawing();
    }

    // Opening Book Recognition
    if (ZigaMod.updateOpeningUi) {
      ZigaMod.updateOpeningUi(ZigaMod.moveHistory);
    }

    // Voice Announcer & Match Countdown Alert
    if (ZigaMod.updateTimerAlerts) {
      ZigaMod.updateTimerAlerts(data.gameLayer);
    }

    // Real-time AI Evaluation Bar & Best Move
    if (ZigaMod.updateEvalBar) {
      ZigaMod.updateEvalBar(data);
    }

    // AI Xiangqi Mentor / Live Tactical Coach & Mindset Advisor
    if (ZigaMod.updateMentorHud) {
      ZigaMod.updateMentorHud(data);
    }

    const userSettings = ZigaMod.userSettings;
    const currentHash = `${data.myColor}_${data.deadMyPieces.length}_${data.deadOppPieces.length}_${userSettings.vietnameseLabels}_${threats.length}`;
    if (currentHash === lastStateHash) {
      return;
    }
    lastStateHash = currentHash;

    const mat = userSettings.materialAdvantage
      ? computeMaterialScore(data.aliveMyPieces, data.aliveOppPieces)
      : null;

    if (ZigaMod.uiStore) {
      ZigaMod.uiStore.setState({
        inGame: true,
        isSpectator: !!data.isSpectator,
        statusText: data.isSpectator
          ? `Đang xem ván (${data.myName} vs ${data.oppName})`
          : `Trận đấu: Bạn vs ${data.oppName}`,
        myName: data.myName,
        oppName: data.oppName,
        myColor: data.myColor,
        oppColor: data.oppColor,
        deadMyPieces: data.deadMyPieces.slice(),
        deadOppPieces: data.deadOppPieces.slice(),
        keyPiecesSelf: countKeyPieces(data.aliveMyPieces),
        keyPiecesOpp: countKeyPieces(data.aliveOppPieces),
        material: mat,
      });
    }
  }

  // Export to namespace
  ZigaMod.getActiveGameLayer = getActiveGameLayer;
  ZigaMod.getActiveGameData = getActiveGameData;
  ZigaMod.computeMaterialScore = computeMaterialScore;
  ZigaMod.countKeyPieces = countKeyPieces;
  ZigaMod.cleanObstructingAds = cleanObstructingAds;
  ZigaMod.updateMod = updateMod;
  ZigaMod.lastStateHash = lastStateHash;

  // Start polling loop
  setInterval(updateMod, 300);

  // Initial trigger
  window.addEventListener("load", () => {
    setTimeout(updateMod, 1000);
  });

  console.log("[AN Mod] Advanced Xiangqi & Co Up Helper initialized.");
})((window.ZigaMod = window.ZigaMod || {}));
