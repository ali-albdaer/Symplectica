import { Vector3 } from "https://unpkg.com/three@0.164.0/build/three.module.js";

export class DynamicObject {
  constructor({ id, mass, radius, color, emissive }) {
    this.id = id;
    this.mass = mass;
    this.radius = radius;
    this.color = color;
    this.emissive = emissive;
    this.position = new Vector3();
    this.velocity = new Vector3();
    this.acc = new Vector3();
  }
}

export class Player {
  constructor() {
    this.position = new Vector3();
    this.velocity = new Vector3();
    this.up = new Vector3(0, 1, 0);
    this.forward = new Vector3(0, 0, -1);
    this.pitch = 0;
    this.yaw = 0;
    this.isFlying = false;
    this.holding = null;
  }
}
