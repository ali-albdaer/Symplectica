import { CANNON } from "../vendor/cannon.js";
import { Config } from "../Config.js";

export class Physics {
	constructor() {
		this.CANNON = CANNON;
		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, 0, 0),
		});
		this.world.allowSleep = false;
		this.world.broadphase = new CANNON.NaiveBroadphase();
		this.world.solver.iterations = 12;
		this.world.solver.tolerance = 1e-7;

		this._materials = new Map();
	}

	step(dt) {
		const scaledDt = dt * Config.sim.timeScale;
		this.world.step(Config.sim.fixedTimeStep, scaledDt, Config.sim.maxSubSteps);
	}

	createSphereBody({ mass, radius, position, linearDamping = 0, angularDamping = 0.1, type = "dynamic", name }) {
		const body = new CANNON.Body({
			mass,
			shape: new CANNON.Sphere(radius),
			position: new CANNON.Vec3(position.x, position.y, position.z),
			linearDamping,
			angularDamping,
			name: name ?? "Sphere",
			type: type === "static" ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
		});
		this.world.addBody(body);
		return body;
	}

	createBoxBody({ mass, halfExtents, position, linearDamping = 0, angularDamping = 0.1, type = "dynamic", name }) {
		const body = new CANNON.Body({
			mass,
			shape: new CANNON.Box(new CANNON.Vec3(halfExtents.x, halfExtents.y, halfExtents.z)),
			position: new CANNON.Vec3(position.x, position.y, position.z),
			linearDamping,
			angularDamping,
			name: name ?? "Box",
			type: type === "static" ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
		});
		this.world.addBody(body);
		return body;
	}

	createKinematicBody({ position, name }) {
		const body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(position.x, position.y, position.z),
			name: name ?? "Kinematic",
			type: CANNON.Body.KINEMATIC,
		});
		this.world.addBody(body);
		return body;
	}

	addConstraint(constraint) {
		this.world.addConstraint(constraint);
	}

	removeConstraint(constraint) {
		this.world.removeConstraint(constraint);
	}
}
