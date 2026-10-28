// src/settings_modal.js - Comprehensive Modal for Feature Settings & Aura Customization
(function (ZigaMod) {
  'use strict';

  let settingsModalEl = null;
  let tempCustomSettings = null;
  let currentActiveTab = 'features';

  /**
   * Initializes the settings modal element in document.body if not already present.
   * @returns {HTMLElement}
   */
  function initSettingsModal() {
    if (document.getElementById('ziga-settings-modal')) {
      settingsModalEl = document.getElementById('ziga-settings-modal');
      return settingsModalEl;
    }

    settingsModalEl = document.createElement('div');
    settingsModalEl.id = 'ziga-settings-modal';
    settingsModalEl.className = 'ziga-aura-modal-overlay';
    settingsModalEl.style.display = 'none';

    settingsModalEl.innerHTML = `
      <div class="ziga-aura-modal-dialog">
        <!-- Modal Header -->
        <div class="ziga-aura-modal-header">
          <div class="ziga-aura-modal-title">
            <span class="ziga-aura-modal-badge">⚙️</span>
            <div class="ziga-aura-modal-title-text">
              <h3>CÀI ĐẶT & TÙY BIẾN MOD</h3>
              <small>Bật/tắt các công cụ hỗ trợ & tùy chỉnh hào quang bàn cờ Ziga</small>
            </div>
          </div>
          <button class="ziga-aura-modal-close" id="ziga-settings-modal-close-btn" type="button" title="Đóng cài đặt">✕</button>
        </div>

        <!-- Live Preview Stage (Chỉ hiển thị khi tùy biến Aura) -->
        <div class="ziga-aura-preview-stage" id="ziga-modal-preview-stage" style="display:none;">
          <div class="ziga-aura-preview-header">
            <span>👁️ XEM TRƯỚC HIỆU ỨNG THỜI GIAN THỰC (LIVE PREVIEW)</span>
          </div>
          <div class="ziga-aura-preview-body">
            <!-- Quân Ta Mẫu -->
            <div class="ziga-preview-piece-col">
              <div class="ziga-preview-piece-container">
                <div class="ziga-mock-piece red-piece">帥</div>
                <div class="ziga-mock-aura" id="ziga-mock-aura-my"></div>
              </div>
              <div class="ziga-preview-role-label">LƯỢT TÔI ĐI</div>
              <span class="ziga-preview-subtag my-subtag">Quân Có Thể Ăn</span>
            </div>

            <div class="ziga-preview-divider-vs">VS</div>

            <!-- Quân Địch Mẫu -->
            <div class="ziga-preview-piece-col">
              <div class="ziga-preview-piece-container">
                <div class="ziga-mock-piece black-piece">將</div>
                <div class="ziga-mock-aura" id="ziga-mock-aura-opp"></div>
              </div>
              <div class="ziga-preview-role-label">LƯỢT ĐỐI THỦ ĐI</div>
              <span class="ziga-preview-subtag opp-subtag">Quân Ta Bị Nhắm</span>
            </div>
          </div>

          <!-- Size Slider Control -->
          <div class="ziga-aura-scale-control-bar">
            <span class="ziga-scale-label">📏 Kích Thước Vòng Hào Quang:</span>
            <input type="range" id="ziga-modal-scale-slider" min="0.7" max="1.3" step="0.05" value="1.0" class="ziga-scale-slider" />
            <span class="ziga-scale-val-badge" id="ziga-modal-scale-val">100%</span>
            <button class="ziga-btn-reset-scale" id="ziga-btn-reset-modal-scale" type="button" title="Đặt lại kích thước chuẩn 100%">Chuẩn 100%</button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="ziga-aura-tabs-nav">
          <button class="ziga-aura-tab-btn active" id="ziga-modal-tab-btn-features" type="button" data-tab="features">
            <span>⚙️ CÀI ĐẶT TÍNH NĂNG</span>
          </button>
          <button class="ziga-aura-tab-btn" id="ziga-modal-tab-btn-themes" type="button" data-tab="themes">
            <span>🎨 CHỦ ĐỀ & MÀU AURA</span>
          </button>
          <button class="ziga-aura-tab-btn" id="ziga-modal-tab-btn-images" type="button" data-tab="images">
            <span>🖼️ MẪU ẢNH AURA PNG</span>
          </button>
        </div>

        <!-- TAB 1: Cài Đặt Tính Năng (Features) -->
        <div class="ziga-aura-tab-pane active" id="ziga-modal-pane-features">
          <div class="ziga-settings-groups-grid">
            
            <!-- Nhóm 1: Hỗ Trợ Tác Chiến -->
            <div class="ziga-settings-group-card">
              <div class="ziga-group-title">⚔️ HỖ TRỢ NƯỚC ĐI & TÁC CHIẾN</div>
              <div class="ziga-group-rows">

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Quân đã bị ăn</strong>
                    <small>Thống kê số lượng quân đã mất của 2 bên</small>
                  </span>
                  <input type="checkbox" id="modal-set-showLostPieces" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Highlight tầm đánh trên bàn cờ</strong>
                    <small>Bấm vào quân để nhấp nháy quân ăn được</small>
                  </span>
                  <input type="checkbox" id="modal-set-highlightTactics" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <div class="ziga-setting-row-box">
                  <label class="ziga-setting-row" style="margin-bottom:0; border-bottom-left-radius:0; border-bottom-right-radius:0;">
                    <span class="ziga-setting-text">
                      <strong>Aura Live (Hào quang xanh / đỏ)</strong>
                      <small>Lượt ta viền xanh ăn cờ, lượt đối thủ viền đỏ quân ta bị nhắm</small>
                    </span>
                    <input type="checkbox" id="modal-set-liveBoardAura" />
                    <span class="ziga-switch-slider"></span>
                  </label>
                  <div class="ziga-setting-sublink-bar">
                    <button class="ziga-btn-goto-aura" id="ziga-btn-goto-aura-tab" type="button">
                      🎨 Mở Tab Tùy Biến Màu Sắc & Hình Ảnh Aura ➔
                    </button>
                  </div>
                </div>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Bảng tầm đánh trên HUD</strong>
                    <small>Hiển thị chi tiết quân đang chọn & mục tiêu</small>
                  </span>
                  <input type="checkbox" id="modal-set-showTacticalHud" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Cảnh báo quân bị đe dọa</strong>
                    <small>Báo động khi chủ lực của bạn đang có nguy cơ bị ăn</small>
                  </span>
                  <input type="checkbox" id="modal-set-threatAlert" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Ghi biên bản ván đấu (FEN/PGN)</strong>
                    <small>Tự động ghi từng nước đi chuẩn tiếng Việt & copy FEN</small>
                  </span>
                  <input type="checkbox" id="modal-set-showMoveHistory" />
                  <span class="ziga-switch-slider"></span>
                </label>

              </div>
            </div>

            <!-- Nhóm 2: Thống Kê & Giao Diện -->
            <div class="ziga-settings-group-card">
              <div class="ziga-group-title">📊 THỐNG KÊ, HIỂN THỊ & CỜ ÚP</div>
              <div class="ziga-group-rows">

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Thống kê & Xác suất Cờ Úp</strong>
                    <small>Đếm quân úp và tính % mở Xe, Pháo, Mã...</small>
                  </span>
                  <input type="checkbox" id="modal-set-showCoUpTracker" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Thanh chênh lệch điểm quân</strong>
                    <small>Đo lường ưu thế lực lượng (+9 Xe, +4.5 Pháo...)</small>
                  </span>
                  <input type="checkbox" id="modal-set-materialAdvantage" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Đếm Xe - Pháo - Mã còn lại</strong>
                    <small>Thống kê số lượng chủ lực còn sống</small>
                  </span>
                  <input type="checkbox" id="modal-set-showKeyPieces" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Ký hiệu tiếng Việt (X, P, M...)</strong>
                    <small>Hiển thị chữ quốc ngữ thay cho chữ Hán</small>
                  </span>
                  <input type="checkbox" id="modal-set-vietnameseLabels" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Đánh số hàng (1-10) bàn cờ</strong>
                    <small>Hiển thị số hàng ở 2 mép gỗ bàn cờ</small>
                  </span>
                  <input type="checkbox" id="modal-set-showRowNumbers" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Ẩn quảng cáo che khuất</strong>
                    <small>Tự động xóa các banner quảng cáo nổi vướng bàn cờ</small>
                  </span>
                  <input type="checkbox" id="modal-set-cleanAdView" />
                  <span class="ziga-switch-slider"></span>
                </label>

              </div>
            </div>

          </div>
        </div>

        <!-- TAB 2: Themes & Màu Sắc (Aura Colors) -->
        <div class="ziga-aura-tab-pane" id="ziga-modal-pane-themes" style="display:none;">
          <div class="ziga-aura-pane-section">
            <span class="ziga-pane-section-title">CHỌN NHANH THEME LÀM SẴN</span>
            <div class="ziga-aura-themes-grid" id="ziga-modal-themes-container"></div>
          </div>

          <div class="ziga-aura-pane-section" style="margin-top: 14px;">
            <span class="ziga-pane-section-title">TỰ CHỈNH MÃ MÀU TÙY Ý (HEX / COLOR PICKER)</span>
            <div class="ziga-aura-color-pickers-box">
              <div class="ziga-color-pick-item">
                <label for="ziga-pick-my-color">Màu Lượt Tôi Đi:</label>
                <div class="ziga-pick-controls">
                  <input type="color" id="ziga-pick-my-color" class="ziga-color-input" value="#39ff14" />
                  <input type="text" id="ziga-pick-my-hex" class="ziga-hex-text" value="#39ff14" maxlength="7" />
                </div>
              </div>
              <div class="ziga-color-pick-item">
                <label for="ziga-pick-opp-color">Màu Lượt Đối Thủ:</label>
                <div class="ziga-pick-controls">
                  <input type="color" id="ziga-pick-opp-color" class="ziga-color-input" value="#ff1744" />
                  <input type="text" id="ziga-pick-opp-hex" class="ziga-hex-text" value="#ff1744" maxlength="7" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: Mẫu Ảnh Aura PNG (Custom & Presets) -->
        <div class="ziga-aura-tab-pane" id="ziga-modal-pane-images" style="display:none;">
          <!-- Bộ sưu tập Preset 1-Click Test Ngay -->
          <div class="ziga-aura-presets-section">
            <div class="ziga-presets-header">
              <span class="ziga-presets-title">✨ MẪU ẢNH AURA CÓ SẴN (CHỌN 1-CLICK TEST NGAY)</span>
              <span class="ziga-presets-subtitle">Bấm <strong>[🟢 Lượt Tôi]</strong> hoặc <strong>[🔴 Đối Thủ]</strong> để test ngay vòng hào quang độc quyền!</span>
            </div>
            <div class="ziga-aura-presets-grid" id="ziga-modal-presets-container"></div>
          </div>

          <!-- Tự nạp ảnh PNG từ máy -->
          <div class="ziga-aura-pane-section" style="margin-top: 14px;">
            <div class="ziga-pane-section-title">📁 TỰ NẠP ẢNH PNG TÙY CHỌN TỪ MÁY TÍNH</div>
            <div class="ziga-aura-upload-columns">
              <div class="ziga-upload-column-card">
                <span class="ziga-upload-card-heading">ẢNH AURA LƯỢT TÔI</span>
                <div class="ziga-upload-thumbnail-box" id="ziga-thumb-box-my">
                  <span class="ziga-thumb-placeholder">Đang dùng viền Neon</span>
                </div>
                <div class="ziga-upload-action-row">
                  <label class="ziga-btn-choose-file">
                    📁 Chọn file PNG...
                    <input type="file" id="ziga-file-upload-my" accept="image/png,image/webp,image/svg+xml" style="display:none;" />
                  </label>
                  <button class="ziga-btn-clear-img" id="ziga-btn-clear-my" type="button" title="Gỡ bỏ ảnh, dùng lại Neon">✕ Xóa</button>
                </div>
              </div>

              <div class="ziga-upload-column-card">
                <span class="ziga-upload-card-heading">ẢNH AURA LƯỢT ĐỐI THỦ</span>
                <div class="ziga-upload-thumbnail-box" id="ziga-thumb-box-opp">
                  <span class="ziga-thumb-placeholder">Đang dùng viền Neon</span>
                </div>
                <div class="ziga-upload-action-row">
                  <label class="ziga-btn-choose-file">
                    📁 Chọn file PNG...
                    <input type="file" id="ziga-file-upload-opp" accept="image/png,image/webp,image/svg+xml" style="display:none;" />
                  </label>
                  <button class="ziga-btn-clear-img" id="ziga-btn-clear-opp" type="button" title="Gỡ bỏ ảnh, dùng lại Neon">✕ Xóa</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Guidelines -->
          <div class="ziga-aura-guideline-card" style="margin-top: 12px;">
            <div class="ziga-guide-title">📐 TIÊU CHUẨN FILE ẢNH AURA TỰ VẼ (PHOTOSHOP / CANVA):</div>
            <ul>
              <li><strong>Định dạng:</strong> File ảnh <code>.PNG</code> nền trong suốt (Alpha Channel).</li>
              <li><strong>Kích thước chuẩn:</strong> Ảnh vuông <code>128x128 px</code> hoặc <code>256x256 px</code>.</li>
              <li><strong>Vùng an toàn:</strong> Tâm ảnh chính giữa, lòng trong rỗng (đường kính ~74%) để không che chữ quân cờ gỗ.</li>
            </ul>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="ziga-aura-modal-footer">
          <button class="ziga-modal-btn secondary" id="ziga-modal-btn-restore-default" type="button">
            🔄 Khôi Phục Mặc Định
          </button>
          <button class="ziga-modal-btn primary" id="ziga-modal-btn-save-confirm" type="button">
            💾 ĐÓNG & ÁP DỤNG
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(settingsModalEl);
    bindSettingsModalEvents();
    return settingsModalEl;
  }

  /**
   * Switches active tab in the settings modal.
   * @param {'features'|'themes'|'images'} tabId
   */
  function switchModalTab(tabId) {
    currentActiveTab = tabId;

    const btnFeatures = document.getElementById('ziga-modal-tab-btn-features');
    const btnThemes = document.getElementById('ziga-modal-tab-btn-themes');
    const btnImages = document.getElementById('ziga-modal-tab-btn-images');

    const paneFeatures = document.getElementById('ziga-modal-pane-features');
    const paneThemes = document.getElementById('ziga-modal-pane-themes');
    const paneImages = document.getElementById('ziga-modal-pane-images');

    const previewStage = document.getElementById('ziga-modal-preview-stage');

    // Update Tab Buttons
    if (btnFeatures) btnFeatures.classList.toggle('active', tabId === 'features');
    if (btnThemes) btnThemes.classList.toggle('active', tabId === 'themes');
    if (btnImages) btnImages.classList.toggle('active', tabId === 'images');

    // Update Tab Panes
    if (paneFeatures) paneFeatures.style.display = (tabId === 'features') ? 'block' : 'none';
    if (paneThemes) paneThemes.style.display = (tabId === 'themes') ? 'block' : 'none';
    if (paneImages) paneImages.style.display = (tabId === 'images') ? 'block' : 'none';

    // Preview Stage is shown only on Themes & Images tabs for a clean, spacious Features tab
    if (previewStage) {
      previewStage.style.display = (tabId === 'features') ? 'none' : 'block';
    }
  }

  /**
   * Binds all event listeners inside the settings modal.
   */
  function bindSettingsModalEvents() {
    if (!settingsModalEl) return;

    // Close button & outside click
    const closeBtn = document.getElementById('ziga-settings-modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal);

    settingsModalEl.addEventListener('click', (e) => {
      if (e.target === settingsModalEl) closeSettingsModal();
    });

    // Tab buttons switching
    const tabBtns = settingsModalEl.querySelectorAll('.ziga-aura-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) switchModalTab(tab);
      });
    });

    // Shortcut button in Features tab to jump directly to Aura Themes tab
    const gotoAuraBtn = document.getElementById('ziga-btn-goto-aura-tab');
    if (gotoAuraBtn) {
      gotoAuraBtn.addEventListener('click', () => {
        switchModalTab('themes');
      });
    }

    // Bind all 10 feature settings switches
    Object.keys(ZigaMod.DEFAULT_SETTINGS).forEach(key => {
      if (key === 'auraCustom' || key === 'liveAuraMode') return;
      const checkbox = document.getElementById(`modal-set-${key}`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          ZigaMod.userSettings[key] = e.target.checked;
          ZigaMod.saveSettings();
          if (ZigaMod.applySettingsVisibility) {
            ZigaMod.applySettingsVisibility();
          }
          ZigaMod.lastStateHash = ''; // Force immediate UI refresh
        });
      }
    });

    // Size Scale Slider events
    const scaleSlider = document.getElementById('ziga-modal-scale-slider');
    const scaleVal = document.getElementById('ziga-modal-scale-val');
    const resetScaleBtn = document.getElementById('ziga-btn-reset-modal-scale');

    if (scaleSlider) {
      scaleSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (tempCustomSettings) {
          tempCustomSettings.scale = val;
        }
        if (scaleVal) scaleVal.textContent = Math.round(val * 100) + '%';
        updateModalLivePreview();
      });
    }

    if (resetScaleBtn) {
      resetScaleBtn.addEventListener('click', () => {
        if (tempCustomSettings) {
          tempCustomSettings.scale = 1.0;
        }
        if (scaleSlider) scaleSlider.value = '1.0';
        if (scaleVal) scaleVal.textContent = '100%';
        updateModalLivePreview();
      });
    }

    // Color Pickers input synchronization
    const pickMyColor = document.getElementById('ziga-pick-my-color');
    const pickMyHex = document.getElementById('ziga-pick-my-hex');
    const pickOppColor = document.getElementById('ziga-pick-opp-color');
    const pickOppHex = document.getElementById('ziga-pick-opp-hex');

    if (pickMyColor && pickMyHex) {
      pickMyColor.addEventListener('input', (e) => {
        pickMyHex.value = e.target.value.toUpperCase();
        if (tempCustomSettings) {
          tempCustomSettings.myColor = e.target.value;
          tempCustomSettings.mode = 'neon';
          tempCustomSettings.theme = 'custom';
        }
        updateModalLivePreview();
        highlightActiveThemeCard();
      });

      pickMyHex.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          pickMyColor.value = val;
          if (tempCustomSettings) {
            tempCustomSettings.myColor = val;
            tempCustomSettings.mode = 'neon';
            tempCustomSettings.theme = 'custom';
          }
          updateModalLivePreview();
          highlightActiveThemeCard();
        }
      });
    }

    if (pickOppColor && pickOppHex) {
      pickOppColor.addEventListener('input', (e) => {
        pickOppHex.value = e.target.value.toUpperCase();
        if (tempCustomSettings) {
          tempCustomSettings.oppColor = e.target.value;
          tempCustomSettings.mode = 'neon';
          tempCustomSettings.theme = 'custom';
        }
        updateModalLivePreview();
        highlightActiveThemeCard();
      });

      pickOppHex.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          pickOppColor.value = val;
          if (tempCustomSettings) {
            tempCustomSettings.oppColor = val;
            tempCustomSettings.mode = 'neon';
            tempCustomSettings.theme = 'custom';
          }
          updateModalLivePreview();
          highlightActiveThemeCard();
        }
      });
    }

    // File Upload handling via FileReader
    const fileMy = document.getElementById('ziga-file-upload-my');
    const clearMy = document.getElementById('ziga-btn-clear-my');
    const fileOpp = document.getElementById('ziga-file-upload-opp');
    const clearOpp = document.getElementById('ziga-btn-clear-opp');

    if (fileMy) {
      fileMy.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (tempCustomSettings) {
              tempCustomSettings.customImageMy = ev.target.result;
              tempCustomSettings.mode = 'image';
            }
            updateThumbnailPreview('my', ev.target.result);
            updateModalLivePreview();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (clearMy) {
      clearMy.addEventListener('click', () => {
        if (tempCustomSettings) {
          tempCustomSettings.customImageMy = '';
          if (!tempCustomSettings.customImageOpp) tempCustomSettings.mode = 'neon';
        }
        if (fileMy) fileMy.value = '';
        updateThumbnailPreview('my', '');
        updateModalLivePreview();
      });
    }

    if (fileOpp) {
      fileOpp.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (tempCustomSettings) {
              tempCustomSettings.customImageOpp = ev.target.result;
              tempCustomSettings.mode = 'image';
            }
            updateThumbnailPreview('opp', ev.target.result);
            updateModalLivePreview();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (clearOpp) {
      clearOpp.addEventListener('click', () => {
        if (tempCustomSettings) {
          tempCustomSettings.customImageOpp = '';
          if (!tempCustomSettings.customImageMy) tempCustomSettings.mode = 'neon';
        }
        if (fileOpp) fileOpp.value = '';
        updateThumbnailPreview('opp', '');
        updateModalLivePreview();
      });
    }

    // Restore Defaults button (resets both features and aura to default)
    const resetDefaultBtn = document.getElementById('ziga-modal-btn-restore-default');
    if (resetDefaultBtn) {
      resetDefaultBtn.addEventListener('click', () => {
        ZigaMod.userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS);
        tempCustomSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS.auraCustom);
        ZigaMod.userSettings.auraCustom = Object.assign({}, tempCustomSettings);
        ZigaMod.saveSettings();

        syncModalFeaturesCheckboxes();
        syncModalControls();
        updateModalLivePreview();

        if (ZigaMod.applySettingsVisibility) {
          ZigaMod.applySettingsVisibility();
        }
        if (ZigaMod.reloadAuraTextures) {
          ZigaMod.reloadAuraTextures();
        }
        ZigaMod.lastStateHash = '';
      });
    }

    // Save and Apply button
    const saveApplyBtn = document.getElementById('ziga-modal-btn-save-confirm');
    if (saveApplyBtn) {
      saveApplyBtn.addEventListener('click', () => {
        if (tempCustomSettings) {
          ZigaMod.userSettings.auraCustom = Object.assign({}, tempCustomSettings);
          ZigaMod.saveSettings();
          if (ZigaMod.reloadAuraTextures) {
            ZigaMod.reloadAuraTextures();
          }
        }
        closeSettingsModal();
      });
    }
  }

  /**
   * Synchronizes checkbox states in Tab 1 with current userSettings.
   */
  function syncModalFeaturesCheckboxes() {
    const s = ZigaMod.userSettings || ZigaMod.DEFAULT_SETTINGS;
    Object.keys(ZigaMod.DEFAULT_SETTINGS).forEach(key => {
      const cb = document.getElementById(`modal-set-${key}`);
      if (cb) {
        cb.checked = !!s[key];
      }
    });
  }

  /**
   * Renders built-in Neon Themes in Tab 2.
   */
  function renderThemesGrid() {
    const container = document.getElementById('ziga-modal-themes-container');
    if (!container) return;

    const themes = ZigaMod.AURA_THEMES || {};
    let html = '';

    Object.keys(themes).forEach((k) => {
      const th = themes[k];
      const isSelected = (tempCustomSettings && tempCustomSettings.theme === th.id && tempCustomSettings.mode === 'neon');
      html += `
        <div class="ziga-theme-card ${isSelected ? 'selected' : ''}" data-theme-id="${th.id}">
          <div class="ziga-theme-swatches">
            <span class="ziga-theme-color-circle" style="background:${th.myColor}; box-shadow:0 0 8px ${th.myColor};"></span>
            <span class="ziga-theme-vs-small">vs</span>
            <span class="ziga-theme-color-circle" style="background:${th.oppColor}; box-shadow:0 0 8px ${th.oppColor};"></span>
          </div>
          <div class="ziga-theme-info">
            <div class="ziga-theme-name">${th.name}</div>
            <div class="ziga-theme-desc">${th.desc}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.ziga-theme-card').forEach((card) => {
      card.addEventListener('click', () => {
        const tid = card.dataset.themeId;
        const th = themes[tid];
        if (th && tempCustomSettings) {
          tempCustomSettings.theme = tid;
          tempCustomSettings.myColor = th.myColor;
          tempCustomSettings.oppColor = th.oppColor;
          tempCustomSettings.mode = 'neon';
          syncModalControls();
          updateModalLivePreview();
        }
      });
    });
  }

  function highlightActiveThemeCard() {
    const container = document.getElementById('ziga-modal-themes-container');
    if (!container) return;
    container.querySelectorAll('.ziga-theme-card').forEach((card) => {
      const tid = card.dataset.themeId;
      const isActive = (tempCustomSettings && tempCustomSettings.theme === tid && tempCustomSettings.mode === 'neon');
      card.classList.toggle('selected', !!isActive);
    });
  }

  /**
   * Renders 5 high-quality PNG presets in Tab 3.
   */
  function renderAuraPresetsGrid() {
    const container = document.getElementById('ziga-modal-presets-container');
    if (!container) return;

    const presets = ZigaMod.PRESET_AURAS || [];
    if (!presets.length) {
      container.innerHTML = '<div style="color:#64748b; font-size:11px; padding:8px;">Chưa nạp được danh sách mẫu ảnh có sẵn.</div>';
      return;
    }

    let html = '';
    presets.forEach((p) => {
      html += `
        <div class="ziga-preset-card" data-preset-id="${p.id}">
          <div class="ziga-preset-preview-wrap">
            <div class="ziga-mock-piece-preset">
              <div class="ziga-mock-preset-char">俥</div>
              <div class="ziga-preset-aura-circle" style="background-image: url('${p.base64}');"></div>
            </div>
          </div>
          <div class="ziga-preset-details">
            <div class="ziga-preset-name">${p.title}</div>
            <div class="ziga-preset-badge ${p.cat}">${p.tag || ''}</div>
            <div class="ziga-preset-actions">
              <button class="ziga-preset-btn my" type="button" data-action="set-my" title="Gán ảnh này cho Lượt Tôi">
                🟢 Lượt Tôi
              </button>
              <button class="ziga-preset-btn opp" type="button" data-action="set-opp" title="Gán ảnh này cho Lượt Đối Thủ">
                🔴 Đối Thủ
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.ziga-preset-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const card = btn.closest('.ziga-preset-card');
        const pid = card && card.dataset.presetId;
        const found = presets.find(item => item.id === pid);
        if (!found || !tempCustomSettings) return;

        if (action === 'set-my') {
          tempCustomSettings.customImageMy = found.base64;
          tempCustomSettings.mode = 'image';
          updateThumbnailPreview('my', found.base64);
        } else if (action === 'set-opp') {
          tempCustomSettings.customImageOpp = found.base64;
          tempCustomSettings.mode = 'image';
          updateThumbnailPreview('opp', found.base64);
        }
        updateModalLivePreview();
        highlightActivePresets();
      });
    });

    highlightActivePresets();
  }

  function highlightActivePresets() {
    const container = document.getElementById('ziga-modal-presets-container');
    if (!container || !tempCustomSettings) return;

    const presets = ZigaMod.PRESET_AURAS || [];
    container.querySelectorAll('.ziga-preset-card').forEach((card) => {
      const pid = card.dataset.presetId;
      const p = presets.find(item => item.id === pid);
      if (!p) return;

      const isMy = (tempCustomSettings.mode === 'image' && tempCustomSettings.customImageMy === p.base64);
      const isOpp = (tempCustomSettings.mode === 'image' && tempCustomSettings.customImageOpp === p.base64);

      card.classList.toggle('active-my', isMy);
      card.classList.toggle('active-opp', isOpp);
    });
  }

  /**
   * Synchronizes color picker and slider controls with tempCustomSettings.
   */
  function syncModalControls() {
    if (!tempCustomSettings) return;

    const pickMyColor = document.getElementById('ziga-pick-my-color');
    const pickMyHex = document.getElementById('ziga-pick-my-hex');
    const pickOppColor = document.getElementById('ziga-pick-opp-color');
    const pickOppHex = document.getElementById('ziga-pick-opp-hex');

    if (pickMyColor) pickMyColor.value = tempCustomSettings.myColor || '#39ff14';
    if (pickMyHex) pickMyHex.value = (tempCustomSettings.myColor || '#39ff14').toUpperCase();
    if (pickOppColor) pickOppColor.value = tempCustomSettings.oppColor || '#ff1744';
    if (pickOppHex) pickOppHex.value = (tempCustomSettings.oppColor || '#ff1744').toUpperCase();

    // Scale Slider sync
    const scaleSlider = document.getElementById('ziga-modal-scale-slider');
    const scaleVal = document.getElementById('ziga-modal-scale-val');
    const curScale = (typeof tempCustomSettings.scale === 'number') ? tempCustomSettings.scale : 1.0;
    if (scaleSlider) scaleSlider.value = curScale;
    if (scaleVal) scaleVal.textContent = Math.round(curScale * 100) + '%';

    updateThumbnailPreview('my', tempCustomSettings.customImageMy || '');
    updateThumbnailPreview('opp', tempCustomSettings.customImageOpp || '');

    highlightActiveThemeCard();
    highlightActivePresets();
  }

  function updateThumbnailPreview(side, dataUrl) {
    const box = document.getElementById(`ziga-thumb-box-${side}`);
    if (!box) return;

    if (dataUrl && dataUrl.startsWith('data:image')) {
      box.innerHTML = `<img src="${dataUrl}" class="ziga-upload-thumb-img" alt="Aura Preview" />`;
    } else {
      box.innerHTML = `<span class="ziga-thumb-placeholder">Đang dùng viền Neon</span>`;
    }
  }

  /**
   * Updates real-time Mock Live Preview of the 2 chess pieces.
   */
  function updateModalLivePreview() {
    if (!tempCustomSettings) return;

    const previewMy = document.getElementById('ziga-mock-aura-my');
    const previewOpp = document.getElementById('ziga-mock-aura-opp');
    const curScale = (typeof tempCustomSettings.scale === 'number') ? tempCustomSettings.scale : 1.0;

    if (previewMy) {
      previewMy.style.setProperty('--aura-scale', curScale);
      if (tempCustomSettings.mode === 'image' && tempCustomSettings.customImageMy) {
        previewMy.style.backgroundImage = `url(${tempCustomSettings.customImageMy})`;
        previewMy.style.backgroundSize = 'contain';
        previewMy.style.backgroundRepeat = 'no-repeat';
        previewMy.style.backgroundPosition = 'center';
        previewMy.style.border = 'none';
        previewMy.style.boxShadow = 'none';
      } else {
        const myCol = tempCustomSettings.myColor || '#39ff14';
        previewMy.style.backgroundImage = 'none';
        previewMy.style.border = `2.5px solid ${myCol}`;
        previewMy.style.boxShadow = `0 0 10px ${myCol}, 0 0 22px ${myCol}, inset 0 0 8px ${myCol}`;
      }
    }

    if (previewOpp) {
      previewOpp.style.setProperty('--aura-scale', curScale);
      if (tempCustomSettings.mode === 'image' && tempCustomSettings.customImageOpp) {
        previewOpp.style.backgroundImage = `url(${tempCustomSettings.customImageOpp})`;
        previewOpp.style.backgroundSize = 'contain';
        previewOpp.style.backgroundRepeat = 'no-repeat';
        previewOpp.style.backgroundPosition = 'center';
        previewOpp.style.border = 'none';
        previewOpp.style.boxShadow = 'none';
      } else {
        const oppCol = tempCustomSettings.oppColor || '#ff1744';
        previewOpp.style.backgroundImage = 'none';
        previewOpp.style.border = `2.5px solid ${oppCol}`;
        previewOpp.style.boxShadow = `0 0 10px ${oppCol}, 0 0 22px ${oppCol}, inset 0 0 8px ${oppCol}`;
      }
    }
  }

  /**
   * Opens the comprehensive Settings & Aura Customization Modal.
   * @param {'features'|'themes'|'images'} initialTab - Default tab to open
   */
  function openSettingsModal(initialTab) {
    initSettingsModal();
    if (!settingsModalEl) return;

    const current = (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom)
      ? ZigaMod.userSettings.auraCustom
      : ZigaMod.DEFAULT_SETTINGS.auraCustom;

    tempCustomSettings = Object.assign({}, current);

    syncModalFeaturesCheckboxes();
    renderThemesGrid();
    renderAuraPresetsGrid();
    syncModalControls();
    updateModalLivePreview();

    switchModalTab(initialTab || 'features');
    settingsModalEl.style.display = 'flex';
  }

  /**
   * Closes the settings modal.
   */
  function closeSettingsModal() {
    if (settingsModalEl) {
      settingsModalEl.style.display = 'none';
    }
  }

  // Export to ZigaMod namespace
  ZigaMod.initSettingsModal = initSettingsModal;
  ZigaMod.openSettingsModal = openSettingsModal;
  ZigaMod.closeSettingsModal = closeSettingsModal;

  // Backward compatibility aliases for any previous calls
  ZigaMod.openAuraCustomModal = function (tab) {
    openSettingsModal(tab || 'themes');
  };
  ZigaMod.closeAuraCustomModal = closeSettingsModal;

})(window.ZigaMod = window.ZigaMod || {});
