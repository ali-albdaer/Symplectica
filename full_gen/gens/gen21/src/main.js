// Entry point

import { Engine } from "./core/engine.js";
import { Debug } from "./core/debug.js";
import { createGameSystem } from "./system.js";

(async function bootstrap() {
  try {
    const system = await createGameSystem();
    const engine = new Engine(system);
    await engine.start();
  } catch (e) {
    Debug.error(`Bootstrap failed: ${e.message || e}`);
    console.error(e);
  }
})();
