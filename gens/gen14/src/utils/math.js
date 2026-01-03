export function clamp(x, lo, hi) {
	return Math.max(lo, Math.min(hi, x));
}

export function lerp(a, b, t) {
	return a + (b - a) * t;
}

export function smoothstep(t) {
	t = clamp(t, 0, 1);
	return t * t * (3 - 2 * t);
}

export function vec3ToObj(v) {
	return { x: v.x, y: v.y, z: v.z };
}
