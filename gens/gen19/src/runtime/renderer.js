import * as THREE from 'three';
import { Config } from '../sim/config.js';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  applyShadowSettings(renderer);

  return renderer;
}

export function applyShadowSettings(renderer) {
  const fidelity = Config.render.fidelity;

  const shadowsEnabled = Config.render.shadows.enabled && fidelity !== 'LOW';
  renderer.shadowMap.enabled = shadowsEnabled;

  if (shadowsEnabled) {
    renderer.shadowMap.type = Config.render.shadows.pcfSoft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  }
}
