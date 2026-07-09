# Symplectica - Sources & Algorithms

This document provides a comprehensive overview of the mathematical, physical, and algorithmic sources, models, and methods utilized in the development of Symplectica.

## 1. Physics & Integration
The core of the N-body simulation relies on deterministic symplectic and adaptive integrators to maintain long-term stability and handle close encounters.

- **Velocity Verlet:** Used as the baseline integrator for general N-body motion, providing symplectic properties ideal for energy conservation over long periods.
- **Dormand-Prince (RK45):** An adaptive Runge-Kutta method (4th/5th order) used for high-precision trial steps and evaluating close-encounter dynamics.
- **Gauss-Radau 5th-Order:** A fully implicit integration method utilized specifically for extremely tight orbital regimes and strong close encounters where explicit methods become unstable.

## 2. Gravity Calculation
Force evaluation algorithms used to calculate mutual gravitational attraction between bodies.

- **Direct Pairwise Summation ($O(N^2)$):** An exact N-body gravity calculation used for small numbers of bodies for extremely high accuracy.
- **Barnes-Hut Algorithm ($O(N \log N)$):** An octree-based approximation algorithm used for large-scale simulations (e.g., asteroid belts, star clusters).
  - *Source: Barnes, J., & Hut, P. (1986). A hierarchical O(N log N) force-calculation algorithm. Nature, 324(6096), 446-449.*

## 3. Random Number Generation
Deterministic randomness is essential for the authoritative server and client-side procedural generation in terms of reporoducability of results.

- **PCG-XSH-RR (Permuted Congruential Generator):** Used in the Rust physics core for fast, statistically robust, and deterministic pseudorandom number generation.
- **SplitMix32:** A 32-bit adaptation of the SplitMix64 algorithm, used on the TypeScript client for fast, seedable generation of the procedural starfield background.
- **Mulberry32:** A lightweight, seedable 32-bit PRNG utilized in WebGL shader uniform generation (e.g., star surface granulation).

## 4. Procedural Generation & Statistics
Statistical distributions and noise algorithms employed to generate realistic physical systems.

- **Box-Muller Transform:** Used to generate normally distributed (Gaussian) random variables.
- **Rayleigh Distribution:** Utilized to realistically sample orbital eccentricities and inclinations for generated planetary bodies and asteroids.
- **Power-Law Distribution:** Used to generate realistic mass spectrums for procedural asteroid belts ($P(m) \propto m^{-\alpha}$).
- **Plummer Sphere Density Profile:** Employed for the initial spatial distribution of procedural star clusters ($\rho(r) \propto (1 + (r/a)^2)^{-5/2}$).
- **Value Noise 2D & Convective Field Simulation:** Used to generate dynamic, procedural textures for stellar surfaces (granulation, solar lanes, and star spots).

## 5. Orbital Mechanics & Astrometry
Techniques for initializing and representing real-world solar system data.

- **Kepler's Equation & Newton-Raphson:** The Newton-Raphson iterative method is used to solve Kepler's equation ($M = E - e \sin E$) to convert Keplerian orbital elements into Cartesian state vectors (position and velocity).
- **JPL HORIZONS System:** The canonical source for the J2000 epoch orbital elements, masses, radii, and other physical parameters of the real-world Solar System bodies implemented in the presets.

## 6. Rendering & Shaders (Three.js/WebGL)
Algorithms used for high-fidelity visual representation of celestial bodies.

- **Blackbody to sRGB Conversion:** Star colors are derived from their effective temperatures using a blackbody radiation approximation algorithm.
  - *Source: Tanner Helland's (2012) algorithm for RGB values of blackbody radiators.*
- **Quadratic Limb-Darkening:** Applied in the star shader to realistically darken the edges of stars relative to their center, using the formula: $I(\mu) = 1 - a(1-\mu) - b(1-\mu)^2$.
- **Henyey-Greenstein Phase Function:** Used to accurately model the forward and backward light scattering of dust and ice particles within planetary rings.
- **Ray-Sphere Intersection:** Employed within the fragment shader for planetary rings to analytically calculate self-shadowing from the parent planet.
- **Floating Origin Camera:** The camera system dynamically resets the coordinate space origin to the camera's position to eliminate floating-point precision errors (Z-fighting, jittering) at astronomical scales.