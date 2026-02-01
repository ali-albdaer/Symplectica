/**
 * renderer.js - Three.js Rendering Setup
 * 
 * Handles WebGL rendering setup, scene management, and render loop.
 * Uses Three.js (loaded from CDN via importmap).
 * 
 * Architecture:
 * - Scene setup and management
 * - Camera systems (orthographic for edit, perspective for free view)
 * - Post-processing effects setup
 * - Render loop coordination
 */

import * as THREE from 'three';
import { getState, AppMode } from './state.js';
import { getSimulation } from './simulation.js';
import { AU } from './constants.js';

/**
 * Renderer class - manages Three.js scene and rendering
 */
export class Renderer {
    constructor() {
        /** @type {THREE.WebGLRenderer} */
        this.webglRenderer = null;
        
        /** @type {THREE.Scene} */
        this.scene = null;
        
        /** @type {THREE.PerspectiveCamera} */
        this.perspectiveCamera = null;
        
        /** @type {THREE.OrthographicCamera} */
        this.orthographicCamera = null;
        
        /** @type {THREE.Camera} Active camera reference */
        this.activeCamera = null;
        
        /** @type {HTMLElement} Container element */
        this.container = null;
        
        /** @type {number} Container width */
        this.width = 0;
        
        /** @type {number} Container height */
        this.height = 0;
        
        /** @type {THREE.Group} Group containing all body meshes */
        this.bodiesGroup = null;
        
        /** @type {THREE.Group} Group for trails */
        this.trailsGroup = null;
        
        /** @type {THREE.Group} Group for vectors */
        this.vectorsGroup = null;
        
        /** @type {THREE.GridHelper} Edit mode grid */
        this.grid = null;
        
        /** @type {Map<number, THREE.Object3D>} Body ID to mesh mapping */
        this.bodyMeshes = new Map();
        
        /** @type {Map<number, THREE.Line>} Body ID to trail line mapping */
        this.trailLines = new Map();
        
        /** @type {number} View scale (meters per unit) */
        this.viewScale = AU / 100;
        
        /** @type {THREE.Raycaster} For mouse picking */
        this.raycaster = new THREE.Raycaster();
        
        /** @type {THREE.Vector2} Mouse position for raycasting */
        this.mouseNDC = new THREE.Vector2();
        
        /** @type {THREE.AmbientLight} */
        this.ambientLight = null;
        
        /** @type {THREE.PointLight[]} Light sources from stars */
        this.starLights = [];
        
        /** @type {boolean} Whether renderer is initialized */
        this.initialized = false;
    }

    /**
     * Initialize the renderer
     * @param {HTMLElement} container - Container element for canvas
     */
    init(container) {
        this.container = container;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        // Create WebGL renderer
        this.webglRenderer = new THREE.WebGLRenderer({
            antialias: getState().performancePreset !== 'low',
            alpha: false,
            powerPreference: 'high-performance',
        });
        this.webglRenderer.setSize(this.width, this.height);
        this.webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.webglRenderer.setClearColor(0x000008, 1);
        this.webglRenderer.shadowMap.enabled = true;
        this.webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.webglRenderer.domElement);
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create cameras
        this._createCameras();
        
        // Create groups
        this.bodiesGroup = new THREE.Group();
        this.bodiesGroup.name = 'bodies';
        this.scene.add(this.bodiesGroup);
        
        this.trailsGroup = new THREE.Group();
        this.trailsGroup.name = 'trails';
        this.scene.add(this.trailsGroup);
        
        this.vectorsGroup = new THREE.Group();
        this.vectorsGroup.name = 'vectors';
        this.scene.add(this.vectorsGroup);
        
        // Create lighting
        this._createLighting();
        
        // Create grid for edit mode
        this._createGrid();
        
        // Create starfield background
        this._createStarfield();
        
        // Handle window resize
        window.addEventListener('resize', () => this._onResize());
        
        // Set up mode-specific camera
        this._updateCameraForMode();
        
