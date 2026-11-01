// src/ui/ui.js - React + Tailwind CSS v4 + shadcn/ui (base-nova) HUD Overlay & Drag/Resize Controller
import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { HudWidget } from '../components/HudWidget/HudWidget';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { uiStore } from '../lib/ui_store';

(function (ZigaMod) {
  'use strict';

  ZigaMod.widgetEl = null;
  ZigaMod.uiStore = uiStore;
  let hudRoot = null;

  function applySettingsVisibility() {
    uiStore.setState((prev) => ({
      settingsVersion: (prev.settingsVersion || 0) + 1
    }));
  }

  function getSavedThemeMode() {
    try {
      const saved = localStorage.getItem('ziga_xiangqi_theme_mode');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return 'dark';
  }

  function createOverlay() {
    if (document.getElementById('ziga-mod-widget')) {
      ZigaMod.widgetEl = document.getElementById('ziga-mod-widget');
      return ZigaMod.widgetEl;
    }

    const initialTheme = getSavedThemeMode();
    uiStore.setState({ themeMode: initialTheme });
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    const widgetEl = document.createElement('div');
    widgetEl.id = 'ziga-mod-widget';
    widgetEl.className = `ziga-shadcn-root fixed z-[2147483600] min-w-[270px] max-w-[750px] overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-2xl font-sans select-none [&.minimized]:w-auto [&.minimized]:min-w-0 ${
      initialTheme === 'dark' ? 'dark' : ''
    }`;

    // Restore saved widget dimensions and position
    const savedSize = (ZigaMod.loadSavedSize || ZigaMod.loadSavedWidgetSize)
      ? (ZigaMod.loadSavedSize || ZigaMod.loadSavedWidgetSize)()
      : null;
    const initialWidth =
      savedSize && savedSize.width >= 270 && savedSize.width <= 750
        ? savedSize.width
        : 320;
    widgetEl.style.width = initialWidth + 'px';

    const savedPos = ZigaMod.loadSavedPosition ? ZigaMod.loadSavedPosition() : null;
    if (
      savedPos &&
      typeof savedPos.x === 'number' &&
      typeof savedPos.y === 'number' &&
      (savedPos.x > 10 || savedPos.y > 10)
    ) {
      const maxLeft = Math.max(0, window.innerWidth - initialWidth - 4);
      const maxTop = Math.max(0, window.innerHeight - 100 - 4);
      const safeLeft = Math.min(maxLeft, Math.max(4, savedPos.x));
      const safeTop = Math.min(maxTop, Math.max(4, savedPos.y));
      widgetEl.style.left = safeLeft + 'px';
      widgetEl.style.top = safeTop + 'px';
      widgetEl.style.right = 'auto';
    } else {
      // Default initial position: Top-Right corner
      widgetEl.style.top = '16px';
      widgetEl.style.right = '16px';
      widgetEl.style.left = 'auto';
    }

    if (!document.body) return null;
    document.body.appendChild(widgetEl);
    ZigaMod.widgetEl = widgetEl;

    hudRoot = createRoot(widgetEl);
    flushSync(() => {
      hudRoot.render(
        <ErrorBoundary>
          <HudWidget />
        </ErrorBoundary>
      );
    });

    // Restore body max height if saved
    const bodyEl = document.getElementById('ziga-mod-body');
    if (
      savedSize &&
      savedSize.bodyMaxHeight &&
      bodyEl &&
      savedSize.bodyMaxHeight >= 150
    ) {
      bodyEl.style.maxHeight = savedSize.bodyMaxHeight + 'px';
    }

    // Isolate clicks from #gameCanvas WITHOUT blocking mouseup/pointerup from reaching window
    ['mousedown', 'click', 'dblclick', 'contextmenu'].forEach((evtName) => {
      widgetEl.addEventListener(evtName, (e) => {
        e.stopPropagation();
      });
    });

    // Isolate mouse wheel so scrolling inside HUD never scrolls the outer webpage (zigavn.com)
    widgetEl.addEventListener(
      'wheel',
      (e) => {
        e.stopPropagation();
        const bodyEl = document.getElementById('ziga-mod-body');

        // If widget is minimized or body not available, prevent default page scroll
        if (!bodyEl || widgetEl.classList.contains('minimized')) {
          e.preventDefault();
          return;
        }

        const isScrollable = bodyEl.scrollHeight > bodyEl.clientHeight;
        if (!isScrollable) {
          e.preventDefault();
          return;
        }

        const isOverBody = e.target && bodyEl.contains(e.target);
        if (!isOverBody) {
          // Cursor is on header, buttons, or border: scroll the body directly & prevent window scroll
          bodyEl.scrollTop += e.deltaY;
          e.preventDefault();
          return;
        }

        // Cursor is inside bodyEl: prevent scroll chaining when reaching boundaries
        const delta = e.deltaY;
        const atTop = bodyEl.scrollTop <= 0 && delta < 0;
        const atBottom =
          bodyEl.scrollTop + bodyEl.clientHeight >= bodyEl.scrollHeight - 1 && delta > 0;
        if (atTop || atBottom) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    setupDragAndResize(widgetEl);
    return widgetEl;
  }

  function setupDragAndResize(widgetEl) {
    let isDragging = false;
    let hasMovedDuringDrag = false;
    let startX = 0,
      startY = 0,
      initialLeft = 0,
      initialTop = 0;

    let isResizing = false;
    let resizeMode = '';
    let resizeStartX = 0,
      resizeStartY = 0;
    let startWidth = 320,
      startBodyMaxH = 560;

    function finishDragAndResize() {
      if (!isDragging && !isResizing) return;

      document.body.classList.remove('ziga-is-dragging-or-resizing');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      if (isResizing) {
        isResizing = false;
        resizeMode = '';
        const finalW = parseInt(widgetEl.style.width, 10) || 320;
        const bEl = document.getElementById('ziga-mod-body');
        const finalH = bEl ? parseInt(bEl.style.maxHeight, 10) || 560 : 560;
        if (ZigaMod.saveSize) {
          ZigaMod.saveSize(finalW, finalH);
        }
        if (ZigaMod.saveWidgetSize) {
          ZigaMod.saveWidgetSize(finalW, finalH);
        }
      }
      if (isDragging) {
        isDragging = false;
        if (hasMovedDuringDrag) {
          widgetEl.__zigaJustDragged = true;
          setTimeout(() => {
            widgetEl.__zigaJustDragged = false;
          }, 120);
        }
        // Persist dragged position to localStorage
        const curLeft = parseInt(widgetEl.style.left, 10);
        const curTop = parseInt(widgetEl.style.top, 10);
        if (!isNaN(curLeft) && !isNaN(curTop)) {
          if (ZigaMod.savePosition) {
            ZigaMod.savePosition(curLeft, curTop);
          }
        }
      }
    }

    function startWidgetDrag(e) {
      if (e.button !== 0) return;
      if (
        e.target.closest('button') ||
        e.target.closest('input') ||
        e.target.closest('label') ||
        e.target.closest('[data-slot="button"]')
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      hasMovedDuringDrag = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = widgetEl.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      widgetEl.style.right = 'auto';
      widgetEl.style.left = initialLeft + 'px';
      widgetEl.style.top = initialTop + 'px';
      document.body.classList.add('ziga-is-dragging-or-resizing');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    const dragHandle = document.getElementById('ziga-mod-drag-handle');
    if (dragHandle) {
      dragHandle.addEventListener('mousedown', startWidgetDrag);
    }

    widgetEl.addEventListener('mousedown', (e) => {
      if (widgetEl.classList.contains('minimized')) {
        startWidgetDrag(e);
      }
    });

    function initResize(mode, e) {
      if (e.button !== 0) return;
      if (widgetEl.classList.contains('minimized')) return;
      e.preventDefault();
      e.stopPropagation();

      isResizing = true;
      resizeMode = mode;
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;

      const rect = widgetEl.getBoundingClientRect();
      startWidth = rect.width;
      const bEl = document.getElementById('ziga-mod-body');
      const currentMaxH = bEl ? parseInt(window.getComputedStyle(bEl).maxHeight, 10) : 560;
      startBodyMaxH = isNaN(currentMaxH) ? bEl?.getBoundingClientRect().height || 560 : currentMaxH;

      widgetEl.style.right = 'auto';
      widgetEl.style.left = rect.left + 'px';
      widgetEl.style.top = rect.top + 'px';
      document.body.classList.add('ziga-is-dragging-or-resizing');
      document.body.style.userSelect = 'none';
      document.body.style.cursor =
        mode === 'right' ? 'ew-resize' : mode === 'bottom' ? 'ns-resize' : 'nwse-resize';
    }

    const cornerResizer = document.getElementById('ziga-resize-corner');
    const rightResizer = document.getElementById('ziga-resize-edge-r');
    const bottomResizer = document.getElementById('ziga-resize-edge-b');

    if (cornerResizer) cornerResizer.addEventListener('mousedown', (e) => initResize('corner', e));
    if (rightResizer) rightResizer.addEventListener('mousedown', (e) => initResize('right', e));
    if (bottomResizer) bottomResizer.addEventListener('mousedown', (e) => initResize('bottom', e));

    function handleMove(e) {
      if (!isDragging && !isResizing) return;

      // Hardware button state failsafe: if left mouse button is no longer held down, terminate immediately
      if (typeof e.buttons === 'number' && (e.buttons & 1) === 0) {
        finishDragAndResize();
        return;
      }

      if (isResizing) {
        const dx = e.clientX - resizeStartX;
        const dy = e.clientY - resizeStartY;
        const bEl = document.getElementById('ziga-mod-body');

        if (resizeMode === 'right' || resizeMode === 'corner') {
          const newW = Math.max(
            270,
            Math.min(Math.min(750, window.innerWidth - 20), startWidth + dx)
          );
          widgetEl.style.width = Math.round(newW) + 'px';
        }
        if ((resizeMode === 'bottom' || resizeMode === 'corner') && bEl) {
          const newH = Math.max(160, Math.min(window.innerHeight - 100, startBodyMaxH + dy));
          bEl.style.maxHeight = Math.round(newH) + 'px';
        }
        return;
      }

      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          hasMovedDuringDrag = true;
        }
        const maxLeft = Math.max(0, window.innerWidth - widgetEl.offsetWidth - 4);
        const maxTop = Math.max(0, window.innerHeight - widgetEl.offsetHeight - 4);
        const newLeft = Math.min(maxLeft, Math.max(4, initialLeft + dx));
        const newTop = Math.min(maxTop, Math.max(4, initialTop + dy));
        widgetEl.style.left = newLeft + 'px';
        widgetEl.style.top = newTop + 'px';
      }
    }

    // Capture phase (true) ensures mousemove/pointermove always fire even over #gameCanvas
    window.addEventListener('mousemove', handleMove, true);
    window.addEventListener('pointermove', handleMove, true);
    window.addEventListener('mouseup', finishDragAndResize, true);
    window.addEventListener('pointerup', finishDragAndResize, true);
    window.addEventListener('blur', finishDragAndResize);
    document.addEventListener('mouseleave', finishDragAndResize);
  }

  function updateMaterialTooltipLive(mat, myName, oppName) {
    uiStore.setState({
      material: mat || null,
      ...(myName ? { myName } : {}),
      ...(oppName ? { oppName } : {})
    });
  }

  function updateTacticalHud(piece, targets, defended) {
    uiStore.setState({
      tactical: {
        piece: piece || null,
        targets: targets || [],
        defended: defended || []
      }
    });
  }

  function clearTacticalHud() {
    uiStore.setState({
      tactical: {
        piece: null,
        targets: [],
        defended: []
      }
    });
  }

  // Export to namespace
  ZigaMod.applySettingsVisibility = applySettingsVisibility;
  ZigaMod.createOverlay = createOverlay;
  ZigaMod.updateMaterialTooltipLive = updateMaterialTooltipLive;
  ZigaMod.updateTacticalHud = updateTacticalHud;
  ZigaMod.clearTacticalHud = clearTacticalHud;
})(window.ZigaMod = window.ZigaMod || {});
