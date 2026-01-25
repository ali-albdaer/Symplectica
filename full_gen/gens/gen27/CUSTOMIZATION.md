# Configuration Examples & Customization Guide

This guide shows how to customize the solar system and add new features.

## Adding a New Celestial Body

### Step 1: Add to config.js

In the `Config.bodies` section, add a new body:

```javascript
planet3: {
    name: 'Planet 3',
    mass: 3.3895e23,           // Mars mass
    radius: 3.3895e6,          // Mars radius
    semiMajorAxis: 2.279e11,   // 1.52 AU
    eccentricity: 0.0934,
    inclination: 0.03229,
    position: [2.279e11, 0, 0],
    velocity: [0, 24070, 0],   // Calculated orbital velocity
    rotationAxis: [0.1, 1, 0.05],
    rotationPeriod: 88643,     // Mars rotation period (seconds)
    color: { r: 0.8, g: 0.4, b: 0.2 },
    emissive: false,
},
```

### Step 2: Add to SceneManager.createCelestialBodies()

```javascript
const planet3Body = PhysicsEngine.createBody(bodiesConfig.planet3);
this.bodies.planet3 = planet3Body;
Renderer.createBodyMesh(planet3Body);
```

### Step 3: Calculate Orbital Velocity

For a circular orbit:
```
v = sqrt(G * M_sun / r)
v = sqrt(6.67430e-11 * 1.989e30 / 2.279e11)
v ≈ 24070 m/s
```

## Modifying Existing Parameters

### Through Developer Console (Runtime)

Press `/` to open console. Edit any value directly:
- Sun position, velocity, mass, radius
- Planet orbital parameters
- Physics timestep
- Rendering fidelity
- Player movement speeds

Changes apply **immediately** without reload.

### Through Config File (Permanent)

Edit `config.js` before loading:

```javascript
// Change sun's luminosity
sun: {
    luminosity: 5e26,  // Slightly dimmer
    // ... other parameters
},

// Change player spawn location
player: {
    spawnPosition: [1.496e11 + 1000, 6.371e6 + 10, 0],  // Different point on planet
    walkSpeed: 6.0,    // Faster movement
    jumpForce: 8.0,    // Higher jump
},

// Adjust rendering quality
rendering: {
    fidelity: 'ultra',  // 'low', 'medium', 'ultra'
    starCount: 10000,   // More stars
    lodEnabled: true,   // Enable level of detail
},
```

## Creating an Unstable System (for testing)

Edit config.js to create interesting orbital dynamics:

```javascript
// Very eccentric orbit
planet1: {
    // ... other properties
    position: [1.0e11, 0, 0],
    velocity: [0, 35000, 0],  // Faster than circular = elliptical
    eccentricity: 0.5,        // High eccentricity
},
```

## Adding More Interactive Objects

In `config.js`, modify `interactiveObjects`:

```javascript
interactiveObjects: {
    enabled: true,
    count: 10,          // More objects
    spawnRadius: 50,    // Spawn further away
    types: [
        {
            name: 'Rock',
            mass: 200,           // Heavier
            radius: 1.0,         // Larger
            color: { r: 0.5, g: 0.5, b: 0.5 },
            emissive: false,
            count: 5,
        },
        {
            name: 'Glowing Orb',
            mass: 100,
            radius: 0.8,
            color: { r: 1.0, g: 0.0, b: 1.0 },
            emissive: true,
            luminosity: 500,     // More glow
            count: 5,
        },
    ],
},
```

## Adjusting Physics Precision

For faster but less accurate simulation:

```javascript
physics: {
    G: 6.67430e-11,
    dt: 0.033,         // Larger timestep = faster but less accurate
    substeps: 2,       // Fewer substeps = faster
},
```

For slower but more accurate simulation:

```javascript
physics: {
    G: 6.67430e-11,
    dt: 0.008,         // Smaller timestep = slower but more accurate
    substeps: 8,       // More substeps = more accurate
},
```

## Changing Rendering Quality

Low-end system:
```javascript
rendering: {
    fidelity: 'low',
    shadowMapSize: { low: 256 },
    lodEnabled: true,
    starCount: 2000,
    ambientLightIntensity: 0.1,  // Slightly brighter
},
```

High-end system:
```javascript
rendering: {
    fidelity: 'ultra',
    shadowMapSize: { ultra: 4096 },
    lodEnabled: false,
    starCount: 20000,
    ambientLightIntensity: 0.0,  // No ambient light
},
```

## Changing Camera Settings

```javascript
camera: {
    fov: 90,                      // Wider field of view
    mouseSensitivity: 0.003,      // Less sensitive mouse
    thirdPersonDistance: 10.0,    // Further back in 3rd person
    thirdPersonSmoothing: 0.05,   // Snappier camera
},
```

## Player Movement Configuration

```javascript
player: {
    mass: 100,
    walkSpeed: 8.0,        // Faster walking
    sprintSpeed: 12.0,     // Faster sprinting
    jumpForce: 10.0,       // Higher jump
    freeFlySpeed: 30.0,    // Faster free flight
    freeFlyAccel: 100.0,   // Snappier acceleration
    damping: 0.9,          // Less friction
},
```

## Scaling the Solar System

To make planets closer (easier to reach):

