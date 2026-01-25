import { Engine } from './Engine.js';

try {
  const engine = new Engine();
  engine.start();
} catch (err) {
  const debug = document.getElementById('debug-log');
  debug.style.display = 'block';
  debug.innerText = `Fatal: ${err.message}`;
}