        this.initialized = true;
    }

    /**
     * Create perspective and orthographic cameras
     * @private
     */
    _createCameras() {
        const aspect = this.width / this.height;
        
        // Perspective camera for free view
        this.perspectiveCamera = new THREE.PerspectiveCamera(
            60,     // FOV
            aspect,
            1e6,    // Near plane (1000 km)
            1e15    // Far plane (about 10,000 AU)
        );
        this.perspectiveCamera.position.set(0, 5 * AU / this.viewScale, 5 * AU / this.viewScale);
        this.perspectiveCamera.lookAt(0, 0, 0);
        
        // Orthographic camera for edit mode
        const frustumSize = 10 * AU / this.viewScale;
        this.orthographicCamera = new THREE.OrthographicCamera(
            -frustumSize * aspect / 2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            -frustumSize / 2,
            1e3,
            1e15
        );
        this.orthographicCamera.position.set(0, 10 * AU / this.viewScale, 0);
        this.orthographicCamera.lookAt(0, 0, 0);
        this.orthographicCamera.up.set(0, 0, -1);
        
        // Start with orthographic (edit mode)
        this.activeCamera = this.orthographicCamera;
    }

    /**
     * Create scene lighting
     * @private
     */
    _createLighting() {
        // Ambient light for minimum visibility
        this.ambientLight = new THREE.AmbientLight(0x111122, 0.3);
        this.scene.add(this.ambientLight);
        
        // Hemisphere light for better ambient
        const hemiLight = new THREE.HemisphereLight(0x444466, 0x080820, 0.5);
        this.scene.add(hemiLight);
    }

    /**
     * Create the edit mode grid
     * @private
     */
    _createGrid() {
        const gridSize = 20 * AU / this.viewScale;
        const divisions = 20;
        
        this.grid = new THREE.GridHelper(gridSize, divisions, 0x444466, 0x222244);
        this.grid.rotation.x = 0; // Flat on XZ plane
        this.scene.add(this.grid);
    }

    /**
     * Create starfield background
     * @private
     */
    _createStarfield() {
        const starCount = 2000;
        const starGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            // Random positions on a large sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 1e14 / this.viewScale;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random star colors (white to blue to yellow)
            const colorChoice = Math.random();
            if (colorChoice < 0.6) {
                colors[i * 3] = 0.9 + Math.random() * 0.1;
                colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i * 3 + 2] = 1.0;
            } else if (colorChoice < 0.8) {
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i * 3 + 2] = 0.7 + Math.random() * 0.2;
            } else {
                colors[i * 3] = 0.7 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
                colors[i * 3 + 2] = 1.0;
            }
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            sizeAttenuation: false,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.name = 'starfield';
        this.scene.add(stars);
    }

    /**
     * Update camera based on current mode
     * @private
     */
    _updateCameraForMode() {
        const state = getState();
        
        if (state.mode === AppMode.EDIT) {
            this.activeCamera = this.orthographicCamera;
            this.grid.visible = state.showGrid;
        } else {
            this.activeCamera = this.perspectiveCamera;
            this.grid.visible = false;
        }
    }

    /**
     * Handle window resize
     * @private
     */
    _onResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        const aspect = this.width / this.height;
        
        // Update perspective camera
        this.perspectiveCamera.aspect = aspect;
        this.perspectiveCamera.updateProjectionMatrix();
        
        // Update orthographic camera
        const zoom = this.orthographicCamera.zoom;
        const frustumSize = 10 * AU / this.viewScale / zoom;
        this.orthographicCamera.left = -frustumSize * aspect / 2;
        this.orthographicCamera.right = frustumSize * aspect / 2;
        this.orthographicCamera.top = frustumSize / 2;
        this.orthographicCamera.bottom = -frustumSize / 2;
        this.orthographicCamera.updateProjectionMatrix();
        
        // Update renderer
        this.webglRenderer.setSize(this.width, this.height);
    }

    /**
     * Set the view scale
     * @param {number} scale - Meters per render unit
     */
    setViewScale(scale) {
        this.viewScale = scale;
        // Recreate grid with new scale
        if (this.grid) {
            this.scene.remove(this.grid);
            this._createGrid();
        }
    }

    /**
     * Get the canvas element
     * @returns {HTMLCanvasElement}
     */
    getCanvas() {
        return this.webglRenderer.domElement;
    }

    /**
     * Convert screen coordinates to world position on the edit plane
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @param {number} planeY - Y position of the edit plane (default 0)
     * @returns {THREE.Vector3|null} World position or null if no intersection
     */
    screenToWorld(screenX, screenY, planeY = 0) {
        // Convert to NDC
        this.mouseNDC.x = (screenX / this.width) * 2 - 1;
        this.mouseNDC.y = -(screenY / this.height) * 2 + 1;
        
        // Create plane at planeY
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
        
        // Cast ray
        this.raycaster.setFromCamera(this.mouseNDC, this.activeCamera);
        
        const intersection = new THREE.Vector3();
        const hit = this.raycaster.ray.intersectPlane(plane, intersection);
        
        return hit ? intersection : null;
    }

    /**
     * Perform raycast to find bodies under mouse
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {Array} Intersections sorted by distance
     */
    raycastBodies(screenX, screenY) {
        this.mouseNDC.x = (screenX / this.width) * 2 - 1;
        this.mouseNDC.y = -(screenY / this.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouseNDC, this.activeCamera);
        
        // Get all body meshes
        const meshes = [];
        this.bodyMeshes.forEach((mesh) => {
            meshes.push(mesh);
        });
        
        return this.raycaster.intersectObjects(meshes, true);
    }

    /**
     * Update the edit mode orthographic zoom
     * @param {number} delta - Zoom delta (positive = zoom in)
     */
    zoomOrthographic(delta) {
        const zoomFactor = 1 - delta * 0.001;
        this.orthographicCamera.zoom = Math.max(0.01, Math.min(100, 
            this.orthographicCamera.zoom * zoomFactor
        ));
        this.orthographicCamera.updateProjectionMatrix();
    }

    /**
     * Pan the orthographic camera
     * @param {number} dx - X delta in screen pixels
     * @param {number} dy - Y delta in screen pixels
     */
    panOrthographic(dx, dy) {
        const aspect = this.width / this.height;
        const frustumSize = 10 * AU / this.viewScale / this.orthographicCamera.zoom;
        
        // Convert screen pixels to world units
        const worldDx = (dx / this.width) * frustumSize * aspect;
        const worldDy = (dy / this.height) * frustumSize;
        
        this.orthographicCamera.position.x -= worldDx;
        this.orthographicCamera.position.z += worldDy;
    }

    /**
     * Update scene visibility based on state
     */
    updateVisibility() {
        const state = getState();
        
        this._updateCameraForMode();
        
        this.trailsGroup.visible = state.showTrails;
        this.vectorsGroup.visible = state.showVelocityVectors;
        
        if (state.mode === AppMode.EDIT) {
            this.grid.visible = state.showGrid;
        }
    }

    /**
     * Render a single frame
     */
    render() {
        if (!this.initialized) return;
        
        this.webglRenderer.render(this.scene, this.activeCamera);
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        // Dispose meshes
        this.bodyMeshes.forEach((mesh) => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        });
        this.bodyMeshes.clear();
        
        // Dispose trails
        this.trailLines.forEach((line) => {
            if (line.geometry) line.geometry.dispose();
            if (line.material) line.material.dispose();
        });
        this.trailLines.clear();
        
        // Dispose renderer
        if (this.webglRenderer) {
            this.webglRenderer.dispose();
        }
    }
}

// Singleton instance
let rendererInstance = null;

/**
 * Get the global renderer instance
 * @returns {Renderer}
 */
export function getRenderer() {
    if (!rendererInstance) {
        rendererInstance = new Renderer();
    }
    return rendererInstance;
}

/**
 * Initialize the renderer with a container
 * @param {HTMLElement} container
 * @returns {Renderer}
 */
export function initRenderer(container) {
    const renderer = getRenderer();
    renderer.init(container);
    return renderer;
}

export default {
    Renderer,
    getRenderer,
    initRenderer,
};
