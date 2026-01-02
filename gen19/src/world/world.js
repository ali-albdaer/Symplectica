import * as THREE from 'three';
import { Config } from '../sim/config.js';
import { createNBodySystem } from '../sim/nbody.js';
import { createSky } from './sky.js';
import { createCelestialBodies } from './celestials.js';
import { createInteractiveObjects } from './objects.js';
import { applyShadowSettings } from '../runtime/renderer.js';

export function createWorld({ logger, renderer, scene }) {
  const state = {
    logger,
    renderer,
    scene,
    system: null,
    celestials: null,
    sky: null,
    objects: null,
    player: null,
    cameraRig: null,
    grab: null,
    lastRenderAlpha: 0
  };

  function attachPlayer(player) {
    state.player = player;
  }

  function attachCameraRig(cameraRig) {
    state.cameraRig = cameraRig;
  }

  function attachGrabSystem(grab) {
    state.grab = grab;
  }

  function init() {
    applyShadowSettings(renderer);

    state.system = createNBodySystem({
      getConfig: () => Config,
      logger: state.logger
    });

    state.celestials = createCelestialBodies({
      scene,
      renderer,
      system: state.system,
      getConfig: () => Config
    });

    state.sky = createSky({ scene, getConfig: () => Config });

    state.objects = createInteractiveObjects({
      scene,
      system: state.system,
      getConfig: () => Config
    });

    // Player is also a dynamic body affected by gravity from all bodies.
    state.system.registerDynamicBody(state.player.getPhysicsBody());
    for (const b of state.objects.getPhysicsBodies()) state.system.registerDynamicBody(b);

    // Spawn player on planet1
    const planet1 = state.system.getBodyById('planet1');
    if (!planet1) throw new Error('planet1 missing');
    state.player.spawnOnBody(planet1);

    state.objects.spawnNearPlayer(state.player, planet1);

    state.celestials.installSunLight(state.system.getBodyById('sun'));
  }

  function step(dt) {
    // Pull any fidelity changes live (shadows/quality) without rebuild complexity.
    applyShadowSettings(renderer);

    state.player.prePhysics(dt, state.system);
    state.grab?.prePhysics(dt, state.system);

    state.system.step(dt);

    // Basic collisions for dynamic bodies vs celestial spheres.
    resolveDynamicCollisions(state.system);

    state.player.postPhysics(dt, state.system);
    state.grab?.postPhysics(dt, state.system);

    state.celestials.syncFromPhysics();
    state.objects.syncFromPhysics();
  }

  function resolveDynamicCollisions(system) {
    const celestials = system.getAllBodies();
    const dynamics = system.getDynamicBodies?.() ?? [];

    // Skip player here; it has its own grounded logic.
    for (const d of dynamics) {
      if (d.id === 'player') continue;

      for (const c of celestials) {
        const r = (c.radiusMeters ?? 0) + (d.radiusMeters ?? 0);
        if (r <= 0) continue;

        const dx = d.pos.x - c.pos.x;
        const dy = d.pos.y - c.pos.y;
        const dz = d.pos.z - c.pos.z;
        const dist2 = dx * dx + dy * dy + dz * dz;
        const r2 = r * r;
        if (dist2 >= r2) continue;

        const dist = Math.sqrt(Math.max(1e-12, dist2));
        const nx = dx / dist;
        const ny = dy / dist;
        const nz = dz / dist;

        // Push out to surface.
        const pen = r - dist;
        d.pos.x += nx * pen;
        d.pos.y += ny * pen;
        d.pos.z += nz * pen;

        // Remove inward velocity and apply mild restitution.
        const vn = d.vel.x * nx + d.vel.y * ny + d.vel.z * nz;
        if (vn < 0) {
          const restitution = 0.15;
          const remove = (1 + restitution) * vn;
          d.vel.x -= nx * remove;
          d.vel.y -= ny * remove;
          d.vel.z -= nz * remove;
        }
      }
    }
  }

  function render(alpha) {
    state.lastRenderAlpha = alpha;
    state.cameraRig.update(alpha, state.system);
    renderer.render(scene, state.cameraRig.camera);
  }

  function getPlayerPrimaryBodyName() {
    const id = state.player?.getPrimaryBodyId();
    if (!id) return null;
    return state.system.getBodyById(id)?.name ?? null;
  }

  return {
    init,
    step,
    render,
    attachPlayer,
    attachCameraRig,
    attachGrabSystem,
    getPlayerPrimaryBodyName
  };
}
