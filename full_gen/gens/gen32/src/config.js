// Global configuration and tunables for simulation and rendering
export const config = {
  timeScale: 4000, // simulated seconds per real second
  maxSubsteps: 5,
  fixedDt: 1 / 60,
  gravityConstant: 6.67430e-11,
  softeningLength: 2.0e6,
  dragCoefficient: 0.0,
  fidelity: "Ultra",
  lodEnabled: false,
  enableShadows: true,
  enableHDR: true,
  shadowSize: {
    Low: 512,
    Medium: 1024,
    Ultra: 2048,
  },
  pixelRatio: {
    Low: 1.0,
    Medium: 1.25,
    Ultra: 1.5,
  },
  starCount: {
    Low: 800,
    Medium: 1400,
    Ultra: 2400,
  },
  player: {
    mass: 80,
    walkSpeed: 12,
    jumpImpulse: 18,
    flySpeed: 60,
    flyBoost: 120,
    cameraBoom: 6,
    cameraHeight: 2,
  },
  interactiveObjects: {
    count: 6,
    luminous: 2,
    mass: 12,
  },
  sun: {
    name: "Helios",
    mass: 1.989e30,
    radius: 6.9634e8,
    luminosity: 3.828e26,
    color: 0xffe6b7,
  },
  planetA: {
    name: "Tierra",
    mass: 5.972e24,
    radius: 6.371e6,
    semiMajorAxis: 1.2e11,
    eccentricity: 0.01,
    color: 0x4a90e2,
    albedo: 0.32,
    dayDuration: 86164,
  },
  planetB: {
    name: "Crimson",
    mass: 6.39e23,
    radius: 3.389e6,
    semiMajorAxis: 1.8e11,
    eccentricity: 0.05,
    color: 0xd54f3f,
    albedo: 0.27,
    dayDuration: 88642,
  },
  moon: {
    name: "Luna",
    mass: 7.342e22,
    radius: 1.737e6,
    semiMajorAxis: 4.0e8,
    eccentricity: 0.02,
    color: 0xbec3c7,
    albedo: 0.12,
    dayDuration: 2360591,
  },
  debug: {
    freezePhysics: false,
    showOverlay: true,
    showDebugLog: true,
  },
};

// Generate initial orbital state for default bodies
export function createInitialBodies(THREE) {
  const bodies = [];
  const G = config.gravityConstant;
  const soft = config.softeningLength;

  const sun = makeBody({
    id: "sun",
    name: config.sun.name,
    mass: config.sun.mass,
    radius: config.sun.radius,
    color: config.sun.color,
    luminosity: config.sun.luminosity,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    static: false,
  });
  bodies.push(sun);

  const planetA = placeCircularOrbit({
    id: "planetA",
    name: config.planetA.name,
    around: sun,
    mass: config.planetA.mass,
    radius: config.planetA.radius,
    color: config.planetA.color,
    semiMajorAxis: config.planetA.semiMajorAxis,
    eccentricity: config.planetA.eccentricity,
    dayDuration: config.planetA.dayDuration,
    G,
    soft,
    phase: 0,
  });
  bodies.push(planetA);

  const planetB = placeCircularOrbit({
    id: "planetB",
    name: config.planetB.name,
    around: sun,
    mass: config.planetB.mass,
    radius: config.planetB.radius,
    color: config.planetB.color,
    semiMajorAxis: config.planetB.semiMajorAxis,
    eccentricity: config.planetB.eccentricity,
    dayDuration: config.planetB.dayDuration,
    G,
    soft,
    phase: Math.PI * 0.5,
  });
  bodies.push(planetB);

  const moon = placeCircularOrbit({
    id: "moon",
    name: config.moon.name,
    around: planetA,
    mass: config.moon.mass,
    radius: config.moon.radius,
    color: config.moon.color,
    semiMajorAxis: config.moon.semiMajorAxis,
    eccentricity: config.moon.eccentricity,
    dayDuration: config.moon.dayDuration,
    G,
    soft,
    phase: Math.PI * 0.25,
  });
  bodies.push(moon);

  return bodies;
}

function makeBody(params) {
  return {
    ...params,
    type: "celestial",
    position: params.position.clone(),
    velocity: params.velocity.clone(),
    acceleration: new params.position.constructor(0, 0, 0),
    orientationSpeed: 0,
    luminosity: params.luminosity || 0,
    density: params.density || 0,
    albedo: params.albedo || 0.3,
    dayDuration: params.dayDuration || 86400,
    static: !!params.static,
    mesh: null,
  };
}

function placeCircularOrbit({
  id,
  name,
  around,
  mass,
  radius,
  color,
  semiMajorAxis,
  eccentricity,
  dayDuration,
  G,
  soft,
  phase,
}) {
  const pos = new around.position.constructor(1, 0, 0);
  const a = semiMajorAxis;
  const e = Math.max(0, Math.min(0.8, eccentricity || 0));
  const r = a * (1 - e * e) / (1 + e * Math.cos(phase));
  pos.set(r * Math.cos(phase), 0, r * Math.sin(phase)).add(around.position);

  const mu = G * (around.mass + mass);
  const speed = Math.sqrt(mu / (r + soft));
  const velDir = new around.position.constructor(-Math.sin(phase), 0, Math.cos(phase));
  const vel = velDir.multiplyScalar(speed).add(around.velocity);

  return makeBody({
    id,
    name,
    mass,
    radius,
    color,
    albedo: 0.3,
    position: pos,
    velocity: vel,
    dayDuration,
  });
}

export function fidelityProfile() {
  return config.fidelity;
}

export function updateFidelity(level) {
  if (!config.pixelRatio[level]) return;
  config.fidelity = level;
}
