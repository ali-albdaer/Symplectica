/**
 * Procedural Starfield
 * ====================
 * Generates a procedural starfield skybox using seeded PRNG.
 * 
 * Mathematical basis:
 * - Star positions: Uniformly distributed on unit sphere using Fibonacci lattice
 * - Star brightness: Power-law distribution (Salpeter initial mass function)
 * - Star colors: Based on Harvard spectral classification (O,B,A,F,G,K,M)
 * 
 * Verification:
 * - Same seed produces identical starfield
 * - Star density: ~2500 visible stars (V < 6.5 magnitude) in real sky
 */

import * as THREE from 'three';
import { SeededRandom } from '@space-sim/shared';

export interface StarfieldOptions {
  seed: number;          // PRNG seed
  starCount: number;     // Number of stars (default: 10000)
  minBrightness: number; // Minimum star brightness (0-1)
  maxBrightness: number; // Maximum brightness
  radius: number;        // Skybox radius
  twinkle: boolean;      // Enable twinkling animation
}

// Star spectral types (O,B,A,F,G,K,M) with colors and relative frequencies
const SPECTRAL_TYPES = [
  { type: 'O', color: [0.6, 0.7, 1.0], temp: 30000, frequency: 0.00003 },
  { type: 'B', color: [0.7, 0.8, 1.0], temp: 15000, frequency: 0.001 },
  { type: 'A', color: [0.9, 0.9, 1.0], temp: 8500, frequency: 0.006 },
  { type: 'F', color: [1.0, 1.0, 0.95], temp: 6750, frequency: 0.03 },
  { type: 'G', color: [1.0, 1.0, 0.8], temp: 5500, frequency: 0.076 },
  { type: 'K', color: [1.0, 0.9, 0.7], temp: 4250, frequency: 0.121 },
  { type: 'M', color: [1.0, 0.7, 0.5], temp: 3000, frequency: 0.765 },
];

export class ProceduralStarfield {
  private mesh: THREE.Points;
  private material: THREE.ShaderMaterial;
  private geometry: THREE.BufferGeometry;
  private rng: SeededRandom;
  private options: StarfieldOptions;
  private time: number = 0;

  constructor(options: Partial<StarfieldOptions> = {}) {
    this.options = {
      seed: options.seed ?? 42,
      starCount: options.starCount ?? 10000,
      minBrightness: options.minBrightness ?? 0.1,
      maxBrightness: options.maxBrightness ?? 1.0,
      radius: options.radius ?? 1e12, // 1e12 meters default
      twinkle: options.twinkle ?? true,
    };

    this.rng = new SeededRandom(this.options.seed);
    this.geometry = this.createGeometry();
    this.material = this.createMaterial();
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.name = 'starfield';
    this.mesh.frustumCulled = false; // Always render skybox
  }

  /**
   * Generate star positions using Fibonacci sphere algorithm
   * More uniform distribution than random points
   */
  private generateFibonacciPosition(index: number, total: number): THREE.Vector3 {
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    const y = 1 - (index / (total - 1)) * 2;
    // Radius at Y (computed inline below for jittered version)
    const theta = phi * index;

    // Add jitter based on PRNG for more natural look
    const jitterY = (this.rng.random() - 0.5) * 0.02;
    const jitterTheta = (this.rng.random() - 0.5) * 0.02;

    const adjustedY = Math.max(-1, Math.min(1, y + jitterY));
    const adjustedTheta = theta + jitterTheta;
    const adjustedRadius = Math.sqrt(1 - adjustedY * adjustedY);

    return new THREE.Vector3(
      Math.cos(adjustedTheta) * adjustedRadius,
      adjustedY,
      Math.sin(adjustedTheta) * adjustedRadius
    );
  }

  /**
   * Get star color based on spectral type distribution
   */
  private getSpectralColor(): THREE.Color {
    const r = this.rng.random();
    let cumulative = 0;

    for (const spec of SPECTRAL_TYPES) {
      cumulative += spec.frequency;
      if (r < cumulative) {
        // Add slight variation within spectral class
        const variation = 0.05;
        const c0 = spec.color[0] ?? 1.0;
        const c1 = spec.color[1] ?? 0.7;
        const c2 = spec.color[2] ?? 0.5;
        return new THREE.Color(
          c0 + (this.rng.random() - 0.5) * variation,
          c1 + (this.rng.random() - 0.5) * variation,
          c2 + (this.rng.random() - 0.5) * variation
        );
      }
    }

    // Default to M-type (most common)
    return new THREE.Color(1.0, 0.7, 0.5);
  }

