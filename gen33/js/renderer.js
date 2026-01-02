import * as THREE from 'three';
import { Config } from './config.js';

export class Renderer {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = Config.graphics.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Stars
        this.createStars();

        window.addEventListener('resize', () => this.onResize());
    }

    createStars() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < Config.graphics.starsCount; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            vertices.push(x, y, z);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false });
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }

    add(mesh) {
        this.scene.add(mesh);
    }

    remove(mesh) {
        this.scene.remove(mesh);
    }

    render(camera) {
        // Keep stars centered on camera to simulate infinite sky
        this.stars.position.copy(camera.position);
        this.renderer.render(this.scene, camera);
    }

    onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Camera aspect update is handled in main loop or player
    }
}
