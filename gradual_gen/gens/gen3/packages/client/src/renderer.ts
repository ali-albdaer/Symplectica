/**
 * Three.js Renderer with dual-precision and floating origin
 */

import * as THREE from 'three';

// Floating origin recenter threshold (10^7 meters = 10,000 km)
const RECENTER_THRESHOLD = 1e7;

export class Renderer {
    private container: HTMLElement;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;

    // Floating origin offset (high precision)
    private originX = 0;
    private originY = 0;
    private originZ = 0;

    // Camera state
    private cameraDistance = 1e9;
    private cameraPhi = 0.5;
    private cameraTheta = 0;
    private targetX = 0;
    private targetY = 0;
    private targetZ = 0;

    // Object pool for bodies
    private bodyMeshes: Map<string, THREE.Mesh> = new Map();

    // Ambient and directional lights
    private ambientLight!: THREE.AmbientLight;
    private sunLight!: THREE.PointLight;

    constructor() {
        this.container = document.getElementById('canvas-container')!;
    }

    init(): void {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000010);

        // Create camera with logarithmic depth buffer settings
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 1e3, 1e15);
        this.camera.position.set(0, 0, this.cameraDistance);

        // Create renderer with logarithmic depth buffer for scale handling
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(this.ambientLight);

        // Sun light (positioned at origin initially)
        this.sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
        this.sunLight.position.set(0, 0, 0);
        this.scene.add(this.sunLight);

        // Add starfield
        this.createStarfield();

        // Handle window resize
        window.addEventListener('resize', this.onResize.bind(this));
    }

    private createStarfield(): void {
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            // Distribute stars on a large sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1e14;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Slight color variation
            const brightness = 0.5 + Math.random() * 0.5;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness;
            colors[i * 3 + 2] = brightness;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            sizeAttenuation: false,
        });

        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    }

    private onResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Update or create a body mesh
     */
    updateBody(
        id: string,
        name: string,
        worldX: number,
        worldY: number,
        worldZ: number,
        radius: number,
        color: number,
        isEmissive: boolean
    ): void {
        let mesh = this.bodyMeshes.get(id);

        if (!mesh) {
            // Create new mesh
            const geometry = new THREE.SphereGeometry(1, 32, 24);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: isEmissive ? color : 0x000000,
                emissiveIntensity: isEmissive ? 0.5 : 0,
                roughness: 0.8,
                metalness: 0.1,
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.name = name;
            this.scene.add(mesh);
            this.bodyMeshes.set(id, mesh);
        }

        // Convert to local coordinates (relative to floating origin)
        const localX = worldX - this.originX;
        const localY = worldY - this.originY;
        const localZ = worldZ - this.originZ;

        mesh.position.set(localX, localY, localZ);
        mesh.scale.setScalar(radius);

        // Update sun light position if this is the sun
        if (name.toLowerCase() === 'sun') {
            this.sunLight.position.set(localX, localY, localZ);
        }
    }

    /**
     * Remove a body mesh
     */
    removeBody(id: string): void {
        const mesh = this.bodyMeshes.get(id);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose();
            this.bodyMeshes.delete(id);
        }
    }

    /**
     * Check and perform floating origin recenter if needed
     */
    private checkRecenter(): void {
        const camWorld = {
            x: this.targetX + this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta),
            y: this.targetY + this.cameraDistance * Math.cos(this.cameraPhi),
            z: this.targetZ + this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta),
        };

        const localX = camWorld.x - this.originX;
        const localY = camWorld.y - this.originY;
        const localZ = camWorld.z - this.originZ;

        const distFromOrigin = Math.sqrt(localX * localX + localY * localY + localZ * localZ);

        if (distFromOrigin > RECENTER_THRESHOLD) {
            // Recenter origin to camera position
            const oldOrigin = { x: this.originX, y: this.originY, z: this.originZ };
            this.originX = camWorld.x;
            this.originY = camWorld.y;
            this.originZ = camWorld.z;

            // Update all mesh positions
            const deltaX = this.originX - oldOrigin.x;
            const deltaY = this.originY - oldOrigin.y;
            const deltaZ = this.originZ - oldOrigin.z;

            this.bodyMeshes.forEach((mesh) => {
                mesh.position.x -= deltaX;
                mesh.position.y -= deltaY;
                mesh.position.z -= deltaZ;
            });

            console.log('Recentered floating origin to:', this.originX, this.originY, this.originZ);
        }
    }

    /**
     * Set camera target (world coordinates)
     */
    setCameraTarget(x: number, y: number, z: number): void {
        this.targetX = x;
        this.targetY = y;
        this.targetZ = z;
    }

    /**
     * Set camera position directly (world coordinates)
     */
    setCameraPosition(x: number, y: number, z: number): void {
        // Calculate new distance and angles based on target
        const dx = x - this.targetX;
        const dy = y - this.targetY;
        const dz = z - this.targetZ;
        this.cameraDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (this.cameraDistance > 0) {
            this.cameraPhi = Math.acos(dy / this.cameraDistance);
            this.cameraTheta = Math.atan2(dz, dx);
        }
    }

    /**
     * Move camera relative to current position
     */
    moveCamera(dx: number, dy: number, dz: number): void {
        // Move in camera-relative coordinates
        const sinPhi = Math.sin(this.cameraPhi);
        const cosPhi = Math.cos(this.cameraPhi);
        const sinTheta = Math.sin(this.cameraTheta);
        const cosTheta = Math.cos(this.cameraTheta);

        // Forward is -Z in camera space
        const forwardX = sinPhi * cosTheta;
        const forwardY = cosPhi;
        const forwardZ = sinPhi * sinTheta;

        // Right is +X in camera space
        const rightX = -sinTheta;
        const rightZ = cosTheta;

        this.targetX += rightX * dx + forwardX * dz;
        this.targetY += dy;
        this.targetZ += rightZ * dx + forwardZ * dz;
    }

    /**
     * Rotate camera (spherical coordinates)
     */
    rotateCamera(dTheta: number, dPhi: number): void {
        this.cameraTheta += dTheta;
        this.cameraPhi = Math.max(0.01, Math.min(Math.PI - 0.01, this.cameraPhi + dPhi));
    }

    /**
     * Zoom camera
     */
    zoom(factor: number): void {
        this.cameraDistance *= 1 - factor;
        this.cameraDistance = Math.max(1e3, Math.min(1e15, this.cameraDistance));
    }

    /**
     * Get camera distance from target
     */
    getCameraDistance(): number {
        return this.cameraDistance;
    }

    /**
     * Get camera world position
     */
    getCameraPosition(): { x: number; y: number; z: number } {
        return {
            x: this.targetX + this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta),
            y: this.targetY + this.cameraDistance * Math.cos(this.cameraPhi),
            z: this.targetZ + this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta),
        };
    }

    /**
     * Render the scene
     */
    render(): void {
        // Check if floating origin needs recentering
        this.checkRecenter();

        // Update camera position
        const camWorldPos = this.getCameraPosition();
        const localCamX = camWorldPos.x - this.originX;
        const localCamY = camWorldPos.y - this.originY;
        const localCamZ = camWorldPos.z - this.originZ;

        this.camera.position.set(localCamX, localCamY, localCamZ);

        // Look at target
        const localTargetX = this.targetX - this.originX;
        const localTargetY = this.targetY - this.originY;
        const localTargetZ = this.targetZ - this.originZ;
        this.camera.lookAt(localTargetX, localTargetY, localTargetZ);

        this.renderer.render(this.scene, this.camera);
    }

    dispose(): void {
        this.bodyMeshes.forEach((mesh) => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose();
        });
        this.bodyMeshes.clear();

        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}
