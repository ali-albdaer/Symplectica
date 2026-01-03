# Solar System Sim (Three.js + Cannon)

No npm/node required for dependencies (Three.js + cannon-es via CDN). You *do* need to serve the folder via a local HTTP server because ES modules cannot be loaded from `file://`.

## Run

From this folder:

- Python: `python -m http.server 5500`
- Then open: `http://localhost:5500/`

## Controls

- **Click Start**: pointer lock
- **Walking**: WASD, Space = jump
- **Free flight**: `F` toggle, WASD + Space/Shift
- **Grab**: Right-click (hold)
- **Dev Console**: `/` toggle
- **Telemetry**: `T` toggle

## Architecture

- `src/Engine.js`: render loop, scene, renderer
- `src/PhysicsWorld.js`: Cannon world for player + micro objects + collisions
- `src/NBodySystem.js`: stable N-body integrator for celestial bodies
- `src/entities/*`: `CelestialBody`, `Player`, base `Entity`
- `src/UIManager.js`: telemetry, dev console, pointer-lock/menu state
- `src/Config.js`: centralized constants + tunables
