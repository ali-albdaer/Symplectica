import { THREE } from '../vendor.js';
import { Body } from './body.js';
import { clamp } from '../utils/math.js';

export class Player {
  constructor({ THREE, configStore, scene, world, input, debugOverlay, planetAnchor }) {
    this.THREE = THREE;
    this.configStore = configStore;
    this.scene = scene;
    this.world = world;
    this.input = input;
    this.debugOverlay = debugOverlay;

    this.planetAnchor = planetAnchor;

    this.flightEnabled = false;
    this.onGround = false;

    this.viewQuat = new THREE.Quaternion();
    // Initialize facing -Z.
    this.viewQuat.identity();

    this._tmpV = new THREE.Vector3();
    this._tmpV2 = new THREE.Vector3();
    this._tmpQ = new THREE.Quaternion();
    this._tmpUp = new THREE.Vector3();
    this._tmpRight = new THREE.Vector3();
    this._tmpFwd = new THREE.Vector3();
    this._tmpQuat = new THREE.Quaternion();

    const spawn = this._computeSpawnOnPlanet();

    this.body = new Body({
      name: 'Player',
      type: 'player',
      mass: configStore.get('player.mass'),
      radius: configStore.get('player.radius'),
      position: spawn,
      velocity: new THREE.Vector3(),
      mesh: null,
    });

    // Visible capsule-ish proxy.
    const geom = new THREE.CapsuleGeometry(
      configStore.get('player.radius'),
      Math.max(0.001, configStore.get('player.height')),
      8,
      12
    );
    const mat = new THREE.MeshStandardMaterial({ color: 0xd6e3ff, roughness: 0.9, metalness: 0.0 });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.castShadow = configStore.get('graphics.enableShadows');
    this.mesh.receiveShadow = configStore.get('graphics.enableShadows');
    scene.add(this.mesh);

    this.body.mesh = this.mesh;

    // Add player to same N-body physics list.
    world.addBody(this.body);

    // Grabbing.
    this.grabbed = null;
    this.grabDistance = 0.25;

    this._prevRightMouse = false;
  }

  _computeSpawnOnPlanet() {
    const up = new THREE.Vector3(0, 1, 0);
    const surface = this.planetAnchor.position.clone().addScaledVector(up, this.planetAnchor.radius + 0.25);
    return surface;
  }

  toggleFlight() {
    this.flightEnabled = !this.flightEnabled;
    if (this.flightEnabled) this.onGround = false;
  }

  applyLookDeltas(yawDelta, pitchDelta) {
    if (yawDelta === 0 && pitchDelta === 0) return;

    const upAxis = this._getCameraUpAxis();

    // Yaw around current up axis.
    if (yawDelta !== 0) {
      const qYaw = this._tmpQ.setFromAxisAngle(upAxis, yawDelta);
      this.viewQuat.premultiply(qYaw);
    }

    if (pitchDelta !== 0) {
      // Pitch around camera right axis.
      const right = this._tmpRight.set(1, 0, 0).applyQuaternion(this.viewQuat).normalize();
      const qPitch = this._tmpQ.setFromAxisAngle(right, pitchDelta);

      // Clamp pitch relative to upAxis.
      const proposed = this._tmpQuat.copy(this.viewQuat).premultiply(qPitch);
      const fwd = this._tmpFwd.set(0, 0, -1).applyQuaternion(proposed).normalize();
      const s = clamp(fwd.dot(upAxis), -1, 1);
      const pitch = Math.asin(s);

      const limit = 1.48; // ~85deg
      if (pitch > -limit && pitch < limit) {
        this.viewQuat.copy(proposed);
      }
    }
  }

  _getCameraUpAxis() {
    // In flight we default to world-up.
    if (this.flightEnabled || !this.planetAnchor) return this._tmpUp.set(0, 1, 0);

    const up = this._tmpUp.subVectors(this.body.position, this.planetAnchor.position);
    const len = up.length();
    if (len <= 1e-8) return this._tmpUp.set(0, 1, 0);
    return up.multiplyScalar(1 / len);
  }

  getFirstPersonCameraPose(outPos, outQuat) {
    outQuat.copy(this.viewQuat);

    // Position at top of capsule.
    const eye = this.body.position.clone();
    eye.y += this.configStore.get('player.height') * 0.5;
    outPos.copy(eye);
  }

  getThirdPersonTarget(outPos) {
    outPos.copy(this.body.position);
    outPos.y += this.configStore.get('player.height') * 0.4;
  }

  fixedUpdate(dt) {
    // Update mass/radius live.
    this.body.mass = this.configStore.get('player.mass');

    if (this.input.wasPressed('f')) {
      // handled by main as well; safe if duplicated
    }

    this._handleMovement(dt);
    this._handleGrab(dt);

    if (!this.flightEnabled) this._applyGroundConstraint(dt);
  }

  _handleMovement(dt) {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.viewQuat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.viewQuat);
    const up = new THREE.Vector3(0, 1, 0);

