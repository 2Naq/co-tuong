// src/coup_tracker.js - Cờ Úp face-down pieces remaining probability tracker
(function (ZigaMod) {
  'use strict';

  function isCoUpGame(gameLayer) {
    if (!gameLayer) return false;
    // Check if layer is BkCoUpGameLayer or has face-down pieces (ac === 0)
    if (window.BkCoUpGameLayer && gameLayer instanceof window.BkCoUpGameLayer) return true;
    if (gameLayer.V && Array.isArray(gameLayer.V)) {
      return gameLayer.V.some(p => p && p.ac === 0);
    }
    return false;
  }

  function computeCoUpStats(gameLayer, myColor, oppColor) {
    if (!gameLayer || !gameLayer.V) return null;

    function getStatsForSide(color) {
      let unopenedCount = 0;
      const revealed = { 3: 0, 4: 0, 5: 0, 1: 0, 2: 0, 6: 0 };

      for (let i = 0; i < 32; i++) {
        const p = gameLayer.V[i];
        if (!p) continue;
        const pColor = p.ka !== undefined ? p.ka : Math.floor(i / 16);
        if (pColor !== color) continue;

        if (p.ac === 0) {
          unopenedCount++;
        } else if (p.ac === 1 && p.Ga !== 0) { // revealed non-king piece
          revealed[p.Ga] = (revealed[p.Ga] || 0) + 1;
        }
      }

      // Initial non-king counts: 2 Xe, 2 Pháo, 2 Mã, 2 Sĩ, 2 Tượng, 5 Tốt
      const hiddenXe = Math.max(0, 2 - (revealed[3] || 0));
      const hiddenPhao = Math.max(0, 2 - (revealed[4] || 0));
      const hiddenMa = Math.max(0, 2 - (revealed[5] || 0));
      const hiddenPhe = Math.max(0, 4 - ((revealed[1] || 0) + (revealed[2] || 0))); // Sĩ + Tượng
      const hiddenTot = Math.max(0, 5 - (revealed[6] || 0));

      const probXe = unopenedCount > 0 ? ((hiddenXe / unopenedCount) * 100).toFixed(0) : 0;
      const probPhao = unopenedCount > 0 ? ((hiddenPhao / unopenedCount) * 100).toFixed(0) : 0;
      const probMa = unopenedCount > 0 ? ((hiddenMa / unopenedCount) * 100).toFixed(0) : 0;
      const probPhe = unopenedCount > 0 ? ((hiddenPhe / unopenedCount) * 100).toFixed(0) : 0;

      return {
        unopenedCount,
        hiddenXe, hiddenPhao, hiddenMa, hiddenPhe, hiddenTot,
        probXe, probPhao, probMa, probPhe
      };
    }

    return {
      opp: getStatsForSide(oppColor),
      self: getStatsForSide(myColor)
    };
  }

  function updateCoUpUi(stats, oppName, myName) {
    const wrapper = document.getElementById('ziga-coup-wrapper');
    const content = document.getElementById('ziga-coup-content');
    if (!wrapper || !content) return;

    if (!ZigaMod.userSettings.showCoUpTracker || !stats || (stats.opp.unopenedCount === 0 && stats.self.unopenedCount === 0)) {
      wrapper.style.display = 'none';
      content.innerHTML = '';
      return;
    }

    const safeOpp = (oppName || 'Đối thủ').slice(0, 10);
    const safeSelf = (myName || 'Bạn').slice(0, 10);

    wrapper.style.display = 'flex';
    content.innerHTML = `
      <div class="ziga-coup-row">
        <div class="ziga-coup-side-head">
          <span>🔴 ${safeOpp}</span>
          <span class="ziga-coup-unopened">Còn ${stats.opp.unopenedCount} quân úp</span>
        </div>
        <div class="ziga-coup-chips">
          <span class="ziga-prob-badge xe" title="Xác suất mở Xe">Xe: ${stats.opp.hiddenXe} (${stats.opp.probXe}%)</span>
          <span class="ziga-prob-badge phao" title="Xác suất mở Pháo">Pháo: ${stats.opp.hiddenPhao} (${stats.opp.probPhao}%)</span>
          <span class="ziga-prob-badge ma" title="Xác suất mở Mã">Mã: ${stats.opp.hiddenMa} (${stats.opp.probMa}%)</span>
          <span class="ziga-prob-badge phe" title="Xác suất mở Sĩ/Tượng">Sĩ-Tượng: ${stats.opp.hiddenPhe} (${stats.opp.probPhe}%)</span>
        </div>
      </div>
      <div class="ziga-coup-row">
        <div class="ziga-coup-side-head">
          <span>⚫ ${safeSelf} (Bạn)</span>
          <span class="ziga-coup-unopened">Còn ${stats.self.unopenedCount} quân úp</span>
        </div>
        <div class="ziga-coup-chips">
          <span class="ziga-prob-badge xe" title="Xác suất mở Xe">Xe: ${stats.self.hiddenXe} (${stats.self.probXe}%)</span>
          <span class="ziga-prob-badge phao" title="Xác suất mở Pháo">Pháo: ${stats.self.hiddenPhao} (${stats.self.probPhao}%)</span>
          <span class="ziga-prob-badge ma" title="Xác suất mở Mã">Mã: ${stats.self.hiddenMa} (${stats.self.probMa}%)</span>
          <span class="ziga-prob-badge phe" title="Xác suất mở Sĩ/Tượng">Sĩ-Tượng: ${stats.self.hiddenPhe} (${stats.self.probPhe}%)</span>
        </div>
      </div>
    `;
  }

  // Export to namespace
  ZigaMod.isCoUpGame = isCoUpGame;
  ZigaMod.computeCoUpStats = computeCoUpStats;
  ZigaMod.updateCoUpUi = updateCoUpUi;

})(window.ZigaMod = window.ZigaMod || {});
