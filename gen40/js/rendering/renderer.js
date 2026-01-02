import { Config } from '../core/config.js';
import { State } from '../core/state.js';

export async function initRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = Config.rendering.enableShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  State.renderer = renderer;
}
