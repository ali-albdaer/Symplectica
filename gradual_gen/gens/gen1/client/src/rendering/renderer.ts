/**
 * Three.js Renderer
 * 
 * Handles all WebGL rendering with:
 * - Logarithmic depth buffer for AU-scale rendering
 * - Floating origin (camera at 0,0,0)
 * - Dual-precision coordinate handling
 * 
 * @module renderer
 */

import * as THREE from 'three';
import { FLOATING_ORIGIN_THRESHOLD, Vec3, AU } from '@nbody/shared';
import type { Vector3D, SerializedBody, SerializedPlayer } from '@nbody/shared';

/**
 * Render state for interpolation
 */
interface RenderBody {
  id: string;
  mesh: THREE.Mesh;
  // Double precision absolute position
  absolutePosition: { x: number; y: number; z: number };
  previousPosition: { x: number; y: number; z: number };
  radius: number;
  type: string;
}

/**
 * Main renderer class
 */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  
  // Bodies
  private bodies: Map<string, RenderBody> = new Map();
  private playerMeshes: Map<string, THREE.Mesh> = new Map();
  
  // Origin tracking (Float64)
  private originOffset = { x: 0, y: 0, z: 0 };
  private cameraTarget: Vector3D = { x: 0, y: 0, z: 0 };
  
  // Lighting
  private sunLight: THREE.PointLight | null = null;
  private ambientLight: THREE.AmbientLight;
  
  // Stats
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 60;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    // Create renderer with logarithmic depth buffer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      logarithmicDepthBuffer: true,  // Critical for AU-scale rendering
      powerPreference: 'high-performance'
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000008);
    
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera with extreme far plane
    this.camera = new THREE.PerspectiveCamera(
      70,                          // FOV
      window.innerWidth / window.innerHeight,
      0.1,                         // Near plane (0.1m)
      1e15                         // Far plane (beyond Neptune's orbit)
    );
    this.camera.position.set(0, 0, 100);
    
    // Ambient light for base visibility
    this.ambientLight = new THREE.AmbientLight(0x404060, 0.1);
    this.scene.add(this.ambientLight);
    
    // Create starfield
    this.createStarfield();
    
    // Handle resize
    window.addEventListener('resize', this.onResize.bind(this));
  }
  
  /**
   * Create procedural starfield
   */
  private createStarfield(): void {
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    // Use seeded random for consistency
    const seed = 12345;
    const random = this.seededRandom(seed);
    
    for (let i = 0; i < starCount; i++) {
      // Distribute on sphere
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const r = 1e14; // Very far away
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Star colors (temperature-based)
      const temp = random();
      if (temp < 0.1) {
        // Red/orange stars
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.6 + random() * 0.3;
        colors[i * 3 + 2] = 0.3 + random() * 0.2;
      } else if (temp < 0.3) {
        // Yellow stars
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9 + random() * 0.1;
        colors[i * 3 + 2] = 0.7 + random() * 0.2;
      } else {
        // White/blue stars
        colors[i * 3] = 0.8 + random() * 0.2;
        colors[i * 3 + 1] = 0.8 + random() * 0.2;
        colors[i * 3 + 2] = 1.0;
      }
      
      // Size variation (apparent magnitude)
      sizes[i] = 0.5 + random() * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const stars = new THREE.Points(geometry, material);
    this.scene.add(stars);
  }
  
  /**
   * Seeded random number generator
   */
  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = Math.sin(s * 9999) * 10000;
      return s - Math.floor(s);
    };
  }
  
  /**
   * Update bodies from server state
   */
  updateBodies(bodies: SerializedBody[]): void {
    const updatedIds = new Set<string>();
    
    for (const body of bodies) {
      updatedIds.add(body.id);
      
      let renderBody = this.bodies.get(body.id);
      
      if (!renderBody) {
        // Create new body
        renderBody = this.createBodyMesh(body);
        this.bodies.set(body.id, renderBody);
        this.scene.add(renderBody.mesh);
        
        // If it's a star, add light
        if (body.celestialType === 'star') {
          this.createStarLight(body);
        }
      }
      
      // Store previous position for interpolation
      renderBody.previousPosition = { ...renderBody.absolutePosition };
      
      // Update absolute position (Float64)
      renderBody.absolutePosition = {
        x: body.position[0],
        y: body.position[1],
        z: body.position[2]
      };
    }
    
    // Remove bodies that no longer exist
    for (const [id, body] of this.bodies) {
      if (!updatedIds.has(id)) {
        this.scene.remove(body.mesh);
        body.mesh.geometry.dispose();
        (body.mesh.material as THREE.Material).dispose();
        this.bodies.delete(id);
      }
    }
  }
  
  /**
   * Create mesh for a celestial body
   */
  private createBodyMesh(body: SerializedBody): RenderBody {
    // Scale radius for visibility (maintain proportions but ensure visibility)
    const displayRadius = body.radius;
    
    // LOD: Use fewer segments for smaller/distant bodies
    const segments = body.celestialType === 'star' ? 64 : 
                     body.radius > 1e7 ? 48 : 32;
    
    const geometry = new THREE.SphereGeometry(displayRadius, segments, segments);
    
    // Material based on body type
    let material: THREE.Material;
    
    switch (body.celestialType) {
      case 'star':
        material = new THREE.MeshBasicMaterial({
          color: 0xffff80
        });
        break;
        
      case 'gas-giant':
        material = new THREE.MeshStandardMaterial({
          color: this.getBodyColor(body.name),
          roughness: 0.8,
          metalness: 0.1
        });
        break;
        
      default:
        material = new THREE.MeshStandardMaterial({
          color: this.getBodyColor(body.name),
          roughness: 0.9,
          metalness: 0.1
        });
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = body.id;
    mesh.userData = { bodyId: body.id, name: body.name };
    
    return {
      id: body.id,
      mesh,
      absolutePosition: {
        x: body.position[0],
        y: body.position[1],
        z: body.position[2]
      },
      previousPosition: {
        x: body.position[0],
        y: body.position[1],
        z: body.position[2]
      },
      radius: body.radius,
      type: body.celestialType
    };
  }
  
  /**
   * Get color for known bodies
   */
  private getBodyColor(name: string): number {
    const colors: Record<string, number> = {
      'Sun': 0xffff00,
      'Mercury': 0x8c7853,
      'Venus': 0xdaa520,
      'Earth': 0x2266cc,
      'Moon': 0x888888,
      'Mars': 0xcc4422,
      'Jupiter': 0xd4a574,
      'Saturn': 0xf4d59e,
      'Uranus': 0x88ccdd,
      'Neptune': 0x4444ff,
      'Pluto': 0xddccaa
    };
    return colors[name] ?? 0x888888;
  }
  
  /**
   * Create light for a star
   */
  private createStarLight(body: SerializedBody): void {
    // Remove existing sun light if any
    if (this.sunLight) {
      this.scene.remove(this.sunLight);
    }
    
    this.sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
    this.sunLight.position.set(0, 0, 0); // Will be updated in render
    this.scene.add(this.sunLight);
  }
  
  /**
   * Set camera target (body to follow)
   */
  setCameraTarget(position: Vector3D): void {
    this.cameraTarget = position;
  }
  
  /**
   * Update camera for player view
   */
  updateCamera(playerPosition: Vector3D, lookDirection: { pitch: number; yaw: number }): void {
    // Update origin offset to player position
    this.originOffset = {
      x: playerPosition.x,
      y: playerPosition.y,
      z: playerPosition.z
    };
    
    // Camera is always at origin (floating origin)
    this.camera.position.set(0, 2, 0); // 2m above "feet"
    
    // Apply look direction
    const euler = new THREE.Euler(lookDirection.pitch, lookDirection.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }
  
  /**
   * Render frame
   */
  render(alpha: number = 1): void {
    // Update FPS counter
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
    
    // Update body mesh positions (convert to camera-relative Float32)
    for (const body of this.bodies.values()) {
      // Use current absolute position (interpolation disabled for now)
      const x = body.absolutePosition.x;
      const y = body.absolutePosition.y;
      const z = body.absolutePosition.z;
      
      // Convert to camera-relative (Float32 precision is fine for rendering)
      body.mesh.position.set(
        x - this.originOffset.x,
        y - this.originOffset.y,
        z - this.originOffset.z
      );
      
      // Update sun light position
      if (body.type === 'star' && this.sunLight) {
        this.sunLight.position.copy(body.mesh.position);
      }
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Handle window resize
   */
  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * Public resize method
   */
  resize(): void {
    this.onResize();
  }
  
  /**
   * Set camera offset from follow target
   */
  setCameraOffset(offset: [number, number, number]): void {
    this.camera.position.set(offset[0], offset[1], offset[2]);
  }
  
  /**
   * Set follow target (body position to center on)
   */
  setFollowTarget(position: [number, number, number]): void {
    // Update origin offset so target is at center
    this.originOffset.x = position[0];
    this.originOffset.y = position[1];
    this.originOffset.z = position[2];
  }
  
  /**
   * Make camera look at origin (player position)
   */
  lookAtOrigin(): void {
    this.camera.lookAt(0, 0, 0);
  }
  
  /**
   * Make camera look at body center (relative to current origin)
   */
  lookAtBodyCenter(bodyCenter: [number, number, number]): void {
    // Body center in camera-relative coordinates
    const relX = bodyCenter[0] - this.originOffset.x;
    const relY = bodyCenter[1] - this.originOffset.y;
    const relZ = bodyCenter[2] - this.originOffset.z;
    this.camera.lookAt(relX, relY, relZ);
  }
  
  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }
  
  /**
   * Get scene for external access
   */
  getScene(): THREE.Scene {
    return this.scene;
  }
  
  /**
   * Get camera for external access
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
  
  /**
   * Dispose renderer
   */
  dispose(): void {
    this.renderer.dispose();
    
    for (const body of this.bodies.values()) {
      body.mesh.geometry.dispose();
      (body.mesh.material as THREE.Material).dispose();
    }
    this.bodies.clear();
  }
}
