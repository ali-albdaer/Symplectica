/**
 * PostProcessing.js
 * Post-processing effects for enhanced visuals.
 * Includes bloom, tone mapping, and other effects.
 */

import * as THREE from 'three';
import { QUALITY_PRESETS } from '../config/GlobalConfig.js';
import { DebugLogger } from '../utils/DebugLogger.js';

const logger = new DebugLogger('PostProcessing');

/**
 * Simple bloom effect without external dependencies
 * Uses a multi-pass blur approach
 */
export class SimpleBloom {
    constructor(renderer, scene, camera, qualityLevel = 'medium') {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.quality = QUALITY_PRESETS[qualityLevel];
        this.enabled = this.quality.bloomEnabled;
        
        // Bloom parameters
        this.threshold = 0.8;
        this.strength = 0.5;
        this.radius = 0.4;
        
        this.init();
    }

    init() {
        const size = this.renderer.getSize(new THREE.Vector2());
        
        // Create render targets for bloom
        const rtParams = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
        };
        
        this.renderTargetBright = new THREE.WebGLRenderTarget(size.x / 2, size.y / 2, rtParams);
        this.renderTargetBlurH = new THREE.WebGLRenderTarget(size.x / 4, size.y / 4, rtParams);
        this.renderTargetBlurV = new THREE.WebGLRenderTarget(size.x / 4, size.y / 4, rtParams);
        
        // Full-screen quad for post-processing
        this.quadGeometry = new THREE.PlaneGeometry(2, 2);
        
        // Bright pass material (extract bright areas)
        this.brightMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                threshold: { value: this.threshold },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float threshold;
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
                    if (brightness > threshold) {
                        gl_FragColor = color;
                    } else {
                        gl_FragColor = vec4(0.0);
                    }
                }
            `,
        });
        
        // Blur material
        this.blurMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                direction: { value: new THREE.Vector2(1, 0) },
                resolution: { value: new THREE.Vector2(size.x / 4, size.y / 4) },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform vec2 direction;
                uniform vec2 resolution;
                varying vec2 vUv;
                
                void main() {
                    vec2 texelSize = 1.0 / resolution;
                    vec4 result = vec4(0.0);
                    
                    // 9-tap Gaussian blur
                    float weights[5];
                    weights[0] = 0.227027;
                    weights[1] = 0.1945946;
                    weights[2] = 0.1216216;
                    weights[3] = 0.054054;
                    weights[4] = 0.016216;
                    
                    result += texture2D(tDiffuse, vUv) * weights[0];
                    
                    for (int i = 1; i < 5; i++) {
                        vec2 offset = direction * texelSize * float(i) * 2.0;
                        result += texture2D(tDiffuse, vUv + offset) * weights[i];
                        result += texture2D(tDiffuse, vUv - offset) * weights[i];
                    }
                    
                    gl_FragColor = result;
                }
            `,
        });
        
        // Composite material (combine original + bloom)
        this.compositeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                tBloom: { value: null },
                bloomStrength: { value: this.strength },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform sampler2D tBloom;
                uniform float bloomStrength;
                varying vec2 vUv;
                
                void main() {
                    vec4 original = texture2D(tDiffuse, vUv);
                    vec4 bloom = texture2D(tBloom, vUv);
                    
                    // Additive blending
                    gl_FragColor = original + bloom * bloomStrength;
                    
                    // Simple tone mapping
                    gl_FragColor.rgb = gl_FragColor.rgb / (gl_FragColor.rgb + vec3(1.0));
                    
                    // Gamma correction
                    gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
                    gl_FragColor.a = 1.0;
                }
            `,
        });
        
        this.quadMesh = new THREE.Mesh(this.quadGeometry, this.brightMaterial);
        this.quadScene = new THREE.Scene();
        this.quadScene.add(this.quadMesh);
        this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        // Main render target
        this.mainRenderTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
        });
        
        logger.info('Post-processing initialized');
    }

    render() {
        if (!this.enabled) {
            // Direct render without post-processing
            this.renderer.render(this.scene, this.camera);
            return;
        }
        
        // Step 1: Render scene to main render target
        this.renderer.setRenderTarget(this.mainRenderTarget);
        this.renderer.render(this.scene, this.camera);
        
        // Step 2: Extract bright areas
        this.quadMesh.material = this.brightMaterial;
        this.brightMaterial.uniforms.tDiffuse.value = this.mainRenderTarget.texture;
        this.renderer.setRenderTarget(this.renderTargetBright);
        this.renderer.render(this.quadScene, this.quadCamera);
        
        // Step 3: Horizontal blur
        this.quadMesh.material = this.blurMaterial;
        this.blurMaterial.uniforms.tDiffuse.value = this.renderTargetBright.texture;
        this.blurMaterial.uniforms.direction.value.set(1, 0);
        this.renderer.setRenderTarget(this.renderTargetBlurH);
        this.renderer.render(this.quadScene, this.quadCamera);
        
        // Step 4: Vertical blur
        this.blurMaterial.uniforms.tDiffuse.value = this.renderTargetBlurH.texture;
        this.blurMaterial.uniforms.direction.value.set(0, 1);
        this.renderer.setRenderTarget(this.renderTargetBlurV);
        this.renderer.render(this.quadScene, this.quadCamera);
        
        // Step 5: Composite
        this.quadMesh.material = this.compositeMaterial;
        this.compositeMaterial.uniforms.tDiffuse.value = this.mainRenderTarget.texture;
        this.compositeMaterial.uniforms.tBloom.value = this.renderTargetBlurV.texture;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.quadScene, this.quadCamera);
    }

    setSize(width, height) {
        this.mainRenderTarget.setSize(width, height);
        this.renderTargetBright.setSize(width / 2, height / 2);
        this.renderTargetBlurH.setSize(width / 4, height / 4);
        this.renderTargetBlurV.setSize(width / 4, height / 4);
        
        this.blurMaterial.uniforms.resolution.value.set(width / 4, height / 4);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setStrength(strength) {
        this.strength = strength;
        this.compositeMaterial.uniforms.bloomStrength.value = strength;
    }

    setThreshold(threshold) {
        this.threshold = threshold;
        this.brightMaterial.uniforms.threshold.value = threshold;
    }

    dispose() {
        this.mainRenderTarget.dispose();
        this.renderTargetBright.dispose();
        this.renderTargetBlurH.dispose();
        this.renderTargetBlurV.dispose();
        this.quadGeometry.dispose();
        this.brightMaterial.dispose();
        this.blurMaterial.dispose();
        this.compositeMaterial.dispose();
        
        logger.info('Post-processing disposed');
    }
}
