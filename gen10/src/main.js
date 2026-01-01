import { Engine } from './Engine.js';
import { installGlobalDebugging } from './utils/Logger.js';

const debug = installGlobalDebugging({
  debugLogElement: document.getElementById('debugLog'),
});

async function bootstrap() {
  const appEl = document.getElementById('app');
  const blockerEl = document.getElementById('blocker');
  const startBtn = document.getElementById('startBtn');

  const engine = new Engine({
    container: appEl,
    telemetryEl: document.getElementById('telemetry'),
    blockerEl,
    startBtn,
    debug,
  });

  await engine.init();
  engine.start();
}

bootstrap().catch((err) => {
  debug.error('Bootstrap failed', err);
});
