// src/settings_modal.js - Comprehensive Modal for Feature Settings & Aura Customization
(function (ZigaMod) {
  'use strict';

  let settingsModalEl = null;
  let tempCustomSettings = null;
  let currentActiveTab = 'features';
  let currentPresetFilter = 'all';

  /**
   * Resolves image data URL for 'my' or 'opp' from tempCustomSettings (supports presetMy/presetOpp IDs).
   */
  function getResolvedPreviewImg(side) {
    if (!tempCustomSettings) return '';
    if (typeof ZigaMod.resolveAuraImageData === 'function') {
      return ZigaMod.resolveAuraImageData(tempCustomSettings, side);
    }
    return side === 'opp' ? (tempCustomSettings.customImageOpp || '') : (tempCustomSettings.customImageMy || '');
  }

  /**
   * Immediately persists and applies tempCustomSettings to the live Cocos2d board
   * so the user sees changes right away without pressing F5 or closing the modal.
   */
  function applyLiveAuraSettings() {
    if (!tempCustomSettings) return;
    if (ZigaMod.userSettings) {
      ZigaMod.userSettings.auraCustom = Object.assign({}, tempCustomSettings);
      // Ensure liveBoardAura toggle is on when user actively selects/customizes an aura
      if (!ZigaMod.userSettings.liveBoardAura) {
        ZigaMod.userSettings.liveBoardAura = true;
        syncModalFeaturesCheckboxes();
      }
      ZigaMod.saveSettings();
    }
    if (typeof ZigaMod.reloadAuraTextures === 'function') {
      ZigaMod.reloadAuraTextures();
    }
    ZigaMod.lastStateHash = '';
  }

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

          <!-- Animation & Motion Control Bar -->
          <div class="ziga-aura-anim-control-bar">
            <div class="ziga-anim-select-group">
              <label for="ziga-modal-anim-select" class="ziga-scale-label">✨ Hiệu Ứng:</label>
              <select id="ziga-modal-anim-select" class="ziga-anim-select">
                <option value="spin_pulse">🌀 Xoay Tròn & Chớp Nháy (Đẹp nhất)</option>
                <option value="spin">🔄 Xoay Tròn 360° Liên Tục</option>
                <option value="pulse">💡 Chớp Nháy Hơi Thở (Breathing Pulse)</option>
                <option value="heartbeat">💓 Nhịp Tim Dồn Dập (Heartbeat)</option>
                <option value="static">⏸️ Tĩnh (Không Chuyển Động)</option>
              </select>
            </div>
            <div class="ziga-anim-speed-group" id="ziga-modal-speed-wrap">
              <span class="ziga-scale-label">⚡ Tốc Độ Xoay:</span>
              <input type="range" id="ziga-modal-speed-slider" min="1.0" max="8.0" step="0.5" value="3.5" class="ziga-scale-slider" />
              <span class="ziga-scale-val-badge" id="ziga-modal-speed-val">3.5s</span>
            </div>
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
            <span>🖼️ KHO 22 MẪU AURA PNG</span>
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

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Vẽ mũi tên chiến thuật bằng chuột phải</strong>
                    <small>Giữ chuột phải kéo vẽ mũi tên neon, click highlight ô</small>
                  </span>
                  <input type="checkbox" id="modal-set-tacticalDrawing" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Nhận diện Khai Cuộc (60+ thế trận)</strong>
                    <small>Tự động phát hiện Thuận Pháo, Bình Phong Mã, Đơn Đề Mã...</small>
                  </span>
                  <input type="checkbox" id="modal-set-openingBook" />
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

            <!-- Nhóm 3: Trí Tuệ Nhân Tạo & Âm Thanh -->
            <div class="ziga-settings-group-card" style="grid-column: 1 / -1;">
              <div class="ziga-group-title">🧠 TRÍ TUỆ NHÂN TẠO & GIỌNG ĐỌC CẢNH BÁO</div>
              <div class="ziga-group-rows" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Thanh đo thế trận (Eval Bar)</strong>
                    <small>Thanh năng lượng hiển thị điểm ưu thế theo thời gian thực</small>
                  </span>
                  <input type="checkbox" id="modal-set-evalBar" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Gợi ý nước đi tối ưu (Best Move)</strong>
                    <small>Mũi tên phát quang vàng kim chỉ nước đi AI khuyến nghị</small>
                  </span>
                  <input type="checkbox" id="modal-set-bestMoveArrow" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Giọng đọc Tiếng Việt (Voice Announcer)</strong>
                    <small>Đọc to "Chiếu tướng!", "Bắt Xe!", "Cảnh báo sát cuộc!"</small>
                  </span>
                  <input type="checkbox" id="modal-set-voiceAnnouncer" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row">
                  <span class="ziga-setting-text">
                    <strong>Cảnh báo nhịp tim & đếm ngược khi hết giờ</strong>
                    <small>Tiếng đập thình thịch khi còn 15s và đếm số 5..4..3..2..1</small>
                  </span>
                  <input type="checkbox" id="modal-set-timerAlertVoice" />
                  <span class="ziga-switch-slider"></span>
                </label>

                <label class="ziga-setting-row" style="grid-column: 1 / -1;">
                  <span class="ziga-setting-text">
                    <strong>🎓 Gia Sư Cờ Tướng Đồng Hành (AI Mentor)</strong>
                    <small>Phân tích thế trận, nhận diện điểm yếu, tư vấn 3 kế sách & truyền thụ đạo cờ theo thời gian thực</small>
                  </span>
                  <input type="checkbox" id="modal-set-mentorCoach" />
                  <span class="ziga-switch-slider"></span>
                </label>

              </div>
            </div>

          </div>
        </div>

        <!-- TAB 2: Themes & Màu Sắc (Aura Colors) -->
        <div class="ziga-aura-tab-pane" id="ziga-modal-pane-themes" style="display:none;">
          <div class="ziga-aura-pane-section">
            <span class="ziga-pane-section-title">CHỌN NHANH CHỦ ĐỀ NEON LÀM SẴN (ÁP DỤNG NGAY LÊN BÀN CỜ)</span>
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
              <div class="ziga-presets-title-row">
                <span class="ziga-presets-title">✨ BỘ SƯU TẬP 22 MẪU AURA HD (CHỌN 1-CLICK HIỆN NGAY TRÊN BÀN CỜ)</span>
              </div>
              <span class="ziga-presets-subtitle">Bấm <strong>[🟢 Lượt Tôi]</strong>, <strong>[🔴 Đối Thủ]</strong> hoặc <strong>[⚡ Cả 2]</strong> để áp dụng trực tiếp lên bàn cờ mà không cần tải lại trang!</span>
              <div class="ziga-preset-filter-bar" id="ziga-preset-filter-bar">
                <button type="button" class="ziga-preset-filter-btn active" data-filter="all">Tất cả (22)</button>
                <button type="button" class="ziga-preset-filter-btn" data-filter="new">🔥 Mẫu Mới (17)</button>
                <button type="button" class="ziga-preset-filter-btn" data-filter="my">🟢 Hợp Lượt Tôi</button>
                <button type="button" class="ziga-preset-filter-btn" data-filter="opp">🔴 Hợp Đối Thủ</button>
              </div>
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
              <li><strong>Kích thước chuẩn:</strong> Ảnh vuông <code>256x256 px</code> (hoặc <code>128x128 px</code>).</li>
              <li><strong>Vùng an toàn:</strong> Tâm ảnh chính giữa, lòng trong rỗng (đường kính ~70-74%) để tôn mặt quân cờ gỗ.</li>
            </ul>
          </div>
        </div>

        <!-- Modal Footer (Tách riêng Reset Tính Năng & Reset Aura theo yêu cầu) -->
        <div class="ziga-aura-modal-footer">
          <div class="ziga-modal-reset-group">
            <button class="ziga-modal-btn secondary reset-features-btn" id="ziga-modal-btn-reset-features" type="button" title="Khôi phục mặc định các công cụ hỗ trợ (Giữ nguyên cài đặt Aura)">
              🔄 Reset Tính Năng
            </button>
            <button class="ziga-modal-btn secondary reset-aura-btn" id="ziga-modal-btn-reset-aura" type="button" title="Khôi phục mặc định riêng phần Màu sắc & Ảnh Aura (Giữ nguyên các tính năng khác)">
              ✨ Reset Riêng Aura
            </button>
          </div>
          <button class="ziga-modal-btn primary" id="ziga-modal-btn-save-confirm" type="button">
            💾 ĐÓNG & LƯU
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

    // Preset filter buttons
    const filterBar = document.getElementById('ziga-preset-filter-bar');
    if (filterBar) {
      filterBar.querySelectorAll('.ziga-preset-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentPresetFilter = btn.dataset.filter || 'all';
          filterBar.querySelectorAll('.ziga-preset-filter-btn').forEach(b => {
            b.classList.toggle('active', b === btn);
          });
          renderAuraPresetsGrid();
        });
      });
    }

    // Shortcut button in Features tab to jump directly to Aura Themes tab
    const gotoAuraBtn = document.getElementById('ziga-btn-goto-aura-tab');
    if (gotoAuraBtn) {
      gotoAuraBtn.addEventListener('click', () => {
        switchModalTab('images');
      });
    }

    // Bind all feature settings switches
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
          if (key === 'liveBoardAura' && typeof ZigaMod.reloadAuraTextures === 'function') {
            ZigaMod.reloadAuraTextures();
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
        applyLiveAuraSettings();
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
        applyLiveAuraSettings();
      });
    }

    // Animation Effect & Speed controls
    const animSelect = document.getElementById('ziga-modal-anim-select');
    const speedSlider = document.getElementById('ziga-modal-speed-slider');
    const speedVal = document.getElementById('ziga-modal-speed-val');
    const speedWrap = document.getElementById('ziga-modal-speed-wrap');

    if (animSelect) {
      animSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (tempCustomSettings) {
          tempCustomSettings.animation = val;
        }
        if (speedWrap) {
          speedWrap.style.display = (val === 'static' || val === 'pulse') ? 'none' : 'flex';
        }
        updateModalLivePreview();
        applyLiveAuraSettings();
      });
    }

    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (tempCustomSettings) {
          tempCustomSettings.spinSpeed = val;
        }
        if (speedVal) speedVal.textContent = val.toFixed(1) + 's';
        updateModalLivePreview();
        applyLiveAuraSettings();
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
        highlightActivePresets();
        applyLiveAuraSettings();
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
          highlightActivePresets();
          applyLiveAuraSettings();
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
        highlightActivePresets();
        applyLiveAuraSettings();
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
          highlightActivePresets();
          applyLiveAuraSettings();
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
              tempCustomSettings.presetMy = '';
              tempCustomSettings.customImageMy = ev.target.result;
              tempCustomSettings.mode = 'image';
            }
            updateThumbnailPreview('my', ev.target.result);
            updateModalLivePreview();
            highlightActivePresets();
            applyLiveAuraSettings();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (clearMy) {
      clearMy.addEventListener('click', () => {
        if (tempCustomSettings) {
          tempCustomSettings.presetMy = '';
          tempCustomSettings.customImageMy = '';
          if (!getResolvedPreviewImg('opp')) tempCustomSettings.mode = 'neon';
        }
        if (fileMy) fileMy.value = '';
        updateThumbnailPreview('my', '');
        updateModalLivePreview();
        highlightActivePresets();
        applyLiveAuraSettings();
      });
    }

    if (fileOpp) {
      fileOpp.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (tempCustomSettings) {
              tempCustomSettings.presetOpp = '';
              tempCustomSettings.customImageOpp = ev.target.result;
              tempCustomSettings.mode = 'image';
            }
            updateThumbnailPreview('opp', ev.target.result);
            updateModalLivePreview();
            highlightActivePresets();
            applyLiveAuraSettings();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (clearOpp) {
      clearOpp.addEventListener('click', () => {
        if (tempCustomSettings) {
          tempCustomSettings.presetOpp = '';
          tempCustomSettings.customImageOpp = '';
          if (!getResolvedPreviewImg('my')) tempCustomSettings.mode = 'neon';
        }
        if (fileOpp) fileOpp.value = '';
        updateThumbnailPreview('opp', '');
        updateModalLivePreview();
        highlightActivePresets();
        applyLiveAuraSettings();
      });
    }

    // 1. Reset ONLY Features button (preserves Aura settings 100%)
    const resetFeaturesBtn = document.getElementById('ziga-modal-btn-reset-features');
    if (resetFeaturesBtn) {
      resetFeaturesBtn.addEventListener('click', () => {
        const savedAura = tempCustomSettings
          ? Object.assign({}, tempCustomSettings)
          : Object.assign({}, (ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || ZigaMod.DEFAULT_SETTINGS.auraCustom);

        Object.keys(ZigaMod.DEFAULT_SETTINGS).forEach((key) => {
          if (key === 'auraCustom') return;
          ZigaMod.userSettings[key] = ZigaMod.DEFAULT_SETTINGS[key];
        });
        ZigaMod.userSettings.auraCustom = savedAura;
        ZigaMod.saveSettings();

        syncModalFeaturesCheckboxes();
        if (ZigaMod.applySettingsVisibility) {
          ZigaMod.applySettingsVisibility();
        }
        if (typeof ZigaMod.reloadAuraTextures === 'function') {
          ZigaMod.reloadAuraTextures();
        }
        ZigaMod.lastStateHash = '';

        const origText = resetFeaturesBtn.innerHTML;
        resetFeaturesBtn.innerHTML = '✅ Đã Reset Tính Năng!';
        resetFeaturesBtn.classList.add('reset-done');
        setTimeout(() => {
          resetFeaturesBtn.innerHTML = origText;
          resetFeaturesBtn.classList.remove('reset-done');
        }, 1400);
      });
    }

    // 2. Reset ONLY Aura button (preserves all other feature toggles 100%)
    const resetAuraBtn = document.getElementById('ziga-modal-btn-reset-aura');
    if (resetAuraBtn) {
      resetAuraBtn.addEventListener('click', () => {
        tempCustomSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS.auraCustom);
        ZigaMod.userSettings.auraCustom = Object.assign({}, tempCustomSettings);
        ZigaMod.saveSettings();

        syncModalControls();
        updateModalLivePreview();

        if (typeof ZigaMod.reloadAuraTextures === 'function') {
          ZigaMod.reloadAuraTextures();
        }
        ZigaMod.lastStateHash = '';

        const origText = resetAuraBtn.innerHTML;
        resetAuraBtn.innerHTML = '✅ Đã Reset Aura!';
        resetAuraBtn.classList.add('reset-done');
        setTimeout(() => {
          resetAuraBtn.innerHTML = origText;
          resetAuraBtn.classList.remove('reset-done');
        }, 1400);
      });
    }

    // Save and Close button
    const saveApplyBtn = document.getElementById('ziga-modal-btn-save-confirm');
    if (saveApplyBtn) {
      saveApplyBtn.addEventListener('click', () => {
        applyLiveAuraSettings();
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
          applyLiveAuraSettings();
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
   * Renders all 22 high-quality PNG presets in Tab 3 with filtering and 1-click live apply.
   */
  function renderAuraPresetsGrid() {
    const container = document.getElementById('ziga-modal-presets-container');
    if (!container) return;

    const presets = ZigaMod.PRESET_AURAS || [];
    if (!presets.length) {
      container.innerHTML = '<div style="color:#64748b; font-size:11px; padding:8px;">Chưa nạp được danh sách mẫu ảnh có sẵn.</div>';
      return;
    }

    // Update filter button counts dynamically
    const filterBar = document.getElementById('ziga-preset-filter-bar');
    if (filterBar) {
      const allBtn = filterBar.querySelector('[data-filter="all"]');
      const newBtn = filterBar.querySelector('[data-filter="new"]');
      if (allBtn) allBtn.textContent = `Tất cả (${presets.length})`;
      if (newBtn) {
        const newCount = presets.filter(p => p.isNew).length;
        newBtn.textContent = `🔥 Mẫu Mới (${newCount})`;
      }
    }

    const filtered = presets.filter((p) => {
      if (currentPresetFilter === 'new') return !!p.isNew;
      if (currentPresetFilter === 'my') return p.cat === 'my' || p.cat === 'both';
      if (currentPresetFilter === 'opp') return p.cat === 'opp' || p.cat === 'both';
      return true;
    });

    let html = '';
    filtered.forEach((p) => {
      const newBadge = p.isNew ? '<span class="ziga-preset-new-pill">MỚI</span>' : '';
      html += `
        <div class="ziga-preset-card" data-preset-id="${p.id}">
          <div class="ziga-preset-preview-wrap">
            <div class="ziga-mock-piece-preset">
              <div class="ziga-mock-preset-char">俥</div>
              <div class="ziga-preset-aura-circle" style="background-image: url('${p.base64}');"></div>
            </div>
          </div>
          <div class="ziga-preset-details">
            <div class="ziga-preset-name-row">
              <span class="ziga-preset-name">${p.title}</span>
              ${newBadge}
            </div>
            <div class="ziga-preset-badge ${p.cat}">${p.tag || ''}</div>
            <div class="ziga-preset-actions">
              <button class="ziga-preset-btn my" type="button" data-action="set-my" title="Gán mẫu này cho Lượt Tôi & hiển thị ngay trên bàn cờ">
                🟢 Lượt Tôi
              </button>
              <button class="ziga-preset-btn opp" type="button" data-action="set-opp" title="Gán mẫu này cho Lượt Đối Thủ & hiển thị ngay trên bàn cờ">
                🔴 Đối Thủ
              </button>
              <button class="ziga-preset-btn both" type="button" data-action="set-both" title="Gán mẫu này cho cả 2 lượt & hiển thị ngay">
                ⚡ Cả 2
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
          tempCustomSettings.presetMy = found.id;
          tempCustomSettings.customImageMy = found.base64;
          tempCustomSettings.mode = 'image';
          updateThumbnailPreview('my', found.base64);
        } else if (action === 'set-opp') {
          tempCustomSettings.presetOpp = found.id;
          tempCustomSettings.customImageOpp = found.base64;
          tempCustomSettings.mode = 'image';
          updateThumbnailPreview('opp', found.base64);
        } else if (action === 'set-both') {
          tempCustomSettings.presetMy = found.id;
          tempCustomSettings.customImageMy = found.base64;
          tempCustomSettings.presetOpp = found.id;
          tempCustomSettings.customImageOpp = found.base64;
          tempCustomSettings.mode = 'image';
          updateThumbnailPreview('my', found.base64);
          updateThumbnailPreview('opp', found.base64);
        }

        updateModalLivePreview();
        highlightActivePresets();
        highlightActiveThemeCard();
        applyLiveAuraSettings();
      });
    });

    highlightActivePresets();
  }

  function highlightActivePresets() {
    const container = document.getElementById('ziga-modal-presets-container');
    if (!container || !tempCustomSettings) return;

    const presets = ZigaMod.PRESET_AURAS || [];
    const myResolved = getResolvedPreviewImg('my');
    const oppResolved = getResolvedPreviewImg('opp');

    container.querySelectorAll('.ziga-preset-card').forEach((card) => {
      const pid = card.dataset.presetId;
      const p = presets.find(item => item.id === pid);
      if (!p) return;

      const isMy = tempCustomSettings.mode === 'image' &&
        (tempCustomSettings.presetMy === p.id || myResolved === p.base64);
      const isOpp = tempCustomSettings.mode === 'image' &&
        (tempCustomSettings.presetOpp === p.id || oppResolved === p.base64);

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

    // Animation Effect & Speed sync
    const animSelect = document.getElementById('ziga-modal-anim-select');
    const speedSlider = document.getElementById('ziga-modal-speed-slider');
    const speedVal = document.getElementById('ziga-modal-speed-val');
    const speedWrap = document.getElementById('ziga-modal-speed-wrap');

    const curAnim = (tempCustomSettings && tempCustomSettings.animation) || 'spin_pulse';
    const curSpeed = (tempCustomSettings && typeof tempCustomSettings.spinSpeed === 'number') ? tempCustomSettings.spinSpeed : 3.5;

    if (animSelect) animSelect.value = curAnim;
    if (speedSlider) speedSlider.value = curSpeed;
    if (speedVal) speedVal.textContent = curSpeed.toFixed(1) + 's';
    if (speedWrap) {
      speedWrap.style.display = (curAnim === 'static' || curAnim === 'pulse') ? 'none' : 'flex';
    }

    updateThumbnailPreview('my', getResolvedPreviewImg('my'));
    updateThumbnailPreview('opp', getResolvedPreviewImg('opp'));

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
    const curAnim = tempCustomSettings.animation || 'spin_pulse';
    const curSpeed = (typeof tempCustomSettings.spinSpeed === 'number') ? tempCustomSettings.spinSpeed : 3.5;
    const animClasses = ['anim-spin_pulse', 'anim-spin', 'anim-pulse', 'anim-heartbeat', 'anim-static'];

    [previewMy, previewOpp].forEach((el) => {
      if (!el) return;
      animClasses.forEach(c => el.classList.remove(c));
      el.classList.add(`anim-${curAnim}`);
      el.style.setProperty('--aura-speed', `${curSpeed}s`);
    });

    const myImg = getResolvedPreviewImg('my');
    const oppImg = getResolvedPreviewImg('opp');

    if (previewMy) {
      previewMy.style.setProperty('--aura-scale', curScale);
      if (tempCustomSettings.mode === 'image' && myImg) {
        previewMy.style.backgroundImage = `url(${myImg})`;
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
      if (tempCustomSettings.mode === 'image' && oppImg) {
        previewOpp.style.backgroundImage = `url(${oppImg})`;
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

    tempCustomSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS.auraCustom, current);

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
