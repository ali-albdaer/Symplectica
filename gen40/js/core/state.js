// Global runtime state container to avoid hidden globals.

export const State = {
  scene: null,
  renderer: null,
  camera: null,
  clock: null,
  physicsWorld: null,
  celestialBodies: [],
  rigidBodies: [],
  player: null,
  sky: null,
  input: null,
  ui: {
    telemetry: null,
    devConsole: null,
    debugLog: null,
    settingsMenu: null
  }
};
