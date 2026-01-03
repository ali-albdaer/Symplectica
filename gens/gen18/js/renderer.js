/**
 * Renderer
 * Handles Three.js rendering with fidelity levels, LOD, and frustum culling
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Three.js setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.setClearColor(0x000000);
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Lighting
        this.sunLight = null;
        this.ambientLight = null;
        
        // Camera reference (set from outside)
        this.camera = null;
        
        // Fidelity
        this.fidelity = Config.render.fidelity;
        this.fidelityLevels = {
            'low': { shadowMapSize: 512, maxShadows: 1, antiAlias: false },
            'medium': { shadowMapSize: 2048, maxShadows: 2, antiAlias: true },
            'ultra': { shadowMapSize: 4096, maxShadows: 4, antiAlias: true }
        };
        
        // Stats
        this.drawCalls = 0;
        this.renderTime = 0;
        
        // Frustum culling
        this.frustum = new THREE.Frustum();
        this.cameraMatrix = new THREE.Matrix4();
        
        this.attachListeners();
        DebugLog.info(`Renderer: Initialized (${this.fidelity} fidelity)`);
    }

    /**
     * Attach window listeners
     */
    attachListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Initialize sun light
     */
    initializeSunLight(sunPosition) {
        // Remove old light if exists
        if (this.sunLight) {
            this.scene.remove(this.sunLight);
        }

        // Create point light
        this.sunLight = new THREE.PointLight(0xFDB813, 2, 0);
        this.sunLight.position.copy(sunPosition);
        this.sunLight.castShadow = true;
        
        // Configure shadow map
        const fidelityConfig = this.fidelityLevels[this.fidelity];
        this.sunLight.shadow.mapSize.width = fidelityConfig.shadowMapSize;
        this.sunLight.shadow.mapSize.height = fidelityConfig.shadowMapSize;
        this.sunLight.shadow.camera.near = 0.1;
        this.sunLight.shadow.camera.far = 1000000;
        this.sunLight.shadow.camera.left = -100000;
        this.sunLight.shadow.camera.right = 100000;
        this.sunLight.shadow.camera.top = 100000;
        this.sunLight.shadow.camera.bottom = -100000;
        
        this.scene.add(this.sunLight);
        
        // Ambient light (no global illumination by default)
        if (this.ambientLight) {
            this.scene.remove(this.ambientLight);
        }
        
        this.ambientLight = new THREE.AmbientLight(0xffffff, Config.render.ambientLight);
        this.scene.add(this.ambientLight);
    }

    /**
     * Add object to scene
     */
    add(object) {
        if (object.mesh) {
            this.scene.add(object.mesh);
        } else if (object instanceof THREE.Object3D) {
            this.scene.add(object);
        }
    }

    /**
     * Remove object from scene
     */
    remove(object) {
        if (object.mesh) {
            this.scene.remove(object.mesh);
        } else if (object instanceof THREE.Object3D) {
            this.scene.remove(object);
        }
    }

    /**
     * Set fidelity level
     */
    setFidelity(level) {
        if (!this.fidelityLevels[level]) return;
        
        this.fidelity = level;
        Config.render.fidelity = level;
        
        // Update renderer settings
        const config = this.fidelityLevels[level];
        this.renderer.setPixelRatio(config.antiAlias ? window.devicePixelRatio : 1);
        
        if (this.sunLight) {
            this.sunLight.shadow.mapSize.width = config.shadowMapSize;
            this.sunLight.shadow.mapSize.height = config.shadowMapSize;
            this.sunLight.shadow.map.dispose();
        }
        
        DebugLog.info(`Renderer: Fidelity set to ${level}`);
    }

    /**
     * Update LOD for all entities
     */
    updateLOD(entities, cameraPosition) {
        if (!Config.render.enableLOD) return;
        
        for (const entity of entities) {
            if (entity instanceof CelestialBody) {
                entity.updateLOD(cameraPosition);
            }
        }
    }

    /**
     * Perform frustum culling
     */
    performFrustumCulling(objects) {
        if (!Config.render.enableFrustumCulling) {
            // Show all objects
            for (const obj of objects) {
                if (obj.mesh) {
                    obj.mesh.visible = true;
                }
            }
            return;
        }

        // Update frustum
        this.cameraMatrix.multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
        );
        this.frustum.setFromProjectionMatrix(this.cameraMatrix);

        // Check each object
        for (const obj of objects) {
            if (!obj.mesh) continue;
            
            obj.mesh.visible = this.frustum.containsPoint(obj.mesh.position);
            
            // Also check bounding sphere
            if (!obj.mesh.visible && obj.mesh.geometry) {
                obj.mesh.geometry.computeBoundingSphere();
                if (obj.mesh.geometry.boundingSphere) {
                    const sphere = obj.mesh.geometry.boundingSphere.clone();
                    sphere.center.applyMatrix4(obj.mesh.matrixWorld);
                    obj.mesh.visible = this.frustum.intersectsSphere(sphere);
                }
            }
        }
    }

    /**
     * Render scene
     */
    render(camera) {
        this.camera = camera;
        
        const startTime = performance.now();
        this.renderer.render(this.scene, camera);
        this.renderTime = performance.now() - startTime;
    }

    /**
     * Get scene
     */
    getScene() {
        return this.scene;
    }

    /**
     * Get raw Three.js renderer
     */
    getThreeRenderer() {
        return this.renderer;
    }

    /**
     * Get render info
     */
    getRenderInfo() {
        return {
            calls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles,
            points: this.renderer.info.render.points,
            lines: this.renderer.info.render.lines,
            textures: this.renderer.info.memory.textures,
            geometries: this.renderer.info.memory.geometries,
            renderTime: this.renderTime
        };
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.renderer.setSize(width, height);
        
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    /**
     * Clear scene
     */
    clear() {
        this.scene.clear();
    }

    /**
     * Dispose resources
     */
    dispose() {
        this.renderer.dispose();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}
