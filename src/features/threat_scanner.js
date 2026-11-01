// src/threat_scanner.js - Under-attack threat scanner and threat alert UI
(function (ZigaMod) {
  "use strict";

  function scanThreats(gameLayer, myColor, oppColor) {
    const threats = [];
    if (!gameLayer || !gameLayer.V || !ZigaMod.userSettings.threatAlert)
      return threats;

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
                if (
                  !gameLayer.BM ||
                  !gameLayer.BM(pieceHelper, i, c, r, grid)
                ) {
                  const coord = ZigaMod.formatXiangqiCoord
                    ? ZigaMod.formatXiangqiCoord(c, r, myPiece.ka)
                    : {
                        col: myPiece.ka === 0 ? 9 - c : c + 1,
                        row: myPiece.ka === 0 ? r + 1 : 10 - r,
                        text: `C${myPiece.ka === 0 ? 9 - c : c + 1}·H${myPiece.ka === 0 ? r + 1 : 10 - r}`,
                        fullText: `Cột ${myPiece.ka === 0 ? 9 - c : c + 1}, Hàng ${myPiece.ka === 0 ? r + 1 : 10 - r}`,
                      };

                  const targetType = myPiece.Ga;
                  const attackerType = oppPiece.Ga;
                  const targetDef = ZigaMod.PIECE_DEFS[targetType] || {
                    name: "Quân",
                    value: 0,
                  };
                  const attackerDef = ZigaMod.PIECE_DEFS[attackerType] || {
                    name: "Quân",
                    value: 0,
                  };

                  // Major pieces classification:
                  // King: type 0 (Critical - Loss of game)
                  // Xe: type 3 (9đ - Super Major)
                  // Pháo: type 4 (4.5đ - Major)
                  // Mã: type 5 (4đ - Major)
                  const isTargetKing = targetType === 0;
                  const isTargetXe = targetType === 3;
                  const isTargetMajor =
                    targetType === 0 ||
                    targetType === 3 ||
                    targetType === 4 ||
                    targetType === 5;
                  const isAttackerMajor =
                    attackerType === 3 ||
                    attackerType === 4 ||
                    attackerType === 5;

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
                    attackerChar: ZigaMod.getPieceChar(
                      attackerType,
                      oppPiece.ka,
                    ),
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
                    fullCoordText: coord.fullText,
                  });
                }
              }
            } catch (e) {}
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

  let lastThreatsSignature = "";

  function updateThreatUi(threats) {
    if (!ZigaMod.userSettings.threatAlert || !threats || threats.length === 0) {
      if (lastThreatsSignature !== "") {
        lastThreatsSignature = "";
        if (ZigaMod.uiStore) {
          ZigaMod.uiStore.setState({ threats: [] });
        }
      }
      return;
    }

    // Generate signature to avoid unnecessary re-renders every 300ms if threats haven't changed
    const signature = threats
      .slice(0, 5)
      .map(
        (t) =>
          `${t.attackerType}_${t.attacker.fa}_${t.attacker.rowIndex}_${t.targetType}_${t.target.fa}_${t.target.rowIndex}`,
      )
      .join("|");

    if (signature === lastThreatsSignature) {
      return;
    }
    lastThreatsSignature = signature;

    if (ZigaMod.uiStore) {
      ZigaMod.uiStore.setState({ threats: threats.slice(0, 5) });
    }
  }

  // Export to namespace
  ZigaMod.scanThreats = scanThreats;
  ZigaMod.updateThreatUi = updateThreatUi;
})((window.ZigaMod = window.ZigaMod || {}));
