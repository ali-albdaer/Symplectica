import * as THREE from "../vendor/three.js";
import { Entity } from "./Entity.js";
import { Config } from "../Config.js";

export class CelestialBody extends Entity {
	constructor({ name, mass, radius, rotationSpeed = 0, color = 0xffffff, emissive = 0x000000, castShadow = true, receiveShadow = true }) {
		super(name);
		this.mass = mass;
		this.radius = radius;
		this.rotationSpeed = rotationSpeed;
		this.color = color;
		this.emissive = emissive;
		this.castShadow = castShadow;
		this.receiveShadow = receiveShadow;

		this.body = null; // Cannon body
		this.mesh = null; // Three mesh
	}

	init({ physics, scene }) {
		const seg = fidelitySegments(Config.render.fidelity);

		let mesh;
		if (Config.render.lodEnabled) {
			const lod = new THREE.LOD();
			lod.addLevel(new THREE.Mesh(new THREE.SphereGeometry(this.radius, seg.highW, seg.highH), materialFor(this)), 0);
			lod.addLevel(new THREE.Mesh(new THREE.SphereGeometry(this.radius, seg.medW, seg.medH), materialFor(this)), 80);
			lod.addLevel(new THREE.Mesh(new THREE.SphereGeometry(this.radius, seg.lowW, seg.lowH), materialFor(this)), 170);
			mesh = lod;
		} else {
			mesh = new THREE.Mesh(new THREE.SphereGeometry(this.radius, seg.highW, seg.highH), materialFor(this));
		}

		this.mesh = mesh;
		const mat = new THREE.MeshStandardMaterial({ color: this.color, emissive: this.emissive, metalness: 0.0, roughness: 1.0 });
		// If LOD is enabled, set shadows on submeshes.
		this.mesh.traverse?.((o) => {
			if (o.isMesh) {
				o.castShadow = this.castShadow;
				o.receiveShadow = this.receiveShadow;
			}
		});
		if (this.mesh.isMesh) {
			this.mesh.castShadow = this.castShadow;
			this.mesh.receiveShadow = this.receiveShadow;
		}
		scene.add(this.mesh);

		this.body = physics.createSphereBody({
			mass: this.mass,
			radius: this.radius,
			position: { x: 0, y: 0, z: 0 },
			linearDamping: 0,
			angularDamping: 0,
			type: "dynamic",
			name: this.name,
		});
		this.body.allowSleep = false;
		this.body.angularVelocity.set(0, this.rotationSpeed, 0);
	}

	afterPhysics() {
		if (!this.body || !this.mesh) return;
		this.mesh.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
		this.mesh.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
	}
}

function materialFor(self) {
	return new THREE.MeshStandardMaterial({
		color: self.color,
		emissive: self.emissive,
		metalness: 0.0,
		roughness: 1.0,
	});
}

function fidelitySegments(fidelity) {
	// Keep geometry stable across bodies; increase only on Ultra.
	if (fidelity === "Low") return { highW: 24, highH: 16, medW: 16, medH: 12, lowW: 10, lowH: 8 };
	if (fidelity === "Ultra") return { highW: 64, highH: 48, medW: 32, medH: 24, lowW: 16, lowH: 12 };
	return { highW: 48, highH: 32, medW: 24, medH: 16, lowW: 12, lowH: 10 };
}
