# High-Fidelity Multiplayer N-Body Space Simulator

A scientifically accurate space simulation using real SI units, proper orbital mechanics, and multiplayer support.

## 🌟 Features

### Physics Engine
- **N-Body Gravity**: Full gravitational simulation with multiple methods:
  - Direct O(N²) for small systems
  - Barnes-Hut O(N log N) octree for large systems
  - Fast Multipole Method (FMM) ready
- **Multiple Integrators**:
  - Velocity Verlet (symplectic, energy-conserving)
  - Runge-Kutta 4th order
  - Adaptive RK45 (Dormand-Prince) for close encounters
  - Gauss-Radau (IAS15) for high precision
- **SI Units Throughout**: All calculations in meters, kilograms, seconds

### Rendering
- **Floating Origin**: Handles AU-scale distances with Float32 precision
- **Logarithmic Depth Buffer**: Render from centimeters to light-years
- **LOD System**: Dynamic level-of-detail based on angular size
- **Atmosphere Shaders**: Physically-based scattering (Bruneton & Neyret 2008)
- **Black Hole Rendering**: Gravitational lensing, accretion disks
- **Procedural Starfield**: Seeded PRNG for deterministic backgrounds

### Multiplayer
- **Authoritative Server**: Headless Node.js server with physics
- **Binary Protocol**: Efficient state synchronization (72 bytes/body)
- **Client Prediction**: Smooth movement with server reconciliation
- **Session Management**: Multiple game sessions

### World Builder
- **Orbital Elements**: Full Keplerian orbital parameter support
- **Presets**: Solar System, Alpha Centauri, PSR B1620-26, and more
- **Validation**: Roche limit, Hill sphere, orbital stability checks

## 📐 Mathematical Foundations

### Gravitational Force

Newton's law of universal gravitation:

$$\vec{F} = -\frac{Gm_1m_2}{|\vec{r}|^3}\vec{r}$$

With softening factor ε to prevent singularity:

$$\vec{a} = \frac{Gm}{(r^2 + \varepsilon^2)^{3/2}}\vec{r}$$

### Orbital Mechanics

**Vis-viva equation** (orbital velocity):
$$v = \sqrt{GM\left(\frac{2}{r} - \frac{1}{a}\right)}$$

