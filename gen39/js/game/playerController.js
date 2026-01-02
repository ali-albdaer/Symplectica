import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createPlayerController({ scene, camera, physics, config, logger, playerStart }) {
  const entity = { fixedUpdate: () => {}, update: () => {} };

  const state = {
    mode: 'walk',
    firstPerson: true,
    yaw: 0,
    pitch: 0,
    moveForward: 0,
    moveRight: 0,
    moveUp: 0,
    isJumping: false,
    isPointerLocked: false,
    grabbedBody: null,
  };

  const playerGeo = new THREE.SphereGeometry(4, 16, 12);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0x55ff99 });
  const playerMesh = new THREE.Mesh(playerGeo, playerMat);
  playerMesh.castShadow = true;
  playerMesh.receiveShadow = true;
  scene.add(playerMesh);

  const startPos = playerStart.planetBody.position.clone();
  const upDir = new THREE.Vector3(0, 1, 0);
  startPos.addScaledVector(upDir, playerStart.surfaceRadius + 10);

  const body = physics.createBody({
    id: 'player',
    mass: 80,
    position: startPos,
    velocity: new THREE.Vector3(),
    mesh: playerMesh,
    isDynamic: true,
    isCelestial: false,
  });

  entity.body = body;
  entity.entityMesh = playerMesh;

  const canvas = document.getElementById('render-canvas');

  function setPointerLocked(locked) {
    state.isPointerLocked = locked;
    document.body.classList.toggle('pointer-locked', locked);
    document.body.classList.toggle('pointer-visible', !locked);
  }

  canvas.addEventListener('click', () => {
    if (!state.isPointerLocked) {
      canvas.requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    setPointerLocked(document.pointerLockElement === canvas);
  });

  document.addEventListener('mousemove', (e) => {
    if (!state.isPointerLocked) return;
    const sens = config.player.mouseSensitivity;
    state.yaw -= e.movementX * sens;
    state.pitch -= e.movementY * sens;
    const maxPitch = Math.PI / 2 - 0.01;
    state.pitch = Math.max(-maxPitch, Math.min(maxPitch, state.pitch));
  });

  const keys = new Set();
  document.addEventListener('keydown', (e) => {
    keys.add(e.code);

    if (e.code === 'KeyF') {
      state.mode = state.mode === 'walk' ? 'flight' : 'walk';
    }
    if (e.code === 'KeyV') {
      state.firstPerson = !state.firstPerson;
    }
  });
  document.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  function updateInputs() {
    state.moveForward = (keys.has('KeyW') ? 1 : 0) + (keys.has('KeyS') ? -1 : 0);
    state.moveRight = (keys.has('KeyD') ? 1 : 0) + (keys.has('KeyA') ? -1 : 0);
    state.moveUp = (keys.has('Space') ? 1 : 0) + (keys.has('ShiftLeft') || keys.has('ShiftRight') ? -1 : 0);
  }

  entity.fixedUpdate = function (dt) {
    updateInputs();

    const pos = body.position;
    const up = new THREE.Vector3().subVectors(pos, playerStart.planetBody.position).normalize();
    const right = new THREE.Vector3(1, 0, 0).cross(up).normalize();
    const forwardFlat = new THREE.Vector3().crossVectors(up, right).normalize();

    const cosY = Math.cos(state.yaw);
    const sinY = Math.sin(state.yaw);
    const camForward = new THREE.Vector3(
      forwardFlat.x * cosY - right.x * sinY,
      forwardFlat.y * cosY - right.y * sinY,
      forwardFlat.z * cosY - right.z * sinY,
    ).normalize();
    const camRight = new THREE.Vector3().crossVectors(camForward, up).normalize();

    let wishDir = new THREE.Vector3();

    if (state.mode === 'walk') {
      wishDir.addScaledVector(camForward, state.moveForward);
      wishDir.addScaledVector(camRight, state.moveRight);
      wishDir.projectOnPlane(up);
    } else {
      wishDir.addScaledVector(camForward, state.moveForward);
      wishDir.addScaledVector(camRight, state.moveRight);
      wishDir.addScaledVector(up, state.moveUp);
    }

    if (wishDir.lengthSq() > 0) wishDir.normalize();

    const speed = state.mode === 'walk' ? config.player.walkSpeed : config.player.flightSpeed;
    const targetVel = wishDir.multiplyScalar(speed);

    body.velocity.lerp(targetVel, 0.15);

    if (state.mode === 'walk') {
      const radialDist = pos.distanceTo(playerStart.planetBody.position);
      const clampRadius = playerStart.surfaceRadius + 4;
      const dir = new THREE.Vector3().subVectors(pos, playerStart.planetBody.position).normalize();
      body.position.copy(playerStart.planetBody.position).addScaledVector(dir, clampRadius);
    }
  };

  entity.update = function (dt) {
    const pos = body.position;
    const up = new THREE.Vector3().subVectors(pos, playerStart.planetBody.position).normalize();

    const quat = new THREE.Quaternion();
    quat.setFromAxisAngle(up, state.yaw);
    const pitchQuat = new THREE.Quaternion();
    const right = new THREE.Vector3(1, 0, 0).cross(up).normalize();
    pitchQuat.setFromAxisAngle(right, state.pitch);
    quat.multiply(pitchQuat);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quat).normalize();

    if (state.firstPerson) {
      camera.position.copy(pos).addScaledVector(up, 4);
    } else {
      const idealOffset = up.clone().multiplyScalar(10).sub(forward.clone().multiplyScalar(25));
      const targetCamPos = pos.clone().add(idealOffset);
      camera.position.lerp(targetCamPos, 0.15);
    }

    const target = pos.clone();
    camera.up.copy(up);
    camera.lookAt(target);
  };

  return { entity };
}
