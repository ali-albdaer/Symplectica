/**
 * Renderer
 * Three.js rendering system with lights, shadows, and performance optimization
 */

window.Renderer = {
    // Three.js core
    scene: null,
    camera: null,
    renderer: null,
    canvas: null,

    // Lighting
    sunLight: null,
    sunShadowCamera: null,

    // Materials
    materials: {
        bodies: {},
        terrain: null,
    },

    // Meshes
    meshes: {
        bodies: {},
        particles: {},
    },

    // Sky
    starfield: null,

    // Performance
    metrics: {
        frameTime: 0,
        fps: 0,
        fpsHistory: [],
        lastFrameTime: performance.now(),
    },

    init() {
        DebugSystem.setLoadingStatus('Initializing renderer');

        try {
            this.canvas = document.getElementById('canvas');
            
            // Setup Three.js scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000000);
            this.scene.fog = new THREE.FogExp2(0x000000, 0);

            // Setup camera
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera = new THREE.PerspectiveCamera(
                Config.camera.fov,
                width / height,
                Config.camera.near,
                Config.camera.far
            );

            // Setup renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                powerPreference: 'high-performance',
                logarithmicDepthBuffer: true,
            });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
            
            // Set shadow map size based on fidelity
            const shadowSize = Config.rendering.shadowMapSize[Config.rendering.fidelity];
            this.renderer.shadowMap.mapSize = new THREE.Vector2(shadowSize, shadowSize);

            // Setup lighting
            this.setupLighting();

            // Setup sky
            this.setupSky();

            // Handle window resize
            window.addEventListener('resize', () => this.onWindowResize());

            DebugSystem.info('Renderer initialized successfully', {
                resolution: `${width}x${height}`,
                pixelRatio: window.devicePixelRatio,
                fidelity: Config.rendering.fidelity,
                shadowMapSize: shadowSize,
            });

        } catch (error) {
            DebugSystem.error('Renderer initialization failed', error);
            throw error;
        }
    },

    /**
     * Setup lighting with sun as primary light source
     */
    setupLighting() {
        // Remove any default lighting
        this.scene.children = this.scene.children.filter(
            child => !(child instanceof THREE.Light)
        );

        // Sun light (directional) - this will be positioned based on sun body
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.camera.far = Config.camera.far;
        this.sunLight.shadow.bias = Config.rendering.sunShadowBias;
        
        // Configure shadow map for current fidelity
        const shadowSize = Config.rendering.shadowMapSize[Config.rendering.fidelity];
        this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);
        
        // Shadow camera needs to encompass the solar system
        const shadowDistance = 5e11; // Large enough for solar system
        this.sunLight.shadow.camera.left = -shadowDistance;
        this.sunLight.shadow.camera.right = shadowDistance;
        this.sunLight.shadow.camera.top = shadowDistance;
        this.sunLight.shadow.camera.bottom = -shadowDistance;
        this.sunLight.shadow.camera.near = 1;
        this.sunLight.shadow.camera.far = shadowDistance * 2;

        this.scene.add(this.sunLight);

        // No ambient light - all illumination from sun
        // Celestial bodies will emit their own light if needed
    },

    /**
     * Setup starfield background
     */
    setupSky() {
        DebugSystem.setLoadingStatus('Rendering starfield');

        // Create starfield using Points
        const starCount = Config.rendering.starCount;
        const starsGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);

        // Generate random star positions on a distant sphere
        const distanceFromSun = Config.camera.far * 0.9;
        
        for (let i = 0; i < starCount; i++) {
            // Random point on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const r = distanceFromSun;

            starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPositions[i * 3 + 2] = r * Math.cos(phi);
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

        // Create star material
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 500000,  // Large scale to be visible
            sizeAttenuation: true,
        });

        this.starfield = new THREE.Points(starsGeometry, starMaterial);
        this.scene.add(this.starfield);

        DebugSystem.info('Starfield created', { stars: starCount });
    },

    /**
     * Create mesh for a physics body
     */
    createBodyMesh(body) {
        // Scaled radius for visualization
        const displayRadius = Config.getScaledSize(body.radius);
        
        // Create mesh based on body type
        let geometry;
        let material;

        if (body.isLightSource) {
            // Sun - use emissive material
            geometry = new THREE.SphereGeometry(displayRadius, 64, 64);
            material = new THREE.MeshBasicMaterial({
                color: Utils.color.toThreeColor(body.color),
                emissive: Utils.color.toThreeColor(body.color),
            });
        } else {
            // Regular body
            geometry = new THREE.SphereGeometry(displayRadius, 32, 32);
            const baseColor = Utils.color.toThreeColor(body.color);
            
            material = new THREE.MeshPhongMaterial({
                color: baseColor,
                emissive: body.emissive ? baseColor : 0x000000,
                shininess: 100,
                flatShading: false,
            });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.physicsBody = body;

        // Add atmosphere glow if needed
        if (body.hasAtmosphere && !body.isLightSource) {
            this.addAtmosphere(mesh, body);
        }

        this.scene.add(mesh);
        this.meshes.bodies[body.id] = mesh;

        DebugSystem.info(`Mesh created for ${body.name}`, {
            radius: displayRadius,
            hasAtmosphere: body.hasAtmosphere,
        });

        return mesh;
    },

    /**
     * Add atmospheric glow to a body
     */
    addAtmosphere(mesh, body) {
        const displayRadius = Config.getScaledSize(body.radius);
        const atmosphereRadius = displayRadius * 1.05;

        const atmosphereGeometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);
        const atmosphereColor = Utils.color.toThreeColor(body.atmosphereColor || body.color);
        
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: atmosphereColor,
            emissive: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide,
        });

        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        atmosphere.position.copy(mesh.position);
        atmosphere.castShadow = false;
        atmosphere.receiveShadow = false;

        mesh.userData.atmosphere = atmosphere;
        this.scene.add(atmosphere);
    },

    /**
     * Create mesh for interactive object
     */
    createObjectMesh(body) {
        const displayRadius = Config.getScaledSize(body.radius);
        const geometry = new THREE.SphereGeometry(displayRadius, 16, 16);
        
        const baseColor = Utils.color.toThreeColor(body.color);
        const material = new THREE.MeshPhongMaterial({
            color: baseColor,
            emissive: body.emissive ? baseColor : 0x000000,
            shininess: 50,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.physicsBody = body;

        this.scene.add(mesh);
        this.meshes.bodies[body.id] = mesh;

        return mesh;
    },

    /**
     * Update all body positions and rotations
     */
    updateBodies() {
        const player = PhysicsEngine.getBody('Player');
        const playerPos = player ? player.position : new THREE.Vector3(0, 0, 0);

        for (let body of PhysicsEngine.bodies) {
            const mesh = this.meshes.bodies[body.id];
            if (!mesh) continue;

            // Position relative to player (Floating Origin)
            // We subtract player position so player is always near (0,0,0) in rendering space
            const relativePos = Utils.vec3.subtract(body.position, playerPos);

            const displayPos = new THREE.Vector3(
                Config.getScaledDistance(relativePos.x),
                Config.getScaledDistance(relativePos.y),
                Config.getScaledDistance(relativePos.z)
            );
            mesh.position.copy(displayPos);

            // Rotation
            mesh.quaternion.copy(body.rotation);

            // Update atmosphere if present
            if (mesh.userData.atmosphere) {
                mesh.userData.atmosphere.position.copy(mesh.position);
            }
        }
    },

    /**
     * Update sun light position and color
     */
    updateSunLight() {
        const sun = PhysicsEngine.getBody('Sun');
        const player = PhysicsEngine.getBody('Player');
        if (!sun) return;

        const playerPos = player ? player.position : new THREE.Vector3(0, 0, 0);
        const relativePos = Utils.vec3.subtract(sun.position, playerPos);

        // Position light far from sun in direction away from planets
        const sunPos = new THREE.Vector3(
            Config.getScaledDistance(relativePos.x),
            Config.getScaledDistance(relativePos.y),
            Config.getScaledDistance(relativePos.z)
        );

        // Place light source at sun position
        this.sunLight.position.copy(sunPos);

        // Update light color based on sun temperature
        const colorTemp = Math.max(3000, Math.min(10000, sun.temperature || 5778));
        const normalized = (colorTemp - 3000) / 7000;
        this.sunLight.color.setHSL(0.1, 1.0, 0.5 + normalized * 0.2);
    },

    /**
     * Render scene
     */
    render() {
        const frameStart = performance.now();

        // Update bodies before rendering
        this.updateBodies();
        this.updateSunLight();

        // Render
        this.renderer.render(this.scene, this.camera);

        // Calculate frame metrics
        const frameTime = performance.now() - frameStart;
        this.metrics.frameTime = frameTime;
        this.metrics.fps = 1000 / frameTime;
        this.metrics.fpsHistory.push(this.metrics.fps);
        
        if (this.metrics.fpsHistory.length > 300) {
            this.metrics.fpsHistory.shift();
        }

        return frameTime;
    },

    /**
     * Get average FPS over last frames
     */
    getAverageFps() {
        if (this.metrics.fpsHistory.length === 0) return 0;
        return Utils.array.average(this.metrics.fpsHistory);
    },

    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        DebugSystem.info('Window resized', { resolution: `${width}x${height}` });
    },

    /**
     * Get world coordinates from screen position
     */
    getWorldRayFromScreen(screenX, screenY) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (screenX / window.innerWidth) * 2 - 1,
            -(screenY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, this.camera);
        return raycaster.ray;
    },

    /**
     * Debug: Get scene statistics
     */
    getStats() {
        return {
            fps: this.metrics.fps.toFixed(1),
            avgFps: this.getAverageFps().toFixed(1),
            frameTime: this.metrics.frameTime.toFixed(2),
            bodies: Object.keys(this.meshes.bodies).length,
            objects: this.scene.children.length,
        };
    },
};

DebugSystem.info('Renderer module loaded');
