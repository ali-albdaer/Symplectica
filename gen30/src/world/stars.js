import * as THREE from 'three';

// Lightweight procedural starfield: a single Points draw call.
export function createStarfield({ radiusUnits, count, seed }) {
  const rng = mulberry32(seed >>> 0);

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Uniform direction on sphere
    const u = rng();
    const v = rng();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);

    const r = radiusUnits;
    positions[i * 3 + 0] = x * r;
    positions[i * 3 + 1] = y * r;
    positions[i * 3 + 2] = z * r;

    // Slight color variance (cool/warm stars) without being expensive.
    const t = rng();
    const warm = 0.85 + 0.15 * rng();
    const cool = 0.85 + 0.15 * rng();
    const cr = THREE.MathUtils.lerp(cool, 1.0, t);
    const cg = THREE.MathUtils.lerp(cool, warm, t);
    const cb = THREE.MathUtils.lerp(1.0, warm, t);

    const intensity = 0.5 + 0.5 * Math.pow(rng(), 6);
    colors[i * 3 + 0] = cr * intensity;
    colors[i * 3 + 1] = cg * intensity;
    colors[i * 3 + 2] = cb * intensity;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 1.15,
    sizeAttenuation: false,
    vertexColors: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geom, mat);
  points.frustumCulled = false;
  points.renderOrder = -10;
  return points;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
