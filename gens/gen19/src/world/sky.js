import * as THREE from 'three';

export function createSky({ scene, getConfig }) {
  const group = new THREE.Group();
  scene.add(group);

  let stars = null;

  function build() {
    group.clear();
    stars = null;

    const cfg = getConfig();
    if (!cfg.render.stars.enabled) return;

    const count = cfg.render.stars.count;
    const r = cfg.render.stars.radiusMeters;

    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const rnd = mulberry32(cfg.render.stars.seed);

    for (let i = 0; i < count; i++) {
      // Uniform on sphere
      const u = rnd();
      const v = rnd();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Slight color variance (blue-white to warm)
      const t = rnd();
      const c = starColor(t);
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 2.2e6,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });

    stars = new THREE.Points(geom, mat);
    stars.frustumCulled = false;
    group.add(stars);
  }

  build();

  return { rebuild: build };
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function starColor(t) {
  // Simple gradient: cool -> neutral -> warm
  const cool = new THREE.Color(0x9cc9ff);
  const mid = new THREE.Color(0xffffff);
  const warm = new THREE.Color(0xffd1a3);

  if (t < 0.6) {
    return cool.clone().lerp(mid, t / 0.6);
  }
  return mid.clone().lerp(warm, (t - 0.6) / 0.4);
}
