# Celestial Mechanics Simulator

A physics-first 3D n-body gravitational simulation running in the browser.

## Quick Start

```bash
cd gen5
python -m http.server 8000
```
Then open `http://localhost:8000` in a modern browser.

## Architecture Overview

### Physics System
- **Full pairwise n-body**: O(n²) gravity calculations for maximum accuracy
- **Integrators**: Symplectic Leapfrog (Velocity Verlet), RK4, Adaptive RK45
- **Units**: SI internally (meters, kilograms, seconds)
- **Relativistic modes**:
  - Newtonian (default)
  - Paczyński-Wiita pseudo-Newtonian potential for compact objects
  - 1PN Post-Newtonian corrections (toggleable)

### Extensibility Notes
The pairwise n-body implementation is designed for future optimization:
- `gravity.js` contains isolated force calculation that can be replaced with Barnes-Hut octree (O(n log n))
- Body data is stored in Structure-of-Arrays format in `state.js` for cache efficiency and future GPU compute
- All physics is deterministic given same initial conditions and integrator settings

### Key Design Decisions

1. **Data-Oriented Design**: Physics state stored separately from visual state
2. **Determinism**: Fixed-point-friendly math, reproducible integrator steps
3. **Serialization**: Full state export/import for save/load and future networking
4. **Separation of Concerns**: Physics knows nothing about rendering

### File Structure

```
js/
├── main.js           # Entry point, initialization
├── constants.js      # Physical constants, unit conversions
├── vector3.js        # Pure math vector operations (physics use)
├── body.js           # Body data structure and factory
├── gravity.js        # Force calculations (Newtonian, pseudo-Newtonian, 1PN)
├── integrators.js    # Numerical integrators (Leapfrog, RK4, RK45)
├── simulation.js     # Physics loop, conservation tracking
├── state.js          # Central state management
├── serialization.js  # JSON export/import
├── renderer.js       # Three.js setup, render loop
├── bodyVisuals.js    # Visual representations of bodies
├── effects.js        # Black hole lensing, pulsar beams
├── camera.js         # Camera controls for both modes
├── input.js          # Centralized input handling
├── ui.js             # UI panel management
├── spawnMenu.js      # Body spawning interface
├── diagnostics.js    # Live metrics display
├── presets.js        # Solar system and scenario data
└── validation.js     # Conservation law tests
```

### Physical Constants Used

- G = 6.67430e-11 m³/(kg·s²)
- c = 299792458 m/s
- Solar mass = 1.989e30 kg
- AU = 1.496e11 m

### Integrator Details

**Velocity Verlet (Leapfrog)**: Symplectic, energy-preserving for Hamiltonian systems
- 2nd order, excellent for long-term orbital stability
- Time-reversible

**RK4**: Classic 4th order, good accuracy but not symplectic
- Use for short simulations where accuracy > stability

**RK45 Adaptive**: Embedded Runge-Kutta with error control
- Automatically adjusts timestep
- Dormand-Prince coefficients

### Preset Data Sources

- Solar System: NASA JPL Horizons (J2000 epoch approximations)
- Masses: IAU nominal values
- Orbital elements converted to Cartesian state vectors

### Controls

| Key | Action |
|-----|--------|
| T | Start/Stop simulation |
| V | Toggle Edit/Free View mode |
| H | Hide/Show UI |
| R | Reset simulation |
| . | Single step (when paused) |
| C | Re-center camera |
| 1-4 | Performance presets |

### Future Multiplayer Considerations

- State is fully serializable
- Physics step is deterministic
- Input events are timestamped
- State can be snapshotted for rollback netcode
