export function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

export function smoothDamp(current, target, currentVelocityRef, smoothTime, dt) {
  // Critically damped smoothing. Similar to Unity SmoothDamp.
  const omega = 2 / Math.max(1e-5, smoothTime);
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const temp = (currentVelocityRef.value + omega * change) * dt;
  currentVelocityRef.value = (currentVelocityRef.value - omega * temp) * exp;
  const out = target + (change + temp) * exp;
  return out;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
