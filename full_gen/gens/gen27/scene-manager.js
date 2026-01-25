/**
 * Scene Manager
 * Setup and manages all game entities and the main scene
 */

window.SceneManager = {
    // Scene entities
    bodies: {},
    interactiveObjects: [],
    player: null,

    init() {
        DebugSystem.setLoadingStatus('Setting up scene');

        try {
            // Create celestial bodies
            this.createCelestialBodies();

            // Create player
            this.createPlayer();

            // Create interactive objects
            this.createInteractiveObjects();

            // Validate stability
            this.validateOrbitalStability();

            DebugSystem.info('Scene setup complete', {
                bodies: PhysicsEngine.bodies.length,
                interactiveObjects: this.interactiveObjects.length,
            });

        } catch (error) {
            DebugSystem.error('Scene setup failed', error);
            throw error;
        }
    },

    /**
     * Create celestial bodies from config
     */
    createCelestialBodies() {
        DebugSystem.setLoadingStatus('Creating celestial bodies');

        const bodiesConfig = Config.bodies;

        // Create Sun
        const sunBody = PhysicsEngine.createBody(bodiesConfig.sun);
        this.bodies.sun = sunBody;
        Renderer.createBodyMesh(sunBody);

        // Create Planet 1
        const planet1Body = PhysicsEngine.createBody(bodiesConfig.planet1);
        this.bodies.planet1 = planet1Body;
        Renderer.createBodyMesh(planet1Body);

        // Create Moon 1
        const moon1Body = PhysicsEngine.createBody(bodiesConfig.moon1);
        this.bodies.moon1 = moon1Body;
        Renderer.createBodyMesh(moon1Body);

        // Create Planet 2
        const planet2Body = PhysicsEngine.createBody(bodiesConfig.planet2);
        this.bodies.planet2 = planet2Body;
        Renderer.createBodyMesh(planet2Body);

        DebugSystem.info('Celestial bodies created');
    },

    /**
     * Create player character
     */
    createPlayer() {
        DebugSystem.setLoadingStatus('Creating player');

        const playerBody = PhysicsEngine.createBody({
            name: 'Player',
            mass: Config.player.mass,
            radius: Config.player.height / 2,
            position: Config.player.spawnPosition,
            velocity: [0, 0, 0],
            useGravity: true,
            affectsGravity: false,  // Player doesn't affect others
            damping: Config.player.damping,
        });

        PlayerController.init(playerBody);
        this.player = playerBody;

        // Create player mesh (first-person, not visible)
        // Using CylinderGeometry since CapsuleGeometry isn't in Three.js r128
        const playerRadius = Config.player.height * 0.25;
        const playerHeight = Config.player.height;
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(playerRadius, playerRadius, playerHeight, 8),
            new THREE.MeshPhongMaterial({ color: 0x4488ff })
        );
        mesh.userData.physicsBody = playerBody;
        Renderer.meshes.bodies[playerBody.id] = mesh;
        Renderer.scene.add(mesh);

        DebugSystem.info('Player created', {
            spawn: Utils.string.formatPosition(playerBody.position),
        });
    },

    /**
     * Create interactive objects near player spawn
     */
    createInteractiveObjects() {
        DebugSystem.setLoadingStatus('Creating interactive objects');

        if (!Config.interactiveObjects.enabled) {
            DebugSystem.info('Interactive objects disabled');
            return;
        }

        const spawnCenter = Utils.vec3.create(...Config.player.spawnPosition);
        const spawnRadius = Config.interactiveObjects.spawnRadius;

        let objectCount = 0;

        for (let typeConfig of Config.interactiveObjects.types) {
            for (let i = 0; i < typeConfig.count; i++) {
                // Random spawn position around player
                const spawnPos = spawnCenter.clone();
                const randomOffset = Utils.random.vector(0, spawnRadius);
                spawnPos.add(randomOffset);

                const object = PhysicsEngine.createBody({
                    name: `${typeConfig.name} ${i + 1}`,
                    mass: typeConfig.mass,
                    radius: typeConfig.radius,
                    position: [spawnPos.x, spawnPos.y, spawnPos.z],
                    velocity: [0, 0, 0],
                    color: typeConfig.color,
                    emissive: typeConfig.emissive,
                    luminosity: typeConfig.luminosity || 0,
                    useGravity: true,
                    affectsGravity: false,
                });

                Renderer.createObjectMesh(object);
                this.interactiveObjects.push(object);
                objectCount++;
            }
        }

        DebugSystem.info('Interactive objects created', { count: objectCount });
    },

    /**
     * Validate that the default system is stable
     */
    validateOrbitalStability() {
        DebugSystem.setLoadingStatus('Validating orbital mechanics');

        const sun = this.bodies.sun;
        const planet1 = this.bodies.planet1;
        const planet2 = this.bodies.planet2;
        const moon1 = this.bodies.moon1;

        // Check distances are reasonable
        const earthSunDist = Utils.vec3.distance(planet1.position, sun.position);
        const jupiterSunDist = Utils.vec3.distance(planet2.position, sun.position);
        const moonEarthDist = Utils.vec3.distance(moon1.position, planet1.position);

        DebugSystem.info('Orbital distances:', {
            earthSun: earthSunDist.toExponential(2),
            jupiterSun: jupiterSunDist.toExponential(2),
            moonEarth: moonEarthDist.toExponential(2),
        });

        // Check orbital velocities
        const earth_speed = Utils.vec3.length(planet1.velocity);
        const jupiter_speed = Utils.vec3.length(planet2.velocity);
        const moon_speed = Utils.vec3.length(moon1.velocity);

        DebugSystem.info('Orbital velocities:', {
            earth: earth_speed.toFixed(2),
            jupiter: jupiter_speed.toFixed(2),
            moon: moon_speed.toFixed(2),
        });

        // Verify energies are stable
        this.checkOrbitalEnergy(sun, planet1, 'Earth');
        this.checkOrbitalEnergy(sun, planet2, 'Jupiter');
        this.checkOrbitalEnergy(planet1, moon1, 'Moon');

        DebugSystem.setLoadingStatus('Orbital stability verified');
    },

    /**
     * Check orbital energy for stability
     */
    checkOrbitalEnergy(primary, secondary, name) {
        const G = Config.physics.G;
        const m1 = primary.mass;
        const m2 = secondary.mass;
        
        const r = Utils.vec3.distance(primary.position, secondary.position);
        const v = Utils.vec3.length(secondary.velocity);

        // Kinetic energy
        const KE = 0.5 * m2 * v * v;

        // Potential energy
        const PE = -(G * m1 * m2) / r;

        // Total mechanical energy
        const E_total = KE + PE;

        // Semi-major axis from energy
        const a = -(G * m1 * m2) / (2 * E_total);

        // Escape velocity check
        const v_escape = Math.sqrt((2 * G * m1) / r);
        const v_orbital = Math.sqrt((G * m1) / r);

        const isStable = v < v_escape && v < v_orbital * 1.5;

        DebugSystem.info(`${name} stability:`, {
            energy: E_total.toExponential(2),
            semiMajorAxis: a.toExponential(2),
            orbitalVelocity: v_orbital.toFixed(2),
            actualVelocity: v.toFixed(2),
            stable: isStable ? 'YES' : 'WARNING',
        });
    },

    /**
     * Update scene (call each frame)
     */
    update(deltaTime) {
        // Physics is updated elsewhere
        // This is for scene-specific updates
    },

    /**
     * Get all bodies for iteration
     */
    getAllBodies() {
        return PhysicsEngine.bodies;
    },

    /**
     * Get summary for debugging
     */
    getSummary() {
        return {
            celestialBodies: Object.keys(this.bodies).length,
            interactiveObjects: this.interactiveObjects.length,
            totalEntities: PhysicsEngine.bodies.length,
            playerPosition: Utils.string.formatPosition(this.player.position),
        };
    },
};

DebugSystem.info('Scene manager loaded');
