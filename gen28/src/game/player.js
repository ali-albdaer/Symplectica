import * as THREE from 'three';
import { clamp } from '../util/math.js';
import { findNearestSurfaceBody, computeUpVector } from './collision.js';

export class PlayerController {
	constructor({ config, input, camera }) {
		this.config = config;
		this.input = input;
		this.camera = camera;

		this.body = null;
		this.freeFlight = false;
		this.firstPerson = true;

		this.yaw = 0;
		this.pitch = 0;
		this._lastGround = null;
		this._grounded = false;
	}

	attachPhysicsBody(body) {
		this.body = body;
	}

	toggleFlight() {
		this.freeFlight = !this.freeFlight;
		this._grounded = false;
	}

	toggleView() {
		this.firstPerson = !this.firstPerson;
	}

	updateLook(dt, upHint) {
		const { dx, dy } = this.input.consumeMouseDelta();
		const sens = this.config.player.camera.mouseSensitivity;
		this.yaw -= dx * sens;
		this.pitch -= dy * sens;
		this.pitch = clamp(this.pitch, -1.45, 1.45);

		// Apply camera orientation
		const q = this._computeViewQuaternion(upHint);
		this.camera.quaternion.copy(q);
	}

	updateMovement(dt, celestialBodies, jumpPressed) {
		if (!this.body) return;

		// Reset external acceleration each frame (world integrator will add it)
		this.body.externalAcceleration.set(0, 0, 0);

		const nearest = findNearestSurfaceBody(this.body.position, celestialBodies);
		this._lastGround = nearest.body;
		const up = computeUpVector(this.body.position, nearest.body);

		const axis = this.input.getAxis2D();
		const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
		const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

		if (!this.freeFlight) {
			// Walk: project directions to tangent plane of current ground
			const moveF = forward.clone().sub(up.clone().multiplyScalar(forward.dot(up))).normalize();
			const moveR = right.clone().sub(up.clone().multiplyScalar(right.dot(up))).normalize();
			const desiredDir = moveR.multiplyScalar(axis.x).add(moveF.multiplyScalar(axis.y));
			if (desiredDir.lengthSq() > 1e-6) desiredDir.normalize();

			const cfg = this.config.player.walk;
			const desiredVel = desiredDir.multiplyScalar(cfg.speed);

			// Tangential velocity control
			const v = this.body.velocity;
			const vT = v.clone().sub(up.clone().multiplyScalar(v.dot(up)));
			const dv = desiredVel.sub(vT);
			this.body.externalAcceleration.addScaledVector(dv, cfg.accel);

			// Damping (tangent only)
			this.body.externalAcceleration.addScaledVector(vT, -cfg.linearDamping);

			// Grounded detection (near surface)
			this._grounded = nearest.signedDistance < 0.05;
			if (this._grounded && jumpPressed) {
				// Jump: impulse along up
				this.body.velocity.addScaledVector(up, cfg.jumpSpeed);
				this._grounded = false;
			}
		} else {
			// Free flight: accelerate relative to camera
			const cfg = this.config.player.flight;
			const upCam = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
			let z = 0;
			if (this.input.isDown('Space')) z += 1;
			if (this.input.isDown('ShiftLeft') || this.input.isDown('ShiftRight')) z -= 1;

			const desiredDir = right.clone().multiplyScalar(axis.x)
				.add(forward.clone().multiplyScalar(axis.y))
				.add(upCam.clone().multiplyScalar(z));
			if (desiredDir.lengthSq() > 1e-6) desiredDir.normalize();

			const desiredVel = desiredDir.multiplyScalar(cfg.speed);
			const dv = desiredVel.sub(this.body.velocity);
			this.body.externalAcceleration.addScaledVector(dv, cfg.accel);
			this.body.externalAcceleration.addScaledVector(this.body.velocity, -cfg.linearDamping);
			this._grounded = false;
		}
	}

	getUpHint(celestialBodies) {
		if (!this.body) return new THREE.Vector3(0, 1, 0);
		if (this.freeFlight) return new THREE.Vector3(0, 1, 0);
		const nearest = findNearestSurfaceBody(this.body.position, celestialBodies);
		return computeUpVector(this.body.position, nearest.body);
	}

	_computeViewQuaternion(upHint) {
		// Build a camera basis with yaw about upHint (for walking) and pitch about right.
		const up = (upHint || new THREE.Vector3(0, 1, 0)).clone().normalize();
		const worldX = new THREE.Vector3(1, 0, 0);
		const worldZ = new THREE.Vector3(0, 0, 1);
		let east = new THREE.Vector3().crossVectors(worldZ, up);
		if (east.lengthSq() < 1e-6) east = new THREE.Vector3().crossVectors(worldX, up);
		east.normalize();
		const north = new THREE.Vector3().crossVectors(up, east).normalize();

		// Forward in tangent plane from yaw
		const forwardTangent = north.clone().multiplyScalar(Math.cos(this.yaw))
			.add(east.clone().multiplyScalar(Math.sin(this.yaw))).normalize();
		const right = new THREE.Vector3().crossVectors(up, forwardTangent).normalize();
		const qPitch = new THREE.Quaternion().setFromAxisAngle(right, this.pitch);

		// Construct quaternion from basis (right, up', forward')
		const f2 = forwardTangent.clone().applyQuaternion(qPitch).normalize();
		const r2 = new THREE.Vector3().crossVectors(up, f2).normalize();
		const u2 = new THREE.Vector3().crossVectors(r2, f2).normalize();

		const m = new THREE.Matrix4();
		m.makeBasis(r2, u2, f2.clone().multiplyScalar(-1));
		const q = new THREE.Quaternion().setFromRotationMatrix(m);
		return q;
	}

	get grounded() { return this._grounded; }
	get referenceBody() { return this._lastGround; }
}
