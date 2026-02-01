import { createUI } from './ui.js';
window.loadPreset = loadPreset;
window.spawnBody = spawnBody;
window.showSettings = showSettings;
// Entry point for the 3D celestial mechanics simulator
import { CelestialBody, NBodySystem } from './physics.js';

let scene, camera, renderer, controls, system;
let viewMode = 'TOP'; // 'TOP' or 'FREE'
let running = true;
let lastTime = 0;

function showError(msg) {
	const err = document.getElementById('error-display');
	err.textContent = msg;
	err.style.display = 'flex';
	setTimeout(() => { err.style.display = 'none'; }, 4000);
}

function init() {
	try {
		// Scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x000000);

		// Camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e12);
		camera.position.set(0, 1e10, 1e10);
		camera.lookAt(0, 0, 0);

		// Renderer
		renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		// Physics system
		system = new NBodySystem();

		// Add a test body (Sun)
		const sun = new CelestialBody({
			name: 'Sun',
			type: 'star',
			mass: 1.989e30,
			radius: 6.9634e8,
			luminosity: 3.828e26,
			position: new THREE.Vector3(0, 0, 0),
			velocity: new THREE.Vector3(0, 0, 0),
			color: 0xffff00
		});
		system.addBody(sun);

		// Add a test body (Earth)
		const earth = new CelestialBody({
			name: 'Earth',
			type: 'planet',
			mass: 5.972e24,
			radius: 6.371e6,
			position: new THREE.Vector3(1.496e11, 0, 0),
			velocity: new THREE.Vector3(0, 29780, 0),
			color: 0x3399ff
		});
		system.addBody(earth);

		// Add Three.js meshes for each body
		for (const body of system.bodies) {
			const geometry = new THREE.SphereGeometry(Math.max(body.radius * 100, 1e7), 32, 32);
			const material = new THREE.MeshStandardMaterial({ color: body.color });
			const mesh = new THREE.Mesh(geometry, material);
			mesh.name = body.name;
			body.mesh = mesh;
			scene.add(mesh);
		}

		// Lighting
		const ambient = new THREE.AmbientLight(0xffffff, 0.2);
		scene.add(ambient);
		const sunLight = new THREE.PointLight(0xffffff, 1, 0, 2);
		sunLight.position.copy(system.bodies[0].position);
		scene.add(sunLight);

		// Handle resize
		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		// Keyboard controls
		window.addEventListener('keydown', onKeyDown);

		// UI
		createUI(system);

		animate();
	} catch (e) {
		showError('Initialization error: ' + e.message);
		throw e;
	}
}

function animate(time) {
	try {
		requestAnimationFrame(animate);
		if (!running) return;
		const dt = (time && lastTime) ? (time - lastTime) / 1000 : 1/60;
		lastTime = time || 0;
		// Physics step
		system.step(dt);
		// Update meshes
		for (const body of system.bodies) {
			if (body.mesh) {
				body.mesh.position.copy(body.position);
			}
		}
		renderer.render(scene, camera);
	} catch (e) {
		showError('Runtime error: ' + e.message);
		running = false;
	}
}

