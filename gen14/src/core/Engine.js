import * as THREE from "../vendor/three.js";
import { GUI } from "../vendor/lilgui.js";

import { Config } from "../Config.js";
import { Renderer } from "./Renderer.js";
import { Physics } from "./Physics.js";
import { Input } from "./Input.js";
import { Telemetry } from "./Telemetry.js";
import { DebugUI } from "./Debug.js";

import { CelestialBody } from "../entities/CelestialBody.js";
import { Player } from "../entities/Player.js";
import { InteractiveObject } from "../entities/InteractiveObject.js";

import { GravitySystem } from "../systems/GravitySystem.js";
import { CameraSystem } from "../systems/CameraSystem.js";
import { GrabSystem } from "../systems/GrabSystem.js";

export class Engine {
	constructor({ canvas }) {
		this.canvas = canvas;
		this.renderer = new Renderer({ canvas });
		this.physics = new Physics();
		this.input = new Input(canvas);
		this.telemetry = new Telemetry();
		this.debug = new DebugUI();

		this.entities = [];
		this.systems = [];

		this.gravitySystem = new GravitySystem();
		this.cameraSystem = new CameraSystem(this.renderer.camera);
		this.grabSystem = new GrabSystem({ physics: this.physics, camera: this.renderer.camera, domElement: canvas });

		this.meshToEntity = new Map();
		this._gui = null;
		this._guiVisible = false;

		this._running = false;
		this._last = performance.now();
		this._raf = 0;

		this.player = null;
		this.gravitySources = []; // subset of bodies used for player gravity alignment
	}

	async init() {
		this._setupPointerLock();
		this._setupKeybinds();

		this._createSolarSystem();
		this._spawnMicroPhysics();
		this._createPlayer();
		this._setupLighting();

		this.systems.push(this.gravitySystem, this.grabSystem);

		// Init entities
		const ctx = this._ctx(0);
		for (const e of this.entities) {
			const extra = e._spawnPos ? { position: e._spawnPos } : undefined;
			e.init?.({ ...ctx, ...extra });
			if (e.mesh) this._indexMesh(e);
		}

		// Once bodies exist, initialize stable orbit velocities.
		this._initOrbits();

		this._rebuildGravityList();

		this.renderer.applyFidelity();
		this._applyFrustumCulling();
	}

	start() {
		this._running = true;
		this._last = performance.now();
		this._loop();
	}

	stop() {
		this._running = false;
		cancelAnimationFrame(this._raf);
	}

	_loop = () => {
		if (!this._running) return;
		this._raf = requestAnimationFrame(this._loop);

		const now = performance.now();
		const dt = Math.min(0.05, (now - this._last) / 1000);
		this._last = now;

		const ctx = this._ctx(dt);

		// Per-frame key handling (toggles)
		this._handleToggles();

		// Entity update (pre)
		for (const e of this.entities) if (e.enabled) e.update?.(ctx);

		// Systems + entities before physics
		for (const s of this.systems) s.beforePhysics?.(ctx);
		for (const e of this.entities) if (e.enabled) e.beforePhysics?.(ctx);

		// Physics step
		this.physics.step(dt);

		// Entities after physics
		for (const e of this.entities) if (e.enabled) e.afterPhysics?.(ctx);

		// Camera
		this.cameraSystem.update({ player: this.player });

		// Telemetry
		this.telemetry.update({ now, dt, playerPos: this.player?.body?.position });

		// Render
		this.renderer.render();
	};

	_handleToggles() {
		// GUI toggle handled on keydown (to avoid repeat). Here we handle continuous grab.
		if (this.input.mouseDown(2)) {
			this.grabSystem.tryGrab({ scene: this.renderer.scene, meshToEntity: this.meshToEntity });
		} else {
			this.grabSystem.release();
		}
	}

	_setupPointerLock() {
		this.canvas.addEventListener("click", () => {
			if (this._guiVisible) return;
			this.input.requestPointerLock();
		});
	}

	_setupKeybinds() {
		window.addEventListener("keydown", (e) => {
			if (e.code === "Slash") {
				e.preventDefault();
				this.toggleDevConsole();
			}
			if (e.code === "KeyT") {
				this.telemetry.toggle();
			}
			if (e.code === "KeyF") {
				this.player?.toggleFlight();
			}
			if (e.code === "KeyC") {
				this.cameraSystem.toggleMode();
			}
		});
	}

