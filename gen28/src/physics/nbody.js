import * as THREE from 'three';

export class NBodyWorld {
	constructor({ G = 1, softening = 0.01 } = {}) {
		this.G = G;
		this.softening = softening;
		this.bodies = []; // dynamic + kinematic bodies
		this._acc = new Map();
	}

	addBody(body) {
		this.bodies.push(body);
		return body;
	}

	removeBody(body) {
		const idx = this.bodies.indexOf(body);
		if (idx >= 0) this.bodies.splice(idx, 1);
		this._acc.delete(body);
	}

	computeAccelerations() {
		this._acc.clear();
		for (const b of this.bodies) {
			this._acc.set(b, new THREE.Vector3());
		}

		const eps2 = this.softening * this.softening;
		const n = this.bodies.length;
		for (let i = 0; i < n; i++) {
			const bi = this.bodies[i];
			if (bi.mass <= 0) continue;
			for (let j = i + 1; j < n; j++) {
				const bj = this.bodies[j];
				if (bj.mass <= 0) continue;

				const r = bj.position.clone().sub(bi.position);
				const d2 = r.lengthSq() + eps2;
				const invD = 1 / Math.sqrt(d2);
				const invD3 = invD * invD * invD;

				// Acceleration contribution: a_i += G*m_j * r / |r|^3
				// and a_j -= G*m_i * r / |r|^3
				const aScaleI = this.G * bj.mass * invD3;
				const aScaleJ = this.G * bi.mass * invD3;

				this._acc.get(bi).addScaledVector(r, aScaleI);
				this._acc.get(bj).addScaledVector(r, -aScaleJ);
			}
		}

		// Add external accelerations (controls, constraints, drag, etc.)
		for (const b of this.bodies) {
			if (b.kinematic) continue;
			if (b.externalAcceleration) {
				this._acc.get(b).add(b.externalAcceleration);
			}
		}

		return this._acc;
	}

	stepLeapfrog(dt) {
		// Kick-drift-kick (velocity Verlet) for good long-term energy behavior.
		const a0 = this.computeAccelerations();
		for (const b of this.bodies) {
			if (b.kinematic) continue;
			const a = a0.get(b);
			b.velocity.addScaledVector(a, 0.5 * dt);
		}

		for (const b of this.bodies) {
			if (b.kinematic) continue;
			b.position.addScaledVector(b.velocity, dt);
		}

		const a1 = this.computeAccelerations();
		for (const b of this.bodies) {
			if (b.kinematic) continue;
			const a = a1.get(b);
			b.velocity.addScaledVector(a, 0.5 * dt);
		}
	}
}

export class PhysicsBody {
	constructor({ name = 'Body', mass = 1, radius = 1, position, velocity, kinematic = false } = {}) {
		this.name = name;
		this.mass = mass;
		this.radius = radius;
		this.position = position ? position.clone() : new THREE.Vector3();
		this.velocity = velocity ? velocity.clone() : new THREE.Vector3();
		this.kinematic = kinematic;
		this.externalAcceleration = new THREE.Vector3();
	}
}
