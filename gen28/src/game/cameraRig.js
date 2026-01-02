import * as THREE from 'three';
import { expSmoothingFactor } from '../util/math.js';

export class CameraRig {
	constructor({ config, camera }) {
		this.config = config;
		this.camera = camera;
		this.mode = 'first'; // first | third
		this._thirdPos = new THREE.Vector3();
		this._thirdInit = false;
	}

	setMode(mode) {
		this.mode = mode;
		if (mode !== 'third') this._thirdInit = false;
	}

	update(dt, playerPos, playerUp, viewForward) {
		if (this.mode === 'first') {
			const head = playerPos.clone().addScaledVector(playerUp, 0.9);
			this.camera.position.copy(head);
			return;
		}

		// Smooth third-person: cinematic follow with lag.
		const cfg = this.config.player.camera;
		const target = playerPos.clone().addScaledVector(playerUp, cfg.thirdPersonHeight);
		const behind = viewForward.clone().multiplyScalar(-cfg.thirdPersonDistance);
		const desired = target.clone().add(behind);

		if (!this._thirdInit) {
			this._thirdPos.copy(desired);
			this._thirdInit = true;
		}

		const a = expSmoothingFactor(dt, cfg.thirdPersonLag);
		this._thirdPos.lerp(desired, a);
		this.camera.position.copy(this._thirdPos);
	}
}
