// src/engine_hook.js - Cocos2d in-engine hooks for piece sprite enhancement and click handling
(function (ZigaMod) {
  "use strict";

  // =========================================================================
  // HELPER COMPATIBILITY LAYER: Ziga ver=142, ver=141 vs Legacy Ziga
  // =========================================================================

  function generateBoardMatrix(gl, b) {
    if (!gl) return;
    if (typeof gl.fD === "function") {
      gl.fD(b);
    } else if (typeof gl.ZC === "function") {
      gl.ZC(b);
    } else {
      for (let c = 0; 9 > c; c++) {
        if (!b[c]) b[c] = Array(10);
        for (let d = 0; 10 > d; d++) b[c][d] = -1;
      }
      if (gl.V && Array.isArray(gl.V)) {
        for (let c = 0; 32 > c; c++) {
          if (
            gl.V[c] &&
            !gl.V[c].pa &&
            gl.V[c].fa !== undefined &&
            gl.V[c].rowIndex !== undefined
          ) {
            b[gl.V[c].fa][gl.V[c].rowIndex] = c;
          }
        }
      }
    }
  }

  function getPieceHelper(gl, pieceIndex) {
    if (!gl) return null;
    if (typeof gl.fq === "function") return gl.fq(pieceIndex);
    if (typeof gl.hq === "function") return gl.hq(pieceIndex);
    if (gl.V && gl.V[pieceIndex]) {
      const p = gl.V[pieceIndex];
      if (
        typeof window !== "undefined" &&
        typeof window.BkChessPiece === "function"
      ) {
        try {
          const b = new window.BkChessPiece(pieceIndex);
          b.Ha = p.Ha !== undefined ? p.Ha : p.Ga !== undefined ? p.Ga : 0;
          b.ka = p.ka;
          b.fa = p.fa;
          b.rowIndex = p.rowIndex;
          return b;
        } catch (e) {}
      }
      return p;
    }
    return null;
  }

  function isMovePatternValid(gl, helper, pieceIndex, destSquare, matrix) {
    if (!gl || !helper) return false;
    // In v142+: QM is pattern check: QM(helper, pieceIndex, destSquare, matrix)
    if (typeof gl.QM === "function") {
      return !!gl.QM(helper, pieceIndex, destSquare, matrix);
    }
    // In v141: PM is pattern check (4 args: helper, pieceIndex, destSquare, matrix)
    if (typeof gl.PM === "function" && gl.PM.length >= 3) {
      return !!gl.PM(helper, pieceIndex, destSquare, matrix);
    }
    // In legacy: IM is pattern check
    if (typeof gl.IM === "function" && gl.IM.length >= 3) {
      return !!gl.IM(helper, pieceIndex, destSquare, matrix);
    }
    return false;
  }

  function isKingFacingKing(gl, helper, pieceIndex, col, row, matrix) {
    if (!gl || !helper) return false;
    // In v142+: JM is king-facing-king check (takes 5 args: helper, pieceIndex, col, row, matrix)
    if (typeof gl.JM === "function") {
      return !!gl.JM(helper, pieceIndex, col, row, matrix);
    }
    // In v141: IM is king-facing-king check (takes 5 args)
    if (typeof gl.PM === "function" && typeof gl.IM === "function") {
      return !!gl.IM(helper, pieceIndex, col, row, matrix);
    }
    // In legacy: BM is king-facing-king check (takes 5 args)
    if (typeof gl.BM === "function") {
      return !!gl.BM(helper, pieceIndex, col, row, matrix);
    }
    return false;
  }

  function isKingCheckedAfterMove(gl, helper, pieceIndex, col, row, matrix) {
    if (!gl || !helper) return false;
    // In v142+: LM is king-checked check (takes 6 args: 0, helper, pieceIndex, col, row, matrix)
    if (typeof gl.LM === "function") {
      return !!gl.LM(0, helper, pieceIndex, col, row, matrix);
    }
    // In v141: KM is king-checked check (takes 6 args: 0, helper, pieceIndex, col, row, matrix)
    if (typeof gl.KM === "function") {
      return !!gl.KM(0, helper, pieceIndex, col, row, matrix);
    }
    // In legacy: DM is king-checked check (takes 6 args)
    if (typeof gl.DM === "function") {
      return !!gl.DM(0, helper, pieceIndex, col, row, matrix);
    }
    return false;
  }

  function findPieceAt(gl, col, row) {
    if (!gl) return -1;
    // In v142+: XK is findPieceAt(col, row)
    if (typeof gl.XK === "function") return gl.XK(col, row);
    // In v141: WK is findPieceAt(col, row)
    if (typeof gl.WK === "function") return gl.WK(col, row);
    if (typeof gl.QK === "function") return gl.QK(col, row);
    if (gl.V && Array.isArray(gl.V)) {
      for (let c = 0; 32 > c; c++) {
        if (
          gl.V[c] &&
          !gl.V[c].pa &&
          gl.V[c].fa === col &&
          gl.V[c].rowIndex === row
        ) {
          return c;
        }
      }
    }
    return -1;
  }

  function isDestValid(gl, col, row) {
    if (!gl) return false;
    // In v142+: PM is destination valid check: PM(col, row)
    if (typeof gl.PM === "function" && gl.PM.length === 2) {
      return !!gl.PM(col, row);
    }
    if (typeof gl.OM === "function") return gl.OM(col, row);
    if (typeof gl.HM === "function") return gl.HM(col, row);

    // Fallback against tc markers
    if (gl.tc && Array.isArray(gl.tc)) {
      for (let c = 0; c < gl.tc.length; c++) {
        const marker = gl.tc[c];
        if (marker && marker.x > 0) {
          const mCol = marker.aq !== undefined ? marker.aq : marker.cq;
          const mRow = marker.Kr !== undefined ? marker.Kr : marker.Ir;
          if (mCol === col && mRow === row) return true;
        }
      }
    }
    const list = gl.Tp || gl.Vp || [];
    for (let c = 0; c < list.length; c++) {
      if (list[c] && list[c][0] === col && list[c][1] === row) return true;
    }
    return false;
  }

  // =========================================================================
  // PIECE SPRITE ENHANCEMENT (Pulsing Attack Aura)
  // =========================================================================

  function enhancePieceSprite(piece) {
    if (!piece || piece.__zigaEnhancedKj) return;
    piece.__zigaEnhancedKj = true;

    piece.kj = function (show) {
      if (!this.rd) return;

      // Honor user setting for in-engine highlight (defaults to true)
      const isHighlightEnabled =
        !ZigaMod.userSettings ||
        ZigaMod.userSettings.highlightTactics !== false;

      if (!isHighlightEnabled || !show) {
        this.rd.setVisible(false);
        this.rd.stopAllActions();
        if (this.rd.eU) this.rd.eU.stopAllActions();
        if (this.rd.WT) this.rd.WT.stopAllActions();
        if (this.rd.dU) this.rd.dU.stopAllActions();
        this.rd.setScale(0.5);
        return;
      }

      this.rd.setVisible(true);
      this.rd.stopAllActions();
      if (this.rd.eU) this.rd.eU.stopAllActions();
      if (this.rd.WT) this.rd.WT.stopAllActions();
      if (this.rd.dU) this.rd.dU.stopAllActions();
      this.rd.setScale(0.5);

      // Pulse animation matching native Ziga scale & clean sequence
      if (
        typeof cc !== "undefined" &&
        typeof cc.fadeTo === "function" &&
        typeof cc.sequence === "function"
      ) {
        var fadeOut = cc.fadeTo(0.4, 40);
        var fadeIn = cc.fadeTo(0.4, 255);
        var pulse = cc.sequence(fadeOut, fadeIn).repeatForever();
        this.rd.runAction(pulse);

        var inner = this.rd.eU || this.rd.dU || this.rd.WT;
        if (inner) {
          inner.runAction(pulse.clone());
        }
      }
    };
  }

  // =========================================================================
  // CUSTOM HIGHLIGHT MOVES (Full 32-piece capture detection)
  // =========================================================================

  function customHighlightMoves(gl, pieceIndex) {
    if (pieceIndex < 0 || pieceIndex >= 32 || !gl.V || !gl.V[pieceIndex]) return;

    var b = Array(9);
    for (var c = 0; 10 > c; c++) b[c] = Array(10);
    generateBoardMatrix(gl, b);

    var pieceHelper = getPieceHelper(gl, pieceIndex);
    if (!pieceHelper) return;

    gl.Tp = [];
    gl.Vp = [];
    var attacker = gl.V[pieceIndex];
    var attackerColor = attacker.ka;
    var capturableList = [];

    for (var d = 0, e = 0; 90 > e; e++) {
      if (isMovePatternValid(gl, pieceHelper, pieceIndex, e, b)) {
        var f = e % 9,
          g = Math.floor(e / 9);

        var isBlockedOrChecked =
          isKingFacingKing(gl, pieceHelper, pieceIndex, f, g, b) ||
          isKingCheckedAfterMove(gl, pieceHelper, pieceIndex, f, g, b);

        if (isBlockedOrChecked) {
          if (gl.tc && gl.tc[d]) {
            gl.tc[d].setPosition(gl.Pb(f), gl.Qb(g));
            gl.tc[d].Kr = g;
            gl.tc[d].Ir = g;
            gl.tc[d].aq = f;
            gl.tc[d].cq = f;
            gl.tc[d].setVisible(false);
          }
        } else {
          var isEnemyCapture = false;

          // Check ALL 32 pieces for target on square (f, g)
          // Fixes Ziga's engine bug where it hardcoded k = 16..31
          for (var k = 0; k < 32; k++) {
            var targetPiece = gl.V[k];
            if (
              targetPiece &&
              !targetPiece.pa &&
              targetPiece.ka !== attackerColor &&
              targetPiece.fa === f &&
              targetPiece.rowIndex === g
            ) {
              isEnemyCapture = true;
              enhancePieceSprite(targetPiece);
              if (
                !ZigaMod.userSettings ||
                ZigaMod.userSettings.highlightTactics !== false
              ) {
                targetPiece.kj(true);
              }
              gl.Tp.push([f, g]);
              gl.Vp.push([f, g]);

              const pType =
                typeof ZigaMod.resolvePieceType === "function"
                  ? ZigaMod.resolvePieceType(targetPiece, k)
                  : targetPiece.Ha !== undefined
                    ? targetPiece.Ha
                    : targetPiece.Ga !== undefined
                      ? targetPiece.Ga
                      : 6;

              capturableList.push({
                piece: targetPiece,
                type: pType,
                color: targetPiece.ka,
                col: f,
                row: g,
                name:
                  ZigaMod.PIECE_DEFS && ZigaMod.PIECE_DEFS[pType]
                    ? ZigaMod.PIECE_DEFS[pType].name
                    : "Quân",
                char:
                  typeof ZigaMod.getPieceChar === "function"
                    ? ZigaMod.getPieceChar(pType, targetPiece.ka)
                    : "",
                value:
                  ZigaMod.PIECE_DEFS && ZigaMod.PIECE_DEFS[pType]
                    ? ZigaMod.PIECE_DEFS[pType].value
                    : 0,
              });
              break;
            }
          }

          if (!isEnemyCapture && gl.tc && gl.tc[d]) {
            gl.tc[d].setPosition(gl.Pb(f), gl.Qb(g));
            gl.tc[d].Kr = g;
            gl.tc[d].Ir = g;
            gl.tc[d].aq = f;
            gl.tc[d].cq = f;
            gl.tc[d].setVisible(true);
          }
        }
        d++;
      }
    }

    ZigaMod.selectedAttackerIndex = pieceIndex;
    if (typeof ZigaMod.updateTacticalHud === "function") {
      ZigaMod.updateTacticalHud(attacker, capturableList);
    }

    // Guarantee rotating selection indicator (this.ij) is ALWAYS visible, actively rotating, and BEHIND pieces
    if (gl && gl.ij && gl.V && gl.V[pieceIndex]) {
      gl.ij.setVisible(true);
      // z-order 31: ABOVE background (0) and BEHIND pieces (32) so chess character is crisp & clean
      if (typeof gl.ij.setLocalZOrder === "function") {
        gl.ij.setLocalZOrder(31);
      }
      gl.ij.setPosition(
        gl.Pb(gl.V[pieceIndex].fa),
        gl.Qb(gl.V[pieceIndex].rowIndex) + 1,
      );
      if (typeof cc !== "undefined" && typeof cc.rotateBy === "function") {
        if (
          !gl.ij.getNumberOfRunningActions ||
          gl.ij.getNumberOfRunningActions() === 0
        ) {
          const rot = cc.rotateBy(2, 360).repeatForever();
          gl.Hr = rot;
          gl.Fr = rot;
          gl.ij.stopAllActions();
          gl.ij.runAction(rot);
        }
      }
    }
  }

  // =========================================================================
  // CLEAR HIGHLIGHTS (All 32 pieces and markers)
  // =========================================================================

  function clearHighlights(gl) {
    if (!gl) return;

    if (gl.tc && Array.isArray(gl.tc)) {
      for (var a = 0; a < gl.tc.length; a++) {
        if (gl.tc[a]) {
          gl.tc[a].setPosition(-100, -100);
          gl.tc[a].Kr = -1;
          gl.tc[a].Ir = -1;
          gl.tc[a].aq = -1;
          gl.tc[a].cq = -1;
        }
      }
    }

    if (gl.V && Array.isArray(gl.V)) {
      for (var a = 0; a < 32; a++) {
        if (gl.V[a] && typeof gl.V[a].kj === "function") {
          gl.V[a].kj(false);
        }
      }
    }

    // Cleanly hide and reset selection swirl (gl.ij)
    if (gl.ij) {
      gl.ij.setPosition(-100, -100);
      if (gl.Hr) {
        gl.ij.stopAction(gl.Hr);
        gl.Hr = null;
      }
      if (gl.Fr) {
        gl.ij.stopAction(gl.Fr);
        gl.Fr = null;
      }
      gl.ij.stopAllActions();
      gl.ij.setVisible(false);
    }

    if (gl.Tp) gl.Tp = [];
    if (gl.Vp) gl.Vp = [];

    ZigaMod.selectedAttackerIndex = -1;
    if (typeof ZigaMod.clearTacticalHud === "function") {
      ZigaMod.clearTacticalHud();
    }
  }

  // =========================================================================
  // HOOK GAME LAYER
  // =========================================================================

  function hookGameLayer(gameLayer) {
    if (!gameLayer || gameLayer.__zigaInEngineHooked) return;
    gameLayer.__zigaInEngineHooked = true;

    console.log(
      "[AN Mod] In-engine hooks active (vT/nT, zA/pA, cp/fp, nU/fU).",
    );

    // Also enhance BkChessPieceSprite prototype if available
    if (
      typeof window !== "undefined" &&
      window.BkChessPieceSprite &&
      window.BkChessPieceSprite.prototype
    ) {
      enhancePieceSprite(window.BkChessPieceSprite.prototype);
    }

    if (gameLayer.V && Array.isArray(gameLayer.V)) {
      for (let i = 0; i < gameLayer.V.length; i++) {
        enhancePieceSprite(gameLayer.V[i]);
      }
    }

    // Initialize board row numbers (1-10 on left and right wooden rims)
    setupRowNumbers(gameLayer);

    // 0. HOOK YR (v142+) / XR (v141 selection indicator placement & rotation)
    const origYR = typeof gameLayer.YR === "function" ? gameLayer.YR : null;
    const origXR = typeof gameLayer.XR === "function" ? gameLayer.XR : null;
    const selectHandler = function (pieceIndex) {
      if (origYR) {
        origYR.call(this, pieceIndex);
      } else if (origXR) {
        origXR.call(this, pieceIndex);
      }
      this.me = pieceIndex;
      this.le = pieceIndex;
      if (this.ij && this.V && this.V[pieceIndex]) {
        this.ij.setVisible(true);
        if (typeof this.ij.setLocalZOrder === "function") {
          this.ij.setLocalZOrder(31);
        }
        this.ij.setPosition(
          this.Pb(this.V[pieceIndex].fa),
          this.Qb(this.V[pieceIndex].rowIndex) + 1,
        );
        if (typeof cc !== "undefined" && typeof cc.rotateBy === "function") {
          if (
            !this.ij.getNumberOfRunningActions ||
            this.ij.getNumberOfRunningActions() === 0
          ) {
            const rot = cc.rotateBy(2, 360).repeatForever();
            this.Hr = rot;
            this.Fr = rot;
            this.ij.stopAllActions();
            this.ij.runAction(rot);
          }
        }
      }
    };
    if (origYR) gameLayer.YR = selectHandler;
    if (origXR) gameLayer.XR = selectHandler;

    // 1. OVERRIDE wT (v142+), vT (v141) and nT (legacy)
    gameLayer.wT = function (pieceIndex) {
      customHighlightMoves(this, pieceIndex);
    };
    gameLayer.vT = function (pieceIndex) {
      customHighlightMoves(this, pieceIndex);
    };
    gameLayer.nT = function (pieceIndex) {
      customHighlightMoves(this, pieceIndex);
    };

    // 2. OVERRIDE zA (v141+) and pA (legacy)
    gameLayer.zA = function () {
      clearHighlights(this);
    };
    gameLayer.pA = function () {
      clearHighlights(this);
    };

    // 3. OVERRIDE cp (v141+) and fp (legacy)
    const unselectHandler = function () {
      if (this.ij) {
        this.ij.setPosition(-100, -100);
        if (this.Hr) this.ij.stopAction(this.Hr);
        if (this.Fr) this.ij.stopAction(this.Fr);
        this.ij.stopAllActions();
        this.Hr = null;
        this.Fr = null;
        this.ij.setVisible(false);
      }

      clearHighlights(this);
      this.me = -1;
      this.le = -1;
    };

    gameLayer.cp = unselectHandler;
    gameLayer.fp = unselectHandler;

    // 4. HOOK oU (v142+), nU (v141) and fU (legacy)
    const origOU = typeof gameLayer.oU === "function" ? gameLayer.oU : null;
    const origNU = typeof gameLayer.nU === "function" ? gameLayer.nU : null;
    const origFU = typeof gameLayer.fU === "function" ? gameLayer.fU : null;

    const invokeOrigTouch = (target, touchX, touchY) => {
      if (origOU) origOU.call(target, touchX, touchY);
      else if (origNU) origNU.call(target, touchX, touchY);
      else if (origFU) origFU.call(target, touchX, touchY);
    };

    const touchHandler = function (touchX, touchY) {
      const col = typeof this.xq === "function" ? this.xq(touchX) : -1;
      const row = typeof this.Cq === "function" ? this.Cq(touchY) : -1;
      const clickedIdx = findPieceAt(this, col, row);

      if (clickedIdx >= 0 && this.V && this.V[clickedIdx]) {
        const clickedPiece = this.V[clickedIdx];
        const myColor = this.Nj !== undefined && this.Nj >= 0 ? this.Nj : 0;
        const isMyTurn =
          this.T &&
          typeof this.T === "function" &&
          this.T().Fb === 2 &&
          this.Yc === this.Nj;
        const currentSelected =
          this.me !== undefined && this.me >= 0
            ? this.me
            : this.le !== undefined && this.le >= 0
              ? this.le
              : -1;

        // A. If my turn, piece already selected, and clicked on a valid destination/capture move -> make move!
        if (currentSelected >= 0 && isMyTurn && isDestValid(this, col, row)) {
          invokeOrigTouch(this, touchX, touchY);
          return;
        }

        // B. If clicked opponent piece OR clicked own piece when NOT my turn -> Tactical Inspector
        if (clickedPiece.ka !== myColor || !isMyTurn) {
          if (currentSelected === clickedIdx) {
            // Clicked same piece again -> deselect & clear highlights
            this.cp();
          } else {
            // Select to inspect attack range
            this.cp();
            this.me = clickedIdx;
            this.le = clickedIdx;

            if (this.ij) {
              this.ij.setVisible(true);
              if (typeof this.ij.setLocalZOrder === "function") {
                this.ij.setLocalZOrder(31);
              }
              this.ij.setPosition(
                this.Pb(clickedPiece.fa),
                this.Qb(clickedPiece.rowIndex) + 1,
              );
              this.ij.stopAllActions();
              if (
                typeof cc !== "undefined" &&
                typeof cc.rotateBy === "function"
              ) {
                const rot = cc.rotateBy(2, 360).repeatForever();
                this.Hr = rot;
                this.Fr = rot;
                this.ij.runAction(rot);
              }
            }

            customHighlightMoves(this, clickedIdx);
          }
          return;
        }

        // C. Clicked own piece on my turn -> default selection behavior (calls YR/XR -> wT/vT/nT)
        invokeOrigTouch(this, touchX, touchY);

        // After calling native touch handler, verify selection ring is visible if a piece was selected
        const newSelected =
          this.me !== undefined && this.me >= 0
            ? this.me
            : this.le !== undefined && this.le >= 0
              ? this.le
              : -1;
        if (newSelected >= 0 && this.ij && this.V && this.V[newSelected]) {
          this.ij.setVisible(true);
          if (typeof this.ij.setLocalZOrder === "function") {
            this.ij.setLocalZOrder(31);
          }
          this.ij.setPosition(
            this.Pb(this.V[newSelected].fa),
            this.Qb(this.V[newSelected].rowIndex) + 1,
          );
          if (typeof cc !== "undefined" && typeof cc.rotateBy === "function") {
            if (
              !this.ij.getNumberOfRunningActions ||
              this.ij.getNumberOfRunningActions() === 0
            ) {
              const rot = cc.rotateBy(2, 360).repeatForever();
              this.Hr = rot;
              this.Fr = rot;
              this.ij.stopAllActions();
              this.ij.runAction(rot);
            }
          }
        }
        return;
      }

      // D. Clicked outside / empty board square
      const currentSelected =
        this.me !== undefined && this.me >= 0
          ? this.me
          : this.le !== undefined && this.le >= 0
            ? this.le
            : -1;
      if (currentSelected >= 0) {
        const selectedPiece = this.V ? this.V[currentSelected] : null;
        const myColor = this.Nj !== undefined && this.Nj >= 0 ? this.Nj : 0;
        const isMyTurn =
          this.T &&
          typeof this.T === "function" &&
          this.T().Fb === 2 &&
          this.Yc === this.Nj;

        // If inspecting enemy piece or inspecting during opponent turn, clicking empty square deselects
        if (selectedPiece && (selectedPiece.ka !== myColor || !isMyTurn)) {
          this.cp();
          return;
        }
      }

      invokeOrigTouch(this, touchX, touchY);
    };

    if (origOU) gameLayer.oU = touchHandler;
    if (origNU) gameLayer.nU = touchHandler;
    if (origFU) gameLayer.fU = touchHandler;
  }

  // ==========================================
  // BOARD ROW NUMBERS (1 to 10 on Wooden Rims)
  // ==========================================

  function setupRowNumbers(gameLayer) {
    if (
      !gameLayer ||
      typeof gameLayer.Pb !== "function" ||
      typeof gameLayer.Qb !== "function"
    )
      return;

    const ROW_FONT_SIZE = 16;

    // Nếu đã tạo nhãn với đúng cỡ chữ này thì chỉ cập nhật ẩn/hiện
    if (
      gameLayer.__zigaRowLabels &&
      gameLayer.__zigaRowLabels.length > 0 &&
      gameLayer.__zigaRowLabelsFontSize === ROW_FONT_SIZE
    ) {
      updateRowLabelsVisibility(gameLayer);
      return;
    }

    // Nếu cỡ chữ thay đổi hoặc cần tạo mới, gỡ bỏ nhãn cũ trước
    if (gameLayer.__zigaRowLabels && Array.isArray(gameLayer.__zigaRowLabels)) {
      for (let i = 0; i < gameLayer.__zigaRowLabels.length; i++) {
        const lbl = gameLayer.__zigaRowLabels[i];
        if (lbl && typeof lbl.removeFromParent === "function") {
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

          if (typeof cc.LabelTTF === "function") {
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
        console.warn("[AN Mod] Cocos2d LabelTTF init failed:", err);
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
    let overlay = document.getElementById("ziga-dom-row-numbers");
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "ziga-dom-row-numbers";
      overlay.style.position = "absolute";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "50";
      const parent = canvas.parentElement || document.body;
      if (window.getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
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

    overlay.innerHTML = "";
    for (let r = 0; r < 10; r++) {
      const cocosY = gameLayer.Qb(r);
      const domY =
        (canvas.height - cocosY) * scaleY + (rect.top - parentRect.top);
      const domLeftX = leftX * scaleX + (rect.left - parentRect.left);
      const domRightX = rightX * scaleX + (rect.left - parentRect.left);
      const numText = (r + 1).toString();

      const spanL = document.createElement("span");
      spanL.className = "ziga-board-row-num";
      spanL.textContent = numText;
      spanL.style.position = "absolute";
      spanL.style.left = domLeftX + "px";
      spanL.style.top = domY + "px";
      spanL.style.transform = "translate(-50%, -50%)";
      overlay.appendChild(spanL);

      const spanR = document.createElement("span");
      spanR.className = "ziga-board-row-num";
      spanR.textContent = numText;
      spanR.style.position = "absolute";
      spanR.style.left = domRightX + "px";
      spanR.style.top = domY + "px";
      spanR.style.transform = "translate(-50%, -50%)";
      overlay.appendChild(spanR);
    }
  }

  function updateRowLabelsVisibility(gameLayer) {
    const show = !!ZigaMod.userSettings.showRowNumbers;
    if (gameLayer && gameLayer.__zigaRowLabels) {
      for (let i = 0; i < gameLayer.__zigaRowLabels.length; i++) {
        const lbl = gameLayer.__zigaRowLabels[i];
        if (lbl && typeof lbl.setVisible === "function") {
          lbl.setVisible(show);
        }
      }
    }
    const domOverlay = document.getElementById("ziga-dom-row-numbers");
    if (domOverlay) {
      domOverlay.style.display = show ? "block" : "none";
    }
  }

  // Export to namespace
  ZigaMod.generateBoardMatrix = generateBoardMatrix;
  ZigaMod.getPieceHelper = getPieceHelper;
  ZigaMod.isMovePatternValid = isMovePatternValid;
  ZigaMod.isKingFacingKing = isKingFacingKing;
  ZigaMod.isKingCheckedAfterMove = isKingCheckedAfterMove;
  ZigaMod.findPieceAt = findPieceAt;
  ZigaMod.isDestValid = isDestValid;
  ZigaMod.enhancePieceSprite = enhancePieceSprite;
  ZigaMod.hookGameLayer = hookGameLayer;
  ZigaMod.setupRowNumbers = setupRowNumbers;
  ZigaMod.updateRowLabelsVisibility = updateRowLabelsVisibility;
})((window.ZigaMod = window.ZigaMod || {}));
