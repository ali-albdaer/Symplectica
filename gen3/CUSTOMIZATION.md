# Solar System Configuration Template

This file provides examples and templates for customizing your solar system.

## Adding a New Planet

### Step 1: Define in config.js

```javascript
const PLANET_3 = {
    name: 'Neptune-like',
    mass: 1.024e26,                    // kg (Neptune's mass)
    radius: 24622 * SCALE.size,        // km
    orbitRadius: 450e6 * SCALE.distance,  // km from sun
    orbitPeriod: 164.8 * 365.25 * 24 * 3600,  // seconds (164.8 years)
    rotationPeriod: 16.1 * 3600,       // seconds (16.1 hours)
    axialTilt: 28.3,                   // degrees
    eccentricity: 0.009,               // nearly circular
    density: 1638,                     // kg/m³
    albedo: 0.41,                      // reflectivity
    color: 0x4169E1,                   // blue color
    hasAtmosphere: true,
    atmosphereColor: 0x87CEEB,
    atmosphereOpacity: 0.4,
    surfaceGravity: 11.15              // m/s²
};

// Don't forget to export it!
export { ..., PLANET_3 };
```

### Step 2: Add to main.js

In the `createCelestialBodies()` method:

```javascript
// Create Planet 3
this.celestialBodies.planet3 = new CelestialBody(PLANET_3);
this.scene.add(this.celestialBodies.planet3.mesh);
this.physics.addCelestialBody(this.celestialBodies.planet3);

// Create orbit line
const orbit3 = this.celestialBodies.planet3.createOrbitLine();
if (orbit3) this.scene.add(orbit3);
```

## Adding a New Moon

### Step 1: Define in config.js

```javascript
const MOON_2 = {
    name: 'Phobos-like',
    mass: 1.0659e16,                   // kg
    radius: 11.267 * SCALE.size,       // km
    orbitRadius: 9376 * SCALE.distance,     // km from parent
    orbitPeriod: 0.31891 * 24 * 3600,  // seconds (7.65 hours)
    rotationPeriod: 0.31891 * 24 * 3600,  // tidally locked
    eccentricity: 0.0151,
    density: 1876,                     // kg/m³
    albedo: 0.071,                     // very dark
    color: 0x3D3D3D,                   // dark gray
    parentBody: 'Ares',                // orbits Planet 2
    surfaceGravity: 0.0057             // m/s²
};

export { ..., MOON_2 };
```

### Step 2: Add to main.js

```javascript
// Create Moon 2 (orbiting Planet 2)
this.celestialBodies.moon2 = new CelestialBody(MOON_2, this.celestialBodies.planet2);
this.scene.add(this.celestialBodies.moon2.mesh);
this.physics.addCelestialBody(this.celestialBodies.moon2);
```

## Real Solar System Scale

Here are real values for our solar system (before scaling):

### Mercury
```javascript
mass: 3.285e23          // kg
radius: 2439.7          // km
orbitRadius: 57.9e6     // km
orbitPeriod: 88         // days
rotationPeriod: 58.6    // days
surfaceGravity: 3.7     // m/s²
```

### Venus
```javascript
mass: 4.867e24
radius: 6051.8
orbitRadius: 108.2e6
orbitPeriod: 225        // days
rotationPeriod: -243    // days (retrograde)
surfaceGravity: 8.87
```

### Earth
```javascript
mass: 5.972e24
radius: 6371
orbitRadius: 149.6e6    // 1 AU
orbitPeriod: 365.25     // days
rotationPeriod: 1       // day
surfaceGravity: 9.81
```

### Mars
```javascript
mass: 6.39e23
radius: 3389.5
orbitRadius: 227.9e6
orbitPeriod: 687        // days
rotationPeriod: 1.03    // days
surfaceGravity: 3.71
```

### Jupiter
```javascript
mass: 1.898e27
radius: 69911
orbitRadius: 778.5e6
orbitPeriod: 4333       // days (11.86 years)
rotationPeriod: 0.414   // days (9.9 hours)
surfaceGravity: 24.79
```

### Saturn
```javascript
mass: 5.683e26
radius: 58232
orbitRadius: 1434e6
orbitPeriod: 10759      // days (29.5 years)
rotationPeriod: 0.444   // days (10.7 hours)
surfaceGravity: 10.44
```

## Custom Scenarios

### Binary Star System

