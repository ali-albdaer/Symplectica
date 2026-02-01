import { CameraControls } from './CameraControls.js';
import { SIM } from '../utils/Constants.js';

export class InputManager {
    constructor(renderEngine, stateManager, uiManager) {
        this.renderEngine = renderEngine;
        this.stateManager = stateManager;
        this.uiManager = uiManager;
        
        this.controls = new CameraControls(renderEngine);
        
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        
        this.mode = 'EDIT'; // Start in edit mode
        this.controls.setMode('EDIT');
        this.renderEngine.cameraPhysPos.set(0, 2e11, 1e10); // Start high up

        this.draggedBody = null;
        this.hoverBody = null; // ID

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        const canvas = this.renderEngine.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        
        // Pointer lock change
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                // Locked
            } else {
                // Unlocked - if we were in FREE mode, maybe pause or show menu? 
                // Don't auto-switch mode, just stop looking.
            }
        });
    }

    update(dt) {
        this.controls.update(dt, { keys: this.keys });
        
        // Dragging Logic in Edit Mode
        if (this.mode === 'EDIT' && this.draggedBody && this.mouse.down) {
            this.dragBody();
        }
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
        
        if (e.code === 'KeyV') { 
            this.toggleMode(); 
        }
        if (e.code === 'KeyH') {
            // Toggle UI
            const ui = document.getElementById('ui-layer');
            ui.classList.toggle('hidden');
        }
        if (e.code === 'KeyT') {
            this.stateManager.emit('toggle-pause');
        }
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
    }

    toggleMode() {
        const canvas = this.renderEngine.renderer.domElement;
        
        if (this.mode === 'EDIT') {
            this.mode = 'FREE';
            this.controls.setMode('FREE');
            canvas.requestPointerLock();
            this.uiManager.setMode('FREE');
        } else {
            this.mode = 'EDIT';
            this.controls.setMode('EDIT');
            document.exitPointerLock();
            this.uiManager.setMode('EDIT');
        }
    }

    onMouseDown(e) {
        this.mouse.down = true;
        
        if (this.mode === 'FREE') {
            const canvas = this.renderEngine.renderer.domElement;
            if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
            }
            return;
        }

        // EDIT MODE: Selection / Dragging
        // 1. Raycast into scene
        const ray = this.getRay(e.clientX, e.clientY);
        
        // 2. Find intersection with bodies
        let closestDist = Infinity;
        let closestBody = null;
        
        // Simple sphere intersection for selection
        // Ray origin R0, dir D. Sphere center C, radius R.
        // |X - C|^2 = R^2 => |(R0 + tD) - C|^2 = R^2
        // Let L = C - R0.  t^2 - 2(L.D)t + |L|^2 - R^2 = 0
        
        for (const body of this.stateManager.bodies) {
            // Intersection math
            // Since we render relative to physics pos, we do math in world space.
            const L = { x: body.pos.x - ray.origin.x, y: body.pos.y - ray.origin.y, z: body.pos.z - ray.origin.z };
            const tca = L.x*ray.direction.x + L.y*ray.direction.y + L.z*ray.direction.z;
            
            // Assume spherical hit area is generous for small objects so we can click them
            const renderScale = 1e-6; // matches Visuals.js
            // We can check screen space dist too, but let's stick to world space
            const d2 = (L.x*L.x + L.y*L.y + L.z*L.z) - tca*tca;
            const radius = Math.max(body.radius, 2000 / renderScale); // Min click size: 2000km equiv
            
            if (d2 > radius*radius) continue; 
            
            if (tca < closestDist && tca > 0) {
                closestDist = tca;
                closestBody = body;
            }
        }
        
        if (closestBody) {
            this.draggedBody = closestBody;
            console.log("Selected:", closestBody.name);
            // Optionally open inspector
        } else {
            // Spawn? Checked by UI button currently.
        }
    }

    onMouseUp(e) {
        this.mouse.down = false;
        this.draggedBody = null;
    }

    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        if (this.mode === 'FREE') {
            if (document.pointerLockElement) {
                this.controls.handleMouseMove(e.movementX, e.movementY);
            }
        } else {
            // Edit Mode Hover logic?
        }
    }
    
    onWheel(e) {
        this.controls.handleZoom(e.deltaY);
    }
    
    getRay(clientX, clientY) {
         return this.renderEngine.getRayFromScreen(clientX, clientY);
    }

    dragBody() {
        if (!this.draggedBody) return;
        
        // Planar drag on the plane of the body's current Y (or XZ plane)
        // Raycast against Plane Y = draggedBody.pos.y
        
        const ray = this.getRay(this.mouse.x, this.mouse.y);
        // Plane equation: y = C. Normal = (0,1,0).
        // t = (C - O.y) / D.y
        
        const planeY = 0; // Force drag on Ecliptic for simplicity as per "plane orientation" in prompt
        
        const t = (planeY - ray.origin.y) / ray.direction.y;
        
        if (t > 0) {
            this.draggedBody.pos.x = ray.origin.x + ray.direction.x * t;
            this.draggedBody.pos.z = ray.origin.z + ray.direction.z * t;
            // Keep Y? Or snap to 0? let's snap to 0 for "Defined Plane" req
            this.draggedBody.pos.y = 0; 
            
            // Reset velocity if dragging?
            this.draggedBody.vel.set(0,0,0);
        }
    }
}