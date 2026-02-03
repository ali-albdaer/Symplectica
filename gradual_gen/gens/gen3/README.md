# High-Fidelity Multiplayer N-Body Space Simulator

A scientifically-accurate, deterministic, authoritative web-based N-body space simulator built with Rust (WASM), TypeScript, Three.js, and Node.js.

## Features (Phase I)

- **Physics Core**: Rust → WASM with Float64 precision
  - Direct-sum O(N²) gravitational force calculation
  - Velocity-Verlet symplectic integrator
  - Softening for close encounters
  - Inelastic collision merging
  - Deterministic PRNG (PCG)
  - Checkpoint/restore API

- **Authoritative Server**: Node.js + WebSocket
  - 60 Hz physics tick rate
  - JSON snapshot protocol with sequence numbers
  - World preset loading
  - Save/load snapshots with PRNG state

- **Three.js Client**:
  - Dual-precision rendering pattern
  - Floating origin (recenter at 10^7 m)
  - Logarithmic depth buffer
  - Client-side interpolation
  - HUD: coordinates, velocity, FPS, ping, SOI indicator

- **UI/UX**:
  - Name prompt and spawn selection
  - WASD + Space controls
  - Chat (last 10 messages)
  - World-builder basic mode (`/build` command)

## Prerequisites

- **Rust** 1.75+ with `wasm-pack` installed
- **Node.js** 22.x LTS
- **npm** 10+

### Install wasm-pack

```bash
cargo install wasm-pack
```

## Project Structure

```
/project-root
  /packages
    /physics       # Rust workspace + TS glue (wasm-bindgen)
    /client        # Three.js + TS UI
    /server        # Node.js server + admin UI
  /spec
    prompt.md      # Canonical specification
  /world_presets   # JSON world preset files
  /integrator_tests # Test configurations
  package.json
  Cargo.toml       # Workspace root
  README.md
```

## Build & Run

### 1. Build WASM Physics Core

```bash
cd packages/physics
wasm-pack build --target web --release --out-dir pkg
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Server

```bash
cd packages/server
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Start Client (Development)

```bash
cd packages/client
npm run dev
```

Client runs on `http://localhost:5173`

## Configuration

### Server Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `TICK_RATE` | 60 | Physics updates per second |
| `MAX_CLIENTS` | 32 | Maximum connected clients |

### Spec Parameters

| Parameter | Value |
|-----------|-------|
| `max_massive_bodies_N` | 100 |
| `max_total_objects` | 500 |
| `network_tick_hz` | 60 |
| `max_integrator_substeps_per_tick` | 4 |
| `snapshot_format` | json |
| `transport_default` | websocket |

### Accuracy Tolerances

| Metric | Tolerance |
|--------|-----------|
| Earth orbital period error | ≤0.1% |
| Positional error after 1 orbit | ≤1000 m |
| Energy drift after 100 orbits | ≤0.01% |

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Rust physics tests
npm run test:rust

# Server tests
npm run test:server

# Client tests
npm run test:client

# Integration tests (two-body, energy drift)
npm run test:integration
```

## Controls

| Key | Action |
|-----|--------|
| W/S | Thrust forward/backward |
| A/D | Strafe left/right |
| Space | Thrust up |
| Shift | Thrust down |
| Mouse | Camera look |
| Scroll | Zoom |
| `/build` | Toggle world-builder mode |

## World Presets

Located in `/world_presets/`:

- `solar_system.json` - Full solar system with planets
- `earth_moon.json` - Earth-Moon system for testing
- `two_body_test.json` - Simple Sun-Earth for validation

## Snapshot Format (Phase I - JSON)

```json
{
  "version": "1.0.0",
  "timestamp": 1706918400000,
  "sequence": 12345,
  "tick": 67890,
  "prng_state": {
    "state": "0x...",
    "inc": "0x..."
  },
  "bodies": [
    {
      "id": "sun",
      "mass": 1.989e30,
      "radius": 6.96e8,
      "position": [0, 0, 0],
      "velocity": [0, 0, 0]
    }
  ],
  "config": {
    "softening": 1e6,
    "dt": 0.016666
  }
}
```

## Architecture

### Determinism Guarantee

- Physics runs identically on server and client using the same WASM core
- PCG PRNG with seed stored in snapshots
- All floating-point operations use IEEE 754 Float64
- Server is authoritative; clients predict and reconcile

### Networking

- WebSocket transport at 60 Hz
- Snapshots include sequence numbers for ordering
- Client interpolates between server states
- Delta compression planned for Phase II

## License

MIT License - See LICENSE file

## Acknowledgments

- Gravitational constant and planetary data from NASA JPL
- Velocity-Verlet integrator based on classical mechanics literature
- Three.js for WebGL rendering
