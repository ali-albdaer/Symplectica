import * as THREE from 'three';
import { PhysicsBody } from '../physics/nbody.js';

export class CelestialBody {
	constructor({ id, config, mesh, physicsBody, isSun = false } = {}) {
		this.id = id;
		this.config = config;
		this.mesh = mesh;
		this.body = physicsBody;
		this.isSun = isSun;
		this.rotation = 0;
	}

	updateVisual(dt) {
		const period = this.config.rotationPeriod || 0;
		if (period > 0) {
			this.rotation += (dt * 2 * Math.PI) / period;
			this.mesh.rotation.y = this.rotation;
		}
		this.mesh.position.copy(this.body.position);
	}
}

export class Prop {
	constructor({ name, mesh, physicsBody, luminous = false } = {}) {
		this.name = name;
		this.mesh = mesh;
		this.body = physicsBody;
		this.luminous = luminous;
		this.light = null;
	}

	updateVisual() {
		this.mesh.position.copy(this.body.position);
	}
}


function sphereGeom(radius, quality) {
	// quality: 'high' | 'med' | 'low'
	if (quality === 'low') return new THREE.SphereGeometry(radius, 18, 10);
	if (quality === 'med') return new THREE.SphereGeometry(radius, 30, 16);
	return new THREE.SphereGeometry(radius, 48, 24);
}

export function makeSphereMesh({ radius, color, emissive = 0x000000, emissiveIntensity = 0, quality = 'high' } = {}) {
	const geom = sphereGeom(radius, quality);
	const mat = new THREE.MeshStandardMaterial({
		color,
		emissive,
		emissiveIntensity,
		metalness: 0.0,
		roughness: 0.95
	});
	const mesh = new THREE.Mesh(geom, mat);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.userData.baseRadius = radius;
	return mesh;
}

export function makeSphereLOD({ radius, color, emissive = 0x000000, emissiveIntensity = 0, lodEnabled = false } = {}) {
	const lod = new THREE.LOD();
	const high = makeSphereMesh({ radius, color, emissive, emissiveIntensity, quality: 'high' });
	const med = makeSphereMesh({ radius, color, emissive, emissiveIntensity, quality: 'med' });
	const low = makeSphereMesh({ radius, color, emissive, emissiveIntensity, quality: 'low' });

	// When LOD is disabled, keep switching thresholds very far away.
	if (!lodEnabled) {
		lod.addLevel(high, 0);
		lod.addLevel(med, 1e9);
		lod.addLevel(low, 1e9);
	} else {
		lod.addLevel(high, 0);
		lod.addLevel(med, 60);
		lod.addLevel(low, 140);
	}

	lod.castShadow = true;
	lod.receiveShadow = true;
	lod.userData.baseRadius = radius;
	return lod;
}

export function makePhysicsBodyFromConfig(name, cfg, position, velocity) {
	return new PhysicsBody({
		name,
		mass: cfg.mass,
		radius: cfg.radius,
		position,
		velocity
	});
}
