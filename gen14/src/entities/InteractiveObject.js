import * as THREE from "../vendor/three.js";
import { Entity } from "./Entity.js";

export class InteractiveObject extends Entity {
	constructor({ name, shape = "box", size = 0.4, mass = 0.5, color = 0x66aaff }) {
		super(name);
		this.shape = shape;
		this.size = size;
		this.mass = mass;
		this.color = color;

		this.body = null;
		this.mesh = null;
		this.tags.add("interactive");
	}

	init({ physics, scene, position }) {
		let geo;
		if (this.shape === "sphere") geo = new THREE.SphereGeometry(this.size, 24, 18);
		else geo = new THREE.BoxGeometry(this.size, this.size, this.size);
		const mat = new THREE.MeshStandardMaterial({ color: this.color, metalness: 0.0, roughness: 0.8 });
		this.mesh = new THREE.Mesh(geo, mat);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		scene.add(this.mesh);

		this.body = this.shape === "sphere"
			? physics.createSphereBody({ mass: this.mass, radius: this.size, position, linearDamping: 0.02, angularDamping: 0.02, name: this.name })
			: physics.createBoxBody({ mass: this.mass, halfExtents: { x: this.size * 0.5, y: this.size * 0.5, z: this.size * 0.5 }, position, linearDamping: 0.02, angularDamping: 0.02, name: this.name });
		this.body.allowSleep = false;
	}

	afterPhysics() {
		if (!this.body || !this.mesh) return;
		this.mesh.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
		this.mesh.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
	}
}
