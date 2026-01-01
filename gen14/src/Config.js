// Centralized configuration/state. All physical constants and tunables live here.
// This file is designed to be edited live via the in-app Dev Console ("/").

export const Config = {
	sim: {
		// Use a fixed-step physics integrator for stability.
		fixedTimeStep: 1 / 120,
		maxSubSteps: 6,
		// Global "game" gravitational constant. All bodies use this.
		G: 1.0,
		// Softening to avoid singularities at extremely close range.
		softeningEps: 0.25,
		// Clamp on max gravity accel to protect the integrator.
		maxAccel: 250,
		// Scale simulation time (1 = real-time). Increase carefully.
		timeScale: 1.0,
	},

	render: {
		background: 0x000000,
		useShadows: true,
		// 3-level fidelity setting.
		fidelity: "Medium", // Low | Medium | Ultra
		pixelRatioCap: 2,
		// Optimization toggles (OFF by default as requested)
		lodEnabled: false,
		frustumCullingEnabled: true,
	},

	ui: {
		telemetryEnabled: false,
		debugLogEnabled: true,
	},

	player: {
		spawn: {
			position: { x: 0, y: 6, z: 18 },
		},
		walking: {
			speed: 10,
			jumpSpeed: 7.5,
			airControl: 0.35,
			damping: 0.15,
			gravityAlignRadius: 22,
			gravityStrength: 30,
			upAlignSlerp: 0.15,
			maxSlopeDot: 0.35,
		},
		flight: {
			speed: 22,
			boost: 2.5,
			damping: 0.08,
		},
		interaction: {
			grabDistance: 6,
			holdDistance: 3.0,
			grabStiffness: 40,
		},
		camera: {
			mode: "FirstPerson", // FirstPerson | ThirdPerson
			thirdPerson: {
				offset: { x: 0, y: 2.2, z: 6.5 },
				lerp: 0.10,
				slerp: 0.10,
			},
			firstPerson: {
				height: 1.6,
				lerp: 0.25,
				slerp: 0.25,
			},
		},
	},

	microPhysics: {
		enabled: true,
		count: 8,
		scatterRadius: 3.5,
		spawnCenter: { x: 2, y: 6, z: 14 },
	},

	celestials: {
		sun: {
			name: "Sun",
			mass: 1200,
			radius: 4.0,
			luminosity: 25.0,
			rotationSpeed: 0.25,
			position: { x: 0, y: 0, z: 0 },
		},
		planetA: {
			name: "Planet A",
			mass: 2.2,
			radius: 1.2,
			density: 1.0,
			rotationSpeed: 0.9,
			orbit: {
				around: "sun",
				radius: 18,
				phase: 0.0,
				inclination: 0.0,
			},
		},
		planetB: {
			name: "Planet B",
			mass: 4.5,
			radius: 1.6,
			density: 1.0,
			rotationSpeed: 0.6,
			orbit: {
				around: "sun",
				radius: 32,
				phase: 1.3,
				inclination: 0.05,
			},
		},
		moon: {
			name: "Moon",
			mass: 0.04,
			radius: 0.55,
			density: 1.0,
			rotationSpeed: 1.4,
			orbit: {
				around: "planetB",
				radius: 4.2,
				phase: 0.7,
				inclination: 0.12,
			},
		},
	},
};
