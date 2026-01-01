export class DevConsole {
  constructor({ config, eventBus, mountId = "dev-console", pointerLockManager }) {
    this.config = config;
    this.eventBus = eventBus;
    this.mount = document.getElementById(mountId);
    this.pointerLockManager = pointerLockManager;
    this.visible = false;
    this.bindHotkey();
    this.render();
  }

  bindHotkey() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "/") {
        event.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      this.pointerLockManager?.release();
      this.mount.style.display = "block";
      this.mount.innerHTML = this.buildPanelHtml();
      this.attachHandlers();
    } else {
      this.mount.style.display = "none";
    }
  }

  render() {
    if (!this.mount) return;
    this.mount.innerHTML = this.buildPanelHtml();
    this.attachHandlers();
  }

  buildPanelHtml() {
    const globalSection = `
      <section>
        <h3>Globals</h3>
        <label>Time Scale <input data-key="timeScale" type="number" step="0.1" value="${this.config.timeScale}" /></label>
        <label>Gravity G <input data-key="gravityConstant" type="number" step="0.0001" value="${this.config.gravityConstant}" /></label>
      </section>`;
    const bodiesSection = this.config.celestialBodies
      .map((body, index) => `
        <section data-index="${index}">
          <h4>${body.name}</h4>
          <label>Mass <input data-field="mass" type="number" step="0.1" value="${body.mass}" /></label>
          <label>Radius <input data-field="radius" type="number" step="0.1" value="${body.radius}" /></label>
          ${body.orbitalRadius ? `<label>Orbit Radius <input data-field="orbitalRadius" type="number" step="0.1" value="${body.orbitalRadius}" /></label>` : ""}
          ${body.orbitalSpeed ? `<label>Orbit Speed <input data-field="orbitalSpeed" type="number" step="0.01" value="${body.orbitalSpeed}" /></label>` : ""}
        </section>
      `)
      .join("");
    return `
      <div style="display:flex;flex-direction:column;gap:1rem;max-height:70vh;overflow-y:auto;">
        ${globalSection}
        <hr />
        ${bodiesSection}
        <button id="console-close">Close</button>
      </div>
    `;
  }

  attachHandlers() {
    if (!this.mount) return;
    this.mount.querySelectorAll("input[data-key]").forEach((input) => {
      input.addEventListener("change", (event) => {
        const key = event.target.dataset.key;
        this.config[key] = parseFloat(event.target.value);
        this.eventBus?.emit("config:updated", { key, value: this.config[key] });
      });
    });

    this.mount.querySelectorAll("section[data-index] input").forEach((input) => {
      input.addEventListener("change", (event) => {
        const section = event.target.closest("section");
        const index = Number(section.dataset.index);
        const field = event.target.dataset.field;
        const value = parseFloat(event.target.value);
        this.config.celestialBodies[index][field] = value;
        this.eventBus?.emit("config:celestial:updated", {
          id: this.config.celestialBodies[index].id,
          field,
          value,
        });
      });
    });

    const close = this.mount.querySelector("#console-close");
    close?.addEventListener("click", () => this.toggle());
  }
}
