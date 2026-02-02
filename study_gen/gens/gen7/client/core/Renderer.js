/**
 * Three.js Renderer with Logarithmic Depth Buffer
 * Handles AU-scale rendering without Z-fighting.
 * @module client/core/Renderer
 */

import * as THREE from 'three';
import { CoordinateEngine } from './CoordinateEngine.js';
import { RENDER_SCALE } from '@shared/physics/constants.js';

/**
 * Main Three.js renderer with floating origin support
 */
export class Renderer {
  /**
   * @param {HTMLElement} container - DOM element to attach canvas
   * @param {CoordinateEngine} coordinateEngine - Coordinate system manager
   */
  constructor(container, coordinateEngine) {
    this.container = container;
    this.coords = coordinateEngine;
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000008);
    
    // Camera with extreme far plane for space scales
    this.camera = new THREE.PerspectiveCamera(
      60, // FOV
      container.clientWidth / container.clientHeight,
      0.1, // Near plane
      1e12 // Far plane (logarithmic depth handles this)
    );
    this.camera.position.set(0, 0, 100);
    
    // Renderer with logarithmic depth buffer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true, // Critical for AU-scale rendering
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    
    // Lighting
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    this.scene.add(this.ambientLight);
    
    // Primary star light (will be positioned at sun)
    this.sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
    this.sunLight.position.set(0, 0, 0);
    this.scene.add(this.sunLight);
    
    // Body meshes
    /** @type {Map<string, THREE.Mesh>} */
    this.bodyMeshes = new Map();
    
    // Ship meshes (other players)
    /** @type {Map<string, THREE.Mesh>} */
    this.shipMeshes = new Map();
    
    // Debug helpers
    this.debugHelpers = new THREE.Group();
    this.debugHelpers.visible = false;
    this.scene.add(this.debugHelpers);
    
    // Starfield
    this._createStarfield();
    
    // Handle resize
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  /**
   * Create procedural starfield background
   * @private
   */
  _createStarfield() {
    const starCount = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      // Distribute on a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 1e11; // Very far away
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Vary star colors slightly
      const temp = 0.7 + Math.random() * 0.3;
      colors[i * 3] = temp;
      colors[i * 3 + 1] = temp;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      
      sizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8
    });
    
    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  /**
   * Create or update mesh for a celestial body
   * @param {Object} body - Body data from simulation
   */
  updateBodyMesh(body) {
    let mesh = this.bodyMeshes.get(body.id);
    
    if (!mesh) {
      // Create new mesh
      const geometry = this._createBodyGeometry(body);
      const material = this._createBodyMaterial(body);
      mesh = new THREE.Mesh(geometry, material);
      mesh.name = body.id;
      
      // Add atmosphere for planets with atmosphere data
      if (body.visual?.atmosphere) {
        const atmo = this._createAtmosphere(body);
        mesh.add(atmo);
      }
      
      // Add glow for stars
      if (body.type === 'star') {
        const glow = this._createStarGlow(body);
        mesh.add(glow);
      }
      
      this.bodyMeshes.set(body.id, mesh);
      this.scene.add(mesh);
    }
    
    // Update position using coordinate engine
    const renderPos = this.coords.toRenderSpace(body.position, mesh.position);
    
    // Update scale (radius in render units)
    const renderRadius = this.coords.scaleRadius(body.radius);
    
    // Ensure minimum visible size
    const minSize = 0.5;
    const scale = Math.max(renderRadius, minSize);
    mesh.scale.setScalar(scale);
    
    // Update sun light position
    if (body.type === 'star') {
      this.sunLight.position.copy(mesh.position);
    }
    
    return mesh;
  }

  /**
   * Create geometry for a body type
   * @private
   */
  _createBodyGeometry(body) {
    // Higher detail for larger/important bodies
    const segments = body.type === 'star' ? 64 : 
                     body.type === 'planet' ? 48 : 32;
    return new THREE.SphereGeometry(1, segments, segments);
  }

  /**
   * Create material for a body type
   * @private
   */
  _createBodyMaterial(body) {
    const color = new THREE.Color(body.visual?.color || '#ffffff');
    
    if (body.type === 'star') {
      return new THREE.MeshBasicMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1
      });
    }
    
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.1
    });
  }

  /**
   * Create simple atmosphere effect
   * @private
   */
  _createAtmosphere(body) {
    const atmoColor = new THREE.Color(body.visual.atmosphere.color || '#87CEEB');
    const geometry = new THREE.SphereGeometry(1.05, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: atmoColor,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Create star glow effect
   * @private
   */
  _createStarGlow(body) {
    const color = new THREE.Color(body.visual?.color || '#FDB813');
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Create or update ship mesh
   * @param {Object} ship - Ship data
   */
  updateShipMesh(ship) {
    let mesh = this.shipMeshes.get(ship.id);
    
    if (!mesh) {
      // Simple ship geometry (cone + body)
      const geometry = new THREE.ConeGeometry(0.3, 1, 8);
      geometry.rotateX(Math.PI / 2);
      
      const material = new THREE.MeshStandardMaterial({
        color: ship.color || 0x00ff88,
        emissive: ship.color || 0x00ff88,
        emissiveIntensity: 0.3
      });
      
      mesh = new THREE.Mesh(geometry, material);
      mesh.name = ship.id;
      this.shipMeshes.set(ship.id, mesh);
      this.scene.add(mesh);
    }
    
    // Update position
    this.coords.toRenderSpace(ship.position, mesh.position);
    
    // Update rotation if available
    if (ship.rotation) {
      mesh.rotation.set(ship.rotation.x, ship.rotation.y, ship.rotation.z);
    }
    
    return mesh;
  }

  /**
   * Remove a ship mesh
   * @param {string} shipId 
   */
  removeShipMesh(shipId) {
    const mesh = this.shipMeshes.get(shipId);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.shipMeshes.delete(shipId);
    }
  }

  /**
   * Update camera position and look target
   * @param {THREE.Vector3} [position] - Camera position in render space
   * @param {THREE.Vector3} [target] - Look-at target in render space
   */
  updateCamera(position, target) {
    if (position) {
      this.camera.position.copy(position);
    }
    if (target) {
      this.camera.lookAt(target);
    }
  }

  /**
   * Render the scene
   * @param {number} alpha - Interpolation alpha (0-1)
   */
  render(alpha) {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Toggle debug visualization
   * @param {boolean} [visible]
   */
  toggleDebug(visible) {
    this.debugHelpers.visible = visible ?? !this.debugHelpers.visible;
  }

  /**
   * Handle window resize
   * @private
   */
  _onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Cleanup resources
   */
  dispose() {
    window.removeEventListener('resize', this._onResize);
    
    // Dispose all meshes
    for (const mesh of this.bodyMeshes.values()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
    
    for (const mesh of this.shipMeshes.values()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    
    this.bodyMeshes.clear();
    this.shipMeshes.clear();
    
    this.renderer.dispose();
  }
}

export default Renderer;
