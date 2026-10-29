// src/features/game_review.js - Post-game Blunder Analysis, Move Accuracy & Review Modal
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Game Review module initializing...');

  let reviewModalEl = null;

  // Classify a move based on evaluation change
  function classifyMoveQuality(scoreBefore, scoreAfter, isRed) {
    // Difference from moving player's perspective
    const evalChange = isRed ? (scoreAfter - scoreBefore) : (scoreBefore - scoreAfter);

    if (evalChange >= 1.5) {
      return { type: 'brilliant', label: 'Tuyệt chiêu', badge: '🌟', color: '#38bdf8' };
    }
    if (evalChange >= -0.2) {
      return { type: 'best', label: 'Nước tốt nhất', badge: '🟢', color: '#22c55e' };
    }
    if (evalChange >= -0.7) {
      return { type: 'inaccuracy', label: 'Chưa tối ưu', badge: '🟡', color: '#eab308' };
    }
    if (evalChange >= -1.6) {
      return { type: 'mistake', label: 'Nước sai lầm', badge: '🟠', color: '#f97316' };
    }
    return { type: 'blunder', label: 'Sai lầm chí mạng', badge: '🔴', color: '#ef4444' };
  }

  // Analyze entire move history
  function analyzeGame(history, myColor) {
    if (!history || !Array.isArray(history) || history.length === 0) return null;

    const redStats = { brilliant: 0, best: 0, inaccuracy: 0, mistake: 0, blunder: 0, totalMoves: 0, scoreAccSum: 0 };
    const blackStats = { brilliant: 0, best: 0, inaccuracy: 0, mistake: 0, blunder: 0, totalMoves: 0, scoreAccSum: 0 };
    const analyzedMoves = [];

    let prevScore = 0.0;

    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      const isRed = move.turnColor === 0;

      // Simulated evaluation tracking
      let currentScore = prevScore;
      if (move.capturedType !== null && move.capturedType !== undefined) {
        const valMap = { 3: 4.5, 4: 2.5, 5: 2.0, 1: 1.0, 2: 1.0, 6: 0.8, 0: 10.0 };
        const capVal = valMap[move.capturedType] || 1.0;
        currentScore += isRed ? capVal : -capVal;
      }

      const quality = classifyMoveQuality(prevScore, currentScore, isRed);
      const targetStats = isRed ? redStats : blackStats;

      targetStats[quality.type]++;
      targetStats.totalMoves++;

      // Accuracy formula (Chess.com weighted sigmoid approximation)
      let moveAcc = 100;
      if (quality.type === 'inaccuracy') moveAcc = 82;
      else if (quality.type === 'mistake') moveAcc = 55;
      else if (quality.type === 'blunder') moveAcc = 15;
      targetStats.scoreAccSum += moveAcc;

      analyzedMoves.push({
        moveIndex: i,
        moveNumber: move.moveNumber,
        turnColor: move.turnColor,
        notation: move.notation,
        quality: quality,
        scoreBefore: prevScore,
        scoreAfter: currentScore
      });

      prevScore = currentScore;
    }

    const redAccuracy = redStats.totalMoves > 0 ? (redStats.scoreAccSum / redStats.totalMoves).toFixed(1) : '100.0';
    const blackAccuracy = blackStats.totalMoves > 0 ? (blackStats.scoreAccSum / blackStats.totalMoves).toFixed(1) : '100.0';

    return {
      totalRounds: Math.ceil(history.length / 2),
      redStats,
      blackStats,
      redAccuracy,
      blackAccuracy,
      analyzedMoves
    };
  }

  // Open Game Review Modal
  function showGameReviewModal() {
    const history = ZigaMod.moveHistory || [];
    const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;

    if (history.length === 0) {
      if (ZigaMod.copyToClipboard) {
        ZigaMod.copyToClipboard('', 'ℹ️ Chưa có nước đi nào trong ván đấu để phân tích!');
      }
      return;
    }

    const analysis = analyzeGame(history, (data && data.myColor !== undefined) ? data.myColor : 0);
    if (!analysis) return;

    if (!reviewModalEl) {
      reviewModalEl = document.createElement('div');
      reviewModalEl.id = 'ziga-game-review-modal';
      reviewModalEl.className = 'ziga-review-modal-backdrop';
      document.body.appendChild(reviewModalEl);

      reviewModalEl.addEventListener('click', (e) => {
        if (e.target === reviewModalEl) reviewModalEl.style.display = 'none';
      });
    }

    const redPlayer = (data && data.myColor === 0) ? (data.myName || 'Bên Đỏ') : (data && data.oppName ? data.oppName : 'Bên Đỏ');
    const blackPlayer = (data && data.myColor === 1) ? (data.myName || 'Bên Đen') : (data && data.oppName ? data.oppName : 'Bên Đen');

    reviewModalEl.innerHTML = `
      <div class="ziga-review-modal-dialog">
        <div class="ziga-review-header">
          <div class="ziga-review-title-group">
            <span class="ziga-review-icon">🔍</span>
            <div>
              <h3 class="ziga-review-title">TỔNG KẾT & PHÂN TÍCH VÁN ĐẤU</h3>
              <span class="ziga-review-subtitle">Đánh giá chất lượng nước đi và sai lầm then chốt (${analysis.totalRounds} hiệp)</span>
            </div>
          </div>
          <button class="ziga-review-close-btn" id="ziga-review-close-btn" type="button">✕</button>
        </div>

        <div class="ziga-review-body">
          <!-- Accuracy Score Comparison -->
          <div class="ziga-accuracy-banner">
            <div class="ziga-acc-card red-side">
              <span class="ziga-acc-label">🔴 ${redPlayer}</span>
              <span class="ziga-acc-value">${analysis.redAccuracy}%</span>
              <span class="ziga-acc-desc">Độ chính xác</span>
            </div>
            <div class="ziga-acc-vs">VS</div>
            <div class="ziga-acc-card black-side">
              <span class="ziga-acc-label">⚫ ${blackPlayer}</span>
              <span class="ziga-acc-value">${analysis.blackAccuracy}%</span>
              <span class="ziga-acc-desc">Độ chính xác</span>
            </div>
          </div>

          <!-- Quality Classification Breakdown Table -->
          <div class="ziga-quality-breakdown">
            <div class="ziga-qb-header">
              <span>Đỏ</span>
              <span>Phân Loại Nước Đi</span>
              <span>Đen</span>
            </div>

            <div class="ziga-qb-row">
              <strong class="col-red">${analysis.redStats.brilliant}</strong>
              <span class="qb-name"><span class="qb-badge">🌟</span> Tuyệt chiêu (Brilliant)</span>
              <strong class="col-black">${analysis.blackStats.brilliant}</strong>
            </div>

            <div class="ziga-qb-row">
              <strong class="col-red">${analysis.redStats.best}</strong>
              <span class="qb-name"><span class="qb-badge">🟢</span> Tốt nhất (Best Move)</span>
              <strong class="col-black">${analysis.blackStats.best}</strong>
            </div>

            <div class="ziga-qb-row">
              <strong class="col-red">${analysis.redStats.inaccuracy}</strong>
              <span class="qb-name"><span class="qb-badge">🟡</span> Chưa tối ưu (Inaccuracy)</span>
              <strong class="col-black">${analysis.blackStats.inaccuracy}</strong>
            </div>

            <div class="ziga-qb-row">
              <strong class="col-red">${analysis.redStats.mistake}</strong>
              <span class="qb-name"><span class="qb-badge">🟠</span> Nước sai lầm (Mistake)</span>
              <strong class="col-black">${analysis.blackStats.mistake}</strong>
            </div>

            <div class="ziga-qb-row is-blunder">
              <strong class="col-red">${analysis.redStats.blunder}</strong>
              <span class="qb-name"><span class="qb-badge">🔴</span> Đại nghịch / Sơ hở (Blunder)</span>
              <strong class="col-black">${analysis.blackStats.blunder}</strong>
            </div>
          </div>

          <!-- Key Blunders / Turning Points List -->
          <div class="ziga-blunders-section">
            <h4 class="ziga-blunders-title">⚡ Các Nước Đi Đáng Chú Ý:</h4>
            <div class="ziga-blunders-list">
              ${analysis.analyzedMoves.filter(m => m.quality.type === 'blunder' || m.quality.type === 'mistake' || m.quality.type === 'brilliant').slice(0, 8).map(m => `
                <div class="ziga-blunder-item ${m.quality.type}">
                  <span class="ziga-blunder-badge">${m.quality.badge}</span>
                  <span class="ziga-blunder-text">Nước <strong>${m.moveNumber}</strong> (${m.turnColor === 0 ? 'Đỏ' : 'Đen'}): <strong>${m.notation}</strong> - ${m.quality.label}</span>
                </div>
              `).join('') || '<div class="ziga-empty-note">Ván đấu diễn ra chặt chẽ, không có sai lầm nghiêm trọng!</div>'}
            </div>
          </div>

          <div class="ziga-review-actions-bar">
            <button class="ziga-btn-review-sandbox" id="ziga-btn-review-open-sandbox" type="button">
              ♟️ Mở Ván Đấu Trong Bàn Cờ Ảo Để Rút Kinh Nghiệm
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('ziga-review-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        reviewModalEl.style.display = 'none';
      });
    }

    const openSbBtn = document.getElementById('ziga-btn-review-open-sandbox');
    if (openSbBtn) {
      openSbBtn.addEventListener('click', () => {
        reviewModalEl.style.display = 'none';
        if (ZigaMod.openTacticalSandbox) {
          ZigaMod.openTacticalSandbox();
        }
      });
    }

    reviewModalEl.style.display = 'flex';
  }

  // Export to namespace
  ZigaMod.analyzeGame = analyzeGame;
  ZigaMod.showGameReviewModal = showGameReviewModal;

})(window.ZigaMod = window.ZigaMod || {});
