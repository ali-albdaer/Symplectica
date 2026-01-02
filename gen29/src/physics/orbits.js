// Helper for initial stable-ish circular orbit speeds.
// IMPORTANT: Orbits are still a consequence of N-body gravity; we only compute initial tangential velocities.

export function stableOrbitVelocity(configStore, centralMass, radius) {
  const G = configStore.get('sim.G');
  // Circular orbit approximation assuming centralMass dominates.
  return Math.sqrt((G * centralMass) / Math.max(1e-9, radius));
}
