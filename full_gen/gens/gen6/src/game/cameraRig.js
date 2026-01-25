import * as THREE from 'three';
import { clamp, lerp } from '../utils/math.js';

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.mode = 'first'; // 'first' | 'third'

    this.yaw = 0;
    this.pitch = 0;

    this._smoothedPos = new THREE.Vector3();
    this._targetPos = new THREE.Vector3();
    this._tmp = new THREE.Vector3();
  }

  toggleMode() {
    this.mode = this.mode === 'first' ? 'third' : 'first';
  }

  setLookAngles(yaw, pitch) {
    this.yaw = yaw;
    this.pitch = clamp(pitch, -Math.PI * 0.49, Math.PI * 0.49);
  }

  update({ dt, playerWorldPos, up, thirdPersonDistanceAU }) {
    // Forward from yaw/pitch in local tangent frame.
    const cy = Math.cos(this.yaw);
    const sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch);
    const sp = Math.sin(this.pitch);

    // Build a basis given up.
    const forward = new THREE.Vector3(sy * cp, sp, cy * cp).normalize();

    // Align forward to the player's local up by rotating from world Y-up to current up.
    // Approx: assume world up is close; we remap by constructing tangent basis.
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(worldUp, up);
    const angle = Math.asin(clamp(right.length(), -1, 1));
    if (right.lengthSq() > 1e-12) {
      right.normalize();
      const q = new THREE.Quaternion().setFromAxisAngle(right, angle);
      forward.applyQuaternion(q);
    }

    this._targetPos.copy(playerWorldPos);

    if (this.mode === 'first') {
      // Slight camera height already included in player position.
      this._smoothedPos.copy(this._targetPos);
      this.camera.position.copy(this._smoothedPos);
      this.camera.lookAt(this._tmp.copy(this._targetPos).add(forward));
      return;
    }

    // Third person: cinematic spring.
    const desired = this._tmp.copy(this._targetPos).addScaledVector(forward, -thirdPersonDistanceAU).addScaledVector(up, thirdPersonDistanceAU * 0.18);

    const follow = 1 - Math.pow(0.001, dt);
    this._smoothedPos.lerp(desired, follow);

    this.camera.position.copy(this._smoothedPos);
    this.camera.lookAt(this._targetPos);
  }
}
