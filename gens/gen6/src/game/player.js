import * as THREE from 'three';
import { Units } from '../utils/units.js';

export class Player {
  constructor({ Globals, nbody, cameraRig }) {
    this.Globals = Globals;
    this.nbody = nbody;
    this.cameraRig = cameraRig;

    this.mode = 'walk'; // 'walk' | 'free'

    this.positionAU = new THREE.Vector3();
    this.velocityAUPerDay = new THREE.Vector3();

    this.up = new THREE.Vector3(0, 1, 0);

    this.keys = new Set();
    this.yaw = 0;
    this.pitch = 0;

    this._tmp = new THREE.Vector3();
  }

  getColliderRadiusAU() {
    // Approx capsule -> sphere radius (simple)
    return Units.metersToAU(0.35);
  }

  setSpawnOnBody(bodyId) {
    const idx = this.nbody.getBodyIndexById(bodyId);
    if (idx < 0) throw new Error(`Body not found: ${bodyId}`);

    const body = this.nbody.bodies[idx];
    const bodyPos = this.nbody.pos[idx];

    // Spawn near surface on +Y axis of world for now.
    const heightAU = Units.metersToAU(this.Globals.player.heightMeters);
    const surfaceAU = body.radiusAU;

    this.positionAU.copy(bodyPos).add(new THREE.Vector3(0, surfaceAU + heightAU, 0));
    this.velocityAUPerDay.set(0, 0, 0);
  }

  attachInput(domElement) {
    window.addEventListener('keydown', e => {
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', e => {
      this.keys.delete(e.code);
    });

    window.addEventListener('mousemove', e => {
      if (document.pointerLockElement !== domElement) return;
      const sens = this.Globals.player.mouseSensitivity;
      this.yaw -= e.movementX * sens;
      this.pitch -= e.movementY * sens;
      this.cameraRig.setLookAngles(this.yaw, this.pitch);
    });
  }

  toggleFreeFlight() {
    this.mode = this.mode === 'walk' ? 'free' : 'walk';
    if (this.mode === 'free') {
      // In free-flight, cancel vertical velocity for predictability.
      this.velocityAUPerDay.set(0, 0, 0);
    }
  }

  toggleCameraMode() {
    this.cameraRig.toggleMode();
  }

  getModeLabel() {
    return this.mode === 'free' ? 'Free-flight' : 'Walk';
  }

  getCameraModeLabel() {
    return this.cameraRig.mode === 'third' ? 'Third' : 'First';
  }

  getPositionAU() {
    return this.positionAU;
  }

  // Gravity: total acceleration from all celestial bodies.
  // Up vector + collision body use nearest body for local "ground".
  _gravityAt(pointAU) {
    const G = this.Globals.sim.G;
    const eps2 = this.Globals.sim.softeningAU * this.Globals.sim.softeningAU;

    let bestIdx = -1;
    let bestR2 = Infinity;
    const a = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < this.nbody.bodies.length; i++) {
      const rVec = this._tmp.copy(this.nbody.pos[i]).sub(pointAU);
      const r2raw = rVec.lengthSq();
      if (r2raw < bestR2) {
        bestR2 = r2raw;
        bestIdx = i;
      }

      const r2 = r2raw + eps2;
      const invR = 1 / Math.sqrt(r2);
      const invR3 = invR * invR * invR;
      a.addScaledVector(rVec, G * this.nbody.bodies[i].mass * invR3);
    }

    if (bestIdx < 0) return { a, up: new THREE.Vector3(0, 1, 0), bodyIdx: -1 };

    const up = new THREE.Vector3().copy(pointAU).sub(this.nbody.pos[bestIdx]).normalize();
    return { a, up, bodyIdx: bestIdx };
  }

  update({ dtDays }) {
    // Convert movement speeds to AU/day
    const walkAUPerDay = Units.metersToAU(this.Globals.player.walkSpeedMps) * 86400;
    const jumpAUPerDay = Units.metersToAU(this.Globals.player.jumpSpeedMps) * 86400;

    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    const move = new THREE.Vector3();
    if (this.keys.has('KeyW')) move.add(forward);
    if (this.keys.has('KeyS')) move.sub(forward);
    if (this.keys.has('KeyD')) move.add(right);
    if (this.keys.has('KeyA')) move.sub(right);

    if (move.lengthSq() > 0) move.normalize();

    const speed = walkAUPerDay;

    if (this.mode === 'free') {
      const up = new THREE.Vector3(0, 1, 0);
      if (this.keys.has('Space')) move.add(up);
      if (this.keys.has('ShiftLeft')) move.sub(up);
      if (move.lengthSq() > 0) move.normalize();

      this.positionAU.addScaledVector(move, speed * dtDays);
      this.up.set(0, 1, 0);
      return;
    }

    // Walking: use gravity toward nearest body.
    const { a, up, bodyIdx } = this._gravityAt(this.positionAU);
    this.up.copy(up);

    // Tangent basis from up and yaw-forward.
    const tangentRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), this.up);
    if (tangentRight.lengthSq() < 1e-10) tangentRight.set(1, 0, 0);
    tangentRight.normalize();
    const tangentForward = new THREE.Vector3().crossVectors(this.up, tangentRight).normalize();

    const desiredVel = new THREE.Vector3();
    desiredVel.addScaledVector(tangentForward, move.dot(forward) * speed);
    desiredVel.addScaledVector(tangentRight, move.dot(right) * speed);

    // Integrate velocity with gravity.
    this.velocityAUPerDay.addScaledVector(a, dtDays);

    // Jump: impulsive velocity along up.
    if (this.keys.has('Space')) {
      // crude ground check: if near surface
      const body = this.nbody.bodies[bodyIdx];
      const center = this.nbody.pos[bodyIdx];
      const r = this._tmp.copy(this.positionAU).sub(center).length();
      const heightAU = Units.metersToAU(this.Globals.player.heightMeters);
      const minR = body.radiusAU + heightAU;
      if (r <= minR * 1.002) {
        this.velocityAUPerDay.addScaledVector(this.up, jumpAUPerDay);
      }
    }

    // Blend horizontal velocity toward desired (simple damping for controllability)
    const vHoriz = this._tmp.copy(this.velocityAUPerDay).sub(this.up.clone().multiplyScalar(this.velocityAUPerDay.dot(this.up)));
    vHoriz.lerp(desiredVel, 0.12);

    const vVert = this.up.clone().multiplyScalar(this.velocityAUPerDay.dot(this.up));
    this.velocityAUPerDay.copy(vHoriz).add(vVert);

    // Integrate position.
    this.positionAU.addScaledVector(this.velocityAUPerDay, dtDays);

    // Prevent sinking into the planet: clamp to surface.
    if (bodyIdx >= 0) {
      const body = this.nbody.bodies[bodyIdx];
      const center = this.nbody.pos[bodyIdx];
      const rVec = this._tmp.copy(this.positionAU).sub(center);
      const r = rVec.length();
      const heightAU = Units.metersToAU(this.Globals.player.heightMeters);
      const minR = body.radiusAU + heightAU;
      if (r < minR) {
        rVec.normalize().multiplyScalar(minR);
        this.positionAU.copy(center).add(rVec);

        // remove inward velocity
        const vn = this.velocityAUPerDay.dot(this.up);
        if (vn < 0) this.velocityAUPerDay.addScaledVector(this.up, -vn);
      }
    }
  }
}
