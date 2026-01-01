import { Config } from "../Config.js";
import { clamp } from "../utils/math.js";

// Pairwise N-body gravity.
// Applies forces to Cannon bodies (semi-implicit Euler via cannon-es). Tuned for stability with fixed dt + softening.
export class GravitySystem {
	constructor() {
		this.bodies = []; // entries: { body, radius, mass, tags }
	}

	setBodies(list) {
		this.bodies = list;
	}

	beforePhysics() {
		const list = this.bodies;
		const G = Config.sim.G;
		const eps2 = Config.sim.softeningEps * Config.sim.softeningEps;
		const maxA = Config.sim.maxAccel;
		for (let i = 0; i < list.length; i++) {
			for (let j = i + 1; j < list.length; j++) {
				const a = list[i];
				const b = list[j];
				if (!a?.body || !b?.body) continue;

				const dx = b.body.position.x - a.body.position.x;
				const dy = b.body.position.y - a.body.position.y;
				const dz = b.body.position.z - a.body.position.z;
				const r2 = dx * dx + dy * dy + dz * dz + eps2;
				const invR = 1 / Math.sqrt(r2);
				const invR3 = invR * invR * invR;

				// Force magnitude: G*m1*m2/r^2 (but we compute direction*invR3).
				let fx = G * a.body.mass * b.body.mass * dx * invR3;
				let fy = G * a.body.mass * b.body.mass * dy * invR3;
				let fz = G * a.body.mass * b.body.mass * dz * invR3;

				// Clamp accelerations for numeric stability.
				const aMagA = Math.sqrt(fx * fx + fy * fy + fz * fz) / Math.max(1e-6, a.body.mass);
				if (aMagA > maxA) {
					const s = maxA / aMagA;
					fx *= s;
					fy *= s;
					fz *= s;
				}
				const aMagB = Math.sqrt(fx * fx + fy * fy + fz * fz) / Math.max(1e-6, b.body.mass);
				if (aMagB > maxA) {
					const s = maxA / aMagB;
					fx *= s;
					fy *= s;
					fz *= s;
				}

				a.body.force.x += fx;
				a.body.force.y += fy;
				a.body.force.z += fz;
				b.body.force.x -= fx;
				b.body.force.y -= fy;
				b.body.force.z -= fz;
			}
		}
	}
}
