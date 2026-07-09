# Symplectica

**Symplectica** is a high-fidelity, multiplayer, N-body space simulator focused on scientific accuracy. Built with **Rust + WebAssembly**, **TypeScript**, **Three.js**, and **Node.js**. Currently in early development phases.

## Key Features 
- N-body gravity with `Pairwise`, `Barnes-Hut` and `FMM` solver options.
- Hybrid integrator switching in close encounters:
    - Default integrator: `Symplectic Velocity Verlet`
    - Close-encounter: `Adaptive RK45` or `5th-Order Gauss-Radau` to avoid energy drift.
- True distances and sizes with optional visualization-only size scaling.
- Multiplayer universe builder with real-time system editing.

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
   npm install  # This also builds wasm
   ```

2. Start development:
   ```bash
   npm run dev
   ```

## Data & Assets Scripts

The repository includes helper scripts to fetch production assets and real-world ephemeris data.

1. **High-Res Textures (Optional)**  
   To download 2K high-resolution textures (from Solar System Scope) for planets, moons, and Saturn's rings, run:
   ```bash
   node scripts/download_textures.js
   ```
   This will place the textures into `src/client/public/local/textures/planets/` for use when the "Use High-Res Textures" toggle is enabled.

2. **HORIZONS Ephemeris Data**  
   To fetch high-precision state vectors and orbital elements from NASA JPL HORIZONS (useful when creating or updating physics presets), use the Python script:
   ```bash
   # Install dependencies first
   pip install requests

   # Fetch data for a specific epoch
   python scripts/fetch_horizons.py --epoch 2026-01-01
   ```
   This script outputs structured JSON data to `scripts/fetched/` which can be translated into Symplectica physics presets.

## Sources

## License
Symplectica is licensed under the [MIT LICENSE](LICENSE).
