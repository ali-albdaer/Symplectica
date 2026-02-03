/**
 * Atmosphere Shader
 * =================
 * Implementation of atmospheric scattering based on Bruneton & Neyret (2008)
 * "Precomputed Atmospheric Scattering"
 * 
 * Simplified single-scattering model for real-time rendering.
 * 
 * Mathematical basis:
 * - Rayleigh scattering: σ_R(λ) = (8π³(n²-1)²) / (3Nλ⁴) × depolarization
 * - Mie scattering: σ_M = 21e-6 (typical for Earth)
 * - Phase functions:
 *   - Rayleigh: P_R(θ) = (3/16π)(1 + cos²θ)
 *   - Mie: P_M(θ) = (3(1-g²)) / (8π(2+g²)) × (1+cos²θ) / (1+g²-2g×cosθ)^1.5
 */

import * as THREE from 'three';

export interface AtmosphereParams {
  rayleighCoefficient: [number, number, number]; // Per wavelength (R, G, B)
  mieCoefficient: number;
  scaleHeight: number;       // H_R in meters
  planetRadius: number;      // R_p in meters
  atmosphereRadius: number;  // R_a in meters
  sunIntensity: number;      // Solar intensity
  g: number;                 // Mie scattering asymmetry factor (-1 to 1)
}

const vertexShader = /* glsl */ `
varying vec3 vWorldPosition;
varying vec3 vNormal;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3 cameraPosition;
uniform vec3 sunDirection;
uniform vec3 rayleighCoefficient;
uniform float mieCoefficient;
uniform float scaleHeight;
uniform float planetRadius;
uniform float atmosphereRadius;
uniform float sunIntensity;
uniform float g;

varying vec3 vWorldPosition;
varying vec3 vNormal;

const float PI = 3.14159265359;
const int NUM_SAMPLES = 16;
const int NUM_SAMPLES_LIGHT = 8;

// Rayleigh phase function
float rayleighPhase(float cosTheta) {
  return (3.0 / (16.0 * PI)) * (1.0 + cosTheta * cosTheta);
}

// Mie phase function (Henyey-Greenstein approximation)
float miePhase(float cosTheta, float g) {
  float g2 = g * g;
  float num = 3.0 * (1.0 - g2) * (1.0 + cosTheta * cosTheta);
  float denom = 8.0 * PI * (2.0 + g2) * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5);
  return num / denom;
}

// Density falloff with altitude
float densityAtHeight(float h) {
  return exp(-h / scaleHeight);
}

// Ray-sphere intersection
// Returns distance to intersection, or -1 if no intersection
vec2 raySphereIntersect(vec3 origin, vec3 dir, float radius) {
  float b = dot(origin, dir);
  float c = dot(origin, origin) - radius * radius;
  float d = b * b - c;
  
  if (d < 0.0) return vec2(-1.0);
  
  float sd = sqrt(d);
  return vec2(-b - sd, -b + sd);
}

void main() {
  vec3 rayOrigin = cameraPosition;
  vec3 rayDir = normalize(vWorldPosition - cameraPosition);
  
  // Find atmosphere intersection
  vec2 atmIntersect = raySphereIntersect(rayOrigin, rayDir, atmosphereRadius);
  
  if (atmIntersect.y < 0.0) {
    discard;
  }
  
  // Check for planet intersection
  vec2 planetIntersect = raySphereIntersect(rayOrigin, rayDir, planetRadius);
  
  float tStart = max(atmIntersect.x, 0.0);
  float tEnd = (planetIntersect.x > 0.0) ? planetIntersect.x : atmIntersect.y;
  
  if (tStart >= tEnd) {
    discard;
  }
  
  // Calculate scattering
  float segmentLength = (tEnd - tStart) / float(NUM_SAMPLES);
  vec3 rayleighSum = vec3(0.0);
  vec3 mieSum = vec3(0.0);
  float opticalDepthR = 0.0;
  float opticalDepthM = 0.0;
  
  for (int i = 0; i < NUM_SAMPLES; i++) {
    float t = tStart + (float(i) + 0.5) * segmentLength;
    vec3 samplePoint = rayOrigin + rayDir * t;
    float height = length(samplePoint) - planetRadius;
    
    // Density at sample point
    float densityR = densityAtHeight(height);
    float densityM = densityR; // Same scale height for simplicity
    
    opticalDepthR += densityR * segmentLength;
    opticalDepthM += densityM * segmentLength;
    
    // Light ray to sun
    vec2 lightIntersect = raySphereIntersect(samplePoint, sunDirection, atmosphereRadius);
    
    if (lightIntersect.y > 0.0) {
      float lightSegment = lightIntersect.y / float(NUM_SAMPLES_LIGHT);
      float lightOpticalDepthR = 0.0;
      float lightOpticalDepthM = 0.0;
      
      for (int j = 0; j < NUM_SAMPLES_LIGHT; j++) {
        float lt = (float(j) + 0.5) * lightSegment;
        vec3 lightSample = samplePoint + sunDirection * lt;
        float lightHeight = length(lightSample) - planetRadius;
        
        if (lightHeight < 0.0) break;
        
        float lightDensity = densityAtHeight(lightHeight);
        lightOpticalDepthR += lightDensity * lightSegment;
        lightOpticalDepthM += lightDensity * lightSegment;
      }
      
      // Transmittance to sun
      vec3 tau = rayleighCoefficient * (opticalDepthR + lightOpticalDepthR) +
                 mieCoefficient * (opticalDepthM + lightOpticalDepthM);
      vec3 transmittance = exp(-tau);
      
      rayleighSum += densityR * transmittance * segmentLength;
      mieSum += densityM * transmittance * segmentLength;
    }
  }
  
  // Phase functions
  float cosTheta = dot(rayDir, sunDirection);
  float phaseR = rayleighPhase(cosTheta);
  float phaseM = miePhase(cosTheta, g);
  
  // Final color
  vec3 rayleighColor = rayleighCoefficient * phaseR * rayleighSum;
  vec3 mieColor = vec3(mieCoefficient) * phaseM * mieSum;
  vec3 color = sunIntensity * (rayleighColor + mieColor);
  
  // Transmittance for alpha
  vec3 tau = rayleighCoefficient * opticalDepthR + mieCoefficient * opticalDepthM;
  float alpha = 1.0 - exp(-length(tau) * 0.5);
  
  gl_FragColor = vec4(color, alpha);
}
`;

