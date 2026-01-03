/**
 * Gravity Solver - N-body gravitational force calculation
 * Optimized for solar system simulation with hierarchical approach
 */

const GravitySolver = (function() {
    'use strict';
    
    // Reusable vectors to avoid garbage collection
    const tempVec = new THREE.Vector3();
    const forceVec = new THREE.Vector3();
    
    /**
     * Calculate gravitational force between two bodies
     * F = G * m1 * m2 / (r² + ε²)  where ε is softening parameter
     */
    function calculateGravitationalForce(body1, body2, G, softening) {
        tempVec.subVectors(body2.position, body1.position);
        
        const distSq = tempVec.lengthSq();
        const dist = Math.sqrt(distSq);
        
        // Minimum distance check
        const minDist = Config.PHYSICS.minGravityDistance;
        if (dist < minDist) {
            return { force: new THREE.Vector3(0, 0, 0), distance: dist };
        }
        
        // Softened gravitational force
        const softenedDistSq = distSq + softening * softening;
        const forceMag = G * body1.mass * body2.mass / softenedDistSq;
        
        // Direction from body1 to body2, scaled by force magnitude
        forceVec.copy(tempVec).normalize().multiplyScalar(forceMag);
        
        return { force: forceVec.clone(), distance: dist };
    }
    
    /**
     * Full N-body calculation
     * Every body exerts force on every other body
     */
    function calculateNBody(bodies, celestialBodies, G, softening) {
        const n = bodies.length;
        
        for (let i = 0; i < n; i++) {
            const body1 = bodies[i];
            if (!body1.affectedByGravity) continue;
            
            for (let j = 0; j < n; j++) {
                if (i === j) continue;
                
                const body2 = bodies[j];
                if (body2.mass === 0) continue;
                
                const result = calculateGravitationalForce(body1, body2, G, softening);
                body1.applyForce(result.force);
            }
        }
    }
    
    /**
     * Hierarchical calculation - optimized for solar systems
     * Celestial bodies interact with each other
     * Small objects only feel gravity from celestial bodies (not each other)
     */
    function calculateHierarchical(bodies, celestialBodies, G, softening) {
        // Celestial body interactions (full N-body among them)
        for (let i = 0; i < celestialBodies.length; i++) {
            const body1 = celestialBodies[i];
            
            for (let j = 0; j < celestialBodies.length; j++) {
                if (i === j) continue;
                
                const body2 = celestialBodies[j];
                const result = calculateGravitationalForce(body1, body2, G, softening);
                body1.applyForce(result.force);
            }
        }
        
        // Small bodies feel gravity from celestial bodies only
        for (const body of bodies) {
            if (body.isCelestial || !body.affectedByGravity) continue;
            
            for (const celestial of celestialBodies) {
                const result = calculateGravitationalForce(body, celestial, G, softening);
                body.applyForce(result.force);
            }
        }
    }
    
    /**
     * Barnes-Hut approximation (for future large-scale simulations)
     * Uses octree to approximate distant masses
     * Not implemented yet - placeholder for expansion
     */
    function calculateBarnesHut(bodies, G, softening, theta) {
        // TODO: Implement octree-based Barnes-Hut algorithm
        // For now, fall back to hierarchical
        Logger.warn('GravitySolver', 'Barnes-Hut not implemented, using hierarchical');
        calculateHierarchical(bodies, bodies.filter(b => b.isCelestial), G, softening);
    }
    
    return {
        /**
         * Calculate gravity for all bodies
         */
        calculateGravity: function(bodies, celestialBodies, dt) {
            const G = Config.PHYSICS.G;
            const softening = Config.PHYSICS.softeningParameter;
            
            // Use hierarchical approach for performance
            calculateHierarchical(bodies, celestialBodies, G, softening);
        },
        
        /**
         * Get gravitational acceleration at a point
         * Useful for player physics
         */
        getGravityAtPoint: function(point, celestialBodies) {
            const G = Config.PHYSICS.G;
            const acceleration = new THREE.Vector3(0, 0, 0);
            
            for (const body of celestialBodies) {
                tempVec.subVectors(body.position, point);
                const distSq = tempVec.lengthSq();
                const dist = Math.sqrt(distSq);
                
                if (dist < Config.PHYSICS.minGravityDistance) continue;
                
                // a = G * M / r²
                const accelMag = G * body.mass / distSq;
                
                tempVec.normalize().multiplyScalar(accelMag);
                acceleration.add(tempVec);
            }
            
            return acceleration;
        },
        
        /**
         * Calculate the Hill sphere radius
         * Within this radius, a body's gravity dominates over a more massive body
         * r_H ≈ a * (m / 3M)^(1/3)
         */
        calculateHillSphere: function(smallMass, largeMass, separation) {
            return separation * Math.pow(smallMass / (3 * largeMass), 1/3);
        },
        
        /**
         * Calculate Roche limit
         * Minimum distance before tidal forces tear apart a body
         * d = R * (2 * ρM / ρm)^(1/3)
         */
        calculateRocheLimit: function(primaryRadius, primaryDensity, secondaryDensity) {
            return primaryRadius * Math.pow(2 * primaryDensity / secondaryDensity, 1/3);
        },
        
        /**
         * Get orbital elements from position and velocity
         * For debugging and display purposes
         */
        calculateOrbitalElements: function(position, velocity, centralMass, G) {
            const r = position.length();
            const v = velocity.length();
            
            // Specific orbital energy
            const specificEnergy = 0.5 * v * v - G * centralMass / r;
            
            // Semi-major axis
            const a = -G * centralMass / (2 * specificEnergy);
            
            // Angular momentum vector
            const h = new THREE.Vector3().crossVectors(position, velocity);
            const hMag = h.length();
            
            // Eccentricity
            const mu = G * centralMass;
            const eVec = velocity.clone().cross(h).divideScalar(mu)
                .sub(position.clone().normalize());
            const e = eVec.length();
            
            // Inclination
            const i = Math.acos(h.z / hMag);
            
            // Orbital period
            const T = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu);
            
            return {
                semiMajorAxis: a,
                eccentricity: e,
                inclination: MathUtils.radToDeg(i),
                period: T,
                specificEnergy: specificEnergy,
                angularMomentum: hMag
            };
        }
    };
})();

Logger.info('GravitySolver', 'Gravity solver module loaded');
