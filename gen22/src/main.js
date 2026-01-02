import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { getConfig } from "./config.js";
import { Body } from "./engine/Body.js";
import { PhysicsEngine } from "./engine/PhysicsEngine.js";
import { RendererEngine } from "./engine/Renderer.js";
import { InputManager } from "./engine/InputManager.js";
import { PlayerController } from "./engine/PlayerController.js";
import { DebugOverlay } from "./engine/DebugOverlay.js";
import { TelemetryOverlay } from "./engine/TelemetryOverlay.js";
import { ErrorOverlay } from "./engine/ErrorOverlay.js";
import { DeveloperMenu } from "./engine/ui/DeveloperMenu.js";
import { FidelityMenu } from "./engine/ui/FidelityMenu.js";
import { initLogger, logError, logInfo } from "./utils/Logger.js";
import { computeCircularOrbitVelocity, createVectorFromPolar, createVelocityVector } from "./utils/PhysicsUtils.js";

let physics;
let renderer;
let input;
let playerBody;
let playerController;
let debugOverlay;
let telemetryOverlay;
let developerMenu;
let fidelityMenu;
let errorOverlay;
let celestialBodies = [];
let interactiveBodies = [];

function bootstrap() {
    try {
        const canvas = document.getElementById("renderer-canvas");
        const debugPanel = document.getElementById("debug-overlay");
        const errorPanel = document.getElementById("error-overlay");
        const telemetryPanel = document.getElementById("telemetry-overlay");
        const devPanel = document.getElementById("developer-menu");
        const fidelityPanel = document.getElementById("fidelity-menu");
        const cursorIndicator = document.getElementById("cursor-capture-indicator");

        initLogger(errorPanel);

        errorOverlay = new ErrorOverlay(errorPanel);
        renderer = new RendererEngine({ canvas });
        renderer.initialize();

        physics = new PhysicsEngine();
        input = new InputManager({
            canvas,
            onPointerLockChange: (locked) => {
                cursorIndicator.classList.toggle("hidden", locked);
                if (locked) {
                    developerMenu.hide();
                }
            }
        });

        developerMenu = new DeveloperMenu(devPanel, handleConfigChange);
        fidelityMenu = new FidelityMenu(fidelityPanel);
        debugOverlay = new DebugOverlay(debugPanel);
        telemetryOverlay = new TelemetryOverlay(telemetryPanel);
        // Telemetry overlay shares the debug panel but toggles visibility based on config.

        cursorIndicator.classList.remove("hidden");
        setupKeyBindings(canvas);
        createSolarSystem();
        startLoop();
    } catch (error) {
        logError(`Bootstrap failure: ${error.message}`);
        if (errorOverlay) {
            errorOverlay.showError(`Bootstrap failure: ${error.message}`);
        }
        console.error(error);
    }
}

function setupKeyBindings(canvas) {
    window.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        const config = getConfig();
        if (key === config.ui.developerMenuHotkey) {
            event.preventDefault();
            developerMenu.toggle();
            if (developerMenu.visible) {
                input.releasePointerLock();
            }
        }
        if (key === config.ui.cameraToggleKey) {
            event.preventDefault();
            playerController.toggleCamera();
        }
        if (key === config.ui.flightToggleKey) {
            event.preventDefault();
            playerController.toggleFlight();
        }
        if (key === "m") {
            fidelityMenu.toggle();
            if (fidelityMenu.visible) {
                input.releasePointerLock();
            }
        }
    });
}

