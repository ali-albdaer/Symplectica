import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { config } from './config.js';

export function setupRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(config.pixelRatio[config.fidelity] || 1);
  renderer.shadowMap.enabled = config.enableShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.physicallyCorrectLights = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function createCameras() {
  const fpCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5e9);
  const tpCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5e9);
  return { fpCamera, tpCamera };
}

export function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  return scene;
}

export function setupSunLight(scene, sunBody) {
  const light = new THREE.PointLight(sunBody.color || 0xfff2d0, 1.0, 0, 2);
  light.position.copy(sunBody.position);
  light.castShadow = config.enableShadows;
  light.shadow.mapSize.set(config.shadowSize[config.fidelity], config.shadowSize[config.fidelity]);
  light.shadow.bias = -1e-4;
  scene.add(light);
  return light;
}

export function resize(renderer, cameras) {
  const { innerWidth: w, innerHeight: h } = window;
  renderer.setSize(w, h);
  for (const cam of [cameras.fpCamera, cameras.tpCamera]) {
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
}
