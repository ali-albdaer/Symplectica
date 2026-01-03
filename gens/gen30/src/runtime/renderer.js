import * as THREE from 'three';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, logarithmicDepthBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 10_000_000);

  function onResize(w, h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  function setFidelity(level) {
    // 0=Low, 1=Medium, 2=Ultra
    const shadowSize = level === 2 ? 2048 : level === 1 ? 1024 : 512;
    renderer.shadowMap.type = level === 2 ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    renderer.setPixelRatio(level === 0 ? Math.min(1.25, window.devicePixelRatio || 1) : Math.min(2, window.devicePixelRatio || 1));
    return { shadowSize };
  }

  return { renderer, scene, camera, onResize, setFidelity };
}
