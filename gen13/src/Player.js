import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { Config } from './Config.js';
import { formatVector, vec3FromArray, clamp } from './Utils.js';

export class Player {
  constructor(scene, camera, physicsWorld, input) {
    this.scene = scene;
    this.camera = camera;
    this.physicsWorld = physicsWorld;
    this.input = input;

    this.mode = Config.player.mode;
    this.thirdPerson = false;
    this.thirdPersonTarget = new THREE.Object3D();
    this.thirdPersonTarget.position.copy(vec3FromArray(Config.player.startPosition));

    const shape = new CANNON.Sphere(Config.player.height * 0.25);
    this.body = new CANNON.Body({ mass: Config.player.mass, shape, position: new CANNON.Vec3(...Config.player.startPosition), linearDamping: 0.05, angularDamping: 0.05 });
    physicsWorld.world.addBody(this.body);
    physicsWorld.setPlayer(this.body);

    this.pitch = 0;
    this.yaw = 0;
    this.grabbed = null;
  }

  toggleMode() {
    this.mode = this.mode === 'walk' ? 'flight' : 'walk';
  }

  toggleCamera() {
    this.thirdPerson = !this.thirdPerson;
  }

  update(dt, celestials, microBodies) {
    const { dx, dy } = this.input.consumeMouseDelta();
    const sensitivity = 0.0025;
    this.yaw -= dx * sensitivity;
    this.pitch -= dy * sensitivity;
    this.pitch = clamp(this.pitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);

    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quat).normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat).normalize();

    const nearest = this._nearestCelestial(celestials);
    const upDir = nearest ? new THREE.Vector3().subVectors(this.camera.position, nearest.mesh.position).normalize() : new THREE.Vector3(0, 1, 0);

    // Orientation of camera
    const lookMatrix = new THREE.Matrix4();
    lookMatrix.lookAt(new THREE.Vector3(), forward, upDir);
    const orient = new THREE.Quaternion().setFromRotationMatrix(lookMatrix);
    this.camera.quaternion.slerp(orient, 0.35);

    const moveDir = new THREE.Vector3();
    const speed = this.mode === 'walk' ? Config.player.speedWalk : Config.player.speedFlight;

    if (this.input.isKeyDown('KeyW')) moveDir.add(forward);
    if (this.input.isKeyDown('KeyS')) moveDir.sub(forward);
    if (this.input.isKeyDown('KeyA')) moveDir.sub(right);
    if (this.input.isKeyDown('KeyD')) moveDir.add(right);
    if (this.mode === 'flight') {
      if (this.input.isKeyDown('Space')) moveDir.add(upDir);
      if (this.input.isKeyDown('ShiftLeft') || this.input.isKeyDown('ShiftRight')) moveDir.sub(upDir);
    }
    if (moveDir.lengthSq() > 0) moveDir.normalize().multiplyScalar(speed);

    if (this.mode === 'walk') {
      // Align velocity tangential to surface
      const gravityDir = upDir.clone().negate();
      const localUp = new CANNON.Vec3(gravityDir.x * -1, gravityDir.y * -1, gravityDir.z * -1);
      this.body.applyForce(localUp.scale(Config.player.mass * 9.8), this.body.position);
      if (this.input.isKeyDown('Space')) {
        const jumpForce = gravityDir.clone().multiplyScalar(Config.player.jump * this.body.mass);
        this.body.applyImpulse(new CANNON.Vec3(jumpForce.x, jumpForce.y, jumpForce.z));
      }
    }

    this.body.velocity.x += moveDir.x * dt;
    this.body.velocity.y += moveDir.y * dt;
    this.body.velocity.z += moveDir.z * dt;

    // Sync camera
    const camTarget = new THREE.Vector3(this.body.position.x, this.body.position.y, this.body.position.z);
    if (this.thirdPerson) {
      const desired = camTarget.clone().add(forward.clone().multiplyScalar(-8)).add(upDir.clone().multiplyScalar(3));
      this.thirdPersonTarget.position.lerp(desired, 0.2);
      this.camera.position.copy(this.thirdPersonTarget.position);
      this.camera.lookAt(camTarget);
    } else {
      this.camera.position.copy(camTarget);
    }

    // Grabbing logic
    if (this.input.rightMouseDown && !this.grabbed) {
      const ray = new THREE.Ray(this.camera.position.clone(), forward.clone());
      let closest = null;
      let minDist = 3;
      for (const body of microBodies) {
        const pos = new THREE.Vector3(body.position.x, body.position.y, body.position.z);
        const dist = ray.at(2, new THREE.Vector3()).distanceTo(pos);
        if (dist < minDist) {
          closest = body;
          minDist = dist;
        }
      }
      if (closest) {
        this.grabbed = closest;
        this.grabbed.type = 'dynamic';
      }
    }
    if (!this.input.rightMouseDown && this.grabbed) {
      this.grabbed = null;
    }
    if (this.grabbed) {
      const holdPos = this.camera.position.clone().add(forward.clone().multiplyScalar(2.5));
      this.grabbed.velocity.set(0, 0, 0);
      this.grabbed.position.set(holdPos.x, holdPos.y, holdPos.z);
    }
  }

  _nearestCelestial(celestials) {
    let nearest = null;
    let best = Infinity;
    for (const body of celestials) {
      const dist = body.mesh.position.distanceTo(this.camera.position) - body.radius;
      if (dist < best) {
        best = dist;
        nearest = body;
      }
    }
    return nearest;
  }

  telemetry() {
    return `Mode: ${this.mode} | Cam: ${this.thirdPerson ? '3P' : 'FP'} | Pos: ${formatVector(new THREE.Vector3(this.body.position.x, this.body.position.y, this.body.position.z))}`;
  }
}
