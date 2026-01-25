import * as THREE from 'three';

export function createGrabSystem({ scene, camera, input, player, getConfig }) {
  const raycaster = new THREE.Raycaster();
  const tempVec = new THREE.Vector3();

  const state = {
    held: null,
    heldBody: null,
    wasDown: false
  };

  function prePhysics(dt, system) {
    const down = input.isMouseDown(2); // right-click
    if (down && !state.wasDown) {
      if (state.held) {
        release();
      } else {
        tryGrab(system);
      }
    }
    state.wasDown = down;

    if (!state.heldBody) return;

    const cfg = getConfig();
    const targetPos = player
      .getPosition()
      .clone()
      .addScaledVector(camera.getWorldDirection(tempVec).normalize(), cfg.grab.holdDistanceMeters)
      .addScaledVector(player.getUpVector(system.getBodyById(player.getPrimaryBodyId())), 0.3);

    // Spring constraint
    const x = targetPos.sub(state.heldBody.pos);
    const v = state.heldBody.vel;
    const a = x.multiplyScalar(cfg.grab.spring).addScaledVector(v, -cfg.grab.damping);

    state.heldBody.vel.addScaledVector(a, dt);
  }

  function postPhysics(dt, system) {
    // nothing
  }

  function tryGrab(system) {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.far = 6;

    const candidates = [];
    scene.traverse((obj) => {
      if (obj.isMesh && obj.userData && obj.userData.physicsBody) {
        candidates.push(obj);
      }
    });

    const hits = raycaster.intersectObjects(candidates, false);
    if (!hits.length) return;

    const hit = hits[0].object;
    const phys = hit.userData.physicsBody;

    state.held = hit;
    state.heldBody = phys;
  }

  function release() {
    state.held = null;
    state.heldBody = null;
  }

  return {
    prePhysics,
    postPhysics
  };
}
