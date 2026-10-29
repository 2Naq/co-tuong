// src/ui.js - HUD DOM creation, dragging, resizing, tactical target cards, and settings visibility
(function (ZigaMod) {
  'use strict';

  let widgetEl = null;
  let isMinimized = false;
  let savedExpandedWidth = '';
  let savedExpandedHeight = '';

  function toggleMinimize(forceState) {
    const nextState = forceState !== undefined ? !!forceState : !isMinimized;
    if (nextState === isMinimized && forceState !== undefined) return;
    isMinimized = nextState;

    if (!widgetEl) return;
    const minBtn = document.getElementById('ziga-mod-btn-min');

    if (isMinimized) {
      // Save current expanded dimensions before minimizing
      savedExpandedWidth = widgetEl.style.width;
      savedExpandedHeight = widgetEl.style.height;

      // Close settings modal if open
      if (ZigaMod.closeSettingsModal) {
        ZigaMod.closeSettingsModal();
      }

      // Close material tooltip if open
      const matTooltip = document.getElementById('ziga-material-tooltip');
      if (matTooltip) matTooltip.style.display = 'none';

      widgetEl.classList.add('minimized');
      widgetEl.setAttribute('title', 'Bấm để mở rộng bảng công cụ | Kéo để di chuyển');
      if (minBtn) {
        minBtn.textContent = '⤢';
        minBtn.title = 'Mở rộng bảng công cụ';
      }

      // Clear inline width & height so docking bubble CSS takes full control
      widgetEl.style.width = '';
      widgetEl.style.height = '';
    } else {
      widgetEl.classList.remove('minimized');
      widgetEl.removeAttribute('title');
      if (minBtn) {
        minBtn.textContent = '_';
        minBtn.title = 'Thu nhỏ thành bong bóng';
      }

      // Restore saved dimensions
      if (savedExpandedWidth) {
        widgetEl.style.width = savedExpandedWidth;
      } else {
        const savedSize = ZigaMod.loadSavedSize ? ZigaMod.loadSavedSize() : null;
        widgetEl.style.width = (savedSize && savedSize.w ? savedSize.w : 320) + 'px';
      }

      if (savedExpandedHeight) {
        widgetEl.style.height = savedExpandedHeight;
        const body = document.getElementById('ziga-mod-body');
        if (body) {
          const headerH = document.getElementById('ziga-mod-drag-handle')?.offsetHeight || 42;
          const hVal = parseInt(savedExpandedHeight, 10);
          if (!isNaN(hVal)) {
            body.style.maxHeight = Math.max(120, hVal - headerH) + 'px';
            body.style.height = Math.max(120, hVal - headerH) + 'px';
          }
        }
      }

      // Ensure widget doesn't clip outside viewport after expanding
      const rect = widgetEl.getBoundingClientRect();
      const curW = widgetEl.offsetWidth || 320;
      const curH = widgetEl.offsetHeight || 420;
      let adjLeft = rect.left;
      let adjTop = rect.top;

      if (adjLeft + curW > window.innerWidth - 10) {
        adjLeft = Math.max(10, window.innerWidth - curW - 10);
      }
      if (adjTop + curH > window.innerHeight - 10) {
        adjTop = Math.max(10, window.innerHeight - curH - 10);
      }

      widgetEl.style.left = adjLeft + 'px';
      widgetEl.style.top = adjTop + 'px';
      if (ZigaMod.savePosition) {
        ZigaMod.savePosition(adjLeft, adjTop);
      }
    }
  }

  function createOverlay() {
    if (!document.body) {
      return null;
    }

    if (document.getElementById('ziga-mod-widget')) {
      widgetEl = document.getElementById('ziga-mod-widget');
      return widgetEl;
    }

    widgetEl = document.createElement('div');
    widgetEl.id = 'ziga-mod-widget';
    widgetEl.className = 'ziga-mod-container';
    widgetEl.style.zIndex = '2147483647';

    const savedSize = ZigaMod.loadSavedSize();
    if (savedSize && savedSize.w) {
      widgetEl.style.width = Math.max(270, Math.min(window.innerWidth - 20, savedSize.w)) + 'px';
    } else {
      widgetEl.style.width = '320px';
    }
    if (savedSize && savedSize.h) {
      widgetEl.style.height = Math.max(220, Math.min(window.innerHeight - 20, savedSize.h)) + 'px';
    }

    const savedPos = ZigaMod.loadSavedPosition();
    if (savedPos && savedPos.x !== undefined && savedPos.y !== undefined) {
      widgetEl.style.left = savedPos.x + 'px';
      widgetEl.style.top = savedPos.y + 'px';
    } else {
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        widgetEl.style.left = Math.max(10, rect.right + 15) + 'px';
        widgetEl.style.top = Math.max(10, rect.top) + 'px';
      } else {
        widgetEl.style.right = '20px';
        widgetEl.style.top = '100px';
      }
    }

    const userSettings = ZigaMod.userSettings;

    widgetEl.innerHTML = `
      <div class="ziga-mod-header" id="ziga-mod-drag-handle">
        <div class="ziga-mod-title">
          <span class="ziga-mod-badge-icon">
            <img src="${(document.documentElement && document.documentElement.dataset && document.documentElement.dataset.zigaLogoUrl) || ''}" class="ziga-mod-badge-img" alt="Logo" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline-block';" />
            <svg viewBox="0 0 512 512" width="20" height="20" style="display:none; border-radius: 4px; vertical-align: middle; box-shadow: 0 0 6px rgba(212, 175, 55, 0.4); border: 1px solid rgba(212, 175, 55, 0.5);">
              <rect width="512" height="512" rx="64" fill="#000000"></rect>
              <path d="M118.141 347H76.9482L139.714 165.182H189.253L251.93 347H210.737L165.194 206.73H163.773L118.141 347ZM115.567 275.533H212.868V305.54H115.567V275.533ZM425.892 165.182V347H392.689L313.587 232.565H312.255V347H273.814V165.182H307.55L386.03 279.528H387.628V165.182H425.892Z" fill="#ffffff"></path>
            </svg>
          </span>
          <span class="ziga-mod-title-text">TOOLS SUPPORT</span>
        </div>
        <div class="ziga-mod-actions">
          <button class="ziga-mod-btn-icon" title="Truy cập tài liệu về Industrial Automation (PLC, Investor, Robot công nghiệp ...) tại [Automation Note]">
           <a  href="https://2naq.github.io/shareme/about" target="_blank" style="cursor: pointer;  text-decoration: none !important">
           🔗
          </a>
          </button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-sandbox" title="Mô phỏng nước đi (Sandbox)">♟️</button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-mentor" title="Gia Sư Đồng Hành (AI Mentor)">🎓</button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-settings" title="Cài đặt tính năng & Aura">⚙</button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-min" title="Thu gọn / Mở rộng">_</button>
        </div>
      </div>

      <div class="ziga-mod-content" id="ziga-mod-body">
        <div class="ziga-mod-match-status" id="ziga-mod-match-info">
          <span class="ziga-mod-dot waiting"></span>
          <span id="ziga-status-text">Đang kết nối game...</span>
        </div>

        <!-- Opening Book Badge (Click to open strategy modal) -->
        <div class="ziga-opening-badge" id="ziga-opening-badge" title="Bách khoa toàn thư 60+ thế trận khai cuộc cờ tướng">
          <span class="ziga-op-icon">📖</span>
          <span class="ziga-op-name" id="ziga-opening-name">Bách Khoa Khai Cuộc</span>
          <span class="ziga-op-cat" id="ziga-opening-cat">[60+ Trận]</span>
          <span class="ziga-op-arrow">➔</span>
        </div>

        <!-- Tactical Sandbox Launcher Button -->
        <button class="ziga-sandbox-launcher-btn" id="ziga-btn-sandbox-launcher" title="Mở bàn cờ mô phỏng để tự do đi thử 2 bên Đỏ & Đen thử chiến thuật">
          <div class="ziga-sb-launcher-left">
            <span class="ziga-sb-launcher-icon">♟️</span>
            <span class="ziga-sb-launcher-title">MÔ PHỎNG NƯỚC ĐI</span>
          </div>
          <span class="ziga-sb-launcher-badge">THỬ CHIẾN THUẬT</span>
        </button>

        <!-- Threat Warning Alert Box -->
        <div class="ziga-threat-box" id="ziga-threat-wrapper" style="display:none;">
          <div class="ziga-threat-header">
            <div class="ziga-threat-title-group">
              <span class="ziga-threat-icon__">⚠️</span>
              <span class="ziga-threat-title" id="ziga-threat-title">CẢNH BÁO NÍ SẮP BỊ LỤM</span>
            </div>
            <span class="ziga-threat-count-pill" id="ziga-threat-count" style="display:none;"></span>
          </div>
          <div class="ziga-threat-list" id="ziga-threat-items"></div>
        </div>

        <!-- Material Advantage Indicator -->
        <div class="ziga-material-bar-wrapper" id="ziga-material-wrapper" style="display:none;">
          <div class="ziga-material-left">
            <span class="ziga-material-label">Chênh lệch quân</span>
            <span class="ziga-material-colon">:</span>
            <span class="ziga-help-btn" id="ziga-material-help-btn" title="Bấm hoặc rê chuột để xem quy tắc tính điểm">?</span>
          </div>
          <div class="ziga-material-val" id="ziga-material-score">Bằng điểm</div>

          <!-- Material Tooltip Popover -->
          <div class="ziga-material-tooltip" id="ziga-material-tooltip" style="display:none;">
            <div class="ziga-mat-tt-header">
              <span class="ziga-mat-tt-title">⚖️ TÍNH ĐIỂM CHÊNH LỆCH</span>
              <span class="ziga-mat-tt-close" id="ziga-mat-tt-close" title="Đóng">✕</span>
            </div>

            <!-- Live breakdown section -->
            <div class="ziga-mat-tt-live-section">
              <div class="ziga-mat-tt-live-title">CHI TIẾT VÁN ĐẤU HIỆN TẠI</div>
              <div class="ziga-mat-tt-live-calc" id="ziga-mat-tt-live-calc">
                <div style="text-align: center; color: #94a3b8; font-style: italic;">Chờ vào ván cờ (Mỗi bên xuất phát với 50.5đ)</div>
              </div>
              <div class="ziga-mat-tt-table-wrap">
                <table class="ziga-mat-tt-table">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Quân cờ</th>
                      <th>Bạn</th>
                      <th>Địch</th>
                      <th style="text-align: right;">± Điểm</th>
                    </tr>
                  </thead>
                  <tbody id="ziga-mat-tt-tbody">
                    <tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 6px; font-style: italic;">Chưa bắt đầu ván đấu</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Reference points section -->
            <div class="ziga-mat-tt-ref-section">
              <div class="ziga-mat-tt-ref-title">HỆ SỐ ĐIỂM QUY CHUẨN</div>
              <div class="ziga-mat-tt-grid">
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Xe (俥/車)</span><span class="ziga-mat-tt-pts">+9.0đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Pháo (炮/砲)</span><span class="ziga-mat-tt-pts">+4.5đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Mã (傌/馬)</span><span class="ziga-mat-tt-pts">+4.0đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Sĩ (仕/士)</span><span class="ziga-mat-tt-pts">+2.0đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Tượng (相/象)</span><span class="ziga-mat-tt-pts">+2.0đ</span></div>
                <div class="ziga-mat-tt-item"><span class="ziga-mat-tt-name">Tốt (兵/卒)</span><span class="ziga-mat-tt-pts">+1.5đ</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Co Up Hidden Pieces Probability Box (Cờ Úp Only) -->
        <div class="ziga-coup-box" id="ziga-coup-wrapper" style="display:none;">
          <div class="ziga-coup-header">
            <span class="ziga-coup-icon">🎲</span>
            <span class="ziga-coup-title">XÁC SUẤT QUÂN CỜ ÚP</span>
          </div>
          <div class="ziga-coup-content" id="ziga-coup-content"></div>
        </div>

        <!-- Section 1: Opponent Captured Pieces (quân đối thủ đã mất) -->
        <div class="ziga-player-section opponent-section" id="ziga-opp-lost-section">
          <div class="ziga-section-header">
            <span class="ziga-player-label" id="ziga-opp-label">🔴 ĐỐI THỦ ĐÃ MẤT</span>
            <span class="ziga-count-tag" id="ziga-opp-dead-count">0/16</span>
          </div>
          <div class="ziga-pieces-grid" id="ziga-opp-pieces">
            <div class="ziga-empty-note">Chưa mất quân nào</div>
          </div>
        </div>

        <div class="ziga-divider" id="ziga-lost-divider"></div>

        <!-- Section 2: Player Lost Pieces (quân mình đã mất) -->
        <div class="ziga-player-section self-section" id="ziga-self-lost-section">
          <div class="ziga-section-header">
            <span class="ziga-player-label" id="ziga-self-label">⚫ BẠN ĐÃ MẤT</span>
            <span class="ziga-count-tag" id="ziga-self-dead-count">0/16</span>
          </div>
          <div class="ziga-pieces-grid" id="ziga-self-pieces">
            <div class="ziga-empty-note">Chưa mất quân nào</div>
          </div>
        </div>

        <!-- Section 3: Tactical Target Inspector -->
        <div class="ziga-divider" id="ziga-tactical-divider"></div>
        <div class="ziga-tactical-section" id="ziga-tactical-box">
          <div class="ziga-tactical-header">
            <span class="ziga-tactical-title">🎯 TẦM đánh</span>
            <button class="ziga-btn-clear-select" id="ziga-btn-clear-highlight" title="Xóa highlight">✕ Bỏ chọn</button>
          </div>
          <div class="ziga-selected-display" id="ziga-selected-piece-info">
            <span class="ziga-empty-note">Bấm vào bất kỳ quân nào trên bàn cờ (của mình hoặc đối thủ) để xem quân đó ăn được quân nào!</span>
          </div>
          <div class="ziga-targets-container" id="ziga-targets-list" style="display:none;"></div>
        </div>

        <!-- Section 4: Remaining Key Pieces Tracker -->
        <div class="ziga-divider" id="ziga-summary-divider"></div>
        <div class="ziga-summary-section" id="ziga-summary-box">
          <div class="ziga-summary-title">LỰC LƯỢNG CHÍNH CÒN LẠI (Xe - Pháo - Mã)</div>
          <div class="ziga-summary-stats" id="ziga-remaining-stats">
            <div class="ziga-stat-col">
              <span class="ziga-stat-head" id="ziga-stat-opp-name">Đối thủ</span>
              <span class="ziga-stat-val" id="ziga-stat-opp-val">-</span>
            </div>
            <div class="ziga-stat-vs">VS</div>
            <div class="ziga-stat-col">
              <span class="ziga-stat-head" id="ziga-stat-self-name">Bạn</span>
              <span class="ziga-stat-val" id="ziga-stat-self-val">-</span>
            </div>
          </div>
        </div>

        <!-- Section 5: Move History & FEN/PGN Exporter -->
        <div class="ziga-divider" id="ziga-history-divider"></div>
        <div class="ziga-history-section" id="ziga-history-box">
          <div class="ziga-history-header">
            <div class="ziga-history-title-wrap">
              <span class="ziga-history-icon">📜</span>
              <span class="ziga-history-title">BIÊN BẢN TRẬN ĐẤU</span>
              <span class="ziga-history-count-badge" id="ziga-move-count-badge">0 nước</span>
            </div>
            <div class="ziga-history-tools">
              <button class="ziga-btn-tool-sub" id="ziga-btn-copy-fen" type="button" title="Sao chép chuỗi FEN thế cờ hiện tại">📋 FEN</button>
              <button class="ziga-btn-tool-sub" id="ziga-btn-copy-pgn" type="button" title="Sao chép toàn bộ biên bản ván đấu PGN">📜 PGN</button>
              <button class="ziga-btn-tool-sub ziga-btn-tool-review" id="ziga-btn-open-review" type="button" title="Chấm điểm và phân tích sai lầm ván đấu">🔍 Đánh Giá</button>
              <button class="ziga-btn-tool-sub ziga-btn-tool-reset" id="ziga-btn-reset-history" type="button" title="Đặt lại biên bản ván đấu">🔄</button>
            </div>
          </div>
          <div class="ziga-move-history-table-header">
            <span class="ziga-col-header-num">#</span>
            <span class="ziga-col-header-player red">Đỏ 🔴</span>
            <span class="ziga-col-header-player black">Đen ⚫</span>
          </div>
          <div class="ziga-move-history-scroll" id="ziga-move-history-list">
            <div class="ziga-empty-moves">Đang theo dõi... Các nước đi sẽ tự động xuất hiện tại đây.</div>
          </div>
        </div>
      </div>

      <!-- Resize Grips -->
      <div class="ziga-mod-resize-edge-r" id="ziga-mod-resize-edge-r" title="Kéo mép để chỉnh chiều rộng"></div>
      <div class="ziga-mod-resize-edge-b" id="ziga-mod-resize-edge-b" title="Kéo mép để chỉnh chiều cao"></div>
      <div class="ziga-mod-resize-handle" id="ziga-mod-resize-handle" title="Kéo góc để phóng to / thu nhỏ (Click đúp để về mặc định)"></div>
    `;

    if (document.body) {
      document.body.appendChild(widgetEl);
    }

    if (savedSize && savedSize.h) {
      const body = document.getElementById('ziga-mod-body');
      if (body) {
        const headerH = document.getElementById('ziga-mod-drag-handle')?.offsetHeight || 42;
        body.style.maxHeight = Math.max(120, savedSize.h - headerH) + 'px';
        body.style.height = Math.max(120, savedSize.h - headerH) + 'px';
      }
    }

    // Draggable
    setupDraggable(widgetEl, document.getElementById('ziga-mod-drag-handle'));

    // Resizable
    setupResizable(
      widgetEl,
      document.getElementById('ziga-mod-resize-handle'),
      document.getElementById('ziga-mod-resize-edge-r'),
      document.getElementById('ziga-mod-resize-edge-b')
    );

    // Minimize toggle
    const minBtn = document.getElementById('ziga-mod-btn-min');
    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMinimize();
      });
    }

    // Sandbox simulation launcher
    const launchSbBtn = document.getElementById('ziga-btn-sandbox-launcher');
    if (launchSbBtn) {
      launchSbBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[AN Mod] Sandbox launcher button clicked');
        if (ZigaMod.openTacticalSandbox) {
          ZigaMod.openTacticalSandbox();
        } else {
          console.warn('[AN Mod] ZigaMod.openTacticalSandbox is not ready');
        }
      });
    }

    const sbHeaderBtn = document.getElementById('ziga-mod-btn-sandbox');
    if (sbHeaderBtn) {
      sbHeaderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[AN Mod] Sandbox header icon clicked');
        if (ZigaMod.openTacticalSandbox) {
          ZigaMod.openTacticalSandbox();
        } else {
          console.warn('[AN Mod] ZigaMod.openTacticalSandbox is not ready');
        }
      });
    }

    const mentorHeaderBtn = document.getElementById('ziga-mod-btn-mentor');
    if (mentorHeaderBtn) {
      mentorHeaderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (ZigaMod.toggleMentorFloatingPanel) {
          ZigaMod.toggleMentorFloatingPanel();
        }
      });
    }

    // Settings button launches the clean Settings Modal
    const settingsBtn = document.getElementById('ziga-mod-btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ZigaMod.openSettingsModal) {
          ZigaMod.openSettingsModal('features');
        }
      });
    }

    // Clear highlight button
    const clearBtn = document.getElementById('ziga-btn-clear-highlight');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gameLayer = ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null;
        if (gameLayer && typeof gameLayer.pA === 'function') {
          gameLayer.pA();
        }
        if (gameLayer && gameLayer.ij) {
          gameLayer.ij.setPosition(-100, -100);
        }
        clearTacticalHud();
      });
    }

    // Material Advantage Help Tooltip (Hover & Click toggle)
    const matHelpBtn = document.getElementById('ziga-material-help-btn');
    const matTooltip = document.getElementById('ziga-material-tooltip');
    const matCloseBtn = document.getElementById('ziga-mat-tt-close');
    let isMatPinned = false;
    let matTimer = null;

    function showMatTip() {
      clearTimeout(matTimer);
      if (matTooltip) matTooltip.style.display = 'block';
    }

    function hideMatTip(force) {
      clearTimeout(matTimer);
      if (force) isMatPinned = false;
      if (!isMatPinned) {
        matTimer = setTimeout(() => {
          if (!isMatPinned && matTooltip) matTooltip.style.display = 'none';
        }, 180);
      }
    }

    if (matHelpBtn && matTooltip) {
      matHelpBtn.addEventListener('mouseenter', showMatTip);
      matHelpBtn.addEventListener('mouseleave', () => hideMatTip(false));

      matTooltip.addEventListener('mouseenter', showMatTip);
      matTooltip.addEventListener('mouseleave', () => hideMatTip(false));

      matHelpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMatPinned = !isMatPinned;
        if (isMatPinned) showMatTip();
        else hideMatTip(true);
      });

      if (matCloseBtn) {
        matCloseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          hideMatTip(true);
        });
      }

      document.addEventListener('click', (e) => {
        if (matTooltip.style.display !== 'none' && !matTooltip.contains(e.target) && e.target !== matHelpBtn) {
          hideMatTip(true);
        }
      });
    }

    // Move History & FEN/PGN Exporter buttons
    const copyFenBtn = document.getElementById('ziga-btn-copy-fen');
    if (copyFenBtn) {
      copyFenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;
        if (!data || !data.gameLayer) {
          if (ZigaMod.copyToClipboard) {
            ZigaMod.copyToClipboard('', '⚠️ Hãy vào một ván cờ trước khi sao chép FEN!');
          }
          return;
        }
        const activeColor = (data.gameLayer.Yc !== undefined) ? data.gameLayer.Yc : 0;
        const fen = ZigaMod.generateFen ? ZigaMod.generateFen(data.gameLayer, activeColor) : '';
        if (fen && ZigaMod.copyToClipboard) {
          ZigaMod.copyToClipboard(fen, '✅ Đã sao chép chuỗi FEN thế cờ hiện tại!');
        }
      });
    }

    const copyPgnBtn = document.getElementById('ziga-btn-copy-pgn');
    if (copyPgnBtn) {
      copyPgnBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;
        const pgn = ZigaMod.generatePgn ? ZigaMod.generatePgn(data) : '';
        if (ZigaMod.copyToClipboard) {
          ZigaMod.copyToClipboard(pgn, '✅ Đã sao chép toàn bộ biên bản ván đấu PGN!');
        }
      });
    }

    const resetHistBtn = document.getElementById('ziga-btn-reset-history');
    if (resetHistBtn) {
      resetHistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ZigaMod.resetHistory) {
          ZigaMod.resetHistory();
        }
      });
    }

    // Opening Book Badge modal trigger
    const openingBadge = document.getElementById('ziga-opening-badge');
    if (openingBadge) {
      openingBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ZigaMod.showOpeningModal) {
          ZigaMod.showOpeningModal();
        }
      });
    }

    // Game Review Modal button trigger
    const openReviewBtn = document.getElementById('ziga-btn-open-review');
    if (openReviewBtn) {
      openReviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ZigaMod.showGameReviewModal) {
          ZigaMod.showGameReviewModal();
        }
      });
    }

    applySettingsVisibility();
    return widgetEl;
  }

  function applySettingsVisibility() {
    const userSettings = ZigaMod.userSettings;
    const lostOpp = document.getElementById('ziga-opp-lost-section');
    const lostSelf = document.getElementById('ziga-self-lost-section');
    const lostDiv = document.getElementById('ziga-lost-divider');
    const matWrapper = document.getElementById('ziga-material-wrapper');
    const tacticalBox = document.getElementById('ziga-tactical-box');
    const tacticalDiv = document.getElementById('ziga-tactical-divider');
    const summaryBox = document.getElementById('ziga-summary-box');
    const summaryDiv = document.getElementById('ziga-summary-divider');
    const historyBox = document.getElementById('ziga-history-box');
    const historyDiv = document.getElementById('ziga-history-divider');
    const openingBadge = document.getElementById('ziga-opening-badge');
    const evalBar = document.getElementById('ziga-eval-bar-wrapper');

    if (lostOpp) lostOpp.style.display = userSettings.showLostPieces ? 'flex' : 'none';
    if (lostSelf) lostSelf.style.display = userSettings.showLostPieces ? 'flex' : 'none';
    if (lostDiv) lostDiv.style.display = userSettings.showLostPieces ? 'block' : 'none';

    if (matWrapper && !userSettings.materialAdvantage) matWrapper.style.display = 'none';

    if (tacticalBox) tacticalBox.style.display = userSettings.showTacticalHud ? 'flex' : 'none';
    if (tacticalDiv) tacticalDiv.style.display = userSettings.showTacticalHud ? 'block' : 'none';

    if (summaryBox) summaryBox.style.display = userSettings.showKeyPieces ? 'flex' : 'none';
    if (summaryDiv) summaryDiv.style.display = userSettings.showKeyPieces ? 'block' : 'none';

    if (historyBox) historyBox.style.display = userSettings.showMoveHistory ? 'flex' : 'none';
    if (openingBadge) {
      openingBadge.style.display = (userSettings.openingBook !== false) ? 'flex' : 'none';
    }
    if (evalBar && !userSettings.evalBar) evalBar.style.display = 'none';

    if (userSettings.cleanAdView) {
      document.body.classList.add('ziga-clean-ads-active');
    } else {
      document.body.classList.remove('ziga-clean-ads-active');
    }

    if (ZigaMod.updateRowLabelsVisibility) {
      const gameLayer = ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null;
      ZigaMod.updateRowLabelsVisibility(gameLayer);
    }

    if (!userSettings.liveBoardAura && ZigaMod.clearBoardAura) {
      ZigaMod.clearBoardAura();
    }
  }

  function setupDraggable(container, handle) {
    let isDragging = false;
    let hasMoved = false;
    let startX, startY, initX, initY;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      isDragging = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = container.getBoundingClientRect();
      initX = rect.left;
      initY = rect.top;
      handle.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
      }
      const newX = Math.max(10, Math.min(window.innerWidth - container.offsetWidth - 10, initX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - container.offsetHeight - 10, initY + dy));
      container.style.left = newX + 'px';
      container.style.top = newY + 'px';
      container.style.right = 'auto';
      e.preventDefault();
    }, { capture: true });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        handle.style.cursor = 'grab';
        if (hasMoved) {
          const rect = container.getBoundingClientRect();
          if (ZigaMod.savePosition) {
            ZigaMod.savePosition(rect.left, rect.top);
          }
        } else if (isMinimized) {
          // Clicked bubble without dragging -> expand back
          toggleMinimize(false);
        }
      }
    }, { capture: true });
  }

  function setupResizable(container, cornerHandle, rightHandle, bottomHandle) {
    let isResizing = false;
    let resizeType = '';
    let startX, startY, initW, initH;

    function startResize(e, type) {
      if (isMinimized) return;
      isResizing = true;
      resizeType = type;
      startX = e.clientX;
      startY = e.clientY;
      initW = container.offsetWidth;
      initH = container.offsetHeight;
      document.body.style.userSelect = 'none';
      e.preventDefault();
      e.stopPropagation();
    }

    if (cornerHandle) {
      cornerHandle.addEventListener('mousedown', (e) => startResize(e, 'both'));
      cornerHandle.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        container.style.width = '320px';
        container.style.height = 'auto';
        const body = document.getElementById('ziga-mod-body');
        if (body) {
          body.style.maxHeight = '560px';
          body.style.height = 'auto';
        }
        ZigaMod.saveSize(320, null);
      });
    }

    if (rightHandle) {
      rightHandle.addEventListener('mousedown', (e) => startResize(e, 'width'));
    }

    if (bottomHandle) {
      bottomHandle.addEventListener('mousedown', (e) => startResize(e, 'height'));
    }

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newW = initW;
      let newH = initH;

      if (resizeType === 'both' || resizeType === 'width') {
        newW = Math.max(270, Math.min(window.innerWidth - container.offsetLeft - 10, initW + dx));
        container.style.width = newW + 'px';
      }

      if (resizeType === 'both' || resizeType === 'height') {
        newH = Math.max(220, Math.min(window.innerHeight - container.offsetTop - 10, initH + dy));
        container.style.height = newH + 'px';
        const body = document.getElementById('ziga-mod-body');
        if (body) {
          const headerEl = document.getElementById('ziga-mod-drag-handle');
          const headerH = headerEl ? headerEl.offsetHeight : 42;
          body.style.maxHeight = Math.max(120, newH - headerH) + 'px';
          body.style.height = Math.max(120, newH - headerH) + 'px';
        }
      }
      e.preventDefault();
    }, { capture: true });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = '';
        ZigaMod.saveSize(container.offsetWidth, container.offsetHeight);
      }
    }, { capture: true });
  }

  function clearTacticalHud() {
    const selectedDisplay = document.getElementById('ziga-selected-piece-info');
    const targetsList = document.getElementById('ziga-targets-list');
    if (selectedDisplay) {
      selectedDisplay.innerHTML = `<span class="ziga-empty-note">Bấm vào bất kỳ quân nào trên bàn cờ (của mình hoặc đối thủ) để xem quân đó ăn được quân nào!</span>`;
    }
    if (targetsList) {
      targetsList.style.display = 'none';
      targetsList.innerHTML = '';
    }
  }

  function updateTacticalHud(attacker, capturableList) {
    const selectedDisplay = document.getElementById('ziga-selected-piece-info');
    const targetsList = document.getElementById('ziga-targets-list');
    if (!selectedDisplay || !targetsList) return;

    const attackerColor = attacker.ka !== undefined ? attacker.ka : 0;
    const attackerType = attacker.Ga !== undefined ? attacker.Ga : 6;
    const def = ZigaMod.PIECE_DEFS[attackerType] || { name: 'Quân', redChar: '?', blackChar: '?' };
    const char = ZigaMod.getPieceChar(attackerType, attackerColor);
    const colorLabel = attackerColor === 0 ? '🔴 Phe Đỏ' : '⚫ Phe Đen';
    const colorClass = attackerColor === 0 ? 'red-piece' : 'black-piece';

    const attackerCoord = ZigaMod.formatXiangqiCoord
      ? ZigaMod.formatXiangqiCoord(attacker.fa, attacker.rowIndex, attackerColor)
      : { col: (attackerColor === 0 ? 9 - attacker.fa : attacker.fa + 1), row: (attackerColor === 0 ? attacker.rowIndex + 1 : 10 - attacker.rowIndex) };

    selectedDisplay.innerHTML = `
      <div class="ziga-inspect-card">
        <div class="ziga-piece-chip ${colorClass} inspect-active">
          <div class="ziga-piece-token">
            <span class="ziga-token-char">${char}</span>
          </div>
          <div class="ziga-piece-info">
            <span class="ziga-piece-name">${colorLabel} - ${def.name}</span>
            <span class="ziga-pos-badge">(Cột ${attackerCoord.col}, Hàng ${attackerCoord.row})</span>
          </div>
        </div>
      </div>
    `;

    targetsList.style.display = 'flex';

    if (!capturableList || capturableList.length === 0) {
      targetsList.innerHTML = `
        <div class="ziga-tactical-empty">
          <span>⚔️ Hiện tại <strong>không có quân đối phương nào</strong> nằm trong tầm đánh.</span>
        </div>
      `;
    } else {
      let targetsHtml = `
        <div class="ziga-target-subhead">
          <span>⚔️ CÓ THỂ ĂN (${capturableList.length} quân):</span>
        </div>
        <div class="ziga-target-items">
      `;

      capturableList.forEach(item => {
        const targetColorClass = item.color === 0 ? 'red-piece' : 'black-piece';
        const targetCoord = ZigaMod.formatXiangqiCoord
          ? ZigaMod.formatXiangqiCoord(item.col, item.row, item.color)
          : { col: (item.color === 0 ? 9 - item.col : item.col + 1), row: (item.color === 0 ? item.row + 1 : 10 - item.row) };

        targetsHtml += `
          <div class="ziga-target-item ${targetColorClass}">
            <span class="ziga-target-token">${item.char}</span>
            <span class="ziga-target-name">${item.name}</span>
            <span class="ziga-target-pos">(C${targetCoord.col}, H${targetCoord.row})</span>
            <span class="ziga-target-val">+${item.value}đ</span>
          </div>
        `;
      });

      targetsHtml += `</div>`;
      targetsList.innerHTML = targetsHtml;
    }
  }

  function renderPieceList(deadPieces, color) {
    if (!deadPieces || deadPieces.length === 0) {
      return '<div class="ziga-empty-note">Chưa bị ăn quân nào</div>';
    }

    const counts = {};
    ZigaMod.DISPLAY_ORDER.forEach(type => { counts[type] = 0; });
    deadPieces.forEach(p => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });

    let html = '';
    ZigaMod.DISPLAY_ORDER.forEach(type => {
      const count = counts[type];
      if (count > 0) {
        const def = ZigaMod.PIECE_DEFS[type] || { name: '?', total: 1 };
        const char = ZigaMod.getPieceChar(type, color);
        const colorClass = color === 0 ? 'red-piece' : 'black-piece';

        html += `
          <div class="ziga-piece-chip ${colorClass}" title="${def.name} (${count}/${def.total} đã bị ăn)">
            <div class="ziga-piece-token">
              <span class="ziga-token-char">${char}</span>
            </div>
            <div class="ziga-piece-info">
              <span class="ziga-piece-name">${def.name}</span>
              <span class="ziga-piece-count">×${count}</span>
            </div>
          </div>
        `;
      }
    });

    return html;
  }

  const PIECE_TYPES_ORDER = [3, 4, 5, 1, 2, 6]; // Xe, Pháo, Mã, Sĩ, Tượng, Tốt

  function updateMaterialTooltipLive(mat, myName, oppName) {
    const calcEl = document.getElementById('ziga-mat-tt-live-calc');
    const tbody = document.getElementById('ziga-mat-tt-tbody');
    if (!calcEl || !tbody) return;

    if (!mat) {
      calcEl.innerHTML = `<div style="text-align: center; color: #94a3b8; font-style: italic;">Chờ vào ván cờ (Mỗi bên xuất phát với 50.5đ)</div>`;
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 6px; font-style: italic;">Chưa bắt đầu ván đấu</td></tr>`;
      return;
    }

    const myNameShort = myName ? myName.slice(0, 10) : 'Bạn';
    const oppNameShort = oppName ? oppName.slice(0, 10) : 'Địch';

    let diffClass = 'neutral';
    let diffText = '0đ (Cân bằng)';
    if (mat.diff > 0) {
      diffClass = 'green';
      diffText = `+${mat.diff}đ (Bạn ưu thế)`;
    } else if (mat.diff < 0) {
      diffClass = 'red';
      diffText = `${mat.diff}đ (Đối thủ ưu thế)`;
    }

    calcEl.innerHTML = `
      <div class="ziga-mat-tt-score-row">
        <span class="ziga-mat-tt-player-sc my">[${myNameShort}]: <strong>${mat.myScore}đ</strong></span>
        <span class="ziga-mat-tt-vs">vs</span>
        <span class="ziga-mat-tt-player-sc opp">[${oppNameShort}]: <strong>${mat.oppScore}đ</strong></span>
      </div>
      <div class="ziga-mat-tt-diff-row">
        <span>Phép tính: <strong>${mat.myScore}</strong> − <strong>${mat.oppScore}</strong> = </span>
        <strong class="${diffClass}">${diffText}</strong>
      </div>
    `;

    let rowsHtml = '';
    PIECE_TYPES_ORDER.forEach(type => {
      const def = ZigaMod.PIECE_DEFS[type];
      if (!def) return;
      const myC = (mat.myCounts && mat.myCounts[type]) || 0;
      const oppC = (mat.oppCounts && mat.oppCounts[type]) || 0;
      const pointDiff = (myC - oppC) * def.value;

      let diffTag = '<span style="color:#94a3b8;">=</span>';
      if (pointDiff > 0) {
        diffTag = `<span class="green">+${pointDiff}đ</span>`;
      } else if (pointDiff < 0) {
        diffTag = `<span class="red">${pointDiff}đ</span>`;
      }

      rowsHtml += `
        <tr>
          <td class="ziga-mat-col-name">${def.name} <small style="color:#94a3b8;">(${def.value}đ)</small></td>
          <td class="ziga-mat-col-num ${myC > oppC ? 'bold-green' : ''}">${myC}</td>
          <td class="ziga-mat-col-num ${oppC > myC ? 'bold-red' : ''}">${oppC}</td>
          <td class="ziga-mat-col-diff">${diffTag}</td>
        </tr>
      `;
    });

    rowsHtml += `
      <tr class="ziga-mat-row-total">
        <td><strong>Tổng điểm</strong></td>
        <td><strong>${mat.myScore}đ</strong></td>
        <td><strong>${mat.oppScore}đ</strong></td>
        <td><strong class="${diffClass}">${mat.diff > 0 ? '+' + mat.diff : mat.diff}đ</strong></td>
      </tr>
    `;

    tbody.innerHTML = rowsHtml;
  }

  // Export to namespace
  ZigaMod.createOverlay = createOverlay;
  ZigaMod.toggleMinimize = toggleMinimize;
  ZigaMod.updateMaterialTooltipLive = updateMaterialTooltipLive;
  ZigaMod.applySettingsVisibility = applySettingsVisibility;
  ZigaMod.setupDraggable = setupDraggable;
  ZigaMod.setupResizable = setupResizable;
  ZigaMod.clearTacticalHud = clearTacticalHud;
  ZigaMod.updateTacticalHud = updateTacticalHud;
  ZigaMod.renderPieceList = renderPieceList;
  ZigaMod.getWidgetEl = function () { return widgetEl; };

  Object.defineProperty(ZigaMod, 'widgetEl', {
    get: function () { return widgetEl; },
    set: function (val) { widgetEl = val; },
    configurable: true
  });

})(window.ZigaMod = window.ZigaMod || {});
