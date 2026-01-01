import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";
import { Vector3, Euler, Quaternion, Raycaster } from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export class PlayerController {
  constructor({ camera, physicsEngine, config, eventBus, pointerLockManager, logger }) {
    this.camera = camera;
    this.physicsEngine = physicsEngine;
    this.config = config;
    this.eventBus = eventBus;
    this.pointerLockManager = pointerLockManager;
    this.logger = logger;

    this.mode = "walk";
    this.keys = new Set();
    this.yaw = 0;
    this.pitch = 0;
    this.euler = new Euler();
    this.quaternion = new Quaternion();
    this.gravityNormal = new Vector3(0, 1, 0);
    this.playerMass = 85;
    this.jumpReady = true;
    this.isGrounded = false;
    this.flightEnabled = false;
    this.grabbedObject = null;
    this.raycaster = new Raycaster();
    this.interactiveObjects = [];

    this.body = new CANNON.Body({
      mass: this.playerMass,
      shape: new CANNON.Sphere(1),
      position: new CANNON.Vec3(
        this.config.player.spawnPosition.x,
        this.config.player.spawnPosition.y,
        this.config.player.spawnPosition.z
      ),
      material: new CANNON.Material({ friction: 0.4, restitution: 0 }),
      linearDamping: 0.2,
      angularDamping: 0.9,
    });
    this.body.fixedRotation = true;
    this.physicsEngine.registerPlayerBody(this.body);

    this.pointerLockManager?.onChange((locked) => this.handlePointer(locked));
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));
    window.addEventListener("contextmenu", (e) => this.handleGrab(e));
  }

  setInteractiveObjects(objects) {
    this.interactiveObjects = objects;
  }

  handlePointer(locked) {
    if (locked) {
      document.addEventListener("mousemove", this.onMouseMove);
    } else {
      document.removeEventListener("mousemove", this.onMouseMove);
    }
  }

  onMouseMove = (event) => {
    const sensitivity = 0.0025;
    this.yaw -= event.movementX * sensitivity;
    this.pitch -= event.movementY * sensitivity;
    const limit = Math.PI / 2 - 0.05;
    this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
  };

  handleKeyDown(event) {
    if (event.repeat) return;
    this.keys.add(event.code);
    if (event.code === "KeyF") {
      this.toggleFlight();
    }
    if (event.code === "KeyV") {
      this.eventBus?.emit("camera:toggle");
    }
  }

  handleKeyUp(event) {
    this.keys.delete(event.code);
    if (event.code === "Space") {
      this.jumpReady = true;
    }
  }

  toggleFlight() {
    this.flightEnabled = !this.flightEnabled;
    this.mode = this.flightEnabled ? "flight" : "walk";
    this.logger?.log(`Player mode => ${this.mode}`);
  }

  handleGrab(event) {
    event.preventDefault();
    if (!this.pointerLockManager?.isLocked) return;
    if (this.grabbedObject) {
      this.logger?.log("Released object");
      this.grabbedObject = null;
      return;
    }
    const hit = this.findInteractiveTarget();
    if (hit) {
      this.grabbedObject = hit;
      this.logger?.log(`Grabbed ${hit.definition.id}`);
    }
  }

  findInteractiveTarget() {
    if (!this.interactiveObjects.length) return null;
    const origin = this.getPosition();
    const dir = this.getForwardVector();
    this.raycaster.set(origin, dir);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects.map((obj) => obj.mesh));
    if (!intersects.length) return null;
    const mesh = intersects[0].object;
    return this.interactiveObjects.find((obj) => obj.mesh === mesh);
  }

  getForwardVector() {
    return new Vector3(0, 0, -1).applyQuaternion(this.quaternion).normalize();
  }

  getRightVector() {
    return new Vector3(1, 0, 0).applyQuaternion(this.quaternion).normalize();
  }

  update(delta) {
    this.updateOrientation();
    this.applyGravity();
    this.processMovement();
    this.updateGrabbedObject();
  }

  updateOrientation() {
    this.euler.set(this.pitch, this.yaw, 0, "YXZ");
    this.quaternion.setFromEuler(this.euler);
  }

  applyGravity() {
    const nearest = this.findDominantGravitySource();
    if (!nearest) return;
    const playerPos = this.getPosition();
    const direction = nearest.position.clone().sub(playerPos);
    const distance = Math.max(direction.length(), 1e-2);
    direction.normalize();
    const gravityMagnitude = (this.config.gravityConstant * nearest.mass * this.playerMass) / (distance * distance);
    const gravityForce = direction.multiplyScalar(gravityMagnitude);
    this.body.applyForce(new CANNON.Vec3(gravityForce.x, gravityForce.y, gravityForce.z));
    if (distance < this.config.player.gravitySnapThreshold) {
      this.gravityNormal.copy(direction.clone().multiplyScalar(-1));
    } else {
      this.gravityNormal.set(0, 1, 0);
    }

    const surfaceDistance = distance - nearest.radius;
    this.isGrounded = surfaceDistance < 1.5 && !this.flightEnabled;
  }

  findDominantGravitySource() {
    if (!this.physicsEngine?.celestialBodies.length) return null;
    const playerPos = this.getPosition();
    let best = null;
    let minDist = Infinity;
    this.physicsEngine.celestialBodies.forEach((entry) => {
      if (!entry?.body) return;
      const definition =
        entry.definition ||
        this.physicsEngine.config?.celestialBodies?.find((body) => body.id === entry.id);
      if (!definition) {
        this.logger?.log(`Gravity source ${entry.id ?? "unknown"} missing definition`, "error");
        return;
      }
      const center = new Vector3(entry.body.position.x, entry.body.position.y, entry.body.position.z);
      const distance = playerPos.distanceTo(center);
      if (distance < minDist) {
        minDist = distance;
        best = {
          id: entry.id,
          position: center,
          mass: entry.body._gravityMass ?? entry.body.mass,
          radius: definition.radius || 1,
        };
      }
    });
    return best;
  }

  processMovement() {
    const move = new Vector3();
    const forward = this.getForwardVector();
    const right = this.getRightVector();
    if (this.mode === "walk") {
      forward.projectOnPlane(this.gravityNormal).normalize();
      right.projectOnPlane(this.gravityNormal).normalize();
    }
    if (this.keys.has("KeyW")) move.add(forward);
    if (this.keys.has("KeyS")) move.sub(forward);
    if (this.keys.has("KeyA")) move.sub(right);
    if (this.keys.has("KeyD")) move.add(right);
    move.normalize();

    const speed = this.mode === "walk" ? this.config.player.walkSpeed : this.config.player.flightSpeed;
    const desired = move.multiplyScalar(speed);
    if (this.mode === "flight") {
      if (this.keys.has("Space")) desired.add(this.gravityNormal.clone().multiplyScalar(-speed));
      if (this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")) {
        desired.add(this.gravityNormal.clone().multiplyScalar(speed));
      }
    } else if (this.keys.has("Space") && this.isGrounded && this.jumpReady) {
      const jumpForce = this.gravityNormal.clone().multiplyScalar(-this.config.player.jumpImpulse * this.body.mass);
      this.body.applyImpulse(new CANNON.Vec3(jumpForce.x, jumpForce.y, jumpForce.z));
      this.jumpReady = false;
    }

    const smoothing = this.mode === "walk" ? 0.15 : 0.05;
    this.body.velocity.x += (desired.x - this.body.velocity.x) * smoothing;
    this.body.velocity.y += (desired.y - this.body.velocity.y) * smoothing;
    this.body.velocity.z += (desired.z - this.body.velocity.z) * smoothing;
  }

  updateGrabbedObject() {
    if (!this.grabbedObject) return;
    const desiredOffset = this.getForwardVector().multiplyScalar(3);
    const target = this.getPosition().add(desiredOffset);
    const body = this.grabbedObject.physicsEntry.body;
    const current = new Vector3(body.position.x, body.position.y, body.position.z);
    const toTarget = target.sub(current);
    const stiffness = 6;
    body.velocity.set(toTarget.x * stiffness, toTarget.y * stiffness, toTarget.z * stiffness);
  }

  getPosition() {
    return new Vector3(this.body.position.x, this.body.position.y, this.body.position.z);
  }

  getPose() {
    return {
      position: this.getPosition(),
      quaternion: this.quaternion.clone(),
      up: this.gravityNormal.clone().multiplyScalar(-1),
    };
  }
}
