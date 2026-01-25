// Robust, scalable starfield: static GPU points.
// Expandable later into catalogs, nebulae, procedural milky-way bands, etc.

export function buildStarfield({ THREE, starCount, radius }) {
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  const color = new THREE.Color();

  for (let i = 0; i < starCount; i++) {
    // Uniform distribution on sphere.
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    const r = radius;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Cheap color temperature variation.
    const t = Math.random();
    if (t < 0.65) color.setRGB(1.0, 1.0, 1.0);
    else if (t < 0.85) color.setRGB(0.85, 0.9, 1.0);
    else color.setRGB(1.0, 0.86, 0.75);

    const intensity = 0.5 + 0.5 * Math.random();
    colors[i * 3 + 0] = color.r * intensity;
    colors[i * 3 + 1] = color.g * intensity;
    colors[i * 3 + 2] = color.b * intensity;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.9,
    sizeAttenuation: false,
    vertexColors: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geom, mat);
  points.frustumCulled = false;
  return points;
}
