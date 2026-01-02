import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createSolarSystem({ scene, physics, config }) {
  const entities = [];

  const scales = {
    distanceScale: 1 / 1e7,
    radiusScale: 1 / 1e6,
  };

  const sunCfg = config.solarSystem.bodies.sun;
  const sunRadius = sunCfg.radius * scales.radiusScale;
  const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 16);
  const sunMat = new THREE.MeshStandardMaterial({
    color: sunCfg.color,
    emissive: sunCfg.color,
    emissiveIntensity: 1.0,
  });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.castShadow = false;
  sunMesh.receiveShadow = false;
  scene.add(sunMesh);

  const sunLight = new THREE.PointLight(sunCfg.color, 1.4, 0, 2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(
    config.rendering.shadowQuality[config.rendering.fidelity] || 2048,
    config.rendering.shadowQuality[config.rendering.fidelity] || 2048,
  );
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const sunBody = physics.createBody({
    id: 'sun',
    mass: sunCfg.mass,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    mesh: sunMesh,
    isDynamic: false,
    isCelestial: true,
  });

  const bodyById = { sun: sunBody };

  const starGeo = new THREE.SphereGeometry(1, 8, 8);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
  const starField = new THREE.Mesh(starGeo, starMat);
  const starRadius = 5e5;
  starField.scale.setScalar(starRadius);
  starField.matrixAutoUpdate = false;
  scene.add(starField);

  const bodiesCfg = config.solarSystem.bodies;
  const dynamicBodies = [];

  for (const key of ['planet1', 'planet2', 'moon1']) {
    const cfg = bodiesCfg[key];
    const radius = cfg.radius * scales.radiusScale;
    const segments = config.rendering.fidelity === 'ultra' ? 96 : config.rendering.fidelity === 'medium' ? 64 : 32;
    const geo = new THREE.SphereGeometry(radius, segments, segments / 2);
    const mat = new THREE.MeshStandardMaterial({ color: cfg.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    let parentBody = sunBody;
    let orbitalRadius = cfg.orbitalRadius;
    if (cfg.parent && bodyById[cfg.parent]) {
      parentBody = bodyById[cfg.parent];
    }
    const phase = cfg.orbitalPhase || 0;
    const worldOrbitalRadius = orbitalRadius * scales.distanceScale;
    const pos = new THREE.Vector3(
      Math.cos(phase) * worldOrbitalRadius,
      0,
      Math.sin(phase) * worldOrbitalRadius,
    );

    const M = parentBody.mass;
    const vMag = Math.sqrt(config.physics.G * M / (orbitalRadius || 1));
    const velDir = new THREE.Vector3(-Math.sin(phase), 0, Math.cos(phase));
    const v = velDir.multiplyScalar(vMag * scales.distanceScale);

    const body = physics.createBody({
      id: key,
      mass: cfg.mass,
      position: pos,
      velocity: v,
      mesh,
      isDynamic: true,
      isCelestial: true,
    });
    bodyById[key] = body;
    dynamicBodies.push(body);
  }

  const playerPlanetBody = bodyById['planet1'];
  const playerStart = {
    planetBody: playerPlanetBody,
    surfaceRadius: bodiesCfg.planet1.radius * scales.radiusScale,
  };

  const localObjects = [];
  const basePos = playerPlanetBody.position.clone().setY(playerStart.surfaceRadius + 30);

  for (let i = 0; i < 4; i++) {
    const size = 3 + i * 1.5;
    const geo = new THREE.SphereGeometry(size, 16, 12);
    const lum = i % 2 === 0;
    const mat = new THREE.MeshStandardMaterial({
      color: lum ? 0xffddaa : 0x8899aa,
      emissive: lum ? 0xffddaa : 0x000000,
      emissiveIntensity: lum ? 0.8 : 0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const offset = new THREE.Vector3((i - 1.5) * 12, 5 + i * 2, (i % 2 === 0 ? 1 : -1) * 8);
    mesh.position.copy(basePos.clone().add(offset));
    scene.add(mesh);

    const body = physics.createBody({
      id: `local_${i}`,
      mass: 5 + i * 2,
      position: mesh.position,
      velocity: new THREE.Vector3(0, 0, 0),
      mesh,
      isDynamic: true,
      isCelestial: false,
    });
    localObjects.push(body);
  }

  const entity = {
    fixedUpdate(dt) {},
    update(dt) {
      starField.position.copy(bodyById.sun.position);
    },
  };
  entities.push(entity);

  return { entities, playerStart };
}
