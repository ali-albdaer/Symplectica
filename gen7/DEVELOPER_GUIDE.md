/**
 * DEVELOPER GUIDE - How to Extend the Solar System Simulation
 * 
 * This guide explains how to add new features to the simulation
 */

// ============================================================================
// 1. ADDING A NEW PLANET
// ============================================================================

/*
Step 1: Add configuration in config/globals.js

CELESTIAL: {
    // ... existing bodies ...
    
    PLANET3: {
        name: 'New World',
        mass: 5.972e24,              // kg
        radius: 6371000,             // meters
        renderRadius: 8,             // visual size
        color: 0x00FF00,             // hex color
        emissive: 0x000000,
        emissiveIntensity: 0,
        rotationPeriod: 86400,       // seconds
        orbitalPeriod: 47335200,     // seconds (~1.5 years)
        semiMajorAxis: 200000000000, // meters (1.34 AU)
        eccentricity: 0.02,
        inclination: 2.5,            // degrees
        atmosphereHeight: 80000,
        atmosphereColor: 0x00FF88,
        surfaceGravity: 9.5,
        position: { x: 200000000000, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 25000 }, // calculated for circular orbit
    },
}

Step 2: Create the planet in src/main.js in createCelestialBodies()

const planet3Config = {
    ...CONFIG.CELESTIAL.PLANET3,
    position: scalePosition(CONFIG.CELESTIAL.PLANET3.position),
};

const planet3 = new Planet(planet3Config);
planet3.createMesh(this.scene);
planet3.createOrbitLine(this.scene);
this.gravityEngine.addBody(planet3);
this.celestialBodies.planet3 = planet3;

Step 3: Calculate proper orbital velocity using the helper:
const v3 = calculateOrbitalVelocity(sunMass, CONFIG.CELESTIAL.PLANET3.semiMajorAxis);
CONFIG.CELESTIAL.PLANET3.velocity.z = v3;
*/

// ============================================================================
// 2. ADDING A BLACK HOLE
// ============================================================================

/*
Step 1: Create src/celestial/BlackHole.js

import { CelestialBody } from './CelestialBody.js';

export class BlackHole extends CelestialBody {
    constructor(config) {
        super(config);
        
        this.schwarzschildRadius = (2 * 6.674e-11 * this.mass) / (299792458 ** 2);
        this.eventHorizon = this.schwarzschildRadius;
    }
    
    createMesh(scene) {
        // Event horizon sphere
        const geometry = new THREE.SphereGeometry(this.renderRadius, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            emissive: 0x000000,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.mesh);
        
        // Accretion disk
        const diskGeometry = new THREE.RingGeometry(
            this.renderRadius * 2,
            this.renderRadius * 5,
            64
        );
        const diskMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF6600,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6,
        });
        
        const disk = new THREE.Mesh(diskGeometry, diskMaterial);
        disk.rotation.x = Math.PI / 2;
        this.mesh.add(disk);
        
        return this.mesh;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Rotate accretion disk
        if (this.mesh && this.mesh.children[0]) {
            this.mesh.children[0].rotation.z += deltaTime * 0.5;
        }
    }
    
    // Check if object crossed event horizon
    checkEventHorizon(object) {
        const distance = this.position.distanceTo(object.position);
        return distance < this.schwarzschildRadius;
    }
}

Step 2: Add to CONFIG in globals.js

BLACKHOLE1: {
    name: 'Void',
    mass: 1e31,  // ~5 solar masses
    radius: 14850,  // Schwarzschild radius
    renderRadius: 5,
    color: 0x000000,
    // ... other properties
}

Step 3: Implement gravitational lensing (advanced)
- Modify camera shader to bend light near black hole
- Use post-processing effects
*/

// ============================================================================
// 3. ADDING A TELESCOPE SYSTEM
// ============================================================================

/*
Step 1: Create src/objects/Telescope.js

export class Telescope {
    constructor(scene, camera) {
        this.scene = scene;
        this.mainCamera = camera;
        this.isActive = false;
        this.targetBody = null;
        this.zoomLevel = 1;
    }
    
    activate(targetBody) {
        this.isActive = true;
        this.targetBody = targetBody;
        
        // Create telescope camera
        this.telescopeCamera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1e12);
    }
    
    update(deltaTime) {
        if (!this.isActive || !this.targetBody) return;
        
        // Position camera looking at target
        const direction = new THREE.Vector3()
            .subVectors(this.targetBody.mesh.position, this.mainCamera.position)
            .normalize();
        
        this.telescopeCamera.position.copy(this.mainCamera.position);
        this.telescopeCamera.lookAt(this.targetBody.mesh.position);
        this.telescopeCamera.fov = 75 / this.zoomLevel;
        this.telescopeCamera.updateProjectionMatrix();
    }
    
    zoom(delta) {
        this.zoomLevel = Math.max(1, Math.min(50, this.zoomLevel + delta));
        this.telescopeCamera.fov = 75 / this.zoomLevel;
        this.telescopeCamera.updateProjectionMatrix();
    }
}

Step 2: Add controls
- T key to activate telescope
- Number keys to select target
- Mouse wheel to zoom
*/

