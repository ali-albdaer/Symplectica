# Solar System Simulation

A 3D web-based solar system simulation with realistic N-body physics.

## Features

- **Realistic Physics**: N-body gravitational simulation. All bodies attract each other.
- **Stable Orbits**: Initial conditions are calculated for circular orbits.
- **Player Controller**:
  - Walk on planets (gravity aligns to center).
  - Jump (Space).
  - Free Flight Mode ('F').
  - First/Third Person View ('V').
- **Graphics**:
  - Sun as the light source.
  - Shadows.
  - Starfield.
- **Developer Tools**:
  - Press `/` to open the Developer Console to tweak physics and graphics in real-time.
  - Telemetry overlay.

## How to Run

Since this project uses ES6 modules, you need a local web server.

1. Open a terminal in this folder.
2. Run Python's built-in HTTP server:
   ```bash
   python -m http.server
   ```
3. Open your browser and go to `http://localhost:8000`.

## Controls

- **WASD**: Move
- **Space**: Jump (Walk mode) / Up (Fly mode)
- **Shift**: Down (Fly mode)
- **Mouse**: Look around
- **F**: Toggle Fly Mode
- **V**: Toggle Camera View (1st/3rd Person)
- **/**: Toggle Developer Menu
