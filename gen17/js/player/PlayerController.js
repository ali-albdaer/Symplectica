import { ConfigManager } from "../core/ConfigManager.js";
import { EventBus } from "../core/EventBus.js";
import { threeFromCannon, normalizeSafe, lerpVector } from "../utils/MathUtils.js";

const THREE_REF = () => window.THREE;
const CANNON_REF = () => window.CANNON;

export class PlayerController {
    constructor(sceneManager, physicsSystem, configManager, eventBus, logger) {
        if (!(configManager instanceof ConfigManager)) {
            throw new Error("PlayerController requires ConfigManager");
        }
        if (!(eventBus instanceof EventBus)) {
            throw new Error("PlayerController requires EventBus");
        }
        this.scene = sceneManager;
        this.physics = physicsSystem;
        this.config = configManager;
        this.bus = eventBus;
        this.logger = logger;

        this.mode = "walk";
        this.cameraMode = "first";
        this.pointerLocked = false;
        this.mouseSensitivity = 0.0025;
        this.rotation = { yaw: 0, pitch: 0, roll: 0 };
        this.keys = new Set();
        this.heldEntity = null;
        this.playerUp = new (THREE_REF().Vector3)(0, 1, 0);
        this.currentGravityTarget = null;
        this.cameraCurrentOffset = new (THREE_REF().Vector3)(0, 1.7, 0);
        this.cameraTargetOffset = this.cameraCurrentOffset.clone();
        this.interactables = [];

        const spawn = this.computeInitialSpawn();
        this.createPhysicsBody(spawn);
        this.setupCameraRig();
        this.registerEvents();
    }

    computeInitialSpawn() {
        const planet = this.config.get("bodies.planets")[0];
        const radius = planet.radius + 1.8;
        return new (THREE_REF().Vector3)(planet.position.x, planet.position.y + radius, planet.position.z);
    }

    createPhysicsBody(spawnVec) {
        const CANNON = CANNON_REF();
        this.body = new CANNON.Body({
            mass: 90,
            shape: new CANNON.Sphere(0.9),
            position: new CANNON.Vec3(spawnVec.x, spawnVec.y, spawnVec.z)
        });
        this.body.linearDamping = 0.2;
        this.body.angularDamping = 0.4;
        this.physics.addBody("player", this.body, { affectsGravity: false, receivesGravity: true, userData: { type: "player" } });
        const THREE = THREE_REF();
        this.frame = new THREE.Object3D();
        this.frame.position.copy(spawnVec);
        this.scene.worldRoot.add(this.frame);
    }

    setupCameraRig() {
        const THREE = THREE_REF();
        this.camera = this.scene.camera;
        this.camera.parent?.remove(this.camera);
        this.camera.position.set(0, 1.7, 0);
        this.scene.scene.add(this.camera);
        this.cameraLookAt = new THREE.Vector3();
    }

    registerEvents() {
        document.addEventListener("pointerlockchange", () => this.onPointerLockChange());
        window.addEventListener("keydown", (event) => this.onKeyDown(event));
        window.addEventListener("keyup", (event) => this.onKeyUp(event));
        window.addEventListener("mousemove", (event) => this.onMouseMove(event));
        window.addEventListener("mousedown", (event) => this.onMouseDown(event));
        window.addEventListener("mouseup", (event) => this.onMouseUp(event));
        window.addEventListener("contextmenu", (event) => event.preventDefault());
        document.body.addEventListener("click", () => {
            if (!this.pointerLocked && this.config.get("controls.pointerLock")) {
                this.requestPointerLock();
            }
        });

        this.bus.on("ui:devConsole:open", () => this.releasePointerLock());
        this.bus.on("ui:devConsole:close", () => {
            if (this.config.get("controls.pointerLock")) {
                this.requestPointerLock();
            }
        });
    }

    setInteractableEntities(entities) {
        this.interactables = entities;
    }

    onPointerLockChange() {
        this.pointerLocked = document.pointerLockElement === document.body;
    }

    onKeyDown(event) {
        if (event.repeat) {
            return;
        }
        switch (event.code) {
            case "KeyF":
                this.toggleMode();
                return;
            case "KeyV":
                this.toggleCameraMode();
                return;
            case "Slash":
                this.bus.emit("ui:devConsole:toggle");
                return;
            case "Space":
                if (this.mode === "walk" && this.isGrounded) {
                    this.jump();
                }
                break;
            default:
                break;
        }
        this.keys.add(event.code);
    }

    onKeyUp(event) {
        this.keys.delete(event.code);
    }

    onMouseMove(event) {
        if (!this.pointerLocked) {
            return;
        }
        this.rotation.yaw -= event.movementX * this.mouseSensitivity;
        this.rotation.pitch -= event.movementY * this.mouseSensitivity;
        const pitchLimit = Math.PI / 2 - 0.01;
        this.rotation.pitch = Math.max(-pitchLimit, Math.min(pitchLimit, this.rotation.pitch));
    }

