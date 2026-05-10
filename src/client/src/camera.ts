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
import { AU } from '../../shared/constants';
import {
    bodySafeOrbitDistance,
    clampOrbitDistance,
    smoothingAlphaFromDamping,
    unwrapAngle,
} from './camera-math';

export class OrbitCamera extends THREE.PerspectiveCamera {
    // Orbital parameters
    private radius = 3 * AU;
    private azimuth = 0;
    private elevation = Math.PI / 6;
    private roll = 0;

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

    // Surface camera mode (body-local)
    private surfaceMode = false;
    private surfaceX = 0;
    private surfaceY = 0;
    private surfaceZ = 0;
    private surfaceCenterX = 0;
    private surfaceCenterY = 0;
    private surfaceCenterZ = 0;
    private surfaceBodyRadius = 1;
    private surfaceEyeHeight = 1.7;
    private surfaceYaw = 0;
    private surfacePitch = 0;
    private surfaceYawVelocity = 0;
    private surfacePitchVelocity = 0;
    private surfaceRotationAxis = new THREE.Vector3(0, 1, 0);
    private surfaceRotationRate = 0;
    private surfaceLookSensitivity = 0.3;
    private surfaceRotationDamping = 0;
    private readonly surfacePitchLimit = Math.PI / 2 - 0.01;

    // Pointer lock
    private canvas?: HTMLElement;
    private pointerLocked = false;

    // Free camera look sensitivity multiplier
    private freeLookSensitivity = 0.3;

    // Floating origin offset
    private originX = 0;
    private originY = 0;
    private originZ = 0;

    // Input state
    private isDragging = false;
    private lastMouseX = 0;
    private lastMouseY = 0;
    private isRightDrag = false;
    private lastDragMoveTime = 0;
    private readonly dragMomentumCutoffMs = 120;

    // Momentum
    private azimuthVelocity = 0;
    private elevationVelocity = 0;
    private zoomTargetRadius = this.radius;

    // Limits
    private minRadius = 1e6;  // 1000 km
    private maxRadius = 1e15; // ~1000 AU (can be increased for galactic scale)
    private readonly minElevation = -Math.PI / 2 + 0.01;
    private readonly maxElevation = Math.PI / 2 - 0.01;

    // Damping
    private freeRotationDamping = 0.92;
    private orbitalRotationDamping = 0.92;
    private orbitalZoomDamping = 0.9;

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
            if ((this.freeMode || this.surfaceMode) && !this.pointerLocked) {
                this.canvas?.requestPointerLock();
                e.preventDefault();
                return;
            }

