export function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}
