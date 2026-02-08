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

    // Free camera mode (world coordinates)
    private freeMode = false;
    private freeX = 0;
    private freeY = 0;
    private freeZ = 0;
    private freeOriginX = 0;
    private freeOriginY = 0;
    private freeOriginZ = 0;

    // Pointer lock
    private canvas?: HTMLElement;
    private pointerLocked = false;

    // Free camera look sensitivity multiplier
    private freeLookSensitivity = 1.0;

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
        this.canvas = canvas;

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.canvas;
            if (!this.pointerLocked) {
                this.isDragging = false;
            }
        });

        canvas.addEventListener('mousedown', (e: MouseEvent) => {
            if (this.freeMode && !this.pointerLocked) {
                this.canvas?.requestPointerLock();
                e.preventDefault();
                return;
            }

            this.isDragging = true;
            this.isRightDrag = e.button === 2;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            e.preventDefault();
        });

        canvas.addEventListener('mousemove', (e: MouseEvent) => {
            if (this.freeMode && this.pointerLocked) {
                const sensitivity = 0.002 * this.freeLookSensitivity;
                this.azimuthVelocity = -e.movementX * sensitivity;
                this.elevationVelocity = -e.movementY * sensitivity;

                this.azimuth += this.azimuthVelocity;
                this.elevation += this.elevationVelocity;
                this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation));
                return;
            }

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

    setFreeLookSensitivity(multiplier: number): void {
        if (!Number.isFinite(multiplier) || multiplier <= 0) return;
        this.freeLookSensitivity = multiplier;
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
        // Direction the camera is facing
        const dirX = Math.cos(this.elevation) * Math.sin(this.azimuth);
        const dirY = Math.sin(this.elevation);
        const dirZ = Math.cos(this.elevation) * Math.cos(this.azimuth);

        if (this.freeMode) {
            // Free mode: camera uses explicit world position and a fixed render origin
            const renderX = this.freeX - this.freeOriginX;
            const renderY = this.freeY - this.freeOriginY;
            const renderZ = this.freeZ - this.freeOriginZ;
            this.position.set(renderX, renderY, renderZ);
            this.lookAt(renderX + dirX, renderY + dirY, renderZ + dirZ);

            // Floating origin is the chosen render origin
            this.originX = this.freeOriginX;
            this.originY = this.freeOriginY;
            this.originZ = this.freeOriginZ;
            return;
        }

        // Orbit mode: camera position relative to focus
        const x = this.radius * Math.cos(this.elevation) * Math.sin(this.azimuth);
        const y = this.radius * Math.sin(this.elevation);
        const z = this.radius * Math.cos(this.elevation) * Math.cos(this.azimuth);

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

    getCameraWorldPosition(): { x: number; y: number; z: number } {
        if (this.freeMode) {
            return { x: this.freeX, y: this.freeY, z: this.freeZ };
        }
        // In orbit mode, origin is the camera world position.
        return { x: this.originX, y: this.originY, z: this.originZ };
    }

    setFocus(x: number, y: number, z: number): void {
        this.focusX = x;
        this.focusY = y;
        this.focusZ = z;
        this.updatePosition();
    }

    setOrbitFromOffset(offset: { x: number; y: number; z: number }): void {
        const r = Math.sqrt(offset.x * offset.x + offset.y * offset.y + offset.z * offset.z);
        if (!Number.isFinite(r) || r <= 0) return;
        this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, r));
        this.azimuth = Math.atan2(offset.x, offset.z);
        const clampedY = Math.max(-1, Math.min(1, offset.y / this.radius));
        this.elevation = Math.asin(clampedY);
        this.azimuthVelocity = 0;
        this.elevationVelocity = 0;
        this.zoomVelocity = 0;
        this.updatePosition();
    }

    setFreeMode(
        enabled: boolean,
        seedWorld?: { x: number; y: number; z: number },
        seedForward?: { x: number; y: number; z: number },
        seedOrigin?: { x: number; y: number; z: number }
    ): void {
        this.freeMode = enabled;
        if (enabled) {
            // Seed free position from provided world coordinates
            if (seedWorld) {
                this.freeX = seedWorld.x;
                this.freeY = seedWorld.y;
                this.freeZ = seedWorld.z;
            }
            if (seedOrigin) {
                this.freeOriginX = seedOrigin.x;
                this.freeOriginY = seedOrigin.y;
                this.freeOriginZ = seedOrigin.z;
            } else {
                this.freeOriginX = this.freeX;
                this.freeOriginY = this.freeY;
                this.freeOriginZ = this.freeZ;
            }
            if (seedForward) {
                const dir = new THREE.Vector3(seedForward.x, seedForward.y, seedForward.z).normalize();
                const clampedY = Math.max(-1, Math.min(1, dir.y));
                this.azimuth = Math.atan2(dir.x, dir.z);
                this.elevation = Math.asin(clampedY);
                this.azimuthVelocity = 0;
                this.elevationVelocity = 0;
            }
            this.isDragging = false;
            this.canvas?.requestPointerLock();
        } else {
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        }
        this.updatePosition();
    }

    isFreeMode(): boolean {
        return this.freeMode;
    }

    moveFree(dx: number, dy: number, dz: number): void {
        if (!this.freeMode) return;
        this.freeX += dx;
        this.freeY += dy;
        this.freeZ += dz;
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
