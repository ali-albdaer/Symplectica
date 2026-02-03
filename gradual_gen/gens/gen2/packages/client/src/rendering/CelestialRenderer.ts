/**
 * Celestial Body Renderer
 * ========================
 * Renders celestial bodies with LOD, atmosphere shaders, and proper materials.
 * 
 * Mathematical justification:
 * - LOD based on angular size: θ = 2 * arctan(radius / distance)
 * - Atmospheric scattering: Bruneton & Neyret (2008)
 * - Ring systems: Proper geometric scattering
 */

import * as THREE from 'three';
import { CelestialBody, BodyType, Vector3 as Vec3 } from '@space-sim/shared';
import { FloatingOriginCamera } from './FloatingOriginCamera';
import { AtmosphereShader } from './shaders/AtmosphereShader';

// LOD level thresholds (angular diameter in radians)
const LOD_LEVELS = [
  { minAngle: 0.1, segments: 128 },    // Very close
  { minAngle: 0.01, segments: 64 },    // Close
  { minAngle: 0.001, segments: 32 },   // Medium
  { minAngle: 0.0001, segments: 16 },  // Far
  { minAngle: 0, segments: 8 },        // Very far
];

interface BodyRenderData {
  mesh: THREE.Mesh;
  atmosphereMesh?: THREE.Mesh;
  ringMesh?: THREE.Mesh;
  currentLOD: number;
  body: CelestialBody;
}

// Color palettes for different body types
const BODY_COLORS: Record<BodyType, number> = {
  [BodyType.STAR]: 0xffff00,
  [BodyType.PLANET]: 0x4444ff,
  [BodyType.MOON]: 0x888888,
  [BodyType.ASTEROID]: 0x666666,
  [BodyType.COMET]: 0xaaaaaa,
  [BodyType.BLACK_HOLE]: 0x000000,
  [BodyType.NEUTRON_STAR]: 0x88ccff,
  [BodyType.SPACECRAFT]: 0xff0000,
};

export class CelestialRenderer {
  private scene: THREE.Scene;
  private bodies: Map<string, BodyRenderData> = new Map();
  private camera: FloatingOriginCamera;

  // Geometry cache for LOD levels
  private geometryCache: Map<number, THREE.SphereGeometry> = new Map();

  // Lights
  private starLights: Map<string, THREE.PointLight> = new Map();
  private ambientLight: THREE.AmbientLight;

  constructor(scene: THREE.Scene, camera: FloatingOriginCamera) {
    this.scene = scene;
    this.camera = camera;

    // Add ambient light for baseline visibility
    this.ambientLight = new THREE.AmbientLight(0x111122, 0.3);
    this.scene.add(this.ambientLight);

    // Pre-create LOD geometries
    for (const level of LOD_LEVELS) {
      this.geometryCache.set(
        level.segments,
        new THREE.SphereGeometry(1, level.segments, level.segments / 2)
      );
    }
  }

  /**
   * Calculate angular diameter in radians
   */
  private calcAngularDiameter(radius: number, distance: number): number {
    if (distance <= radius) return Math.PI; // Inside or at surface
    return 2 * Math.atan(radius / distance);
  }

  /**
   * Get appropriate LOD level for angular diameter
   */
  private getLODLevel(angularDiameter: number): number {
    for (let i = 0; i < LOD_LEVELS.length; i++) {
      const level = LOD_LEVELS[i];
      if (level && angularDiameter >= level.minAngle) {
        return level.segments;
      }
    }
    const lastLevel = LOD_LEVELS[LOD_LEVELS.length - 1];
    return lastLevel ? lastLevel.segments : 8;
  }

