import { Engine } from './core/engine.js';
import { createDebugLogger } from './core/debug.js';
import { GlobalConfig } from './core/config.js';

const canvas = document.getElementById('render-canvas');
const loadingOverlay = document.getElementById('loading-overlay');

const logger = createDebugLogger(document.getElementById('debug-log'));

async function start() {
  try {
    const engine = new Engine({ canvas, logger, config: GlobalConfig });
    await engine.init();
    loadingOverlay.classList.add('hidden');
    engine.run();
    window.__solarEngine = engine;
  } catch (err) {
    loadingOverlay.textContent = 'Failed to start simulation. See debug log.';
    logger.error('Engine initialization failed', err);
  }
}

window.addEventListener('load', start);
