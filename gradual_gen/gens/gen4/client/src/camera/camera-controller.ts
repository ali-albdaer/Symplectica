/**
 * Camera controller with multiple modes: orbit, chase, free-fly.
 * Uses spring-arm smoothing and supports SOI handover focus transitions.
 */

import * as THREE from 'three';
import type { Body, Vec3, CameraMode } from '@solar-sim/shared';

const AU = 1.495978707e11;
const SCROLL_SENSITIVITY = 0.1;
const PAN_SENSITIVITY = 0.003;
const SPRING_STIFFNESS = 8.0; // spring-arm smoothing
const SPRING_DAMPING = 0.85;

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;

  // Orbit mode state
  private phi = Math.PI / 4;     // azimuthal
  private theta = Math.PI / 4;   // polar
  private distance = AU * 3;
  private minDistance = 1e4;
  private maxDistance = 1e14;

  // Target (what we're looking at — f64)
  private targetX = 0;
  private targetY = 0;
  private targetZ = 0;

  // Smooth target (spring-arm)
  private smoothX = 0;
  private smoothY = 0;
  private smoothZ = 0;

  // Spring velocity
  private velX = 0;
  private velY = 0;
  private velZ = 0;

  // Focus body
  private focusBody: Body | null = null;

  // Mode
  private mode: CameraMode = 'orbit' as CameraMode;

  // Input state
  private isDragging = false;
  private isRightDrag = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private keys = new Set<string>();

  // Free-fly
  private flySpeed = AU * 0.01;

  constructor(camera: THREE.PerspectiveCamera, container: HTMLElement) {
    this.camera = camera;
    this.container = container;
    this.smoothX = this.targetX;
    this.smoothY = this.targetY;
    this.smoothZ = this.targetZ;

    this.setupInputHandlers();
  }

  setMode(mode: CameraMode): void {
    this.mode = mode;
  }

  setTarget(pos: Vec3): void {
    this.targetX = pos.x;
    this.targetY = pos.y;
    this.targetZ = pos.z;
  }

  focusOnBody(body: Body): void {
    this.focusBody = body;
    this.setTarget(body.position);
    // Auto-set distance based on body radius
    this.distance = Math.max(body.radius * 5, this.minDistance);
  }

  getPosition(): Vec3 {
    return {
      x: this.smoothX + this.camera.position.x,
      y: this.smoothY + this.camera.position.y,
      z: this.smoothZ + this.camera.position.z,
    };
  }

  update(): void {
    const dt = 1 / 60; // assume ~60fps

    // Spring-arm smoothing toward target
    const dx = this.targetX - this.smoothX;
    const dy = this.targetY - this.smoothY;
    const dz = this.targetZ - this.smoothZ;

    this.velX = (this.velX + dx * SPRING_STIFFNESS * dt) * SPRING_DAMPING;
    this.velY = (this.velY + dy * SPRING_STIFFNESS * dt) * SPRING_DAMPING;
    this.velZ = (this.velZ + dz * SPRING_STIFFNESS * dt) * SPRING_DAMPING;

    this.smoothX += this.velX;
    this.smoothY += this.velY;
    this.smoothZ += this.velZ;

    switch (this.mode) {
      case 'orbit':
        this.updateOrbit();
        break;
      case 'chase':
        this.updateChase();
        break;
      case 'freefly':
        this.updateFreeFly(dt);
        break;
      default:
        this.updateOrbit();
    }
  }

  private updateOrbit(): void {
    // Spherical coords to camera position (relative to smooth target)
    const sinTheta = Math.sin(this.theta);
    const cosTheta = Math.cos(this.theta);
    const sinPhi = Math.sin(this.phi);
    const cosPhi = Math.cos(this.phi);

    this.camera.position.set(
      this.distance * sinTheta * cosPhi,
      this.distance * cosTheta,
      this.distance * sinTheta * sinPhi,
    );

    this.camera.lookAt(0, 0, 0); // Look at origin (floating origin = target)
    this.camera.up.set(0, 1, 0);
  }

  private updateChase(): void {
    if (!this.focusBody) {
      this.updateOrbit();
      return;
    }

    // Chase: position behind the body's velocity vector
    const vel = this.focusBody.velocity;
    const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);

    if (speed > 0) {
      const behind = {
        x: -vel.x / speed * this.distance,
        y: -vel.y / speed * this.distance * 0.3,
        z: -vel.z / speed * this.distance,
      };
      this.camera.position.set(behind.x, behind.y + this.distance * 0.2, behind.z);
    } else {
      this.camera.position.set(0, this.distance * 0.3, this.distance);
    }

    this.camera.lookAt(0, 0, 0);
  }

  private updateFreeFly(dt: number): void {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize();
    const up = this.camera.up.clone();

    const speed = this.flySpeed * (this.keys.has('Shift') ? 10 : 1);

    if (this.keys.has('w') || this.keys.has('W')) {
      this.camera.position.addScaledVector(forward, speed * dt);
    }
    if (this.keys.has('s') || this.keys.has('S')) {
      this.camera.position.addScaledVector(forward, -speed * dt);
    }
    if (this.keys.has('a') || this.keys.has('A')) {
      this.camera.position.addScaledVector(right, -speed * dt);
    }
    if (this.keys.has('d') || this.keys.has('D')) {
      this.camera.position.addScaledVector(right, speed * dt);
    }
    if (this.keys.has('q') || this.keys.has('Q')) {
      this.camera.position.addScaledVector(up, speed * dt);
    }
    if (this.keys.has('e') || this.keys.has('E')) {
      this.camera.position.addScaledVector(up, -speed * dt);
    }
  }

  private setupInputHandlers(): void {
    const el = this.container;

    // Mouse wheel: zoom
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = 1 + Math.sign(e.deltaY) * SCROLL_SENSITIVITY;
      this.distance *= factor;
      this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
      this.flySpeed = this.distance * 0.01; // Adjust fly speed to zoom level
    }, { passive: false });

    // Mouse down
    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.isRightDrag = e.button === 2;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    // Mouse move
    el.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      if (this.mode === 'freefly' as CameraMode || this.isRightDrag) {
        // Rotate camera (free look)
        const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
        euler.y -= dx * PAN_SENSITIVITY;
        euler.x -= dy * PAN_SENSITIVITY;
        euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, euler.x));
        this.camera.quaternion.setFromEuler(euler);
      } else {
        // Orbit rotation
        this.phi -= dx * PAN_SENSITIVITY;
        this.theta = Math.max(0.01, Math.min(Math.PI - 0.01, this.theta + dy * PAN_SENSITIVITY));
      }
    });

    // Mouse up
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Context menu (prevent)
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    // Keyboard
    window.addEventListener('keydown', (e) => this.keys.add(e.key));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key));

    // Touch support (basic)
    let lastTouchDist = 0;
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist = Math.sqrt(dx * dx + dy * dy);
      }
    });

    el.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.lastMouseX;
        const dy = e.touches[0].clientY - this.lastMouseY;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
        this.phi -= dx * PAN_SENSITIVITY;
        this.theta = Math.max(0.01, Math.min(Math.PI - 0.01, this.theta + dy * PAN_SENSITIVITY));
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastTouchDist > 0) {
          const factor = lastTouchDist / dist;
          this.distance *= factor;
          this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
        }
        lastTouchDist = dist;
      }
    }, { passive: false });

    el.addEventListener('touchend', () => {
      this.isDragging = false;
      lastTouchDist = 0;
    });
  }
}
