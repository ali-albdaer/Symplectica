/**
 * Floating Origin Camera System
 * ==============================
 * Keeps the camera at origin (0,0,0) and moves the universe around it.
 * Uses Float64 for positions, Float32 for rendering.
 */

import * as THREE from 'three';
import { Vector3 as Vec3, RECENTER_THRESHOLD } from '@space-sim/shared';

export class FloatingOriginCamera {
  // Three.js camera (always at origin)
  public readonly camera: THREE.PerspectiveCamera;

  // True world position (Float64 precision)
  private worldPosition: Vec3;

  // Accumulated origin offset
  private originOffset: Vec3;

  // Camera orientation
  public yaw: number = 0;
  public pitch: number = 0;

  // Logarithmic depth buffer scale
  private logDepthC: number;

  constructor(fov: number = 75, aspect: number = 1, near: number = 0.1, far: number = 1e16) {
    // Create perspective camera at origin
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 0, 0);

    // Logarithmic depth constant
    this.logDepthC = 2.0 / Math.log2(far + 1);

    // Initialize world position
    this.worldPosition = new Vec3(0, 0, 0);
    this.originOffset = new Vec3(0, 0, 0);
  }

  /**
   * Set the true world position (Float64)
   */
  setWorldPosition(x: number, y: number, z: number): void {
    this.worldPosition.set(x, y, z);
    this.checkRecenter();
  }

  /**
   * Get true world position (Float64)
   */
  getWorldPosition(): Vec3 {
    return this.worldPosition.clone();
  }

  /**
   * Get origin offset
   */
  getOriginOffset(): Vec3 {
    return this.originOffset.clone();
  }

  /**
   * Convert world position to render position (relative to floating origin)
   */
  worldToRender(worldPos: Vec3): THREE.Vector3 {
    return new THREE.Vector3(
      worldPos.x - this.originOffset.x,
      worldPos.y - this.originOffset.y,
      worldPos.z - this.originOffset.z
    );
  }

  /**
   * Convert render position to world position
   */
  renderToWorld(renderPos: THREE.Vector3): Vec3 {
    return new Vec3(
      renderPos.x + this.originOffset.x,
      renderPos.y + this.originOffset.y,
      renderPos.z + this.originOffset.z
    );
  }

  /**
   * Check if we need to recenter the origin
   */
  private checkRecenter(): void {
    const dx = this.worldPosition.x - this.originOffset.x;
    const dy = this.worldPosition.y - this.originOffset.y;
    const dz = this.worldPosition.z - this.originOffset.z;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq > RECENTER_THRESHOLD * RECENTER_THRESHOLD) {
      this.recenter();
    }
  }

  /**
   * Recenter the floating origin to camera position
   */
  recenter(): Vec3 {
    const delta = new Vec3(
      this.worldPosition.x - this.originOffset.x,
      this.worldPosition.y - this.originOffset.y,
      this.worldPosition.z - this.originOffset.z
    );

    // Move origin to camera world position
    this.originOffset.copy(this.worldPosition);

    return delta;
  }

  /**
   * Set camera orientation from yaw/pitch
   */
  setOrientation(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));

    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
    this.camera.quaternion.copy(quaternion);
  }

  /**
   * Rotate camera by delta yaw/pitch
   */
  rotate(deltaYaw: number, deltaPitch: number): void {
    this.setOrientation(this.yaw + deltaYaw, this.pitch + deltaPitch);
  }

  /**
   * Get forward direction
   */
  getForward(): THREE.Vector3 {
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.camera.quaternion);
    return forward;
  }

  /**
   * Get right direction
   */
  getRight(): THREE.Vector3 {
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(this.camera.quaternion);
    return right;
  }

  /**
   * Get up direction
   */
  getUp(): THREE.Vector3 {
    const up = new THREE.Vector3(0, 1, 0);
    up.applyQuaternion(this.camera.quaternion);
    return up;
  }

  /**
   * Set aspect ratio
   */
  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Set FOV
   */
  setFOV(fov: number): void {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Get the log depth constant for shaders
   */
  getLogDepthC(): number {
    return this.logDepthC;
  }
}