// Preset loader
function loadPreset(preset) {
	// Remove all bodies
	for (const body of system.bodies) {
		if (body.mesh) scene.remove(body.mesh);
	}
	system.bodies = [];
	if (preset === 'solar') {
		// Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
		// Only Sun and Earth for brevity, expand as needed
		const sun = new CelestialBody({
			name: 'Sun', type: 'star', mass: 1.989e30, radius: 6.9634e8, luminosity: 3.828e26,
			position: new THREE.Vector3(0, 0, 0), velocity: new THREE.Vector3(0, 0, 0), color: 0xffff00
		});
		system.addBody(sun);
		const earth = new CelestialBody({
			name: 'Earth', type: 'planet', mass: 5.972e24, radius: 6.371e6,
			position: new THREE.Vector3(1.496e11, 0, 0), velocity: new THREE.Vector3(0, 29780, 0), color: 0x3399ff
		});
		system.addBody(earth);
	} else if (preset === 'sun-earth-moon') {
		const sun = new CelestialBody({
			name: 'Sun', type: 'star', mass: 1.989e30, radius: 6.9634e8, luminosity: 3.828e26,
			position: new THREE.Vector3(0, 0, 0), velocity: new THREE.Vector3(0, 0, 0), color: 0xffff00
		});
		system.addBody(sun);
		const earth = new CelestialBody({
			name: 'Earth', type: 'planet', mass: 5.972e24, radius: 6.371e6,
			position: new THREE.Vector3(1.496e11, 0, 0), velocity: new THREE.Vector3(0, 29780, 0), color: 0x3399ff
		});
		system.addBody(earth);
		const moon = new CelestialBody({
			name: 'Moon', type: 'planet', mass: 7.34767309e22, radius: 1.737e6,
			position: new THREE.Vector3(1.496e11 + 3.844e8, 0, 0), velocity: new THREE.Vector3(0, 29780 + 1022, 0), color: 0xcccccc
		});
		system.addBody(moon);
	} else if (preset === '3suns') {
		const sun1 = new CelestialBody({
			name: 'Sun1', type: 'star', mass: 1.989e30, radius: 6.9634e8, luminosity: 3.828e26,
			position: new THREE.Vector3(-1e11, 0, 0), velocity: new THREE.Vector3(0, 10000, 0), color: 0xffaa00
		});
		const sun2 = new CelestialBody({
			name: 'Sun2', type: 'star', mass: 1.989e30, radius: 6.9634e8, luminosity: 3.828e26,
			position: new THREE.Vector3(1e11, 0, 0), velocity: new THREE.Vector3(0, -10000, 0), color: 0xffff00
		});
		const sun3 = new CelestialBody({
			name: 'Sun3', type: 'star', mass: 1.989e30, radius: 6.9634e8, luminosity: 3.828e26,
			position: new THREE.Vector3(0, 0, 1.732e11), velocity: new THREE.Vector3(0, 0, 0), color: 0xffee88
		});
		system.addBody(sun1);
		system.addBody(sun2);
		system.addBody(sun3);
	}
	// Add meshes
	for (const body of system.bodies) {
		const geometry = new THREE.SphereGeometry(Math.max(body.radius * 100, 1e7), 32, 32);
		const material = new THREE.MeshStandardMaterial({ color: body.color });
		const mesh = new THREE.Mesh(geometry, material);
		mesh.name = body.name;
		body.mesh = mesh;
		scene.add(mesh);
	}
}

// Spawn a new body (with default properties, to be edited by user)
function spawnBody(type) {
	let body;
	if (type === 'star') {
		body = new CelestialBody({
			name: 'Star', type: 'star', mass: 1.989e30, radius: 6.9634e8, luminosity: 3.828e26,
			position: camera.position.clone(), velocity: new THREE.Vector3(0, 0, 0), color: 0xffff00
		});
	} else if (type === 'planet') {
		body = new CelestialBody({
			name: 'Planet', type: 'planet', mass: 5.972e24, radius: 6.371e6,
			position: camera.position.clone(), velocity: new THREE.Vector3(0, 0, 0), color: 0x3399ff
		});
	} else if (type === 'comet') {
		body = new CelestialBody({
			name: 'Comet', type: 'comet', mass: 1e14, radius: 1e5,
			position: camera.position.clone(), velocity: new THREE.Vector3(0, 0, 0), color: 0xffffff
		});
	} else if (type === 'spaceship') {
		body = new CelestialBody({
			name: 'Spaceship', type: 'spaceship', mass: 1e5, radius: 1e4,
			position: camera.position.clone(), velocity: new THREE.Vector3(0, 0, 0), color: 0xff00ff
		});
	} else if (type === 'blackhole') {
		body = new CelestialBody({
			name: 'Blackhole', type: 'blackhole', mass: 1e31, radius: 1e7,
			position: camera.position.clone(), velocity: new THREE.Vector3(0, 0, 0), color: 0x000000
		});
	} else if (type === 'neutron') {
		body = new CelestialBody({
			name: 'Neutron Star', type: 'neutron', mass: 2.8e30, radius: 1e6,
			position: camera.position.clone(), velocity: new THREE.Vector3(0, 0, 0), color: 0xccccff
		});
	}
	if (body) {
		system.addBody(body);
		const geometry = new THREE.SphereGeometry(Math.max(body.radius * 100, 1e7), 32, 32);
		const material = new THREE.MeshStandardMaterial({ color: body.color });
		const mesh = new THREE.Mesh(geometry, material);
		mesh.name = body.name;
		body.mesh = mesh;
		scene.add(mesh);
	}
}

function showSettings() {
	alert('Settings menu coming soon!');
}

function onKeyDown(e) {
	if (e.key === 'T' || e.key === 't') {
		running = !running;
	} else if (e.key === 'V' || e.key === 'v') {
		viewMode = (viewMode === 'TOP') ? 'FREE' : 'TOP';
		// TODO: Switch camera controls
	} else if (e.key === 'Z' || e.key === 'z') {
		const ui = document.getElementById('ui-container');
		ui.style.display = (ui.style.display === 'none') ? 'block' : 'none';
	}
}

window.addEventListener('DOMContentLoaded', init);