// content_loader.js - Bridge script to inject CSS and JS into MAIN world & neutralize ads
(function() {
  // Prevent running inside ad iframes or Google Vignette subframes
  if (window.top !== window.self) return;

  console.log('[Ziga Mod] Content loader initializing in top frame...');

  // Expose extension assets to main page context via documentElement dataset
  try {
    document.documentElement.dataset.zigaLogoUrl = chrome.runtime.getURL('icons/favicon.svg');
    document.documentElement.dataset.zigaExtensionUrl = chrome.runtime.getURL('');
  } catch (e) {}

  // Inject CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('overlay.css');
  (document.head || document.documentElement).appendChild(link);

  // Modular scripts to inject sequentially into MAIN world
  const MODULES = [
    'src/constants.js',
    'src/storage.js',
    'src/threat_scanner.js',
    'src/coup_tracker.js',
    'src/tactical_sandbox.js',
    'src/engine_hook.js',
    'src/ui.js',
    'src/main.js'
  ];

  function fallbackToInjected() {
    if (window.__zigaModInjectedFallback) return;
    window.__zigaModInjectedFallback = true;
    console.warn('[Ziga Mod] Falling back to unified injected.js bundle...');
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.onload = function() { this.remove(); };
    (document.head || document.documentElement).appendChild(script);
  }

  function injectModules(index) {
    if (index >= MODULES.length) {
      console.log('[Ziga Mod] All modular scripts loaded into page context successfully.');
      return;
    }
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(MODULES[index]);
    script.onload = function() {
      this.remove();
      injectModules(index + 1);
    };
    script.onerror = function(err) {
      console.error('[Ziga Mod] Failed to load module:', MODULES[index], err);
      fallbackToInjected();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  injectModules(0);

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
            (el.id && el.id.startsWith('ziga-')) ||
            el.classList.contains('ziga-sandbox-overlay') || 
            el.classList.contains('ziga-mod-container') ||
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

    // Keep HUD at top if sandbox is not open
    const widget = document.getElementById('ziga-mod-widget');
    const sbModal = document.getElementById('ziga-sandbox-modal');
    if (widget) {
      widget.style.setProperty('z-index', '2147483647', 'important');
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
