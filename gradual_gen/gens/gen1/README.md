# N-Body Space Simulator

A **high-fidelity, multiplayer, web-based N-body space simulator** built with WebAssembly-ready TypeScript, Three.js, and Node.js.

## 🚀 Features

### MVP (Current Implementation)

- **Real N-Body Physics** - True gravitational simulation using Velocity Verlet integration with optional RK45 adaptive stepping
- **Barnes-Hut Octree** - O(N log N) gravity calculation for large body counts
- **Floating Origin** - Dual-precision coordinate system handles AU-scale distances without floating-point errors
- **Multiplayer** - Authoritative server with WebSocket networking
- **NASA/JPL Data** - Real ephemeris data from JPL Horizons at J2000.0 epoch
- **SI Units** - All physics in meters, seconds, kilograms (no "game units")
- **Logarithmic Depth Buffer** - Render objects from 0.1m to billions of km

### Planned Features

- [ ] World Builder (place custom celestial bodies)
- [ ] Procedural terrain
- [ ] Spacecraft controls
- [ ] Scientific equipment (telescope, scanner)
- [ ] Advanced shaders (atmospheres, rings)
- [ ] Wasm physics module

## 📦 Project Structure

```
nbody-simulator/
├── packages/
│   ├── shared/           # Isomorphic types, constants, utilities
│   │   ├── constants.ts  # SI physical constants (CODATA 2018, IAU 2015)
│   │   ├── types.ts      # Core type definitions
│   │   ├── vector3.ts    # Vector math utilities
│   │   └── time.ts       # Julian Date handling
│   │
│   └── physics-core/     # Isomorphic physics engine
│       ├── integrators/  # Verlet, RK45
│       ├── gravity/      # Barnes-Hut octree
│       └── engine.ts     # Main simulation loop
│
├── server/               # Authoritative game server
│   ├── src/
│   │   ├── index.ts      # Entry point
│   │   ├── world.ts      # World state manager
│   │   ├── network.ts    # WebSocket server
│   │   └── presets/      # Solar system data (JPL Horizons)
│   └── package.json
│
├── client/               # Three.js web client
│   ├── src/
│   │   ├── main.ts       # Entry point
│   │   ├── rendering/    # Three.js renderer
│   │   ├── network/      # WebSocket client
│   │   ├── input/        # Keyboard/mouse handling
│   │   └── ui/           # DOM-based UI
│   ├── index.html
│   └── package.json
│
└── package.json          # Monorepo root
```

## 🛠️ Installation

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm 10+** or **pnpm**

### Setup

```bash
# Clone the repository
git clone https://github.com/yourname/nbody-simulator.git
cd nbody-simulator

# Install dependencies (hoisted monorepo)
npm install

# Build shared packages
npm run build
```

## 🎮 Running the Simulator

### Start the Server

```bash
# From root directory
npm run server

# Or from server directory
cd server
npm start
```

The server runs on `ws://localhost:8080` by default.

#### Server Options

```bash
# Custom port
PORT=3000 npm run server

# Debug mode
DEBUG=true npm run server

# Different preset
PRESET=full-solar-system npm run server

# Universe size
UNIVERSE_SIZE=medium npm run server
```

### Start the Client (Development)

```bash
# From root directory
npm run client

# Or from client directory
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
# Build everything
npm run build:all

# Start production server
cd server && npm start
```

## 🪐 Available Presets

| Preset | Bodies | Description |
|--------|--------|-------------|
| `sun-earth-moon` | 3 | Minimal solar system for testing |
| `inner-solar-system` | 5 | Sun + Mercury, Venus, Earth, Mars |
| `full-solar-system` | 10 | All planets + Pluto |
| `alpha-centauri` | 3 | Triple star system |
| `psr-b1620-26` | 3 | Binary pulsar with circumbinary planet |

All solar system presets use **real NASA/JPL ephemeris data** from JPL Horizons at J2000.0 epoch (2000-01-01T12:00:00 TDB).