export class AtmosphereShader {
  /**
   * Create atmosphere shader material
   */
  static createMaterial(params: AtmosphereParams): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        cameraPosition: { value: new THREE.Vector3(0, 0, 0) },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
        rayleighCoefficient: {
          value: new THREE.Vector3(
            params.rayleighCoefficient[0],
            params.rayleighCoefficient[1],
            params.rayleighCoefficient[2]
          ),
        },
        mieCoefficient: { value: params.mieCoefficient },
        scaleHeight: { value: params.scaleHeight },
        planetRadius: { value: params.planetRadius },
        atmosphereRadius: { value: params.atmosphereRadius },
        sunIntensity: { value: params.sunIntensity },
        g: { value: params.g },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
  }

  /**
   * Get Earth-like atmosphere parameters
   * Based on Bruneton & Neyret (2008) reference values
   */
  static getEarthParams(): AtmosphereParams {
    return {
      // Rayleigh scattering coefficients at sea level for RGB wavelengths
      // λ = 680nm (red), 550nm (green), 440nm (blue)
      rayleighCoefficient: [5.5e-6, 13.0e-6, 22.4e-6],
      // Mie scattering coefficient
      mieCoefficient: 21e-6,
      // Scale height for Rayleigh scattering (8.5 km for Earth)
      scaleHeight: 8500,
      // Earth radius
      planetRadius: 6.371e6,
      // Atmosphere radius (6471 km, 100 km above surface)
      atmosphereRadius: 6.471e6,
      // Sun intensity
      sunIntensity: 22,
      // Mie scattering asymmetry (forward scattering)
      g: 0.76,
    };
  }

  /**
   * Get Mars-like atmosphere parameters
   */
  static getMarsParams(): AtmosphereParams {
    return {
      // Thinner atmosphere with more dust
      rayleighCoefficient: [19.918e-6, 13.57e-6, 5.75e-6], // Reddish
      mieCoefficient: 50e-6, // More dust
      scaleHeight: 11100, // Higher scale height due to lower gravity
      planetRadius: 3.3895e6,
      atmosphereRadius: 3.4895e6, // 100 km above surface
      sunIntensity: 10, // Further from sun
      g: 0.7,
    };
  }
}
