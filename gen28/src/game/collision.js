import * as THREE from 'three';

export function resolveSpherePlanetCollisions(dynamicBodies, celestialBodies, opts = {}) {
	const restitution = opts.restitution ?? 0.05;
	for (const b of dynamicBodies) {
		for (const c of celestialBodies) {
			const planet = c.body;
			const r = b.radius + planet.radius;
			const delta = b.position.clone().sub(planet.position);
			const dist = delta.length();
			if (dist <= 1e-8) continue;
			if (dist < r) {
				const n = delta.multiplyScalar(1 / dist);
				// Push out
				b.position.addScaledVector(n, (r - dist));
				// Cancel inward velocity
				const vn = b.velocity.dot(n);
				if (vn < 0) {
					b.velocity.addScaledVector(n, -(1 + restitution) * vn);
				}
			}
		}
	}
}

export function findNearestSurfaceBody(pos, celestialBodies) {
	let best = null;
	let bestSigned = Infinity;
	for (const c of celestialBodies) {
		const planet = c.body;
		const dist = pos.distanceTo(planet.position);
		const signed = dist - planet.radius;
		if (signed < bestSigned) {
			bestSigned = signed;
			best = c;
		}
	}
	return { body: best, signedDistance: bestSigned };
}

export function computeUpVector(pos, refBody) {
	if (!refBody) return new THREE.Vector3(0, 1, 0);
	return pos.clone().sub(refBody.body.position).normalize();
}
