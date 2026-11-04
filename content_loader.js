// content_loader.js - Bridge script to inject CSS and React/shadcn bundle into MAIN world & neutralize ads
(function() {
  // Prevent running inside ad iframes or Google Vignette subframes
  if (window.top !== window.self) return;

  console.log('[Ziga Mod] Content loader initializing in top frame (React + Tailwind + shadcn/ui)...');

  // Expose extension assets to main page context via documentElement dataset
  try {
    document.documentElement.dataset.zigaLogoUrl = chrome.runtime.getURL('icons/favicon.svg');
    document.documentElement.dataset.zigaExtensionUrl = chrome.runtime.getURL('');
  } catch (e) {}

  // Inject CSS (Base Overlay + Compiled Tailwind/shadcn utilities)
  const link = document.createElement('link');
  link.id = 'ziga-mod-overlay-css';
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('styles/overlay.css');
  link.onerror = function() {
    this.href = chrome.runtime.getURL('overlay.css');
  };
  (document.head || document.documentElement).appendChild(link);

  function ensureStylesheetLastInHead() {
    if (document.head && link.parentNode !== document.head) {
      document.head.appendChild(link);
    } else if (document.head && document.head.lastElementChild !== link) {
      document.head.appendChild(link);
    }
  }
  document.addEventListener('DOMContentLoaded', ensureStylesheetLastInHead);
  window.addEventListener('load', ensureStylesheetLastInHead);

  // Inject compiled React + shadcn/ui + 18 modules IIFE bundle into MAIN world
  function injectBundle() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('dist/injected.js');
    script.onload = function() {
      console.log('[Ziga Mod] React + Tailwind + shadcn/ui bundle loaded into MAIN world successfully.');
      this.remove();
    };
    script.onerror = function() {
      console.warn('[Ziga Mod] Falling back to root injected.js...');
      const fallbackScript = document.createElement('script');
      fallbackScript.src = chrome.runtime.getURL('injected.js');
      fallbackScript.onload = function() { this.remove(); };
      (document.head || document.documentElement).appendChild(fallbackScript);
    };
    (document.head || document.documentElement).appendChild(script);
  }

  injectBundle();

  // Relay ChessDB Cloud API queries across Main world and Isolated Content Script (CORS-free via host_permissions)
  window.addEventListener('message', async (event) => {
    if (event.source !== window || !event.data || event.data.type !== 'ZIGA_CHESSDB_FETCH') return;
    const { id, url } = event.data;
    try {
      const response = await fetch(url);
      const text = await response.text();
      window.postMessage({ type: 'ZIGA_CHESSDB_RESPONSE', id, text, success: true }, '*');
    } catch (err) {
      window.postMessage({ type: 'ZIGA_CHESSDB_RESPONSE', id, error: err.message, success: false }, '*');
    }
  });

  // Active Ad Neutralizer in Content Script
  function cleanObstructingAds() {
    const adSelectors = [
      'ins.adsbygoogle',
      '.google-auto-placed',
      'iframe[id^="aswift"]',
      'iframe[name^="aswift"]',
      'div[id^="aswift"]',
      'div[id^="google_ads"]',
      'iframe[id^="google_ads"]',
      '.ads-frame',
      '[id*="banner_left"]',
      '[id*="banner_right"]',
      '[class*="banner-left"]',
      '[class*="banner-right"]'
    ];

    for (let i = 0; i < adSelectors.length; i++) {
      const nodes = document.querySelectorAll(adSelectors[i]);
      for (let j = 0; j < nodes.length; j++) {
        const el = nodes[j];
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('z-index', '-9999', 'important');
        el.style.setProperty('width', '0', 'important');
        el.style.setProperty('height', '0', 'important');
      }
    }

    // Check fixed position children on body that aren't the game or our widget
    if (document.body) {
      const children = document.body.children;
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (!el || 
            el.id === 'ziga-mod-widget' || 
            el.id === 'ziga-sandbox-modal' || 
            el.id === 'ziga-react-settings-host' ||
            (el.id && el.id.startsWith('ziga-')) ||
            el.classList.contains('ziga-shadcn-root') ||
            el.classList.contains('ziga-sandbox-overlay') || 
            el.classList.contains('ziga-mod-container') ||
            el.hasAttribute('data-base-ui-portal') ||
            el.hasAttribute('data-slot') ||
            el.querySelector('[data-slot]') ||
            el.id === 'gameCanvas' || 
            el.id === 'Cocos2dGameContainer' || 
            el.classList.contains('modal')) {
          continue;
        }
        try {
          const comp = window.getComputedStyle(el);
          if (comp.position === 'fixed') {
            if (el.querySelector('iframe') || el.querySelector('ins') || el.tagName === 'IFRAME' || el.tagName === 'INS' || (el.className && typeof el.className === 'string' && el.className.includes('google')) || (comp.zIndex && Number(comp.zIndex) > 1000)) {
              el.style.setProperty('display', 'none', 'important');
              el.style.setProperty('z-index', '-9999', 'important');
            }
          }
        } catch (e) {}
      }
    }

    // Keep HUD at top of game canvas, but below Base UI portals/modals
    const widget = document.getElementById('ziga-mod-widget');
    const sbModal = document.getElementById('ziga-sandbox-modal');
    if (widget) {
      widget.style.setProperty('z-index', '2147483600', 'important');
      widget.style.setProperty('position', 'fixed', 'important');
    }
    if (sbModal) {
      sbModal.style.setProperty('z-index', '2147483647', 'important');
    }
  }

  // Periodic scan
  setInterval(cleanObstructingAds, 250);

  // MutationObserver for instant removal
  const obs = new MutationObserver(() => {
    cleanObstructingAds();
  });

  const target = document.body || document.documentElement;
  if (target) {
    obs.observe(target, { childList: true, subtree: true });
  }
  document.addEventListener('DOMContentLoaded', () => {
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
    cleanObstructingAds();
  });
})();
