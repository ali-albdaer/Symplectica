import * as THREE from 'three';
import { CONFIG, metersToUnits } from '../config.js';
import { Body } from '../physics/body.js';
import { Vec3d } from '../physics/vec3d.js';

export class PlayerController {
  /**
   * @param {object} args
   * @param {import('../runtime/input.js').Input} args.input
   * @param {THREE.PerspectiveCamera} args.camera
   * @param {import('../runtime/debugLog.js').DebugLog} args.debugLog
   * @param {() => import('../physics/body.js').Body[]} args.getGravityBodies
   * @param {() => import('../physics/body.js').Body} args.getWalkReferenceBody
   */
  constructor({ input, camera, debugLog, getGravityBodies, getWalkReferenceBody }) {
    this.input = input;
    this.camera = camera;
    this.debugLog = debugLog;

    this.getGravityBodies = getGravityBodies;
    this.getWalkReferenceBody = getWalkReferenceBody;

    this.body = new Body({
      id: 'player',
      name: 'Player',
      kind: 'player',
      massKg: CONFIG.player.massKg,
      radiusM: CONFIG.player.radiusM,
      position: new Vec3d(0, 0, 0),
      velocity: new Vec3d(0, 0, 0),
    });

    this.state = {
      freeFlight: false,
      grounded: false,
      thirdPerson: false,
      yaw: 0,
      pitch: 0,

      // Smooth 3rd person camera
      camPos: new THREE.Vector3(),
      camVel: new THREE.Vector3(),
      thirdDistanceM: 5.5,
      thirdHeightM: 1.4,
    };

    // Start camera at player position.
    this._syncCameraImmediate();

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') this.state.freeFlight = !this.state.freeFlight;
      if (e.code === 'KeyV') this.state.thirdPerson = !this.state.thirdPerson;
    });
  }

  updateControls(dtRender) {
    // Look
    const md = this.input.consumeMouseDelta();
    const s = CONFIG.player.look.sensitivity;

    this.state.yaw -= md.x * s;
    this.state.pitch -= md.y * s;

    const mp = CONFIG.player.look.maxPitchRad;
    this.state.pitch = Math.max(-mp, Math.min(mp, this.state.pitch));

    // Movement
    if (this.state.freeFlight) {
      this._updateFlight(dtRender);
    } else {
      this._updateWalk(dtRender);
    }
  }

  _updateWalk(dtRender) {
    const planet = this.getWalkReferenceBody();
    const up = Vec3d.sub(this.body.position, planet.position);
    const upLen = up.len();
    if (upLen > 0) up.mul(1 / upLen);

    // Camera forward/right
    const fwd = this._cameraForward();
    const right = this._cameraRight();

    // Project onto tangent plane
    const fwdT = fwd.sub(up.clone().mul(fwd.dot(up))).normalize();
    const rightT = right.sub(up.clone().mul(right.dot(up))).normalize();

    const wish = new Vec3d(0, 0, 0);
    if (this.input.isDown('KeyW')) wish.add(fwdT);
    if (this.input.isDown('KeyS')) wish.sub(fwdT);
    if (this.input.isDown('KeyD')) wish.add(rightT);
    if (this.input.isDown('KeyA')) wish.sub(rightT);

    const wishLen = wish.len();
    if (wishLen > 0) wish.mul(1 / wishLen);

    const accel = CONFIG.player.walk.accel;
    this.body.velocity.addScaled(wish, accel * dtRender);

    // Clamp tangential speed relative to planet
    const relV = Vec3d.sub(this.body.velocity, planet.velocity);
    const vRad = relV.dot(up);
    const vTan = relV.clone().addScaled(up, -vRad);
    const speed = vTan.len();
    const maxSpeed = CONFIG.player.walk.maxSpeed;
    if (speed > maxSpeed && speed > 0) {
      vTan.mul(maxSpeed / speed);
      relV.copy(vTan).addScaled(up, vRad);
      this.body.velocity.copy(planet.velocity.clone().add(relV));
    }

    // Jump
    if (this.state.grounded && this.input.isDown('Space')) {
      this.body.velocity.addScaled(up, CONFIG.player.walk.jumpSpeed);
      this.state.grounded = false;
    }

    // Damping
    const damping = this.state.grounded ? CONFIG.player.walk.dampingGround : CONFIG.player.walk.dampingAir;
    const k = Math.exp(-damping * dtRender);
    // Only damp tangential for grounded feel
    if (this.state.grounded) {
      const vRel = Vec3d.sub(this.body.velocity, planet.velocity);
      const vr = vRel.dot(up);
      const vt = vRel.clone().addScaled(up, -vr).mul(k);
      this.body.velocity.copy(planet.velocity.clone().add(vt).addScaled(up, vr));
    } else {
      this.body.velocity.mul(k);
    }
  }

  _updateFlight(dtRender) {
    const fwd = this._cameraForward();
    const right = this._cameraRight();
    const up = Vec3d.cross(right, fwd).normalize();

    const wish = new Vec3d(0, 0, 0);
    if (this.input.isDown('KeyW')) wish.add(fwd);
    if (this.input.isDown('KeyS')) wish.sub(fwd);
    if (this.input.isDown('KeyD')) wish.add(right);
    if (this.input.isDown('KeyA')) wish.sub(right);
    if (this.input.isDown('Space')) wish.add(up);
    if (this.input.isDown('ShiftLeft') || this.input.isDown('ShiftRight')) wish.sub(up);

    const wishLen = wish.len();
    if (wishLen > 0) wish.mul(1 / wishLen);

    this.body.velocity.addScaled(wish, CONFIG.player.flight.accel * dtRender);

    // Clamp speed
    const sp = this.body.velocity.len();
    const ms = CONFIG.player.flight.maxSpeed;
    if (sp > ms && sp > 0) this.body.velocity.mul(ms / sp);

    // Damping
    const k = Math.exp(-CONFIG.player.flight.damping * dtRender);
    this.body.velocity.mul(k);
  }

  /**
   * Player vs Planet collision (simple sphere-on-sphere). Keeps walking stable.
   */
  resolvePlanetCollision(planet, dt) {
    const rel = Vec3d.sub(this.body.position, planet.position);
    const dist = rel.len();
    const minDist = planet.radiusM + this.body.radiusM;

    if (dist < minDist && dist > 0) {
      const n = rel.mul(1 / dist);
      const penetration = minDist - dist;
      this.body.position.addScaled(n, penetration + 0.02);

      // Remove inward radial velocity.
      const relV = Vec3d.sub(this.body.velocity, planet.velocity);
      const vIn = relV.dot(n);
      if (vIn < 0) relV.addScaled(n, -vIn);
      this.body.velocity.copy(planet.velocity.clone().add(relV));

      this.state.grounded = !this.state.freeFlight;
      return;
    }

    this.state.grounded = false;
  }

  updateCamera(dtRender) {
    if (!this.input.pointerLocked) {
      // Still update camera for cinematic feel when unlocked.
    }

    if (!this.state.thirdPerson) {
      this._updateFirstPersonCamera();
      return;
    }

    this._updateThirdPersonCamera(dtRender);
  }

  _updateFirstPersonCamera() {
    const planet = this.getWalkReferenceBody();
    const up = Vec3d.sub(this.body.position, planet.position).normalize();

    const eye = this.body.position.clone().addScaled(up, CONFIG.player.eyeHeightM);
    this.camera.position.set(metersToUnits(eye.x), metersToUnits(eye.y), metersToUnits(eye.z));

    const basis = this._cameraBasis(up);
    const target = eye.clone().addScaled(basis.forward, 1.0);
    this.camera.up.set(up.x, up.y, up.z);
    this.camera.lookAt(metersToUnits(target.x), metersToUnits(target.y), metersToUnits(target.z));
  }

  _updateThirdPersonCamera(dtRender) {
    const planet = this.getWalkReferenceBody();
    const up = Vec3d.sub(this.body.position, planet.position).normalize();

    const basis = this._cameraBasis(up);

    const target = this.body.position.clone().addScaled(up, CONFIG.player.eyeHeightM);

    const desired = target.clone()
      .addScaled(basis.forward, -this.state.thirdDistanceM)
      .addScaled(up, this.state.thirdHeightM);

    // Smooth-damp in render units
    const desiredU = new THREE.Vector3(metersToUnits(desired.x), metersToUnits(desired.y), metersToUnits(desired.z));

    if (this.state.camPos.lengthSq() === 0) {
      this.state.camPos.copy(desiredU);
      this.state.camVel.set(0, 0, 0);
    }

    const smoothTime = 0.18;
    smoothDampVec3(this.state.camPos, desiredU, this.state.camVel, smoothTime, dtRender);

    this.camera.position.copy(this.state.camPos);
    this.camera.up.set(up.x, up.y, up.z);

    const targetU = new THREE.Vector3(metersToUnits(target.x), metersToUnits(target.y), metersToUnits(target.z));
    this.camera.lookAt(targetU);
  }

  _cameraBasis(worldUp) {
    // Build a stable basis around planet-up (for walking feel) while still using yaw/pitch.
    const yaw = this.state.yaw;
    const pitch = this.state.pitch;

    // Reference north/east around the up vector.
    const ref = Math.abs(worldUp.y) < 0.9 ? new Vec3d(0, 1, 0) : new Vec3d(1, 0, 0);
    const east = Vec3d.cross(ref, worldUp).normalize();
    const north = Vec3d.cross(worldUp, east).normalize();

    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);

    // Forward = rotate around up (yaw) then pitch around right.
    let forward = north.clone().mul(cy).addScaled(east, sy).normalize();
    const right = Vec3d.cross(forward, worldUp).normalize();
    forward = forward.mul(cp).addScaled(worldUp, sp).normalize();

    return { forward, right };
  }

  _cameraForward() {
    // Approximate forward in world-space based on planet-up.
    const planet = this.getWalkReferenceBody();
    const up = Vec3d.sub(this.body.position, planet.position).normalize();
    return this._cameraBasis(up).forward;
  }

  _cameraRight() {
    const planet = this.getWalkReferenceBody();
    const up = Vec3d.sub(this.body.position, planet.position).normalize();
    return this._cameraBasis(up).right;
  }

  _syncCameraImmediate() {
    this.camera.position.set(0, 0, 0);
  }
}

function smoothDampVec3(current, target, currentVelocity, smoothTime, deltaTime) {
  // Critically damped spring smoothing (Unity-style).
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  const change = current.clone().sub(target);
  const temp = currentVelocity.clone().add(change.multiplyScalar(omega)).multiplyScalar(deltaTime);

  currentVelocity.sub(temp.multiplyScalar(omega)).multiplyScalar(exp);
  const out = target.clone().add(change.add(temp).multiplyScalar(exp));

  current.copy(out);
}
