export const Config = {
    simulation: {
        timeScale: 1.0,
        fixedTimeStep: 1 / 90,
        maxSubSteps: 3,
        gravitationalConstant: 6.674e-3,
        playerGravityRadiusMultiplier: 1.15
    },
    rendering: {
        fidelity: "Medium",
        exposure: 1.05,
        toneMapping: "ACES",
        frustumCullingEnabled: false,
        shadowMapSize: {
            Low: 1024,
            Medium: 2048,
            Ultra: 4096
        },
        pixelRatio: {
            Low: 0.6,
            Medium: 0.85,
            Ultra: 1.0
        },
        maxAnisotropy: {
            Low: 1,
            Medium: 4,
            Ultra: 8
        },
        lodDistances: {
            enabled: false,
            Low: [150, 350],
            Medium: [250, 550],
            Ultra: [350, 750]
        }
    },
    controls: {
        pointerLock: true,
        walkSpeed: 6,
        sprintMultiplier: 1.6,
        jumpImpulse: 6,
        flySpeed: 22,
        flyBoostMultiplier: 1.8,
        grabReach: 4,
        grabStrength: 14,
        gravityAlignRadius: 8
    },
    telemetry: {
        enabled: true,
        smoothingWindow: 30
    },
    debug: {
        logLevel: "info",
        maxEntries: 120
    },
    lighting: {
        sunPointLightIntensity: 1.6,
        sunColor: 0xffffff,
        shadowBias: -0.00025
    },
    bodies: {
        sun: {
            id: "sol",
            displayName: "Sol",
            radius: 12,
            mass: 1.989e6,
            luminosity: 3.828e3,
            density: 1.41,
            segments: 64,
            axialTilt: 7.25,
            rotationPeriod: 25,
            emissiveIntensity: 2.5,
            color: 0xffd27f,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 }
        },
        planets: [
            {
                id: "aurelia",
                displayName: "Aurelia",
                radius: 4.2,
                mass: 5.972e3,
                density: 5.51,
                segments: 48,
                axialTilt: 23.5,
                rotationPeriod: 24,
                orbitColor: 0x3a7fd5,
                albedo: 0.31,
                position: { x: 0, y: 0, z: 120 },
                velocity: { x: 10.5, y: 0, z: 0 }
            },
            {
                id: "caelum",
                displayName: "Caelum",
                radius: 5.8,
                mass: 6.39e3,
                density: 3.93,
                segments: 48,
                axialTilt: 25.2,
                rotationPeriod: 26.5,
                orbitColor: 0xd57f3a,
                albedo: 0.19,
                position: { x: 0, y: 0, z: -200 },
                velocity: { x: -8.15, y: 0, z: 0 }
            }
        ],
        moons: [
            {
                id: "caelum_i",
                parentId: "caelum",
                displayName: "Caelum I",
                radius: 1.2,
                mass: 7.35e2,
                density: 3.34,
                segments: 32,
                axialTilt: 6.7,
                rotationPeriod: 27.3,
                position: { x: 0, y: 0, z: -200 - 25 },
                velocity: { x: -8.15, y: 0, z: 1.3 }
            }
        ],
        micro: [
            {
                id: "probe_alpha",
                type: "dynamic",
                radius: 0.4,
                mass: 120,
                position: { x: 0, y: 4.6, z: 120 - 3 },
                velocity: { x: 0, y: 0, z: 0 },
                color: 0x99d5ff
            },
            {
                id: "crate_beta",
                type: "dynamic",
                radius: 0.6,
                mass: 220,
                position: { x: 1.2, y: 4.6, z: 120 - 1.5 },
                velocity: { x: 0, y: 0, z: 0 },
                color: 0xffc266
            }
        ],
        specialEntities: []
    }
};

export function updateConfig(path, value) {
    const segments = path.split(".");
    let cursor = Config;
    while (segments.length > 1) {
        const key = segments.shift();
        if (!(key in cursor)) {
            throw new Error(`Invalid config path segment "${key}"`);
        }
        cursor = cursor[key];
    }
    const finalKey = segments.shift();
    if (!(finalKey in cursor)) {
        throw new Error(`Invalid config key "${finalKey}"`);
    }
    cursor[finalKey] = value;
}
