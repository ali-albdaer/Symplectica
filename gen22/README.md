# Solar System Simulation

A browser-based 3D solar system sandbox featuring fully interactive N-body physics, configurable parameters, and first/third-person exploration.

## Running Locally

1. From the project root, start a simple HTTP server (avoiding Node/NPM):
   ```
   python -m http.server 8080
   ```
2. Open `http://localhost:8080` in a modern browser with WebGL2 support.
3. Click the canvas once to capture the cursor and engage the simulation.

## Default System

- 1 star (Helios), 2 planets (Aurelia, Cerulea), 1 moon (Selene)
- Orbits derived from real gravitational parameters to yield stable circular motion
- Player spawns on Aurelia with nearby physics-enabled artifacts

## Controls

- Movement (walk mode): WASD move, Space jump, Shift sprint
- Toggle flight: `F`; in flight, WASD translates, Space ascends, Shift descends, Control boosts
- Toggle camera view: `V` (first/third person)
- Interact: Right mouse to grab/hold, release to drop
- Developer console: `/` toggles real-time config editor
- Fidelity menu: `M`

## Debug & Tuning

- Developer console exposes simulation, rendering, and body parameters sourced from [src/config.js](src/config.js)
- Telemetry overlay (FPS, frame time, coordinates) via Fidelity menu toggle
- Debug overlay streams runtime status and player vectors
- Error overlay mirrors console logs so load/runtime issues surface immediately

## Extensibility Notes

- Core architecture separates config, physics ([src/engine/PhysicsEngine.js](src/engine/PhysicsEngine.js)), rendering ([src/engine/Renderer.js](src/engine/Renderer.js)), and input/control ([src/engine/PlayerController.js](src/engine/PlayerController.js))
- New celestial or special entities should be registered through the config map, enabling future black hole or telescope modules without altering the main loop
- Fidelity system enables optional LOD and render presets for future high-cost features