  /**
   * Create material for a celestial body
   */
  private createMaterial(body: CelestialBody): THREE.Material {
    const def = body.definition;

    if (def.type === BodyType.STAR) {
      // Emissive material for stars
      const color = def.color || BODY_COLORS[def.type];
      return new THREE.MeshBasicMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1,
      });
    }

    if (def.type === BodyType.BLACK_HOLE) {
      // Black material for black holes (shader will handle distortion)
      return new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 1,
      });
    }

    // Standard material for other bodies
    const color = def.color || BODY_COLORS[def.type];
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.2,
    });
  }

  /**
   * Add a celestial body to the renderer
   */
  addBody(body: CelestialBody): void {
    if (this.bodies.has(body.id)) {
      console.warn(`Body ${body.id} already exists in renderer`);
      return;
    }

    const def = body.definition;

    // Create mesh with initial LOD
    const geometry = this.geometryCache.get(32)!;
    const material = this.createMaterial(body);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = body.id;

    // Scale to actual radius (will be adjusted for floating point precision)
    // We'll handle this in updateBody

    this.scene.add(mesh);

    const renderData: BodyRenderData = {
      mesh,
      currentLOD: 32,
      body,
    };

    // Add atmosphere if the body has one
    if (def.atmosphere) {
      const atmMesh = this.createAtmosphereMesh(body);
      this.scene.add(atmMesh);
      renderData.atmosphereMesh = atmMesh;
    }

    // Add point light for stars
    if (def.type === BodyType.STAR) {
      const luminosity = def.luminosity || 1;
      const light = new THREE.PointLight(
        def.color || 0xffffee,
        luminosity * 2,
        0, // Infinite distance
        0  // No decay (physically incorrect but needed for space scale)
      );
      this.scene.add(light);
      this.starLights.set(body.id, light);
    }

    // Add ring system if defined
    if (def.rings) {
      const ringMesh = this.createRingMesh(body);
      this.scene.add(ringMesh);
      renderData.ringMesh = ringMesh;
    }

    this.bodies.set(body.id, renderData);
  }

  /**
   * Create atmosphere mesh
   */
  private createAtmosphereMesh(body: CelestialBody): THREE.Mesh {
    const def = body.definition;
    const atm = def.atmosphere!;

    // Atmosphere shell is slightly larger than the body
    const scale = 1 + (atm.scaleHeight / def.radius) * 10;

    const geometry = new THREE.SphereGeometry(1, 64, 32);
    const material = AtmosphereShader.createMaterial({
      rayleighCoefficient: atm.rayleighCoefficient || [5.5e-6, 13.0e-6, 22.4e-6],
      mieCoefficient: atm.mieCoefficient || 21e-6,
      scaleHeight: atm.scaleHeight,
      planetRadius: def.radius,
      atmosphereRadius: def.radius * scale,
      sunIntensity: 22,
      g: atm.g || 0.76, // Mie scattering asymmetry
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `${body.id}_atmosphere`;
    mesh.renderOrder = 100; // Render after opaque objects

    return mesh;
  }

  /**
   * Create ring system mesh
   */
  private createRingMesh(body: CelestialBody): THREE.Mesh {
    const rings = body.definition.rings!;

    const geometry = new THREE.RingGeometry(
      rings.innerRadius / body.definition.radius,
      rings.outerRadius / body.definition.radius,
      128
    );

    // Create procedural ring texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;

    // Draw ring bands
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    gradient.addColorStop(0, 'rgba(200, 180, 160, 0.3)');
    gradient.addColorStop(0.2, 'rgba(220, 200, 180, 0.6)');
    gradient.addColorStop(0.3, 'rgba(180, 160, 140, 0.2)');
    gradient.addColorStop(0.5, 'rgba(200, 180, 160, 0.5)');
    gradient.addColorStop(0.7, 'rgba(160, 140, 120, 0.3)');
    gradient.addColorStop(0.9, 'rgba(200, 180, 160, 0.4)');
    gradient.addColorStop(1, 'rgba(180, 160, 140, 0.1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: rings.opacity || 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `${body.id}_rings`;
    mesh.rotation.x = -Math.PI / 2; // Align with equatorial plane

    return mesh;
  }

  /**
   * Remove a body from the renderer
   */
  removeBody(id: string): void {
    const data = this.bodies.get(id);
    if (!data) return;

    this.scene.remove(data.mesh);
    data.mesh.geometry.dispose();
    if (data.mesh.material instanceof THREE.Material) {
      data.mesh.material.dispose();
    }

    if (data.atmosphereMesh) {
      this.scene.remove(data.atmosphereMesh);
      data.atmosphereMesh.geometry.dispose();
      if (data.atmosphereMesh.material instanceof THREE.Material) {
        data.atmosphereMesh.material.dispose();
      }
    }

    if (data.ringMesh) {
      this.scene.remove(data.ringMesh);
      data.ringMesh.geometry.dispose();
      if (data.ringMesh.material instanceof THREE.Material) {
        data.ringMesh.material.dispose();
      }
    }

    const light = this.starLights.get(id);
    if (light) {
      this.scene.remove(light);
      light.dispose();
      this.starLights.delete(id);
    }

    this.bodies.delete(id);
  }

  /**
   * Update all bodies (call each frame)
   */
  update(): void {
    const cameraWorldPos = this.camera.getWorldPosition();
    const originOffset = this.camera.getOriginOffset();

    for (const [_id, data] of this.bodies) {
      this.updateBody(data, cameraWorldPos, originOffset);
    }
  }

  /**
   * Update a single body
   */
  private updateBody(
    data: BodyRenderData,
    cameraWorldPos: Vec3,
    originOffset: Vec3
  ): void {
    const body = data.body;
    const def = body.definition;

    // Calculate render position (relative to floating origin)
    const renderX = body.position.x - originOffset.x;
    const renderY = body.position.y - originOffset.y;
    const renderZ = body.position.z - originOffset.z;

    // Update mesh position
    data.mesh.position.set(renderX, renderY, renderZ);

    // Calculate distance to camera
    const dx = body.position.x - cameraWorldPos.x;
    const dy = body.position.y - cameraWorldPos.y;
    const dz = body.position.z - cameraWorldPos.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Calculate angular diameter and update LOD
    const angularDiam = this.calcAngularDiameter(def.radius, distance);
    const lodLevel = this.getLODLevel(angularDiam);

    if (lodLevel !== data.currentLOD) {
      // Swap geometry for new LOD
      data.mesh.geometry = this.geometryCache.get(lodLevel)!;
      data.currentLOD = lodLevel;
    }

    // Set scale based on radius
    // For very large objects, we need to use a scaled representation
    const renderScale = this.calculateRenderScale(def.radius, distance);
    data.mesh.scale.setScalar(renderScale);

    // Update rotation
    if (body.orientation) {
      data.mesh.quaternion.set(
        body.orientation.x,
        body.orientation.y,
        body.orientation.z,
        body.orientation.w
      );
    }

    // Update atmosphere
    if (data.atmosphereMesh) {
      data.atmosphereMesh.position.copy(data.mesh.position);
      const atmScale = 1.1; // Atmosphere is 10% larger than body
      data.atmosphereMesh.scale.setScalar(renderScale * atmScale);

      // Update atmosphere shader uniforms
      const material = data.atmosphereMesh.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.cameraPosition.value.set(0, 0, 0);
        // Find nearest star for sun direction
        const sunDir = this.getNearestStarDirection(body.position);
        material.uniforms.sunDirection.value.copy(sunDir);
      }
    }

    // Update rings
    if (data.ringMesh) {
      data.ringMesh.position.copy(data.mesh.position);
      data.ringMesh.scale.setScalar(renderScale);
      if (body.orientation) {
        data.ringMesh.quaternion.copy(data.mesh.quaternion);
      }
    }

    // Update star light
    const light = this.starLights.get(body.id);
    if (light) {
      light.position.copy(data.mesh.position);
    }
  }

  /**
   * Calculate render scale with precision fallback
   */
  private calculateRenderScale(radius: number, distance: number): number {
    // For objects very far away, use angular size scaling
    // to prevent floating point precision issues

    // If the object would be too small to render accurately
    // (less than 0.01 units), scale it up but cap the size
    const minRenderSize = 0.01;
    const maxRenderSize = 1e8; // Max render size

    let scale = radius;

    // Clamp scale for precision
    if (scale < minRenderSize && distance > 0) {
      // Calculate apparent size based on angular diameter
      const angularDiam = 2 * Math.atan(radius / distance);
      // Ensure minimum visual size
      scale = Math.max(distance * Math.tan(angularDiam / 2), minRenderSize);
    }

    if (scale > maxRenderSize) {
      scale = maxRenderSize;
    }

    return scale;
  }

  /**
   * Get direction to nearest star from a position
   */
  private getNearestStarDirection(pos: Vec3): THREE.Vector3 {
    let nearestDist = Infinity;
    let nearestDir = new THREE.Vector3(1, 0, 0);

    for (const [, data] of this.bodies) {
      if (data.body.definition.type === BodyType.STAR) {
        const dx = data.body.position.x - pos.x;
        const dy = data.body.position.y - pos.y;
        const dz = data.body.position.z - pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < nearestDist) {
          nearestDist = dist;
          nearestDir = new THREE.Vector3(dx / dist, dy / dist, dz / dist);
        }
      }
    }

    return nearestDir;
  }

  /**
   * Get body render data
   */
  getBodyData(id: string): BodyRenderData | undefined {
    return this.bodies.get(id);
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    for (const [id] of this.bodies) {
      this.removeBody(id);
    }

    for (const [, geometry] of this.geometryCache) {
      geometry.dispose();
    }
    this.geometryCache.clear();

    this.scene.remove(this.ambientLight);
    this.ambientLight.dispose();
  }
}
