/**
 * Solar System Simulation - Moon Entity
 * ======================================
 * Moons orbiting planets.
 */

class Moon extends CelestialBody {
    constructor(config, parentPlanet) {
        super({
            ...config,
            type: 'moon',
            parent: parentPlanet,
        });
        
        // Orbital properties relative to parent
        this.orbitalRadius = config.orbitalRadius || 3.844e8;
        this.orbitalVelocity = config.orbitalVelocity || 1022;
        this.orbitalAngle = config.orbitalAngle || 0;
        this.parentPlanet = parentPlanet;
        
        // Initialize orbit around parent
        this.initializeOrbit();
        
        Logger.info(`Moon created: ${this.name} orbiting ${parentPlanet?.name || 'unknown'}`);
    }
    
    /**
     * Initialize orbital position and velocity relative to parent planet
     */
    initializeOrbit() {
        if (!this.parentPlanet) {
            Logger.warn(`Moon ${this.name} has no parent planet`);
            return;
        }
        
        // Position relative to parent
        const relX = Math.cos(this.orbitalAngle) * this.orbitalRadius;
        const relZ = Math.sin(this.orbitalAngle) * this.orbitalRadius;
        
        // Absolute position = parent position + relative offset
        this.position.x = this.parentPlanet.position.x + relX;
        this.position.y = this.parentPlanet.position.y;
        this.position.z = this.parentPlanet.position.z + relZ;
        
        // Velocity = parent velocity + orbital velocity around parent
        const vAngle = this.orbitalAngle + Math.PI / 2;
        const relVx = Math.cos(vAngle) * this.orbitalVelocity;
        const relVz = Math.sin(vAngle) * this.orbitalVelocity;
        
        this.velocity.x = this.parentPlanet.velocity.x + relVx;
        this.velocity.y = this.parentPlanet.velocity.y;
        this.velocity.z = this.parentPlanet.velocity.z + relVz;
        
        Logger.debug(`${this.name} orbit initialized around ${this.parentPlanet.name}`);
    }
    
    /**
     * Create moon mesh with procedural texture
     */
    createMesh() {
        const geometry = new THREE.SphereGeometry(this.visualRadius, 32, 32);
        
        // Create crater texture
        const texture = this.createMoonTexture();
        
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.9,
            metalness: 0.1,
            bumpMap: texture,
            bumpScale: 0.02,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.group.add(this.mesh);
        
        return this.group;
    }
    
    /**
     * Create procedural moon texture with craters
     */
    createMoonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Base gray color
        const baseColor = new THREE.Color(this.color);
        ctx.fillStyle = `rgb(${Math.floor(baseColor.r * 255)}, ${Math.floor(baseColor.g * 255)}, ${Math.floor(baseColor.b * 255)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add noise
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 30;
            imageData.data[i] = MathUtils.clamp(imageData.data[i] + noise, 0, 255);
            imageData.data[i + 1] = MathUtils.clamp(imageData.data[i + 1] + noise, 0, 255);
            imageData.data[i + 2] = MathUtils.clamp(imageData.data[i + 2] + noise, 0, 255);
        }
        ctx.putImageData(imageData, 0, 0);
        
        // Add craters
        ctx.globalCompositeOperation = 'multiply';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = 5 + Math.random() * 25;
            
            // Crater gradient
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(80, 80, 80, 1)');
            gradient.addColorStop(0.5, 'rgba(120, 120, 120, 1)');
            gradient.addColorStop(0.8, 'rgba(160, 160, 160, 1)');
            gradient.addColorStop(1, 'rgba(180, 180, 180, 1)');
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        return texture;
    }
    
    /**
     * Update moon (called each frame)
     */
    update(deltaTime) {
        // Tidal locking - moon always faces parent (approximate)
        if (this.parentPlanet && this.mesh) {
            const toParent = new THREE.Vector3(
                this.parentPlanet.group.position.x - this.group.position.x,
                this.parentPlanet.group.position.y - this.group.position.y,
                this.parentPlanet.group.position.z - this.group.position.z
            );
            const angle = Math.atan2(toParent.x, toParent.z);
            this.mesh.rotation.y = angle;
        }
    }
    
    /**
     * Get orbital period around parent
     */
    getOrbitalPeriod() {
        if (!this.parentPlanet) return 0;
        return MathUtils.orbitalPeriod(Config.physics.G, this.parentPlanet.mass, this.orbitalRadius);
    }
}
