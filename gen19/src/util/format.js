export function formatVec3(v) {
  if (!v) return '—';
  const x = Number.isFinite(v.x) ? v.x : 0;
  const y = Number.isFinite(v.y) ? v.y : 0;
  const z = Number.isFinite(v.z) ? v.z : 0;
  return `${fmt(x)} ${fmt(y)} ${fmt(z)} m`;
}

function fmt(n) {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(3)}G`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(3)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(3)}k`;
  return n.toFixed(2);
}
