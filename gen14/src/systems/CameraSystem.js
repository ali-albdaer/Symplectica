import * as THREE from "../vendor/three.js";
import { Config } from "../Config.js";

export class CameraSystem {
	constructor(camera) {
		this.camera = camera;
		this._targetPos = new THREE.Vector3();
		this._tmp = new THREE.Vector3();
		this._mode = Config.player.camera.mode;
		this._cinematic = this._mode === "ThirdPerson";
	}

	setMode(mode) {
		this._mode = mode;
		Config.player.camera.mode = mode;
		this._cinematic = mode === "ThirdPerson";
	}

	toggleMode() {
		this.setMode(this._cinematic ? "FirstPerson" : "ThirdPerson");
	}

	update({ player }) {
		if (!player?.body) return;
		const cam = this.camera;

		const p = player.body.position;
		if (this._cinematic) {
			const o = Config.player.camera.thirdPerson.offset;
			// Offset is in camera local space, so use camera quaternion.
			this._tmp.set(o.x, o.y, o.z);
			this._tmp.applyQuaternion(cam.quaternion);
			this._targetPos.set(p.x + this._tmp.x, p.y + this._tmp.y, p.z + this._tmp.z);
			cam.position.lerp(this._targetPos, Config.player.camera.thirdPerson.lerp);

			// Look at player with smooth slerp.
			const lookAt = new THREE.Vector3(p.x, p.y + 1.0, p.z);
			const m = new THREE.Matrix4().lookAt(cam.position, lookAt, new THREE.Vector3(0, 1, 0));
			const q = new THREE.Quaternion().setFromRotationMatrix(m);
			cam.quaternion.slerp(q, Config.player.camera.thirdPerson.slerp);
		} else {
			const h = Config.player.camera.firstPerson.height;
			this._targetPos.set(p.x, p.y + h, p.z);
			cam.position.lerp(this._targetPos, Config.player.camera.firstPerson.lerp);
			// Quaternion is driven by Player mouse-look.
		}
	}
}
