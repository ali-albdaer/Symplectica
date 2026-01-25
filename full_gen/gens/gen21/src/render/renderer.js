// Rendering system: Three.js scene, cameras, lighting, sky, and LOD

import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

import { Config, FidelityLevel } from "../core/config.js";
import { Debug } from "../core/debug.js";

export function createRendererSystem({ container, scene, celestialBodies, playerBody, microObjects }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.1, 1000);

  const root = new THREE.Group();
  scene.add(root);

  // Skybox: large star sphere
  const starGeometry = new THREE.BufferGeometry();
  const stars = getStarCountForFidelity();
  const positions = new Float32Array(stars * 3);
  const radius = Config.rendering.stars.radius;
  for (let i = 0; i < stars; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true });
  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);

  // Sun light source
  const sunBody = celestialBodies.find((b) => b.id === "sun");
  const sunLight = new THREE.PointLight(0xffffff, Config.celestial.sun.luminosity, 0, 2);
  sunLight.castShadow = Config.rendering.enableShadows;
  sunLight.shadow.mapSize.set(getShadowSizeForFidelity(), getShadowSizeForFidelity());
  if (sunBody) {
    sunLight.position.copy(sunBody.position);
  }
  scene.add(sunLight);

  const objectsByBodyId = new Map();
  const lightsByBodyId = new Map();

  // Create meshes for celestial bodies and micro objects
  function createBodyMesh(body) {
    const segments = getSegmentsForFidelity(body.isCelestial);
    const geom = new THREE.SphereGeometry(body.radius, segments, segments);
    let material;
    if (body.id === "sun") {
      material = new THREE.MeshStandardMaterial({
        emissive: new THREE.Color(1, 0.85, 0.4),
        emissiveIntensity: 2.0,
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.2,
      });
    } else if (body.id === "moon1") {
      material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 1.0, metalness: 0.1 });
    } else if (body.id.startsWith("planet")) {
      material = new THREE.MeshStandardMaterial({ color: 0x3366ff, roughness: 0.8, metalness: 0.2 });
    } else if (body.id.startsWith("micro_")) {
      material = new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0x442200, emissiveIntensity: 0.5 });
    } else if (body.id === "player") {
      material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
    } else {
      material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    }
    const mesh = new THREE.Mesh(geom, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);

    // Small luminous lights on micro objects to make them visually distinct
    if (body.id.startsWith("micro_")) {
      const light = new THREE.PointLight(0xffaa55, 0.8, 5, 2);
      light.castShadow = false;
      light.position.copy(body.position);
      scene.add(light);
      lightsByBodyId.set(body.id, light);
    }

    return mesh;
  }

  const allBodies = [...celestialBodies, playerBody, ...microObjects];
  for (const b of allBodies) {
    const mesh = createBodyMesh(b);
    objectsByBodyId.set(b.id, mesh);
  }

  function getStarCountForFidelity() {
    switch (Config.rendering.fidelity) {
      case FidelityLevel.LOW:
        return Config.rendering.stars.countLow;
      case FidelityLevel.ULTRA:
        return Config.rendering.stars.countUltra;
      case FidelityLevel.MEDIUM:
      default:
        return Config.rendering.stars.countMedium;
    }
  }

  function getShadowSizeForFidelity() {
    switch (Config.rendering.fidelity) {
      case FidelityLevel.LOW:
        return Config.rendering.shadowMapSizes.low;
      case FidelityLevel.ULTRA:
        return Config.rendering.shadowMapSizes.ultra;
      case FidelityLevel.MEDIUM:
      default:
        return Config.rendering.shadowMapSizes.medium;
    }
  }

  function getSegmentsForFidelity(isCelestial) {
    if (!isCelestial) return 16;
    switch (Config.rendering.fidelity) {
      case FidelityLevel.LOW:
        return 16;
      case FidelityLevel.ULTRA:
        return 48;
      case FidelityLevel.MEDIUM:
      default:
        return 32;
    }
  }

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener("resize", onResize);

  const tempVec = new THREE.Vector3();

  function updateMeshesFromPhysics() {
    for (const [id, mesh] of objectsByBodyId.entries()) {
      const body = allBodies.find((b) => b.id === id);
      if (!body) continue;

      // Simple distance-based LOD (can be disabled via Config.rendering.lodEnabled)
      if (Config.rendering.lodEnabled && body.isCelestial) {
        const dist = mesh.position.length();
        mesh.visible = dist < 400;
      } else {
        mesh.visible = true;
      }

      mesh.position.copy(body.position);

      const light = lightsByBodyId.get(id);
      if (light) {
        light.position.copy(body.position);
      }
    }
  }

  function updateLighting() {
    if (sunBody) {
      sunLight.position.copy(sunBody.position);
    }
  }

  function render(dt) {
    updateMeshesFromPhysics();
    updateLighting();
    renderer.render(scene, camera);
  }

  function init() {
    onResize();
    scene.background = new THREE.Color(0x000000);
    const ambient = new THREE.AmbientLight(0x000000);
    scene.add(ambient); // effectively none; keeps materials happy
    Debug.log("Renderer initialized");
  }

  function dispose() {
    window.removeEventListener("resize", onResize);
    renderer.dispose();
  }

  return {
    renderer,
    scene,
    camera,
    root,
    starField,
    init,
    render,
    dispose,
  };
}