    onMouseDown(event) {
        if (event.button === 2) {
            this.tryGrab();
        }
    }

    onMouseUp(event) {
        if (event.button === 2) {
            this.releaseGrab();
        }
    }

    requestPointerLock() {
        document.body.requestPointerLock?.();
    }

    releasePointerLock() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    toggleMode() {
        this.mode = this.mode === "walk" ? "flight" : "walk";
        this.logger?.info?.(`Player mode switched to ${this.mode}`);
    }

    toggleCameraMode() {
        this.cameraMode = this.cameraMode === "first" ? "third" : "first";
        const THREE = THREE_REF();
        const firstOffset = new THREE.Vector3(0, 1.7, 0.05);
        const thirdOffset = new THREE.Vector3(0, 3.5, 10.5);
        this.cameraTargetOffset = this.cameraMode === "first" ? firstOffset : thirdOffset;
        this.logger?.info?.(`Camera mode: ${this.cameraMode}`);
    }

    jump() {
        const up = this.playerUp.clone();
        const impulseStrength = this.config.get("controls.jumpImpulse");
        const impulse = new (CANNON_REF().Vec3)(up.x * impulseStrength, up.y * impulseStrength, up.z * impulseStrength);
        this.body.applyImpulse(impulse);
    }

    tryGrab() {
        if (!this.interactables.length || this.heldEntity) {
            return;
        }
        const THREE = THREE_REF();
        const cameraPos = this.camera.position.clone();
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
        const reach = this.config.get("controls.grabReach");
        let best = null;
        let bestDist = Infinity;
        this.interactables.forEach((entity) => {
            const toEntity = entity.mesh.position.clone().sub(cameraPos);
            const projection = toEntity.dot(forward);
            if (projection < 0 || projection > reach) {
                return;
            }
            const rejection = toEntity.clone().addScaledVector(forward, -projection);
            if (rejection.length() < entity.config.radius * 1.5 && projection < bestDist) {
                best = entity;
                bestDist = projection;
            }
        });
        if (best) {
            this.heldEntity = { entity: best, distance: Math.max(1.2, bestDist) };
            this.logger?.info?.(`Grabbing ${best.id}`);
        }
    }

    releaseGrab() {
        if (!this.heldEntity) {
            return;
        }
        this.logger?.info?.(`Released ${this.heldEntity.entity.id}`);
        this.heldEntity = null;
    }

    updateGrabbed(delta) {
        if (!this.heldEntity) {
            return;
        }
        const CANNON = CANNON_REF();
        const THREE = THREE_REF();
        const { entity, distance } = this.heldEntity;
        const cameraPos = this.camera.position.clone();
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
        const target = cameraPos.add(forward.multiplyScalar(distance));
        const bodyPos = threeFromCannon(entity.body.position);
        const offset = target.sub(bodyPos);
        const strength = this.config.get("controls.grabStrength");
        const force = new CANNON.Vec3(offset.x * strength, offset.y * strength, offset.z * strength);
        entity.body.velocity.scale(0.7, entity.body.velocity);
        entity.body.applyForce(force);
    }

    update(delta) {
        this.syncFrame();
        this.applyMovement(delta);
        this.updateCamera(delta);
        this.updateGrabbed(delta);
    }

    syncFrame() {
        const THREE = THREE_REF();
        const position = threeFromCannon(this.body.position);
        this.frame.position.copy(position);
        this.updateGravityTarget(position);
        if (!this.currentGravityTarget) {
            return;
        }
        const gravityDir = this.currentGravityTarget.position.clone().sub(position);
        const up = gravityDir.clone().multiplyScalar(-1);
        normalizeSafe(up);
        this.playerUp.copy(up);
    }

    updateGravityTarget(position) {
        const THREE = THREE_REF();
        let closest = null;
        let minDist = Infinity;
        this.physics.forEachBody((_id, record) => {
            const entity = record.userData;
            if (!entity || ["sun", "planet", "moon"].indexOf(entity.type) === -1) {
                return;
            }
            const bodyPos = threeFromCannon(record.body.position);
            const distance = bodyPos.distanceTo(position);
            if (distance < minDist) {
                minDist = distance;
                closest = {
                    id: entity.id,
                    distance,
                    radius: entity.config.radius,
                    position: bodyPos
                };
            }
        });
        this.currentGravityTarget = closest;
        if (!closest) {
            this.isGrounded = false;
            return;
        }
        const surfaceDistance = closest.distance - closest.radius;
        const alignRadius = this.config.get("controls.gravityAlignRadius");
        this.isGrounded = surfaceDistance < 0.6;
        this.shouldAlign = surfaceDistance < alignRadius;
    }

