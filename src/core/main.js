// src/main.js - Game data extraction, material calculation, ad cleaner, and main update loop
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Main module initializing...');

  let lastStateHash = '';

  function getActiveGameLayer() {
    if (!window.BkGlobal || !window.BkGlobal.Yj) return null;
    return window.BkGlobal.Yj.ja ? window.BkGlobal.Yj.ja() : null;
  }

  function getActiveGameData() {
    if (!window.BkGlobal || !window.BkGlobal.Yj) return null;
    const gameLayer = window.BkGlobal.Yj.ja ? window.BkGlobal.Yj.ja() : null;
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V) || gameLayer.V.length !== 32) {
      return null;
    }

    const logicMgr = window.BkLogicManager ? window.BkLogicManager.na() : null;
    const myPlayer = logicMgr && logicMgr.Ba ? logicMgr.Ba() : null;

    let myColor = 0;
    let isSpectator = false;

    if (myPlayer) {
      isSpectator = !!myPlayer.Ka;
      if (!isSpectator && myPlayer.ka !== undefined) {
        myColor = myPlayer.ka;
      } else if (gameLayer.Nj !== undefined && gameLayer.Nj >= 0) {
        myColor = gameLayer.Nj;
      }
    } else if (gameLayer.Nj !== undefined && gameLayer.Nj >= 0) {
      myColor = gameLayer.Nj;
    }

    const oppColor = 1 - myColor;

    let myName = myPlayer && myPlayer.getName ? myPlayer.getName() : (myColor === 0 ? 'Bên Đỏ' : 'Bên Đen');
    let oppName = (oppColor === 0 ? 'Bên Đỏ' : 'Bên Đen');

    if (gameLayer.gc && gameLayer.gc.Z) {
      if (myColor === 0) myName = gameLayer.gc.Z.userName || myName;
      else oppName = gameLayer.gc.Z.userName || oppName;
    }
    if (gameLayer.dc && gameLayer.dc.Z) {
      if (myColor === 1) myName = gameLayer.dc.Z.userName || myName;
      else oppName = gameLayer.dc.Z.userName || oppName;
    }

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
        isDead: isDead
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
      aliveOppPieces
    };
  }

  function computeMaterialScore(aliveMy, aliveOpp) {
    let myScore = 0;
    let oppScore = 0;
    const myCounts = { 3: 0, 4: 0, 5: 0, 1: 0, 2: 0, 6: 0 };
    const oppCounts = { 3: 0, 4: 0, 5: 0, 1: 0, 2: 0, 6: 0 };

    aliveMy.forEach(p => {
      const def = ZigaMod.PIECE_DEFS[p.type];
      if (def) {
        myScore += def.value;
        if (myCounts[p.type] !== undefined) myCounts[p.type]++;
      }
    });

    aliveOpp.forEach(p => {
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
    let xe = 0, phao = 0, ma = 0;
    alivePieces.forEach(p => {
      if (p.type === 3) xe++;
      if (p.type === 4) phao++;
      if (p.type === 5) ma++;
    });
    return `${xe}X · ${phao}P · ${ma}M`;
  }

  function cleanObstructingAds() {
    const adSelectors = [
      'ins.adsbygoogle',
      '.google-auto-placed',
      'iframe[id^="aswift"]',
      'iframe[name^="aswift"]',
      'div[id^="aswift"]',
      'div[id^="google_ads"]',
      'iframe[id^="google_ads"]',
      '.ads-frame',
      '[id*="banner_left"]',
      '[id*="banner_right"]',
      '[class*="banner-left"]',
      '[class*="banner-right"]'
    ];

    for (let i = 0; i < adSelectors.length; i++) {
      const nodes = document.querySelectorAll(adSelectors[i]);
      for (let j = 0; j < nodes.length; j++) {
        const el = nodes[j];
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('z-index', '-9999', 'important');
        el.style.setProperty('width', '0', 'important');
        el.style.setProperty('height', '0', 'important');
      }
    }

    if (document.body) {
      const children = document.body.children;
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (!el || 
            el.id === 'ziga-mod-widget' || 
            el.id === 'ziga-sandbox-modal' || 
            (el.id && el.id.startsWith('ziga-')) ||
            el.classList.contains('ziga-shadcn-root') ||
            el.classList.contains('ziga-sandbox-overlay') || 
            el.classList.contains('ziga-mod-container') ||
            el.id === 'gameCanvas' || 
            el.id === 'Cocos2dGameContainer' || 
            el.classList.contains('modal')) {
          continue;
        }
        try {
          const comp = window.getComputedStyle(el);
          if (comp.position === 'fixed') {
            if (el.querySelector('iframe') || el.querySelector('ins') || el.tagName === 'IFRAME' || el.tagName === 'INS' || (el.className && typeof el.className === 'string' && el.className.includes('google')) || (comp.zIndex && Number(comp.zIndex) > 1000)) {
              el.style.setProperty('display', 'none', 'important');
              el.style.setProperty('z-index', '-9999', 'important');
            }
          }
        } catch (e) { }
      }
    }

    const widgetEl = ZigaMod.widgetEl || document.getElementById('ziga-mod-widget');
    const sbModal = document.getElementById('ziga-sandbox-modal');
    if (widgetEl) {
      widgetEl.style.setProperty('z-index', '2147483647', 'important');
      widgetEl.style.setProperty('position', 'fixed', 'important');
    }
    if (sbModal) {
      sbModal.style.setProperty('z-index', '2147483647', 'important');
    }
  }

  function updateMod() {
    if (typeof ZigaMod.createOverlay === 'function') {
      ZigaMod.createOverlay();
    }
    cleanObstructingAds();

    const widgetEl = ZigaMod.widgetEl || document.getElementById('ziga-mod-widget');
    if (!widgetEl) return;

    const data = getActiveGameData();

    if (!data) {
      if (lastStateHash !== 'waiting') {
        lastStateHash = 'waiting';
        if (ZigaMod.uiStore) {
          ZigaMod.uiStore.resetGameState();
        }
        if (typeof ZigaMod.clearTacticalHud === 'function') ZigaMod.clearTacticalHud();
        if (typeof ZigaMod.updateThreatUi === 'function') ZigaMod.updateThreatUi([]);
        if (typeof ZigaMod.updateCoUpUi === 'function') ZigaMod.updateCoUpUi(null);
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
      if (typeof ZigaMod.applySettingsVisibility === 'function') {
        ZigaMod.applySettingsVisibility();
      }
      return;
    }

    // Hook game engine for native highlights & row numbers
    if (typeof ZigaMod.hookGameLayer === 'function') {
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
    const threats = ZigaMod.scanThreats ? ZigaMod.scanThreats(data.gameLayer, data.myColor, data.oppColor) : [];
    if (ZigaMod.updateThreatUi) {
      ZigaMod.updateThreatUi(threats);
    }

    // Co Up Probability Tracker
    if (ZigaMod.isCoUpGame && ZigaMod.isCoUpGame(data.gameLayer)) {
      const coUpStats = ZigaMod.computeCoUpStats(data.gameLayer, data.myColor, data.oppColor);
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
        material: mat
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
  window.addEventListener('load', () => {
    setTimeout(updateMod, 1000);
  });

  console.log('[AN Mod] Advanced Xiangqi & Co Up Helper initialized.');

})(window.ZigaMod = window.ZigaMod || {});