	toggleDevConsole() {
		this._guiVisible = !this._guiVisible;
		const hint = document.getElementById("hint");
		if (hint) hint.classList.toggle("hidden", this._guiVisible);

		if (this._guiVisible) {
			this.input.exitPointerLock();
			this._ensureGUI();
			this._gui.domElement.style.display = "block";
		} else {
			if (this._gui) this._gui.domElement.style.display = "none";
		}
	}

	_ensureGUI() {
		if (this._gui) return;
		this._gui = new GUI({ title: "Dev Console" });
		this._gui.domElement.style.position = "absolute";
		this._gui.domElement.style.right = "12px";
		this._gui.domElement.style.top = "12px";
		this._gui.domElement.style.zIndex = "50";

		const sim = this._gui.addFolder("Sim");
		sim.add(Config.sim, "G", 0.1, 5.0, 0.01).onChange(() => this._rebuildGravityList());
		sim.add(Config.sim, "softeningEps", 0.01, 2.0, 0.01);
		sim.add(Config.sim, "maxAccel", 10, 1000, 1);
		sim.add(Config.sim, "timeScale", 0.1, 5.0, 0.01);
		sim.open();

		const render = this._gui.addFolder("Render");
		render.add(Config.render, "fidelity", ["Low", "Medium", "Ultra"]).onChange(() => this.renderer.applyFidelity());
		render.add(Config.render, "useShadows").onChange(() => {
			this.renderer.renderer.shadowMap.enabled = !!Config.render.useShadows;
		});
		render.add(Config.render, "lodEnabled");
		render.add(Config.render, "frustumCullingEnabled").onChange(() => this._applyFrustumCulling());

		const player = this._gui.addFolder("Player");
		player.add(Config.player.walking, "speed", 1, 50, 0.1);
		player.add(Config.player.walking, "jumpSpeed", 1, 20, 0.1);
		player.add(Config.player.walking, "gravityStrength", 0, 120, 0.1);
		player.add(Config.player.walking, "gravityAlignRadius", 1, 120, 0.1);
		player.add(Config.player.flight, "speed", 1, 120, 0.1);
		player.add(Config.player.interaction, "holdDistance", 0.5, 10, 0.05);

		const celestial = this._gui.addFolder("Celestials");
		celestial.add(Config.celestials.sun, "mass", 100, 5000, 1).onChange(() => this._rebuildGravityList());
		celestial.add(Config.celestials.planetA, "mass", 0.1, 50, 0.01).onChange(() => this._rebuildGravityList());
		celestial.add(Config.celestials.planetB, "mass", 0.1, 80, 0.01).onChange(() => this._rebuildGravityList());
		celestial.add(Config.celestials.moon, "mass", 0.001, 5, 0.001).onChange(() => this._rebuildGravityList());

		// Keep GUI interactive; pointer-lock should remain released while visible.
		this._gui.domElement.addEventListener("mouseenter", () => this.input.exitPointerLock());
	}

