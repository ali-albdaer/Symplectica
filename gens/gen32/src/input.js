import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { clamp, buildOrientation, projectOnPlane } from './utils/math.js';

export class InputController {
  constructor(rendererDom, player) {
    this.dom = rendererDom;
    this.player = player;
    this.keys = new Set();
    this.pointerLocked = false;
    this.yaw = 0;
    this.pitch = 0;
    this.isFreeFlight = false;
    this.thirdPerson = false;
    this.grabbed = null;
    this.onToggleMenu = null;

    this.lookSpeed = 0.0025;
    this.initEvents();
  }

  initEvents() {
    window.addEventListener('keydown', e => {
      if (e.repeat) return;
      if (e.key === '/') {
        if (this.onToggleMenu) this.onToggleMenu();
        return;
      }
      if (e.key === 'v' || e.key === 'V') this.thirdPerson = !this.thirdPerson;
      if (e.key === 'f' || e.key === 'F') this.isFreeFlight = !this.isFreeFlight;
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', e => {
      this.keys.delete(e.key.toLowerCase());
    });

    this.dom.addEventListener('click', () => {
      if (!this.pointerLocked) this.dom.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.dom;
    });

    document.addEventListener('mousemove', e => {
      if (!this.pointerLocked) return;
      this.yaw -= e.movementX * this.lookSpeed;
      this.pitch -= e.movementY * this.lookSpeed;
      this.pitch = clamp(this.pitch, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
    });

    window.addEventListener('contextmenu', e => {
      e.preventDefault();
      this.keys.add('grab');
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 2) this.keys.delete('grab');
    });
  }

  releasePointer() {
    if (this.pointerLocked) document.exitPointerLock();
  }

  setPointerLock(enabled) {
    if (enabled && !this.pointerLocked) this.dom.requestPointerLock();
    if (!enabled && this.pointerLocked) document.exitPointerLock();
  }

  computeMovement(up) {
    const { forward, right, orientation } = buildOrientation(up, this.yaw, this.pitch);
    let wishDir = new THREE.Vector3();
    if (this.keys.has('w')) wishDir.add(forward);
    if (this.keys.has('s')) wishDir.add(forward.clone().multiplyScalar(-1));
    if (this.keys.has('a')) wishDir.add(right.clone().multiplyScalar(-1));
    if (this.keys.has('d')) wishDir.add(right);

    if (!this.isFreeFlight) {
      wishDir = projectOnPlane(wishDir, up);
    }

    wishDir.normalize();

    const ascend = this.keys.has(' ');
    const descend = this.keys.has('shift');
    const grabbing = this.keys.has('grab');

    return { forward, right, up, orientation, wishDir, ascend, descend, grabbing };
  }
}