function createSolarSystem() {
    const config = getConfig();
    const renderScale = config.simulation.renderScale;
    const G = config.simulation.gravitationalConstant;

    renderer.renderScale = renderScale;
    renderer.rebuildStarfield(getConfig().rendering.starfieldDensity);

    if (celestialBodies.length) {
        celestialBodies.forEach((body) => renderer.removeBody(body));
        celestialBodies = [];
    }
    if (physics) {
        physics.clear();
    }

    celestialBodies = [];
    interactiveBodies = [];

    const sunConfig = config.celestialBodies.sun;
    const sun = new Body({
        id: "sun",
        name: sunConfig.name,
        type: "star",
        mass: sunConfig.mass,
        radius: sunConfig.radius,
        color: sunConfig.color,
        luminosity: sunConfig.luminosity,
        emissiveIntensity: sunConfig.emissiveIntensity,
        initialPosition: new THREE.Vector3(0, 0, 0),
        initialVelocity: new THREE.Vector3(0, 0, 0),
        renderScale
    });
    registerBody(sun);

    const planetAConfig = config.celestialBodies.planetA;
    const planetAPosition = createVectorFromPolar(planetAConfig.semiMajorAxis, 0);
    const planetAVelocityMagnitude = computeCircularOrbitVelocity(sun.mass, planetAConfig.semiMajorAxis, G);
    const planetAVelocity = createVelocityVector(planetAVelocityMagnitude, 0);
    const planetA = new Body({
        id: "planetA",
        name: planetAConfig.name,
        type: "planet",
        mass: planetAConfig.mass,
        radius: planetAConfig.radius,
        color: planetAConfig.color,
        initialPosition: planetAPosition,
        initialVelocity: planetAVelocity,
        renderScale
    });
    registerBody(planetA);

    const planetBConfig = config.celestialBodies.planetB;
    const planetBAngle = Math.PI * 0.65;
    const planetBPosition = createVectorFromPolar(planetBConfig.semiMajorAxis, planetBAngle);
    const planetBVelocityMagnitude = computeCircularOrbitVelocity(sun.mass, planetBConfig.semiMajorAxis, G);
    const planetBVelocity = createVelocityVector(planetBVelocityMagnitude, planetBAngle);
    const planetB = new Body({
        id: "planetB",
        name: planetBConfig.name,
        type: "planet",
        mass: planetBConfig.mass,
        radius: planetBConfig.radius,
        color: planetBConfig.color,
        initialPosition: planetBPosition,
        initialVelocity: planetBVelocity,
        renderScale
    });
    registerBody(planetB);

    const moonConfig = config.celestialBodies.moon;
    const moonAngle = Math.PI * 0.25;
    const moonRelativePos = createVectorFromPolar(moonConfig.semiMajorAxis, moonAngle);
    const moonPosition = planetAPosition.clone().add(moonRelativePos);
    const moonVelocityMagnitude = computeCircularOrbitVelocity(planetA.mass, moonConfig.semiMajorAxis, G);
    const moonVelocity = createVelocityVector(moonVelocityMagnitude, moonAngle).add(planetAVelocity.clone());
    const moon = new Body({
        id: "moon",
        name: moonConfig.name,
        type: "moon",
        mass: moonConfig.mass,
        radius: moonConfig.radius,
        color: moonConfig.color,
        initialPosition: moonPosition,
        initialVelocity: moonVelocity,
        renderScale
    });
    registerBody(moon);

    const spawnNormal = planetAPosition.clone().normalize();
    const spawnSurfacePoint = spawnNormal.clone().multiplyScalar(planetA.radius + 2);

    playerBody = new Body({
        id: "player",
        name: "Explorer",
        type: "avatar",
        mass: 85,
        radius: getConfig().player.colliderRadius,
        color: 0xffffff,
        initialPosition: spawnSurfacePoint,
        initialVelocity: planetAVelocity.clone(),
        renderScale,
        isPlayer: true
    });
    registerBody(playerBody);

    playerController = new PlayerController({
        body: playerBody,
        camera: renderer.camera,
        input,
        physics,
        renderScale
    });
    playerBody.controller = playerController;

    spawnInteractiveObjects(spawnSurfacePoint, spawnNormal, planetAVelocity, renderScale);

    logInfo("Solar system initialized with default configuration.");
}

function spawnInteractiveObjects(surfacePoint, surfaceNormal, orbitalVelocity, renderScale) {
    const config = getConfig();
    const objects = config.interactions.localObjects;
    const tangent = new THREE.Vector3().crossVectors(surfaceNormal, new THREE.Vector3(0, 1, 0));
    if (tangent.lengthSq() < 1e-4) {
        tangent.set(1, 0, 0);
    }
    tangent.normalize();
    objects.forEach((entry, index) => {
        const offset = tangent.clone().multiplyScalar((index + 1) * 1.5);
        const position = surfacePoint.clone().add(surfaceNormal.clone().multiplyScalar(0.5)).add(offset);
        const body = new Body({
            id: entry.id,
            name: entry.id,
            type: "prop",
            mass: entry.mass,
            radius: entry.radius,
            color: entry.emissiveColor || 0x999999,
            luminosity: entry.luminosity,
            initialPosition: position,
            initialVelocity: orbitalVelocity.clone(),
            renderScale,
            isInteractive: true
        });
        registerBody(body);
        interactiveBodies.push(body);
    });
}

function handleConfigChange(path) {
    const rebuildPrefixes = ["celestialBodies.", "interactions."];
    if (path === "simulation.renderScale" || rebuildPrefixes.some((prefix) => path.startsWith(prefix))) {
        createSolarSystem();
    }
}

function registerBody(body) {
    physics.addBody(body);
    renderer.addBody(body);
    celestialBodies.push(body);
}

function startLoop() {
    const loop = () => {
        requestAnimationFrame(loop);
        try {
            const deltaReal = renderer.clock.getDelta();
            const config = getConfig();
            const deltaSim = deltaReal * config.simulation.timeScale;
            physics.setGravityConstant(config.simulation.gravitationalConstant);
            playerController.applyMovement({ deltaReal, deltaSim }, celestialBodies);
            physics.step(deltaSim);
            playerController.handleInteractions(interactiveBodies);
            renderer.update(deltaSim);
            renderer.renderer.render(renderer.scene, renderer.camera);
            debugOverlay.update({ deltaTime: deltaReal, playerBody });
            telemetryOverlay.update({ deltaTime: deltaReal, playerBody });
        } catch (error) {
            logError(`Runtime failure: ${error.message}`);
            errorOverlay.showError(`Runtime failure: ${error.message}`);
            console.error(error);
        }
    };
    loop();
}

bootstrap();
