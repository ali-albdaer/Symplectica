import * as THREE from "../vendor/three.js";
import { Entity } from "./Entity.js";
import { clamp } from "../utils/math.js";
import { Config } from "../Config.js";

export class Player extends Entity {
	constructor() {
		super("Player");
		this.body = null;
		this.mesh = null;
		this.flightEnabled = false;
		this._yaw = 0;
		this._pitch = 0;
		this._up = new THREE.Vector3(0, 1, 0);
		this._desiredUp = new THREE.Vector3(0, 1, 0);
		this._tmpV = new THREE.Vector3();
		this._tmpW = new THREE.Vector3();
	}

	init({ physics, scene }) {
		// Physics body: sphere for simplicity.
		this.body = physics.createSphereBody({
			mass: 1,
			radius: 0.45,
			position: { ...Config.player.spawn.position },
			linearDamping: Config.player.walking.damping,
			angularDamping: 1.0,
			name: this.name,
		});
		this.body.allowSleep = false;
		this.body.fixedRotation = true;
		this.body.updateMassProperties();

		// Visual avatar.
		const geo = new THREE.CapsuleGeometry(0.35, 1.1, 10, 18);
		const mat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.9, metalness: 0.0 });
		this.mesh = new THREE.Mesh(geo, mat);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		scene.add(this.mesh);
	}

	toggleFlight() {
		this.flightEnabled = !this.flightEnabled;
		this.body.linearDamping = this.flightEnabled ? Config.player.flight.damping : Config.player.walking.damping;
	}

	beforePhysics({ input, camera, gravitySources }) {
		if (!this.body) return;

		// Mouse look (pointer lock).
		if (input.isPointerLocked()) {
			const md = input.consumeMouseDelta();
			this._yaw -= md.x * 0.002;
			this._pitch -= md.y * 0.002;
			this._pitch = clamp(this._pitch, -1.45, 1.45);
		}

		// Determine "up" vector: align to nearby planet gravity if in range.
		this._desiredUp.set(0, 1, 0);
		let best = null;
		let bestDist = Infinity;
		const p = this.body.position;
		for (const s of gravitySources) {
			const dx = s.body.position.x - p.x;
			const dy = s.body.position.y - p.y;
			const dz = s.body.position.z - p.z;
			const d = Math.sqrt(dx * dx + dy * dy + dz * dz) - s.radius;
			if (d < bestDist) {
				bestDist = d;
				best = s;
			}
		}
		if (best && bestDist <= Config.player.walking.gravityAlignRadius) {
			this._desiredUp.set(
				p.x - best.body.position.x,
				p.y - best.body.position.y,
				p.z - best.body.position.z,
			).normalize();
		}
		this._up.lerp(this._desiredUp, Config.player.walking.upAlignSlerp).normalize();

		// Apply local gravity only when walking.
		if (!this.flightEnabled) {
			const g = Config.player.walking.gravityStrength;
			this.body.force.x += -this._up.x * g * this.body.mass;
			this.body.force.y += -this._up.y * g * this.body.mass;
			this.body.force.z += -this._up.z * g * this.body.mass;
		}

		// Movement
		const forward = new THREE.Vector3(0, 0, -1);
		const right = new THREE.Vector3(1, 0, 0);

		const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(this._pitch, this._yaw, 0, "YXZ"));
		forward.applyQuaternion(q);
		right.applyQuaternion(q);

		if (this.flightEnabled) {
			this._applyFlight(input, forward, right);
		} else {
			this._applyWalking(input, forward, right);
			this._tryJump(input);
		}

		// Camera orientation (actual positioning handled by CameraSystem).
		camera.quaternion.slerp(q, 0.35);
	}

	_applyWalking(input, forward, right) {
		// Project movement vectors onto tangent plane.
		const up = this._up;
		const f = forward.sub(up.clone().multiplyScalar(forward.dot(up))).normalize();
		const r = right.sub(up.clone().multiplyScalar(right.dot(up))).normalize();

		let ax = 0;
		let az = 0;
		if (input.isDown("KeyW")) az += 1;
		if (input.isDown("KeyS")) az -= 1;
		if (input.isDown("KeyD")) ax += 1;
		if (input.isDown("KeyA")) ax -= 1;

		this._tmpV.set(0, 0, 0);
		this._tmpV.addScaledVector(f, az);
		this._tmpV.addScaledVector(r, ax);
		if (this._tmpV.lengthSq() > 0) this._tmpV.normalize();

		const desiredSpeed = Config.player.walking.speed;
		const desired = this._tmpV.multiplyScalar(desiredSpeed);

		// Blend in air control based on whether we are "grounded" (approx by vertical velocity along up).
		const vel = this.body.velocity;
		const velAlongUp = vel.x * up.x + vel.y * up.y + vel.z * up.z;
		const grounded = Math.abs(velAlongUp) < 1.5; // simple heuristic
		const control = grounded ? 1.0 : Config.player.walking.airControl;

		this.body.velocity.x = this.body.velocity.x * (1 - 0.10 * control) + desired.x * (0.10 * control);
		this.body.velocity.y = this.body.velocity.y * (1 - 0.10 * control) + desired.y * (0.10 * control);
		this.body.velocity.z = this.body.velocity.z * (1 - 0.10 * control) + desired.z * (0.10 * control);
	}

	_tryJump(input) {
		if (!input.isDown("Space")) return;
		const up = this._up;
		// naive jump: if upward velocity is small, add impulse.
		const vel = this.body.velocity;
		const along = vel.x * up.x + vel.y * up.y + vel.z * up.z;
		if (along < 1.2) {
			const j = Config.player.walking.jumpSpeed;
			this.body.velocity.x += up.x * j;
			this.body.velocity.y += up.y * j;
			this.body.velocity.z += up.z * j;
		}
	}

	_applyFlight(input, forward, right) {
		let u = 0;
		let d = 0;
		let ax = 0;
		let az = 0;
		if (input.isDown("Space")) u += 1;
		if (input.isDown("ShiftLeft") || input.isDown("ShiftRight")) d += 1;
		if (input.isDown("KeyW")) az += 1;
		if (input.isDown("KeyS")) az -= 1;
		if (input.isDown("KeyD")) ax += 1;
		if (input.isDown("KeyA")) ax -= 1;

		const boost = input.isDown("ControlLeft") || input.isDown("ControlRight") ? Config.player.flight.boost : 1.0;
		const speed = Config.player.flight.speed * boost;

		this._tmpV.set(0, 0, 0);
		this._tmpV.addScaledVector(forward, az);
		this._tmpV.addScaledVector(right, ax);
		this._tmpV.add(new THREE.Vector3(0, 1, 0).multiplyScalar(u - d));
		if (this._tmpV.lengthSq() > 0) this._tmpV.normalize();

		this.body.velocity.x = this._tmpV.x * speed;
		this.body.velocity.y = this._tmpV.y * speed;
		this.body.velocity.z = this._tmpV.z * speed;
	}

	afterPhysics() {
		if (!this.body || !this.mesh) return;
		this.mesh.position.set(this.body.position.x, this.body.position.y - 0.6, this.body.position.z);
		// Visual orientation roughly follows camera yaw only.
		this.mesh.rotation.y = this._yaw;
	}
}
