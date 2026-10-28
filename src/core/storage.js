// src/storage.js - User settings, piece character formatter, and position/size persistence
(function (ZigaMod) {
  'use strict';

  let userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS);

  function loadSettings() {
    try {
      const saved = localStorage.getItem('ziga_mod_settings');
      if (saved) {
        userSettings = Object.assign({}, ZigaMod.DEFAULT_SETTINGS, JSON.parse(saved));
      }
    } catch (e) { }
  }

  function saveSettings() {
    try {
      localStorage.setItem('ziga_mod_settings', JSON.stringify(userSettings));
    } catch (e) { }
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
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  }

  function savePosition(x, y) {
    try {
      localStorage.setItem('ziga_mod_pos', JSON.stringify({ x, y }));
    } catch (e) { }
  }

  function loadSavedSize() {
    try {
      const saved = localStorage.getItem('ziga_mod_size');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  }

  function saveSize(w, h) {
    try {
      localStorage.setItem('ziga_mod_size', JSON.stringify({ w, h }));
    } catch (e) { }
  }

  // Export to namespace
  ZigaMod.getUserSettings = function () { return userSettings; };
  ZigaMod.setUserSettings = function (newSettings) { userSettings = newSettings; };
  ZigaMod.loadSettings = loadSettings;
  ZigaMod.saveSettings = saveSettings;
  ZigaMod.getPieceChar = getPieceChar;
  ZigaMod.loadSavedPosition = loadSavedPosition;
  ZigaMod.savePosition = savePosition;
  ZigaMod.loadSavedSize = loadSavedSize;
  ZigaMod.saveSize = saveSize;

  // Convenient direct reference
  Object.defineProperty(ZigaMod, 'userSettings', {
    get: function () { return userSettings; },
    set: function (val) { userSettings = val; },
    configurable: true
  });

})(window.ZigaMod = window.ZigaMod || {});
