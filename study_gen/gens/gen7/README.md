# Project Odyssey

**High-Fidelity Multiplayer N-Body Space Simulator**

A web-based, SI-accurate space simulator built on Three.js with real N-body physics, floating-origin coordinate system, and multiplayer support.

## Features (Phase 1-2)

### ✅ Phase 1: The Foundation
- **High-Precision Coordinate Engine**
  - Floating Origin: Camera at (0,0,0), universe shifts around it
  - Dual-precision: Float64 for physics, Float32 for rendering
  - Logarithmic depth buffer for AU-scale rendering without Z-fighting

- **N-Body Physics Core**
  - O(N²) gravitational calculation for massive bodies
  - O(1) for passive objects (ships/players)
  - Symplectic Velocity Verlet integrator (energy-conserving)
  - Fixed 60Hz physics tick, decoupled from rendering

- **JSON Universe Schema**
  - Data-driven celestial body creation
  - Switchable presets (Minimal / Inner Solar System)
  - Orbital parameter support (auto-calculates position/velocity)

### ✅ Phase 2: Multiplayer & Networking
- **Authoritative Headless Server**
  - Node.js server running shared physics library
  - Master clock for simulation state

- **State Synchronization**
  - Server broadcasts state at ~20Hz
  - Entity interpolation (100ms buffer)
  - Client-side prediction with server reconciliation

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development (client + server)
npm run dev
```

This starts:
- **Client**: http://localhost:3000
- **Server**: http://localhost:3001

### Production

```bash
# Build client
npm run build

# Start server only
npm run start:server
```

## Controls

| Key | Action |
|-----|--------|
| W/S | Forward/Backward thrust |
| A/D | Strafe left/right |
| Q/E | Roll |
| Mouse | Pitch/Yaw (click to capture) |
| Space | Strafe up |
| Ctrl | Strafe down |
| Shift | Boost (3x thrust) |
| Tab | Toggle SAS (stability assist) |
| P/Esc | Pause |
| Scroll | Zoom camera |

## Project Structure

```
project-odyssey/
├── shared/              # Shared code (client + server)
│   ├── physics/         # N-body simulation
│   │   ├── constants.js # SI physical constants
│   │   ├── integrators.js # Velocity Verlet, RK45
│   │   ├── nbody.js     # Main simulation
│   │   └── validation.js # NaN/Infinity checks
│   ├── math/
│   │   └── Vector3D.js  # Float64 vector math
│   └── universe/
│       ├── schema.js    # Universe loader
│       └── presets/     # Universe JSON files
│
├── client/              # Browser client
│   ├── main.js          # Entry point
│   ├── core/            # Core systems
│   │   ├── CoordinateEngine.js
│   │   ├── Renderer.js
│   │   ├── GameLoop.js
│   │   └── InputController.js
│   ├── entities/
│   │   └── Ship.js      # Player ship
│   ├── network/
│   │   ├── NetworkClient.js
│   │   └── Prediction.js
│   └── ui/
│       └── HUD.js
│
├── server/              # Headless game server
│   ├── index.js         # Entry point
│   └── GameServer.js    # Authoritative simulation
│
└── test/                # Test suite
    └── physics.test.js  # Standard scenario tests
```

## Universe Presets

### Minimal (Sun-Earth-Moon)
Fast iteration, easy validation against known orbital mechanics.

### Inner Solar System
Sun, Mercury, Venus, Earth+Moon, Mars+Phobos+Deimos

## Running Tests

```bash
npm test
```

Tests validate:
- Earth-Moon orbital stability (10,000 ticks)
- Orbital velocity calculation accuracy
- Sphere of Influence calculation
- Energy conservation
- NaN/Infinity detection

## Technical Details

### Physics
- **Gravitational constant**: G = 6.67430×10⁻¹¹ m³/(kg·s²)
- **Timestep**: 1/60 second (60Hz)
- **Integrator**: Symplectic Velocity Verlet (preserves energy)
- **Softening length**: 1 km (prevents singularities)

### Coordinate System
- All physics in SI units (meters, kg, seconds)
- Render scale: 1 unit = 1,000 km (adjustable)
- Camera always at origin (floating origin)

### Networking
- Socket.IO over WebSocket
- Server tick rate: 60Hz
- State broadcast: ~20Hz
- Interpolation delay: 100ms

## Roadmap

- [ ] Phase 3: Visual Fidelity (atmospheres, LOD, starfield)
- [ ] Phase 4: Navigation (6-DOF controller, SOI camera)
- [ ] Phase 5: Scientific Instruments (telescope)
- [ ] Phase 6: Developer Tools (universe editor)

## License

MIT
