// Main engine loop and module orchestration

import { Config } from "./config.js";
import { Debug } from "./debug.js";

export class Engine {
  constructor(system) {
    this.system = system; // { init, update, render, shutdown }
    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
  }

  async start() {
    try {
      await this.system.init();
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    } catch (e) {
      Debug.error(`Engine initialization failed: ${e.message || e}`);
      console.error(e);
    }
  }

  loop(now) {
    if (!this.running) return;
    const dtMs = now - this.lastTime;
    this.lastTime = now;

    let dt = dtMs / 1000;
    dt *= Config.timeScale;

    const fixed = Config.fixedTimeStep;
    this.accumulator += dt;
    let subSteps = 0;

    try {
      while (this.accumulator >= fixed && subSteps < Config.maxSubSteps) {
        this.system.update(fixed);
        this.accumulator -= fixed;
        subSteps++;
      }

      this.system.render(dtMs / 1000);
    } catch (e) {
      this.running = false;
      Debug.error(`Engine loop failed: ${e.message || e}`);
      console.error(e);
      return;
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
    if (this.system.shutdown) {
      this.system.shutdown();
    }
  }
}
