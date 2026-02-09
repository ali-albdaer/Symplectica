# Symplectica

**Symplectica** is a high-fidelity, multiplayer, N-body space simulator focused on scientific accuracy. Built with **Rust + WebAssembly**, **TypeScript**, **Three.js**, and **Node.js**.

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

## Status
The project is in early research and development stages.

## Build & Run
- Install dependencies: `npm install` in root.
- Run dev server + client: `npm run dev` also in root.

## Sources
All sources I used while researching physics, numerical methods, and simulation design will be listed in [SOURCES.md](SOURCES.md).

## License
TBD
