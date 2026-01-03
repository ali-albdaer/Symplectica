import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { Config } from '../core/config.js';
import { State } from '../core/state.js';

export function initLighting() {
  const sunEntry = State.celestialBodies.find((b) => b.config.name === 'Sun');
  if (!sunEntry) return;

  const light = new THREE.PointLight(0xfff3c0, 2.2, 0, 2);
  light.position.copy(sunEntry.body.position);
  light.castShadow = Config.rendering.enableShadows;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.bias = -0.0001;

  State.scene.add(light);
}
