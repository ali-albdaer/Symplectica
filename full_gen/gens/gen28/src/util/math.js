import * as THREE from 'three';

export function clamp(x, a, b) {
	return Math.max(a, Math.min(b, x));
}

export function expSmoothingFactor(dt, lagSeconds) {
	// Returns alpha in [0,1] for exponential smoothing toward target.
	// Smaller lag -> larger alpha (faster response).
	if (lagSeconds <= 0) return 1;
	return 1 - Math.exp(-dt / lagSeconds);
}

export function projectOnPlane(v, normal) {
	// Remove normal component.
	const n = normal.clone().normalize();
	return v.clone().sub(n.multiplyScalar(v.dot(n)));
}

export function safeNormalize(v, fallback = new THREE.Vector3(0, 1, 0)) {
	const len = v.length();
	if (len < 1e-8) return fallback.clone();
	return v.clone().multiplyScalar(1 / len);
}