```javascript
const STAR_1 = {
    name: 'Star A',
    mass: 1.989e30,
    radius: 696340 * SCALE.size,
    orbitRadius: 50000 * SCALE.distance,  // Orbit around barycenter
    orbitPeriod: 100 * 365.25 * 24 * 3600,
    rotationPeriod: 25.4 * 24 * 3600,
    color: 0xFDB813,
    emissive: 0xFFA500,
    emissiveIntensity: 1.5
};

const STAR_2 = {
    name: 'Star B',
    mass: 1.5e30,
    radius: 600000 * SCALE.size,
    orbitRadius: 50000 * SCALE.distance,
    orbitPeriod: 100 * 365.25 * 24 * 3600,
    rotationPeriod: 20 * 24 * 3600,
    color: 0xFF6B6B,
    emissive: 0xFF0000,
    emissiveIntensity: 1.3
};
```

### Ring System (Future Enhancement)

```javascript
// Placeholder for ring system
const SATURN_RINGS = {
    innerRadius: 66900 * SCALE.size,
    outerRadius: 140220 * SCALE.size,
    texture: 'path/to/ring/texture.png',
    opacity: 0.8,
    particleCount: 100000
};
```

### Asteroid Belt (Future Enhancement)

```javascript
const ASTEROID_BELT = {
    innerRadius: 329e6 * SCALE.distance,
    outerRadius: 479e6 * SCALE.distance,
    asteroidCount: 1000,
    averageMass: 1e15,
    averageRadius: 100 * SCALE.size
};
```

## Color Palettes

### Realistic Planet Colors
```javascript
Mercury: 0x8C7853  // Grayish-brown
Venus:   0xFFC649  // Yellowish
Earth:   0x4169E1  // Blue
Mars:    0xCD5C5C  // Reddish
Jupiter: 0xC88B3A  // Orange-brown
Saturn:  0xFAD5A5  // Pale gold
Uranus:  0x4FD0E0  // Cyan
Neptune: 0x4169E1  // Deep blue
```

### Sci-Fi Colors
```javascript
Neon Planet:     0x00FF00
Lava World:      0xFF4500
Ice Giant:       0x00CED1
Desert World:    0xDAA520
Ocean World:     0x006994
Jungle World:    0x228B22
Purple Haze:     0x9370DB
```

## Atmospheric Effects

### Thick Atmosphere (Venus-like)
```javascript
hasAtmosphere: true,
atmosphereColor: 0xFFC649,
atmosphereOpacity: 0.7,
atmosphereHeight: 1.3  // 30% larger than planet
```

### Thin Atmosphere (Mars-like)
```javascript
hasAtmosphere: true,
atmosphereColor: 0xFFB6C1,
atmosphereOpacity: 0.15,
atmosphereHeight: 1.05
```

### Dense Atmosphere (Gas Giant)
```javascript
hasAtmosphere: true,
atmosphereColor: 0xC88B3A,
atmosphereOpacity: 0.9,
atmosphereHeight: 1.5
```

## Physics Variations

### Low Gravity Moon
```javascript
PHYSICS.gravityMultiplier: 0.3
// Makes everything feel floaty and moon-like
```

### High Gravity Planet
```javascript
surfaceGravity: 20  // 2x Earth gravity
// Makes jumping harder, objects fall faster
```

### Fast Time
```javascript
SCALE.time: 360  // 6x faster than default
// Planets orbit quickly, day/night cycle is fast
```

### Slow Motion
```javascript
SCALE.time: 10
PHYSICS.timeStep: 1/120  // Higher precision
// Everything moves in slow motion
```

## Tips for Balancing

1. **Keep Scale Consistent**: Use SCALE factors uniformly
2. **Test Orbital Stability**: Run simulation for several minutes
3. **Visual vs Reality**: Sometimes sacrificing realism for gameplay is OK
4. **Performance**: More bodies = more calculations
5. **Player Experience**: Ensure distances are traversable in flight mode

## Example: Complete Mini Solar System

```javascript
// A small, fast-paced solar system
const MINI_SUN = {
    name: 'Mini Sun',
    mass: 1e29,
    radius: 50000 * SCALE.size,
    // ... rest of sun config
};

const MINI_PLANET = {
    name: 'Close Orbiter',
    mass: 5e23,
    radius: 3000 * SCALE.size,
    orbitRadius: 100000 * SCALE.distance,  // Very close
    orbitPeriod: 10 * 24 * 3600,           // 10 day year
    rotationPeriod: 2 * 3600,              // 2 hour day
    // ... rest of config
};
```

## Debugging Tips

1. **Console Logging**: Add `console.log(planet.position)` to track movement
2. **Orbit Lines**: Toggle them visible to see paths
3. **Slow Time**: Reduce time scale to see detailed motion
4. **Dev Menu**: Use to adjust on the fly

Happy customizing! 🌟
