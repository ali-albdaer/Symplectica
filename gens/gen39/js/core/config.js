export const GlobalConfig = {
  time: {
    fixedTimeStep: 1 / 120,
    maxSubSteps: 5,
    timeScale: 20,
  },
  physics: {
    G: 6.6743e-11 * 1e6,
    damping: 0.999,
  },
  rendering: {
    fidelity: 'medium',
    enableLOD: false,
    shadowQuality: {
      low: 1024,
      medium: 2048,
      ultra: 4096,
    },
  },
  telemetry: {
    enabled: true,
  },
  sky: {
    starDensity: 0.00015,
    starBrightness: 1.0,
  },
  solarSystem: {
    bodies: {
      sun: {
        name: 'Sun',
        mass: 1.98847e30,
        radius: 6.9634e8,
        color: 0xfff0b8,
        luminosity: 1.0,
      },
      planet1: {
        name: 'Planet One',
        mass: 5.972e24,
        radius: 6.371e6,
        orbitalRadius: 1.3e11,
        orbitalPhase: 0.0,
        color: 0x88aaff,
        hasPlayerSpawn: true,
      },
      planet2: {
        name: 'Planet Two',
        mass: 6.39e23,
        radius: 3.389e6,
        orbitalRadius: 2.3e11,
        orbitalPhase: Math.PI * 0.37,
        color: 0xff9966,
      },
      moon1: {
        name: 'Moon One',
        mass: 7.342e22,
        radius: 1.737e6,
        orbitalRadius: 3.84e8,
        orbitalPhase: 0.0,
        parent: 'planet1',
        color: 0xcccccc,
      },
    },
  },
  player: {
    walkSpeed: 40,
    jumpSpeed: 18,
    flightSpeed: 150,
    mouseSensitivity: 0.0022,
  },
};
