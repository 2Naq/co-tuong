// src/move_recorder.js - Xiangqi Move Recorder, Vietnamese Notation, and FEN/PGN Exporter
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Move Recorder module initializing...');

  // State
  let moveHistory = []; // Array of { index, moveNumber, turnColor, pieceType, fromCol, fromRow, toCol, toRow, capturedType, notation, fen, timestamp }
  let lastBoardSnapshot = null; // Map pieceIndex -> { col, row, dead, color, type }
  let currentGameId = '';
  let autoScrollEnabled = true;

  // Piece shorthand for Vietnamese notation
  const PIECE_NOTATION_NAMES = {
    0: { red: 'Tg', black: 'Tg' }, // Tướng
    3: { red: 'X', black: 'X' },   // Xe
    4: { red: 'P', black: 'P' },   // Pháo
    5: { red: 'M', black: 'M' },   // Mã
    1: { red: 'S', black: 'S' },   // Sĩ
    2: { red: 'T', black: 'V' },   // Tượng (Đỏ: Tượng, Đen: Voi)
    6: { red: 'B', black: 'C' }    // Tốt (Đỏ: Binh, Đen: Chốt)
  };

  // FEN piece characters (standard international Xiangqi)
  const FEN_PIECES = {
    red:   { 0: 'K', 1: 'A', 2: 'B', 3: 'R', 4: 'C', 5: 'N', 6: 'P' },
    black: { 0: 'k', 1: 'a', 2: 'b', 3: 'r', 4: 'c', 5: 'n', 6: 'p' }
  };

  // Convert board pieces to FEN string
  function generateFen(gameLayer, activeTurnColor) {
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return '';

    // Create 10 rows x 9 cols board grid
    // Row 9 is top (Black palace), Row 0 is bottom (Red palace)
    const grid = Array.from({ length: 10 }, () => Array(9).fill(null));

    for (let i = 0; i < gameLayer.V.length; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue; // Skip dead pieces

      const col = p.fa;
      const row = p.rowIndex;
      const color = p.ka !== undefined ? p.ka : Math.floor(i / 16);
      const type = p.Ga !== undefined ? p.Ga : 6;

      if (col >= 0 && col < 9 && row >= 0 && row < 10) {
        const char = color === 0 ? FEN_PIECES.red[type] : FEN_PIECES.black[type];
        grid[row][col] = char || (color === 0 ? 'P' : 'p');
      }
    }

    // Build FEN string from row 9 down to row 0
    const fenRows = [];
    for (let r = 9; r >= 0; r--) {
      let rowStr = '';
      let emptyCount = 0;

      for (let c = 0; c < 9; c++) {
        const pieceChar = grid[r][c];
        if (!pieceChar) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rowStr += emptyCount;
            emptyCount = 0;
          }
          rowStr += pieceChar;
        }
      }

      if (emptyCount > 0) {
        rowStr += emptyCount;
      }
      fenRows.push(rowStr);
    }

    const boardFen = fenRows.join('/');
    const turnChar = activeTurnColor === 0 ? 'w' : 'b';
    const moveNum = Math.floor(moveHistory.length / 2) + 1;

    return `${boardFen} ${turnChar} - - 0 ${moveNum}`;
  }

  // Format move to Vietnamese notation (P2-5, M8.7, X1.2, B7.1, ...)
  function formatVietnameseNotation(fromCol, fromRow, toCol, toRow, pieceType, color, previousSnapshot) {
    const isRed = color === 0;
    const names = PIECE_NOTATION_NAMES[pieceType] || { red: 'Q', black: 'Q' };
    const pieceChar = isRed ? names.red : names.black;

    // Visual Column:
    // Red: 1 is far right (col 8) to 9 far left (col 0) => visualCol = 9 - col
    // Black: 1 is far right of Black (col 0) to 9 far left (col 8) => visualCol = col + 1
    const fromColVisual = isRed ? (9 - fromCol) : (fromCol + 1);
    const toColVisual = isRed ? (9 - toCol) : (toCol + 1);

    // Direction check
    // Red moves forward if toRow > fromRow
    // Black moves forward if toRow < fromRow
    const isForward = isRed ? (toRow > fromRow) : (toRow < fromRow);
    const isBackward = isRed ? (toRow < fromRow) : (toRow > fromRow);
    const isHorizontal = fromRow === toRow;

    // Check if there are duplicate pieces on the same column (Tiền / Hậu)
    let prefix = '';
    if (previousSnapshot && (pieceType === 3 || pieceType === 4 || pieceType === 5 || pieceType === 6)) {
      const sameColumnPieces = [];
      for (const idx in previousSnapshot) {
        const p = previousSnapshot[idx];
        if (!p.dead && p.color === color && p.type === pieceType && p.col === fromCol) {
          sameColumnPieces.push({ idx: Number(idx), row: p.row });
        }
      }

      if (sameColumnPieces.length === 2) {
        // Sort so the front piece (closer to enemy side) is first
        sameColumnPieces.sort((a, b) => isRed ? (b.row - a.row) : (a.row - b.row));
        if (sameColumnPieces[0].row === fromRow) {
          prefix = 'T.'; // Tiền (Front)
        } else {
          prefix = 'H.'; // Hậu (Rear)
        }
      }
    }

    // Straight pieces: Xe (3), Pháo (4), Tốt (6), Tướng (0 when moving straight)
    const isStraightType = (pieceType === 3 || pieceType === 4 || pieceType === 6 || pieceType === 0);

    if (isHorizontal) {
      // Bình ngang: e.g. P2-5, X1-2
      return `${prefix}${pieceChar}${prefix ? '' : fromColVisual}-${toColVisual}`;
    }

    if (isStraightType && fromCol === toCol) {
      // Tiến / Thoái thẳng: bước tiến / lùi
      const stepCount = Math.abs(toRow - fromRow);
      const symbol = isForward ? '.' : '/';
      return `${prefix}${pieceChar}${prefix ? '' : fromColVisual}${symbol}${stepCount}`;
    }

    // Diagonal pieces: Mã (5), Tượng (2), Sĩ (1)
    // Destination is the target column
    const symbol = isForward ? '.' : '/';
    return `${prefix}${pieceChar}${prefix ? '' : fromColVisual}${symbol}${toColVisual}`;
  }

  // Detect and record move on board update
  function checkAndRecordMove(gameData) {
    if (!gameData || !gameData.gameLayer || !gameData.gameLayer.V) return;

    const gameLayer = gameData.gameLayer;
    const pieces = gameLayer.V;
    if (pieces.length !== 32) return;

    // Detect new game
    const currentId = `${gameData.myName}_vs_${gameData.oppName}`;
    if (currentGameId && currentGameId !== currentId) {
      resetHistory();
    }
    currentGameId = currentId;

    // Build current board snapshot
    const currentSnapshot = {};
    let aliveCount = 0;
    for (let i = 0; i < 32; i++) {
      const p = pieces[i];
      if (!p) continue;
      const isDead = !!p.pa;
      if (!isDead) aliveCount++;
      currentSnapshot[i] = {
        col: p.fa,
        row: p.rowIndex,
        dead: isDead,
        color: p.ka !== undefined ? p.ka : Math.floor(i / 16),
        type: p.Ga !== undefined ? p.Ga : 6
      };
    }

    // First snapshot initialization
    if (!lastBoardSnapshot) {
      lastBoardSnapshot = currentSnapshot;
      return;
    }

    // If suddenly all 32 pieces are alive at starting positions -> reset
    if (aliveCount === 32 && moveHistory.length > 5) {
      let isInitialBoard = true;
      for (let i = 0; i < 32; i++) {
        const p = currentSnapshot[i];
        if (p.type === 6 && (p.row !== 3 && p.row !== 6)) {
          isInitialBoard = false;
          break;
        }
      }
      if (isInitialBoard) {
        resetHistory();
        lastBoardSnapshot = currentSnapshot;
        return;
      }
    }

    // Compare with last snapshot to find which piece moved
    let movedPieceIdx = -1;
    let fromCol = -1, fromRow = -1;
    let toCol = -1, toRow = -1;
    let capturedPieceType = null;

    for (let i = 0; i < 32; i++) {
      const prev = lastBoardSnapshot[i];
      const curr = currentSnapshot[i];
      if (!prev || !curr) continue;

      if (!prev.dead && !curr.dead) {
        if (prev.col !== curr.col || prev.row !== curr.row) {
          movedPieceIdx = i;
          fromCol = prev.col;
          fromRow = prev.row;
          toCol = curr.col;
          toRow = curr.row;
          break;
        }
      }
    }

    if (movedPieceIdx >= 0) {
      // Find if an enemy piece at (toCol, toRow) was captured
      for (let i = 0; i < 32; i++) {
        if (i === movedPieceIdx) continue;
        const prev = lastBoardSnapshot[i];
        const curr = currentSnapshot[i];
        if (!prev || !curr) continue;

        if (!prev.dead && curr.dead) {
          if (prev.col === toCol && prev.row === toRow) {
            capturedPieceType = prev.type;
            break;
          }
        }
      }

      const movedPiece = currentSnapshot[movedPieceIdx];
      const turnColor = movedPiece.color;
      const pieceType = movedPiece.type;

      // Format notation
      const notation = formatVietnameseNotation(
        fromCol, fromRow, toCol, toRow,
        pieceType, turnColor,
        lastBoardSnapshot
      );

      const moveNumber = Math.floor(moveHistory.length / 2) + 1;
      const currentFen = generateFen(gameLayer, 1 - turnColor);

      const recordItem = {
        index: moveHistory.length,
        moveNumber: moveNumber,
        turnColor: turnColor,
        pieceType: pieceType,
        fromCol: fromCol,
        fromRow: fromRow,
        toCol: toCol,
        toRow: toRow,
        capturedType: capturedPieceType,
        notation: notation,
        fen: currentFen,
        timestamp: Date.now()
      };

      moveHistory.push(recordItem);
      renderMoveHistoryUi();
    }

    lastBoardSnapshot = currentSnapshot;
  }

  // Generate full PGN string
  function generatePgn(gameData) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    const redName = gameData && gameData.myName && gameData.myColor === 0 ? gameData.myName : (gameData && gameData.oppName && gameData.oppColor === 0 ? gameData.oppName : 'Bên Đỏ');
    const blackName = gameData && gameData.myName && gameData.myColor === 1 ? gameData.myName : (gameData && gameData.oppName && gameData.oppColor === 1 ? gameData.oppName : 'Bên Đen');

    let pgn = '';
    pgn += `[Event "Ziga Xiangqi Online"]\n`;
    pgn += `[Site "zigavn.com"]\n`;
    pgn += `[Date "${today}"]\n`;
    pgn += `[Round "1"]\n`;
    pgn += `[Red "${redName}"]\n`;
    pgn += `[Black "${blackName}"]\n`;
    pgn += `[Result "*"]\n\n`;

    let movesStr = '';
    for (let i = 0; i < moveHistory.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const redMove = moveHistory[i];
      const blackMove = moveHistory[i + 1];

      movesStr += `${moveNum}. ${redMove ? redMove.notation : '...'}`;
      if (blackMove) {
        movesStr += `  ${blackMove.notation}`;
      }
      movesStr += '\n';
    }

    pgn += movesStr || '(Chưa có nước đi nào)';
    return pgn;
  }

  // Copy text to clipboard with modern API & fallback
  function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMessage || 'Đã sao chép vào bộ nhớ tạm!');
      }).catch(() => {
        fallbackCopyText(text, successMessage);
      });
    } else {
      fallbackCopyText(text, successMessage);
    }
  }

  function fallbackCopyText(text, successMessage) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(successMessage || 'Đã sao chép vào bộ nhớ tạm!');
    } catch (e) {
      showToast('❌ Không thể sao chép tự động. Vui lòng cấp quyền clipboard.');
    }
  }

  // Toast Notification
  function showToast(message) {
    let toast = document.getElementById('ziga-recorder-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ziga-recorder-toast';
      toast.className = 'ziga-recorder-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Reset move history
  function resetHistory() {
    moveHistory = [];
    lastBoardSnapshot = null;
    renderMoveHistoryUi();
  }

  // Render Move History UI on HUD
  function renderMoveHistoryUi() {
    const listEl = document.getElementById('ziga-move-history-list');
    const countEl = document.getElementById('ziga-move-count-badge');
    if (!listEl) return;

    if (countEl) {
      countEl.textContent = `${moveHistory.length} nước`;
    }

    if (moveHistory.length === 0) {
      listEl.innerHTML = '<div class="ziga-empty-moves">Đang theo dõi... Các nước đi sẽ tự động xuất hiện tại đây.</div>';
      return;
    }

    // Build pairs of moves
    let html = '';
    const totalRounds = Math.ceil(moveHistory.length / 2);

    for (let r = 0; r < totalRounds; r++) {
      const moveNum = r + 1;
      const redMove = moveHistory[r * 2];
      const blackMove = moveHistory[r * 2 + 1];

      html += `<div class="ziga-move-row ${r === totalRounds - 1 ? 'latest' : ''}">`;
      html += `<span class="ziga-move-num">${moveNum}.</span>`;

      // Red move
      if (redMove) {
        const capClass = redMove.capturedType !== null ? 'is-capture' : '';
        html += `<span class="ziga-move-cell red ${capClass}" title="Nước ${moveNum} (Đỏ): ${redMove.notation}">
          ${redMove.notation}
        </span>`;
      } else {
        html += `<span class="ziga-move-cell red empty">-</span>`;
      }

      // Black move
      if (blackMove) {
        const capClass = blackMove.capturedType !== null ? 'is-capture' : '';
        html += `<span class="ziga-move-cell black ${capClass}" title="Nước ${moveNum} (Đen): ${blackMove.notation}">
          ${blackMove.notation}
        </span>`;
      } else {
        html += `<span class="ziga-move-cell black empty">-</span>`;
      }

      html += `</div>`;
    }

    listEl.innerHTML = html;

    // Auto-scroll to bottom
    if (autoScrollEnabled) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  }

  // Export to namespace
  ZigaMod.moveHistory = moveHistory;
  ZigaMod.checkAndRecordMove = checkAndRecordMove;
  ZigaMod.generateFen = generateFen;
  ZigaMod.generatePgn = generatePgn;
  ZigaMod.copyToClipboard = copyToClipboard;
  ZigaMod.resetHistory = resetHistory;
  ZigaMod.renderMoveHistoryUi = renderMoveHistoryUi;

})(window.ZigaMod = window.ZigaMod || {});
