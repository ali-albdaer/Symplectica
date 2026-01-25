// Circular orbit speeds for the two-body problem at separation r.
// Angular speed:
//   ω = sqrt(G*(M+m)/r^3)
// Satellite distance to barycenter: r_s = r * M/(M+m)
// Central distance to barycenter:   r_c = r * m/(M+m)
// Speeds around barycenter:
//   v_s = ω * r_s
//   v_c = ω * r_c

export function computeCircularOrbitAngularSpeed(G, M, m, r) {
  const rr = Math.max(1e-6, r);
  return Math.sqrt((G * (M + m)) / (rr * rr * rr));
}

export function computeBarycentricCircularSpeeds(G, M, m, r) {
  const omega = computeCircularOrbitAngularSpeed(G, M, m, r);
  const denom = Math.max(1e-12, M + m);
  const vSatellite = omega * r * (M / denom);
  const vCentral = omega * r * (m / denom);
  return { vSatellite, vCentral };
}
