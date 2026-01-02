import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { getConfig } from "../config.js";

export class PlayerController {
    constructor({ body, camera, input, physics, renderScale }) {
        this.body = body;
        this.camera = camera;
        this.input = input;
        this.physics = physics;
        this.renderScale = renderScale;
        this.mode = "walk";
        this.cameraMode = "first";
        this.yaw = 0;
        this.pitch = 0;
        this.maxPitch = THREE.MathUtils.degToRad(89);
        this.groundBody = null;
        this.thirdPersonTarget = new THREE.Object3D();
        this.cameraSmooth = 0.12;
        this.cameraVelocity = new THREE.Vector3();
        this.attachments = new Map();
        this.heldObject = null;
        this.heldDistance = 2;
        this.flightMomentum = new THREE.Vector3();
    }

    toggleFlight() {
        this.mode = this.mode === "walk" ? "flight" : "walk";
    }

    toggleCamera() {
        this.cameraMode = this.cameraMode === "first" ? "third" : "first";
    }

    updateCameraOrientation(deltaMouse) {
        const sensitivity = this.cameraMode === "third" ? 0.0012 : 0.0015;
        this.yaw -= deltaMouse.x * sensitivity;
        this.pitch -= deltaMouse.y * sensitivity;
        this.pitch = THREE.MathUtils.clamp(this.pitch, -this.maxPitch, this.maxPitch);
    }

    getForwardVector() {
        const forward = new THREE.Vector3(
            Math.cos(this.pitch) * Math.sin(this.yaw),
            Math.sin(this.pitch),
            Math.cos(this.pitch) * Math.cos(this.yaw)
        );
        return forward.normalize();
    }

    getRightVector(forward) {
        const up = new THREE.Vector3(0, 1, 0);
        return new THREE.Vector3().crossVectors(forward, up).normalize();
    }

    detectGround(celestialBodies) {
        let closest = null;
        let minDistance = Infinity;
        for (const body of celestialBodies) {
            if (body === this.body || body.type === "star") {
                continue;
            }
            const distance = body.position.distanceTo(this.body.position) - body.radius;
            if (distance < minDistance) {
                minDistance = distance;
                closest = body;
            }
        }
        this.groundBody = closest;
        return { body: closest, distance: minDistance };
    }

    applyMovement(timeData, celestialBodies) {
        const { deltaReal, deltaSim } = timeData;
        const config = getConfig();
        const { walkSpeed, sprintMultiplier, flightSpeed, flightBoostMultiplier, jumpImpulse } = config.player;
        const deltaMouse = this.input.consumeMouseDelta();
        if (this.input.pointerLocked) {
            this.updateCameraOrientation(deltaMouse);
        }

        const forward = this.getForwardVector();
        const right = this.getRightVector(forward);

        const upVector = new THREE.Vector3(0, 1, 0);
        if (this.mode === "walk") {
            const { body: groundBody, distance } = this.detectGround(celestialBodies);
            if (groundBody) {
                const surfaceNormal = this.body.position.clone().sub(groundBody.position).normalize();
                upVector.copy(surfaceNormal);
                const tangentForward = projectOntoPlane(forward, surfaceNormal);
                const tangentRight = new THREE.Vector3().crossVectors(surfaceNormal, tangentForward).normalize();
                const isSprinting = this.input.isKeyDown("shift");
                const speed = isSprinting ? walkSpeed * sprintMultiplier : walkSpeed;
                const moveDirection = new THREE.Vector3();
                if (this.input.isKeyDown("w")) {
                    moveDirection.add(tangentForward);
                }
                if (this.input.isKeyDown("s")) {
                    moveDirection.sub(tangentForward);
                }
                if (this.input.isKeyDown("a")) {
                    moveDirection.sub(tangentRight);
                }
                if (this.input.isKeyDown("d")) {
                    moveDirection.add(tangentRight);
                }
                if (moveDirection.lengthSq() > 0) {
                    moveDirection.normalize().multiplyScalar(speed);
                    const desiredVelocity = moveDirection;
                    const currentVelocity = projectOntoPlane(this.body.velocity, surfaceNormal);
                    const change = desiredVelocity.sub(currentVelocity);
                    this.body.applyForce(change.multiplyScalar(this.body.mass / Math.max(deltaSim, 1e-3)));
                }
                if (distance > 1.5) {
                    this.body.applyForce(surfaceNormal.clone().multiplyScalar(-this.body.mass * 15));
                }
                if (distance < 0.4) {
                    const normalForce = surfaceNormal.clone().multiplyScalar(this.body.mass * 25);
                    this.body.applyForce(normalForce);
                    if (this.input.isKeyDown(" ")) {
                        const jumpForce = surfaceNormal.clone().multiplyScalar(this.body.mass * jumpImpulse / Math.max(deltaSim, 1e-3));
                        this.body.applyForce(jumpForce);
                    }
                }
            }
        } else {
            const boost = this.input.isKeyDown("control") ? flightBoostMultiplier : 1;
            const moveDirection = new THREE.Vector3();
            if (this.input.isKeyDown("w")) moveDirection.add(forward);
            if (this.input.isKeyDown("s")) moveDirection.sub(forward);
            if (this.input.isKeyDown("a")) moveDirection.sub(right);
            if (this.input.isKeyDown("d")) moveDirection.add(right);
            if (this.input.isKeyDown(" ")) moveDirection.add(upVector);
            if (this.input.isKeyDown("shift")) moveDirection.sub(upVector);
            if (moveDirection.lengthSq() > 0) {
                moveDirection.normalize();
                const targetVelocity = moveDirection.multiplyScalar(flightSpeed * boost);
                const deltaVelocity = targetVelocity.sub(this.body.velocity.clone());
                this.body.applyForce(deltaVelocity.multiplyScalar(this.body.mass / Math.max(deltaSim, 1e-3)));
            }
        }

        this.updateCameraPosition(upVector, deltaReal);
    }

