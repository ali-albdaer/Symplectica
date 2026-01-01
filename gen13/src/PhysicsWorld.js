import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { Config } from './Config.js';

export class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
    this.world.solver.iterations = 10;
    this.world.allowSleep = true;
    this.bodies = [];
    this.microBodies = [];
    this.playerBody = null;
  }

  addBody(celestial) {
    this.bodies.push(celestial);
  }

  addMicro(body) {
    this.microBodies.push(body);
  }

  setPlayer(body) {
    this.playerBody = body;
  }

  step(dt) {
    // Pairwise gravity
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        this._applyGravity(this.bodies[i].body, this.bodies[j].body);
      }
    }
    // Celestials on micro bodies
    for (const micro of this.microBodies) {
      for (const celestial of this.bodies) {
        this._applyGravity(micro, celestial.body);
      }
    }
    // Micro on player
    if (this.playerBody) {
      for (const celestial of this.bodies) {
        this._applyGravity(this.playerBody, celestial.body);
      }
    }
    this.world.step(dt);
  }

  _applyGravity(bodyA, bodyB) {
    const dx = bodyB.position.x - bodyA.position.x;
    const dy = bodyB.position.y - bodyA.position.y;
    const dz = bodyB.position.z - bodyA.position.z;
    const distSq = dx * dx + dy * dy + dz * dz + 1e-6;
    const dist = Math.sqrt(distSq);
    const forceMag = (Config.G * bodyA.mass * bodyB.mass) / distSq;
    const nx = dx / dist;
    const ny = dy / dist;
    const nz = dz / dist;
    const fx = nx * forceMag;
    const fy = ny * forceMag;
    const fz = nz * forceMag;
    bodyA.applyForce(new CANNON.Vec3(fx, fy, fz), bodyA.position);
    bodyB.applyForce(new CANNON.Vec3(-fx, -fy, -fz), bodyB.position);
  }
}
