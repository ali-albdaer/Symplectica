/**
 * Orbital Camera Controller
 * 
 * Camera system optimized for space simulation:
 * - Orbits around configurable focus point
 * - Smooth zoom with exponential scaling
 * - Pan and rotation with momentum
 * - Floating origin support for large-scale precision
 */

import * as THREE from 'three';

const AU = 1.495978707e11;

export class OrbitCamera extends THREE.PerspectiveCamera {
    // Orbital parameters
    private radius = 3 * AU;
    private azimuth = 0;
    private elevation = Math.PI / 6;

    // Focus point (world coordinates, high precision)
    private focusX = 0;
    private focusY = 0;
    private focusZ = 0;

    // Floating origin offset
    private originX = 0;
    private originY = 0;
    private originZ = 0;

    // Input state
    private isDragging = false;
    private lastMouseX = 0;
    private lastMouseY = 0;
    private isRightDrag = false;

    // Momentum
    private azimuthVelocity = 0;
    private elevationVelocity = 0;
    private zoomVelocity = 0;

    // Limits
    private readonly minRadius = 1e6;  // 1000 km
    private readonly maxRadius = 1e15; // ~1000 AU
    private readonly minElevation = -Math.PI / 2 + 0.01;
    private readonly maxElevation = Math.PI / 2 - 0.01;

    // Damping
    private readonly rotationDamping = 0.92;
    private readonly zoomDamping = 0.9;

    constructor(fov: number, aspect: number, near: number, far: number) {
        super(fov, aspect, near, far);

        this.updatePosition();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const canvas = document.getElementById('canvas-container');
        if (!canvas) return;

        canvas.addEventListener('mousedown', (e: MouseEvent) => {
            this.isDragging = true;
            this.isRightDrag = e.button === 2;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            e.preventDefault();
        });

        canvas.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            if (this.isRightDrag) {
                // Pan (not implemented yet - would move focus point)
            } else {
                // Rotate
                const sensitivity = 0.005;
                this.azimuthVelocity = -deltaX * sensitivity;
                this.elevationVelocity = -deltaY * sensitivity;

                this.azimuth += this.azimuthVelocity;
                this.elevation += this.elevationVelocity;

                // Clamp elevation
                this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation));
            }

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        canvas.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();

            // Exponential zoom
            const zoomFactor = 1 + Math.sign(e.deltaY) * 0.1;
            this.zoomVelocity = (zoomFactor - 1) * this.radius * 0.5;
        }, { passive: false });

        // Prevent context menu
        canvas.addEventListener('contextmenu', (e: MouseEvent) => e.preventDefault());

        // Touch support
        let touchStartDist = 0;

        canvas.addEventListener('touchstart', (e: TouchEvent) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.lastMouseX = e.touches[0].clientX;
                this.lastMouseY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dx = e.touches[1].clientX - e.touches[0].clientX;
                const dy = e.touches[1].clientY - e.touches[0].clientY;
                touchStartDist = Math.sqrt(dx * dx + dy * dy);
            }
        });

        canvas.addEventListener('touchmove', (e: TouchEvent) => {
            if (e.touches.length === 1 && this.isDragging) {
                const deltaX = e.touches[0].clientX - this.lastMouseX;
                const deltaY = e.touches[0].clientY - this.lastMouseY;

                const sensitivity = 0.005;
                this.azimuth -= deltaX * sensitivity;
                this.elevation -= deltaY * sensitivity;
                this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation));

                this.lastMouseX = e.touches[0].clientX;
                this.lastMouseY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dx = e.touches[1].clientX - e.touches[0].clientX;
                const dy = e.touches[1].clientY - e.touches[0].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const zoomFactor = touchStartDist / dist;
                this.radius *= zoomFactor;
                this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius));

                touchStartDist = dist;
            }
        });

        canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    update(delta: number): void {
        // Apply momentum
        if (!this.isDragging) {
            this.azimuth += this.azimuthVelocity * delta * 60;
            this.elevation += this.elevationVelocity * delta * 60;
            this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation));

            // Dampen
            this.azimuthVelocity *= this.rotationDamping;
            this.elevationVelocity *= this.rotationDamping;
        }

        // Apply zoom
        this.radius += this.zoomVelocity;
        this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius));
        this.zoomVelocity *= this.zoomDamping;

        this.updatePosition();
    }

    private updatePosition(): void {
        // Calculate camera position relative to focus
        const x = this.radius * Math.cos(this.elevation) * Math.sin(this.azimuth);
        const y = this.radius * Math.sin(this.elevation);
        const z = this.radius * Math.cos(this.elevation) * Math.cos(this.azimuth);

        // For floating origin: camera stays near origin, world moves opposite
        // The focus point in world coords is (focusX, focusY, focusZ)
        // Camera in world coords would be (focusX + x, focusY + y, focusZ + z)
        // With floating origin at camera, camera position in render coords is (0, 0, 0)?
        // Actually: origin = camera world position, camera render position = x, y, z relative to focus

        // Set camera relative to its own origin (which follows the camera)
        // For now, keep it simple: camera orbits origin
        this.position.set(x, y, z);
        this.lookAt(0, 0, 0);

        // Update origin for floating origin system
        this.originX = this.focusX + x;
        this.originY = this.focusY + y;
        this.originZ = this.focusZ + z;
    }

    setDistance(distance: number): void {
        this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, distance));
        this.updatePosition();
    }

    getDistance(): number {
        return this.radius;
    }

    setFocus(x: number, y: number, z: number): void {
        this.focusX = x;
        this.focusY = y;
        this.focusZ = z;
        this.updatePosition();
    }

    setElevation(angle: number): void {
        this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, angle));
        this.updatePosition();
    }

    /** Get world origin for floating origin rendering */
    getWorldOrigin(): { x: number; y: number; z: number } {
        return { x: this.originX, y: this.originY, z: this.originZ };
    }

    /** Transform world position to render position using floating origin */
    worldToRender(worldX: number, worldY: number, worldZ: number): THREE.Vector3 {
        return new THREE.Vector3(
            worldX - this.originX,
            worldY - this.originY,
            worldZ - this.originZ
        );
    }
}
