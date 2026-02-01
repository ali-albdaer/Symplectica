import * as THREE from 'three';
import { Visuals } from './Visuals.js';
import { Vec3 } from '../utils/MathUtils.js';

export class RenderEngine {
    constructor(canvasContainer) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // Space

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1e9); // Large far plane
        this.camera.position.set(0, 0, 0); // Camera stays at origin in render space

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true }); // Log depth buffer is CRITICAL for space scales
        this.renderer.setSize(this.width, this.height);
        canvasContainer.appendChild(this.renderer.domElement);

        this.visuals = new Visuals(this.scene);
        
        // Physics Camera Position (The "Real" position of the observer in the universe)
        this.cameraPhysPos = new Vec3(0, 0, 1.496e11); // Start at 1 AU approximately

        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    render(stateManager) {
        // Updates visuals relative to this.cameraPhysPos
        this.visuals.update(stateManager.bodies, this.cameraPhysPos);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Convert screen coordinates to a Ray into the physics world
    getRayFromScreen(clientX, clientY) {
        // Standard Three.js Raycasting setup
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;

        const vec = new THREE.Vector3(x, y, 0.5);
        vec.unproject(this.camera);
        
        // Ray Origin (Render Space) is (0,0,0) because camera is there
        // Ray Dir
        const dir = vec.sub(this.camera.position).normalize();
        
        return {
            origin: this.cameraPhysPos.clone(),
            direction: new Vec3(dir.x, dir.y, dir.z)
        };
    }
}