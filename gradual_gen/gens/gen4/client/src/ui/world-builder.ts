/**
 * World Builder UI: Allows users to add/delete bodies and configure their
 * orbital parameters. Supports circular orbit velocity auto-calculation.
 */

import {
  type Body,
  type SimulationState,
  BodyType,
  vec3,
  G,
} from '@solar-sim/shared';

export interface WorldBuilderCallbacks {
  getState: () => SimulationState | null;
  addBody: (body: Body) => void;
  deleteBody: (id: number) => void;
  getSelectedBodyId: () => number | null;
  getNextBodyId: () => number;
}

export class WorldBuilder {
  private callbacks: WorldBuilderCallbacks;

  private nameInput!: HTMLInputElement;
  private typeSelect!: HTMLSelectElement;
  private massInput!: HTMLInputElement;
  private radiusInput!: HTMLInputElement;
  private pxInput!: HTMLInputElement;
  private pyInput!: HTMLInputElement;
  private pzInput!: HTMLInputElement;
  private vxInput!: HTMLInputElement;
  private vyInput!: HTMLInputElement;
  private vzInput!: HTMLInputElement;
  private colorInput!: HTMLInputElement;

  constructor(callbacks: WorldBuilderCallbacks) {
    this.callbacks = callbacks;
    this.bindElements();
    this.setupEvents();
  }

  private bindElements(): void {
    this.nameInput = document.getElementById('wb-name') as HTMLInputElement;
    this.typeSelect = document.getElementById('wb-type') as HTMLSelectElement;
    this.massInput = document.getElementById('wb-mass') as HTMLInputElement;
    this.radiusInput = document.getElementById('wb-radius') as HTMLInputElement;
    this.pxInput = document.getElementById('wb-px') as HTMLInputElement;
    this.pyInput = document.getElementById('wb-py') as HTMLInputElement;
    this.pzInput = document.getElementById('wb-pz') as HTMLInputElement;
    this.vxInput = document.getElementById('wb-vx') as HTMLInputElement;
    this.vyInput = document.getElementById('wb-vy') as HTMLInputElement;
    this.vzInput = document.getElementById('wb-vz') as HTMLInputElement;
    this.colorInput = document.getElementById('wb-color') as HTMLInputElement;
  }

  private setupEvents(): void {
    document.getElementById('wb-add')!.addEventListener('click', () => this.addBody());
    document.getElementById('wb-delete')!.addEventListener('click', () => this.deleteSelected());
    document.getElementById('wb-circular')!.addEventListener('click', () => this.setCircularOrbit());
  }

  /** Parse a color hex string to [r, g, b] in [0, 1] */
  private parseColor(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  }

  /** Create a new body from the form inputs and add it to the simulation */
  private addBody(): void {
    const mass = parseFloat(this.massInput.value);
    const radius = parseFloat(this.radiusInput.value);
    const px = parseFloat(this.pxInput.value);
    const py = parseFloat(this.pyInput.value);
    const pz = parseFloat(this.pzInput.value);
    const vx = parseFloat(this.vxInput.value);
    const vy = parseFloat(this.vyInput.value);
    const vz = parseFloat(this.vzInput.value);

    if (isNaN(mass) || isNaN(radius) || isNaN(px) || isNaN(py) || isNaN(pz) ||
        isNaN(vx) || isNaN(vy) || isNaN(vz)) {
      console.warn('[WorldBuilder] Invalid numeric input');
      return;
    }

    const bodyType = this.typeSelect.value as BodyType;
    const color = this.parseColor(this.colorInput.value);
    const id = this.callbacks.getNextBodyId();
    const isMassless = bodyType === BodyType.TestParticle;
    const isLuminous = bodyType === BodyType.Star;

    const body: Body = {
      id,
      name: this.nameInput.value || `Body-${id}`,
      body_type: bodyType,
      position: vec3(px, py, pz),
      velocity: vec3(vx, vy, vz),
      acceleration: vec3(),
      mass: isMassless ? 0 : mass,
      radius,
      rotation_period: 86400,
      axial_tilt: 0,
      rotation_angle: 0,
      collision_shape: { Sphere: { radius } },
      restitution: 0.5,
      parent_id: null,
      soi_radius: 0,
      color,
      luminosity: isLuminous ? 3.828e26 : 0,
      albedo: 0.3,
      atmosphere: null,
      gravity_harmonics: null,
      has_rings: false,
      ring_inner_radius: 0,
      ring_outer_radius: 0,
      substep_factor: 1,
      required_dt: 1,
      is_active: true,
      is_massless: isMassless,
    };

    this.callbacks.addBody(body);
    console.log(`[WorldBuilder] Added body '${body.name}' (id=${id})`);
  }

  /** Delete the currently selected body */
  private deleteSelected(): void {
    const id = this.callbacks.getSelectedBodyId();
    if (id !== null) {
      this.callbacks.deleteBody(id);
      console.log(`[WorldBuilder] Deleted body id=${id}`);
    }
  }

  /**
   * Auto-calculate circular orbit velocity for the current position.
   * Uses the total mass of all bodies within the orbit radius as the central mass.
   */
  private setCircularOrbit(): void {
    const state = this.callbacks.getState();
    if (!state) return;

    const px = parseFloat(this.pxInput.value) || 0;
    const py = parseFloat(this.pyInput.value) || 0;
    const pz = parseFloat(this.pzInput.value) || 0;
    const r = Math.sqrt(px * px + py * py + pz * pz);

    if (r < 1) {
      console.warn('[WorldBuilder] Position too close to origin for circular orbit');
      return;
    }

    // Sum mass of all bodies closer to origin than our position
    let centralMass = 0;
    for (const body of state.bodies) {
      const br = Math.sqrt(
        body.position.x ** 2 +
        body.position.y ** 2 +
        body.position.z ** 2,
      );
      if (br < r * 0.9) {
        centralMass += body.mass;
      }
    }

    if (centralMass <= 0) {
      // Use most massive body as fallback
      centralMass = Math.max(...state.bodies.map((b) => b.mass));
    }

    // Circular orbit: v = sqrt(G * M / r)
    const v = Math.sqrt(G * centralMass / r);

    // Direction: perpendicular to radius in the ecliptic plane
    // If position is (px, py, pz), velocity direction is (-py, px, 0) normalized
    const dirMag = Math.sqrt(px * px + py * py);
    if (dirMag > 0) {
      this.vxInput.value = ((-py / dirMag) * v).toExponential(3);
      this.vyInput.value = ((px / dirMag) * v).toExponential(3);
      this.vzInput.value = '0';
    } else {
      // Position on z-axis: orbit in x-y
      this.vxInput.value = v.toExponential(3);
      this.vyInput.value = '0';
      this.vzInput.value = '0';
    }

    console.log(`[WorldBuilder] Circular orbit: v=${v.toFixed(1)} m/s, M_central=${centralMass.toExponential(2)} kg`);
  }
}
