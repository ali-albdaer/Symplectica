export const Config = Object.freeze({
  timeScale: 240, // Simulation seconds per real second.
  enableStarfield: true,
  integrator: {
    dt: 1 / 90,
    maxSubsteps: 4,
    drag: 0.9998 // Mild damping to reduce numerical drift without killing orbits.
  },
  physics: {
    G: 6.674e-3 // Softened constant in sim units; tuned for stability with chosen masses/distances.
  },
  player: {
    height: 1.8,
    radius: 0.45,
    walkSpeed: 8,
    runMultiplier: 1.0,
    jumpImpulse: 7,
    freeFlightSpeed: 24,
    freeFlightBoost: 65,
    grabDistance: 3.5,
    grabStrength: 18,
    thirdPersonDistance: 6.5,
    thirdPersonHeight: 2.0
  },
  fidelityPresets: {
    Low: {
      enableShadows: false,
      shadowMapSize: 512,
      postAA: "fxaa",
      lod: true,
      bloom: false
    },
    Medium: {
      enableShadows: true,
      shadowMapSize: 1024,
      postAA: "fxaa",
      lod: false,
      bloom: false
    },
    Ultra: {
      enableShadows: true,
      shadowMapSize: 2048,
      postAA: "smaa",
      lod: false,
      bloom: true
    }
  },
  visuals: {
    starCount: 2200,
    starMinRadius: 0.35,
    starMaxRadius: 1.1,
    skyRadius: 1200,
    enableLodByDefault: false
  },
  debug: {
    showTelemetry: true,
    showHud: true,
    showLog: true
  },
  // Default system layout (positions in sim units, masses arbitrary but consistent with G).
  systemDefaults: {
    // Stable circular-orbit seed values, will be converted to initial velocities in setup.
    bodies: [
      {
        name: "Sol",
        type: "star",
        mass: 1.0e6,
        radius: 35,
        color: 0xffe7a3,
        emission: 1.3,
        luminosity: 1.0,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        static: false,
        canGrab: false
      },
      {
        name: "Aurelia",
        type: "planet",
        mass: 650,
        radius: 8,
        color: 0x4a8ee0,
        emission: 0.02,
        position: { x: 130, y: 0, z: 0 },
        orbiting: "Sol",
        static: false,
        canGrab: false
      },
      {
        name: "Boreas",
        type: "planet",
        mass: 350,
        radius: 6.5,
        color: 0xa7c98f,
        emission: 0.01,
        position: { x: -210, y: 0, z: 0 },
        orbiting: "Sol",
        static: false,
        canGrab: false
      },
      {
        name: "Lumen",
        type: "moon",
        mass: 40,
        radius: 2.4,
        color: 0xf1d8c9,
        emission: 0.05,
        position: { x: 142, y: 0, z: 0 },
        orbiting: "Aurelia",
        static: false,
        canGrab: false
      }
    ],
    interactables: [
      {
        name: "Probe",
        mass: 0.4,
        radius: 0.4,
        color: 0xffcc66,
        emission: 0.3,
        offset: { x: 2.4, y: 1.4, z: -1.8 },
        canGrab: true
      },
      {
        name: "Crate",
        mass: 1.2,
        radius: 0.55,
        color: 0x8899aa,
        emission: 0.0,
        offset: { x: 1.2, y: 1.0, z: 2.1 },
        canGrab: true
      },
      {
        name: "Lantern",
        mass: 0.3,
        radius: 0.35,
        color: 0xfff7c2,
        emission: 0.8,
        offset: { x: -1.8, y: 1.2, z: 1.5 },
        canGrab: true
      }
    ]
  }
});

export function cloneConfig() {
  return JSON.parse(JSON.stringify(Config));
}