// ============================================================================
// 4. ADDING PROCEDURAL TERRAIN
// ============================================================================

/*
Step 1: Modify Planet.js to use heightmap

import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

getTerrainHeight(localX, localZ) {
    const noise = new ImprovedNoise();
    
    // Convert to lat/long
    const lat = Math.atan2(localZ, localX);
    const lon = Math.atan2(Math.sqrt(localX * localX + localZ * localZ), 0);
    
    // Generate height using Perlin noise
    const scale = 0.1;
    const height = noise.noise(
        lat * scale,
        lon * scale,
        0
    ) * 100; // max height variation
    
    return this.renderRadius + height;
}

Step 2: Update planet mesh with displacement
- Use THREE.PlaneGeometry with high segments
- Apply displacement in vertex shader
- Or use THREE.TerrainGeometry (custom)
*/

// ============================================================================
// 5. ADDING A SPACECRAFT
// ============================================================================

/*
Step 1: Create src/player/Spacecraft.js

import { PhysicsObject } from '../physics/PhysicsObject.js';

export class Spacecraft extends PhysicsObject {
    constructor(config) {
        super(config);
        
        this.thrust = 10000;  // Newtons
        this.fuel = 1000;     // kg
        this.fuelConsumption = 0.1; // kg/s
    }
    
    applyThrust(direction, deltaTime) {
        if (this.fuel <= 0) return;
        
        const force = direction.clone().multiplyScalar(this.thrust);
        this.applyForce(force);
        
        this.fuel -= this.fuelConsumption * deltaTime;
    }
    
    createMesh(scene) {
        // Simple rocket shape
        const bodyGeom = new THREE.CylinderGeometry(0.5, 0.5, 3, 16);
        const coneGeom = new THREE.ConeGeometry(0.5, 1, 16);
        
        // ... create mesh
    }
}

Step 2: Add controls
- Space = thrust forward
- WASD = rotate
- E = enter/exit spacecraft
*/

// ============================================================================
// 6. USEFUL UTILITY FUNCTIONS
// ============================================================================

// Calculate escape velocity from a body
function getEscapeVelocity(mass, radius) {
    const G = 6.674e-11;
    return Math.sqrt(2 * G * mass / radius);
}

// Calculate orbital period
function getOrbitalPeriod(mass, semiMajorAxis) {
    const G = 6.674e-11;
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * mass));
}

// Check if orbit is stable
function isOrbitStable(velocity, distance, centralMass) {
    const G = 6.674e-11;
    const orbitalVelocity = Math.sqrt(G * centralMass / distance);
    const escapeVelocity = Math.sqrt(2 * G * centralMass / distance);
    
    return velocity >= orbitalVelocity && velocity < escapeVelocity;
}

// Convert Keplerian elements to Cartesian
function keplerianToCartesian(a, e, i, omega, w, M, mu) {
    // a = semi-major axis
    // e = eccentricity
    // i = inclination
    // omega = longitude of ascending node
    // w = argument of periapsis
    // M = mean anomaly
    // mu = gravitational parameter (G * M)
    
    // Solve Kepler's equation for eccentric anomaly E
    let E = M;
    for (let iter = 0; iter < 10; iter++) {
        E = M + e * Math.sin(E);
    }
    
    // True anomaly
    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );
    
    // Distance
    const r = a * (1 - e * Math.cos(E));
    
    // Position in orbital plane
    const x = r * Math.cos(nu);
    const y = r * Math.sin(nu);
    
    // Rotate to 3D space
    // ... apply rotation matrices for i, omega, w
    
    return { position: {x, y, z: 0}, velocity: {x: 0, y: 0, z: 0} };
}

// ============================================================================
// 7. PERFORMANCE OPTIMIZATION TIPS
// ============================================================================

/*
1. Level of Detail (LOD)
   - Use THREE.LOD for distant objects
   - Reduce polygon count for far away bodies

2. Frustum Culling
   - Already enabled in Three.js
   - Manually cull very distant objects

3. Instanced Rendering
   - Use THREE.InstancedMesh for multiple similar objects
   - Great for asteroid fields

4. Octree/Spatial Partitioning
   - Implement for collision detection
   - Only check nearby objects

5. Web Workers
   - Move physics calculations to worker thread
   - Keep rendering smooth

6. GPU Compute
   - Use compute shaders for particle systems
   - Implement on GPU for massive performance boost
*/

// ============================================================================
// 8. DEBUGGING TIPS
// ============================================================================

/*
1. Visual Debug Helpers
   - Show velocity vectors
   - Draw orbit paths
   - Display force vectors

2. Console Logging
   - Use CONFIG.DEBUG.logPhysics
   - Log state at specific intervals
   - Track energy conservation

3. Pause and Step
   - Add frame-by-frame stepping
   - Examine state at any moment

4. Save/Load State
   - Serialize all object states
   - Reload to debug specific scenarios

5. Unit Tests
   - Test physics calculations
   - Verify orbital mechanics
   - Check collision detection
*/

// ============================================================================
// END OF GUIDE
// ============================================================================