	_createSolarSystem() {
		const { scene } = this.renderer;

		// Sun
		const sun = new CelestialBody({
			name: Config.celestials.sun.name,
			mass: Config.celestials.sun.mass,
			radius: Config.celestials.sun.radius,
			rotationSpeed: Config.celestials.sun.rotationSpeed,
			color: 0xffcc66,
			emissive: 0xffaa33,
			castShadow: false,
			receiveShadow: false,
		});
		this.addEntity(sun);

		// Planet A
		const planetA = new CelestialBody({
			name: Config.celestials.planetA.name,
			mass: Config.celestials.planetA.mass,
			radius: Config.celestials.planetA.radius,
			rotationSpeed: Config.celestials.planetA.rotationSpeed,
			color: 0x66bbff,
		});
		this.addEntity(planetA);

		// Planet B
		const planetB = new CelestialBody({
			name: Config.celestials.planetB.name,
			mass: Config.celestials.planetB.mass,
			radius: Config.celestials.planetB.radius,
			rotationSpeed: Config.celestials.planetB.rotationSpeed,
			color: 0x88ff88,
		});
		this.addEntity(planetB);

		// Moon
		const moon = new CelestialBody({
			name: Config.celestials.moon.name,
			mass: Config.celestials.moon.mass,
			radius: Config.celestials.moon.radius,
			rotationSpeed: Config.celestials.moon.rotationSpeed,
			color: 0xdddddd,
		});
		this.addEntity(moon);

		// Simple star field (no lights) via tiny points material.
		const stars = new THREE.Points(
			new THREE.BufferGeometry(),
			new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, sizeAttenuation: true }),
		);
		const starCount = 800;
		const arr = new Float32Array(starCount * 3);
		for (let i = 0; i < starCount; i++) {
			const r = 600 + Math.random() * 1200;
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
			arr[i * 3 + 1] = r * Math.cos(phi);
			arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
		}
		stars.geometry.setAttribute("position", new THREE.BufferAttribute(arr, 3));
		scene.add(stars);
	}

	_createPlayer() {
		this.player = new Player();
		this.addEntity(this.player);
	}

	_spawnMicroPhysics() {
		if (!Config.microPhysics.enabled) return;
		for (let i = 0; i < Config.microPhysics.count; i++) {
			const shape = i % 3 === 0 ? "sphere" : "box";
			const obj = new InteractiveObject({ name: `Obj ${i + 1}`, shape, size: 0.35 + Math.random() * 0.25, mass: 0.35 });
			obj._spawnPos = randomScatter(Config.microPhysics.spawnCenter, Config.microPhysics.scatterRadius);
			this.addEntity(obj);
		}
	}

	_setupLighting() {
		// Sun is the sole PointLight (no ambient). Also render the sun mesh emissive.
		const light = new THREE.PointLight(0xffffff, Config.celestials.sun.luminosity, 0, 2);
		light.position.set(0, 0, 0);
		light.castShadow = !!Config.render.useShadows;
		light.shadow.bias = -0.00015;
		light.shadow.normalBias = 0.02;
		light.shadow.camera.near = 1;
		light.shadow.camera.far = 400;
		this.renderer.scene.add(light);
		this.renderer.setSunLight(light);
	}

	_addEntityInternal(entity) {
		this.entities.push(entity);
	}

	addEntity(entity) {
		this._addEntityInternal(entity);
	}

	_indexMesh(entity) {
		if (!entity.mesh) return;
		entity.mesh.traverse?.((o) => {
			if (o.isMesh || o.isPoints || o.isLine) this.meshToEntity.set(o, entity);
		});
		this.meshToEntity.set(entity.mesh, entity);
	}

	_ctx(dt) {
		return {
			dt,
			now: performance.now(),
			engine: this,
			scene: this.renderer.scene,
			camera: this.renderer.camera,
			renderer: this.renderer.renderer,
			physics: this.physics,
			input: this.input,
			telemetry: this.telemetry,
			debug: this.debug,
			gravitySources: this.gravitySources,
			meshToEntity: this.meshToEntity,
		};
	}

	_initOrbits() {
		// Find by name.
		const byName = new Map(this.entities.map((e) => [e.name, e]));
		const sun = byName.get(Config.celestials.sun.name);
		const planetA = byName.get(Config.celestials.planetA.name);
		const planetB = byName.get(Config.celestials.planetB.name);
		const moon = byName.get(Config.celestials.moon.name);
		if (!sun?.body || !planetA?.body || !planetB?.body || !moon?.body) return;

		// Place bodies.
		sun.body.position.set(0, 0, 0);
		sun.body.velocity.set(0, 0, 0);

		placeCircularOrbit({
			G: Config.sim.G,
			primary: sun.body,
			satellite: planetA.body,
			radius: Config.celestials.planetA.orbit.radius,
			phase: Config.celestials.planetA.orbit.phase,
			inclination: Config.celestials.planetA.orbit.inclination,
		});

		placeCircularOrbit({
			G: Config.sim.G,
			primary: sun.body,
			satellite: planetB.body,
			radius: Config.celestials.planetB.orbit.radius,
			phase: Config.celestials.planetB.orbit.phase,
			inclination: Config.celestials.planetB.orbit.inclination,
		});

		// Moon around Planet B: add planetB's orbital velocity for stability.
		placeCircularOrbit({
			G: Config.sim.G,
			primary: planetB.body,
			satellite: moon.body,
			radius: Config.celestials.moon.orbit.radius,
			phase: Config.celestials.moon.orbit.phase,
			inclination: Config.celestials.moon.orbit.inclination,
			addPrimaryVelocity: true,
		});

		// Reduce drift by clearing damping on celestials.
		planetA.body.linearDamping = 0;
		planetB.body.linearDamping = 0;
		moon.body.linearDamping = 0;

		// Zero total momentum to reduce long-term drift.
		const bodies = [sun.body, planetA.body, planetB.body, moon.body];
		let px = 0,
			py = 0,
			pz = 0;
		for (const b of bodies) {
			px += b.velocity.x * b.mass;
			py += b.velocity.y * b.mass;
			pz += b.velocity.z * b.mass;
		}
		sun.body.velocity.x -= px / Math.max(1e-6, sun.body.mass);
		sun.body.velocity.y -= py / Math.max(1e-6, sun.body.mass);
		sun.body.velocity.z -= pz / Math.max(1e-6, sun.body.mass);
	}

	_rebuildGravityList() {
		// Update masses from Config live.
		for (const e of this.entities) {
			if (!e?.body) continue;
			if (e.name === Config.celestials.sun.name) e.body.mass = Config.celestials.sun.mass;
			if (e.name === Config.celestials.planetA.name) e.body.mass = Config.celestials.planetA.mass;
			if (e.name === Config.celestials.planetB.name) e.body.mass = Config.celestials.planetB.mass;
			if (e.name === Config.celestials.moon.name) e.body.mass = Config.celestials.moon.mass;
			e.body.updateMassProperties?.();
		}

		// Gravity list includes all dynamic bodies (celestials + micro objects + player).
		const grav = [];
		for (const e of this.entities) {
			if (!e?.body) continue;
			if (e.body.type !== this.physics.CANNON.Body.DYNAMIC) continue;
			grav.push({ body: e.body, radius: e.radius ?? 0 });
		}
		this.gravitySystem.setBodies(grav);

		// Player gravity alignment sources: celestial bodies only.
		this.gravitySources = this.entities
			.filter((e) => e instanceof CelestialBody)
			.map((e) => ({ body: e.body, radius: e.radius }));
	}

	_applyFrustumCulling() {
		const enabled = !!Config.render.frustumCullingEnabled;
		this.renderer.scene.traverse((o) => {
			if (o.isMesh || o.isPoints) o.frustumCulled = enabled;
		});
	}
}