**Orbital period** (Kepler's Third Law):
$$T = 2\pi\sqrt{\frac{a^3}{GM}}$$

**Escape velocity**:
$$v_{escape} = \sqrt{\frac{2GM}{r}}$$

### Numerical Integration

**Velocity Verlet** (symplectic, preserves energy):
```
x(t+dt) = x(t) + v(t)·dt + ½a(t)·dt²
a(t+dt) = F(x(t+dt)) / m
v(t+dt) = v(t) + ½(a(t) + a(t+dt))·dt
```

**Barnes-Hut Approximation** (θ = 0.5 default):
- Build octree of bodies
- For each body, walk tree
- If node size / distance < θ, use node's center of mass
- Otherwise, recurse into children

### Atmospheric Scattering

Based on Bruneton & Neyret (2008) precomputed atmospheric scattering:

**Rayleigh scattering coefficient**:
$$\sigma_R(\lambda) = \frac{8\pi^3(n^2-1)^2}{3N\lambda^4}$$

**Mie phase function** (Henyey-Greenstein):
$$P_M(\theta) = \frac{3(1-g^2)(1+\cos^2\theta)}{8\pi(2+g^2)(1+g^2-2g\cos\theta)^{3/2}}$$

### Gravitational Lensing

**Schwarzschild radius**:
$$r_s = \frac{2GM}{c^2}$$

**Light deflection angle** (weak field):
$$\alpha = \frac{4GM}{c^2b} = \frac{2r_s}{b}$$

where b is the impact parameter.

## 🔬 Verification

### Energy Conservation Test
- Run Sun-Earth system for 10 days
- Expected drift: < 0.001%
- Validates symplectic integrator accuracy

### Orbital Period Test
- Simulate Earth orbit for 1 year
- Compare final position to initial
- Expected error: < 0.1% of AU

### Kepler's Third Law Test
- Calculate T from a = 1 AU, M = M☉
- Expected: 365.256 days
- Tolerance: ±0.01%

Run tests:
```bash
npm run test --workspace=@space-sim/shared
```

## 📁 Project Structure

```
packages/
├── shared/                 # Isomorphic physics library
│   ├── src/
│   │   ├── constants.ts   # SI physical constants
│   │   ├── math/          # Vector3, Quaternion, SeededRandom
│   │   ├── bodies/        # CelestialBody, types, presets
│   │   ├── physics/       # Integrators, Barnes-Hut, PhysicsEngine
│   │   ├── network/       # Protocol, messages
│   │   └── player/        # Player entity
│   └── package.json
├── server/                 # Headless game server
│   ├── src/
│   │   ├── index.ts       # Entry point
│   │   ├── GameServer.ts  # Main server
│   │   └── SessionManager.ts
│   └── package.json
└── client/                 # Three.js WebGL client
    ├── src/
    │   ├── index.ts       # Entry point
    │   ├── GameClient.ts  # Main client
    │   ├── rendering/     # Camera, renderers, shaders
    │   ├── input/         # Input management
    │   ├── network/       # WebSocket client
    │   ├── ui/            # UI management
    │   └── builder/       # World builder
    ├── index.html
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone repository
git clone <repo-url>
cd space-sim

# Install dependencies
npm install

# Build shared library
npm run build --workspace=@space-sim/shared

# Start server
npm run start --workspace=@space-sim/server

# Start client (in another terminal)
npm run dev --workspace=@space-sim/client
```

### Offline Mode

Run client without server:
```
http://localhost:5173?offline=true
```

### Controls

| Key | Action |
|-----|--------|
| W/S | Forward/Backward |
| A/D | Left/Right |
| Space | Up |
| Shift | Down |
| Ctrl | Boost (100x speed) |
| Mouse | Look around |
| Scroll | Zoom (FOV) |
| ESC | Pause menu |
| T/Enter | Chat |

## 📊 Performance

### Physics
- 60 Hz fixed timestep
- Barnes-Hut: O(N log N) complexity
- Handles 10,000+ bodies at real-time

### Network
- 20 Hz state broadcast
- Binary encoding: 72 bytes/body
- Client-side prediction for smoothness

### Rendering
- Logarithmic depth: 0.1m to 10^16m range
- LOD: 8 to 128 segments based on angular size
- Floating origin: prevents jitter at large distances

## 🔧 Configuration

### Physics Engine
```typescript
const physics = new PhysicsEngine({
  gravityMethod: GravityMethod.BARNES_HUT,
  barnesHutTheta: 0.5,  // Lower = more accurate
  integratorType: IntegratorType.VELOCITY_VERLET,
  softeningFactor: 1000,  // meters
  collisionDetection: true,
});
```

### Server
```typescript
const config: ServerConfig = {
  port: 8080,
  tickRate: 60,
  networkTickRate: 20,
  maxPlayersPerSession: 32,
  maxSessions: 10,
};
```

## 🌌 Presets

| Name | Description |
|------|-------------|
| `empty` | Empty space |
| `sun-earth-moon` | Simple 3-body system |
| `solar-system` | Full solar system with planets |
| `alpha-centauri` | Binary star system |
| `psr-b1620` | Pulsar with circumbinary planet |
| `black-hole` | Stellar black hole with accretion disk |

## 📚 References

1. **Numerical Methods**: Press et al. "Numerical Recipes" (2007)
2. **Barnes-Hut**: Barnes & Hut "A Hierarchical O(N log N) Force-Calculation Algorithm" (1986)
3. **Atmospheric Scattering**: Bruneton & Neyret "Precomputed Atmospheric Scattering" (2008)
4. **Black Hole Rendering**: James et al. "Gravitational Lensing by Spinning Black Holes in Astrophysics, and in the Movie Interstellar" (2015)
5. **Orbital Mechanics**: Vallado "Fundamentals of Astrodynamics and Applications" (2013)

## 📝 License

MIT License - See LICENSE file for details.
