import * as THREE from 'three';
import { Config } from '../config.js';

export class GraphicsEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e13); // Large far plane
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: Config.rendering.logarithmicDepthBuffer });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = Config.rendering.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        this.setupLighting();
        this.setupSkybox();

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupLighting() {
        // Ambient light is minimal, space is dark
        const ambient = new THREE.AmbientLight(0x111111);
        this.scene.add(ambient);

        // Sun light will be attached to the Sun entity, but we can init a placeholder here if needed.
        // Actually, the CelestialBody class should handle its own light if it's a star.
    }

    setupSkybox() {
        // Simple starfield
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        
        for (let i = 0; i < Config.rendering.starsCount; i++) {
            const x = (Math.random() - 0.5) * 2e12;
            const y = (Math.random() - 0.5) * 2e12;
            const z = (Math.random() - 0.5) * 2e12;
            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1e9, sizeAttenuation: true }); // Size needs to be huge at this scale
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    addToScene(object) {
        this.scene.add(object);
    }
}
