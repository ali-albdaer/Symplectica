import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { Config } from '../core/config.js';
import { State } from '../core/state.js';
import { registerBody } from '../physics/physicsWorld.js';

export function createPlayer() {
  const { spawnBody, spawnAltitude, mass, radius } = Config.player;
  const planetEntry =
    State.celestialBodies.find((b) => b.config.name === 'Planet One') ||
    State.celestialBodies[1];

  const spawnPos = planetEntry.body.position.clone();
  const up = spawnPos.clone().sub(planetEntry.body.position).normalize() || new THREE.Vector3(0, 1, 0);
  spawnPos.add(up.clone().multiplyScalar(planetEntry.config.radius + spawnAltitude));

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  State.camera = camera;

  const playerBody = {
    mass,
    radius,
    position: spawnPos,
    velocity: new THREE.Vector3(),
    acceleration: new THREE.Vector3(),
    dynamic: true,
    onPostIntegrate: null
  };
  registerBody(playerBody);

  const player = new PlayerController(playerBody, planetEntry);
  State.player = player;
}

class PlayerController {
  constructor(body, referenceEntry) {
    this.body = body;
    this.reference = referenceEntry; // { config, body }
    this.mode = 'walk';
    this.thirdPerson = false;
    this.thirdPersonOffset = new THREE.Vector3(0, 2, -6);
    this.cameraPivot = new THREE.Object3D();
    this.cameraPivot.position.copy(body.position);
    State.scene.add(this.cameraPivot);
    this.cameraPivot.add(State.camera);

    this._heldObject = null;
    this._heldOffset = new THREE.Vector3(0, 0, -3);
  }

  toggleMode() {
    this.mode = this.mode === 'walk' ? 'flight' : 'walk';
  }

  toggleView() {
    this.thirdPerson = !this.thirdPerson;
  }

  updatePhysics(dt) {
    if (this.mode === 'walk' && this.reference) {
      const rel = this.body.position.clone().sub(this.reference.body.position);
      const dist = rel.length();
      const surfaceRadius = (this.reference.config ? this.reference.config.radius : 4.0) + 0.05;
      if (dist < surfaceRadius) {
        rel.setLength(surfaceRadius);
        this.body.position.copy(this.reference.body.position).add(rel);
        const n = rel.clone().normalize();
        const vNormal = this.body.velocity.dot(n);
        if (vNormal < 0) {
          this.body.velocity.addScaledVector(n, -vNormal);
        }
      }
    }
  }

  updateFromInput(input, dt) {
    const cam = State.camera;
    if (!cam) return;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    cam.getWorldDirection(forward);
    forward.normalize();
    right.crossVectors(forward, cam.up).normalize().multiplyScalar(-1);

    const move = new THREE.Vector3();
    if (input.keys['KeyW']) move.add(forward);
    if (input.keys['KeyS']) move.sub(forward);
    if (input.keys['KeyA']) move.sub(right);
    if (input.keys['KeyD']) move.add(right);

    if (this.mode === 'walk') {
      const gravityUp = this.body.position.clone().sub(this.reference.body.position).normalize();
      const tangentForward = forward.clone().projectOnPlane(gravityUp).normalize();
      const tangentRight = right.clone().projectOnPlane(gravityUp).normalize();
      move.set(0, 0, 0);
      if (input.keys['KeyW']) move.add(tangentForward);
      if (input.keys['KeyS']) move.sub(tangentForward);
      if (input.keys['KeyA']) move.sub(tangentRight);
      if (input.keys['KeyD']) move.add(tangentRight);

      const speed = Config.controls.walkSpeed * (input.keys['ShiftLeft'] ? Config.controls.runMultiplier : 1.0);
      if (move.lengthSq() > 0) {
        move.normalize();
        this.body.velocity.addScaledVector(move, speed * dt);
      }

      if (input.keysPressed['Space']) {
        const jump = gravityUp.clone().multiplyScalar(Config.controls.jumpSpeed);
        this.body.velocity.add(jump);
      }

      cam.up.copy(gravityUp);
    } else {
      const up = cam.up.clone().normalize();
      if (input.keys['Space']) move.add(up);
      if (input.keys['ShiftLeft'] || input.keys['ShiftRight']) move.sub(up);
      const baseSpeed = Config.controls.flightSpeed * (input.keys['KeyE'] ? Config.controls.flightBoostMultiplier : 1.0);
      if (move.lengthSq() > 0) {
        move.normalize();
        this.body.velocity.addScaledVector(move, baseSpeed * dt);
      }
    }

    input.keysPressed['Space'] = false;
  }

  updateRender(dt) {
    const cam = State.camera;
    if (!cam) return;

    this.cameraPivot.position.lerp(this.body.position, 0.2);

    if (this.thirdPerson) {
      const desiredOffset = this.thirdPersonOffset
        .clone()
        .applyQuaternion(cam.quaternion.clone().invert());
      const targetPos = this.cameraPivot.position.clone().add(desiredOffset);
      cam.position.lerp(targetPos, 0.2);
    } else {
      cam.position.set(0, 0, 0);
    }

    if (this._heldObject) {
      const holdPos = new THREE.Vector3(0, 0, 0)
        .applyMatrix4(cam.matrixWorld)
        .add(cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(3.0));
      this._heldObject.position.copy(holdPos);
      this._heldObject.velocity.set(0, 0, 0);
    }
  }

  tryGrab(target) {
    this._heldObject = target;
  }

  releaseGrab() {
    this._heldObject = null;
  }
}
