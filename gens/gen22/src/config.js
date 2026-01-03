const listeners = new Map();

const config = {
    simulation: {
        timeScale: 3600, // simulated seconds per real-time second
        maxTimeScale: 86400,
        minTimeScale: 60,
        integrator: "leapfrog",
        gravitationalConstant: 6.6743e-11,
        unitScale: 1, // SI units by default
        renderScale: 1 / 5e6,
        enableLOD: false,
        fidelity: "ultra"
    },
    rendering: {
        exposure: 0.72,
        shadowMapSize: 2048,
        bloomEnabled: true,
        starfieldDensity: 0.45
    },
    celestialBodies: {
        sun: {
            name: "Helios",
            type: "star",
            radius: 6.9634e8,
            mass: 1.9885e30,
            luminosity: 3.828e26,
            color: 0xfff2b5,
            emissiveIntensity: 3.0
        },
        planetA: {
            name: "Aurelia",
            type: "planet",
            radius: 6.371e6,
            mass: 5.972e24,
            semiMajorAxis: 1.2e11,
            eccentricity: 0.01,
            color: 0x88aaff,
            rotationPeriod: 86400,
            atmosphereThickness: 9e4
        },
        planetB: {
            name: "Cerulea",
            type: "planet",
            radius: 3.3895e6,
            mass: 6.39e23,
            semiMajorAxis: 2.2e11,
            eccentricity: 0.02,
            color: 0xff9966,
            rotationPeriod: 88642,
            atmosphereThickness: 2.5e4
        },
        moon: {
            name: "Selene",
            type: "moon",
            radius: 1.737e6,
            mass: 7.342e22,
            semiMajorAxis: 3.8e8,
            eccentricity: 0.01,
            color: 0xdddddd,
            rotationPeriod: 2360591
        }
    },
    player: {
        walkSpeed: 4.5,
        sprintMultiplier: 1.6,
        jumpImpulse: 4.2,
        flightSpeed: 30,
        flightBoostMultiplier: 3.5,
        colliderRadius: 0.4,
        height: 1.84,
        cameraThirdPersonOffset: { x: 0, y: 2.6, z: -5.5 }
    },
    interactions: {
        grabDistance: 4,
        throwStrength: 40,
        localObjects: [
            {
                id: "luminous_crystal",
                mass: 15,
                radius: 0.35,
                emissiveColor: 0x55aaff,
                luminosity: 1200
            },
            {
                id: "dense_block",
                mass: 80,
                radius: 0.45,
                emissiveColor: null,
                luminosity: 0
            },
            {
                id: "reactive_orb",
                mass: 25,
                radius: 0.25,
                emissiveColor: 0xff8855,
                luminosity: 600
            }
        ]
    },
    ui: {
        debugOverlay: true,
        metricsDisplay: false,
        developerMenuHotkey: "/",
        cameraToggleKey: "v",
        flightToggleKey: "f"
    }
};

function notify(path, value) {
    const handlers = listeners.get(path);
    if (handlers) {
        handlers.forEach((callback) => {
            try {
                callback(value);
            } catch (error) {
                console.error("Config listener error", error);
            }
        });
    }
}

export function getConfig() {
    return config;
}

export function updateConfig(path, value) {
    const segments = path.split(".");
    let target = config;
    for (let i = 0; i < segments.length - 1; i += 1) {
        const key = segments[i];
        if (!(key in target)) {
            throw new Error(`Config path segment not found: ${key}`);
        }
        target = target[key];
    }
    const key = segments[segments.length - 1];
    if (!(key in target)) {
        throw new Error(`Config key not found: ${path}`);
    }
    target[key] = value;
    notify(path, value);
}

export function subscribeConfig(path, callback) {
    if (!listeners.has(path)) {
        listeners.set(path, new Set());
    }
    listeners.get(path).add(callback);
    return () => {
        const set = listeners.get(path);
        if (set) {
            set.delete(callback);
            if (!set.size) {
                listeners.delete(path);
            }
        }
    };
}

export function serializeConfig() {
    return JSON.parse(JSON.stringify(config));
}