            this.isDragging = true;
            this.isRightDrag = e.button === 2;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.lastDragMoveTime = performance.now();
            this.azimuthVelocity = 0;
            this.elevationVelocity = 0;
            e.preventDefault();
        });

        canvas.addEventListener('mousemove', (e: MouseEvent) => {
            if (this.freeMode && this.pointerLocked) {
                const sensitivity = 0.002 * this.freeLookSensitivity;
                if (this.freeRotationDamping <= 0) {
                    this.azimuth += -e.movementX * sensitivity;
                    this.elevation += -e.movementY * sensitivity;
                    this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation));
                    this.azimuthVelocity = 0;
                    this.elevationVelocity = 0;
                } else {
                    this.azimuthVelocity += -e.movementX * sensitivity;
                    this.elevationVelocity += -e.movementY * sensitivity;
                }
                return;
            }

            if (this.surfaceMode && this.pointerLocked) {
                const sensitivity = 0.002 * this.surfaceLookSensitivity;
                if (this.surfaceRotationDamping <= 0) {
                    this.surfaceYaw += -e.movementX * sensitivity;
                    this.surfacePitch += -e.movementY * sensitivity;
                    this.surfacePitch = Math.max(-this.surfacePitchLimit, Math.min(this.surfacePitchLimit, this.surfacePitch));
                    this.surfaceYawVelocity = 0;
                    this.surfacePitchVelocity = 0;
                } else {
                    this.surfaceYawVelocity += -e.movementX * sensitivity;
                    this.surfacePitchVelocity += -e.movementY * sensitivity;
                }
                return;
            }

            if (!this.isDragging) return;

            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            if (this.isRightDrag) {
                // Pan: move focus in the camera's local right/up plane
                const panSpeed = this.radius * 0.001;
                const rightX = Math.cos(this.azimuth);
                const rightZ = -Math.sin(this.azimuth);
                const upX = -Math.sin(this.elevation) * Math.sin(this.azimuth);
                const upY = Math.cos(this.elevation);
                const upZ = -Math.sin(this.elevation) * Math.cos(this.azimuth);
                this.focusX += (-deltaX * rightX + deltaY * upX) * panSpeed;
                this.focusY += (deltaY * upY) * panSpeed;
                this.focusZ += (-deltaX * rightZ + deltaY * upZ) * panSpeed;
                this.updatePosition();
            } else {
                // Rotate
                const sensitivity = 0.005;
                this.azimuthVelocity = -deltaX * sensitivity;
                this.elevationVelocity = deltaY * sensitivity;

                this.azimuth += this.azimuthVelocity;
                this.elevation += this.elevationVelocity;

                // Clamp elevation
                this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation));
            }

            this.lastDragMoveTime = performance.now();
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

            // Smooth exponential zoom based on delta magnitude
            const LINE_HEIGHT = 16;
            const PAGE_HEIGHT = window.innerHeight || 800;
            let delta = e.deltaY;
            if (e.deltaMode === 1) delta *= LINE_HEIGHT;
            if (e.deltaMode === 2) delta *= PAGE_HEIGHT;

            const zoomSpeed = 0.0015;
            let zoomFactor = Math.exp(delta * zoomSpeed);
            zoomFactor = Math.max(0.5, Math.min(2.0, zoomFactor));

            this.zoomTargetRadius *= zoomFactor;
            this.zoomTargetRadius = clampOrbitDistance(this.zoomTargetRadius, this.minRadius, this.maxRadius);
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
                this.lastDragMoveTime = performance.now();
                this.azimuthVelocity = 0;
                this.elevationVelocity = 0;
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
                this.elevation += deltaY * sensitivity;
                this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation));

                this.lastDragMoveTime = performance.now();
                this.lastMouseX = e.touches[0].clientX;
                this.lastMouseY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dx = e.touches[1].clientX - e.touches[0].clientX;
                const dy = e.touches[1].clientY - e.touches[0].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const zoomFactor = touchStartDist / dist;
                this.zoomTargetRadius *= zoomFactor;
                this.zoomTargetRadius = clampOrbitDistance(this.zoomTargetRadius, this.minRadius, this.maxRadius);

                touchStartDist = dist;
            }
        });

        canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    setFov(fov: number): void {
        this.fov = fov;
        this.updateProjectionMatrix();
    }

    setFreeLookSensitivity(multiplier: number): void {
        if (!Number.isFinite(multiplier) || multiplier <= 0) return;
        this.freeLookSensitivity = multiplier;
    }

    update(delta: number): void {
        if (this.surfaceMode) {
            const rotation = this.surfaceRotationRate * delta;
            if (rotation !== 0) {
                const offset = new THREE.Vector3(
                    this.surfaceX - this.surfaceCenterX,
                    this.surfaceY - this.surfaceCenterY,
                    this.surfaceZ - this.surfaceCenterZ
                );
                offset.applyAxisAngle(this.surfaceRotationAxis, rotation);
                this.surfaceX = this.surfaceCenterX + offset.x;
                this.surfaceY = this.surfaceCenterY + offset.y;
                this.surfaceZ = this.surfaceCenterZ + offset.z;
            }

            if (this.surfaceRotationDamping > 0) {
                this.surfaceYaw += this.surfaceYawVelocity * delta * 60;
                this.surfacePitch += this.surfacePitchVelocity * delta * 60;
                this.surfacePitch = Math.max(-this.surfacePitchLimit, Math.min(this.surfacePitchLimit, this.surfacePitch));

                this.surfaceYawVelocity *= this.surfaceRotationDamping;
                this.surfacePitchVelocity *= this.surfaceRotationDamping;
            }

            this.updatePosition();
            return;
        }

        // Apply momentum
        if (this.freeMode) {
            if (this.freeRotationDamping <= 0) {
                this.azimuthVelocity = 0;
                this.elevationVelocity = 0;
            } else {
                this.azimuth += this.azimuthVelocity * delta * 60;
                this.elevation += this.elevationVelocity * delta * 60;
                this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation));

                this.azimuthVelocity *= this.freeRotationDamping;
                this.elevationVelocity *= this.freeRotationDamping;
            }
        } else if (this.isDragging) {
            const idleMs = performance.now() - this.lastDragMoveTime;
            if (idleMs > this.dragMomentumCutoffMs) {
                this.azimuthVelocity = 0;
                this.elevationVelocity = 0;
            }
        } else {
            this.azimuth += this.azimuthVelocity * delta * 60;
            this.elevation += this.elevationVelocity * delta * 60;
            this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation));

            // Dampen
            const damping = this.freeMode ? this.freeRotationDamping : this.orbitalRotationDamping;
            this.azimuthVelocity *= damping;
            this.elevationVelocity *= damping;
        }

        // Apply zoom by converging to a target distance so smoothing controls duration.
        this.zoomTargetRadius = clampOrbitDistance(this.zoomTargetRadius, this.minRadius, this.maxRadius);
        const zoomAlpha = smoothingAlphaFromDamping(this.orbitalZoomDamping, delta);
        this.radius += (this.zoomTargetRadius - this.radius) * zoomAlpha;
        this.radius = clampOrbitDistance(this.radius, this.minRadius, this.maxRadius);

        this.updatePosition();
    }

    private updatePosition(): void {
        if (this.surfaceMode) {
            const frame = this.getSurfaceFrame();

            const renderX = 0;
            const renderY = 0;
            const renderZ = 0;
            this.position.set(renderX, renderY, renderZ);
            this.up.copy(frame.up);
            this.lookAt(renderX + frame.forward.x, renderY + frame.forward.y, renderZ + frame.forward.z);

            this.originX = this.surfaceX;
            this.originY = this.surfaceY;
            this.originZ = this.surfaceZ;
            return;
        }

        // Direction the camera is facing
        const dirX = Math.cos(this.elevation) * Math.sin(this.azimuth);
        const dirY = Math.sin(this.elevation);
        const dirZ = Math.cos(this.elevation) * Math.cos(this.azimuth);

        if (this.freeMode) {
            const forward = new THREE.Vector3(dirX, dirY, dirZ).normalize();
            const up = new THREE.Vector3(0, 1, 0).applyAxisAngle(forward, this.roll);

            // Free mode: camera uses explicit world position and a fixed render origin
            const renderX = this.freeX - this.freeOriginX;
            const renderY = this.freeY - this.freeOriginY;
            const renderZ = this.freeZ - this.freeOriginZ;
            this.position.set(renderX, renderY, renderZ);
            this.up.copy(up);
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

        const forward = new THREE.Vector3(-x, -y, -z).normalize();
        const up = new THREE.Vector3(0, 1, 0).applyAxisAngle(forward, this.roll);

        this.position.set(x, y, z);
        this.up.copy(up);
        this.lookAt(0, 0, 0);

        // Update origin for floating origin system
        this.originX = this.focusX + x;
        this.originY = this.focusY + y;
        this.originZ = this.focusZ + z;
    }

    setDistance(distance: number): void {
        this.radius = clampOrbitDistance(distance, this.minRadius, this.maxRadius);
        this.zoomTargetRadius = this.radius;
        this.updatePosition();
    }

    getDistance(): number {
        return this.radius;
    }

    getCameraWorldPosition(): { x: number; y: number; z: number } {
        if (this.freeMode) {
            return { x: this.freeX, y: this.freeY, z: this.freeZ };
        }
        if (this.surfaceMode) {
            return { x: this.surfaceX, y: this.surfaceY, z: this.surfaceZ };
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
        this.radius = clampOrbitDistance(r, this.minRadius, this.maxRadius);
        this.azimuth = unwrapAngle(this.azimuth, Math.atan2(offset.x, offset.z));
        const clampedY = Math.max(-1, Math.min(1, offset.y / this.radius));
        this.elevation = Math.asin(clampedY);
        this.azimuthVelocity = 0;
        this.elevationVelocity = 0;
        this.zoomTargetRadius = this.radius;
        this.updatePosition();
    }

    setFreeMode(
        enabled: boolean,
        seedWorld?: { x: number; y: number; z: number },
        seedForward?: { x: number; y: number; z: number },
        seedOrigin?: { x: number; y: number; z: number }
    ): void {
        if (enabled) {
            this.surfaceMode = false;
        }
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
                this.azimuth = unwrapAngle(this.azimuth, Math.atan2(dir.x, dir.z));
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

    setSurfaceMode(
        enabled: boolean,
        options?: {
            center: { x: number; y: number; z: number };
            radius: number;
            rotationRate: number;
            axialTilt: number;
            eyeHeight?: number;
            seedWorld?: { x: number; y: number; z: number };
            seedForward?: { x: number; y: number; z: number };
        }
    ): void {
        this.surfaceMode = enabled;
        if (!enabled) {
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
            this.updatePosition();
            return;
        }

        if (options) {
            this.surfaceCenterX = options.center.x;
            this.surfaceCenterY = options.center.y;
            this.surfaceCenterZ = options.center.z;
            this.surfaceBodyRadius = Number.isFinite(options.radius) ? options.radius : this.surfaceBodyRadius;
            this.surfaceRotationRate = Number.isFinite(options.rotationRate) ? options.rotationRate : 0;
            this.surfaceRotationAxis = this.getRotationAxis(options.axialTilt);
            if (typeof options.eyeHeight === 'number') {
                this.surfaceEyeHeight = Math.max(0.1, options.eyeHeight);
            }

            const seedWorld = options.seedWorld;
            const seedForward = options.seedForward;
            const up = this.getSurfaceUp(seedWorld);
            const minDist = this.surfaceBodyRadius + this.surfaceEyeHeight;
            this.surfaceX = this.surfaceCenterX + up.x * minDist;
            this.surfaceY = this.surfaceCenterY + up.y * minDist;
            this.surfaceZ = this.surfaceCenterZ + up.z * minDist;

            if (seedForward) {
                this.applySurfaceSeedForward(seedForward, up);
            }
        }

        this.freeMode = false;
        this.isDragging = false;
        this.surfaceYawVelocity = 0;
        this.surfacePitchVelocity = 0;
        this.updatePosition();
    }

    isSurfaceMode(): boolean {
        return this.surfaceMode;
    }

    setSurfaceTarget(params: { center: { x: number; y: number; z: number }; radius: number; rotationRate: number; axialTilt: number }): void {
        const dx = params.center.x - this.surfaceCenterX;
        const dy = params.center.y - this.surfaceCenterY;
        const dz = params.center.z - this.surfaceCenterZ;
        this.surfaceX += dx;
        this.surfaceY += dy;
        this.surfaceZ += dz;
        this.surfaceCenterX = params.center.x;
        this.surfaceCenterY = params.center.y;
        this.surfaceCenterZ = params.center.z;
        this.surfaceBodyRadius = Number.isFinite(params.radius) ? params.radius : this.surfaceBodyRadius;
        this.surfaceRotationRate = Number.isFinite(params.rotationRate) ? params.rotationRate : 0;
        this.surfaceRotationAxis = this.getRotationAxis(params.axialTilt);

        const minDist = this.surfaceBodyRadius + this.surfaceEyeHeight;
        const offset = new THREE.Vector3(
            this.surfaceX - this.surfaceCenterX,
            this.surfaceY - this.surfaceCenterY,
            this.surfaceZ - this.surfaceCenterZ
        );
        if (offset.lengthSq() < 1e-6) {
            offset.set(0, 1, 0);
        }
        if (offset.length() < minDist) {
            offset.normalize().multiplyScalar(minDist);
            this.surfaceX = this.surfaceCenterX + offset.x;
            this.surfaceY = this.surfaceCenterY + offset.y;
            this.surfaceZ = this.surfaceCenterZ + offset.z;
        }
    }

    setSurfaceLookSensitivity(multiplier: number): void {
        if (!Number.isFinite(multiplier) || multiplier <= 0) return;
        this.surfaceLookSensitivity = multiplier;
    }

    setSurfaceRotationDamping(damping: number): void {
        if (!Number.isFinite(damping)) return;
        this.surfaceRotationDamping = Math.max(0, Math.min(0.999, damping));
    }

    setSurfaceEyeHeight(heightMeters: number): void {
        if (!Number.isFinite(heightMeters) || heightMeters <= 0) return;
        this.surfaceEyeHeight = heightMeters;
        if (this.surfaceMode) {
            const minDist = this.surfaceBodyRadius + this.surfaceEyeHeight;
            const offset = new THREE.Vector3(
                this.surfaceX - this.surfaceCenterX,
                this.surfaceY - this.surfaceCenterY,
                this.surfaceZ - this.surfaceCenterZ
            );
            if (offset.lengthSq() < 1e-6) {
                offset.set(0, 1, 0);
            }
            offset.normalize().multiplyScalar(minDist);
            this.surfaceX = this.surfaceCenterX + offset.x;
            this.surfaceY = this.surfaceCenterY + offset.y;
            this.surfaceZ = this.surfaceCenterZ + offset.z;
        }
    }

    moveSurface(forwardInput: number, rightInput: number, upInput: number, delta: number, speedMps: number): void {
        if (!this.surfaceMode) return;
        if (!Number.isFinite(speedMps) || speedMps <= 0) return;

        const frame = this.getSurfaceFrame();
        const move = new THREE.Vector3();
        if (forwardInput !== 0) move.addScaledVector(frame.forwardTangent, forwardInput);
        if (rightInput !== 0) move.addScaledVector(frame.right, rightInput);
        if (upInput !== 0) move.addScaledVector(frame.up, upInput);

        if (move.lengthSq() > 0) {
            move.normalize().multiplyScalar(speedMps * delta);
            this.surfaceX += move.x;
            this.surfaceY += move.y;
            this.surfaceZ += move.z;
        }

        const minDist = this.surfaceBodyRadius + this.surfaceEyeHeight;
        const offset = new THREE.Vector3(
            this.surfaceX - this.surfaceCenterX,
            this.surfaceY - this.surfaceCenterY,
            this.surfaceZ - this.surfaceCenterZ
        );
        const dist = offset.length();
        if (dist < minDist) {
            offset.normalize().multiplyScalar(minDist);
            this.surfaceX = this.surfaceCenterX + offset.x;
            this.surfaceY = this.surfaceCenterY + offset.y;
            this.surfaceZ = this.surfaceCenterZ + offset.z;
        }
    }

    private getRotationAxis(axialTilt: number): THREE.Vector3 {
        if (!Number.isFinite(axialTilt)) return new THREE.Vector3(0, 1, 0);
        const axis = new THREE.Vector3(-Math.sin(axialTilt), Math.cos(axialTilt), 0);
        if (axis.lengthSq() < 1e-6) {
            return new THREE.Vector3(0, 1, 0);
        }
        return axis.normalize();
    }

    private getSurfaceUp(seedWorld?: { x: number; y: number; z: number }): THREE.Vector3 {
        if (seedWorld) {
            const up = new THREE.Vector3(
                seedWorld.x - this.surfaceCenterX,
                seedWorld.y - this.surfaceCenterY,
                seedWorld.z - this.surfaceCenterZ
            );
            if (up.lengthSq() > 1e-6) {
                return up.normalize();
            }
        }
        return new THREE.Vector3(0, 1, 0);
    }

    private applySurfaceSeedForward(seedForward: { x: number; y: number; z: number }, up: THREE.Vector3): void {
        const forward = new THREE.Vector3(seedForward.x, seedForward.y, seedForward.z).normalize();
        const upDot = forward.dot(up);
        const pitch = Math.asin(Math.max(-1, Math.min(1, upDot)));
        const tangent = forward.clone().sub(up.clone().multiplyScalar(upDot));

        if (tangent.lengthSq() < 1e-6) {
            this.surfacePitch = Math.max(-this.surfacePitchLimit, Math.min(this.surfacePitchLimit, pitch));
            return;
        }

        const frame = this.getSurfaceFrameFromUp(up);
        const east = frame.east;
        const north = frame.north;
        const tanNorm = tangent.normalize();
        this.surfaceYaw = Math.atan2(tanNorm.dot(east), tanNorm.dot(north));
        this.surfacePitch = Math.max(-this.surfacePitchLimit, Math.min(this.surfacePitchLimit, pitch));
    }

    private getSurfaceFrameFromUp(up: THREE.Vector3): { up: THREE.Vector3; east: THREE.Vector3; north: THREE.Vector3 } {
        const east = new THREE.Vector3().crossVectors(this.surfaceRotationAxis, up);
        if (east.lengthSq() < 1e-6) {
            east.set(1, 0, 0).cross(up);
            if (east.lengthSq() < 1e-6) {
                east.set(0, 0, 1).cross(up);
            }
        }
        east.normalize();
        const north = new THREE.Vector3().crossVectors(up, east).normalize();
        return { up, east, north };
    }

    private getSurfaceFrame(): {
        up: THREE.Vector3;
        east: THREE.Vector3;
        north: THREE.Vector3;
        forward: THREE.Vector3;
        forwardTangent: THREE.Vector3;
        right: THREE.Vector3;
    } {
        const up = new THREE.Vector3(
            this.surfaceX - this.surfaceCenterX,
            this.surfaceY - this.surfaceCenterY,
            this.surfaceZ - this.surfaceCenterZ
        );
        if (up.lengthSq() < 1e-6) {
            up.set(0, 1, 0);
        } else {
            up.normalize();
        }

        const basis = this.getSurfaceFrameFromUp(up);
        const yawCos = Math.cos(this.surfaceYaw);
        const yawSin = Math.sin(this.surfaceYaw);
        const forwardTangent = new THREE.Vector3()
            .addScaledVector(basis.north, yawCos)
            .addScaledVector(basis.east, yawSin)
            .normalize();

        const right = new THREE.Vector3().crossVectors(forwardTangent, basis.up).normalize();
        const forward = new THREE.Vector3()
            .addScaledVector(forwardTangent, Math.cos(this.surfacePitch))
            .addScaledVector(basis.up, Math.sin(this.surfacePitch))
            .normalize();

        return {
            up: basis.up,
            east: basis.east,
            north: basis.north,
            forward,
            forwardTangent,
            right,
        };
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

    nudgeOrbit(deltaAzimuth: number, deltaElevation: number): void {
        if (this.freeMode) return;
        if (!Number.isFinite(deltaAzimuth) || !Number.isFinite(deltaElevation)) return;
        this.azimuth += deltaAzimuth;
        this.elevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.elevation + deltaElevation));
    }

    nudgeRoll(deltaRoll: number): void {
        if (!Number.isFinite(deltaRoll)) return;
        this.roll += deltaRoll;
    }

    nudgeOrbitZoom(multiplier: number): void {
        if (this.freeMode) return;
        if (!Number.isFinite(multiplier) || multiplier <= 0) return;
        this.zoomTargetRadius *= multiplier;
        this.zoomTargetRadius = clampOrbitDistance(this.zoomTargetRadius, this.minRadius, this.maxRadius);
    }

    setFreeRotationDamping(damping: number): void {
        if (!Number.isFinite(damping)) return;
        this.freeRotationDamping = Math.max(0, Math.min(0.999, damping));
    }

    setOrbitalRotationDamping(damping: number): void {
        if (!Number.isFinite(damping)) return;
        this.orbitalRotationDamping = Math.max(0, Math.min(0.999, damping));
    }

    setOrbitalZoomDamping(damping: number): void {
        if (!Number.isFinite(damping)) return;
        this.orbitalZoomDamping = Math.max(0, Math.min(0.999, damping));
    }

    setMinimumOrbitDistance(distance: number): void {
        if (!Number.isFinite(distance) || distance <= 0) return;
        this.minRadius = Math.min(distance, this.maxRadius);
        this.radius = Math.max(this.radius, this.minRadius);
        this.zoomTargetRadius = Math.max(this.zoomTargetRadius, this.minRadius);
        this.updatePosition();
    }

    setTrackedBodyRadius(radius: number): void {
        this.setMinimumOrbitDistance(bodySafeOrbitDistance(radius));
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

    /**
     * Configure camera for different simulation scales.
     * 'solar' = default solar system scale (~1000 AU max)
     * 'galactic' = star cluster scale (~1000 parsecs max)
     */
    configureForScale(scale: 'solar' | 'galactic'): void {
        const PARSEC = 3.086e16;  // meters
        
        if (scale === 'galactic') {
            // Star clusters can span hundreds of parsecs
            this.maxRadius = 1000 * PARSEC;  // 1000 parsecs
            this.far = 1e20;  // Render up to ~3000 parsecs
            this.updateProjectionMatrix();
        } else {
            // Solar system scale
            this.maxRadius = 1e15;  // ~1000 AU
            this.far = 1e15;
            this.updateProjectionMatrix();
        }
    }

    /** Set initial camera distance, bypassing maxRadius clamp during initialization */
    setInitialDistance(distance: number): void {
        // Temporarily allow any distance for initial setup
        const savedMax = this.maxRadius;
        this.maxRadius = Math.max(this.maxRadius, distance);
        this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, distance));
        this.zoomTargetRadius = this.radius;
        this.maxRadius = savedMax;
        this.updatePosition();
    }
}
