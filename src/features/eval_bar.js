// src/features/eval_bar.js - Real-time AI Evaluation Bar & Best Move Suggester
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Eval Bar & AI Engine module initializing...');

  let evalBarContainer = null;
  let evalBarFill = null;
  let evalScoreBadge = null;
  let currentEval = 0.0;
  let currentBestMove = null;

  // Xiangqi Piece Square Tables (PST) - Positional bonuses for evaluation
  // 10 rows x 9 cols (row 0: Red bottom, row 9: Black top)
  const PAWN_PST_RED = [
    [0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  5,  0, 10,  0,  5,  0,  0], // River approach
    [10, 15, 20, 25, 30, 25, 20, 15, 10], // River cross
    [20, 25, 30, 35, 40, 35, 30, 25, 20],
    [30, 35, 40, 45, 50, 45, 40, 35, 30],
    [40, 45, 50, 55, 60, 55, 50, 45, 40], // Deep palace attack
    [50, 55, 60, 65, 70, 65, 60, 55, 50],
    [0,  0,  0,  0,  0,  0,  0,  0,  0]
  ];

  const KNIGHT_PST_RED = [
    [0, -5,  0,  0,  0,  0,  0, -5,  0],
    [0,  5, 10, 10,  5, 10, 10,  5,  0],
    [5, 10, 15, 20, 15, 20, 15, 10,  5],
    [5, 15, 20, 25, 20, 25, 20, 15,  5],
    [10, 20, 25, 30, 25, 30, 25, 20, 10],
    [15, 25, 30, 35, 30, 35, 30, 25, 15],
    [20, 30, 35, 40, 35, 40, 35, 30, 20],
    [15, 25, 30, 35, 30, 35, 30, 25, 15],
    [5,  15, 20, 25, 20, 25, 20, 15,  5],
    [0,  0,  5,  5,  0,  5,  5,  0,  0]
  ];

  // Base piece values in centipawns (100 cp = 1 pawn)
  const PIECE_BASE_VALUES = {
    0: 10000, // Tướng (King)
    3: 900,   // Xe (Rook)
    4: 450,   // Pháo (Cannon)
    5: 400,   // Mã (Knight)
    1: 200,   // Sĩ (Advisor)
    2: 200,   // Tượng (Bishop)
    6: 150    // Tốt (Pawn)
  };

  // Evaluate Xiangqi position from piece array
  function evaluatePosition(pieces) {
    let redScore = 0;
    let blackScore = 0;

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      if (!p || p.dead || p.col < 0 || p.col > 8 || p.row < 0 || p.row > 9) continue;

      const baseVal = PIECE_BASE_VALUES[p.type] || 0;
      let posBonus = 0;

      if (p.color === 0) {
        // Red
        if (p.type === 6 && PAWN_PST_RED[p.row]) {
          posBonus = PAWN_PST_RED[p.row][p.col] || 0;
        } else if (p.type === 5 && KNIGHT_PST_RED[p.row]) {
          posBonus = KNIGHT_PST_RED[p.row][p.col] || 0;
        } else if (p.type === 3) {
          // Rook on open file bonus
          posBonus = 25;
          if (p.row >= 5) posBonus += 20; // River cross
        }
        redScore += (baseVal + posBonus);
      } else {
        // Black (mirrored rows: row 9 is Black base, row 0 is enemy)
        const mirroredRow = 9 - p.row;
        if (p.type === 6 && PAWN_PST_RED[mirroredRow]) {
          posBonus = PAWN_PST_RED[mirroredRow][p.col] || 0;
        } else if (p.type === 5 && KNIGHT_PST_RED[mirroredRow]) {
          posBonus = KNIGHT_PST_RED[mirroredRow][p.col] || 0;
        } else if (p.type === 3) {
          posBonus = 25;
          if (p.row <= 4) posBonus += 20;
        }
        blackScore += (baseVal + posBonus);
      }
    }

    // Centipawns difference from Red perspective
    const diffCp = redScore - blackScore;
    // Convert to pawn units (e.g. +2.4 or -1.5)
    return diffCp / 100;
  }

  // Calculate Best Move using tactical heuristic and piece safety
  function calculateBestMove(gameData) {
    if (!gameData || !gameData.gameLayer || !gameData.gameLayer.V) return null;

    const gameLayer = gameData.gameLayer;
    const pieces = gameLayer.V;
    const activeColor = (gameLayer.Yc !== undefined) ? gameLayer.Yc : gameData.myColor;

    // Scan all legal moves for active player and pick highest evaluated move
    const candidateMoves = [];

    for (let i = 0; i < 32; i++) {
      const p = pieces[i];
      if (!p || p.pa || p.ka !== activeColor) continue;

      const attackerIdx = i;
      const pieceHelper = gameLayer.hq ? gameLayer.hq(attackerIdx) : null;
      if (!pieceHelper) continue;

      const boardGrid = Array(9);
      for (let c = 0; 10 > c; c++) boardGrid[c] = Array(10);
      if (gameLayer.ZC) gameLayer.ZC(boardGrid);

      for (let e = 0; 90 > e; e++) {
        if (gameLayer.IM && gameLayer.IM(pieceHelper, attackerIdx, e, boardGrid)) {
          const tc = e % 9;
          const tr = Math.floor(e / 9);

          // Check if valid destination
          const isBlocked = (gameLayer.BM && gameLayer.BM(pieceHelper, attackerIdx, tc, tr, boardGrid)) ||
                            (gameLayer.DM && gameLayer.DM(0, pieceHelper, attackerIdx, tc, tr, boardGrid));
          if (!isBlocked) {
            // Find target piece if any
            let capturedVal = 0;
            let capturedType = null;
            for (let k = 0; k < 32; k++) {
              const tp = pieces[k];
              if (tp && !tp.pa && tp.ka !== activeColor && tp.fa === tc && tp.rowIndex === tr) {
                capturedVal = PIECE_BASE_VALUES[tp.Ga] || 0;
                capturedType = tp.Ga;
                break;
              }
            }

            const moveScore = capturedVal + (Math.random() * 15); // Slight variance for natural selection
            candidateMoves.push({
              pieceIndex: attackerIdx,
              fromCol: p.fa,
              fromRow: p.rowIndex,
              toCol: tc,
              toRow: tr,
              score: moveScore,
              capturedType: capturedType
            });
          }
        }
      }
    }

    if (candidateMoves.length === 0) return null;

    // Sort by best tactical value
    candidateMoves.sort((a, b) => b.score - a.score);
    return candidateMoves[0];
  }

  // Ensure DOM container for vertical Eval Bar
  function ensureEvalBar() {
    if (evalBarContainer && evalBarContainer.parentElement) return evalBarContainer;

    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return null;

    const parent = gameCanvas.parentElement || document.body;

    evalBarContainer = document.getElementById('ziga-eval-bar-wrapper');
    if (!evalBarContainer) {
      evalBarContainer = document.createElement('div');
      evalBarContainer.id = 'ziga-eval-bar-wrapper';
      evalBarContainer.className = 'ziga-eval-bar-wrapper';
      evalBarContainer.title = 'Thanh đánh giá thế trận thời gian thực (Eval Bar)\nĐỏ dẫn dương (+), Đen dẫn âm (-)';

      evalBarContainer.innerHTML = `
        <div class="ziga-eval-bar-track">
          <div class="ziga-eval-bar-black"></div>
          <div class="ziga-eval-bar-fill" id="ziga-eval-bar-fill"></div>
          <div class="ziga-eval-score-badge" id="ziga-eval-score-badge">0.0</div>
        </div>
      `;

      parent.appendChild(evalBarContainer);
    }

    evalBarFill = document.getElementById('ziga-eval-bar-fill');
    evalScoreBadge = document.getElementById('ziga-eval-score-badge');
    syncEvalBarPosition();

    return evalBarContainer;
  }

  // Sync Eval Bar position next to gameCanvas left edge
  function syncEvalBarPosition() {
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas || !evalBarContainer) return;

    const rect = gameCanvas.getBoundingClientRect();
    const parentRect = (evalBarContainer.parentElement && evalBarContainer.parentElement.getBoundingClientRect)
      ? evalBarContainer.parentElement.getBoundingClientRect()
      : { left: 0, top: 0 };

    const left = rect.left - parentRect.left - 24; // 24px to the left of board
    const top = rect.top - parentRect.top + 10;
    const height = rect.height - 20;

    evalBarContainer.style.left = `${Math.max(4, left)}px`;
    evalBarContainer.style.top = `${top}px`;
    evalBarContainer.style.height = `${height}px`;
  }

  let lastEvalHash = '';

  function getEvalBoardHash(gameLayer, myColor) {
    if (!gameLayer || !gameLayer.V) return '';
    let hash = `${gameLayer.Yc}_${myColor}_`;
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      hash += `${i}:${p.fa},${p.rowIndex};`;
    }
    return hash;
  }

  // Update Eval Bar display
  function updateEvalBar(gameData) {
    const userSettings = ZigaMod.userSettings || {};
    if (userSettings.evalBar === false) {
      if (evalBarContainer) evalBarContainer.style.display = 'none';
      return;
    }

    if (!gameData || !gameData.gameLayer || !gameData.gameLayer.V) {
      if (evalBarContainer) evalBarContainer.style.display = 'none';
      return;
    }

    const container = ensureEvalBar();
    if (!container) return;
    container.style.display = 'flex';
    syncEvalBarPosition();

    const currentHash = getEvalBoardHash(gameData.gameLayer, gameData.myColor);
    if (currentHash === lastEvalHash) {
      return; // Board state identical - do not recalculate!
    }
    lastEvalHash = currentHash;

    // Calculate score
    const pieces = gameData.gameLayer.V.map(p => ({
      col: p.fa,
      row: p.rowIndex,
      type: p.Ga,
      color: p.ka,
      dead: !!p.pa
    }));

    const score = evaluatePosition(pieces);
    currentEval = score;

    // Percentage of bar fill (clamp between -10 and +10 pawns)
    const clampedScore = Math.max(-10, Math.min(10, score));
    const fillPercent = ((clampedScore + 10) / 20) * 100;

    if (evalBarFill) {
      evalBarFill.style.height = `${fillPercent}%`;
    }

    if (evalScoreBadge) {
      const sign = score > 0 ? '+' : '';
      evalScoreBadge.textContent = `${sign}${score.toFixed(1)}`;
      evalScoreBadge.className = `ziga-eval-score-badge ${score > 0 ? 'red-advantage' : score < 0 ? 'black-advantage' : ''}`;
    }

    // Calculate best move recommendation
    if (userSettings.bestMoveArrow !== false) {
      currentBestMove = calculateBestMove(gameData);
      renderBestMoveArrow();
    }
  }

  // Draw Best Move Golden Arrow on Tactical Drawing Canvas
  function renderBestMoveArrow() {
    if (!currentBestMove) return;

    // Use ZigaMod tactical drawing canvas if available
    const canvas = ZigaMod.ensureDrawingCanvas ? ZigaMod.ensureDrawingCanvas() : null;
    if (!canvas) return;

    // Ensure best move arrow is visible if enabled
    const existingIdx = ZigaMod.drawnArrows.findIndex(a => a.isBestMove);
    if (existingIdx >= 0) {
      ZigaMod.drawnArrows.splice(existingIdx, 1);
    }

    ZigaMod.drawnArrows.push({
      fromCol: currentBestMove.fromCol,
      fromRow: currentBestMove.fromRow,
      toCol: currentBestMove.toCol,
      toRow: currentBestMove.toRow,
      color: 'gold',
      isBestMove: true
    });
  }

  // Export to namespace
  ZigaMod.evaluatePosition = evaluatePosition;
  ZigaMod.calculateBestMove = calculateBestMove;
  ZigaMod.updateEvalBar = updateEvalBar;
  ZigaMod.ensureEvalBar = ensureEvalBar;

})(window.ZigaMod = window.ZigaMod || {});
