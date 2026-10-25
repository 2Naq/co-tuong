// content_loader.js - Bridge script to inject CSS and JS into MAIN world
(function() {
  console.log('[Ziga Mod] Content loader initializing...');

  // Inject CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('overlay.css');
  (document.head || document.documentElement).appendChild(link);

  // Inject MAIN world script
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    console.log('[Ziga Mod] Injected script loaded into page context.');
    this.remove(); // Clean up script tag
  };
  (document.head || document.documentElement).appendChild(script);
})();
