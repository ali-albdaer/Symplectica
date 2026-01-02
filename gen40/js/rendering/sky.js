import { Config } from '../core/config.js';
import { State } from '../core/state.js';

export function initSky() {
  const starGeo = new THREE.BufferGeometry();
  const starCount = Math.floor(2000 * Config.rendering.starfieldDensity);
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const v = randomPointOnSphere(800);
    positions[i * 3 + 0] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    sizeAttenuation: true,
    depthWrite: false,
    transparent: true,
    opacity: 0.9
  });

  const stars = new THREE.Points(starGeo, starMat);
  State.scene.add(stars);

  State.sky = {
    mesh: stars,
    update(dt) {
      stars.rotation.y += dt * 0.001;
    }
  };
}

function randomPointOnSphere(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * Math.cos(phi),
    r * sinPhi * Math.sin(theta)
  );
}
