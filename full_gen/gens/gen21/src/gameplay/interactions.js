// Object interactions: raycast grab / hold with right mouse

import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

export function createInteractionSystem({ scene, camera, physics, input, microObjects }) {
  const raycaster = new THREE.Raycaster();
  const grabDistance = 2.5;
  let grabbedBody = null;

  function update(dt) {
    if (input.isRightMouseDown()) {
      if (!grabbedBody) {
        // Try grab
        const origin = camera.position.clone();
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
        raycaster.set(origin, dir);
        const candidates = microObjects.map((b) => ({
          body: b,
          distance: origin.distanceTo(b.position),
        }));
        candidates.sort((a, b) => a.distance - b.distance);
        for (const c of candidates) {
          if (c.distance < grabDistance) {
            grabbedBody = c.body;
            break;
          }
        }
      }
      if (grabbedBody) {
        const targetPos = camera.position
          .clone()
          .add(new THREE.Vector3(0, 0, -grabDistance).applyQuaternion(camera.quaternion));
        const toTarget = targetPos.clone().sub(grabbedBody.position);
        grabbedBody.velocity.copy(toTarget.multiplyScalar(10));
      }
    } else {
      grabbedBody = null;
    }
  }

  return { update };
}
