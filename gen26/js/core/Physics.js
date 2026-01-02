/**
 * ============================================
 * Physics System
 * ============================================
 * 
 * N-body gravitational physics simulation.
 * Uses Velocity Verlet integration for stability.
 * Handles both celestial bodies and small objects.
 */

class Physics {
    constructor() {
        // Physics bodies (celestial bodies with significant mass)
        this.celestialBodies = [];
        
        // Small physics objects (affected by gravity, don't affect others significantly)
        this.smallObjects = [];
        
        // Gravitational constant (scaled for simulation)
        this.G = CONFIG.PHYSICS.G;
        
        // Scale factor for distances
        this.distanceScale = CONFIG.PHYSICS.DISTANCE_SCALE;
        
        // Time scaling
        this.timeScale = CONFIG.PHYSICS.TIME_SCALE;
        
        // Simulation substeps per frame
        this.substeps = CONFIG.PHYSICS.SUBSTEPS;
        
        // Softening parameter to prevent singularities
        this.softening = CONFIG.PHYSICS.SOFTENING;
        
        // Performance metrics
        this.lastUpdateTime = 0;
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the physics system
     */
    init() {
        console.info('Initializing Physics System...');
        
        try {
            // Update from config
            this.G = CONFIG.PHYSICS.G;
            this.distanceScale = CONFIG.PHYSICS.DISTANCE_SCALE;
            this.timeScale = CONFIG.PHYSICS.TIME_SCALE;
            this.substeps = CONFIG.PHYSICS.SUBSTEPS;
            this.softening = CONFIG.PHYSICS.SOFTENING;
            
            this.isInitialized = true;
            console.success('Physics System initialized');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize Physics: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Register a celestial body for physics simulation
     */
    registerCelestialBody(body) {
        if (!body.physicsData) {
            console.error('Body missing physicsData:', body);
            return;
        }
        this.celestialBodies.push(body);
        console.info(`Registered celestial body: ${body.name}`);
    }
    
    /**
     * Register a small object for physics simulation
     */
    registerSmallObject(obj) {
        this.smallObjects.push(obj);
    }
    
    /**
     * Unregister a small object
     */
    unregisterSmallObject(obj) {
        const index = this.smallObjects.indexOf(obj);
        if (index !== -1) {
            this.smallObjects.splice(index, 1);
        }
    }
    
    /**
     * Main physics update
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        const startTime = performance.now();
        
        // Scale delta time
        const scaledDt = deltaTime * this.timeScale;
        
        // Skip if paused or very small dt
        if (scaledDt < 0.0001) return;
        
        // Substep for stability
        const subDt = scaledDt / this.substeps;
        
        for (let i = 0; i < this.substeps; i++) {
            // Update celestial bodies (N-body)
            this.updateCelestialBodies(subDt);
            
            // Update small objects (affected by celestial gravity)
            this.updateSmallObjects(subDt);
        }
        
        this.lastUpdateTime = performance.now() - startTime;
    }
    
    /**
     * Update celestial bodies using Velocity Verlet integration
     */
    updateCelestialBodies(dt) {
        const bodies = this.celestialBodies;
        const n = bodies.length;
        
        if (n === 0) return;
        
        // Store accelerations
        const accelerations = new Array(n);
        
        // Calculate accelerations from gravitational forces
        for (let i = 0; i < n; i++) {
            accelerations[i] = this.calculateGravitationalAcceleration(
                bodies[i].physicsData,
                bodies,
                i
            );
        }
        
        // Velocity Verlet integration
        for (let i = 0; i < n; i++) {
            const body = bodies[i].physicsData;
            const acc = accelerations[i];
            
            // Update position: x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
            body.position.x += body.velocity.x * dt + 0.5 * acc.x * dt * dt;
            body.position.y += body.velocity.y * dt + 0.5 * acc.y * dt * dt;
            body.position.z += body.velocity.z * dt + 0.5 * acc.z * dt * dt;
        }
        
        // Calculate new accelerations
        const newAccelerations = new Array(n);
        for (let i = 0; i < n; i++) {
            newAccelerations[i] = this.calculateGravitationalAcceleration(
                bodies[i].physicsData,
                bodies,
                i
            );
        }
        
        // Update velocities: v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
        for (let i = 0; i < n; i++) {
            const body = bodies[i].physicsData;
            const acc = accelerations[i];
            const newAcc = newAccelerations[i];
            
            body.velocity.x += 0.5 * (acc.x + newAcc.x) * dt;
            body.velocity.y += 0.5 * (acc.y + newAcc.y) * dt;
            body.velocity.z += 0.5 * (acc.z + newAcc.z) * dt;
        }
        
        // Sync Three.js objects with physics
        for (let i = 0; i < n; i++) {
            bodies[i].syncFromPhysics();
        }
    }
    
    /**
     * Calculate gravitational acceleration on a body from all other bodies
     */
    calculateGravitationalAcceleration(body, allBodies, selfIndex) {
        const acc = { x: 0, y: 0, z: 0 };
        
        for (let j = 0; j < allBodies.length; j++) {
            if (j === selfIndex) continue;
            
            const other = allBodies[j].physicsData;
            
            // Direction vector from body to other
            const dx = other.position.x - body.position.x;
            const dy = other.position.y - body.position.y;
            const dz = other.position.z - body.position.z;
            
            // Distance squared with softening
            const distSq = dx * dx + dy * dy + dz * dz + this.softening * this.softening;
            const dist = Math.sqrt(distSq);
            
            // Gravitational acceleration: a = GM/r² in direction of other body
            // Note: distances are in km, need to convert to meters for G
            const distMeters = dist * 1000; // km to m
            const distSqMeters = distMeters * distMeters;
            
            // a = GM/r² (m/s²), convert back to km/s²
            const aMagnitude = (this.G * other.mass) / distSqMeters / 1000;
            
            // Normalize and apply
            acc.x += aMagnitude * dx / dist;
            acc.y += aMagnitude * dy / dist;
            acc.z += aMagnitude * dz / dist;
        }
        
        return acc;
    }
    
    /**
     * Update small objects (player, interactive objects)
     */
    updateSmallObjects(dt) {
        for (const obj of this.smallObjects) {
            if (!obj.physicsData || obj.physicsData.isStatic) continue;
            
            // Calculate acceleration from all celestial bodies
            const acc = this.calculateSmallObjectAcceleration(obj.physicsData);
            
            // Simple Verlet integration for small objects
            const body = obj.physicsData;
            
            // Update velocity
            body.velocity.x += acc.x * dt;
            body.velocity.y += acc.y * dt;
            body.velocity.z += acc.z * dt;
            
            // Update position
            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            body.position.z += body.velocity.z * dt;
            
            // Sync visual
            if (obj.syncFromPhysics) {
                obj.syncFromPhysics();
            }
        }
    }
    
    /**
     * Calculate acceleration on small object from celestial bodies
     */
    calculateSmallObjectAcceleration(body) {
        const acc = { x: 0, y: 0, z: 0 };
        
        for (const celestial of this.celestialBodies) {
            const other = celestial.physicsData;
            
            const dx = other.position.x - body.position.x;
            const dy = other.position.y - body.position.y;
            const dz = other.position.z - body.position.z;
            
            const distSq = dx * dx + dy * dy + dz * dz + this.softening * this.softening;
            const dist = Math.sqrt(distSq);
            
            // Convert to meters for calculation
            const distMeters = dist * 1000;
            const distSqMeters = distMeters * distMeters;
            
            // a = GM/r² (m/s²), convert to km/s²
            const aMagnitude = (this.G * other.mass) / distSqMeters / 1000;
            
            acc.x += aMagnitude * dx / dist;
            acc.y += aMagnitude * dy / dist;
            acc.z += aMagnitude * dz / dist;
        }
        
        return acc;
    }
    
    /**
     * Get the nearest celestial body to a position
     */
    getNearestBody(position) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const body of this.celestialBodies) {
            const pos = body.physicsData.position;
            const dx = pos.x - position.x;
            const dy = pos.y - position.y;
            const dz = pos.z - position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = body;
            }
        }
        
        return { body: nearest, distance: minDist };
    }
    