  /**
   * Get star brightness using power-law distribution
   * Simulates realistic star magnitude distribution
   */
  private getStarBrightness(): number {
    // Power law: N(>L) ∝ L^(-1.5) (Salpeter-ish)
    const u = this.rng.random();
    const alpha = -2.5;
    const L = Math.pow(u, 1 / (alpha + 1));

    return this.options.minBrightness +
      (this.options.maxBrightness - this.options.minBrightness) * L;
  }

  /**
   * Create star geometry with positions, colors, and sizes
   */
  private createGeometry(): THREE.BufferGeometry {
    const positions = new Float32Array(this.options.starCount * 3);
    const colors = new Float32Array(this.options.starCount * 3);
    const sizes = new Float32Array(this.options.starCount);
    const twinklePhases = new Float32Array(this.options.starCount);
    const twinkleSpeeds = new Float32Array(this.options.starCount);

    for (let i = 0; i < this.options.starCount; i++) {
      // Position on unit sphere, scaled to radius
      const pos = this.generateFibonacciPosition(i, this.options.starCount);
      pos.multiplyScalar(this.options.radius);

      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      // Color based on spectral type
      const color = this.getSpectralColor();
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Size based on brightness
      const brightness = this.getStarBrightness();
      sizes[i] = brightness * 3.0; // Scale for visibility

      // Random twinkle parameters
      twinklePhases[i] = this.rng.random() * Math.PI * 2;
      twinkleSpeeds[i] = 0.5 + this.rng.random() * 2.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhases, 1));
    geometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));

    return geometry;
  }

  /**
   * Create star shader material
   */
  private createMaterial(): THREE.ShaderMaterial {
    const vertexShader = /* glsl */ `
      attribute float size;
      attribute float twinklePhase;
      attribute float twinkleSpeed;
      
      varying vec3 vColor;
      varying float vBrightness;
      
      uniform float time;
      uniform bool enableTwinkle;
      
      void main() {
        vColor = color;
        
        // Calculate twinkle
        float twinkle = 1.0;
        if (enableTwinkle) {
          twinkle = 0.7 + 0.3 * sin(time * twinkleSpeed + twinklePhase);
        }
        vBrightness = twinkle;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Size attenuation for perspective
        float pointSize = size * (300.0 / -mvPosition.z);
        pointSize = clamp(pointSize, 1.0, 10.0);
        
        gl_PointSize = pointSize;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = /* glsl */ `
      varying vec3 vColor;
      varying float vBrightness;
      
      void main() {
        // Circular point with soft edge
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        if (dist > 0.5) {
          discard;
        }
        
        // Soft glow falloff
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        
        // Add slight bloom effect
        float bloom = exp(-dist * 4.0) * 0.5;
        
        vec3 color = vColor * vBrightness * (alpha + bloom);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        enableTwinkle: { value: this.options.twinkle },
      },
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  /**
   * Get the star mesh
   */
  getMesh(): THREE.Points {
    return this.mesh;
  }

  /**
   * Update animation (call each frame)
   */
  update(deltaTime: number): void {
    if (this.options.twinkle) {
      this.time += deltaTime;
      if (this.material.uniforms['time']) {
        this.material.uniforms['time'].value = this.time;
      }
    }
  }

  /**
   * Set the position of the starfield (should follow camera)
   */
  setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }

  /**
   * Regenerate with new seed
   */
  regenerate(seed: number): void {
    this.options.seed = seed;
    this.rng = new SeededRandom(seed);

    // Dispose old geometry
    this.geometry.dispose();

    // Create new geometry
    this.geometry = this.createGeometry();
    this.mesh.geometry = this.geometry;
  }

  /**
   * Set twinkle enabled/disabled
   */
  setTwinkle(enabled: boolean): void {
    this.options.twinkle = enabled;
    if (this.material.uniforms['enableTwinkle']) {
      this.material.uniforms['enableTwinkle'].value = enabled;
    }
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  /**
   * Verify starfield is deterministic
   */
  static verifyDeterminism(seed: number, sampleCount: number = 100): boolean {
    const starfield1 = new ProceduralStarfield({ seed, starCount: sampleCount });
    const starfield2 = new ProceduralStarfield({ seed, starCount: sampleCount });

    const pos1 = starfield1.geometry.getAttribute('position').array;
    const pos2 = starfield2.geometry.getAttribute('position').array;

    for (let i = 0; i < pos1.length; i++) {
      if (pos1[i] !== pos2[i]) {
        console.error(`Starfield verification failed at index ${i}: ${pos1[i]} !== ${pos2[i]}`);
        starfield1.dispose();
        starfield2.dispose();
        return false;
      }
    }

    starfield1.dispose();
    starfield2.dispose();

    console.log(`Starfield verification passed: ${sampleCount} stars with seed ${seed}`);
    return true;
  }
}
