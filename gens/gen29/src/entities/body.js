import { THREE } from '../vendor.js';

let _id = 1;

export class Body {
  constructor({
    name,
    type,
    mass,
    radius,
    position,
    velocity,
    mesh,
    emissiveStrength = 0,
  }) {
    this.id = `${type}_${_id++}`;

    this.name = name;
    this.type = type;
    this.mass = mass;
    this.radius = radius;

    this.position = position ? position.clone() : new THREE.Vector3();
    this.velocity = velocity ? velocity.clone() : new THREE.Vector3();

    this.rotation = new THREE.Quaternion();

    this.mesh = mesh || null;
    this.emissiveStrength = emissiveStrength;

    this.spinRadPerSec = 0;
    this.spinAxis = new THREE.Vector3(0, 1, 0);
  }
}