## ⚙️ Configuration

### Universe Size Presets

| Size | Max Bodies | Max Players | Target Use |
|------|------------|-------------|------------|
| `small` | 50 | 8 | Single solar system |
| `medium` | 200 | 32 | Multi-system |
| `large` | 1000 | 128 | Galaxy-scale |

### Physics Configuration

```typescript
{
  tickRate: 60,              // Physics ticks per second
  integrator: 'velocity-verlet',
  gravityAlgorithm: 'barnes-hut',
  barnesHutTheta: 0.5,       // Opening angle (accuracy vs speed)
  softeningFactor: 1000,     // Default softening in meters
  floatingOriginThreshold: 1e7 // Recenter at 10,000 km
}
```

## 🔬 Physics Details

### Coordinate System

- **ICRF Ecliptic** - Origin at solar system barycenter
- **Float64** for physics calculations
- **Float32** for GPU rendering via floating origin

### Integrators

| Integrator | Order | Properties | Use Case |
|------------|-------|------------|----------|
| Velocity Verlet | O(dt²) | Symplectic, energy-conserving | Default, stable orbits |
| RK45 | Adaptive | Error control | Close encounters |

### Gravity

| Algorithm | Complexity | Accuracy | Use Case |
|-----------|------------|----------|----------|
| Direct | O(N²) | Exact | N < 100 |
| Barnes-Hut | O(N log N) | ~1% | Default |

### Physical Constants (CODATA 2018)

```
G = 6.67430e-11 m³/(kg·s²)
c = 299792458 m/s
AU = 149597870700 m
```

### Verification Targets

After 1 year of simulation:

| Body | Expected Period | Tolerance |
|------|-----------------|-----------|
| Earth | 365.256 days | ±0.1% |
| Moon | 27.322 days | ±0.5% |
| Mars | 686.980 days | ±0.1% |

## 🖥️ Controls

| Key | Action |
|-----|--------|
| `W` `A` `S` `D` | Move |
| `Space` | Ascend |
| `Shift` | Descend |
| `Mouse` | Look (pointer lock) |
| `Scroll` | Zoom |
| `T` / `Enter` | Open chat |
| `Escape` | Release mouse |

## 🏗️ Architecture Principles

1. **SI Units Only** - All values in meters, seconds, kilograms
2. **Modular Codebase** - Physics decoupled from rendering and networking
3. **No Silent Failures** - Descriptive error messages with context
4. **Isomorphic Physics** - Same code runs on client and server
5. **Authoritative Server** - Server owns physics state
6. **Gradual Enhancement** - Features can be added independently

## 🧪 Testing Orbital Mechanics

Run the orbital verification test:

```bash
npm run test:orbits
```

This simulates one year and validates:
- Earth completes ~365.256 day orbit ±0.1%
- Energy conservation within 0.01%
- Angular momentum conservation

## 📡 Network Protocol

### Client → Server

| Message | Purpose |
|---------|---------|
| `identify` | Set player name |
| `spawn` | Request spawn near body |
| `input` | Send player input |
| `chat` | Send chat message |
| `ping` | Latency measurement |

### Server → Client

| Message | Purpose |
|---------|---------|
| `identified` | Confirm identification |
| `world-state` | Full state snapshot |
| `player-spawned` | Confirm spawn |
| `player-joined` | New player notification |
| `player-left` | Player disconnect |
| `chat` | Relay chat message |
| `pong` | Ping response |

## 📚 Data Sources

- **Ephemeris**: [NASA JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)
- **Physical Constants**: [CODATA 2018](https://physics.nist.gov/cuu/Constants/)
- **Astronomical Constants**: [IAU 2015](https://www.iau.org/static/resolutions/IAU2015_English.pdf)
- **Planetary Data**: [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Ensure all physics uses SI units
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- NASA/JPL for ephemeris data
- Three.js for WebGL rendering
- The computational astrophysics community for integration algorithms
