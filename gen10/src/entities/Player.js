import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm';
import { Entity } from './Entity.js';
import { Config } from '../Config.js';
import { clamp, projectOnPlane, safeNormalize } from '../utils/MathUtils.js';

export class Player extends Entity {
  constructor({ camera, domElement, physics, nbody, getCelestial, debug }) {
    super();
    this.camera = camera;
    this.domElement = domElement;
    this.physics = physics;
    this.nbody = nbody;
    this.getCelestial = getCelestial;
    this.debug = debug;

    this.body = null;

    this._keys = new Set();
    this._mouseDelta = { x: 0, y: 0 };

    this._yaw = 0;
    this._pitch = 0;

    this._modeFlight = false;

    this._preferredWalkBody = Config.player.spawnAbovePlanet;

    this._tmpV = new THREE.Vector3();
    this._tmpV2 = new THREE.Vector3();

    this._cameraThird = false;
    this._cameraLerp = 1.0;

    this._grabbedBody = null;

    this._onKeyDown = (e) => {
      if (e.repeat) return;
      this._keys.add(e.code);
    };
    this._onKeyUp = (e) => this._keys.delete(e.code);
    this._onMouseMove = (e) => this._onMouseMoveInternal(e);
    this._onMouseDown = (e) => this._onMouseDownInternal(e);
    this._onMouseUp = (e) => this._onMouseUpInternal(e);
    this._onContextMenu = (e) => e.preventDefault();
  }

  init({ spawnTargetId }) {
    this._preferredWalkBody = spawnTargetId;

    // Body is a sphere for simplicity
    this.body = new CANNON.Body({
      mass: Config.player.mass,
      material: this.physics.materialDefault,
      fixedRotation: true,
    });
    this.body.addShape(new CANNON.Sphere(Config.player.radius));
    this.body.linearDamping = 0.15;
    this.body.angularDamping = 1.0;
    this.body.collisionFilterGroup = 2;
    this.body.collisionFilterMask = 1 | 2;

    const spawn = this._computeSpawnPosition();
    this.body.position.set(spawn.x, spawn.y, spawn.z);

    this.physics.addDynamicBody(this.body);

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('contextmenu', this._onContextMenu);
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('contextmenu', this._onContextMenu);

    if (this.body) this.physics.removeDynamicBody(this.body);
  }

  isFlightEnabled() {
    return this._modeFlight;
  }

  getPosition() {
    return new THREE.Vector3(this.body.position.x, this.body.position.y, this.body.position.z);
  }

  _computeSpawnPosition() {
    const planetId = Config.player.spawnAbovePlanet;
    const state = this.nbody.getBody(planetId);
    const cfg = Config.bodies[planetId];
    if (!state || !cfg) return new THREE.Vector3(0, 10, 0);

    const up = new THREE.Vector3(0, 1, 0);
    return state.position.clone().add(up.multiplyScalar(cfg.radius + Config.player.spawnAltitude));
  }

  toggleFlight() {
    this._modeFlight = !this._modeFlight;

    // Tie cinematic third-person to flight mode (no extra UX key).
    this._cameraThird = this._modeFlight;
    this._cameraLerp = 0;

    if (this._modeFlight) {
      this.body.linearDamping = 1 - Config.player.flight.damping;
    } else {
      this.body.linearDamping = 0.15;
    }

    this.debug.log('Flight mode', this._modeFlight);
  }

  _onMouseMoveInternal(e) {
    if (document.pointerLockElement !== this.domElement) return;
    this._mouseDelta.x += e.movementX;
    this._mouseDelta.y += e.movementY;
  }

  _onMouseDownInternal(e) {
    // Right-click grab
    if (e.button === 2) {
      this._tryGrab();
    }
  }

  _onMouseUpInternal(e) {
    if (e.button === 2) {
      this._releaseGrab();
    }
  }