```javascript
// In config.js, reduce distances and adjust velocities
planet1: {
    position: [5e10, 0, 0],     // Half the distance
    velocity: [0, 21000, 0],    // Slower for closer orbit
},

planet2: {
    position: [1e11, 0, 0],     // Half the distance
    velocity: [0, 9200, 0],
},
```

Then recalculate orbital velocity using:
```
v_new = v_old * sqrt(r_old / r_new)
```

## Adding a New Feature System

To add a new system (e.g., Telescope):

### 1. Create `telescope.js`

```javascript
window.TelescopeSystem = {
    enabled: false,
    zoom: 1.0,
    target: null,

    init() {
        DebugSystem.info('Telescope system initialized');
    },

    activate(targetBody) {
        this.enabled = true;
        this.target = targetBody;
        this.zoom = 10.0;
        DebugSystem.info(`Telescope focused on ${targetBody.name}`);
    },

    deactivate() {
        this.enabled = false;
        this.zoom = 1.0;
    },

    zoomIn() {
        this.zoom = Math.min(100, this.zoom * 1.1);
    },

    zoomOut() {
        this.zoom = Math.max(1, this.zoom / 1.1);
    },

    update(deltaTime) {
        if (!this.enabled) return;
        // Update telescope logic here
    },
};
```

### 2. Add to `main.js` initialization

```javascript
DebugSystem.setLoadingStatus('Initializing telescope system');
TelescopeSystem.init();
```

### 3. Add to main loop in `main.js`

```javascript
updateGameLogic() {
    // ... existing code ...
    TelescopeSystem.update(this.deltaTime);
}
```

### 4. Add to input handler in `input-handler.js`

```javascript
keyBindings: {
    // ... existing ...
    telescope: ['t', 'T'],
    zoomIn: ['MouseWheel_Up'],
    zoomOut: ['MouseWheel_Down'],
}
```

## Example: Creating a Blackhole

```javascript
blackhole: {
    name: 'Blackhole',
    mass: 1e31,             // Stellar mass blackhole
    radius: 3000,           // Schwarzschild radius
    position: [3e11, 0, 0],
    velocity: [0, 0, 0],
    color: { r: 0.0, g: 0.0, b: 0.0 },
    emissive: true,
    isBlackhole: true,      // Custom flag
}
```

Then in `renderer.js`, handle blackholes specially:

```javascript
if (body.isBlackhole) {
    // Create accretion disk mesh
    // Add distortion effect
}
```

## Example: Creating a Star System

To make multiple suns:

```javascript
sun2: {
    name: 'Alpha Centauri',
    mass: 2.2e30,           // 1.1 solar masses
    radius: 9e8,
    position: [1e13, 0, 0], // Far away
    velocity: [0, 0, 0],
    color: { r: 1.0, g: 0.8, b: 0.6 },
    emissive: true,
    isLightSource: true,
},
```

Both suns will affect gravity in the system!

## Troubleshooting Orbital Instability

If orbits decay:

1. Check timestep isn't too large:
   ```javascript
   dt: 0.008,    // Smaller is safer
   substeps: 8,  // More integration steps
   ```

2. Verify velocities using formula:
   ```
   v_escape = sqrt(2*G*M/r)
   v_orbital = sqrt(G*M/r)
   
   For stable orbit: v < v_escape
   For circular orbit: v ≈ v_orbital
   ```

3. Check masses are realistic relative to distances

4. Monitor energy in developer console (orbital energy should be constant)

## Performance Tuning

To improve FPS:

1. **Reduce bodies**: Comment out planets in scene-manager.js
2. **Lower fidelity**: Change rendering.fidelity to 'low'
3. **Fewer stars**: Reduce rendering.starCount
4. **Disable shadows**: Set rendering.shadowMapSize to 256
5. **Increase timestep**: Use dt: 0.033 with substeps: 2

To improve visual quality:

1. **Increase fidelity**: Change to 'ultra'
2. **More stars**: Increase rendering.starCount
3. **Better shadows**: Use shadowMapSize: 4096
4. **More substeps**: Use substeps: 8
5. **Enable LOD**: Set rendering.lodEnabled to true

## Real Values Reference

Useful real astronomical data for configuration:

```javascript
// Distances (meters)
AU: 1.496e11,              // Earth-Sun distance
earthSunDist: 1.496e11,
jupiterSunDist: 7.784e11,
marsSunDist: 2.279e11,
venusSunDist: 1.082e11,

// Masses (kg)
sunMass: 1.989e30,
earthMass: 5.972e24,
jupiterMass: 1.898e27,
marsMass: 3.3895e23,
moonMass: 7.342e22,

// Radii (meters)
sunRadius: 6.96e8,
earthRadius: 6.371e6,
jupiterRadius: 6.991e7,
marsRadius: 3.3895e6,
moonRadius: 1.737e6,

// Orbital velocities (m/s)
earthVelocity: 29.78e3,
jupiterVelocity: 13.07e3,
marsVelocity: 24.07e3,
moonVelocity: 1.022e3,  // Around earth

// Rotation periods (seconds)
sunRotation: 2.592e6,    // 30 days
earthRotation: 86400,    // 24 hours
jupiterRotation: 35730,  // ~10 hours
marsRotation: 86400,     // ~24 hours
moonRotation: 2.36e6,    // 27.3 days
```

---

Use these examples to customize your solar system! Press `/` in-game to see all parameters in real-time.
