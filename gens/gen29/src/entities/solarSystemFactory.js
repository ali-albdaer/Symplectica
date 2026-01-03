import { THREE } from '../vendor.js';
import { Body } from './body.js';
import { buildStarfield } from './starfield.js';
import { stableOrbitVelocity } from '../physics/orbits.js';
import { makePlanetMaterial, makeSunMaterial } from './materials.js';
import { createSphereMeshOrLOD } from './lod.js';

function setShadowForMesh(mesh, enableShadows) {
  if (!mesh) return;
  // If LOD, apply to child meshes.
  if (mesh.isLOD && Array.isArray(mesh.levels)) {
    for (const lvl of mesh.levels) {
      if (lvl?.object) {
        lvl.object.castShadow = enableShadows;
        lvl.object.receiveShadow = enableShadows;
      }
    }
    return;
  }

  mesh.castShadow = enableShadows;
  mesh.receiveShadow = enableShadows;
}

export function createSolarSystem({ THREE, configStore, scene, world, debugOverlay }) {
  const fidelity = configStore.get('graphics.fidelity');
  const enableLOD = configStore.get('graphics.enableLOD');
  const enableShadows = configStore.get('graphics.enableShadows');

  // Stars (robust & scalable): point cloud in a big sphere.
  const starCount = configStore.get('graphics.starCount');
  let stars = buildStarfield({ THREE, starCount, radius: 2200 });
  scene.add(stars);

  // Sun.
  const sunCfg = configStore.data.bodies.sun;
  const sunMat = makeSunMaterial({ THREE, emissiveStrength: sunCfg.emissiveStrength });
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(1, fidelity === 'Ultra' ? 64 : fidelity === 'Low' ? 16 : 32, fidelity === 'Ultra' ? 64 : fidelity === 'Low' ? 16 : 32), sunMat);
  sunMesh.scale.setScalar(sunCfg.radius);
  setShadowForMesh(sunMesh, false); // Sun itself doesn't need to receive/cast in our setup.
  scene.add(sunMesh);

  const sun = new Body({
    name: sunCfg.name,
    type: 'sun',
    mass: sunCfg.mass,
    radius: sunCfg.radius,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    mesh: sunMesh,
    emissiveStrength: sunCfg.emissiveStrength,
  });

  // Sun is the *only* light source.
  const sunLight = new THREE.PointLight(0xffffff, 700, 0, 2);
  sunLight.position.copy(sun.position);
  sunLight.castShadow = enableShadows;
  // Renderer is created elsewhere; we size the map from fidelity by default.
  // Dev menu can later expose explicit shadow map sizes if desired.
  const shadowMapSize = enableShadows
    ? fidelity === 'Ultra'
      ? 4096
      : fidelity === 'Low'
        ? 1024
        : 2048
    : 0;
  if (enableShadows) {
    sunLight.shadow.mapSize.width = shadowMapSize;
    sunLight.shadow.mapSize.height = shadowMapSize;
    sunLight.shadow.bias = -0.00002;
    sunLight.shadow.normalBias = 0.02;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 500;
  }
  scene.add(sunLight);

  const planet1Cfg = configStore.data.bodies.planet1;
  const planet2Cfg = configStore.data.bodies.planet2;
  const moonCfg = configStore.data.bodies.moon1;

  // Planet 1 around sun.
  const p1Pos = new THREE.Vector3(planet1Cfg.orbitRadius, 0, 0);
  const p1Vel = new THREE.Vector3(0, 0, stableOrbitVelocity(configStore, sun.mass, planet1Cfg.orbitRadius));

  const planet1Mesh = createSphereMeshOrLOD({
    THREE,
    radius: planet1Cfg.radius,
    material: makePlanetMaterial({ THREE, albedo: planet1Cfg.albedo }),
    fidelity,
    enableLOD,
    enableShadows,
  });
  setShadowForMesh(planet1Mesh, enableShadows);
  scene.add(planet1Mesh);

  const planet1 = new Body({
    name: planet1Cfg.name,
    type: 'planet',
    mass: planet1Cfg.mass,
    radius: planet1Cfg.radius,
    position: p1Pos,
    velocity: p1Vel,
    mesh: planet1Mesh,
  });
  planet1.spinRadPerSec = (2 * Math.PI) / Math.max(1e-6, planet1Cfg.daySeconds);

  // Planet 2 around sun.
  const p2Pos = new THREE.Vector3(-planet2Cfg.orbitRadius, 0, 0);
  const p2Vel = new THREE.Vector3(0, 0, -stableOrbitVelocity(configStore, sun.mass, planet2Cfg.orbitRadius));

  const planet2Mesh = createSphereMeshOrLOD({
    THREE,
    radius: planet2Cfg.radius,
    material: makePlanetMaterial({ THREE, albedo: planet2Cfg.albedo }),
    fidelity,
    enableLOD,
    enableShadows,
  });
  setShadowForMesh(planet2Mesh, enableShadows);
  scene.add(planet2Mesh);

  const planet2 = new Body({
    name: planet2Cfg.name,
    type: 'planet',
    mass: planet2Cfg.mass,
    radius: planet2Cfg.radius,
    position: p2Pos,
    velocity: p2Vel,
    mesh: planet2Mesh,
  });
  planet2.spinRadPerSec = (2 * Math.PI) / Math.max(1e-6, planet2Cfg.daySeconds);

  // Moon around planet 1 (velocity is planet1 velocity + relative orbital).
  const mPos = p1Pos.clone().add(new THREE.Vector3(moonCfg.orbitRadiusAroundPlanet1, 0, 0));
  const mRelSpeed = stableOrbitVelocity(configStore, planet1.mass, moonCfg.orbitRadiusAroundPlanet1);
  const mVel = p1Vel.clone().add(new THREE.Vector3(0, 0, mRelSpeed));

  const moonMesh = createSphereMeshOrLOD({
    THREE,
    radius: moonCfg.radius,
    material: makePlanetMaterial({ THREE, albedo: moonCfg.albedo }),
    fidelity,
    enableLOD,
    enableShadows,
  });
  setShadowForMesh(moonMesh, enableShadows);
  scene.add(moonMesh);

  const moon1 = new Body({
    name: moonCfg.name,
    type: 'moon',
    mass: moonCfg.mass,
    radius: moonCfg.radius,
    position: mPos,
    velocity: mVel,
    mesh: moonMesh,
  });
  moon1.spinRadPerSec = (2 * Math.PI) / Math.max(1e-6, moonCfg.daySeconds);

  // Momentum correction: keep COM roughly stable by giving the sun counter-velocity.
  const totalP = new THREE.Vector3();
  for (const b of [planet1, planet2, moon1]) {
    totalP.addScaledVector(b.velocity, b.mass);
  }
  sun.velocity.copy(totalP.multiplyScalar(-1 / sun.mass));

  // Ensure shadow params can see renderer: stash if present.
  // (main creates renderer first; we can't import it here without circular deps)
  // We'll update point light each frame via world sync.

  world.addBody(sun);
  world.addBody(planet1);
  world.addBody(planet2);
  world.addBody(moon1);

  // Keep the light glued to the sun's simulated position.
  sun.mesh.onBeforeRender = () => {
    sunLight.position.copy(sun.position);
  };

  // Allow edits to propagate.
  configStore.onChange((path) => {
    try {
      if (path.startsWith('graphics.')) {
        const enable = configStore.get('graphics.enableShadows');
        const fid = configStore.get('graphics.fidelity');
        sunLight.castShadow = enable;
        if (enable) {
          const s = fid === 'Ultra' ? 4096 : fid === 'Low' ? 1024 : 2048;
          sunLight.shadow.mapSize.width = s;
          sunLight.shadow.mapSize.height = s;
          sunLight.shadow.camera.near = 0.1;
          sunLight.shadow.camera.far = 500;
          sunLight.shadow.bias = -0.00002;
          sunLight.shadow.normalBias = 0.02;
        }

        // Update mesh shadow flags.
        setShadowForMesh(planet1.mesh, enable);
        setShadowForMesh(planet2.mesh, enable);
        setShadowForMesh(moon1.mesh, enable);

        // Starfield rebuild (scalable sky system entry point).
        if (path === 'graphics.starCount') {
          const n = configStore.get('graphics.starCount');
          scene.remove(stars);
          stars.geometry?.dispose?.();
          stars.material?.dispose?.();
          stars = buildStarfield({ THREE, starCount: n, radius: 2200 });
          scene.add(stars);
        }
      }

      if (path.startsWith('bodies.sun.')) {
        sun.mass = configStore.data.bodies.sun.mass;
        sun.radius = configStore.data.bodies.sun.radius;
        sun.mesh.scale.setScalar(sun.radius);
      }
      if (path.startsWith('bodies.planet1.')) {
        planet1.mass = configStore.data.bodies.planet1.mass;
        planet1.radius = configStore.data.bodies.planet1.radius;
        if (planet1.mesh?.isLOD) {
          for (const lvl of planet1.mesh.levels) lvl.object.scale.setScalar(planet1.radius);
        } else {
          planet1.mesh.scale.setScalar(planet1.radius);
        }
      }
      if (path.startsWith('bodies.planet2.')) {
        planet2.mass = configStore.data.bodies.planet2.mass;
        planet2.radius = configStore.data.bodies.planet2.radius;
        if (planet2.mesh?.isLOD) {
          for (const lvl of planet2.mesh.levels) lvl.object.scale.setScalar(planet2.radius);
        } else {
          planet2.mesh.scale.setScalar(planet2.radius);
        }
      }
      if (path.startsWith('bodies.moon1.')) {
        moon1.mass = configStore.data.bodies.moon1.mass;
        moon1.radius = configStore.data.bodies.moon1.radius;
        if (moon1.mesh?.isLOD) {
          for (const lvl of moon1.mesh.levels) lvl.object.scale.setScalar(moon1.radius);
        } else {
          moon1.mesh.scale.setScalar(moon1.radius);
        }
      }
    } catch (e) {
      debugOverlay.log('Config->body sync failed', e);
    }
  });

  return { sun, planet1, planet2, moon1, stars, sunLight };
}
