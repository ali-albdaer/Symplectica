# Symplectica

**Symplectica** is a multiplayer N-body space simulator focusing on scientific accuracy, visual fidelity and realistic orbital mechanics. 

Whether you're a physics enthusiast simulating star systems and astroid belts, a student learning about orbital mechanics and numerical methods, or a player exploring the universe with your friends, Symplectica handles it all.

Built with **Rust + WebAssembly** on the backend and **TypeScript + Three.js** on the frontend.

## Visuals

Soon.

## Key Features

Some of Symplectica's capabilities include:

- Realistic physical properties for stars, planets and moons:
   - Stars: surface temperature, luminosity, mass, and solar flares.
   - Planets: axial tilt, oblateness, rings, and atmospheres.
   - Moons: inclination, eccentricity, orbital resonances, and eclipses.
- Atmospheric scattering with multi-light source, penumbra shadow effects.
- Realistic system presets with **to-scale** distances and sizes:
   - Our Solar System with real ephemeris data for planets, moons, and other major bodies (sourced from NASA JPL HORIZONS).
   - The Proxima Centauri system.
   - The TRAPPIST-1 system.
- High-performance N-body simulation with `Pairwise`, `Barnes-Hut` and `FMM` force methods.
- Hybrid integrator switching in close encounters to avoid energy drift:
   - Default integrator: `Symplectic Velocity Verlet`.
   - Close-encounter: `Adaptive RK45` or `5th-Order Gauss-Radau`.
- Time-warp and teleportation options.
- Multiplayer universe builder with real-time system editing.

See [FEATURES.md](docs/FEATURES.md) for a comprehensive list of implemented, in-progress, and planned features.

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
   npm install
   ```

2. Build the wasm bundle:
   ```bash
   npm run wasm:build
   ```

3. Start development:
   ```bash
   npm run dev
   ```

4. Open `localhost:3000` in your browser.

## Data & Assets Scripts (Optional)

The repository includes helper scripts to fetch production assets and real-world ephemeris data.

1. **High-Res Textures**  
   To download 2K high-resolution textures (from Solar System Scope) for planets, moons, and Saturn's rings, run:
   ```bash
   node scripts/download_textures.js
   ```
   This will place the textures into `src/client/public/local/textures/planets/` for use when the "Use High-Res Textures" toggle is enabled in the Options panel.

2. **HORIZONS Ephemeris Data**  
   To fetch high-precision state vectors and orbital elements from NASA JPL HORIZONS (for creating or updating presets), use the Python script:
   ```bash
   # Install dependencies first
   pip install requests

   # Fetch data for a specific epoch
   python scripts/fetch_horizons.py --epoch 2026-01-01
   ```
   This script outputs structured JSON data to `scripts/fetched/` which can be translated into Symplectica physics presets.

## Sources

All sources consulted for physics, celestial mechanics, numerical methods and rendering techniques are listed in [SOURCES.md](docs/SOURCES.md)

## License
Symplectica is licensed under the [MIT LICENSE](LICENSE).
