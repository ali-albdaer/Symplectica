import { THREE } from '../vendor.js';

function fidelityParams(fidelity) {
  switch (fidelity) {
    case 'Low':
      return { shadowMapSize: 1024, starCount: 2500 };
    case 'Ultra':
      return { shadowMapSize: 4096, starCount: 12000 };
    case 'Medium':
    default:
      return { shadowMapSize: 2048, starCount: 6000 };
  }
}

export function createRenderer(canvas, configStore, debugOverlay) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.physicallyCorrectLights = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    configStore.get('player.camera.fov'),
    1,
    configStore.get('player.camera.near'),
    configStore.get('player.camera.far')
  );

  const clock = new THREE.Clock();

  function applyGraphicsConfig() {
    const fidelity = configStore.get('graphics.fidelity');
    const params = fidelityParams(fidelity);

    const pixelRatioCap = configStore.get('graphics.pixelRatioCap');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));

    const enableShadows = configStore.get('graphics.enableShadows');
    renderer.shadowMap.enabled = enableShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.userData.shadowMapSize = params.shadowMapSize;

    // Stars will use configStore.graphics.starCount, but we keep defaults in sync.
    configStore.patch('graphics.starCount', configStore.get('graphics.starCount') ?? params.starCount);
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resize);

  applyGraphicsConfig();
  resize();

  configStore.onChange((path) => {
    if (path.startsWith('graphics.') || path.startsWith('player.camera.')) {
      try {
        camera.fov = configStore.get('player.camera.fov');
        camera.near = configStore.get('player.camera.near');
        camera.far = configStore.get('player.camera.far');
        camera.updateProjectionMatrix();
        applyGraphicsConfig();
      } catch (e) {
        debugOverlay.log('Renderer config update failed', e);
      }
    }
  });

  return { renderer, scene, camera, clock };
}
