import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { Vec3d } from '../physics/vec3d.js';

export class GrabSystem {
  /**
   * @param {object} args
   * @param {THREE.PerspectiveCamera} args.camera
   * @param {import('../runtime/input.js').Input} args.input
   * @param {import('../runtime/debugLog.js').DebugLog} args.debugLog
   * @param {import('../physics/body.js').Body[]} args.objects
   */
  constructor({ camera, input, debugLog, objects }) {
    this.camera = camera;
    this.input = input;
    this.debugLog = debugLog;
    this.objects = objects;

    this.ray = new THREE.Raycaster();
    this.held = null;

    this.holdDistanceUnits = 2.0;
    this.k = 65.0;
    this.c = 12.0;

    this._prevRmb = false;
  }

  update(dtRender, bodies) {
    const rmb = this.input.isMouseDown(2);
    if (rmb && !this._prevRmb) {
      if (this.held) {
        this.held = null;
      } else {
        const picked = this._pickObject();
        if (picked) this.held = picked;
      }
    }
    this._prevRmb = rmb;
  }

  solveConstraints(dt) {
    if (!this.held) return;

    // Desired hold position in front of camera
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    const desiredU = this.camera.position.clone().add(dir.multiplyScalar(this.holdDistanceUnits));

    // Convert desired position from render units into physics meters.
    const mpu = CONFIG.render.metersPerUnit;
    const desired = new Vec3d(desiredU.x * mpu, desiredU.y * mpu, desiredU.z * mpu);

    const dx = desired.x - this.held.position.x;
    const dy = desired.y - this.held.position.y;
    const dz = desired.z - this.held.position.z;

    // Spring-damper directly on velocity (semi-implicit): dv = (k*x - c*v) * dt
    const v = this.held.velocity;
    v.x += (this.k * dx - this.c * v.x) * dt;
    v.y += (this.k * dy - this.c * v.y) * dt;
    v.z += (this.k * dz - this.c * v.z) * dt;
  }

  _pickObject() {
    const origin = this.camera.position.clone();
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    this.ray.set(origin, dir);
    this.ray.far = 4.0;

    const meshes = this.objects.map((o) => o.renderObject3D).filter(Boolean);
    const hits = this.ray.intersectObjects(meshes, false);
    if (!hits.length) return null;

    const hitObj = hits[0].object;
    const picked = this.objects.find((o) => o.renderObject3D === hitObj) || null;
    return picked;
  }
}