    updateCameraPosition(upVector, dt) {
        const config = getConfig();
        const { cameraThirdPersonOffset } = config.player;
        const eyeOffset = upVector.clone().multiplyScalar(config.player.height * 0.9);
        const eyePhysical = this.body.position.clone().add(eyeOffset);
        if (this.cameraMode === "first") {
            this.camera.position.copy(eyePhysical.clone().multiplyScalar(this.renderScale));
        } else {
            const offset = new THREE.Vector3(cameraThirdPersonOffset.x, cameraThirdPersonOffset.y, cameraThirdPersonOffset.z);
            const rotation = new THREE.Matrix4().lookAt(
                new THREE.Vector3(0, 0, 0),
                this.getForwardVector(),
                upVector
            );
            const transformedOffset = offset.clone().applyMatrix4(rotation);
            const targetPhysical = this.body.position.clone().add(upVector.clone().multiplyScalar(1.2)).add(transformedOffset);
            const targetRender = targetPhysical.clone().multiplyScalar(this.renderScale);
            this.camera.position.lerp(targetRender, this.cameraSmooth);
        }
        const lookTarget = this.body.position.clone().add(this.getForwardVector().clone().multiplyScalar(10));
        this.camera.lookAt(lookTarget.clone().multiplyScalar(this.renderScale));
    }

    handleInteractions(objects) {
        if (!this.input.pointerLocked) {
            return;
        }
        if (this.heldObject && !this.input.isKeyDown("mouse2")) {
            this.releaseHeldObject();
        }
        if (!this.heldObject && this.input.isKeyDown("mouse2")) {
            const target = this.raycastPickup(objects);
            if (target) {
                this.holdObject(target);
            }
        }
        if (this.heldObject) {
            const eyePhysical = this.body.position.clone().add(new THREE.Vector3(0, 1, 0).multiplyScalar(getConfig().player.height * 0.9));
            const targetPosition = eyePhysical.add(this.getForwardVector().clone().multiplyScalar(this.heldDistance));
            const current = this.heldObject.position.clone();
            const delta = targetPosition.sub(current);
            const force = delta.multiplyScalar(this.heldObject.mass * 15);
            this.heldObject.applyForce(force);
        }
    }

    raycastPickup(objects) {
        if (!objects.length) {
            return null;
        }
        const playerPosition = this.body.position.clone();
        const intersections = objects
            .map((body) => ({ body, distance: body.position.distanceTo(playerPosition) }))
            .filter((entry) => entry.distance < 4.5)
            .sort((a, b) => a.distance - b.distance);
        return intersections.length ? intersections[0].body : null;
    }

    holdObject(body) {
        this.heldObject = body;
    }

    releaseHeldObject() {
        this.heldObject = null;
    }
}

function projectOntoPlane(vector, normal) {
    const projection = vector.clone().sub(normal.clone().multiplyScalar(vector.dot(normal)));
    if (projection.lengthSq() < 1e-6) {
        return new THREE.Vector3();
    }
    return projection.normalize();
}
