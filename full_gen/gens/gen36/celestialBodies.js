/**
 * Celestial Bodies System
 * Creates and manages the Sun, Planets, and Moons
 */

class CelestialBody {
    constructor(config, scene, physicsEngine) {
        this.config = config;
        this.scene = scene;
        this.physicsEngine = physicsEngine;
        
        // Physics properties
        this.id = `celestial_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name;
        this.mass = config.mass;
        this.radius = config.radius;
        this.isCelestial = true;
        this.fixed = false;
        
        // Position and velocity
        this.position = new THREE.Vector3(
            config.position.x,
            config.position.y,
            config.position.z
        );
        
        this.velocity = new THREE.Vector3(
            config.velocity.x,
            config.velocity.y,
            config.velocity.z
        );
        
        // Rotation
        this.rotationPeriod = config.rotationPeriod;
        this.rotationAngle = 0;
        
        // Visual properties
        this.visualRadius = config.radius * config.visualScale / 1e6; // Scale down for rendering
        
        // Create 3D mesh
        this.createMesh();
        
        // Register with physics
        this.physicsEngine.addBody(this);
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.visualRadius, 64, 64);
        
        let material;
        
        if (this.config.name === 'Sun') {
            // Sun is emissive
            material = new THREE.MeshStandardMaterial({
                color: this.config.color,
                emissive: this.config.color,
                emissiveIntensity: this.config.emissiveIntensity,
                toneMapped: false,
            });
        } else {
            // Planets and moons
            material = new THREE.MeshStandardMaterial({
                color: this.config.color,
                roughness: 0.8,
                metalness: 0.2,
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.celestialBody = this;
        
        this.scene.add(this.mesh);
        
        // Add atmosphere if configured
        if (this.config.hasAtmosphere) {
            this.createAtmosphere();
        }
    }

    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(
            this.visualRadius * 1.05,
            32,
            32
        );
        
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: this.config.atmosphereColor,
            transparent: true,
            opacity: this.config.atmosphereOpacity,
            side: THREE.BackSide,
        });
        
        this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.mesh.add(this.atmosphereMesh);
    }

    update(dt) {
        // Update mesh position from physics position
        // Scale down for rendering
        this.mesh.position.set(
            this.position.x / 1e6,
            this.position.y / 1e6,
            this.position.z / 1e6
        );
        
        // Update rotation
        const rotationSpeed = (2 * Math.PI) / this.rotationPeriod;
        this.rotationAngle += rotationSpeed * dt * CONFIG.PHYSICS.TIME_SCALE;
        this.mesh.rotation.y = this.rotationAngle;
    }

    getSurfacePosition(latitude, longitude, altitude = 0) {
        // Convert lat/lon to Cartesian coordinates on sphere surface
        const latRad = latitude * Math.PI / 180;
        const lonRad = longitude * Math.PI / 180;
        
        const r = this.radius + altitude;
        
        const x = this.position.x + r * Math.cos(latRad) * Math.cos(lonRad);
        const y = this.position.y + r * Math.sin(latRad);
        const z = this.position.z + r * Math.cos(latRad) * Math.sin(lonRad);
        
        return new THREE.Vector3(x, y, z);
    }

    destroy() {
        this.physicsEngine.removeBody(this);
        this.scene.remove(this.mesh);
        if (this.mesh.geometry) this.mesh.geometry.dispose();
        if (this.mesh.material) this.mesh.material.dispose();
        if (this.atmosphereMesh) {
            if (this.atmosphereMesh.geometry) this.atmosphereMesh.geometry.dispose();
            if (this.atmosphereMesh.material) this.atmosphereMesh.material.dispose();
        }
    }
}

/**
 * Manages all celestial bodies in the system
 */
class CelestialSystem {
    constructor(scene, physicsEngine) {
        this.scene = scene;
        this.physicsEngine = physicsEngine;
        this.bodies = [];
        
        console.log('Creating celestial system...');
        this.createBodies();
    }

    createBodies() {
        // Create Sun
        this.sun = new CelestialBody(CONFIG.SUN, this.scene, this.physicsEngine);
        this.bodies.push(this.sun);
        
        // Create Planet 1
        this.planet1 = new CelestialBody(CONFIG.PLANET1, this.scene, this.physicsEngine);
        this.bodies.push(this.planet1);
        
        // Create Planet 2
        this.planet2 = new CelestialBody(CONFIG.PLANET2, this.scene, this.physicsEngine);
        this.bodies.push(this.planet2);
        
        // Create Moon 1
        this.moon1 = new CelestialBody(CONFIG.MOON1, this.scene, this.physicsEngine);
        this.bodies.push(this.moon1);
        
        console.log(`Created ${this.bodies.length} celestial bodies`);
    }

    update(dt) {
        for (const body of this.bodies) {
            body.update(dt);
        }
    }

    getCelestialBodyByName(name) {
        return this.bodies.find(body => body.name === name);
    }

    destroy() {
        for (const body of this.bodies) {
            body.destroy();
        }
        this.bodies = [];
    }
}

/**
 * Create starfield background
 */
class Starfield {
    constructor(scene) {
        this.scene = scene;
        this.createStars();
    }

    createStars() {
        const starCount = CONFIG.SKYBOX.starCount;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        const starColors = CONFIG.SKYBOX.starColors;
        const color = new THREE.Color();
        
        for (let i = 0; i < starCount; i++) {
            // Random position on a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 5e8; // Very far away
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random star color
            const colorChoice = starColors[Math.floor(Math.random() * starColors.length)];
            color.setHex(colorChoice);
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Random size with bias towards smaller stars
            sizes[i] = Math.random() * Math.random() * CONFIG.SKYBOX.starSize;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: CONFIG.SKYBOX.starSize,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: false,
        });
        
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
        
        console.log(`Created ${starCount} stars`);
    }

    update(camera) {
        // Stars follow camera to appear infinitely far
        if (this.stars && camera) {
            this.stars.position.copy(camera.position);
        }
    }

    destroy() {
        if (this.stars) {
            this.scene.remove(this.stars);
            if (this.stars.geometry) this.stars.geometry.dispose();
            if (this.stars.material) this.stars.material.dispose();
        }
    }
}
