/**
 * Shaders.js - Custom GPU Shaders for Visual Effects
 * Contains atmosphere, star corona, and post-processing shaders
 */

export const Shaders = {
    
    // ============================================
    // ATMOSPHERE SHADER
    // ============================================
    atmosphere: {
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 atmosphereColor;
            uniform float intensity;
            uniform vec3 lightPosition;
            
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            
            void main() {
                vec3 viewDir = normalize(-vPosition);
                vec3 lightDir = normalize(lightPosition - vWorldPosition);
                
                // Fresnel effect
                float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
                
                // Day/night factor
                float dayFactor = max(0.0, dot(vNormal, lightDir));
                dayFactor = 0.3 + dayFactor * 0.7;
                
                vec3 finalColor = atmosphereColor * dayFactor;
                float alpha = fresnel * intensity * dayFactor;
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        uniforms: {
            atmosphereColor: { value: new THREE.Color(0x88AAFF) },
            intensity: { value: 0.6 },
            lightPosition: { value: new THREE.Vector3(0, 0, 0) }
        }
    },

    // ============================================
    // STAR CORONA SHADER
    // ============================================
    starCorona: {
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 coronaColor;
            uniform float intensity;
            
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
            
            // Noise function for corona turbulence
            float noise(vec3 p) {
                return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
            }
            
            void main() {
                float dist = length(vPosition);
                float pulse = sin(time * 2.0 + dist * 0.5) * 0.1 + 0.9;
                
                // Create turbulent edge
                float turbulence = noise(vPosition * 5.0 + time * 0.5) * 0.3;
                
                float corona = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                corona *= pulse;
                corona += turbulence * 0.2;
                
                vec3 finalColor = coronaColor * (1.0 + turbulence);
                
                gl_FragColor = vec4(finalColor, corona * intensity);
            }
        `,
        uniforms: {
            time: { value: 0 },
            coronaColor: { value: new THREE.Color(0xFFAA00) },
            intensity: { value: 0.8 }
        }
    },

    // ============================================
    // BLACKHOLE DISTORTION SHADER
    // ============================================
    blackholeDistortion: {
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform vec2 blackholePosition;
            uniform float schwarzschildRadius;
            uniform float distortionStrength;
            
            varying vec2 vUv;
            
            void main() {
                vec2 center = blackholePosition;
                vec2 delta = vUv - center;
                float distance = length(delta);
                
                // Calculate gravitational lensing distortion
                float distortion = 0.0;
                if (distance > schwarzschildRadius * 0.5) {
                    distortion = schwarzschildRadius / (distance * distance) * distortionStrength;
                }
                
                vec2 distortedUv = vUv + normalize(delta) * distortion;
                
                // Event horizon effect - complete blackness inside
                if (distance < schwarzschildRadius) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                } else {
                    gl_FragColor = texture2D(tDiffuse, distortedUv);
                }
            }
        `,
        uniforms: {
            tDiffuse: { value: null },
            blackholePosition: { value: new THREE.Vector2(0.5, 0.5) },
            schwarzschildRadius: { value: 0.1 },
            distortionStrength: { value: 0.05 }
        }
    },

    // ============================================
    // ACCRETION DISK SHADER
    // ============================================
    accretionDisk: {
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 innerColor;
            uniform vec3 outerColor;
            uniform float rotationSpeed;
            
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                vec2 centeredUv = vUv - vec2(0.5);
                float dist = length(centeredUv);
                float angle = atan(centeredUv.y, centeredUv.x);
                
                // Rotating spiral pattern
                float spiral = sin(angle * 5.0 + time * rotationSpeed - dist * 20.0);
                spiral = spiral * 0.5 + 0.5;
                
                // Temperature gradient (hotter toward center)
                vec3 color = mix(innerColor, outerColor, dist * 2.0);
                
                // Doppler effect simulation
                float doppler = sin(angle + time * 2.0) * 0.2 + 1.0;
                color *= doppler;
                
                // Intensity falloff
                float alpha = (1.0 - dist * 2.0) * 0.8;
                alpha *= spiral * 0.5 + 0.5;
                alpha = max(0.0, alpha);
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        uniforms: {
            time: { value: 0 },
            innerColor: { value: new THREE.Color(0xFFFFFF) },
            outerColor: { value: new THREE.Color(0xFF4400) },
            rotationSpeed: { value: 2.0 }
        }
    },

    // ============================================
    // PLANET SURFACE SHADER
    // ============================================
    planetSurface: {
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            varying vec2 vUv;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 baseColor;
            uniform vec3 lightPosition;
            uniform float roughness;
            uniform float time;
            
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            varying vec2 vUv;
            
            // Simple noise for surface detail
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            void main() {
                vec3 lightDir = normalize(lightPosition - vWorldPosition);
                vec3 viewDir = normalize(-vPosition);
                vec3 halfDir = normalize(lightDir + viewDir);
                
                // Surface noise
                float surfaceNoise = noise(vUv * 50.0) * 0.2;
                
                // Diffuse lighting
                float diff = max(dot(vNormal, lightDir), 0.0);
                
                // Specular (Blinn-Phong)
                float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0 * (1.0 - roughness));
                
                vec3 color = baseColor * (0.1 + diff * 0.9);
                color += vec3(spec * 0.3);
                color += surfaceNoise * baseColor;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        uniforms: {
            baseColor: { value: new THREE.Color(0x4488FF) },
            lightPosition: { value: new THREE.Vector3(0, 0, 0) },
            roughness: { value: 0.7 },
            time: { value: 0 }
        }
    },

    // ============================================
    // SPACE SKYBOX SHADER
    // ============================================
    spaceSkybox: {
        vertexShader: `
            varying vec3 vWorldDirection;
            
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldDirection = worldPosition.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
                gl_Position.z = gl_Position.w; // Push to far plane
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float starDensity;
            
            varying vec3 vWorldDirection;
            
            // Hash function for star placement
            float hash(vec3 p) {
                p = fract(p * vec3(443.8975, 397.2973, 491.1871));
                p += dot(p, p.yxz + 19.19);
                return fract((p.x + p.y) * p.z);
            }
            
            void main() {
                vec3 dir = normalize(vWorldDirection);
                
                // Base dark space color
                vec3 color = vec3(0.0, 0.0, 0.02);
                
                // Add stars
                vec3 gridPos = floor(dir * 100.0);
                float starHash = hash(gridPos);
                
                if (starHash > 1.0 - starDensity) {
                    // Star brightness varies
                    float brightness = pow(starHash, 8.0);
                    
                    // Star twinkle
                    brightness *= 0.8 + 0.2 * sin(time * 3.0 + starHash * 100.0);
                    
                    // Star color variation
                    vec3 starColor = vec3(1.0);
                    if (starHash > 0.99) {
                        starColor = vec3(1.0, 0.8, 0.6); // Red giant
                    } else if (starHash > 0.98) {
                        starColor = vec3(0.6, 0.8, 1.0); // Blue star
                    }
                    
                    color += starColor * brightness;
                }
                
                // Add subtle nebula
                float nebula = hash(floor(dir * 20.0)) * 0.02;
                color += vec3(0.1, 0.05, 0.15) * nebula;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        uniforms: {
            time: { value: 0 },
            starDensity: { value: 0.02 }
        }
    },

    // ============================================
    // BLOOM POST-PROCESS SHADER
    // ============================================
    bloom: {
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float threshold;
            uniform float intensity;
            uniform vec2 resolution;
            
            varying vec2 vUv;
            
            void main() {
                vec4 color = texture2D(tDiffuse, vUv);
                
                // Extract bright areas
                float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                
                if (brightness > threshold) {
                    // Apply simple blur for bloom
                    vec2 texelSize = 1.0 / resolution;
                    vec3 bloom = vec3(0.0);
                    
                    for (int x = -2; x <= 2; x++) {
                        for (int y = -2; y <= 2; y++) {
                            vec2 offset = vec2(float(x), float(y)) * texelSize * 2.0;
                            bloom += texture2D(tDiffuse, vUv + offset).rgb;
                        }
                    }
                    bloom /= 25.0;
                    
                    color.rgb += bloom * intensity * (brightness - threshold);
                }
                
                gl_FragColor = color;
            }
        `,
        uniforms: {
            tDiffuse: { value: null },
            threshold: { value: 0.8 },
            intensity: { value: 1.5 },
            resolution: { value: new THREE.Vector2(1920, 1080) }
        }
    }
};

/**
 * Create a shader material from a shader definition
 */
export function createShaderMaterial(shaderDef, customUniforms = {}) {
    const uniforms = {};
    
    // Clone uniforms to avoid shared state
    for (const key in shaderDef.uniforms) {
        const uniform = shaderDef.uniforms[key];
        if (uniform.value.clone) {
            uniforms[key] = { value: uniform.value.clone() };
        } else {
            uniforms[key] = { value: uniform.value };
        }
    }
    
    // Apply custom uniforms
    for (const key in customUniforms) {
        uniforms[key] = { value: customUniforms[key] };
    }
    
    return new THREE.ShaderMaterial({
        vertexShader: shaderDef.vertexShader,
        fragmentShader: shaderDef.fragmentShader,
        uniforms: uniforms,
        transparent: true,
        side: THREE.DoubleSide
    });
}

export default Shaders;
