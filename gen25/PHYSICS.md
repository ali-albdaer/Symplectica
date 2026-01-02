# Physics Implementation Details

## N-Body Gravitational Simulation

### Core Principles

This simulation implements a complete N-body gravitational system where every object with mass exerts gravitational force on every other object.

### Newton's Law of Universal Gravitation

```
F = G * (m1 * m2) / r²
```

Where:
- **F** = Gravitational force (Newtons)
- **G** = Gravitational constant (6.674×10⁻¹¹ m³ kg⁻¹ s⁻²)
- **m1, m2** = Masses of the two bodies (kg)
- **r** = Distance between centers of mass (m)

### Implementation

The physics engine calculates forces between all pairs of bodies:

```javascript
for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
        // Calculate force between body[i] and body[j]
        // Apply equal and opposite forces (Newton's 3rd law)
    }
}
```

**Time Complexity**: O(n²) where n = number of bodies

## Integration Methods

### 1. Euler Integration (Simple but less accurate)

```
v(t+dt) = v(t) + a(t) * dt
x(t+dt) = x(t) + v(t) * dt
```

**Pros**: Fast, simple
**Cons**: Energy drift, unstable for tight orbits
**Use case**: Quick prototyping

### 2. Verlet Integration (Recommended)

```
x(t+dt) = 2*x(t) - x(t-dt) + a(t) * dt²
v(t) = (x(t+dt) - x(t-dt)) / (2*dt)
```

**Pros**: Time-reversible, good energy conservation
**Cons**: Requires storing previous position
**Use case**: Long-term orbital stability

### 3. Runge-Kutta 4th Order (Most Accurate)

Uses four intermediate evaluations per step:

```
k1 = f(t, y)
k2 = f(t + dt/2, y + k1*dt/2)
k3 = f(t + dt/2, y + k2*dt/2)
k4 = f(t + dt, y + k3*dt)

y(t+dt) = y(t) + (k1 + 2*k2 + 2*k3 + k4) * dt/6
```

**Pros**: Highly accurate, minimal drift
**Cons**: 4x slower than Euler
**Use case**: Precise simulations, research

## Stability Considerations

### Physics Substeps

Breaking each frame into multiple physics steps improves stability:

```javascript
const substepDelta = deltaTime / substeps;
for (let i = 0; i < substeps; i++) {
    updatePhysics(substepDelta);
}
```

**Why it helps**:
- Smaller time steps = more accurate integration
- Prevents tunneling and instabilities
- Allows visual frame rate independence

**Default**: 4 substeps
**Recommendation**: Increase for faster orbits or higher accuracy

### Delta Time Capping

```javascript
const cappedDelta = Math.min(deltaTime, 0.1);
```

Prevents physics explosions when:
- Tab is inactive and returns with huge dt
- Performance hitches cause frame skips
- Browser throttles updates

### Safe Distance Calculations

```javascript
const minDistance = Math.max(bodyA.radius + bodyB.radius, 1);
const safeDist = Math.max(distance, minDistance);
```

Prevents:
- Division by zero
- Infinite forces at zero distance
- Numerical instabilities

## Orbital Mechanics

### Circular Orbit Velocity

For a stable circular orbit:

```
v = √(GM/r)
```

**Example** (Earth around Sun):
```javascript
G = 6.674e-11
M_sun = 1.989e30 kg
r = 1.496e11 m (1 AU)

v = √((6.674e-11 * 1.989e30) / 1.496e11)
v ≈ 29,780 m/s
```

This is pre-calculated in the config for stability.

### Orbital Period

```
T = 2π√(r³/GM)
```

**Earth's orbital period**:
```javascript
T = 2 * π * √((1.496e11)³ / (6.674e-11 * 1.989e30))
T ≈ 31,558,149 seconds ≈ 1 year
```

### Escape Velocity

```
v_escape = √(2GM/r)
```

This is √2 times the orbital velocity.

## Player Physics

### Gravity Calculation

Player feels gravity from all celestial bodies:

```javascript
getGravityAtPoint(position) {
    let totalGravity = Vector3(0, 0, 0);
    
    for (body in celestialBodies) {
        direction = normalize(body.position - position);
        distance = length(body.position - position);
        g = G * body.mass / distance²
        totalGravity += direction * g;
    }
    
    return totalGravity;
}
```

