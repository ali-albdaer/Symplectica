import { ConfigManager } from "../core/ConfigManager.js";
import { EventBus } from "../core/EventBus.js";

export class UIManager {
    constructor(configManager, eventBus, logger) {
        if (!(configManager instanceof ConfigManager)) {
            throw new Error("UIManager requires ConfigManager");
        }
        if (!(eventBus instanceof EventBus)) {
            throw new Error("UIManager requires EventBus");
        }
        this.config = configManager;
        this.bus = eventBus;
        this.logger = logger;

        this.telemetryEl = document.getElementById("telemetry");
        this.debugEl = document.getElementById("debug-log");
        this.devConsoleEl = document.getElementById("dev-console");
        this.loaderEl = document.getElementById("loader-overlay");
        this.errorEl = document.getElementById("error-fallback");
        this.errorDetailsEl = document.getElementById("error-details");

        this.devConsoleVisible = false;
        this.telemetryVisible = this.config.get("telemetry.enabled");
        this.telemetryBuffer = [];
        this.telemetryEl?.classList.toggle("hidden", !this.telemetryVisible);
        this.debugEl?.classList.add("hidden");

        this.initLoggerSink();
        this.initDevConsole();
        this.registerEvents();
    }

    initLoggerSink() {
        if (!this.logger) {
            return;
        }
        this.logger.sink = (entry) => {
            if (!this.debugEl) {
                return;
            }
            this.debugEl.classList.remove("hidden");
            const line = document.createElement("div");
            const time = (entry.timestamp / 1000).toFixed(2);
            line.textContent = `[${time}s][${entry.level.toUpperCase()}] ${entry.message}`;
            this.debugEl.appendChild(line);
            while (this.debugEl.childElementCount > this.config.get("debug.maxEntries")) {
                this.debugEl.removeChild(this.debugEl.firstChild);
            }
            this.debugEl.scrollTop = this.debugEl.scrollHeight;
        };
    }

    initDevConsole() {
        const dat = window.dat;
        if (!dat) {
            console.warn("dat.GUI not available for developer console");
            return;
        }
        this.gui = new dat.GUI({ autoPlace: false, width: 280 });
        this.devConsoleEl.appendChild(this.gui.domElement);
        this.devConsoleEl.classList.add("hidden");

        const simFolder = this.gui.addFolder("Simulation");
        simFolder.add(this.config.get("simulation"), "timeScale", 0.1, 5, 0.1).name("Time Scale").onFinishChange((value) => {
            this.config.set("simulation.timeScale", value);
        });
        simFolder.add(this.config.get("simulation"), "gravitationalConstant", 1e-4, 1e-1, 1e-4).name("Gravity").onFinishChange((value) => {
            this.config.set("simulation.gravitationalConstant", value);
        });

        const controlsFolder = this.gui.addFolder("Controls");
        controlsFolder.add(this.config.get("controls"), "walkSpeed", 1, 20, 0.5).onFinishChange((value) => this.config.set("controls.walkSpeed", value));
        controlsFolder.add(this.config.get("controls"), "flySpeed", 5, 60, 0.5).onFinishChange((value) => this.config.set("controls.flySpeed", value));
        controlsFolder.add(this.config.get("controls"), "gravityAlignRadius", 1, 40, 0.5).onFinishChange((value) => this.config.set("controls.gravityAlignRadius", value));

        const renderFolder = this.gui.addFolder("Rendering");
        renderFolder.add(this.config.get("rendering"), "fidelity", ["Low", "Medium", "Ultra"]).onFinishChange((value) => this.config.set("rendering.fidelity", value));
        renderFolder.add(this.config.get("rendering"), "frustumCullingEnabled").name("Frustum Culling").onFinishChange((value) => this.config.set("rendering.frustumCullingEnabled", value));
        renderFolder.add(this.config.get("rendering.lodDistances"), "enabled").name("LOD Enabled").onFinishChange((value) => this.config.set("rendering.lodDistances.enabled", value));

        const telemetryFolder = this.gui.addFolder("Telemetry");
        telemetryFolder.add(this, "telemetryVisible").name("Show Telemetry").onFinishChange((value) => {
            this.telemetryVisible = value;
            this.telemetryEl.classList.toggle("hidden", !value);
        });

        simFolder.open();
        controlsFolder.open();
        renderFolder.open();
        telemetryFolder.open();
    }

    registerEvents() {
        this.bus.on("ui:devConsole:toggle", () => this.toggleDevConsole());
    }

    toggleDevConsole() {
        if (!this.gui) {
            return;
        }
        this.devConsoleVisible = !this.devConsoleVisible;
        this.devConsoleEl.classList.toggle("hidden", !this.devConsoleVisible);
        if (this.devConsoleVisible) {
            this.bus.emit("ui:devConsole:open");
        } else {
            this.bus.emit("ui:devConsole:close");
        }
    }

    showLoader(message = "Initializing Simulation...") {
        if (this.loaderEl) {
            this.loaderEl.classList.remove("hidden");
            const label = this.loaderEl.querySelector?.(".loader-message");
            if (label) {
                label.textContent = message;
            }
        }
    }

    hideLoader() {
        this.loaderEl?.classList.add("hidden");
    }

    showError(message, error) {
        if (this.errorDetailsEl) {
            this.errorDetailsEl.textContent = `${message}\n${error?.stack || error?.message || error}`;
        }
        this.errorEl?.classList.remove("hidden");
    }

    hideError() {
        this.errorEl?.classList.add("hidden");
    }

    updateTelemetry({ fps, frameTime, position }) {
        if (!this.telemetryVisible || !this.telemetryEl) {
            return;
        }
        const precision = (value) => value.toFixed(2).padStart(7, " ");
        this.telemetryEl.classList.remove("hidden");
        this.telemetryEl.innerText = `FPS: ${precision(fps)}\nFrame Time: ${precision(frameTime)} ms\nPos: (${precision(position.x)}, ${precision(position.y)}, ${precision(position.z)})`;
    }
}
