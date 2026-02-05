/**
 * Atmospheric Rendering
 * 
 * Placeholder for Bruneton atmospheric scattering.
 * Currently implements a simple glow effect for planets with atmospheres.
 * 
 * TODO: Implement full precomputed atmospheric scattering with:
 * - Rayleigh scattering LUT
 * - Mie scattering LUT
 * - Scattering/transmittance integration
 */

import * as THREE from 'three';

// Simple atmospheric glow shader
const atmosphereVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const atmosphereFragmentShader = `
uniform vec3 atmosphereColor;
uniform float atmosphereIntensity;
uniform float atmosphereScale;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Simple rim lighting for atmospheric glow
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));
    fresnel = pow(fresnel, 3.0) * atmosphereIntensity;
    
    // Fade out at edges
    float rim = smoothstep(0.0, 1.0, fresnel);
    
    gl_FragColor = vec4(atmosphereColor, rim * 0.6);
}
`;

export interface AtmosphereConfig {
    color: THREE.Color;
    intensity: number;
    scale: number;
}

export class AtmosphereEffect {
    private mesh: THREE.Mesh;
    private material: THREE.ShaderMaterial;

    constructor(radius: number, config: AtmosphereConfig) {
        // Create slightly larger sphere for atmosphere
        const geometry = new THREE.SphereGeometry(radius * config.scale, 64, 32);

        this.material = new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            uniforms: {
                atmosphereColor: { value: config.color },
                atmosphereIntensity: { value: config.intensity },
                atmosphereScale: { value: config.scale },
            },
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
    }

    getMesh(): THREE.Mesh {
        return this.mesh;
    }

    setColor(color: THREE.Color): void {
        this.material.uniforms.atmosphereColor.value = color;
    }

    setIntensity(intensity: number): void {
        this.material.uniforms.atmosphereIntensity.value = intensity;
    }

    dispose(): void {
        this.mesh.geometry.dispose();
        this.material.dispose();
    }
}

// Earth-like atmosphere preset
export const EARTH_ATMOSPHERE: AtmosphereConfig = {
    color: new THREE.Color(0.3, 0.6, 1.0),
    intensity: 1.5,
    scale: 1.025,
};

// Mars-like thin atmosphere
export const MARS_ATMOSPHERE: AtmosphereConfig = {
    color: new THREE.Color(0.8, 0.5, 0.3),
    intensity: 0.5,
    scale: 1.01,
};

// Titan-like thick haze
export const TITAN_ATMOSPHERE: AtmosphereConfig = {
    color: new THREE.Color(0.9, 0.7, 0.4),
    intensity: 2.0,
    scale: 1.05,
};