### Surface Normal

On a spherical planet:

```javascript
normal = normalize(playerPosition - planetPosition)
```

This gives the "up" direction for:
- Jump direction
- Camera orientation
- Movement plane projection

### Movement Force Application

Walking applies force in the camera-relative direction:

```javascript
moveForce = moveDirection * walkSpeed * playerMass * 10
physics.applyForce(player, moveForce)
```

The `* 10` is a tuning factor for responsive controls.

## Performance Optimization

### Spatial Partitioning (Future)

For hundreds of bodies, implement:
- Octree or BVH structure
- Only calculate forces for nearby bodies
- Approximate distant clusters as single bodies

### GPU Acceleration (Future)

Compute shaders could parallelize force calculations:
- Each thread handles one body
- Massive speedup for large N
- Requires WebGPU

### Adaptive Time Stepping

Adjust substeps based on:
- Proximity to massive bodies
- Current velocity
- Desired accuracy

## Debugging Physics

### Check Orbital Stability

```javascript
// In console
physics.logSystemState();
```

Shows position, velocity for all bodies.

### Verify Energy Conservation

```javascript
// Calculate total energy
let KE = 0, PE = 0;

for (body of bodies) {
    KE += 0.5 * body.mass * body.velocity.lengthSq();
    
    for (other of bodies) {
        if (other !== body) {
            r = distance(body, other);
            PE -= G * body.mass * other.mass / r;
        }
    }
}

totalEnergy = KE + PE / 2; // Divide by 2 (counted twice)
```

Total energy should remain constant (with small drift from numerical errors).

### Common Issues

**Orbits decay inward**:
- Initial velocity too low
- Time step too large
- Using Euler integration

**Orbits expand outward**:
- Initial velocity too high
- Numerical instability

**Erratic motion**:
- Bodies too close (forces too large)
- Time step too large
- Need more substeps

**Bodies fly away**:
- Incorrect initial conditions
- Missing safe distance clamping
- Delta time spike

## Advanced Techniques

### Adaptive Integration

Switch methods based on conditions:
```javascript
if (highAccuracyNeeded) {
    useRK4();
} else {
    useVerlet();
}
```

### Symplectic Integrators

Preserve phase space volume (future enhancement):
- Leapfrog integration
- Velocity Verlet
- Symplectic Euler

### Relativistic Effects (Future)

For extreme scenarios:
```
F = GMm/r² * (1 + corrections)
```

Where corrections include:
- Schwarzschild precession
- Gravitational time dilation
- Frame dragging

## Mathematical Foundations

### Vector Operations

```javascript
// Force direction
direction = (bodyB.pos - bodyA.pos).normalize();

// Force magnitude
magnitude = G * m1 * m2 / r²;

// Force vector
force = direction * magnitude;

// Apply to bodies (Newton's 3rd law)
bodyA.force += force;
bodyB.force -= force;
```

### Phase Space

Each body exists in 6D phase space:
- Position: (x, y, z)
- Velocity: (vx, vy, vz)

The simulation evolves this state over time.

### Numerical Precision

Using double-precision floats (64-bit):
- ~15-17 significant digits
- Sufficient for solar system scales
- May need arbitrary precision for long-term (million year) simulations

## References

1. Newton's *Principia Mathematica* - Universal gravitation
2. Feynman *Lectures on Physics* - Classical mechanics
3. Hairer et al. *Geometric Numerical Integration* - Symplectic methods
4. Press et al. *Numerical Recipes* - RK4 and integration methods

## Configuration Tips

### For Scientific Accuracy
```javascript
CONFIG.simulation.integrationMethod = 'rk4';
CONFIG.simulation.physicsSubsteps = 8;
CONFIG.simulation.timeScale = 1.0;
```

### For Performance
```javascript
CONFIG.simulation.integrationMethod = 'verlet';
CONFIG.simulation.physicsSubsteps = 2;
CONFIG.simulation.timeScale = 10.0; // Speed up to see results
```

### For Education
```javascript
// Try different methods and compare!
// Log total energy and see which conserves best
// Experiment with time scales
```

---

This physics engine provides a solid foundation for:
- Educational demonstrations
- Game development
- Scientific visualization
- Further research and experimentation

The code is designed to be readable, modifiable, and expandable for future enhancements like relativistic effects, black holes, and more exotic phenomena.
