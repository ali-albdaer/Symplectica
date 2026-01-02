import * as THREE from 'three';

import { Config } from './config.js';
import { DebugLog, installGlobalErrorHandlers } from './util/debugLog.js';
import { NBodyWorld, PhysicsBody } from './physics/nbody.js';
import { buildInitialWorld } from './game/worldBuilder.js';
import { resolveSpherePlanetCollisions } from './game/collision.js';
import { PlayerController } from './game/player.js';
import { CameraRig } from './game/cameraRig.js';
import { GrabSystem } from './game/grab.js';
import { createStarfield } from './render/stars.js';
import { applyFidelity } from './render/fidelity.js';
import { bindConfigToWorld } from './game/bindConfig.js';
import { Input } from './input/input.js';
import { Telemetry } from './ui/telemetry.js';
import { DevMenu } from './ui/devMenu.js';

boot().catch((e) => {
	// If boot itself fails before handlers, still surface something.
	const el = document.getElementById('debuglog');
	if (el) {
		el.classList.remove('hidden');
		el.textContent = (e && (e.stack || e.message)) || String(e);
	}
	throw e;
});

async function boot() {
	const loading = document.getElementById('loading');
	const hud = document.getElementById('hud');
	const devUiEl = document.getElementById('devui');
	const debugEl = document.getElementById('debuglog');
	const telemetryEl = document.getElementById('telemetry');

	const debugLog = new DebugLog(debugEl);
	installGlobalErrorHandlers(debugLog);
	debugLog.setVisible(!!Config.ui.showDebugLog);

	// Renderer
	const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Config.render.pixelRatioCap));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.0;
	renderer.physicallyCorrectLights = true;
	document.body.appendChild(renderer.domElement);

	const input = new Input(renderer.domElement);

	// Scene
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	// Camera
	const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 4000);

	// Lighting: Sun is the primary light source.
	const sunLight = new THREE.DirectionalLight(0xfff1d6, 4.5);
	sunLight.castShadow = true;
	scene.add(sunLight);
	scene.add(sunLight.target);

	applyFidelity({ config: Config, renderer, sunLight, debugLog });

	// Stars
	const stars = createStarfield(Config.render.stars);
	scene.add(stars.object);

	// Physics
	const world = new NBodyWorld({ G: Config.sim.G, softening: Config.sim.softening });

	// Build bodies + props
	const built = buildInitialWorld({ config: Config, scene, nbodyWorld: world, debugLog });
	const celestial = built.celestial;
	const props = built.props;

	// Player physics body
	const planet1 = built.bodiesById.get(built.planet1Id);
	const playerBody = new PhysicsBody({
		name: 'Player',
		mass: Config.player.mass,
		radius: Config.player.radius,
		position: planet1.body.position.clone().add(new THREE.Vector3(0, 1, 0).multiplyScalar(planet1.body.radius + Config.player.spawnOffsetFromSurface)),
		velocity: planet1.body.velocity.clone()
	});
	world.addBody(playerBody);

	// Player visual
	const playerMesh = new THREE.Mesh(
		new THREE.CapsuleGeometry(Config.player.radius * 0.7, Config.player.radius * 1.2, 6, 14),
		new THREE.MeshStandardMaterial({ color: 0xe9f2ff, roughness: 0.7, metalness: 0.0 })
	);
	playerMesh.castShadow = true;
	playerMesh.receiveShadow = false;
	scene.add(playerMesh);

	// Controllers
	const player = new PlayerController({ config: Config, input, camera });
	player.attachPhysicsBody(playerBody);

	const camRig = new CameraRig({ config: Config, camera });
	const grab = new GrabSystem({ config: Config, input, camera });

	const telemetry = new Telemetry(telemetryEl);
	telemetry.setVisible(!!Config.ui.showTelemetry);

	const applyConfig = bindConfigToWorld({ config: Config, nbodyWorld: world, celestial, debugLog });

	const devMenu = new DevMenu({
		containerEl: devUiEl,
		config: Config,
		debugLog,
		onAnyChange: () => {
			applyFidelity({ config: Config, renderer, sunLight, debugLog });
			telemetry.setVisible(!!Config.ui.showTelemetry);
			debugLog.setVisible(!!Config.ui.showDebugLog);
		}
	});

	// Pointer lock + cursor logic
	renderer.domElement.addEventListener('click', () => {
		if (devMenu.visible) return;
		if (!input.pointerLocked) renderer.domElement.requestPointerLock();
	});

	function updateUiState() {
		const menusOpen = devMenu.visible;
		if (menusOpen && document.pointerLockElement) document.exitPointerLock();
		hud.classList.toggle('hidden', false);
		debugLog.setVisible(!!Config.ui.showDebugLog);
		telemetry.setVisible(!!Config.ui.showTelemetry);
		// Cursor enabled when menus open; otherwise only hide during pointer lock.
		document.body.style.cursor = menusOpen ? 'default' : (input.pointerLocked ? 'none' : 'default');
	}

	// Key edge detection
	const prevKeys = new Set();
	function justPressed(code) {
		return input.isDown(code) && !prevKeys.has(code);
	}
	function snapshotKeys() {
		prevKeys.clear();
		for (const k of input.keys) prevKeys.add(k);
	}

	// Resize
	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	loading.classList.add('hidden');
	hud.classList.remove('hidden');
	updateUiState();

	debugLog.push('info', 'Boot complete. Click to lock pointer.');

	// Main loop with fixed-step physics.
	let lastT = performance.now();
	let acc = 0;
	let elapsed = 0;

	function animate() {
		requestAnimationFrame(animate);

		const now = performance.now();
		let dtReal = (now - lastT) / 1000;
		lastT = now;
		dtReal = Math.min(dtReal, 0.05);

		// Toggles
		if (justPressed('Slash')) {
			Promise.resolve(devMenu.toggle()).catch((e) => debugLog.push('error', 'Dev menu failed to open', e?.stack || e));
			updateUiState();
		}
		if (justPressed('KeyT')) {
			Config.ui.showTelemetry = !Config.ui.showTelemetry;
			updateUiState();
		}
		if (justPressed('KeyF')) {
			player.toggleFlight();
			debugLog.push('info', `Flight: ${player.freeFlight ? 'ON' : 'OFF'}`);
		}
		if (justPressed('KeyV')) {
			player.toggleView();
			camRig.setMode(player.firstPerson ? 'first' : 'third');
			playerMesh.visible = !player.firstPerson;
		}

		const jumpPressed = justPressed('Space');

		const upHint = player.getUpHint(celestial);
		player.updateLook(dtReal, upHint);

		applyConfig();

		if (!Config.sim.paused) {
			const dtSim = dtReal * Config.sim.timeScale;
			acc += dtSim;
			const fixed = Config.sim.dt;
			const maxSteps = Config.sim.maxSubSteps;

			let steps = 0;
			let jumpThisFrame = jumpPressed;
			while (acc >= fixed && steps < maxSteps) {
				// Clear external accelerations for controllable dynamics (player + props)
				playerBody.externalAcceleration.set(0, 0, 0);
				for (const p of props) p.body.externalAcceleration.set(0, 0, 0);

				player.updateMovement(fixed, celestial, jumpThisFrame);
				jumpThisFrame = false;
				grab.update(fixed, props);

				world.stepLeapfrog(fixed);
				resolveSpherePlanetCollisions([playerBody, ...props.map(p => p.body)], celestial, { restitution: 0.05 });

				acc -= fixed;
				elapsed += fixed;
				steps++;
			}
		}

		// Update visuals
		for (const c of celestial) c.updateVisual(Config.sim.dt);
		for (const p of props) p.updateVisual();
		playerMesh.position.copy(playerBody.position);

		// Sunlight follows sun position and points to system center-ish.
		const sun = celestial.find(c => c.isSun);
		if (sun) {
			sunLight.position.copy(sun.body.position);
			sunLight.target.position.set(0, 0, 0);
			sunLight.target.updateMatrixWorld();
		}

		stars.update(dtReal, elapsed);

		const viewForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
		const playerUp = player.getUpHint(celestial);
		camRig.update(dtReal, playerBody.position, playerUp, viewForward);

		if (Config.ui.showTelemetry) {
			telemetry.update(dtReal * 1000, playerBody.position, player.referenceBody?.config?.name);
		}

		renderer.render(scene, camera);
		updateUiState();

		snapshotKeys();
	}

	snapshotKeys();
	animate();
}
