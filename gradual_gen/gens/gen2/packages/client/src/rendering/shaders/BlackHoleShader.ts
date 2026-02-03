/**
 * Black Hole Shader
 * =================
 * Gravitational lensing and accretion disk rendering.
 * 
 * Mathematical basis:
 * - Schwarzschild metric: ds² = -(1-rs/r)c²dt² + dr²/(1-rs/r) + r²dΩ²
 * - Light bending angle: α ≈ 4GM/(c²b) for weak field
 * - Photon sphere: r = 1.5 × rs (innermost stable circular orbit for light)
 * - Event horizon: r = rs = 2GM/c²
 * 
 * References:
 * - "Interstellar" rendering: Oliver James et al. (2015)
 * - Luminet (1979) for accretion disk appearance
 */

import * as THREE from 'three';

export interface BlackHoleParams {
  mass: number;           // Mass in kg
  spin: number;           // Spin parameter a/M (0 to 1)
  accretionRate: number;  // Relative brightness of accretion disk
  viewDistance: number;   // Camera distance for scaling
}

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3 blackHolePosition;
uniform float schwarzschildRadius;
uniform float photonSphereRadius;
uniform float innerDiskRadius;
uniform float outerDiskRadius;
uniform float spin;
uniform float time;
uniform sampler2D backgroundTexture;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vWorldPosition;

const float PI = 3.14159265359;
const float c = 299792458.0; // Speed of light
const int MAX_STEPS = 64;
const float STEP_SIZE = 0.1;

// Gravitational lensing ray deflection
// Using weak-field approximation: α = 4GM/(c²b) = 2rs/b
vec3 deflectRay(vec3 rayDir, vec3 toBlackHole, float impactParameter, float rs) {
  if (impactParameter < 1.5 * rs) {
    // Ray captured by black hole
    return vec3(0.0);
  }
  
  // Deflection angle
  float alpha = 2.0 * rs / impactParameter;
  
  // Deflection direction (perpendicular to ray in the plane containing the ray and black hole)
  vec3 deflectionAxis = cross(rayDir, toBlackHole);
  float axisLen = length(deflectionAxis);
  
  if (axisLen < 0.001) {
    return rayDir; // Ray pointing directly at/away from black hole
  }
  
  deflectionAxis /= axisLen;
  
  // Rodrigues rotation formula
  float cosA = cos(alpha);
  float sinA = sin(alpha);
  
  return rayDir * cosA + cross(deflectionAxis, rayDir) * sinA 
         + deflectionAxis * dot(deflectionAxis, rayDir) * (1.0 - cosA);
}

// Check if ray intersects accretion disk
// Returns (t, r, phi) where t is intersection distance, r is radial distance, phi is angle
vec3 intersectDisk(vec3 origin, vec3 dir, vec3 bhPos, vec3 diskNormal, float innerR, float outerR) {
  // Disk plane intersection
  float denom = dot(dir, diskNormal);
  
  if (abs(denom) < 0.001) {
    return vec3(-1.0); // Ray parallel to disk
  }
  
  float t = dot(bhPos - origin, diskNormal) / denom;
  
  if (t < 0.0) {
    return vec3(-1.0); // Behind ray origin
  }
  
  vec3 hitPoint = origin + dir * t;
  vec3 toHit = hitPoint - bhPos;
  float r = length(toHit);
  
  if (r < innerR || r > outerR) {
    return vec3(-1.0); // Outside disk radius
  }
  
  // Calculate angle for texture
  float phi = atan(toHit.z, toHit.x);
  
  return vec3(t, r, phi);
}

