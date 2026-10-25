// src/engine_hook.js - Cocos2d in-engine hooks for piece sprite enhancement and click handling
(function (ZigaMod) {
  'use strict';

  function enhancePieceSprite(piece) {
    if (!piece || piece.__zigaEnhancedKj) return;
    piece.__zigaEnhancedKj = true;

    piece.kj = function (show) {
      if (!this.rd) return;

      // Honor user setting for in-engine highlight
      if (!ZigaMod.userSettings.highlightTactics) {
        this.rd.setVisible(false);
        this.rd.stopAllActions();
        return;
      }

      this.rd.setVisible(!!show);

      if (show) {
        this.rd.stopAllActions();
        if (this.rd.WT) this.rd.WT.stopAllActions();

        // Scale to 0.95 to embrace piece diameter perfectly
        this.rd.setScale(0.95);

        // Pulse animation
        var fadeOut = cc.fadeTo(0.35, 60);
        var fadeIn = cc.fadeTo(0.35, 255);
        var pulse = cc.sequence(fadeOut, fadeIn).repeatForever();
        this.rd.runAction(pulse);

        if (this.rd.WT) {
          var targetH = this.rd.getContentSize().height;
          var wtH = this.rd.WT.getContentSize().height;
          if (wtH > 0) {
            this.rd.WT.setScale(targetH / wtH);
          }
          this.rd.WT.runAction(pulse.clone());
        }
      } else {
        this.rd.stopAllActions();
        if (this.rd.WT) this.rd.WT.stopAllActions();
        this.rd.setScale(0.5);
      }
    };
  }

  function hookGameLayer(gameLayer) {
    if (!gameLayer || gameLayer.__zigaInEngineHooked) return;
    gameLayer.__zigaInEngineHooked = true;

    console.log('[Ziga Mod] In-engine hooks active (nT, pA, fU).');

    if (gameLayer.V && Array.isArray(gameLayer.V)) {
      for (let i = 0; i < gameLayer.V.length; i++) {
        enhancePieceSprite(gameLayer.V[i]);
      }
    }

    // 1. OVERRIDE nT (checks all 32 pieces for captures)
    gameLayer.nT = function (pieceIndex) {
      if (pieceIndex < 0 || pieceIndex >= 32 || !this.V[pieceIndex]) return;

      var b = Array(9);
      for (var c = 0; 10 > c; c++) b[c] = Array(10);
      this.ZC(b);

      var pieceHelper = this.hq(pieceIndex);
      this.Vp = [];
      var attacker = this.V[pieceIndex];
      var attackerColor = attacker.ka;
      var capturableList = [];

      for (var d = 0, e = 0; 90 > e; e++) {
        if (this.IM(pieceHelper, pieceIndex, e, b)) {
          var f = e % 9, g = Math.floor(e / 9);

          if (this.BM(pieceHelper, pieceIndex, f, g, b) || this.DM(0, pieceHelper, pieceIndex, f, g, b)) {
            if (this.tc[d]) {
              this.tc[d].setPosition(this.Pb(f), this.Qb(g));
              this.tc[d].Ir = g;
              this.tc[d].cq = f;
              this.tc[d].setVisible(false);
            }
          } else {
            var isEnemyCapture = false;

            for (var k = 0; k < 32; k++) {
              var targetPiece = this.V[k];
              if (targetPiece && !targetPiece.pa && targetPiece.ka !== attackerColor && targetPiece.fa === f && targetPiece.rowIndex === g) {
                isEnemyCapture = true;
                if (ZigaMod.userSettings.highlightTactics) {
                  targetPiece.kj(true);
                }
                this.Vp.push([f, g]);

                capturableList.push({
                  piece: targetPiece,
                  type: targetPiece.Ga,
                  color: targetPiece.ka,
                  col: f,
                  row: g,
                  name: ZigaMod.PIECE_DEFS[targetPiece.Ga] ? ZigaMod.PIECE_DEFS[targetPiece.Ga].name : 'Quân',
                  char: ZigaMod.getPieceChar(targetPiece.Ga, targetPiece.ka),
                  value: ZigaMod.PIECE_DEFS[targetPiece.Ga] ? ZigaMod.PIECE_DEFS[targetPiece.Ga].value : 0
                });
                break;
              }
            }

            if (!isEnemyCapture && this.tc[d]) {
              this.tc[d].setPosition(this.Pb(f), this.Qb(g));
              this.tc[d].Ir = g;
              this.tc[d].cq = f;
              this.tc[d].setVisible(true);
            }
          }
          d++;
        }
      }

      ZigaMod.selectedAttackerIndex = pieceIndex;
      if (ZigaMod.userSettings.showTacticalHud) {
        ZigaMod.updateTacticalHud(attacker, capturableList);
      }
    };

    // 2. OVERRIDE pA (clears highlights across all 32 pieces)
    gameLayer.pA = function () {
      for (var a = 0; a < 20; a++) {
        if (this.tc[a]) {
          this.tc[a].setPosition(-100, -100);
          this.tc[a].Ir = -1;
          this.tc[a].cq = -1;
        }
      }

      for (var a = 0; a < 32; a++) {
        if (this.V[a] && typeof this.V[a].kj === 'function') {
          this.V[a].kj(false);
        }
      }

      ZigaMod.selectedAttackerIndex = -1;
      ZigaMod.clearTacticalHud();
    };

    // 3. HOOK fU (handles click on opponent pieces)
    const origFU = gameLayer.fU;
    gameLayer.fU = function (touchX, touchY) {
      const col = this.xq(touchX);
      const row = this.Cq(touchY);
      const clickedIdx = this.QK(col, row);

      if (clickedIdx >= 0) {
        const clickedPiece = this.V[clickedIdx];
        const myColor = (this.Nj !== undefined && this.Nj >= 0) ? this.Nj : 0;
        const isMyTurn = (this.T && this.T().Fb === 2 && this.Yc === this.Nj);

        if (this.le >= 0 && isMyTurn && this.HM && this.HM(col, row)) {
          origFU.call(this, touchX, touchY);
          return;
        }

        if (clickedPiece && (clickedPiece.ka !== myColor || !isMyTurn)) {
          if (this.le === clickedIdx) {
            this.fp();
          } else {
            this.pA();
            this.le = clickedIdx;

            this.ij.setPosition(this.Pb(clickedPiece.fa), this.Qb(clickedPiece.rowIndex) + 1);
            if (!this.Fr) {
              this.Fr = cc.rotateBy(2, 360).repeatForever();
            }
            this.ij.stopAllActions();
            this.ij.runAction(this.Fr);
            this.ij.setVisible(true);

            this.nT(clickedIdx);
          }
          return;
        }
      }

      origFU.call(this, touchX, touchY);
    };
  }

  // Export to namespace
  ZigaMod.enhancePieceSprite = enhancePieceSprite;
  ZigaMod.hookGameLayer = hookGameLayer;

})(window.ZigaMod = window.ZigaMod || {});
