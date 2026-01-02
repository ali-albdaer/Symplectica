import { Config } from '../core/config.js';
import { State } from '../core/state.js';

export function initDebugLog() {
  const el = document.getElementById('debug-log');
  const buffer = [];
  const maxLines = 200;

  const overlay = {
    el,
    addLine(msg) {
      const time = new Date().toISOString().split('T')[1].replace('Z', '');
      buffer.push(`[${time}] ${msg}`);
      while (buffer.length > maxLines) buffer.shift();
      el.textContent = buffer.join('\n');
    }
  };

  window.__DEBUG_OVERLAY__ = overlay;
  State.ui.debugLog = overlay;

  const origError = console.error.bind(console);
  const origWarn = console.warn.bind(console);

  console.error = (...args) => {
    origError(...args);
    if (Config.debug.logToOverlay) overlay.addLine('[error] ' + args.map(String).join(' '));
  };

  console.warn = (...args) => {
    origWarn(...args);
    if (Config.debug.logToOverlay) overlay.addLine('[warn] ' + args.map(String).join(' '));
  };
}

export function logError(prefix, error) {
  const msg = `${prefix}: ${error && error.stack ? error.stack : error}`;
  if (window.__DEBUG_OVERLAY__) {
    window.__DEBUG_OVERLAY__.addLine(msg);
  }
}