  _tryGrab() {
    // Find nearest micro body within range (simple proximity check)
    const p = this.body.position;
    let best = null;
    let bestDist2 = Infinity;

    for (const b of this.physics.dynamicBodies) {
      if (b === this.body) continue;
      if (b.type !== CANNON.Body.DYNAMIC) continue;

      const dx = b.position.x - p.x;
      const dy = b.position.y - p.y;
      const dz = b.position.z - p.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bestDist2) {
        bestDist2 = d2;
        best = b;
      }
    }

    if (!best) return;
    if (bestDist2 > Config.player.grab.maxDistance * Config.player.grab.maxDistance) return;

    this._grabbedBody = best;
    this.physics.setGrabbed({ body: best, targetBody: this.body });
  }

  _releaseGrab() {
    this._grabbedBody = null;
    this.physics.clearGrabbed();
  }

  _getWalkGravityUp() {
    const id = this._preferredWalkBody;
    const state = this.nbody.getBody(id);
    if (!state) return new THREE.Vector3(0, 1, 0);

    const p = this.getPosition();
    const up = p.sub(state.position);
    return safeNormalize(up, new THREE.Vector3(0, 1, 0));
  }

  _getCameraBasis(up) {
    // Camera forward/right in the tangent plane to up
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

    const f = safeNormalize(projectOnPlane(forward, up), new THREE.Vector3(0, 0, -1));
    const r = safeNormalize(projectOnPlane(right, up), new THREE.Vector3(1, 0, 0));
    return { f, r };
  }

  update({ dt }) {
    // Handle one-shot toggles
    if (this._keys.has('KeyF')) {
      this._keys.delete('KeyF');
      this.toggleFlight();
    }

    this._updateLook(dt);

    if (this._modeFlight) {
      this._updateFlight(dt);
    } else {
      this._updateWalk(dt);
    }

    this._updateCamera(dt);
  }

  _updateLook(dt) {
    if (document.pointerLockElement !== this.domElement) {
      this._mouseDelta.x = 0;
      this._mouseDelta.y = 0;
      return;
    }

    const sensitivity = 0.0022;
    this._yaw -= this._mouseDelta.x * sensitivity;
    this._pitch -= this._mouseDelta.y * sensitivity;
    this._mouseDelta.x = 0;
    this._mouseDelta.y = 0;

    this._pitch = clamp(this._pitch, -1.4, 1.4);

    // Build camera orientation; in walking mode we will align roll via gravity up in camera update
    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this._yaw);
    const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this._pitch);
    this.camera.quaternion.copy(qYaw).multiply(qPitch);
  }

  _updateWalk(dt) {
    // Tangential movement with up aligned to planet center
    const up = this._getWalkGravityUp();

    const { f, r } = this._getCameraBasis(up);

    let moveX = 0;
    let moveZ = 0;
    if (this._keys.has('KeyW')) moveZ += 1;
    if (this._keys.has('KeyS')) moveZ -= 1;
    if (this._keys.has('KeyD')) moveX += 1;
    if (this._keys.has('KeyA')) moveX -= 1;

    const wish = new THREE.Vector3();
    wish.addScaledVector(f, moveZ);
    wish.addScaledVector(r, moveX);

    const wishLen = wish.length();
    if (wishLen > 1e-6) wish.multiplyScalar(1 / wishLen);

    // Ground check (simple): consider grounded if close to planet surface and moving toward it slowly
    const planetState = this.nbody.getBody(this._preferredWalkBody);
    const planetCfg = Config.bodies[this._preferredWalkBody];
    let grounded = false;
    if (planetState && planetCfg) {
      const p = this.getPosition();
      const dist = p.distanceTo(planetState.position);
      grounded = dist <= planetCfg.radius + Config.player.radius + 0.08;
    }

    const speed = Config.player.walk.speed;
    const accel = grounded ? speed * 18 : speed * 18 * Config.player.walk.airControl;

    // Apply acceleration in the tangent plane
    const forceDir = wish;
    const fx = forceDir.x * accel * this.body.mass;
    const fy = forceDir.y * accel * this.body.mass;
    const fz = forceDir.z * accel * this.body.mass;

    this.body.applyForce(new CANNON.Vec3(fx, fy, fz));

    // Jump
    if (grounded && this._keys.has('Space')) {
      this._keys.delete('Space');
      const jump = Config.player.walk.jumpSpeed;
      this.body.velocity.x += up.x * jump;
      this.body.velocity.y += up.y * jump;
      this.body.velocity.z += up.z * jump;
    }

    // Damping tuning
    if (grounded) {
      this.body.velocity.x *= Config.player.walk.groundDamping;
      this.body.velocity.y *= Config.player.walk.groundDamping;
      this.body.velocity.z *= Config.player.walk.groundDamping;
    } else {
      this.body.velocity.x *= Config.player.walk.airDamping;
      this.body.velocity.y *= Config.player.walk.airDamping;
      this.body.velocity.z *= Config.player.walk.airDamping;
    }

    // Keep camera roll aligned to up
    this._alignCameraUp(up, dt);
  }

  _updateFlight(dt) {
    // 6-DOF relative to camera orientation
    let moveForward = 0;
    let moveRight = 0;
    let moveUp = 0;

    if (this._keys.has('KeyW')) moveForward += 1;
    if (this._keys.has('KeyS')) moveForward -= 1;
    if (this._keys.has('KeyD')) moveRight += 1;
    if (this._keys.has('KeyA')) moveRight -= 1;
    if (this._keys.has('Space')) moveUp += 1;
    if (this._keys.has('ShiftLeft') || this._keys.has('ShiftRight')) moveUp -= 1;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);

    const wish = new THREE.Vector3();
    wish.addScaledVector(forward, moveForward);
    wish.addScaledVector(right, moveRight);
    wish.addScaledVector(up, moveUp);

    const len = wish.length();
    if (len > 1e-6) wish.multiplyScalar(1 / len);

    const speed = Config.player.flight.speed;

    // Force-based flight for smoother feel
    const accel = speed * 12;
    this.body.applyForce(new CANNON.Vec3(
      wish.x * accel * this.body.mass,
      wish.y * accel * this.body.mass,
      wish.z * accel * this.body.mass
    ));

    // Damping
    this.body.velocity.x *= Config.player.flight.damping;
    this.body.velocity.y *= Config.player.flight.damping;
    this.body.velocity.z *= Config.player.flight.damping;
  }

  _alignCameraUp(desiredUp, dt) {
    // Cinematic up alignment via slerp between current and target frame
    const currentForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const f = safeNormalize(projectOnPlane(currentForward, desiredUp), new THREE.Vector3(0, 0, -1));

    const targetRight = new THREE.Vector3().crossVectors(f, desiredUp).normalize();
    const targetUp = new THREE.Vector3().crossVectors(targetRight, f).normalize();

    const m = new THREE.Matrix4().makeBasis(targetRight, targetUp, f.clone().multiplyScalar(-1));
    const targetQ = new THREE.Quaternion().setFromRotationMatrix(m);

    this.camera.quaternion.slerp(targetQ, 1 - Math.exp(-10 * dt));
  }

  _updateCamera(dt) {
    // Smooth first-person <-> third-person transition
    const headOffset = new THREE.Vector3(0, Config.player.height * 0.5, 0);
    const p = this.getPosition();

    const fp = p.clone().add(headOffset);

    const desired = fp.clone();
    if (this._cameraThird) {
      const back = new THREE.Vector3(0, 0, 1).applyQuaternion(this.camera.quaternion);
      desired.addScaledVector(back, 6.0);
      desired.addScaledVector(new THREE.Vector3(0, 1, 0), 2.0);
    }

    const t = 1 - Math.exp(-8 * dt);
    this._tmpV.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    this._tmpV.lerp(desired, t);
    this.camera.position.copy(this._tmpV);

    // Look at head for third-person cinematic, otherwise keep view direction
    if (this._cameraThird) {
      this._tmpV2.copy(fp);
      const lookDir = this._tmpV2.sub(this.camera.position).normalize();
      const targetQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), lookDir);
      this.camera.quaternion.slerp(targetQ, 1 - Math.exp(-6 * dt));
    }
  }
}
