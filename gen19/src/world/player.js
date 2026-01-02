import * as THREE from 'three';

export function createPlayer({ input, cameraRig, getConfig, logger }) {
  const body = {
    id: 'player',
    name: 'Player',
    massKg: getConfig().player.massKg,
    radiusMeters: getConfig().player.radiusMeters,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3()
  };

  const state = {
    flight: false,
    grounded: false,
    primaryBodyId: null,
    desiredMove: new THREE.Vector3(),
    cachedUp: new THREE.Vector3(0, 1, 0)
  };

  function toggleFlight() {
    state.flight = !state.flight;
    if (state.flight) {
      state.grounded = false;
    }
    logger?.info(`Flight: ${state.flight ? 'ON' : 'OFF'}`);
  }

  function getPhysicsBody() {
    return body;
  }

  function getPosition() {
    return body.pos;
  }

  function getVelocity() {
    return body.vel;
  }

  function getPrimaryBodyId() {
    return state.primaryBodyId;
  }

  function getUpVector(primaryBody) {
    if (!primaryBody) return new THREE.Vector3(0, 1, 0);
    return body.pos.clone().sub(primaryBody.pos).normalize();
  }

  function spawnOnBody(primaryBody) {
    const cfg = getConfig();
    const dir = new THREE.Vector3(...cfg.initial.playerSpawn.localDir).normalize();
    body.pos.copy(primaryBody.pos).addScaledVector(dir, primaryBody.radiusMeters + cfg.initial.playerSpawn.altitudeMeters);
    body.vel.set(0, 0, 0);
    state.primaryBodyId = primaryBody.id;

    cameraRig.setFocus(body);
    cameraRig.setUpVector(dir);
  }

  function prePhysics(dt, system) {
    const cfg = getConfig();

    const primary = pickPrimaryBody(system);
    state.primaryBodyId = primary?.id ?? null;

    const up = primary ? body.pos.clone().sub(primary.pos).normalize() : new THREE.Vector3(0, 1, 0);
    state.cachedUp.copy(up);

    cameraRig.setUpVector(up);

    // Camera look delta
    cameraRig.applyLookDeltaFromInput(dt);

    if (state.flight) {
      integrateFlight(dt, up);
      return;
    }

    integrateWalk(dt, up, primary);
  }

  function postPhysics(dt, system) {
    // Resolve ground collision against primary body sphere.
    if (state.flight) return;

    const cfg = getConfig();
    const primary = state.primaryBodyId ? system.getBodyById(state.primaryBodyId) : null;
    if (!primary) return;

    const r = primary.radiusMeters + body.radiusMeters;
    const toPlayer = body.pos.clone().sub(primary.pos);
    const dist = toPlayer.length();

    // Push out if intersecting
    if (dist < r) {
      const n = dist > 1e-6 ? toPlayer.multiplyScalar(1 / dist) : new THREE.Vector3(0, 1, 0);
      body.pos.copy(primary.pos).addScaledVector(n, r);

      // Remove inward velocity
      const vn = body.vel.dot(n);
      if (vn < 0) body.vel.addScaledVector(n, -vn);
    }

    const altitude = dist - r;
    state.grounded = altitude <= cfg.sim.playerGroundEpsilonMeters;
  }

  function integrateWalk(dt, up, primary) {
    const cfg = getConfig();

    const forward = cameraRig.getForwardOnPlane(up);
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    const wish = new THREE.Vector3();
    if (input.isKeyDown('KeyW')) wish.add(forward);
    if (input.isKeyDown('KeyS')) wish.sub(forward);
    if (input.isKeyDown('KeyD')) wish.add(right);
    if (input.isKeyDown('KeyA')) wish.sub(right);

    if (wish.lengthSq() > 1e-8) wish.normalize();

    const maxSpeed = cfg.player.walk.maxSpeed;
    const accel = state.grounded ? cfg.player.walk.acceleration : cfg.player.walk.airAcceleration;

    // Project velocity onto tangent plane
    const v = body.vel;
    const vTangent = v.clone().sub(up.clone().multiplyScalar(v.dot(up)));

    // Friction when grounded
    if (state.grounded && vTangent.lengthSq() > 1e-6) {
      const drop = cfg.player.walk.friction * dt;
      const speed = vTangent.length();
      const newSpeed = Math.max(0, speed - drop);
      if (speed > 1e-6) {
        const scale = newSpeed / speed;
        vTangent.multiplyScalar(scale);
        // Recompose vel
        const vNormal = up.clone().multiplyScalar(v.dot(up));
        body.vel.copy(vTangent).add(vNormal);
      }
    }

    // Accelerate on tangent plane
    const targetVelTangent = wish.multiplyScalar(maxSpeed);
    const delta = targetVelTangent.sub(vTangent);

    const deltaLen = delta.length();
    if (deltaLen > 1e-6) {
      const maxDelta = accel * dt;
      delta.multiplyScalar(Math.min(1, maxDelta / deltaLen));
      body.vel.add(delta);
    }

    // Jump
    if (state.grounded && input.isKeyDown('Space')) {
      body.vel.addScaledVector(up, cfg.player.walk.jumpSpeed);
      state.grounded = false;
    }
  }

  function integrateFlight(dt, up) {
    const cfg = getConfig();
    const forward = cameraRig.getForward();
    const right = cameraRig.getRight();

    const wish = new THREE.Vector3();
    if (input.isKeyDown('KeyW')) wish.add(forward);
    if (input.isKeyDown('KeyS')) wish.sub(forward);
    if (input.isKeyDown('KeyD')) wish.add(right);
    if (input.isKeyDown('KeyA')) wish.sub(right);
    if (input.isKeyDown('Space')) wish.add(up);
    if (input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight')) wish.sub(up);

    if (wish.lengthSq() > 1e-8) wish.normalize();

    const targetSpeed = cfg.player.flight.maxSpeed;
    const targetVel = wish.multiplyScalar(targetSpeed);

    // Smooth acceleration toward target vel
    const dv = targetVel.sub(body.vel);
    const maxDv = cfg.player.flight.acceleration * dt;
    const len = dv.length();
    if (len > 1e-6) {
      dv.multiplyScalar(Math.min(1, maxDv / len));
      body.vel.add(dv);
    }

    // Damping
    body.vel.multiplyScalar(Math.exp(-cfg.player.flight.damping * dt));
  }

  function pickPrimaryBody(system) {
    // Choose strongest gravitational influence (approx by GM/r^2).
    const cfg = getConfig();
    const eps = cfg.sim.softeningMeters;

    let best = null;
    let bestVal = -Infinity;

    for (const b of system.getAllBodies()) {
      const r2 = b.pos.distanceToSquared(body.pos) + eps * eps;
      const val = (cfg.sim.G * b.massKg) / r2;
      if (val > bestVal) {
        bestVal = val;
        best = b;
      }
    }

    return best;
  }

  return {
    getPhysicsBody,
    getPosition,
    getVelocity,
    getPrimaryBodyId,
    getUpVector,
    spawnOnBody,
    prePhysics,
    postPhysics,
    toggleFlight
  };
}
