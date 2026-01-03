/**
 * ============================================
 * Entity Manager
 * ============================================
 * 
 * Manages all entities in the simulation.
 * Handles creation, updates, and cleanup.
 */

class EntityManager {
    constructor() {
        // Entity collections
        this.celestialBodies = new Map();
        this.interactiveObjects = [];
        this.player = null;
        
        // References to other systems
        this.scene = null;
        this.physics = null;
        
        // Raycaster for interaction
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 10; // Max interaction distance
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the entity manager
     */
    init(scene, physics) {
        console.info('Initializing Entity Manager...');
        
        try {
            this.scene = scene;
            this.physics = physics;
            
            this.isInitialized = true;
            console.success('Entity Manager initialized');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize Entity Manager: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Create all celestial bodies from config
     */
    createCelestialBodies(fidelitySettings) {
        console.info('Creating celestial bodies...');
        
        const bodiesConfig = CONFIG.CELESTIAL_BODIES;
        
        // First pass: Create all bodies
        for (const [id, config] of Object.entries(bodiesConfig)) {
            let body;
            
            switch (config.type) {
                case 'star':
                    body = new Sun({ ...config, id });
                    break;
                    
                case 'planet':
                    body = new Planet({ ...config, id });
                    break;
                    
                case 'moon':
                    body = new Moon({ ...config, id });
                    break;
                    
                default:
                    body = new CelestialBody({ ...config, id });
            }
            
            body.init(fidelitySettings);
            body.addToScene(this.scene);
            
            this.celestialBodies.set(id, body);
            this.physics.registerCelestialBody(body);
        }
        
        // Second pass: Set up moon orbits (need parent references)
        for (const [id, body] of this.celestialBodies) {
            if (body.bodyType === 'moon' && body.parentBodyId) {
                const parent = this.celestialBodies.get(body.parentBodyId);
                if (parent) {
                    body.initializeOrbit(parent);
                    body.syncFromPhysics();
                }
            }
        }
        
        console.success(`Created ${this.celestialBodies.size} celestial bodies`);
    }
    
    /**
     * Create interactive objects near the player
     */
    createInteractiveObjects(fidelitySettings, spawnPosition) {
        console.info('Creating interactive objects...');
        
        const types = CONFIG.OBJECTS.TYPES;
        const count = CONFIG.OBJECTS.SPAWN_COUNT;
        
        for (let i = 0; i < count; i++) {
            // Pick a random type
            const typeConfig = types[i % types.length];
            
            // Create object
            const obj = new InteractiveObject({
                name: `${typeConfig.name}_${i}`,
                ...typeConfig
            });
            
            obj.init(fidelitySettings);
            
            // Position near spawn
            const offset = {
                x: (Math.random() - 0.5) * 10,
                y: Math.random() * 2 + 1,
                z: (Math.random() - 0.5) * 10
            };
            
            obj.physicsData.position = {
                x: spawnPosition.x + offset.x,
                y: spawnPosition.y + offset.y,
                z: spawnPosition.z + offset.z
            };
            
            obj.syncFromPhysics();
            obj.addToScene(this.scene);
            
            this.interactiveObjects.push(obj);
            // Note: Small objects use render-space physics, handled separately
        }
        
        console.success(`Created ${this.interactiveObjects.length} interactive objects`);
    }
    
    /**
     * Create the player
     */
    createPlayer(inputManager, fidelitySettings) {
        console.info('Creating player...');
        
        // Get spawn body
        const spawnBodyId = CONFIG.PLAYER.SPAWN_BODY;
        const spawnBody = this.celestialBodies.get(spawnBodyId);
        
        if (!spawnBody) {
            console.error(`Spawn body ${spawnBodyId} not found!`);
            return null;
        }
        
        this.player = new Player();
        this.player.init(inputManager, spawnBody, fidelitySettings);
        this.player.addToScene(this.scene);
        
        // Create interactive objects near player
        this.createInteractiveObjects(fidelitySettings, this.player.group.position);
        
        console.success('Player created');
        return this.player;
    }
    
    /**
     * Update all entities
     */
    update(deltaTime, inputManager) {
        // Update celestial bodies
        for (const body of this.celestialBodies.values()) {
            body.update(deltaTime);
        }
        
        // Update interactive objects
        for (const obj of this.interactiveObjects) {
            obj.update(deltaTime);
        }
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.physics, inputManager);
        }
        
        // Handle object interaction raycast
        if (inputManager && inputManager.isPointerLocked && this.player) {
            this.checkObjectInteraction(inputManager);
        }
    }
    
    /**
     * Check for interactive object under crosshair
     */
    checkObjectInteraction(inputManager) {
        if (!this.player || this.player.heldObject) return;
        
        // Set up raycaster from player's view
        const origin = this.player.getFirstPersonCameraPosition();
        const direction = this.player.getLookDirection();
        
        this.raycaster.set(origin, direction);
        
        // Get all interactive object meshes
        const meshes = this.interactiveObjects
            .filter(obj => !obj.isHeld)
            .map(obj => obj.mesh)
            .filter(Boolean);
        
        const intersects = this.raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            const entity = hit.object.userData.entity;
            
            // Right click to pick up
            if (inputManager.isMouseButtonJustPressed(2) && entity) {
                this.player.pickupObject(entity);
            }
        }
    }
    
    /**
     * Get celestial body by ID
     */
    getBody(id) {
        return this.celestialBodies.get(id);
    }
    
    /**
     * Get the sun
     */
    getSun() {
        for (const body of this.celestialBodies.values()) {
            if (body.bodyType === 'star') {
                return body;
            }
        }
        return null;
    }
    
    /**
     * Get all celestial bodies
     */
    getAllBodies() {
        return Array.from(this.celestialBodies.values());
    }
    
    /**
     * Get player
     */
    getPlayer() {
        return this.player;
    }
    
    /**
     * Dispose all entities
     */
    dispose() {
        for (const body of this.celestialBodies.values()) {
            body.removeFromScene(this.scene);
            body.dispose();
        }
        this.celestialBodies.clear();
        
        for (const obj of this.interactiveObjects) {
            obj.removeFromScene(this.scene);
            obj.dispose();
        }
        this.interactiveObjects = [];
        
        if (this.player) {
            this.player.removeFromScene(this.scene);
            this.player.dispose();
            this.player = null;
        }
    }
}
