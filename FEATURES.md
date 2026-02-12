# Features

Intended features and capabilities of **Symplectica**.

---

## 1. High-Precision Coordinate System

- Dual-precision position model:
    - Float64 for physics and authoritative state. Float32 for GPU rendering.
- Floating-origin system:
    - Camera fixed at (0, 0, 0).
    - World re-centering triggered by a configurable distance threshold
- Reference-frame management for Orbital motion, SOI transitions, and camera stability.
- Logarithmic depth buffer for large-scale depth ranges.

---

## 2. N-Body Physics Engine

### 2.1 Gravity Solvers
- Pairwise N-body solver (default).
- Barnes–Hut octree solver.
- Fast Multipole Method (FMM).
- Solvers switchable in run-time (in admin-panel).

### 2.2 Time Integration
- Symplectic Velocity Verlet integrator (default).
- Close-encounter integrator switching:
    - Detection via distance + Hill-sphere estimate.
    - Refinement using acceleration / jerk thresholds.
    - Adaptive Runge–Kutta 45.
    - 5th-order Gauss–Radau. 
    - No visible discontinuities.
- Fixed 60 Hz physics timestep using accumulator pattern.
- Sub-stepping support for stability at high gradients.

### 2.3 Numerical Stability
- Gravitational softening per body.
- Energy and angular-momentum drift diagnostics.
- Deterministic floating-point behavior across clients.

---

## 3. Celestial Bodies & Systems

- Stars:
    - Mass–luminosity relation; stellar types and lifetimes.
    - Solar flares and activity.
- Planets:
    - Rocky, gas giant, dwarf planet types.
    - Atmospheres, rings, oblateness.
- Moons, meteors and asteroids with eccentric and inclined orbits.
- Relativistic bodies:
    - Black holes:
        - Gravitational lensing (shader-based).
        - Accretion disks with Doppler boosting.
    - Pulsars and magnetars.

---

## 4. Universes & Presets

- Serializable world state format.
- Loadable universes at server startup.
- Admin panel with runtime configuration of Solver type, integrator, and physics timestep.
- Teleportation with orbital velocity correction. (admin-panel)

---

## 5. Multiplayer & Server Architecture

- Authoritative headless server with shared physics.
- Client-side prediction for player motion.
- Entity interpolation and reconciliation.
- Deterministic state synchronization.
- Lobbies with independant universes.

---

## 6. Player Physics & Interaction

- Player objects with tunable parameters.
- Orbital insertion logic on spawn.
- State preservation on disconnect (player model does not disappear).
- Gravity-aligned on-planet movement and jump.
- On planet camera, SOI-Based camera smoothing and handover.
- Interaction with items, pick up, use.
- Collision handling for Terrain, Bodies, Players, Ships and Items.
- Reference-frame transitions based on SOI.

---

## 7. Camera & Navigation

- Horizon-centric surface camera.
- Gravity-aligned camera orientation.
- Soft-lock / spring-arm smoothing.
- SOI camera handover smoothing.
- Horizon culling.

---

## 8. World-Builder Mode (activated in admin panel)

- World editing with orthographic ecliptic projection view.
- Spawn, delete, edit, and move bodies in real time.

---

## 9. Visualization Panel
- Object velocity, acceleration, force vector visualization with magnitude scaling.
- Gravitational field strength and direction.
- Potential and gradient fields.
- Visualization-only object size scaling.
- Orbit diagnostics:
    - Trajectory trails.
    - Apoapsis / periapsis markers.
    - Hill spheres and SOI boundaries.

---

## 10. Rendering & Visual Systems

- Procedural planet terrain with deterministic simplex / Worley noise.
- Recursive quadtree sphere LOD.
- Physics-based atmosphere rendering using Bruneton & Neyret LUT method. 

---

## 11. Starfield & Deep Sky

- THREE.Points-based star rendering.
- Seeded procedural starfield.
- Procedural nebulae.
- Real star data set.
- Deterministic sky for navigation.
- Scripted or triggered cosmic events (supernovae, meteor showers).

---

## 12. Spacecraft & Navigation Systems

- 6-DOF thruster-based movement.
- Prograde / retrograde; Kill-rotation SAS modes.
- Autopilot with PID control.
- Trajectory approximation and burn planning.

---

## 13. Items

- Portable telescope with accurate zoom behavior.
- High-precision clock.

---

## 14. Visual Fidelity

### 14.1 Physically-Grounded Rendering
- Per-player visual quality presets:
    - **Low**: prioritizes performance.
    - **High**: balanced quality and performance.
    - **Ultra**: maximum visual fidelity.
- Lighting:
    - Stellar luminosity determines irradiance.
    - Distance-based inverse-square falloff.
- Planet appearance derived from physical parameters (Radius, atmosphere composition, density, albedo, and temperature.)
- Atmospheric rendering:
    - Rayleigh and Mie scattering using the Bruneton & Neyret LUT approach.
    - Cloud layers derived from atmospheric density and procedural noise.
- Shadows:
    - Physically plausible shadow casting from stars and major bodies.
    - Shadow resolution scales with apparent angular size.
- Reflections:
    - Reflection models for oceans, ice, and metallic surfaces.
    - Reflection intensity derived from surface properties and incident light.
- Exposure and tone mapping:
    - HDR pipeline with exposure chosen to preserve physical brightness ratios.

---

## 100. Future Extensions

- Light-speed signal delay.
- Radio communication.
- Atmospheric drag.
- Roche limit effects.
- Non-spherical gravity fields.
