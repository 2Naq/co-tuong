// src/storage.js - User settings, piece character formatter, and position/size persistence
(function (ZigaMod) {
  'use strict';

  let userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS);

  function resolveAuraImageData(customObj, side) {
    const c = customObj || (userSettings && userSettings.auraCustom) || {};
    const isMy = (side === 'my' || side === 'green');
    const presetId = isMy ? c.presetMy : c.presetOpp;
    const directData = isMy ? c.customImageMy : c.customImageOpp;

    // 1. Check preset ID first if PRESET_AURAS is loaded
    if (presetId && Array.isArray(ZigaMod.PRESET_AURAS)) {
      const found = ZigaMod.PRESET_AURAS.find(item => item.id === presetId);
      if (found && found.base64) return found.base64;
    }

    // 2. Fallback to direct base64 data URL (e.g. user-uploaded PNG)
    if (directData && typeof directData === 'string' && directData.startsWith('data:image')) {
      return directData;
    }

    return '';
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem('ziga_mod_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS, parsed);
        if (parsed.auraCustom) {
          userSettings.auraCustom = Object.assign({}, ZigaMod.DEFAULT_SETTINGS.auraCustom, parsed.auraCustom);
        }
      }
    } catch (e) { }
  }

  function saveSettings() {
    try {
      localStorage.setItem('ziga_mod_settings', JSON.stringify(userSettings));
    } catch (e) {
      // QuotaExceededError fallback: if presetMy/presetOpp is used, omit duplicate base64 from localStorage
      try {
        const clone = Object.assign({}, userSettings);
        if (clone.auraCustom) {
          clone.auraCustom = Object.assign({}, clone.auraCustom);
          if (clone.auraCustom.presetMy) clone.auraCustom.customImageMy = '';
          if (clone.auraCustom.presetOpp) clone.auraCustom.customImageOpp = '';
        }
        localStorage.setItem('ziga_mod_settings', JSON.stringify(clone));
      } catch (err2) {
        console.warn('[AN Mod] Failed to save settings to localStorage:', err2);
      }
    }
  }

  // Load initially
  loadSettings();

  function getPieceChar(type, color) {
    const def = ZigaMod.PIECE_DEFS[type] || { name: 'Quân', redChar: '?', blackChar: '?', short: '?' };
    if (userSettings.vietnameseLabels) {
      return def.short;
    }
    return color === 0 ? def.redChar : def.blackChar;
  }

  function loadSavedPosition() {
    try {
      const saved = localStorage.getItem('ziga_mod_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch (e) { }
    return null;
  }

  function savePosition(x, y) {
    try {
      if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
        localStorage.setItem('ziga_mod_pos', JSON.stringify({ x: Math.round(x), y: Math.round(y) }));
      }
    } catch (e) { }
  }

  function loadSavedSize() {
    try {
      const saved = localStorage.getItem('ziga_mod_size');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.w >= 200 && parsed.h >= 100) {
          return {
            width: parsed.w,
            height: parsed.h,
            bodyMaxHeight: parsed.h
          };
        }
      }
    } catch (e) { }
    return null;
  }

  function saveSize(w, h) {
    try {
      if (w && h) {
        localStorage.setItem('ziga_mod_size', JSON.stringify({ w: Math.round(w), h: Math.round(h) }));
      }
    } catch (e) { }
  }

  // Export to namespace
  ZigaMod.getUserSettings = function () { return userSettings; };
  ZigaMod.setUserSettings = function (newSettings) { userSettings = newSettings; };
  ZigaMod.loadSettings = loadSettings;
  ZigaMod.saveSettings = saveSettings;
  ZigaMod.resolveAuraImageData = resolveAuraImageData;
  ZigaMod.getPieceChar = getPieceChar;
  ZigaMod.loadSavedPosition = loadSavedPosition;
  ZigaMod.savePosition = savePosition;
  ZigaMod.loadSavedSize = loadSavedSize;
  ZigaMod.saveSize = saveSize;
  ZigaMod.loadSavedWidgetSize = loadSavedSize;
  ZigaMod.saveWidgetSize = saveSize;

  // Convenient direct reference
  Object.defineProperty(ZigaMod, 'userSettings', {
    get: function () { return userSettings; },
    set: function (val) { userSettings = val; },
    configurable: true
  });

})(window.ZigaMod = window.ZigaMod || {});