function randomScatter(center, radius) {
	const a = Math.random() * Math.PI * 2;
	const r = Math.random() * radius;
	return {
		x: center.x + Math.cos(a) * r,
		y: center.y + (Math.random() * 0.6 - 0.3),
		z: center.z + Math.sin(a) * r,
	};
}

function placeCircularOrbit({ G, primary, satellite, radius, phase, inclination, addPrimaryVelocity = false }) {
	// Place on XZ plane then tilt by inclination around X.
	const x = Math.cos(phase) * radius;
	const z = Math.sin(phase) * radius;
	const y = Math.sin(inclination) * z;
	const zz = Math.cos(inclination) * z;

	satellite.position.set(primary.position.x + x, primary.position.y + y, primary.position.z + zz);

	// Circular orbit speed.
	const mu = G * primary.mass;
	const v = Math.sqrt(mu / Math.max(1e-6, radius));

	// Tangential direction (perpendicular in XZ) with same tilt.
	let tx = -Math.sin(phase);
	let tz = Math.cos(phase);
	let ty = Math.sin(inclination) * tz;
	let tzz = Math.cos(inclination) * tz;

	const tLen = Math.sqrt(tx * tx + ty * ty + tzz * tzz);
	tx /= tLen;
	ty /= tLen;
	tzz /= tLen;

	satellite.velocity.set(tx * v, ty * v, tzz * v);
	if (addPrimaryVelocity) {
		satellite.velocity.x += primary.velocity.x;
		satellite.velocity.y += primary.velocity.y;
		satellite.velocity.z += primary.velocity.z;
	}
}
