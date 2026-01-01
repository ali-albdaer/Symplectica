# Quick Start Guide

## Running the Simulation

1. **Open in Browser**
   - Navigate to the folder containing `index.html`
   - Open `index.html` in Chrome, Firefox, or Edge
   - The simulation will load immediately (no build process needed)

2. **Wait for Initialization**
   - You'll see the black space environment load
   - Console will confirm: "Game Engine: Initialized and ready"

## First Steps

### Your First Minute
1. **Look Around**: Move your mouse to look (pointer will lock automatically on click)
2. **Walk**: Use WASD to move across the surface near your spawn point
3. **Jump**: Press Space to jump
4. **View Objects**: Look around to see the interactive objects nearby (red cube, green sphere, blue cylinder)

### Object Interaction
1. Position your crosshair over an object
2. **Right-click** to grab it
3. Move your mouse to move the object
4. **Right-click again** to release

### Toggle Modes
- **Press F**: Enter Free Flight mode (6-DOF movement)
  - WASD: Forward/Back/Left/Right
  - Space: Up
  - Shift: Down
- **Press F again**: Return to walking mode

### View Telemetry
- **Press Tab**: Toggle the performance overlay
  - Shows FPS, frame time, position, body count
  - Press Tab again to hide

### Open Dev Console
- **Press /** (forward slash): Opens developer console
  - Adjust physics parameters in real-time
  - View debug logs
  - Press again to close

### Third-Person Camera
- In the dev console, look for camera mode options
- Or manually toggle in code

## Exploration

### Celestial Bodies
Four bodies orbit each other due to gravity:
1. **Sun** - Bright yellow, center of system
2. **Earth** - Blue sphere, rotates
3. **Moon** - Gray, orbits Earth
4. **Mars** - Red-orange, outer orbit

The system is designed to be stable—watch the orbits continue indefinitely.

### Physics Experimentation
In the dev console:

```javascript
// Slow down time to observe orbits
Config.physics.timeScale = 0.5;

// Speed up to see long-term behavior
Config.physics.timeScale = 10;

// Grab an interactive object and throw it
// It will follow realistic physics and gravity!
```

### Camera Control
- Mouse movement: Look around
- ESC: Unlock pointer (pauses look control)
- Click canvas: Re-lock pointer

## Performance Tuning

If the simulation is slow:

1. **Lower Fidelity** (Dev Console):
   - Change "Fidelity" from Medium to Low
   - Click "Apply"

2. **Disable Visual Features**:
   - Uncheck "LOD Enabled"
   - Uncheck "Frustum Culling"

If too fast:
- Increase "Time Scale" to slow simulation
- Increase physics substeps (in Config.js directly)

## Common Controls Cheat Sheet

```
MOVEMENT & CAMERA
├─ WASD          : Move (Walking) / Move in plane (Flight)
├─ Mouse         : Look around
├─ Space         : Jump (Walking) / Up (Flight)
├─ Shift         : Not used (Walking) / Down (Flight)
├─ F             : Toggle Free Flight
├─ ESC           : Unlock pointer

INTERACTION
├─ Right-Click   : Grab/Release object
├─ Left-Click    : Nothing (reserved for pointer lock)

UI & DEBUG
├─ Tab           : Toggle telemetry overlay
├─ /             : Toggle developer console
└─ Close Dev Console : Click elsewhere or press /

DEVELOPER CONSOLE SHORTCUTS
├─ Gravity       : Change physics gravity constant
├─ Time Scale    : Speed up/slow down simulation
├─ Fidelity      : Low/Medium/Ultra quality
├─ LOD Enabled   : Enable dynamic detail levels
├─ Camera Sensitivity : Adjust mouse look speed
└─ (More options in controls panel)
```

## Modifying the Simulation

### Add a New Planet

Edit `Config.js`, find `celestialBodies` array:

```javascript
{
    name: 'Jupiter',
    type: 'planet',
    mass: 1.898e27,
    radius: 69911,
    sceneRadius: 15, // visual size
    position: { x: 778000, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: -13.07 },
    rotationSpeed: 0.0001,
    color: 0xC88B3A,
    emissive: 0x000000,
    emissiveIntensity: 0,
    castShadow: true,
    receiveShadow: true
}
```

Reload the page—your planet appears!

### Add Interactive Objects

Edit `Config.js`, find `interactiveObjects` array:

```javascript
{
    name: 'MyBox',
    type: 'box',
    mass: 20,
    size: { x: 2, y: 2, z: 2 },
    position: { x: 60, y: 10, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    color: 0xFF00FF // Magenta
}
```

### Change Physics Settings

In `Config.js`:
```javascript
physics: {
    gravity: -9.81,          // Planet surface gravity
    universalG: 6.67430e-11, // Gravitational constant
    damping: 0.99,           // Velocity damping
    substeps: 4,             // Physics substeps per frame
    timeScale: 1.0           // Simulation speed
}
```

Or use Dev Console (live changes without reload):
1. Press `/` to open console
2. Adjust sliders and buttons
3. Changes apply immediately

## Troubleshooting

### Issue: Black screen
**Solution:**
- Check browser console (F12) for errors
- Try reloading (Ctrl+R)
- Verify WebGL 2.0 support

### Issue: Very slow FPS
**Solution:**
- Open dev console (/)
- Lower fidelity to "Low"
- Uncheck LOD and Frustum Culling
- Check Memory value—if > 500MB, try reloading

### Issue: Physics feels unstable/crazy
**Solution:**
- In dev console, set Time Scale to 0.5
- Check if you grabbed an object and it's flying around—release it

### Issue: Can't look around
**Solution:**
- Click on the canvas to lock pointer
- If pointer won't lock, ESC and try again
- Dev console might be open—close it (press /)

### Issue: Objects disappear
**Solution:**
- This is normal! They're beyond the camera's far plane
- You can fly very far away and objects will fade
- Use Free Flight (press F) and Shift to descend

## Advanced Features

### Volumetric Objects (Nebula Effects)

The code includes a `VolumetricObject` class for special visual effects:

```javascript
const nebula = new VolumetricObject(id, {
    name: 'TestNebula',
    position: { x: 500000, y: 0, z: 0 },
    volumeScale: 100000,
    color: 0xFF69B4
});
nebula.createMesh('medium');
renderer.add(nebula);
```

### Blackhole Special Object

```javascript
const blackhole = new Blackhole(id, {
    name: 'SGR A*',
    mass: 4.1e6 * 1.989e30, // Solar masses
    sceneRadius: 100,
    position: { x: 1000000, y: 0, z: 0 },
    accretionDiskRadiusScale: 5
});
blackhole.createMesh();
renderer.add(blackhole);
```

## Next Steps

1. **Explore**: Walk around, grab objects, experiment with gravity
2. **Customize**: Add new planets, change colors, adjust orbits
3. **Optimize**: Tweak physics settings for different behaviors
4. **Extend**: Add new entity types, special effects, or gameplay mechanics

For detailed API documentation, see `README.md`.

---

**Ready to explore the solar system?** Open `index.html` and start flying!