// Accretion disk color (temperature-based)
// Using simplified blackbody model
vec3 diskColor(float r, float innerR, float outerR, float time, float phi) {
  // Temperature profile: T ∝ r^(-3/4) for thin disk
  float normalizedR = (r - innerR) / (outerR - innerR);
  float temp = pow(1.0 - normalizedR, 0.75);
  
  // Doppler beaming effect (simplified)
  float doppler = 1.0 + 0.3 * sin(phi + time * 0.5);
  temp *= doppler;
  
  // Hot inner disk (white-blue), cooler outer (orange-red)
  vec3 hotColor = vec3(0.8, 0.9, 1.0);
  vec3 coolColor = vec3(1.0, 0.4, 0.1);
  
  vec3 baseColor = mix(coolColor, hotColor, temp);
  
  // Add turbulent structure
  float turbulence = sin(phi * 8.0 + time) * sin(normalizedR * 12.0) * 0.2 + 0.8;
  
  // Brightness falls off with radius
  float brightness = pow(1.0 - normalizedR * 0.7, 2.0) * turbulence;
  
  return baseColor * brightness * 2.0;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= resolution.x / resolution.y;
  
  vec3 rayOrigin = cameraPosition;
  vec3 rayDir = normalize(vWorldPosition - cameraPosition);
  
  vec3 toBH = blackHolePosition - rayOrigin;
  float distToBH = length(toBH);
  vec3 bhDir = toBH / distToBH;
  
  // Impact parameter (closest approach distance)
  float b = length(cross(rayDir, toBH));
  
  // Check for event horizon hit
  if (b < schwarzschildRadius * 1.001) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  
  // Deflect ray due to gravitational lensing
  vec3 deflectedDir = deflectRay(rayDir, bhDir, b, schwarzschildRadius);
  
  // Check for photon sphere capture
  if (length(deflectedDir) < 0.001) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  
  // Check accretion disk intersection
  vec3 diskNormal = vec3(0.0, 1.0, 0.0); // Equatorial disk
  vec3 diskHit = intersectDisk(rayOrigin, deflectedDir, blackHolePosition, 
                                diskNormal, innerDiskRadius, outerDiskRadius);
  
  vec3 finalColor = vec3(0.0);
  float alpha = 0.0;
  
  if (diskHit.x > 0.0) {
    // Hit accretion disk
    finalColor = diskColor(diskHit.y, innerDiskRadius, outerDiskRadius, time, diskHit.z);
    alpha = 1.0;
    
    // Gravitational redshift: λ_obs/λ_emit = 1/√(1 - rs/r)
    float redshiftFactor = sqrt(1.0 - schwarzschildRadius / diskHit.y);
    finalColor *= redshiftFactor;
  } else {
    // Background (would be starfield)
    // Sample distorted background based on deflected ray
    vec2 bgUv = vec2(
      atan(deflectedDir.x, deflectedDir.z) / (2.0 * PI) + 0.5,
      asin(clamp(deflectedDir.y, -1.0, 1.0)) / PI + 0.5
    );
    
    // Add some distortion visualization
    float distortion = length(deflectedDir - rayDir);
    finalColor = vec3(distortion * 0.1);
    alpha = distortion * 0.5;
  }
  
  // Einstein ring glow
  float ringAngle = abs(b - 1.5 * schwarzschildRadius) / schwarzschildRadius;
  if (ringAngle < 0.3) {
    float ringGlow = 1.0 - ringAngle / 0.3;
    finalColor += vec3(0.5, 0.6, 1.0) * ringGlow * ringGlow * 0.5;
    alpha = max(alpha, ringGlow * 0.5);
  }
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

export class BlackHoleShader {
  /**
   * Create black hole shader material
   */
  static createMaterial(params: BlackHoleParams): THREE.ShaderMaterial {
    const G = 6.67430e-11;
    const c = 299792458;

    // Schwarzschild radius: rs = 2GM/c²
    const rs = (2 * G * params.mass) / (c * c);

    // Photon sphere: r = 1.5 × rs
    const photonSphere = 1.5 * rs;

    // Innermost stable circular orbit (ISCO): r = 3 × rs for non-spinning
    const isco = 3 * rs * (1 - 0.5 * params.spin); // Simplified Kerr approximation

    // Outer disk radius (arbitrary, typically 10-1000 × rs)
    const outerDisk = 100 * rs;

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        blackHolePosition: { value: new THREE.Vector3(0, 0, 0) },
        schwarzschildRadius: { value: rs / params.viewDistance }, // Normalized
        photonSphereRadius: { value: photonSphere / params.viewDistance },
        innerDiskRadius: { value: isco / params.viewDistance },
        outerDiskRadius: { value: outerDisk / params.viewDistance },
        spin: { value: params.spin },
        time: { value: 0 },
        backgroundTexture: { value: null },
        resolution: { value: new THREE.Vector2(1920, 1080) },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }

  /**
   * Update time uniform for animation
   */
  static updateTime(material: THREE.ShaderMaterial, time: number): void {
    if (material.uniforms['time']) {
      material.uniforms['time'].value = time;
    }
  }

  /**
   * Calculate Schwarzschild radius for a given mass
   * rs = 2GM/c²
   */
  static schwarzschildRadius(mass: number): number {
    const G = 6.67430e-11;
    const c = 299792458;
    return (2 * G * mass) / (c * c);
  }

  /**
   * Calculate tidal forces at a given distance
   * dg/dr = 2GM/r³
   */
  static tidalForce(mass: number, distance: number): number {
    const G = 6.67430e-11;
    return (2 * G * mass) / (distance * distance * distance);
  }
}
