import { ConfigManager } from "./core/ConfigManager.js";
import { Logger } from "./core/Logger.js";
import { EventBus } from "./core/EventBus.js";
import { SceneManager } from "./core/SceneManager.js";
import { PhysicsSystem } from "./physics/PhysicsSystem.js";
import { EntityFactory } from "./entities/EntityFactory.js";
import { PlayerController } from "./player/PlayerController.js";
import { UIManager } from "./ui/UIManager.js";
import { setMeshFromBody, threeFromCannon, rollingAverage } from "./utils/MathUtils.js";

const state = {
    running: true,
    entities: [],
    sunEntity: null
};

async function bootstrap() {
    const configManager = new ConfigManager();
    const logger = new Logger({ level: configManager.get("debug.logLevel") });
    const bus = new EventBus();
    const ui = new UIManager(configManager, bus, logger);
    ui.showLoader("Bootstrapping systems...");

    try {
        const sceneManager = new SceneManager(configManager, logger);
        const physicsSystem = new PhysicsSystem(configManager, logger);
        const factory = new EntityFactory(sceneManager, physicsSystem, configManager, logger);
        const entities = factory.createAll();
        state.entities = entities;
        state.sunEntity = entities.find((entity) => entity.type === "sun");

        const player = new PlayerController(sceneManager, physicsSystem, configManager, bus, logger);
        player.setInteractableEntities(entities.filter((entity) => entity.type === "micro"));

        configManager.onChange("rendering.fidelity", (value) => sceneManager.applyFidelitySettings(value));
        configManager.onChange("rendering.lodDistances.enabled", (value) => factory.rebuildCelestialMeshes({ lodEnabled: value }));
        configManager.onChange("rendering.frustumCullingEnabled", (value) => factory.updateFrustumCulling(value));

        ui.hideLoader();
        loop({ sceneManager, physicsSystem, player, configManager, ui, logger });
    } catch (error) {
        logger.error("Failed to initialise simulation", error);
        ui.hideLoader();
        ui.showError("Startup failure", error);
        state.running = false;
    }
}

function loop({ sceneManager, physicsSystem, player, configManager, ui }) {
    const fpsSamples = [];
    let lastTime = performance.now();

    const stepFrame = (timestamp) => {
        if (!state.running) {
            return;
        }
        const deltaMs = timestamp - lastTime;
        lastTime = timestamp;
        const delta = Math.max(deltaMs / 1000, 1 / 1000);
        const timeScale = configManager.get("simulation.timeScale");
        const scaledDelta = delta * timeScale;

        try {
            physicsSystem.step(scaledDelta);
            state.entities.forEach((entity) => {
                setMeshFromBody(entity.mesh, entity.body);
            });
            if (state.sunEntity) {
                sceneManager.attachSun(state.sunEntity.mesh);
            }
            player.update(scaledDelta);
            sceneManager.render();
            const fps = 1 / delta;
            const smoothedFps = rollingAverage(fpsSamples, fps, configManager.get("telemetry.smoothingWindow"));
            const playerPosition = threeFromCannon(player.body.position);
            ui.updateTelemetry({ fps: smoothedFps, frameTime: deltaMs, position: playerPosition });
        } catch (error) {
            ui.showError("Runtime failure", error);
            state.running = false;
            return;
        }

        requestAnimationFrame(stepFrame);
    };

    requestAnimationFrame(stepFrame);
}

bootstrap();
