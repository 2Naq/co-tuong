// src/threat_scanner.js - Under-attack threat scanner and threat alert UI
(function (ZigaMod) {
  'use strict';

  function scanThreats(gameLayer, myColor, oppColor) {
    const threats = [];
    if (!gameLayer || !gameLayer.V || !ZigaMod.userSettings.threatAlert) return threats;

    // Build 9x10 grid of piece indices
    const grid = Array.from({ length: 9 }, () => Array(10).fill(-1));
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (p && !p.pa) {
        grid[p.fa][p.rowIndex] = i;
      }
    }

    // Loop through living opponent pieces
    for (let i = 0; i < 32; i++) {
      const oppPiece = gameLayer.V[i];
      if (!oppPiece || oppPiece.pa || oppPiece.ka !== oppColor) continue;

      const pieceHelper = gameLayer.hq ? gameLayer.hq(i) : null;
      if (!pieceHelper || !gameLayer.IM) continue;

      for (let sq = 0; sq < 90; sq++) {
        const c = sq % 9;
        const r = Math.floor(sq / 9);
        const targetIdx = grid[c][r];

        if (targetIdx >= 0) {
          const myPiece = gameLayer.V[targetIdx];
          if (myPiece && !myPiece.pa && myPiece.ka === myColor) {
            try {
              if (gameLayer.IM(pieceHelper, i, sq, grid)) {
                if (!gameLayer.BM || !gameLayer.BM(pieceHelper, i, c, r, grid)) {
                  const coord = ZigaMod.formatXiangqiCoord
                    ? ZigaMod.formatXiangqiCoord(c, r, myPiece.ka)
                    : { col: (myPiece.ka === 0 ? 9 - c : c + 1), row: (myPiece.ka === 0 ? r + 1 : 10 - r), text: `C${myPiece.ka === 0 ? 9 - c : c + 1}·H${myPiece.ka === 0 ? r + 1 : 10 - r}`, fullText: `Cột ${myPiece.ka === 0 ? 9 - c : c + 1}, Hàng ${myPiece.ka === 0 ? r + 1 : 10 - r}` };

                  threats.push({
                    attacker: oppPiece,
                    target: myPiece,
                    attackerName: ZigaMod.PIECE_DEFS[oppPiece.Ga] ? ZigaMod.PIECE_DEFS[oppPiece.Ga].name : 'Quân',
                    targetName: ZigaMod.PIECE_DEFS[myPiece.Ga] ? ZigaMod.PIECE_DEFS[myPiece.Ga].name : 'Quân',
                    attackerChar: ZigaMod.getPieceChar(oppPiece.Ga, oppPiece.ka),
                    targetChar: ZigaMod.getPieceChar(myPiece.Ga, myPiece.ka),
                    targetValue: ZigaMod.PIECE_DEFS[myPiece.Ga] ? ZigaMod.PIECE_DEFS[myPiece.Ga].value : 0,
                    col: c,
                    row: r,
                    displayCol: coord.col,
                    displayRow: coord.row,
                    coordText: coord.text,
                    fullCoordText: coord.fullText
                  });
                }
              }
            } catch (e) { }
          }
        }
      }
    }

    // Sort by threatened piece value descending (Xe -> Pháo -> Mã...)
    threats.sort((a, b) => b.targetValue - a.targetValue);
    return threats;
  }

  function updateThreatUi(threats) {
    const wrapper = document.getElementById('ziga-threat-wrapper');
    const itemsContainer = document.getElementById('ziga-threat-items');
    if (!wrapper || !itemsContainer) return;

    if (!ZigaMod.userSettings.threatAlert || !threats || threats.length === 0) {
      wrapper.style.display = 'none';
      itemsContainer.innerHTML = '';
      return;
    }

    wrapper.style.display = 'flex';
    let html = '';
    threats.slice(0, 5).forEach(t => {
      html += `
        <div class="ziga-threat-pill">
          <div class="ziga-threat-combat">
            <span class="ziga-threat-enemy">[Địch] ${t.attackerName} [${t.attackerChar}]</span>
            <span class="ziga-threat-arrow">➔</span>
            <span class="ziga-threat-my">[Ní] ${t.targetName} [${t.targetChar}]</span>
          </div>
          <span class="ziga-threat-coord" title="Vị trí bị đe dọa: ${t.fullCoordText}">${t.coordText}</span>
        </div>
      `;
    });
    itemsContainer.innerHTML = html;
  }

  // Export to namespace
  ZigaMod.scanThreats = scanThreats;
  ZigaMod.updateThreatUi = updateThreatUi;

})(window.ZigaMod = window.ZigaMod || {});
