World module notes

- Physics units: SI (m, kg, s)
- Rendering: meters are scaled by CONFIG.render.metersPerUnit
- Orbits: initial velocities are computed for circular orbits; then gravity takes over.
- Integrator: symplectic leapfrog (kick-drift-kick) for stability.
