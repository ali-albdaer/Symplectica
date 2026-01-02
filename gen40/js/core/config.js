// Centralized configuration for physics, rendering, and entities.

export const Config = {
  physics: {
    // Gravitational constant in simulation units.
    G: 0.2,
    timeScale: 4000.0, // scales simulation time vs real time
    fixedTimeStep: 1 / 120, // physics tick
    substeps: 4,
    softening: 0.01
  },
  rendering: {
    fidelity: 'Ultra', // 'Low' | 'Medium' | 'Ultra'
    enableShadows: true,
    enableLODs: false,
    starfieldDensity: 1.0
  },
  controls: {
    mouseSensitivity: 0.0025,
    walkSpeed: 6.0,
    runMultiplier: 1.8,
    jumpSpeed: 6.5,
    flightSpeed: 25.0,
    flightBoostMultiplier: 2.0
  },
  debug: {
    telemetryEnabled: true,
    logToOverlay: true
  },
  // Celestial bodies and initial layout. Positions in simulation units.
  bodies: {
    sun: {
      name: 'Sun',
      mass: 20000.0,
      radius: 10.0,
      luminosity: 1.0,
      density: 1.0,
      color: 0xffdd88,
      position: { x: 0, y: 0, z: 0 }
    },
    planet1: {
      name: 'Planet One',
      centralBody: 'sun',
      orbitRadius: 80.0,
      mass: 50.0,
      radius: 4.0,
      density: 1.0,
      color: 0x88aaff,
      inclination: 0.0
    },
    planet2: {
      name: 'Planet Two',
      centralBody: 'sun',
      orbitRadius: 140.0,
      mass: 120.0,
      radius: 6.0,
      density: 1.2,
      color: 0xff8844,
      inclination: 0.1
    },
    moon1: {
      name: 'Moon One',
      centralBody: 'planet1',
      orbitRadius: 12.0,
      mass: 1.2,
      radius: 1.4,
      density: 1.3,
      color: 0xbbbbbb,
      inclination: 0.15
    }
  },
  player: {
    mass: 0.8,
    radius: 1.0,
    spawnBody: 'planet1',
    spawnAltitude: 0.2 // above surface in local radius units
  },
  microObjects: {
    nearPlayerCount: 5,
    baseRadius: 0.4,
    baseMass: 0.05,
    luminousRatio: 0.4,
    spawnRadius: 6.0
  }
};

export function setFidelity(level) {
  Config.rendering.fidelity = level;
  if (level === 'Low') {
    Config.rendering.enableShadows = false;
    Config.rendering.enableLODs = true;
    Config.rendering.starfieldDensity = 0.4;
  } else if (level === 'Medium') {
    Config.rendering.enableShadows = true;
    Config.rendering.enableLODs = true;
    Config.rendering.starfieldDensity = 0.7;
  } else {
    Config.rendering.enableShadows = true;
    Config.rendering.enableLODs = false;
    Config.rendering.starfieldDensity = 1.0;
  }
}
