import * as THREE from 'three';

export class GrabSystem {
	constructor({ config, input, camera }) {
		this.config = config;
		this.input = input;
		this.camera = camera;
		this.grabbed = null; // Prop
	}

	update(dt, props) {
		if (this.input.consumeRightClick()) {
			if (this.grabbed) {
				this.grabbed = null;
			} else {
				this.grabbed = this._findClosestPropInReach(props);
			}
		}

		if (!this.grabbed) return;

		const cfg = this.config.props.grab;
		const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
		const target = this.camera.position.clone().addScaledVector(forward, cfg.distance);

		const body = this.grabbed.body;
		const delta = target.sub(body.position);

		// Spring-damper in acceleration units.
		body.externalAcceleration.addScaledVector(delta, cfg.spring);
		body.externalAcceleration.addScaledVector(body.velocity, -cfg.damping);
	}

	_findClosestPropInReach(props) {
		const cfg = this.config.props.grab;
		let best = null;
		let bestD = Infinity;
		for (const p of props) {
			const d = p.body.position.distanceTo(this.camera.position);
			if (d < cfg.distance + p.body.radius && d < bestD) {
				bestD = d;
				best = p;
			}
		}
		return best;
	}
}
