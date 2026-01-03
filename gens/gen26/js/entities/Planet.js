/**
 * ============================================
 * Planet Entity
 * ============================================
 * 
 * A planet orbiting the sun.
 */

class Planet extends CelestialBody {
    constructor(config) {
        super(config);
        this.bodyType = 'planet';
        
        // Orbital parameters
        this.orbitalRadius = config.orbitalRadius || 149.6e6;
        this.orbitalPeriod = config.orbitalPeriod || 365.25 * 24 * 3600;
    }
    
    /**
     * Create planet-specific mesh with more detail
     */
    createMesh(fidelitySettings) {
        const segments = fidelitySettings.planetSegments || 32;
        const renderRadius = this.physicsData.radius / CONFIG.PHYSICS.DISTANCE_SCALE;
        
        const geometry = new THREE.SphereGeometry(renderRadius, segments, segments);
        
        // Add color variation to geometry
        this.addColorVariation(geometry);
        
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.7,
            metalness: 0.1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = `${this.name}_mesh`;
        
        this.group.add(this.mesh);
    }
    
    /**
     * Add procedural color variation to simulate terrain
     */
    addColorVariation(geometry) {
        const colors = [];
        const positions = geometry.attributes.position;
        const baseColor = new THREE.Color(this.color);
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // Create some noise-based variation
            const noise = this.fbmNoise(x * 3, y * 3, z * 3, 3);
            
            // Vary the color based on noise and "latitude" (y position)
            const color = baseColor.clone();
            
            // Normalize y to get latitude effect
            const len = Math.sqrt(x * x + y * y + z * z);
            const lat = y / len;
            
            // Polar caps (if applicable)
            if (Math.abs(lat) > 0.8) {
                color.lerp(new THREE.Color(0xFFFFFF), (Math.abs(lat) - 0.8) * 5);
            }
            
            // Add general noise variation
            const variation = 0.8 + noise * 0.4;
            color.multiplyScalar(variation);
            
            colors.push(color.r, color.g, color.b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    /**
     * Fractal Brownian Motion noise
     */
    fbmNoise(x, y, z, octaves) {
        let value = 0;
        let amplitude = 0.5;
        let frequency = 1;
        
        for (let i = 0; i < octaves; i++) {
            value += amplitude * this.simpleNoise(x * frequency, y * frequency, z * frequency);
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return value;
    }
}
