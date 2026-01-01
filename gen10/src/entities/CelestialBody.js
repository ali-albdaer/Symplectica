import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { Entity } from './Entity.js';

export class CelestialBody extends Entity {
  constructor({ id, config, nbody, scene }) {
    super();
    this.id = id;
    this.config = config;
    this.nbody = nbody;
    this.scene = scene;

    this.mesh = null;
    this.lod = null;

    this._rot = 0;
  }

  init({ makeLodMesh }) {
    this.lod = makeLodMesh({ radius: this.config.radius, color: this.config.color });
    this.mesh = this.lod;
    this.mesh.name = this.config.name;

    // Apply per-body material overrides (e.g., Sun emissive glow)
    this._applyMaterialOverrides();

    // Default: bodies cast/receive shadows. Sun should not self-shadow.
    const isSun = (this.id === 'sun');
    this.mesh.traverse?.((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = !isSun;
      obj.receiveShadow = !isSun;
    });

    this.scene.add(this.mesh);
  }

  _applyMaterialOverrides() {
    const luminosity = Number(this.config.luminosity || 0);
    if (!(luminosity > 0)) return;

    // Emissive makes the mesh appear luminous even with no ambient light.
    this.mesh.traverse?.((obj) => {
      if (!obj.isMesh) return;
      const mat = obj.material;
      if (!mat) return;

      if ('emissive' in mat) {
        mat.emissive?.setHex?.(this.config.color);
        mat.emissiveIntensity = luminosity;
        mat.needsUpdate = true;
      }
    });
  }

  getState() {
    return this.nbody.getBody(this.id);
  }

  update({ dt }) {
    const state = this.getState();
    if (!state || !this.mesh) return;

    this.mesh.position.copy(state.position);

    this._rot += (this.config.rotationSpeed || 0) * dt;
    this.mesh.rotation.y = this._rot;
  }

  dispose() {
    if (this.mesh) this.scene.remove(this.mesh);
  }
}
