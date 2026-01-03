/**
 * Renderer.js - Three.js Rendering Engine
 * Handles scene setup, lighting, shadows, and rendering
 */

class ThreeRenderer {
    constructor(config) {
        this.config = config;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.meshes = new Map(); // name -> THREE.Mesh
        this.lights = new Map();
        this.shadowCasters = [];
        
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        
        this.init();
        Logger.info('Three.js Renderer initialized');
    }

    /**
     * Initialize the renderer
     */
    init() {
        try {
            const container = document.getElementById('canvas-container');
            
            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(this.config.RENDER.BACKGROUND_COLOR);
            this.scene.fog = new THREE.FogExp2(0x000000, 0.00001);
            
            // Camera setup
            this.camera = new THREE.PerspectiveCamera(
                this.config.RENDER.FOV,
                window.innerWidth / window.innerHeight,
                this.config.RENDER.NEAR_PLANE,
                this.config.RENDER.FAR_PLANE
            );
            
            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                precision: 'highp',
                stencil: false,
                alpha: false,
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
            this.renderer.shadowMap.autoUpdate = true;
            
            container.appendChild(this.renderer.domElement);
            
            // Create sun light
            this.createLighting();
            
            // Add helpers if in debug mode
            if (this.config.DEBUG.ENABLE_AXES_HELPER) {
                this.scene.add(new THREE.AxesHelper(100));
            }
            
            // Handle resize
            window.addEventListener('resize', () => this.onWindowResize());
            
            Logger.info('Scene initialized successfully');
        } catch (error) {
            Logger.error(`Renderer initialization failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create lighting (Sun as primary light)
     */
    createLighting() {
        // Remove any existing lights
        this.scene.children = this.scene.children.filter(child => !(child instanceof THREE.Light));
        
        // Sun as point light
        const sunLight = new THREE.PointLight(0xFFFFCC, 2, 500000);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = this.config.RENDER.SHADOW_MAP_SIZE;
        sunLight.shadow.mapSize.height = this.config.RENDER.SHADOW_MAP_SIZE;
        sunLight.shadow.camera.far = 500000;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.bias = -0.0001;
        sunLight.shadow.normalBias = 0.02;
        
        this.scene.add(sunLight);
        this.lights.set('sun', sunLight);
        
        // Very subtle ambient (nearly black)
        const ambientLight = new THREE.AmbientLight(0x111111, 0.3);
        this.scene.add(ambientLight);
        this.lights.set('ambient', ambientLight);
    }

    /**
     * Create a mesh for a celestial body
     */
    createCelestialMesh(name, radius, color, emissive, emissiveIntensity, segments) {
        try {
            // Scale up small celestial bodies for visibility
            const visualRadius = Math.max(radius, 1); // Minimum 1 unit for visibility
            const geometry = new THREE.IcosahedronGeometry(visualRadius, segments);
            
            const material = new THREE.MeshStandardMaterial({
                color,
                emissive,
                emissiveIntensity,
                metalness: 0.3,
                roughness: 0.8,
                flatShading: false,
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.name = name;
            mesh.userData.physicsRadius = radius; // Store actual physics radius
            
            this.scene.add(mesh);
            this.meshes.set(name, mesh);
            this.shadowCasters.push(mesh);
            
            console.log(`Celestial mesh created: ${name} (visual radius: ${visualRadius}, physics radius: ${radius})`);
            return mesh;
        } catch (error) {
            Logger.error(`Failed to create mesh for ${name}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a mesh for an interactive object
     */
    createObjectMesh(name, type, dimensions, color) {
        try {
            let geometry;
            
            if (type === 'sphere') {
                geometry = new THREE.IcosahedronGeometry(dimensions.radius || dimensions, 16);
            } else if (type === 'box') {
                geometry = new THREE.BoxGeometry(
                    dimensions.x || 1,
                    dimensions.y || 1,
                    dimensions.z || 1
                );
            } else {
                throw new Error(`Unknown object type: ${type}`);
            }
            
            const material = new THREE.MeshStandardMaterial({
                color,
                metalness: 0.5,
                roughness: 0.5,
                flatShading: false,
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.name = name;
            
            this.scene.add(mesh);
            this.meshes.set(name, mesh);
            this.shadowCasters.push(mesh);
            
            return mesh;
        } catch (error) {
            Logger.error(`Failed to create object mesh for ${name}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update mesh position and rotation
     */
    updateMeshTransform(name, position, rotation) {
        const mesh = this.meshes.get(name);
        if (mesh) {
            mesh.position.set(position.x, position.y, position.z);
            if (rotation) {
                mesh.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
            }
        }
    }

    /**
     * Update sun light position to follow sun mesh
     */
    updateSunLight(sunPosition) {
        if (!sunPosition) {
            console.warn('updateSunLight called with undefined position');
            return;
        }
        
        const sunLight = this.lights.get('sun');
        if (sunLight) {
            sunLight.position.copy(sunPosition);
            sunLight.target.position.copy(sunPosition);
        }
    }

    /**
     * Set camera position and look-at
     */
    setCameraTransform(position, lookAt) {
        this.camera.position.set(position.x, position.y, position.z);
        this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }

    /**
     * Render a frame
     */
    render() {
        this.renderer.render(this.scene, this.camera);
        this.updateFrameStats();
    }

    /**
     * Update FPS and frame time
     */
    updateFrameStats() {
        this.frameCount++;
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        
        if (deltaTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = now;
        }
    }

    /**
     * Get current FPS
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    /**
     * Get mesh by name
     */
    getMesh(name) {
        return this.meshes.get(name);
    }

    /**
     * Check if a mesh exists
     */
    hasMesh(name) {
        return this.meshes.has(name);
    }

    /**
     * Update shadow map settings
     */
    updateShadowMap() {
        const sunLight = this.lights.get('sun');
        if (sunLight) {
            sunLight.shadow.mapSize.width = this.config.RENDER.SHADOW_MAP_SIZE;
            sunLight.shadow.mapSize.height = this.config.RENDER.SHADOW_MAP_SIZE;
            sunLight.shadow.map = null; // Force regeneration
        }
    }

    /**
     * Get scene graph statistics
     */
    getSceneStats() {
        return {
            meshCount: this.meshes.size,
            lightCount: this.lights.size,
            geometries: this.renderer.info.memory.geometries,
            textures: this.renderer.info.memory.textures,
        };
    }

    /**
     * Raycasting for object selection
     */
    raycast(camera, normalizedMouseCoords) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(normalizedMouseCoords, camera);
        
        const intersects = raycaster.intersectObjects(Array.from(this.meshes.values()));
        
        if (intersects.length > 0) {
            return {
                hit: true,
                mesh: intersects[0].object,
                point: intersects[0].point,
                distance: intersects[0].distance,
                name: intersects[0].object.userData.name,
            };
        }
        
        return { hit: false };
    }

    /**
     * Toggle wireframe mode (debug)
     */
    toggleWireframe(enabled) {
        for (const mesh of this.meshes.values()) {
            mesh.material.wireframe = enabled;
        }
    }

    /**
     * Get camera
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get scene
     */
    getScene() {
        return this.scene;
    }

    /**
     * Get WebGL renderer
     */
    getWebGLRenderer() {
        return this.renderer;
    }
}
