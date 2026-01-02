# Solar System Simulation

A realistic 3D solar system simulation with N-body physics, built with Three.js.

## Features
- **Realistic Physics**: N-body gravitational simulation.
- **Player Controller**: Walk on planets (gravity alignment), Jump, Fly mode (6-DOF).
- **Interaction**: Grab and throw objects.
- **Expandable**: Modular architecture for adding new celestial bodies or mechanics.
- **Debug Tools**: Real-time variable editing and telemetry.

## How to Run
1. Open a terminal in this folder.
2. Run `python -m http.server` (or any other static file server).
3. Open `http://localhost:8000` in your browser.

## Controls
- **WASD**: Move
- **SPACE**: Jump / Up (Fly Mode)
- **SHIFT**: Down (Fly Mode)
- **F**: Toggle Fly Mode
- **V**: Toggle Camera View (1st/3rd Person)
- **Right Click**: Grab/Release Object
- **/**: Toggle Developer Menu

## Architecture
- `js/config.js`: Central configuration for physics and bodies.
- `js/physics/`: Core physics engine (N-body).
- `js/entities/`: Game objects (Player, Planets, Props).
- `js/core/`: Input and Game Loop.
