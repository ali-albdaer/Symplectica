# Solar System N-Body Simulation

## Architectural Decisions

This project is a technical foundation for a future multiplayer space simulation.

### 1. Rendering: Floating Origin
To support the astronomical scales required (Solar System scale) without floating-point jitter in WebGL, a **Floating Origin** approach is used.
- **Concept:** The rendering engine keeps the camera near (0,0,0) as much as possible. When the camera moves too far from the origin, the entire world is shifted back, and the offset is tracked.
- **Physics implications:** Physics calculations are performed in **Double Precision** (JS Standard Number) in component space. They are separate from rendering coordinates.

### 2. Physics Model: N-Body with Pseudo-Newtonian Potentials
- **Integrator:** Symplectic 4th-Order (SI) or RK4, selectable.
- **Compact Objects:** To simulate Black Holes and Neutron Stars with higher fidelity than simple Newtonian points, we use the **Paczynski-Wiita** potential:
  $$ \Phi = -\frac{GM}{r - r_g} $$
  where $r_g = 2GM/c^2$ (Schwarzschild radius).
  - This reproduces the Innermost Stable Circular Orbit (ISCO) at $3r_g$ and the instability at $r < 3r_g$, providing "physics-first" behavior without full GR tensor calculus.

### 3. Architecture: Manager/Data Pattern
- **State Separation:** All physical state is held in `PhysicsManager` bodies. Rendering state (`THREE.Mesh`) is synchronized one-way.
- **Modules:**
  - `core/`: Game Loop, generic Event Emitter.
  - `physics/`: Integrators, N-Body solver, Constants.
  - `render/`: Three.js wrapper, Visuals, Floating Origin logic.
  - `input/`: Interaction handling, Camera controllers.
  - `state/`: Serialization, Load/Save.

## Usage
Run with any Python HTTP server:
`python -m http.server`
Access at `http://localhost:8000`

## Controls
- **V**: Toggle Edit/Free View
- **WASD / Shift / Space**: Movement
- **Mouse**: Drag bodies (Edit), Look (Free)
