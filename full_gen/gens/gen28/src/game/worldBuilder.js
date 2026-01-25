import * as THREE from 'three';
import { PhysicsBody } from '../physics/nbody.js';
import { makePhysicsBodyFromConfig, makeSphereLOD, makeSphereMesh, CelestialBody, Prop } from './entities.js';

// Builds initial 1 sun, 2 planets, 1 moon + a few props near player spawn.
// Orbits are not hardcoded: initial velocities are set to match circular orbit physics.

export function buildInitialWorld({ config, scene, nbodyWorld, debugLog }) {
	const bodiesById = new Map();
	const celestial = [];
	const props = [];

	// 1) Create sun at origin.
	{
		const cfg = config.bodies.sun;
		const body = makePhysicsBodyFromConfig(cfg.name, cfg, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
		const mesh = makeSphereLOD({ radius: cfg.radius, color: cfg.color, emissive: 0xffcc66, emissiveIntensity: 0.75, lodEnabled: config.render.lod.enabled });
		mesh.castShadow = false; // emissive; shadows cast by light instead
		mesh.receiveShadow = false;
		scene.add(mesh);
		nbodyWorld.addBody(body);
		const ent = new CelestialBody({ id: 'sun', config: cfg, mesh, physicsBody: body, isSun: true });
		celestial.push(ent);
		bodiesById.set('sun', ent);
	}

	// 2) Create orbiting bodies (planets + moon), then set initial positions/velocities.
	for (const id of ['planet1', 'moon1', 'planet2']) {
		const cfg = config.bodies[id];
		const mesh = makeSphereLOD({ radius: cfg.radius, color: cfg.color, lodEnabled: config.render.lod.enabled });
		scene.add(mesh);

		const body = makePhysicsBodyFromConfig(cfg.name, cfg, new THREE.Vector3(), new THREE.Vector3());
		nbodyWorld.addBody(body);
		const ent = new CelestialBody({ id, config: cfg, mesh, physicsBody: body });
		celestial.push(ent);
		bodiesById.set(id, ent);
	}

	// Compute initial orbital state.
	for (const id of ['planet1', 'planet2', 'moon1']) {
		const ent = bodiesById.get(id);
		const orbit = ent.config.orbit;
		const primary = bodiesById.get(orbit.primary);
		if (!primary) {
			debugLog?.push('error', `Orbit primary not found for ${id}`, orbit);
			continue;
		}

		const r = orbit.radius;
		const phase = orbit.phase || 0;
		const posRel = new THREE.Vector3(Math.cos(phase) * r, 0, Math.sin(phase) * r);
		ent.body.position.copy(primary.body.position).add(posRel);

		// Tangential direction for orbit in XZ plane.
		const tangent = new THREE.Vector3(-Math.sin(phase), 0, Math.cos(phase));
		const M = primary.body.mass;
		const v = Math.sqrt(config.sim.G * M / r);
		ent.body.velocity.copy(primary.body.velocity).addScaledVector(tangent, v);
	}

	// Zero total momentum so the barycenter stays near origin.
	{
		const sun = bodiesById.get('sun');
		if (sun) {
			const P = new THREE.Vector3();
			for (const c of celestial) {
				if (c === sun) continue;
				P.addScaledVector(c.body.velocity, c.body.mass);
			}
			sun.body.velocity.copy(P.multiplyScalar(-1 / sun.body.mass));
		}
	}

	// 3) Add a few props near Planet 1 surface.
	const planet1 = bodiesById.get('planet1');
	const spawnUp = new THREE.Vector3(0, 1, 0);
	const base = planet1.body.position.clone().addScaledVector(spawnUp, planet1.body.radius + config.player.spawnOffsetFromSurface);
	const propDefs = [
		{ name: 'Crate', mass: 0.0015, radius: 0.22, luminous: false, color: 0xc6a06b },
		{ name: 'Beacon', mass: 0.0010, radius: 0.18, luminous: true, color: 0x9bd3ff },
		{ name: 'Sphere', mass: 0.0012, radius: 0.20, luminous: false, color: 0xbac7d6 },
		{ name: 'GlowOrb', mass: 0.0008, radius: 0.16, luminous: true, color: 0xffb3d1 }
	];

	for (let i = 0; i < propDefs.length; i++) {
		const d = propDefs[i];
		const p = base.clone().add(new THREE.Vector3(1.1 + i * 0.7, 0.2, -1.2 + (i % 2) * 0.9));
		const v = new THREE.Vector3();
		const body = new PhysicsBody({
			name: d.name,
			mass: d.mass,
			radius: d.radius,
			position: p,
			velocity: v
		});
		nbodyWorld.addBody(body);

		const mesh = makeSphereMesh({
			radius: d.radius,
			color: d.color,
			emissive: d.luminous ? d.color : 0x000000,
			emissiveIntensity: d.luminous ? 0.65 : 0
		});
		scene.add(mesh);

		const prop = new Prop({ name: d.name, mesh, physicsBody: body, luminous: d.luminous });
		props.push(prop);
	}

	return { bodiesById, celestial, props, planet1Id: 'planet1' };
}
