import * as THREE from 'three';

// Very small rigid-body-ish objects affected by gravity.
// Keeps things debuggable and fast: spheres only, with simple collisions.

export class RigidObjectSystem {
  constructor({ Globals, nbody, scene }) {
    this.Globals = Globals;
    this.nbody = nbody;
    this.scene = scene;

    /** @type {Array<{id:string,mass:number,radiusAU:number,mesh:THREE.Mesh}>} */
    this.objects = [];
    /** @type {THREE.Vector3[]} */
    this.pos = [];
    /** @type {THREE.Vector3[]} */
    this.vel = [];

    this._tmp = new THREE.Vector3();
  }

  addSphere({ id, mass, radiusAU, positionAU, velocityAUPerDay, color = 0x88ccaa }) {
    const geom = new THREE.SphereGeometry(radiusAU, 18, 14);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.scene.add(mesh);

    const obj = { id, mass, radiusAU, mesh };
    this.objects.push(obj);
    this.pos.push(positionAU.clone());
    this.vel.push(velocityAUPerDay.clone());

    mesh.position.copy(positionAU);
    return obj;
  }

  // Total gravitational acceleration at point (sum over all celestial bodies).
  gravityAt(pointAU) {
    const G = this.Globals.sim.G;
    const eps2 = this.Globals.sim.softeningAU * this.Globals.sim.softeningAU;

    const a = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < this.nbody.bodies.length; i++) {
      const body = this.nbody.bodies[i];
      const r = this._tmp.copy(this.nbody.pos[i]).sub(pointAU);
      const r2 = r.lengthSq() + eps2;
      const invR = 1 / Math.sqrt(r2);
      const invR3 = invR * invR * invR;
      a.addScaledVector(r, G * body.mass * invR3);
    }
    return a;
  }

  nearestBodyIndex(pointAU) {
    let bestIdx = -1;
    let bestR2 = Infinity;
    for (let i = 0; i < this.nbody.bodies.length; i++) {
      const r2 = this._tmp.copy(this.nbody.pos[i]).sub(pointAU).lengthSq();
      if (r2 < bestR2) {
        bestR2 = r2;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  step(dtDays, { playerPosAU, playerRadiusAU }) {
    const restitution = 0.25;
    const linearDamping = 0.002;

    for (let i = 0; i < this.objects.length; i++) {
      // integrate
      const a = this.gravityAt(this.pos[i]);
      this.vel[i].addScaledVector(a, dtDays);
      this.vel[i].multiplyScalar(1 - linearDamping);
      this.pos[i].addScaledVector(this.vel[i], dtDays);

      // collide with nearest body surface (sphere)
      const bIdx = this.nearestBodyIndex(this.pos[i]);
      if (bIdx >= 0) {
        const body = this.nbody.bodies[bIdx];
        const center = this.nbody.pos[bIdx];
        const rVec = this._tmp.copy(this.pos[i]).sub(center);
        const r = rVec.length();
        const minR = body.radiusAU + this.objects[i].radiusAU;
        if (r < minR) {
          rVec.normalize();
          // push out
          this.pos[i].copy(center).addScaledVector(rVec, minR);

          // reflect normal velocity
          const v = this.vel[i];
          const vn = v.dot(rVec);
          if (vn < 0) v.addScaledVector(rVec, -(1 + restitution) * vn);
        }
      }

      // collide with player (sphere)
      if (playerPosAU && playerRadiusAU) {
        const d = this._tmp.copy(this.pos[i]).sub(playerPosAU);
        const dist = d.length();
        const minD = playerRadiusAU + this.objects[i].radiusAU;
        if (dist > 1e-12 && dist < minD) {
          d.normalize();
          const push = minD - dist;
          this.pos[i].addScaledVector(d, push);

          // Simple momentum exchange (player treated as heavy)
          const v = this.vel[i];
          const vn = v.dot(d);
          if (vn < 0) v.addScaledVector(d, -vn * 1.1);
        }
      }

      // sync mesh
      this.objects[i].mesh.position.copy(this.pos[i]);
    }
  }
}
