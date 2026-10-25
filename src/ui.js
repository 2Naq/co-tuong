// src/ui.js - HUD DOM creation, dragging, resizing, tactical target cards, and settings visibility
(function (ZigaMod) {
  'use strict';

  let widgetEl = null;
  let isMinimized = false;
  let isSettingsOpen = false;
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

      // Close settings drawer if open
      if (isSettingsOpen) {
        isSettingsOpen = false;
        const settingsPanel = document.getElementById('ziga-settings-panel');
        const settingsBtn = document.getElementById('ziga-mod-btn-settings');
        if (settingsPanel) settingsPanel.style.display = 'none';
        if (settingsBtn) settingsBtn.classList.remove('active');
      }

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
            <svg viewBox="0 0 512 512" width="20" height="20" style="border-radius: 4px; vertical-align: middle; display: inline-block; box-shadow: 0 0 6px rgba(212, 175, 55, 0.4); border: 1px solid rgba(212, 175, 55, 0.5);">
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
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-settings" title="Cài đặt tính năng">⚙</button>
          <button class="ziga-mod-btn-icon" id="ziga-mod-btn-min" title="Thu gọn / Mở rộng">_</button>
        </div>
      </div>

      <!-- Settings Drawer Panel -->
      <div class="ziga-settings-drawer" id="ziga-settings-panel" style="display:none;">
        <div class="ziga-settings-header">
          <span class="ziga-settings-heading">⚙️ CÀI ĐẶT TÍNH NĂNG</span>
          <button class="ziga-settings-close-btn" id="ziga-settings-close">✕</button>
        </div>
        <div class="ziga-settings-list">
          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Quân đã bị ăn</strong>
              <small>Thống kê quân đã mất của 2 bên</small>
            </span>
            <input type="checkbox" id="set-showLostPieces" ${userSettings.showLostPieces ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Highlight tầm đánh trên bàn cờ</strong>
              <small>Bấm vào quân để nhấp nháy quân ăn được</small>
            </span>
            <input type="checkbox" id="set-highlightTactics" ${userSettings.highlightTactics ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Bảng tầm đánh trên HUD</strong>
              <small>Hiển thị chi tiết quân đang chọn & mục tiêu</small>
            </span>
            <input type="checkbox" id="set-showTacticalHud" ${userSettings.showTacticalHud ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Thống kê & Xác suất Cờ Úp</strong>
              <small>Đếm quân úp còn lại và tính % mở Xe, Pháo...</small>
            </span>
            <input type="checkbox" id="set-showCoUpTracker" ${userSettings.showCoUpTracker ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Cảnh báo quân bị đe dọa</strong>
              <small>Báo động khi quân của bạn đang bị nhắm ăn</small>
            </span>
            <input type="checkbox" id="set-threatAlert" ${userSettings.threatAlert ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Thanh chênh lệch điểm quân</strong>
              <small>Đo lường ưu thế lực lượng (+9 Xe, +4.5 Pháo...)</small>
            </span>
            <input type="checkbox" id="set-materialAdvantage" ${userSettings.materialAdvantage ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Đếm Xe - Pháo - Mã còn lại</strong>
              <small>Thống kê số lượng chủ lực còn sống</small>
            </span>
            <input type="checkbox" id="set-showKeyPieces" ${userSettings.showKeyPieces ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Ký hiệu tiếng Việt (X, P, M...)</strong>
              <small>Hiển thị chữ quốc ngữ thay cho chữ Hán</small>
            </span>
            <input type="checkbox" id="set-vietnameseLabels" ${userSettings.vietnameseLabels ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Đánh số hàng (1-10) bàn cờ</strong>
              <small>Hiển thị số hàng ở 2 mép gỗ bàn cờ</small>
            </span>
            <input type="checkbox" id="set-showRowNumbers" ${userSettings.showRowNumbers ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>

          <label class="ziga-setting-row">
            <span class="ziga-setting-text">
              <strong>Ẩn quảng cáo che khuất</strong>
              <small>Xóa các banner quảng cáo nổi vướng bàn cờ</small>
            </span>
            <input type="checkbox" id="set-cleanAdView" ${userSettings.cleanAdView ? 'checked' : ''} />
            <span class="ziga-switch-slider"></span>
          </label>
        </div>
        <div class="ziga-settings-footer">
          <button class="ziga-btn-reset-settings" id="ziga-btn-reset-default">Khôi phục mặc định</button>
        </div>
      </div>

      <div class="ziga-mod-content" id="ziga-mod-body">
        <div class="ziga-mod-match-status" id="ziga-mod-match-info">
          <span class="ziga-mod-dot waiting"></span>
          <span id="ziga-status-text">Đang kết nối game...</span>
        </div>

        <!-- Threat Warning Alert Box -->
        <div class="ziga-threat-box" id="ziga-threat-wrapper" style="display:none;">
          <div class="ziga-threat-header">
            <span class="ziga-threat-icon__">⚠️</span>
            <span class="ziga-threat-title" id="ziga-threat-title">CẢNH BÁO NÍ SẮP BỊ LỤM</span>
          </div>
          <div class="ziga-threat-list" id="ziga-threat-items"></div>
        </div>

        <!-- Material Advantage Indicator -->
        <div class="ziga-material-bar-wrapper" id="ziga-material-wrapper" style="display:none;">
          <div class="ziga-material-label">Chênh lệch quân:</div>
          <div class="ziga-material-val" id="ziga-material-score">Bằng điểm</div>
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
      </div>

      <!-- Resize Grips -->
      <div class="ziga-mod-resize-edge-r" id="ziga-mod-resize-edge-r" title="Kéo mép để chỉnh chiều rộng"></div>
      <div class="ziga-mod-resize-edge-b" id="ziga-mod-resize-edge-b" title="Kéo mép để chỉnh chiều cao"></div>
      <div class="ziga-mod-resize-handle" id="ziga-mod-resize-handle" title="Kéo góc để phóng to / thu nhỏ (Click đúp để về mặc định)"></div>
    `;

    document.body.appendChild(widgetEl);

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

    // Settings panel toggle
    const settingsBtn = document.getElementById('ziga-mod-btn-settings');
    const settingsPanel = document.getElementById('ziga-settings-panel');
    const settingsClose = document.getElementById('ziga-settings-close');

    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isSettingsOpen = !isSettingsOpen;
      settingsPanel.style.display = isSettingsOpen ? 'block' : 'none';
      settingsBtn.classList.toggle('active', isSettingsOpen);
    });

    settingsClose.addEventListener('click', (e) => {
      e.stopPropagation();
      isSettingsOpen = false;
      settingsPanel.style.display = 'none';
      settingsBtn.classList.remove('active');
    });

    // Bind settings toggles
    Object.keys(ZigaMod.DEFAULT_SETTINGS).forEach(key => {
      const checkbox = document.getElementById(`set-${key}`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          ZigaMod.userSettings[key] = e.target.checked;
          ZigaMod.saveSettings();
          applySettingsVisibility();
          ZigaMod.lastStateHash = ''; // Force immediate UI refresh
        });
      }
    });

    // Reset default settings
    const resetBtn = document.getElementById('ziga-btn-reset-default');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ZigaMod.userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS);
        ZigaMod.saveSettings();
        Object.keys(ZigaMod.DEFAULT_SETTINGS).forEach(key => {
          const checkbox = document.getElementById(`set-${key}`);
          if (checkbox) checkbox.checked = ZigaMod.userSettings[key];
        });
        applySettingsVisibility();
        ZigaMod.lastStateHash = '';
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

    if (lostOpp) lostOpp.style.display = userSettings.showLostPieces ? 'flex' : 'none';
    if (lostSelf) lostSelf.style.display = userSettings.showLostPieces ? 'flex' : 'none';
    if (lostDiv) lostDiv.style.display = userSettings.showLostPieces ? 'block' : 'none';

    if (matWrapper && !userSettings.materialAdvantage) matWrapper.style.display = 'none';

    if (tacticalBox) tacticalBox.style.display = userSettings.showTacticalHud ? 'flex' : 'none';
    if (tacticalDiv) tacticalDiv.style.display = userSettings.showTacticalHud ? 'block' : 'none';

    if (summaryBox) summaryBox.style.display = userSettings.showKeyPieces ? 'flex' : 'none';
    if (summaryDiv) summaryDiv.style.display = userSettings.showKeyPieces ? 'block' : 'none';

    if (userSettings.cleanAdView) {
      document.body.classList.add('ziga-clean-ads-active');
    } else {
      document.body.classList.remove('ziga-clean-ads-active');
    }

    if (ZigaMod.updateRowLabelsVisibility) {
      const gameLayer = ZigaMod.getActiveGameLayer ? ZigaMod.getActiveGameLayer() : null;
      ZigaMod.updateRowLabelsVisibility(gameLayer);
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

    document.addEventListener('mousemove', (e) => {
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
    });

    document.addEventListener('mouseup', () => {
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
    });
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

    document.addEventListener('mousemove', (e) => {
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
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = '';
        ZigaMod.saveSize(container.offsetWidth, container.offsetHeight);
      }
    });
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

  // Export to namespace
  ZigaMod.createOverlay = createOverlay;
  ZigaMod.toggleMinimize = toggleMinimize;
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
