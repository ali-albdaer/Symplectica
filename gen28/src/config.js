// Centralized, live-editable configuration.
// Units: "sim units" chosen for stability/precision.
// - Distance: 1 unit
// - Mass: 1 unit
// - Time: 1 unit
// Gravitational constant G is tuned for stable orbits with dt below.

export const Config = {
	version: 1,

	// Simulation
	sim: {
		paused: false,
		timeScale: 1.0,
		dt: 1 / 120, // physics step (seconds in sim units)
		maxSubSteps: 8,
		G: 1.0,
		softening: 0.02, // gravitational softening length (prevents singularities)
		relativistic: false // reserved for future special entities (e.g., black holes)
	},

	// Rendering / performance
	render: {
		fidelity: "Medium", // Low | Medium | Ultra
		pixelRatioCap: 2.0,
		shadows: true,
		shadowMapSize: { Low: 1024, Medium: 2048, Ultra: 4096 },
		shadowDistance: { Low: 60, Medium: 120, Ultra: 180 },
		stars: { count: 6000, radius: 1200, twinkle: 0.05 },
		lod: { enabled: false }
	},

	// Telemetry / UI
	ui: {
		showTelemetry: false,
		showDebugLog: true
	},

	// Player
	player: {
		radius: 0.35,
		mass: 0.02,
		spawnOffsetFromSurface: 1.2,
		walk: {
			speed: 6.0,
			accel: 28.0,
			jumpSpeed: 7.5,
			linearDamping: 2.2
		},
		flight: {
			speed: 16.0,
			accel: 36.0,
			linearDamping: 0.8
		},
		camera: {
			mouseSensitivity: 0.0022,
			thirdPersonDistance: 6.0,
			thirdPersonHeight: 1.6,
			thirdPersonLag: 0.10
		}
	},

	// Interaction objects
	props: {
		grab: {
			distance: 2.4,
			spring: 90.0,
			damping: 14.0
		}
	},

	// Celestial bodies
	// NOTE: default values are tuned for stable orbits with leapfrog integration.
	// For circular orbit around central mass M at distance r:
	// v = sqrt(G*M/r)
	bodies: {
		sun: {
			name: "Sun",
			mass: 10.0,
			radius: 2.0,
			density: 1.0,
			luminosity: 1.0,
			rotationPeriod: 18.0, // day length (visual spin)
			color: 0xffe08a
		},
		planet1: {
			name: "Planet 1",
			mass: 0.12,
			radius: 1.05,
			density: 1.0,
			luminosity: 0.0,
			rotationPeriod: 10.0,
			color: 0x6ea8ff,
			orbit: {
				primary: "sun",
				radius: 16.0,
				eccentricity: 0.0,
				phase: 0.0
			}
		},
		moon1: {
			name: "Moon",
			mass: 0.0025,
			radius: 0.35,
			density: 1.0,
			luminosity: 0.0,
			rotationPeriod: 6.0,
			color: 0xb9c1cc,
			orbit: {
				primary: "planet1",
				radius: 1.8,
				eccentricity: 0.0,
				phase: 0.3
			}
		},
		planet2: {
			name: "Planet 2",
			mass: 0.18,
			radius: 1.2,
			density: 1.0,
			luminosity: 0.0,
			rotationPeriod: 13.0,
			color: 0xff8a6b,
			orbit: {
				primary: "sun",
				radius: 26.0,
				eccentricity: 0.0,
				phase: 1.35
			}
		}
	}
};
