export function makeSunMaterial({ THREE, emissiveStrength }) {
  return new THREE.MeshStandardMaterial({
    color: 0xfff1c1,
    emissive: 0xffc86b,
    emissiveIntensity: emissiveStrength,
    metalness: 0.0,
    roughness: 0.35,
  });
}

export function makePlanetMaterial({ THREE, albedo }) {
  // Single material for now; can be expanded later with textures/atmospheres.
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.55, 0.22, 0.35 + 0.25 * (1 - albedo)),
    metalness: 0.0,
    roughness: 0.95,
  });
}

export function makePropMaterial({ THREE, emissive, emissiveStrength }) {
  return new THREE.MeshStandardMaterial({
    color: 0xb7c7ff,
    emissive: emissive ? 0x7aa2ff : 0x000000,
    emissiveIntensity: emissive ? emissiveStrength : 0,
    metalness: 0.05,
    roughness: 0.7,
  });
}
