import * as THREE from "../vendor/three.js";
import { CANNON } from "../vendor/cannon.js";
import { Config } from "../Config.js";

export class GrabSystem {
	constructor({ physics, camera, domElement }) {
		this.physics = physics;
		this.camera = camera;
		this.domElement = domElement;

		this.raycaster = new THREE.Raycaster();
		this._grabBody = null;
		this._constraint = null;
		this._grabbed = null;

		this._tmp = new THREE.Vector3();
		this._dir = new THREE.Vector3();
	}

	isGrabbing() {
		return !!this._constraint;
	}

	release() {
		if (this._constraint) {
			this.physics.removeConstraint(this._constraint);
			this._constraint = null;
		}
		this._grabbed = null;
	}

	tryGrab({ scene, meshToEntity }) {
		if (this.isGrabbing()) return;

		this._dir.set(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
		this.raycaster.set(this.camera.position, this._dir);
		this.raycaster.far = Config.player.interaction.grabDistance;

		const hits = this.raycaster.intersectObjects(scene.children, true);
		for (const h of hits) {
			const ent = meshToEntity.get(h.object) ?? meshToEntity.get(h.object?.parent);
			if (!ent || !ent.tags?.has("interactive") || !ent.body) continue;
			this._grabbed = ent;

			if (!this._grabBody) {
				this._grabBody = this.physics.createKinematicBody({ position: { x: 0, y: 0, z: 0 }, name: "GrabAnchor" });
			}

			this._updateAnchor();
			this._constraint = new CANNON.PointToPointConstraint(
				ent.body,
				new CANNON.Vec3(0, 0, 0),
				this._grabBody,
				new CANNON.Vec3(0, 0, 0),
				Config.player.interaction.grabStiffness,
			);
			this.physics.addConstraint(this._constraint);
			return;
		}
	}

	_updateAnchor() {
		if (!this._grabBody) return;
		this._dir.set(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
		this._tmp.copy(this.camera.position).addScaledVector(this._dir, Config.player.interaction.holdDistance);
		this._grabBody.position.set(this._tmp.x, this._tmp.y, this._tmp.z);
		this._grabBody.velocity.set(0, 0, 0);
	}

	beforePhysics() {
		if (!this.isGrabbing()) return;
		this._updateAnchor();
	}
}
