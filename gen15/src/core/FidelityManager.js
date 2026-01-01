export class FidelityManager {
  constructor({ renderer, config, eventBus, THREE }) {
    this.renderer = renderer;
    this.config = config;
    this.eventBus = eventBus;
    this.level = config.defaultFidelity || "medium";
    this.THREE = THREE;
  }

  apply(level) {
    if (!this.config.fidelityLevels[level]) return;
    this.level = level;
    const settings = this.config.fidelityLevels[level];
    if (this.renderer) {
      this.renderer.setPixelRatio(settings.rendererPixelRatio);
      this.renderer.shadowMap.enabled = true;
      if (this.THREE) {
        this.renderer.shadowMap.type = this.THREE.PCFSoftShadowMap;
      }
      this.renderer.shadowMap.needsUpdate = true;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    this.eventBus?.emit("fidelity:changed", { level, settings });
  }
}
