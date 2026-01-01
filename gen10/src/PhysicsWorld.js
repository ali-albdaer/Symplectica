import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { Config } from './Config.js';

export class PhysicsWorld {
  constructor({ debug }) {
    this.debug = debug;

    this.world = null;
    this.materialDefault = null;

    // Kinematic colliders for celestial bodies (synced from NBody)
    this.celestialBodies = new Map(); // id -> { body, shape, radius }

    // Dynamic bodies used for micro-physics and player
    this.dynamicBodies = new Set();

    // Micro objects: physics bodies + shape info for rendering sync
    this.microObjects = []; // Array<{ body: CANNON.Body, kind: 'box'|'sphere', halfExtents?:CANNON.Vec3, radius?:number }>

    // Grab constraint
    this.grabbed = null;

    // Reusable
    this._v3 = new CANNON.Vec3();
  }

  init() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, 0, 0),
    });

    this.world.allowSleep = true;
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);

    this.materialDefault = new CANNON.Material('default');
    const contact = new CANNON.ContactMaterial(this.materialDefault, this.materialDefault, {
      friction: 0.55,
      restitution: 0.05,
    });
    this.world.defaultContactMaterial = contact;
    this.world.addContactMaterial(contact);
  }

  ensureCelestialCollider(id, radius) {
    if (this.celestialBodies.has(id)) return;

    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      material: this.materialDefault,
    });
    body.addShape(shape);
    body.collisionFilterGroup = 1;
    body.collisionFilterMask = 1 | 2;

    this.world.addBody(body);
    this.celestialBodies.set(id, { body, shape, radius });
  }

  syncCelestialColliders(nbody, bodiesConfig) {
    for (const [id, record] of this.celestialBodies) {
      const state = nbody.getBody(id);
      if (!state) continue;

      const cfg = bodiesConfig[id];
      const r = cfg?.radius;
      if (typeof r === 'number' && Math.abs(r - record.radius) > 1e-6) {
        // If radius changed via dev console, rebuild collider
        this.world.removeBody(record.body);
        this.celestialBodies.delete(id);
        this.ensureCelestialCollider(id, r);
        continue;
      }

      record.body.position.set(state.position.x, state.position.y, state.position.z);
      record.body.velocity.set(0, 0, 0);
      record.body.angularVelocity.set(0, 0, 0);
      record.body.quaternion.set(0, 0, 0, 1);
    }
  }

  addDynamicBody(body) {
    this.world.addBody(body);
    this.dynamicBodies.add(body);
  }

  removeDynamicBody(body) {
    this.world.removeBody(body);
    this.dynamicBodies.delete(body);
  }

  spawnMicroObjectsNear(centerThree, microCfg) {
    if (!microCfg?.enabled) return;
    const center = new CANNON.Vec3(centerThree.x, centerThree.y, centerThree.z);

    for (let i = 0; i < microCfg.count; i++) {
      const isBox = i % 2 === 0;
      const radius = 0.18 + Math.random() * 0.18;
      const halfExt = 0.18 + Math.random() * 0.25;

      const shape = isBox
        ? new CANNON.Box(new CANNON.Vec3(halfExt, halfExt, halfExt))
        : new CANNON.Sphere(radius);

      const body = new CANNON.Body({
        mass: microCfg.objectMass,
        material: this.materialDefault,
      });
      body.addShape(shape);

      const rx = (Math.random() * 2 - 1) * microCfg.spawnRadius;
      const ry = (Math.random() * 1.5) + 0.5;
      const rz = (Math.random() * 2 - 1) * microCfg.spawnRadius;
      body.position.set(center.x + rx, center.y + ry, center.z + rz);

      body.linearDamping = 0.01;
      body.angularDamping = 0.05;
      body.collisionFilterGroup = 2;
      body.collisionFilterMask = 1 | 2;

      this.addDynamicBody(body);

      this.microObjects.push(
        isBox
          ? { body, kind: 'box', halfExtents: new CANNON.Vec3(halfExt, halfExt, halfExt) }
          : { body, kind: 'sphere', radius }
      );
    }
  }

  applyCelestialGravityToDynamics({ nbody, bodiesConfig }) {
    const G = Config.sim.G;
    const eps2 = Config.sim.softening * Config.sim.softening;

    // Apply gravity from celestial bodies to dynamic bodies.
    // (Dynamics do not significantly influence celestial orbits.)
    for (const dyn of this.dynamicBodies) {
      if (dyn.type !== CANNON.Body.DYNAMIC) continue;
      if (dyn.mass <= 0) continue;

      const fx = 0, fy = 0, fz = 0;
      let sumFx = fx, sumFy = fy, sumFz = fz;

      for (const id of Object.keys(bodiesConfig)) {
        const cfg = bodiesConfig[id];
        const state = nbody.getBody(id);
        if (!cfg || !state) continue;

        const dx = state.position.x - dyn.position.x;
        const dy = state.position.y - dyn.position.y;
        const dz = state.position.z - dyn.position.z;
        const r2 = dx * dx + dy * dy + dz * dz + eps2;
        const invR = 1 / Math.sqrt(r2);
        const invR3 = invR * invR * invR;

        const aScale = G * cfg.mass * invR3;
        sumFx += dyn.mass * aScale * dx;
        sumFy += dyn.mass * aScale * dy;
        sumFz += dyn.mass * aScale * dz;
      }

      dyn.applyForce(this._v3.set(sumFx, sumFy, sumFz));
    }
  }

  step(dt, { nbody, bodiesConfig }) {
    this.applyCelestialGravityToDynamics({ nbody, bodiesConfig });

    // Grab constraint spring
    if (this.grabbed) {
      const { body, targetBody, holdDistance, stiffness, damping } = this.grabbed;
      const p = body.position;
      const t = targetBody.position;

      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const dz = t.z - p.z;
      const dist = Math.max(1e-6, Math.sqrt(dx * dx + dy * dy + dz * dz));

      const nx = dx / dist;
      const ny = dy / dist;
      const nz = dz / dist;

      const desiredX = t.x - nx * holdDistance;
      const desiredY = t.y - ny * holdDistance;
      const desiredZ = t.z - nz * holdDistance;

      const ex = desiredX - p.x;
      const ey = desiredY - p.y;
      const ez = desiredZ - p.z;

      // Spring-damper
      const relVx = -body.velocity.x;
      const relVy = -body.velocity.y;
      const relVz = -body.velocity.z;

      const Fx = stiffness * ex + damping * relVx;
      const Fy = stiffness * ey + damping * relVy;
      const Fz = stiffness * ez + damping * relVz;

      body.applyForce(this._v3.set(Fx, Fy, Fz));
    }

    this.world.step(dt);
  }

  // Utility for player gravity alignment
  getGravityUpVectorAt(positionThree, preferredBodyId) {
    // Up is opposite gravity direction, computed from the preferred celestial body center.
    const state = preferredBodyId ? null : null;
    void state;

    // For player walking we typically align to the closest massive body (or specified spawn planet).
    // This simplified helper is overridden by Player using NBody directly.
    const up = new THREE.Vector3(0, 1, 0);
    return up;
  }

  setGrabbed({ body, targetBody }) {
    this.grabbed = {
      body,
      targetBody,
      holdDistance: Config.player.grab.holdDistance,
      stiffness: Config.player.grab.stiffness,
      damping: Config.player.grab.damping,
    };
  }

  clearGrabbed() {
    this.grabbed = null;
  }
}
