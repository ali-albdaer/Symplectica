import * as THREE from 'three';

export function createInteractiveObjects({ scene, system, getConfig }) {
  const objects = [];
  const bodies = [];

  function spawnNearPlayer(player, primaryBody) {
    for (const o of objects) scene.remove(o.mesh);
    objects.length = 0;
    bodies.length = 0;

    const cfg = getConfig();
    const n = cfg.initial.objects.count;
    const spread = cfg.initial.objects.spreadMeters;

    const rnd = mulberry32(2026);

    const origin = player.getPosition().clone();
    const up = player.getUpVector(primaryBody);

    const tangentA = orthonormalTangent(up);
    const tangentB = new THREE.Vector3().crossVectors(up, tangentA).normalize();

    for (let i = 0; i < n; i++) {
      const radius = lerp(cfg.initial.objects.minRadiusMeters, cfg.initial.objects.maxRadiusMeters, rnd());
      const volume = (4 / 3) * Math.PI * radius * radius * radius;
      const massKg = volume * cfg.initial.objects.densityKgPerM3;

      const localX = (rnd() * 2 - 1) * spread;
      const localZ = (rnd() * 2 - 1) * spread;
      const localY = rnd() * 0.4 + 0.2;

      const pos = origin
        .clone()
        .addScaledVector(tangentA, localX)
        .addScaledVector(tangentB, localZ)
        .addScaledVector(up, localY);

      const luminous = rnd() < cfg.initial.objects.luminousFraction;

      const mat = new THREE.MeshStandardMaterial({
        color: luminous ? 0xb4ffea : 0xe6e6e6,
        emissive: luminous ? 0xb4ffea : 0x000000,
        emissiveIntensity: luminous ? 1.2 : 0,
        roughness: 0.85,
        metalness: 0.0
      });

      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 18), mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.copy(pos);
      scene.add(mesh);

      const body = {
        id: `obj_${i}`,
        name: `Object ${i}`,
        massKg,
        radiusMeters: radius,
        pos: pos.clone(),
        vel: new THREE.Vector3(),
        userData: { type: 'object', index: i, luminous }
      };

      // Used by grab raycast.
      mesh.userData.physicsBody = body;

      objects.push({ mesh, body });
      bodies.push(body);
    }
  }

  function syncFromPhysics() {
    for (const o of objects) {
      o.mesh.position.copy(o.body.pos);
    }
  }

  function getPhysicsBodies() {
    return bodies;
  }

  return {
    spawnNearPlayer,
    syncFromPhysics,
    getPhysicsBodies,
    objects
  };
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function orthonormalTangent(n) {
  // Pick a vector not parallel to n, then cross.
  const a = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  return new THREE.Vector3().crossVectors(a, n).normalize();
}
