import * as THREE from "three";

export function createRenderer(container, fidelity) {
  const renderer = new THREE.WebGLRenderer({ antialias: fidelity.postAA === "smaa" });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, fidelity.enableShadows ? 1.5 : 1.2));
  renderer.shadowMap.enabled = fidelity.enableShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  return renderer;
}

export function createScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02040a, 0.0008);
  return scene;
}

export function createCamera(container) {
  const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.05, 5000);
  return camera;
}

export function createStarfield(config) {
  const geometry = new THREE.BufferGeometry();
  const count = config.starCount;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const r = config.skyRadius;
    const theta = Math.acos(2 * Math.random() - 1) - Math.PI / 2;
    const phi = 2 * Math.PI * Math.random();
    const radius = THREE.MathUtils.lerp(config.starMinRadius, config.starMaxRadius, Math.random());
    const x = r * Math.cos(theta) * Math.cos(phi);
    const y = r * Math.sin(theta);
    const z = r * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    color.setHSL(0.58 + 0.1 * Math.random(), 0.25 + 0.1 * Math.random(), 0.7 + 0.25 * Math.random());
    colors[i * 3 + 0] = color.r * radius;
    colors[i * 3 + 1] = color.g * radius;
    colors[i * 3 + 2] = color.b * radius;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 1.7, vertexColors: true, depthWrite: false, transparent: true, opacity: 0.95 });
  const stars = new THREE.Points(geometry, material);
  return stars;
}

export function makeSunLight() {
  const light = new THREE.DirectionalLight(0xfff3c6, 1.8);
  light.castShadow = true;
  light.shadow.bias = -0.0005;
  light.shadow.mapSize.set(2048, 2048);
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 2000;
  light.shadow.camera.left = -180;
  light.shadow.camera.right = 180;
  light.shadow.camera.top = 180;
  light.shadow.camera.bottom = -180;
  return light;
}

export function resizeRenderer(renderer, camera, container) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
