/**
 * InteractiveObjects.js - Interactive Objects Module
 * 
 * Manages grabbable objects that follow physics rules.
 * Objects can be held with right-click and are affected by gravity.
 */

import Config from './Config.js';
import Utils from './Utils.js';
import Debug from './Debug.js';
import player from './Player.js';

class InteractiveObject {
    constructor(THREE, config) {
        this.THREE = THREE;
        this.id = Utils.generateId();
        
        // Physics properties
        this.mass = config.mass || 1;
        this.radius = config.radius || 0.5;
        
        this.position = {
            x: config.position?.x || 0,
            y: config.position?.y || 0,
            z: config.position?.z || 0
        };
        
        this.velocity = {
            x: config.velocity?.x || 0,
            y: config.velocity?.y || 0,
            z: config.velocity?.z || 0
        };
        
        // Visual properties
        this.color = config.color || 0xffffff;
        this.isLuminous = config.isLuminous || false;
        this.luminousIntensity = config.luminousIntensity || 2;
        
        // Interaction state
        this.isHeld = false;
        this.holdOffset = { x: 0, y: 0, z: 0 };
        
        // Three.js mesh
        this.mesh = null;
        this.light = null;
        
        this.createMesh();
    }
    
    /**
     * Create Three.js mesh
     */
    createMesh() {
        // Random geometry for variety
        const geoType = Math.floor(Math.random() * 4);
        let geometry;
        
        switch (geoType) {
            case 0:
                geometry = new this.THREE.SphereGeometry(this.radius, 16, 16);
                break;
            case 1:
                geometry = new this.THREE.BoxGeometry(
                    this.radius * 1.5,
                    this.radius * 1.5,
                    this.radius * 1.5
                );
                break;
            case 2:
                geometry = new this.THREE.OctahedronGeometry(this.radius);
                break;
            case 3:
                geometry = new this.THREE.IcosahedronGeometry(this.radius);
                break;
        }
        
        // Material
        let material;
        if (this.isLuminous) {
            material = new this.THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.color,
                emissiveIntensity: 0.8,
                roughness: 0.3,
                metalness: 0.5
            });
        } else {
            material = new this.THREE.MeshStandardMaterial({
                color: this.color,
                roughness: 0.6,
                metalness: 0.2
            });
        }
        
        this.mesh = new this.THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.interactiveObject = this;
        
        // Add point light for luminous objects
        if (this.isLuminous) {
            this.light = new this.THREE.PointLight(
                this.color,
                this.luminousIntensity,
                50
            );
            this.mesh.add(this.light);
        }
    }
    
    /**
     * Update object state
     */
    update(deltaTime) {
        if (this.isHeld) {
            // Follow player with offset
            this.updateHeldPosition();
        }
        
        // Sync mesh with physics position
        if (this.mesh) {
            this.mesh.position.set(
                this.position.x,
                this.position.y,
                this.position.z
            );
            
            // Slow rotation for visual interest
            this.mesh.rotation.x += deltaTime * 0.5;
            this.mesh.rotation.y += deltaTime * 0.3;
        }
    }
    
    /**
     * Update position when held by player
     */
    updateHeldPosition() {
        const holdDistance = Config.player.grabHoldDistance;
        
        // Calculate position in front of player
        const forward = player.getFlightForward();
        
        this.position.x = player.position.x + forward.x * holdDistance;
        this.position.y = player.position.y + player.height * 0.3 + forward.y * holdDistance;
        this.position.z = player.position.z + forward.z * holdDistance;
        
        // Reset velocity when held
        this.velocity = { x: 0, y: 0, z: 0 };
    }
    
    /**
     * Grab this object
     */
    grab() {
        this.isHeld = true;
        Debug.info(`Grabbed object ${this.id}`);
    }
    
    /**
     * Release this object
     */
    release() {
        if (!this.isHeld) return;
        
        this.isHeld = false;
        
        // Give it some of player's momentum
        const throwForce = 20;
        const forward = player.getFlightForward();
        
        this.velocity.x = forward.x * throwForce;
        this.velocity.y = forward.y * throwForce;
        this.velocity.z = forward.z * throwForce;
        
        Debug.info(`Released object ${this.id}`);
    }
    
    /**
     * Dispose of resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.light) {
            this.light.dispose();
        }
    }
}

/**
 * Interactive Objects Manager
 */
