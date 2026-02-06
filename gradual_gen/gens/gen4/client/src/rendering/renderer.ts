/**
 * Three.js renderer with floating-origin dual-precision pipeline.
 *
 * All physics positions are f64 (Vec3). Before sending to the GPU, we
 * subtract the camera's f64 position to get camera-relative f32 coords.
 * This prevents floating-point jitter at large distances (e.g. outer planets).
 */

import * as THREE from 'three';
import type { Body, Vec3 } from '@solar-sim/shared';

const MIN_VISIBLE_RADIUS = 2; // pixels
const AU = 1.495978707e11;

export class Renderer {
  readonly camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  // Body meshes
  private bodyMeshes: Map<number, THREE.Mesh> = new Map();
  private bodyLabels: Map<number, THREE.Sprite> = new Map();

  // Orbit trails
  private trailGeometries: Map<number, THREE.BufferGeometry> = new Map();
  private trailLines: Map<number, THREE.Line> = new Map();
  private trailPositions: Map<number, Float32Array> = new Map();
  private trailIndices: Map<number, number> = new Map();
  private trailLength = 500; // number of trail points

  // Floating origin (f64)
  private originX = 0;
  private originY = 0;
  private originZ = 0;

  // Star glow sprites
  private starTexture: THREE.Texture;

  // Background stars
  private starfield: THREE.Points | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Camera (near/far set for astronomical scale with floating origin)
    this.camera = new THREE.PerspectiveCamera(60, w / h, 1e3, 1e14);
    this.camera.position.set(0, 0, AU * 3);

    // Scene
    this.scene = new THREE.Scene();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);

    // Ambient light
    const ambient = new THREE.AmbientLight(0x111122, 0.3);
    this.scene.add(ambient);

    // Star glow texture (procedurally generated)
    this.starTexture = this.createGlowTexture();

    // Background starfield
    this.createStarfield();

    // Handle resize
    window.addEventListener('resize', () => this.onResize());
  }

  /** Update body list — creates/removes meshes as needed */
  updateBodies(bodies: Body[]): void {
    const currentIds = new Set(bodies.map((b) => b.id));

    // Remove stale meshes
    for (const [id, mesh] of this.bodyMeshes) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        this.bodyMeshes.delete(id);
      }
    }
    for (const [id, sprite] of this.bodyLabels) {
      if (!currentIds.has(id)) {
        this.scene.remove(sprite);
        this.bodyLabels.delete(id);
      }
    }

    // Create new meshes
    for (const body of bodies) {
      if (!this.bodyMeshes.has(body.id)) {
        this.createBodyMesh(body);
      }
    }
  }

  /** Update positions of all body meshes (with floating origin) */
  updatePositions(bodies: Body[]): void {
    for (const body of bodies) {
      const mesh = this.bodyMeshes.get(body.id);
      if (!mesh) continue;

      // Floating origin: subtract camera position in f64, then cast to f32
      const rx = body.position.x - this.originX;
      const ry = body.position.y - this.originY;
      const rz = body.position.z - this.originZ;

      mesh.position.set(rx, ry, rz);

      // Scale body to ensure minimum visibility
      const dist = mesh.position.length();
      const angularSize = body.radius / Math.max(dist, 1);
      const pixelSize = angularSize * this.container.clientHeight / (2 * Math.tan(this.camera.fov * Math.PI / 360));

      if (pixelSize < MIN_VISIBLE_RADIUS) {
        const scale = MIN_VISIBLE_RADIUS / Math.max(pixelSize, 0.01);
        mesh.scale.setScalar(scale);
      } else {
        mesh.scale.setScalar(1);
      }

      // Update label
      const label = this.bodyLabels.get(body.id);
      if (label) {
        label.position.set(rx, ry + body.radius * mesh.scale.x * 1.5, rz);
        // Fade label based on distance
        const mat = label.material as THREE.SpriteMaterial;
        mat.opacity = Math.min(1, Math.max(0.2, 1 - dist / (AU * 10)));
      }

      // Update orbit trail
      this.updateTrail(body.id, rx, ry, rz);
    }
  }

  /** Set the floating origin (camera position in world space) */
  setFloatingOrigin(pos: Vec3): void {
    this.originX = pos.x;
    this.originY = pos.y;
    this.originZ = pos.z;

    // Move camera to origin in scene space
    // Camera position in scene space is always near origin
  }

  /** Render a frame */
  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private createBodyMesh(body: Body): void {
    const isStar = body.body_type === 'Star' || body.body_type === 'NeutronStar';
    const segments = isStar ? 64 : 32;

    const geometry = new THREE.SphereGeometry(body.radius, segments, segments / 2);
    const color = new THREE.Color(body.color[0], body.color[1], body.color[2]);

    let material: THREE.Material;
    if (isStar) {
      material = new THREE.MeshBasicMaterial({
        color,
      });

      // Add point light at star
      const light = new THREE.PointLight(color, body.luminosity > 0 ? 2 : 0.5, 0, 2);
      light.position.set(0, 0, 0);
      // Attach to mesh so it moves with it
      const mesh = new THREE.Mesh(geometry, material);
      mesh.add(light);

      // Add glow sprite
      const glowMat = new THREE.SpriteMaterial({
        map: this.starTexture,
        color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.setScalar(body.radius * 6);
      mesh.add(glow);

      this.bodyMeshes.set(body.id, mesh);
      this.scene.add(mesh);
    } else {
      material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.1,
        roughness: 0.8,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Add rings for ringed planets
      if (body.has_rings && body.ring_outer_radius > 0) {
        const ringGeom = new THREE.RingGeometry(
          body.ring_inner_radius,
          body.ring_outer_radius,
          128,
        );
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xccbb88,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }

      this.bodyMeshes.set(body.id, mesh);
      this.scene.add(mesh);
    }

    // Create text label
    this.createLabel(body);

    // Create orbit trail
    this.createTrail(body);
  }

  private createLabel(body: Body): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 256, 64);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(body.name, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(body.radius * 4, body.radius, 1);
    this.bodyLabels.set(body.id, sprite);
    this.scene.add(sprite);
  }

  private createTrail(body: Body): void {
    const positions = new Float32Array(this.trailLength * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 0);

    const color = new THREE.Color(body.color[0], body.color[1], body.color[2]);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.4,
    });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);

    this.trailGeometries.set(body.id, geometry);
    this.trailLines.set(body.id, line);
    this.trailPositions.set(body.id, positions);
    this.trailIndices.set(body.id, 0);
  }

  private updateTrail(bodyId: number, x: number, y: number, z: number): void {
    const positions = this.trailPositions.get(bodyId);
    const geometry = this.trailGeometries.get(bodyId);
    if (!positions || !geometry) return;

    let idx = this.trailIndices.get(bodyId) || 0;
    const i = idx % this.trailLength;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    idx++;
    this.trailIndices.set(bodyId, idx);

    const count = Math.min(idx, this.trailLength);
    geometry.setDrawRange(0, count);
    (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  private createGlowTexture(): THREE.Texture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 240, 200, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  private createStarfield(): void {
    const count = 10000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random position on a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1e13 + Math.random() * 1e13; // Very far away

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Random star color (mostly white, some blue/yellow/red)
      const temp = 0.5 + Math.random() * 0.5;
      colors[i * 3] = 0.8 + temp * 0.2;
      colors[i * 3 + 1] = 0.8 + temp * 0.15;
      colors[i * 3 + 2] = 0.9 + temp * 0.1;

      sizes[i] = 1 + Math.random() * 3;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false,
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  private onResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
