import { Vec3d } from './vec3d.js';

export class Body {
  /**
   * @param {object} args
   * @param {string} args.id
   * @param {string} args.name
   * @param {number} args.massKg
   * @param {number} args.radiusM
   * @param {Vec3d} args.position
   * @param {Vec3d} args.velocity
   * @param {'celestial'|'player'|'object'} args.kind
   * @param {boolean} [args.fixed]
   */
  constructor({ id, name, massKg, radiusM, position, velocity, kind, fixed = false }) {
    this.id = id;
    this.name = name;
    this.kind = kind;

    this.massKg = massKg;
    this.invMass = massKg > 0 ? 1 / massKg : 0;

    this.radiusM = radiusM;
    this.position = position;
    this.velocity = velocity;

    this.force = new Vec3d(0, 0, 0);
    this.fixed = fixed;

    // Runtime hooks for rendering.
    this.renderObject3D = null;

    // For player/object grabbing.
    this.userData = {};
  }

  setMass(kg) {
    this.massKg = kg;
    this.invMass = kg > 0 ? 1 / kg : 0;
  }
}
