// src/ui/settings_modal.js - React + Tailwind CSS + shadcn/ui Settings & Aura Studio Modal
import {
  mountSettingsModal,
  openReactSettingsModal,
  closeReactSettingsModal
} from '../components/SettingsModal/SettingsModal';

(function (ZigaMod) {
  'use strict';

  function createSettingsModal() {
    mountSettingsModal();
    return document.getElementById('ziga-settings-modal');
  }

  function openSettingsModal(initialTab) {
    openReactSettingsModal(initialTab || 'features');
  }

  function closeSettingsModal() {
    closeReactSettingsModal();
  }

  function syncSettingsModalUI() {
    mountSettingsModal();
  }

  ZigaMod.createSettingsModal = createSettingsModal;
  ZigaMod.openSettingsModal = openSettingsModal;
  ZigaMod.closeSettingsModal = closeSettingsModal;
  ZigaMod.syncSettingsModalUI = syncSettingsModalUI;
})(window.ZigaMod = window.ZigaMod || {});
