# Symplectica

**Symplectica** is a high-fidelity, multiplayer, N-body space simulator focused on scientific accuracy. Built with **Rust + WebAssembly**, **TypeScript**, **Three.js**, and **Node.js**. Currently in early development phases.

## Key Features 
- N-body gravity with `Pairwise`, `Barnes–Hut` and `FMM` solvers.
- Hybrid integrator switching in close encounters:
    - Default integrator: `Symplectic Velocity Verlet`
    - Close-encounter: `Adaptive RK45` or `5th-Order Gauss-Radau`
- True distances and sizes with optional visualization-only size scaling.
- Multiplayer universe builder with real-time system editing.
- Deterministic seed-based procedural starfields and terrain.
- Physics-based atmospheres and relativistic visual phenomena.

See [FEATURES.md](FEATURES.md) for a comprehensive list of implemented, in progress, and planned features.

## Installation & Setup

### Prerequisites
- Node.js 18+
- Rust 1.70+
- wasm-pack

### Development

1. Clone and install:
   ```bash
   git clone https://github.com/ali-albdaer/Symplectica.git
   cd Symplectica
   npm install  # Also builds wasm
   ```

2. Start development:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Sources
All sources I used while researching physics, numerical methods, and simulation design will be listed in [SOURCES.md](SOURCES.md).

## License
Symplectica is licensed under the [MIT LICENSE](LICENSE).
