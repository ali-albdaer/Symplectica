// Player movement and camera control (first/third person, walk/fly)

import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

import { Config } from "../core/config.js";

export function createPlayerController({ physics, scene, camera, playerBody, input }) {
  let flyMode = false;
  let thirdPerson = false;
  let yaw = 0;
  let pitch = 0;

  const cameraOffsetThirdPerson = new THREE.Vector3(0, 2, 6);

  const tmpVec = new THREE.Vector3();

  // Edge-triggered toggles for flight and view mode
  window.addEventListener("keydown", (e) => {
    if (e.key === "f" || e.key === "F") {
      flyMode = !flyMode;
    }
    if (e.key === "v" || e.key === "V") {
      thirdPerson = !thirdPerson;
    }
  });

  function updateCameraOrientation(dt) {
    const { dx, dy } = input.consumeMouseDelta();
    const sensitivity = 0.0025;
    yaw -= dx * sensitivity;
    pitch -= dy * sensitivity;
    const maxPitch = Math.PI / 2 - 0.01;
    pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));

    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
    camera.quaternion.copy(qYaw).multiply(qPitch);
  }

  function currentUpVector() {
    // Up is based on nearest celestial body
    let nearest = null;
    let nearestDistSq = Infinity;
    for (const b of physics.bodies) {
      if (!b.isCelestial) continue;
      const d2 = b.position.distanceToSquared(playerBody.position);
      if (d2 < nearestDistSq) {
        nearestDistSq = d2;
        nearest = b;
      }
    }
    if (nearest) {
      return tmpVec
        .copy(playerBody.position)
        .sub(nearest.position)
        .normalize();
    }
    return new THREE.Vector3(0, 1, 0);
  }

  function updateMovement(dt) {
    const up = currentUpVector();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    forward.addScaledVector(up, -forward.dot(up)).normalize(); // project onto tangent plane

    let moveDir = new THREE.Vector3();
    if (input.isKeyDown("w")) moveDir.add(forward);
    if (input.isKeyDown("s")) moveDir.addScaledVector(forward, -1);
    if (input.isKeyDown("a")) moveDir.addScaledVector(right, -1);
    if (input.isKeyDown("d")) moveDir.add(right);

    if (flyMode) {
      if (input.isKeyDown(" ")) moveDir.add(up);
      if (input.isKeyDown("shift")) moveDir.addScaledVector(up, -1);
    }

    if (moveDir.lengthSq() > 0) moveDir.normalize();

    const speed = flyMode ? Config.player.moveSpeedFly : Config.player.moveSpeedWalk;
    const targetVel = moveDir.multiplyScalar(speed);

    // Keep orbital/ground velocity baseline but add player-directed lateral component
    const upComponent = up.clone().multiplyScalar(playerBody.velocity.dot(up));
    const tangentComponent = targetVel;
    playerBody.velocity.copy(upComponent).add(tangentComponent);

    // Jump when grounded and not flying
    if (!flyMode && input.isKeyDown(" ")) {
      const jumpSpeed = Config.player.jumpSpeed;
      const vertical = up.clone().multiplyScalar(jumpSpeed);
      playerBody.velocity.add(vertical);
    }
  }

  function updateCameraPosition(dt) {
    if (!thirdPerson) {
      camera.position.copy(playerBody.position);
    } else {
      const up = currentUpVector();
      const offsetWorld = cameraOffsetThirdPerson.clone().applyQuaternion(camera.quaternion);
      const targetPos = playerBody.position.clone().add(offsetWorld);
      camera.position.lerp(targetPos, 1 - Math.exp(-dt * 10));
      camera.up.copy(up);
    }
  }

  return {
    update(dt) {
      updateCameraOrientation(dt);
      updateMovement(dt);
      updateCameraPosition(dt);
    },
  };
}
