// High-level game system: wires physics, rendering, input, gameplay

import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

import { Config } from "./core/config.js";
import { Debug } from "./core/debug.js";

import { PhysicsWorld } from "./physics/world.js";
import { createInitialSystem } from "./data/initialSystem.js";
import { createRendererSystem } from "./render/renderer.js";
import { createPlayerController } from "./gameplay/playerController.js";
import { createInteractionSystem } from "./gameplay/interactions.js";
import { setupDevConsole } from "./gameplay/devConsole.js";
import { setupTelemetry } from "./gameplay/telemetry.js";
import { setupInputManager } from "./gameplay/input.js";

export async function createGameSystem() {
  const container = document.getElementById("app");
  if (!container) {
    throw new Error("App container not found");
  }

  const physics = new PhysicsWorld();
  const scene = new THREE.Scene();

  const { celestialBodies, playerBody, microObjects } = createInitialSystem(physics);

  const rendererSystem = createRendererSystem({
    container,
    scene,
    celestialBodies,
    playerBody,
    microObjects,
  });

  const input = setupInputManager(container);
  const playerController = createPlayerController({
    physics,
    scene,
    camera: rendererSystem.camera,
    playerBody,
    input,
  });

  const interactionSystem = createInteractionSystem({
    scene,
    camera: rendererSystem.camera,
    physics,
    input,
    microObjects,
  });

  const telemetry = setupTelemetry({ playerBody, camera: rendererSystem.camera });
  setupDevConsole({ physics, rendererSystem });

  Debug.log("Game system created");

  return {
    async init() {
      rendererSystem.init();
      physics.init();
    },
    update(dt) {
      physics.step(dt);
      playerController.update(dt);
      interactionSystem.update(dt);
      telemetry.update(dt);
    },
    render(dt) {
      rendererSystem.render(dt);
    },
    shutdown() {
      rendererSystem.dispose();
    },
  };
}
