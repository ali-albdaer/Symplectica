import * as THREE from 'three';

export function createCelestialBodies({ scene, renderer, system, getConfig }) {
  const meshes = new Map();
  let sunLight;

  function initMeshes() {
    const cfg = getConfig();

    for (const body of system.getAllBodies()) {
      const mat = body.emissive
        ? new THREE.MeshStandardMaterial({
            color: body.color,
            emissive: body.color,
            emissiveIntensity: 1.0,
            metalness: 0.0,
            roughness: 1.0
          })
        : new THREE.MeshStandardMaterial({
            color: body.color,
            metalness: 0.0,
            roughness: 1.0
          });

      const geo = createSphereGeometryForBody(body, cfg);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = false;
      mesh.receiveShadow = true;

      if (body.castsShadow) {
        mesh.castShadow = true;
      }

      mesh.frustumCulled = true;
      scene.add(mesh);
      meshes.set(body.id, mesh);
    }
  }

  function installSunLight(sunBody) {
    if (!sunBody) return;

    // Sun is a point in space; we approximate with a directional light aimed at the scene
    // using the sun position as origin. For large distances, directional is stable for shadows.
    // We also add a low-intensity point light for nearby objects.

    const dir = new THREE.DirectionalLight(0xffffff, 4.5);
    dir.position.copy(sunBody.pos);
    dir.target.position.set(0, 0, 0);
    scene.add(dir);
    scene.add(dir.target);

    dir.castShadow = getConfig().render.shadows.enabled;
    dir.shadow.bias = -0.00002;
    dir.shadow.normalBias = 0.02;

    const mapSize = getConfig().render.shadows.size;
    dir.shadow.mapSize.set(mapSize, mapSize);

    // Shadow camera bounds (in meters). Keep tight-ish for performance.
    const cam = dir.shadow.camera;
    cam.near = 1.0e5;
    cam.far = 6.0e8;
    cam.left = -2.0e8;
    cam.right = 2.0e8;
    cam.top = 2.0e8;
    cam.bottom = -2.0e8;

    const point = new THREE.PointLight(0xfff2d2, 0.4, 1.0e8, 2);
    point.position.copy(sunBody.pos);
    scene.add(point);

    sunLight = { dir, point };
  }

  function syncFromPhysics() {
    const cfg = getConfig();
    for (const body of system.getAllBodies()) {
      const mesh = meshes.get(body.id);
      if (!mesh) continue;

      mesh.position.copy(body.pos);

      // Rebuild LOD on the fly is expensive; we only adjust scale.
      // Geometry radius is created in meters so scale stays 1.
      mesh.scale.setScalar(1);

      if (sunLight && body.id === 'sun') {
        sunLight.dir.position.copy(body.pos);
        sunLight.point.position.copy(body.pos);
      }

      // If fidelity changed, adjust shadows quickly
      const fidelity = cfg.render.fidelity;
      const shadowsEnabled = cfg.render.shadows.enabled && fidelity !== 'LOW';
      if (sunLight) {
        sunLight.dir.castShadow = shadowsEnabled;
      }
    }
  }

  initMeshes();

  return {
    installSunLight,
    syncFromPhysics
  };
}

function createSphereGeometryForBody(body, cfg) {
  const fidelity = cfg.render.fidelity;
  let seg;
  if (fidelity === 'LOW') seg = 24;
  else if (fidelity === 'MEDIUM') seg = 48;
  else seg = 64;

  return new THREE.SphereGeometry(body.radiusMeters, seg, seg);
}
