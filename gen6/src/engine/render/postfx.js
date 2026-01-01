import * as THREE from 'three';

// Optional postprocessing pipeline (kept minimal).
// Loaded as a normal module (no npm). Uses Three.js examples addons.

export async function createPostFX({ renderer, scene, camera, fidelity }) {
  const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }] = await Promise.all([
    import('three/addons/postprocessing/EffectComposer.js'),
    import('three/addons/postprocessing/RenderPass.js'),
    import('three/addons/postprocessing/UnrealBloomPass.js')
  ]);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const strength = fidelity === 2 ? 0.22 : fidelity === 1 ? 0.16 : 0.10;
  const radius = fidelity === 2 ? 0.45 : 0.35;
  const threshold = 0.92;

  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), strength, radius, threshold);
  composer.addPass(bloom);

  return {
    composer,
    setSize(w, h) {
      composer.setSize(w, h);
    },
    dispose() {
      composer.passes.length = 0;
      // EffectComposer doesn't expose a full dispose, but clearing passes releases most refs.
    }
  };
}
