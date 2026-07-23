# Symplectica - Sources & Algorithms

This document provides a comprehensive overview of the mathematical, physical, and algorithmic sources, models, and methods utilized in the development of Symplectica.

## 1. Physics & Integration
The core of the N-body simulation relies on deterministic symplectic and adaptive integrators to maintain long-term stability and handle close encounters.

- **Velocity Verlet:** Used as the baseline integrator for general N-body motion, providing symplectic properties ideal for energy conservation over long periods. 
  - *Reference: Swope, W. C. et al. (1982). A computer simulation method for the calculation of equilibrium constants. [Link](https://doi.org/10.1063/1.442716)*
- **Dormand-Prince (RK45):** An adaptive Runge-Kutta method (4th/5th order) used for high-precision trial steps and evaluating close-encounter dynamics.
  - *Reference: Dormand, J. R., & Prince, P. J. (1980). A family of embedded Runge-Kutta formulae. Journal of Computational and Applied Mathematics, 6(1), 19-26. [Link](https://doi.org/10.1016/0771-050X(80)90013-3)*
- **Gauss-Radau 5th-Order:** A fully implicit integration method utilized specifically for extremely tight orbital regimes and strong close encounters where explicit methods become unstable.
  - *Reference: Everhart, E. (1985). An efficient integrator that uses Gauss-Radau spacings. Dynamics of Comets: Their Origin and Evolution, 115, 185-202. [Link](https://ui.adsabs.harvard.edu/abs/1985ASSL..115..185E/abstract)*

## 2. Gravity Calculation
Force evaluation algorithms used to calculate mutual gravitational attraction between bodies.

- **Direct Pairwise Summation ($O(N^2)$):** An exact N-body gravity calculation used for small numbers of bodies for extremely high accuracy.
- **Barnes-Hut Algorithm ($O(N \log N)$):** An octree-based approximation algorithm used for large-scale simulations (e.g., asteroid belts, star clusters).
  - *Reference: Barnes, J., & Hut, P. (1986). A hierarchical O(N log N) force-calculation algorithm. Nature, 324(6096), 446-449. [Link](https://doi.org/10.1038/324446a0)*

## 3. Random Number Generation
Deterministic randomness is essential for the authoritative server and client-side procedural generation in terms of reproducibility of results.

- **PCG-XSH-RR (Permuted Congruential Generator):** Used in the Rust physics core for fast, statistically robust, and deterministic pseudorandom number generation.
  - *Reference: O'Neill, M. E. (2014). PCG: A Family of Simple Fast Space-Efficient Statistically Good Algorithms for Random Number Generation. [Link](https://www.pcg-random.org/paper.html)*
- **SplitMix32:** A 32-bit adaptation of the SplitMix64 algorithm, used on the TypeScript client for fast, seedable generation of the procedural starfield background.
  - *Reference: Steele Jr, G. L., Lea, D., & Flood, C. H. (2014). Fast splittable pseudorandom number generators. ACM SIGPLAN Notices, 49(10), 453-472. [Link](https://doi.org/10.1145/2660193.2660195)*
- **Mulberry32:** A lightweight, seedable 32-bit PRNG utilized in WebGL shader uniform generation (e.g., star surface granulation).
  - *Reference: Tommy Ettinger. [Link](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c)*

## 4. Procedural Generation & Statistics
Statistical distributions and noise algorithms employed to generate realistic physical systems.

- **Box-Muller Transform:** Used to generate normally distributed (Gaussian) random variables. [Link](https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform)
- **Rayleigh Distribution:** Utilized to realistically sample orbital eccentricities and inclinations for generated planetary bodies and asteroids. [Link](https://en.wikipedia.org/wiki/Rayleigh_distribution)
- **Power-Law Distribution:** Used to generate realistic mass spectrums for procedural asteroid belts ($P(m) \propto m^{-\alpha}$). [Link](https://en.wikipedia.org/wiki/Power_law)
- **Plummer Sphere Density Profile:** Employed for the initial spatial distribution of procedural star clusters ($\rho(r) \propto (1 + (r/a)^2)^{-5/2}$). [Link](https://en.wikipedia.org/wiki/Plummer_model)
- **Value Noise 2D & Convective Field Simulation:** Used to generate dynamic, procedural textures for stellar surfaces (granulation, solar lanes, and star spots).
- **Simplex & Worley Noise:** Employed to procedurally generate planetary terrain and cloud layers. 
  - *References:* Perlin, K. (2001). Noise hardware. [Link](https://doi.org/10.1145/1198555.1198581); Worley, S. (1996). A cellular texture basis function. [Link](https://doi.org/10.1145/237170.237267)

## 5. Orbital Mechanics & Astrometry
Techniques for initializing and representing real-world solar system data.

- **Kepler's Equation & Newton-Raphson:** The Newton-Raphson iterative method is used to solve Kepler's equation ($M = E - e \sin E$) to convert Keplerian orbital elements into Cartesian state vectors. [Link](https://en.wikipedia.org/wiki/Kepler%27s_equation)
- **JPL HORIZONS System:** The canonical source for the J2000 epoch orbital elements, masses, radii, and other physical parameters of the real-world Solar System bodies implemented in the presets. [Link](https://ssd.jpl.nasa.gov/horizons/)

## 6. Rendering & Shaders (Three.js/WebGL)
Algorithms used for high-fidelity visual representation of celestial bodies.

- **Blackbody to sRGB Conversion:** Star colors are derived from their effective temperatures using a blackbody radiation approximation algorithm.
  - *Reference: Tanner Helland's (2012) algorithm for RGB values of blackbody radiators. [Link](https://tannerhelland.com/2012/10/26/color-temperature-algorithm.html)*
- **Precomputed Atmospheric Scattering:** Physics-based Rayleigh and Mie scattering models to simulate atmospheric optics with multiple scattering.
  - *Reference: Bruneton, E., & Neyret, F. (2008). Precomputed Atmospheric Scattering. Computer Graphics Forum, 27(4), 1079-1086. [Link](https://doi.org/10.1111/j.1467-8659.2008.01245.x)*
- **Quadratic Limb-Darkening:** Applied in the star shader to realistically darken the edges of stars relative to their center, using the formula: $I(\mu) = 1 - a(1-\mu) - b(1-\mu)^2$. [Link](https://en.wikipedia.org/wiki/Limb_darkening)
- **Henyey-Greenstein Phase Function:** Used to accurately model the forward and backward light scattering of dust and ice particles within planetary rings. [Link](https://en.wikipedia.org/wiki/Phase_function_(astronomy))
- **Ray-Sphere Intersection:** Employed within the fragment shader for planetary rings to analytically calculate self-shadowing from the parent planet.
- **Floating Origin Camera:** The camera system dynamically resets the coordinate space origin to the camera's position to eliminate floating-point precision errors (Z-fighting, jittering) at astronomical scales.