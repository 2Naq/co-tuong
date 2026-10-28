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

    console.log('[AN Mod] In-engine hooks active (nT, pA, fU).');

    if (gameLayer.V && Array.isArray(gameLayer.V)) {
      for (let i = 0; i < gameLayer.V.length; i++) {
        enhancePieceSprite(gameLayer.V[i]);
      }
    }

    // Initialize board row numbers (1-10 on left and right wooden rims)
    setupRowNumbers(gameLayer);

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

  // ==========================================
  // BOARD ROW NUMBERS (1 to 10 on Wooden Rims)
  // ==========================================

  function setupRowNumbers(gameLayer) {
    if (!gameLayer || typeof gameLayer.Pb !== 'function' || typeof gameLayer.Qb !== 'function') return;

    const ROW_FONT_SIZE = 16;

    // Nếu đã tạo nhãn với đúng cỡ chữ này thì chỉ cập nhật ẩn/hiện
    if (gameLayer.__zigaRowLabels && gameLayer.__zigaRowLabels.length > 0 && gameLayer.__zigaRowLabelsFontSize === ROW_FONT_SIZE) {
      updateRowLabelsVisibility(gameLayer);
      return;
    }

    // Nếu cỡ chữ thay đổi hoặc cần tạo mới, gỡ bỏ nhãn cũ trước
    if (gameLayer.__zigaRowLabels && Array.isArray(gameLayer.__zigaRowLabels)) {
      for (let i = 0; i < gameLayer.__zigaRowLabels.length; i++) {
        const lbl = gameLayer.__zigaRowLabels[i];
        if (lbl && typeof lbl.removeFromParent === 'function') {
          lbl.removeFromParent(true);
        }
      }
      gameLayer.__zigaRowLabels = [];
    }

    gameLayer.__zigaRowLabelsFontSize = ROW_FONT_SIZE;
    gameLayer.__zigaRowLabelsAdded = true;

    const p0 = gameLayer.Pb(0);
    const p1 = gameLayer.Pb(1);
    const p8 = gameLayer.Pb(8);
    const dx = Math.abs(p1 - p0) || 57;

    const leftX = p0 - dx * 0.44;
    const rightX = p8 + dx * 0.44;

    const labels = [];
    let cocosSuccess = false;

    if (window.cc) {
      try {
        for (let r = 0; r < 10; r++) {
          const y = gameLayer.Qb(r);
          const numText = (10 - r).toString();
          const numTextRight = (r + 1).toString();

          let lblL = null;
          let lblR = null;

          if (typeof cc.LabelTTF === 'function') {
            try {
              lblL = new cc.LabelTTF(numText, "Arial", ROW_FONT_SIZE);
              lblR = new cc.LabelTTF(numTextRight, "Arial", ROW_FONT_SIZE);
            } catch (e) {
              if (cc.LabelTTF.create) {
                lblL = cc.LabelTTF.create(numText, "Arial", ROW_FONT_SIZE);
                lblR = cc.LabelTTF.create(numTextRight, "Arial", ROW_FONT_SIZE);
              }
            }
          }

          if (lblL && lblR) {
            // Wood carved tone matching bottom column numbers exactly
            const textColor = cc.color ? cc.color(114, 51, 20) : null;
            if (textColor) {
              if (lblL.setColor) {
                lblL.setColor(textColor);
                lblR.setColor(textColor);
              }
            }
            if (lblL.setOpacity) {
              lblL.setOpacity(220);
              lblR.setOpacity(220);
            }
            lblL.setPosition(leftX, y);
            lblR.setPosition(rightX, y);
            if (lblL.setAnchorPoint) {
              lblL.setAnchorPoint(0.5, 0.5);
              lblR.setAnchorPoint(0.5, 0.5);
            }

            // Add at z-index 5 (below pieces at z=10, above board background at z=0)
            gameLayer.addChild(lblL, 5);
            gameLayer.addChild(lblR, 5);

            labels.push(lblL);
            labels.push(lblR);
            cocosSuccess = true;
          }
        }
      } catch (err) {
        console.warn('[AN Mod] Cocos2d LabelTTF init failed:', err);
      }
    }

    gameLayer.__zigaRowLabels = labels;

    // Fallback: If Cocos labels could not be created, use DOM overlay
    if (!cocosSuccess) {
      setupDomRowNumbers(gameLayer);
    }

    updateRowLabelsVisibility(gameLayer);
  }

  function setupDomRowNumbers(gameLayer) {
    let overlay = document.getElementById('ziga-dom-row-numbers');
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ziga-dom-row-numbers';
      overlay.style.position = 'absolute';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '50';
      const parent = canvas.parentElement || document.body;
      if (window.getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(overlay);
    }

    const rect = canvas.getBoundingClientRect();
    const parentRect = overlay.parentElement.getBoundingClientRect();
    const scaleX = rect.width / (canvas.width || 1);
    const scaleY = rect.height / (canvas.height || 1);

    const dx = Math.abs(gameLayer.Pb(1) - gameLayer.Pb(0)) || 57;
    const leftX = gameLayer.Pb(0) - dx * 0.44;
    const rightX = gameLayer.Pb(8) + dx * 0.44;

    overlay.innerHTML = '';
    for (let r = 0; r < 10; r++) {
      const cocosY = gameLayer.Qb(r);
      const domY = (canvas.height - cocosY) * scaleY + (rect.top - parentRect.top);
      const domLeftX = leftX * scaleX + (rect.left - parentRect.left);
      const domRightX = rightX * scaleX + (rect.left - parentRect.left);
      const numText = (r + 1).toString();

      const spanL = document.createElement('span');
      spanL.className = 'ziga-board-row-num';
      spanL.textContent = numText;
      spanL.style.position = 'absolute';
      spanL.style.left = domLeftX + 'px';
      spanL.style.top = domY + 'px';
      spanL.style.transform = 'translate(-50%, -50%)';
      overlay.appendChild(spanL);

      const spanR = document.createElement('span');
      spanR.className = 'ziga-board-row-num';
      spanR.textContent = numText;
      spanR.style.position = 'absolute';
      spanR.style.left = domRightX + 'px';
      spanR.style.top = domY + 'px';
      spanR.style.transform = 'translate(-50%, -50%)';
      overlay.appendChild(spanR);
    }
  }

  function updateRowLabelsVisibility(gameLayer) {
    const show = !!ZigaMod.userSettings.showRowNumbers;
    if (gameLayer && gameLayer.__zigaRowLabels) {
      for (let i = 0; i < gameLayer.__zigaRowLabels.length; i++) {
        const lbl = gameLayer.__zigaRowLabels[i];
        if (lbl && typeof lbl.setVisible === 'function') {
          lbl.setVisible(show);
        }
      }
    }
    const domOverlay = document.getElementById('ziga-dom-row-numbers');
    if (domOverlay) {
      domOverlay.style.display = show ? 'block' : 'none';
    }
  }

  // Export to namespace
  ZigaMod.enhancePieceSprite = enhancePieceSprite;
  ZigaMod.hookGameLayer = hookGameLayer;
  ZigaMod.setupRowNumbers = setupRowNumbers;
  ZigaMod.updateRowLabelsVisibility = updateRowLabelsVisibility;

})(window.ZigaMod = window.ZigaMod || {});