    // When walking, re-project movement onto local tangent plane of planet.
    let localUp = up;
    if (!this.flightEnabled && this.planetAnchor) {
      localUp = this._tmpV.subVectors(this.body.position, this.planetAnchor.position).normalize();
    }

    const move = this._tmpV2.set(0, 0, 0);
    if (this.input.isDown('w')) move.add(forward);
    if (this.input.isDown('s')) move.addScaledVector(forward, -1);
    if (this.input.isDown('d')) move.add(right);
    if (this.input.isDown('a')) move.addScaledVector(right, -1);

    if (move.lengthSq() > 0) move.normalize();

    if (this.flightEnabled) {
      const accel = this.configStore.get('player.flight.accel');
      const maxSpeed = this.configStore.get('player.flight.maxSpeed');
      const damping = this.configStore.get('player.flight.damping');

      // 6DOF: space up, shift down (relative to world up for now).
      if (this.input.isDown(' ')) move.add(localUp);
      if (this.input.isDown('Shift')) move.addScaledVector(localUp, -1);

      if (move.lengthSq() > 0) move.normalize();
      this.body.velocity.addScaledVector(move, accel * dt);

      // Damping.
      const k = Math.exp(-damping * dt);
      this.body.velocity.multiplyScalar(k);

      // Clamp speed.
      const s = this.body.velocity.length();
      if (s > maxSpeed) this.body.velocity.multiplyScalar(maxSpeed / s);
      return;
    }

    // Walking: tangent-plane acceleration + friction.
    const speed = this.configStore.get('player.walk.speed');
    // Project intended move onto plane.
    const tangent = move.sub(localUp.clone().multiplyScalar(move.dot(localUp)));
    if (tangent.lengthSq() > 0) tangent.normalize();

    // Target velocity in tangent plane.
    const v = this.body.velocity;
    const vTangent = v.clone().sub(localUp.clone().multiplyScalar(v.dot(localUp)));

    const desired = tangent.multiplyScalar(speed);
    const friction = this.configStore.get('player.walk.friction');
    const blend = 1 - Math.exp(-friction * dt);
    vTangent.lerp(desired, blend);

    // Keep radial component.
    const vRad = localUp.clone().multiplyScalar(v.dot(localUp));
    v.copy(vTangent.add(vRad));

    if (this.onGround && this.input.wasPressed(' ')) {
      const j = this.configStore.get('player.walk.jumpSpeed');
      v.addScaledVector(localUp, j);
      this.onGround = false;
    }
  }

  _applyGroundConstraint(dt) {
    if (!this.planetAnchor) return;

    const groundSnap = this.configStore.get('player.walk.groundSnap');

    const localUp = this._tmpV.subVectors(this.body.position, this.planetAnchor.position);
    const dist = localUp.length();
    if (dist <= 1e-6) return;
    localUp.multiplyScalar(1 / dist);

    const targetDist = this.planetAnchor.radius + this.configStore.get('player.radius') + 0.02;
    const penetration = targetDist - dist;

    if (penetration > -groundSnap) {
      // Snap to surface.
      this.body.position.addScaledVector(localUp, penetration);

      // Kill inward velocity.
      const vIn = this.body.velocity.dot(localUp);
      if (vIn < 0) this.body.velocity.addScaledVector(localUp, -vIn);

      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // Keep capsule upright to local up.
    const up = new THREE.Vector3(0, 1, 0);
    this._tmpQ.setFromUnitVectors(up, localUp);
    this.mesh.quaternion.copy(this._tmpQ);
  }

  _handleGrab(dt) {
    // Edge-triggered toggle on right-click.
    const rDown = this.input.isMouseDown(2);
    const rPressed = rDown && !this._prevRightMouse;
    this._prevRightMouse = rDown;

    if (rPressed && !this.grabbed) {
      // Simple nearest object within range.
      const origin = this.body.position.clone();
      origin.y += this.configStore.get('player.height') * 0.35;

      let best = null;
      let bestD = Infinity;

      for (const b of this.world.bodies) {
        if (b.type !== 'prop') continue;
        const d = b.position.distanceTo(origin);
        if (d < 0.6 && d < bestD) {
          bestD = d;
          best = b;
        }
      }

      if (best) {
        this.grabbed = best;
        this.grabDistance = clamp(bestD, 0.18, 0.5);
      }
    }

    if (!rDown && this.grabbed) {
      this.grabbed = null;
    }

    // If holding: spring towards hold point.
    if (this.grabbed) {
      const holdOrigin = this.body.position.clone();
      holdOrigin.y += this.configStore.get('player.height') * 0.35;

      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.viewQuat);
      const holdPoint = holdOrigin.addScaledVector(forward, this.grabDistance);

      const to = holdPoint.sub(this.grabbed.position);
      const k = 18.0;
      const c = 6.0;
      const acc = to.multiplyScalar(k).addScaledVector(this.grabbed.velocity, -c);

      this.grabbed.velocity.addScaledVector(acc, dt);
    }
  }

  syncVisuals(alpha) {
    // world.syncVisuals handles body meshes; player has its own.
  }
}
