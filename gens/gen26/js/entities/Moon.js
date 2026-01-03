/**
 * ============================================
 * Moon Entity
 * ============================================
 * 
 * A moon orbiting a planet.
 */

class Moon extends CelestialBody {
    constructor(config) {
        super(config);
        this.bodyType = 'moon';
        
        // Relative orbital parameters (relative to parent)
        this.orbitalRadius = config.orbitalRadius || 384400;
        this.orbitalPeriod = config.orbitalPeriod || 27.3 * 24 * 3600;
        
        // Relative position/velocity (to be added to parent)
        this.relativePosition = config.relativePosition || { x: 384400, y: 0, z: 0 };
        this.relativeVelocity = config.relativeVelocity || { x: 0, y: 0, z: 1.022 };
    }
    
    /**
     * Set up initial position relative to parent
     */
    initializeOrbit(parentBody) {
        if (!parentBody) {
            console.warn(`Moon ${this.name} has no parent body`);
            return;
        }
        
        this.parentBody = parentBody;
        
        // Set absolute position = parent position + relative position
        this.physicsData.position.x = parentBody.physicsData.position.x + this.relativePosition.x;
        this.physicsData.position.y = parentBody.physicsData.position.y + this.relativePosition.y;
        this.physicsData.position.z = parentBody.physicsData.position.z + this.relativePosition.z;
        
        // Set absolute velocity = parent velocity + relative orbital velocity
        this.physicsData.velocity.x = parentBody.physicsData.velocity.x + this.relativeVelocity.x;
        this.physicsData.velocity.y = parentBody.physicsData.velocity.y + this.relativeVelocity.y;
        this.physicsData.velocity.z = parentBody.physicsData.velocity.z + this.relativeVelocity.z;
        
        console.info(`Moon ${this.name} orbit initialized around ${parentBody.name}`);
    }
    
    /**
     * Create moon-specific mesh (more crater-like)
     */
    createMesh(fidelitySettings) {
        const segments = fidelitySettings.planetSegments || 32;
        const renderRadius = this.physicsData.radius / CONFIG.PHYSICS.DISTANCE_SCALE;
        
        const geometry = new THREE.SphereGeometry(renderRadius, segments, segments);
        
        // Add crater-like surface detail
        this.addCraterDetail(geometry, renderRadius);
        
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.9,
            metalness: 0.0
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = `${this.name}_mesh`;
        
        this.group.add(this.mesh);
    }
    
    /**
     * Add crater-like surface detail
     */
    addCraterDetail(geometry, radius) {
        const positions = geometry.attributes.position;
        
        // Create several "craters" at random positions
        const craterCount = 8;
        const craters = [];
        
        for (let i = 0; i < craterCount; i++) {
            craters.push({
                center: MathUtils.randomOnSphere(1),
                size: MathUtils.randomRange(0.1, 0.3),
                depth: MathUtils.randomRange(0.002, 0.01)
            });
        }
        
        for (let i = 0; i < positions.count; i++) {
            let x = positions.getX(i);
            let y = positions.getY(i);
            let z = positions.getZ(i);
            
            const len = Math.sqrt(x * x + y * y + z * z);
            const nx = x / len;
            const ny = y / len;
            const nz = z / len;
            
            let displacement = 0;
            
            // Check each crater
            for (const crater of craters) {
                const dot = nx * crater.center.x + ny * crater.center.y + nz * crater.center.z;
                const dist = Math.acos(MathUtils.clamp(dot, -1, 1));
                
                if (dist < crater.size) {
                    const t = dist / crater.size;
                    displacement -= crater.depth * (1 - t * t);
                }
            }
            
            // Add general noise
            displacement += this.simpleNoise(x * 15, y * 15, z * 15) * 0.001;
            
            const newLen = len * (1 + displacement);
            positions.setXYZ(i, nx * newLen, ny * newLen, nz * newLen);
        }
        
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
    }
}