    applyMovement(delta) {
        const THREE = THREE_REF();
        if (!this.currentGravityTarget) {
            return;
        }
        const gravityDir = this.currentGravityTarget.position.clone().sub(this.frame.position).normalize();
        if (this.mode === "walk" && !this.shouldAlign) {
            this.mode = "flight";
        }
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        const orientation = this.computeOrientation();
        forward.applyQuaternion(orientation);
        right.applyQuaternion(orientation);
        if (this.mode === "walk") {
            this.applyWalkMovement(delta, forward, right, gravityDir);
        } else {
            this.applyFlightMovement(delta, forward, right);
        }
    }

    applyWalkMovement(delta, forward, right, gravityDir) {
        const THREE = THREE_REF();
        const move = new THREE.Vector3();
        const planarForward = forward.clone().projectOnPlane(gravityDir).normalize();
        const planarRight = right.clone().projectOnPlane(gravityDir).normalize();
        if (this.keys.has("KeyW")) move.add(planarForward);
        if (this.keys.has("KeyS")) move.sub(planarForward);
        if (this.keys.has("KeyD")) move.add(planarRight);
        if (this.keys.has("KeyA")) move.sub(planarRight);
        if (move.lengthSq() > 0) {
            move.normalize();
            const speedCfg = this.config.get("controls.walkSpeed");
            const sprint = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
            const speed = speedCfg * (sprint ? this.config.get("controls.sprintMultiplier") : 1);
            move.multiplyScalar(speed);
            const desired = move;
            const velocity = threeFromCannon(this.body.velocity);
            const normalComponent = gravityDir.clone().multiplyScalar(velocity.dot(gravityDir));
            velocity.sub(normalComponent);
            const deltaVel = desired.sub(velocity);
            const mass = this.body.mass;
            const impulse = new (CANNON_REF().Vec3)(deltaVel.x * mass * delta, deltaVel.y * mass * delta, deltaVel.z * mass * delta);
            this.body.applyImpulse(impulse);
        }
    }

    applyFlightMovement(delta, forward, right) {
        const THREE = THREE_REF();
        const up = this.playerUp.clone();
        const move = new THREE.Vector3();
        if (this.keys.has("KeyW")) move.add(forward);
        if (this.keys.has("KeyS")) move.sub(forward);
        if (this.keys.has("KeyD")) move.add(right);
        if (this.keys.has("KeyA")) move.sub(right);
        if (this.keys.has("Space")) move.add(up);
        if (this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")) move.sub(up);
        if (move.lengthSq() > 0) {
            move.normalize();
            const boost = this.keys.has("KeyR") ? this.config.get("controls.flyBoostMultiplier") : 1;
            const speed = this.config.get("controls.flySpeed") * boost;
            move.multiplyScalar(speed);
            const desired = move;
            const velocity = threeFromCannon(this.body.velocity);
            const deltaVel = desired.sub(velocity);
            const impulse = new (CANNON_REF().Vec3)(deltaVel.x * this.body.mass * delta, deltaVel.y * this.body.mass * delta, deltaVel.z * this.body.mass * delta);
            this.body.applyImpulse(impulse);
        }
        if (this.keys.has("KeyE")) {
            this.rotation.roll += delta * 1.2;
        }
        if (this.keys.has("KeyQ")) {
            this.rotation.roll -= delta * 1.2;
        }
        this.rotation.roll = Math.max(-Math.PI, Math.min(Math.PI, this.rotation.roll));
    }

    computeOrientation() {
        const THREE = THREE_REF();
        const up = this.playerUp.clone();
        const align = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
        const orientation = align.clone();
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(up, this.rotation.yaw);
        orientation.multiply(yawQuat);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation);
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(right, this.rotation.pitch);
        orientation.multiply(pitchQuat);
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(orientation);
        const rollQuat = new THREE.Quaternion().setFromAxisAngle(forward, this.rotation.roll);
        orientation.multiply(rollQuat);
        this.frame.quaternion.copy(orientation);
        return orientation;
    }

    updateCamera(delta) {
        const THREE = THREE_REF();
        const orientation = this.frame.quaternion.clone();
        const targetOffsetWorld = this.cameraTargetOffset.clone().applyQuaternion(orientation);
        lerpVector(targetOffsetWorld, this.cameraCurrentOffset, Math.min(1, delta * 4));
        this.camera.position.copy(this.frame.position).add(this.cameraCurrentOffset);
        const lookTarget = this.frame.position.clone().add(new THREE.Vector3(0, 1.4, 0).applyQuaternion(orientation));
        const desiredMatrix = new THREE.Matrix4().lookAt(this.camera.position, lookTarget, this.playerUp.clone());
        const desiredQuat = new THREE.Quaternion().setFromRotationMatrix(desiredMatrix);
        this.camera.quaternion.slerp(desiredQuat, Math.min(1, delta * 6));
        this.cameraLookAt.copy(lookTarget);
    }
}