class InteractiveObjectsManager {
    constructor() {
        this.THREE = null;
        this.objects = [];
        this.heldObject = null;
        this.raycaster = null;
    }
    
    /**
     * Initialize manager
     */
    init(THREE, scene, camera) {
        this.THREE = THREE;
        this.scene = scene;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        
        Debug.info('Interactive objects manager initialized');
    }
    
    /**
     * Spawn initial objects near player on planet surface
     */
    spawnObjects() {
        const config = Config.interactiveObjects;
        const spawnCount = config.spawnCount;
        
        // Get planet1 info for spawning on its surface
        const planet = Config.celestialBodies.planet1;
        const planetPos = planet.position;
        const planetRadius = planet.radius;
        const planetVelocity = planet.velocity;
        
        for (let i = 0; i < spawnCount; i++) {
            const isLuminous = i < config.luminousCount;
            
            // Spawn objects on the surface of the planet
            // Use spherical coordinates for even distribution
            const theta = (i / spawnCount) * Math.PI * 2; // Longitude
            const phi = Math.PI / 2 + Utils.randomRange(-0.3, 0.3); // Near equator
            
            const surfaceOffset = planetRadius + Utils.randomRange(1, 3); // Just above surface
            
            // Calculate position on planet surface
            const localX = surfaceOffset * Math.sin(phi) * Math.cos(theta);
            const localY = surfaceOffset * Math.cos(phi);
            const localZ = surfaceOffset * Math.sin(phi) * Math.sin(theta);
            
            const objConfig = {
                position: {
                    x: planetPos.x + localX,
                    y: planetPos.y + localY,
                    z: planetPos.z + localZ
                },
                // Objects on planet surface inherit planet's velocity exactly
                velocity: {
                    x: planetVelocity.x,
                    y: planetVelocity.y,
                    z: planetVelocity.z
                },
                mass: Utils.randomRange(config.minMass, config.maxMass),
                radius: Utils.randomRange(config.minRadius, config.maxRadius),
                color: Utils.randomFromArray(config.colors),
                isLuminous: isLuminous,
                luminousIntensity: config.luminousIntensity
            };
            
            const obj = new InteractiveObject(this.THREE, objConfig);
            this.objects.push(obj);
            this.scene.add(obj.mesh);
        }
        
        Debug.success(`Spawned ${spawnCount} interactive objects`);
    }
    
    /**
     * Update all objects
     */
    update(deltaTime) {
        for (const obj of this.objects) {
            obj.update(deltaTime);
        }
    }
    
    /**
     * Attempt to grab nearest object
     */
    tryGrab() {
        if (this.heldObject) return;
        
        const grabDistance = Config.player.grabDistance;
        let nearest = null;
        let nearestDist = Infinity;
        
        // Cast ray from camera center
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        
        const meshes = this.objects.map(o => o.mesh);
        const intersects = this.raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            if (hit.distance <= grabDistance) {
                const obj = hit.object.userData.interactiveObject;
                if (obj) {
                    this.heldObject = obj;
                    obj.grab();
                }
            }
        }
    }
    
    /**
     * Release held object
     */
    release() {
        if (this.heldObject) {
            this.heldObject.release();
            this.heldObject = null;
        }
    }
    
    /**
     * Get all objects for physics
     */
    getObjects() {
        return this.objects;
    }
    
    /**
     * Dispose all objects
     */
    dispose() {
        for (const obj of this.objects) {
            this.scene.remove(obj.mesh);
            obj.dispose();
        }
        this.objects = [];
    }
}

// Export singleton
const interactiveManager = new InteractiveObjectsManager();
export default interactiveManager;
