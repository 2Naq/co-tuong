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

                  const targetType = myPiece.Ga;
                  const attackerType = oppPiece.Ga;
                  const targetDef = ZigaMod.PIECE_DEFS[targetType] || { name: 'Quân', value: 0 };
                  const attackerDef = ZigaMod.PIECE_DEFS[attackerType] || { name: 'Quân', value: 0 };

                  // Major pieces classification:
                  // King: type 0 (Critical - Loss of game)
                  // Xe: type 3 (9đ - Super Major)
                  // Pháo: type 4 (4.5đ - Major)
                  // Mã: type 5 (4đ - Major)
                  const isTargetKing = (targetType === 0);
                  const isTargetXe = (targetType === 3);
                  const isTargetMajor = (targetType === 0 || targetType === 3 || targetType === 4 || targetType === 5);
                  const isAttackerMajor = (attackerType === 3 || attackerType === 4 || attackerType === 5);

                  // Priority for sorting:
                  // King is top priority (999), then Xe (9), Pháo (4.5), Mã (4), Sĩ/Tượng (2), Tốt (1)
                  const threatPriority = isTargetKing ? 999 : targetDef.value;

                  threats.push({
                    attacker: oppPiece,
                    target: myPiece,
                    attackerType: attackerType,
                    targetType: targetType,
                    attackerColor: oppPiece.ka,
                    targetColor: myPiece.ka,
                    attackerName: attackerDef.name,
                    targetName: targetDef.name,
                    attackerChar: ZigaMod.getPieceChar(attackerType, oppPiece.ka),
                    targetChar: ZigaMod.getPieceChar(targetType, myPiece.ka),
                    targetValue: targetDef.value,
                    attackerValue: attackerDef.value,
                    isTargetKing: isTargetKing,
                    isTargetXe: isTargetXe,
                    isTargetMajor: isTargetMajor,
                    isAttackerMajor: isAttackerMajor,
                    threatPriority: threatPriority,
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

    // Sort: Most critical threatened pieces first (King -> Xe -> Pháo -> Mã...), then by attacker strength
    threats.sort((a, b) => {
      if (b.threatPriority !== a.threatPriority) {
        return b.threatPriority - a.threatPriority;
      }
      return b.attackerValue - a.attackerValue;
    });

    return threats;
  }

  let lastThreatsSignature = '';

  function updateThreatUi(threats) {
    const wrapper = document.getElementById('ziga-threat-wrapper');
    const itemsContainer = document.getElementById('ziga-threat-items');
    const titleEl = document.getElementById('ziga-threat-title');
    const countEl = document.getElementById('ziga-threat-count');
    if (!wrapper || !itemsContainer) return;

    if (!ZigaMod.userSettings.threatAlert || !threats || threats.length === 0) {
      if (wrapper.style.display !== 'none') {
        wrapper.style.display = 'none';
        itemsContainer.innerHTML = '';
        if (countEl) countEl.style.display = 'none';
        wrapper.classList.remove('king-in-check');
      }
      lastThreatsSignature = '';
      return;
    }

    // Generate signature to avoid rebuilding DOM every 300ms if threats haven't changed
    const signature = threats.slice(0, 5).map(t =>
      `${t.attackerType}_${t.attacker.fa}_${t.attacker.rowIndex}_${t.targetType}_${t.target.fa}_${t.target.rowIndex}`
    ).join('|');

    if (signature === lastThreatsSignature && wrapper.style.display === 'flex') {
      return;
    }
    lastThreatsSignature = signature;

    wrapper.style.display = 'flex';

    // Check if King is in danger (Chiếu Tướng)
    const isKingInCheck = threats.some(t => t.isTargetKing);
    if (titleEl) {
      if (isKingInCheck) {
        titleEl.textContent = '🚨 ĐANG BỊ CHIẾU TƯỚNG!';
        wrapper.classList.add('king-in-check');
      } else {
        titleEl.textContent = 'CẢNH BÁO SẮP BỊ LỤM';
        wrapper.classList.remove('king-in-check');
      }
    }

    if (countEl) {
      countEl.style.display = 'inline-block';
      countEl.textContent = `${threats.length} đe dọa`;
    }

    let html = '';
    threats.slice(0, 5).forEach(t => {
      // Determine severity class for row styling
      let severityClass = 'sev-normal';
      let threatLevelBadge = '';

      if (t.isTargetKing) {
        severityClass = 'sev-king';
        threatLevelBadge = `<span class="ziga-threat-badge tag-king" title="Nguy hiểm!">👑 CHIẾU!</span>`;
      } else if (t.isTargetXe) {
        severityClass = 'sev-xe';
        threatLevelBadge = `<span class="ziga-threat-badge tag-xe" title="Quân Xe">⚡ MẤT XE</span>`;
      } else if (t.isTargetMajor) {
        severityClass = 'sev-major';
        threatLevelBadge = `<span class="ziga-threat-badge tag-major" title="Quân chủ lực bị đe dọa">CHỦ LỰC</span>`;
      } else {
        threatLevelBadge = `<span class=""></span>`;
      }

      // Attacker piece token color class (0 = Red, 1 = Black)
      const atkColorClass = t.attackerColor === 0 ? 'token-red' : 'token-black';
      // Target piece token color class
      const tgtColorClass = t.targetColor === 0 ? 'token-red' : 'token-black';

      html += `
        <div class="ziga-threat-card ${severityClass}">
          <div class="ziga-threat-main-line">

            <!-- QUÂN ĐỊCH TẤN CÔNG -->
            <div class="ziga-threat-party enemy-party">
              <span class="ziga-party-pill enemy-pill">ĐỊCH</span>
              <div class="ziga-mini-token ${atkColorClass} ${t.isAttackerMajor ? 'major-token' : ''}" title="Quân tấn công: ${t.attackerName}">
                <span>${t.attackerChar}</span>
              </div>
              <div class="ziga-party-meta">
                <span class="ziga-party-name ${t.isAttackerMajor ? 'highlight-atk-major' : ''}">${t.attackerName}</span>
              </div>
            </div>

            <!-- MŨI TÊN TẤN CÔNG -->
            <div class="ziga-threat-attack-indicator" title="Đang nhắm đánh">
              <span class="ziga-atk-sword">⚔️</span>
            </div>

            <!-- QUÂN TA BỊ NHẮM -->
            <div class="ziga-threat-party friendly-party">
              <span class="ziga-party-pill friendly-pill">TA</span>
              <div class="ziga-mini-token ${tgtColorClass} ${t.isTargetMajor ? 'target-major-token' : ''}" title="Quân của bạn đang bị nhắm: ${t.targetName}">
                <span>${t.targetChar}</span>
              </div>
              <div class="ziga-party-meta">
                <span class="ziga-party-name ${t.isTargetMajor ? 'highlight-tgt-major' : ''}">${t.targetName}</span>
                ${threatLevelBadge}
              </div>
            </div>

            <!-- TỌA ĐỘ BÀN CỜ -->
            <div class="ziga-threat-pos-pill" title="Vị trí bị đe dọa: ${t.fullCoordText}">
              ${t.coordText}
            </div>

          </div>
        </div>
      `;
    });

    itemsContainer.innerHTML = html;
  }

  // Export to namespace
  ZigaMod.scanThreats = scanThreats;
  ZigaMod.updateThreatUi = updateThreatUi;

})(window.ZigaMod = window.ZigaMod || {});
