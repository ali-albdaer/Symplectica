# Symplectica

<p align="center">
  <img src="https://github.com/user-attachments/assets/86532da5-f282-427e-90d0-d809cf237f57" width="100%" alt="Symplectica Hero Image" />
</p>

<p align="center">
  <a href="https://ali-albdaer.github.io/Symplectica/">
    <img src="https://img.shields.io/badge/%20Live%20Demo-GitHub%20Pages-2563eb?style=for-the-badge&logo=github" alt="Live Demo" />
  </a>
</p>

**Symplectica** is a multiplayer N-body space simulator focused on scientific accuracy, visual fidelity and realistic orbital mechanics. 

Whether you're a physics enthusiast simulating star systems and astroid belts, a student learning about orbital mechanics and numerical methods, or a player exploring the universe with your friends, Symplectica handles it all.

Built with **Rust + WebAssembly** on the backend and **TypeScript + Three.js** on the frontend.

## Gallery

<p align="center">
  <video src="https://github.com/user-attachments/assets/c396ef78-e906-4afb-85f4-84d3ade03d47#t=0.001" muted loop controls width="100%"></video>
  <br>
  <em>Traveling between the inner solar system bodies.</em>
</p>

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <video src="https://github.com/user-attachments/assets/35984a84-3a3d-46a3-816d-26c91ef00402#t=0.001" muted loop controls width="100%"></video>
      <br><em>Earth and other bodies at various time warp rates.</em>
    </td>
    <td width="50%" align="center">
      <video src="https://github.com/user-attachments/assets/e0573bec-6aa8-46f4-9f2b-62bc433a4868#t=0.001" muted loop controls width="100%"></video>
      <br><em>Jupiter and Io as seen from Ganymede's surface</em>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/89b2b119-bb31-4f45-9198-786b4dd16a3b" width="100%" alt="Symplectica Showcase Image" />
      <br><em>A wide closeup of Jupiter with its storm.</em>
    </td>
    <td width="50%" align="center">
      <video src="https://github.com/user-attachments/assets/f8a4c924-1030-4e3b-b301-b2862ac6c114#t=0.001" muted loop controls width="100%"></video>
      <br><em>Zooming out of Mimas into Saturn's rings.</em>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/4c99e1ac-bfe9-42fb-b9aa-3b633eec3fe6" width="100%" alt="Showcase Image 1" />
      <br><em>A close up of Earth showing Africa in the center.</em>
    </td>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/b6177517-243c-4296-8f6c-cbb7f2e993e7" width="100%" alt="Showcase Image 2" />
      <br><em>A close up of Earth showing atmospheric glow.</em>
    </td>
  </tr>
</table>

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