    /**
     * Get surface gravity at a point on a celestial body
     */
    getSurfaceGravity(body) {
        if (!body || !body.physicsData) return 0;
        
        const radiusMeters = body.physicsData.radius * 1000; // km to m
        return (this.G * body.physicsData.mass) / (radiusMeters * radiusMeters);
    }
    
    /**
     * Get distance from surface of nearest body
     */
    getAltitude(position) {
        const { body, distance } = this.getNearestBody(position);
        if (!body) return Infinity;
        
        return distance - body.physicsData.radius;
    }
    
    /**
     * Check if position is inside a celestial body
     */
    isInsideBody(position) {
        for (const body of this.celestialBodies) {
            const pos = body.physicsData.position;
            const dx = pos.x - position.x;
            const dy = pos.y - position.y;
            const dz = pos.z - position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < body.physicsData.radius) {
                return body;
            }
        }
        return null;
    }
    
    /**
     * Get up vector (away from nearest body) at a position
     */
    getUpVector(position) {
        const { body } = this.getNearestBody(position);
        if (!body) return { x: 0, y: 1, z: 0 };
        
        const pos = body.physicsData.position;
        const dx = position.x - pos.x;
        const dy = position.y - pos.y;
        const dz = position.z - pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist === 0) return { x: 0, y: 1, z: 0 };
        
        return {
            x: dx / dist,
            y: dy / dist,
            z: dz / dist
        };
    }
    
    /**
     * Update configuration from CONFIG
     */
    updateConfig() {
        this.G = CONFIG.PHYSICS.G;
        this.timeScale = CONFIG.PHYSICS.TIME_SCALE;
        this.substeps = CONFIG.PHYSICS.SUBSTEPS;
        this.softening = CONFIG.PHYSICS.SOFTENING;
    }
    
    /**
     * Get physics stats for debugging
     */
    getStats() {
        return {
            celestialBodies: this.celestialBodies.length,
            smallObjects: this.smallObjects.length,
            updateTime: this.lastUpdateTime.toFixed(2) + 'ms',
            timeScale: this.timeScale,
            substeps: this.substeps
        };
    }
}
