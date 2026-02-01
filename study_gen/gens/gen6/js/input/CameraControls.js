import { Vec3 } from '../utils/MathUtils.js';
import { SIM } from '../utils/Constants.js';

export class CameraControls {
    constructor(renderEngine) {
        this.renderEngine = renderEngine; // We manipulate renderEngine.cameraPhysPos and renderEngine.camera.quaternion
        this.mode = 'EDIT'; // 'EDIT' or 'FREE'
        
        // Movement Speed (m/s) - Base speed, can be multiplied by shift
        this.baseSpeed = 1e9; // 1 million km / s default for space travel
        this.speed = this.baseSpeed;
        
        this.euler = { x: 0, y: 0 }; // Pitch, Yaw for Free View
    }

    setMode(mode) {
        this.mode = mode;
        if (mode === 'EDIT') {
            // Reset rotation to look down? Or keep it?
            // Prompt says: "Top-down orthographic view by default" (but we using Perspective for both for simplicity unless we switch cams)
            // Let's reset camera rotation to look down -Z or -Y
            this.renderEngine.camera.rotation.set(-Math.PI / 2, 0, 0); // Look down Y axis
            this.renderEngine.camera.position.set(0, 0, 0);
            this.euler.x = -Math.PI / 2;
            this.euler.y = 0;
        } else {
             this.renderEngine.camera.rotation.set(0, 0, 0);
             this.euler.x = 0;
             this.euler.y = 0;
        }
    }

    update(dt, inputState) {
        // Boost speed
        const speedMult = inputState.keys['ShiftLeft'] ? 10.0 : (inputState.keys['ControlLeft'] ? 0.1 : 1.0);
        let moveSpeed = this.speed * speedMult * dt;

        // Render Scale Factor required to make movement feel right compared to visual scale?
        // Actually, our cameraPhysPos is in Real Units (Meters).
        // So baseSpeed 1e9 means 1 million km per second.
        
        // Adapt speed based on altitude/zoom?
        // Basic implementation first.

        const forward = new Vec3(0,0,0);
        const right = new Vec3(0,0,0);
        const up = new Vec3(0,0,0);

        // Get Camera direction vectors from Three.js camera
        const cam = this.renderEngine.camera;
        const threeForward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
        const threeRight = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
        const threeUp = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);

        if (this.mode === 'FREE') {
            // WASD moves relative to camera look
             if (inputState.keys['KeyW']) forward.add({x: threeForward.x, y: threeForward.y, z: threeForward.z});
             if (inputState.keys['KeyS']) forward.sub({x: threeForward.x, y: threeForward.y, z: threeForward.z});
             if (inputState.keys['KeyD']) right.add({x: threeRight.x, y: threeRight.y, z: threeRight.z});
             if (inputState.keys['KeyA']) right.sub({x: threeRight.x, y: threeRight.y, z: threeRight.z});
             if (inputState.keys['Space']) up.add({x: 0, y: 1, z: 0}); // Global Up
             if (inputState.keys['ShiftRight']) up.sub({x: 0, y: 1, z: 0}); // Global Down
        } else {
            // EDIT MODE: Top down pannning.
            // W/S moves along Z (Up/Down on screen)
            // A/D moves along X (Left/Right on screen)
            // Zoom via scroll handled elsewhere usually, but let's allow Q/E for zoom (Y axis movement)
            
            // Actually, in Top Down (looking -Y), Screen Up is -Z, Screen Right is +X
            if (inputState.keys['KeyW']) forward.add({x: 0, y: 0, z: -1});
            if (inputState.keys['KeyS']) forward.add({x: 0, y: 0, z: 1});
            if (inputState.keys['KeyA']) right.add({x: -1, y: 0, z: 0});
            if (inputState.keys['KeyD']) right.add({x: 1, y: 0, z: 0});
            
            // Zoom in/out via Scroll is standard, handled in InputManager events.
            // But we can add keys.
        }

        // Apply movement
        // Normalize?
        
        const move = new Vec3(0,0,0);
        move.add(forward).add(right).add(up);

        if (move.lengthSq() > 0) {
            // move.normalize().multiplyScalar(moveSpeed); // Manual normalize if needed
            move.multiplyScalar(moveSpeed);
            this.renderEngine.cameraPhysPos.add(move);
        }
    }

    handleMouseMove(mx, my) {
        if (this.mode === 'FREE') {
            const sensitivity = 0.002;
            this.euler.y -= mx * sensitivity;
            this.euler.x -= my * sensitivity;
            
            // Clamp pitch
            this.euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.euler.x));
            
            // Apply to ThreeJS Camera
            const q = new THREE.Quaternion();
            q.setFromEuler(new THREE.Euler(this.euler.x, this.euler.y, 0, 'YXZ'));
            this.renderEngine.camera.quaternion.copy(q);
        }
    }
    
    handleZoom(deltaY) {
         // In edit mode, change Y height
         if (this.mode === 'EDIT') {
             const zoomSpeed = this.renderEngine.cameraPhysPos.y * 0.1; // Proportional zoom
             this.renderEngine.cameraPhysPos.y += deltaY * 0.01 * (Math.abs(this.renderEngine.cameraPhysPos.y) + 1000); // 
             
             // Clamp min height
             if (this.renderEngine.cameraPhysPos.y < 1000) this.renderEngine.cameraPhysPos.y = 1000;
         }
    }
}
import * as THREE from 'three';