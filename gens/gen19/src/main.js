import { createApp } from './runtime/app.js';

(async () => {
  const app = createApp({
    canvas: document.getElementById('canvas'),
    telemetryEl: document.getElementById('telemetry'),
    debugEl: document.getElementById('debugLog'),
    devMenuEl: document.getElementById('devMenu'),
    devContentEl: document.getElementById('devContent'),
    devResetBtn: document.getElementById('devReset'),
    devCloseBtn: document.getElementById('devClose'),
    menuBlockerEl: document.getElementById('menuBlocker')
  });

  await app.init();
  app.start();
})();
