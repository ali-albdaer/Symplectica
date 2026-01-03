# 3D Solar System Simulation - Complete Architecture

A production-ready, web-based 3D Solar System simulation built with Three.js and Cannon-es physics engine. No build tools required—everything runs directly in the browser via CDN.

## Features

### Core Simulation
- **N-Body Gravitational Physics**: All celestial bodies exert gravitational forces on each other
- **Stable Default Configuration**: Pre-tuned initial parameters for Sun, Earth, Moon, and Mars
- **Interactive Objects**: Physics-enabled objects near player spawn point
- **Real-time Physics**: Substep integration for stability

### Player Mechanics
- **Dual-Mode Movement**:
  - **Walking Mode**: WASD + Space to jump, with gravity-aligned orientation
  - **Free Flight Mode**: 6-DOF movement (F to toggle)
- **Object Interaction**: Right-click to grab/hold interactive objects
- **Smooth First-Person & Third-Person Cameras**: Toggle with cinematic transitions

### Rendering & Performance
- **3-Level Fidelity Settings**: Low, Medium, Ultra with dynamic quality adjustment
- **Level of Detail (LOD)**: Automatic geometry detail reduction for distant objects
- **Frustum Culling**: Optional visibility optimization
- **Shadow Mapping**: Realistic shadows from the Sun light source
- **No Global Illumination**: Sun is sole light source for realism

### Developer Tools
- **Dev Console** (Press `/`):
  - Real-time config editor
  - Live parameter adjustment
  - Debug log output
  - Physics/rendering settings control
- **Telemetry Overlay** (Press `Tab`):
  - FPS, Frame Time
  - Player position & velocity
  - Draw calls, memory usage
- **Global Debug System**: Error capture and on-screen reporting

### Controls

| Action | Key(s) | Mode |
|--------|--------|------|
| Move | WASD | Both |
| Jump | Space | Walking |
| Free Flight | F | Toggle |
| Ascend (Flight) | Space | Free Flight |
| Descend (Flight) | Shift | Free Flight |
| Grab Object | Right-Click | Both |
| Dev Console | / | Any |
| Telemetry | Tab | Any |
| Unlock Pointer | ESC | Any |

## Architecture Overview

```
project/
├── index.html              # Entry point with CDN links
├── js/
│   ├── debug-log.js       # Global error & log capture
│   ├── utilities.js       # Math, vector, and helper functions
│   ├── config.js          # Centralized configuration
│   ├── physics-engine.js  # Cannon-es wrapper (N-body support)
│   ├── entity.js          # Base entity & entity manager
│   ├── celestial-body.js  # Planets, moons, stars, special entities
│   ├── player.js          # Player controller (dual-mode)
│   ├── camera.js          # Camera system (1st/3rd person)
│   ├── input-handler.js   # Keyboard, mouse, gamepad input
│   ├── renderer.js        # Three.js wrapper with fidelity levels
│   ├── telemetry.js       # Real-time stats overlay
│   ├── dev-console.js     # Developer console & config editor
│   └── main.js            # Game loop orchestrator
```

## Configuration System

All physical constants and settings are centralized in `Config.js`:

```javascript
Config = {
    physics: {
        gravity,
        universalG,
        damping,
        timeScale,
        substeps
    },
    render: {
        fidelity,        // 'low', 'medium', 'ultra'
        shadowMapSize,
        enableLOD,
        enableFrustumCulling
    },
    player: {
        height,
        walkSpeed,
        jumpForce,
        freeFlySpeed,
        eyeHeight
    },
    camera: {
        fov,
        firstPerson,
        thirdPerson: { distance, height, smoothing }
    },
    celestialBodies: [],     // Array of body configurations
    interactiveObjects: []   // Array of interactive object configs
}
```

### Adding New Celestial Bodies

1. Add entry to `Config.celestialBodies`:
```javascript
{
    name: 'Venus',
    type: 'planet',
    mass: 4.867e24,
    radius: 6051.8,
    sceneRadius: 6.05,
    position: { x: 108200, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: -35.02 },
    rotationSpeed: 0.00003,
    color: 0xFFC649,
    // ... other parameters
}
```

2. The `GameEngine.createWorld()` will automatically instantiate and render it.

### Adding Special Entities

Example: **Blackhole** with event horizon and accretion disk:

```javascript
class Blackhole extends CelestialBody {
    constructor(id, config) {
        super(id, config);
        this.schwarzschildRadius = (2 * G * this.mass) / (c * c);
    }
    
    createMesh(fidelity) {
        // Create event horizon + accretion disk
    }
}
```

Add to world:
```javascript
const bh = new Blackhole(id, config);
// ... configure and add to scene
```

## Physics System

### N-Body Gravitational Interaction

The `PhysicsEngine` applies gravitational forces each frame:

```javascript
// Calculate force on body1 due to body2
F = G * (M1 * M2) / r²

// Apply forces via velocity update (impulse-based)
v += F / m * dt
```

### Stability Considerations

- **Default Parameters**: Pre-tuned to maintain stable orbits
- **Substeps**: 4 iterations per frame for integration stability
- **Damping**: Angular damping prevents tumbling
- **Distance Checks**: Singularity prevention at r < 0.1

### Time Control

Adjust simulation speed without affecting rendering:
```javascript
Config.physics.timeScale = 2.0; // 2x speed
Config.physics.timeScale = 0.5; // 0.5x speed
```

## Rendering Pipeline

### Fidelity Levels

| Setting | Shadow Map | Geometry Detail | Features |
|---------|-----------|-----------------|----------|
| Low | 512x512 | 16 segments | Basic shading |
| Medium | 2048x2048 | 32 segments | Phong material |
| Ultra | 4096x4096 | 64+ segments | Standard material |

### Optimization Techniques

1. **LOD (Level of Detail)**
   - High detail: < 100,000 km from camera
   - Medium detail: < 500,000 km
   - Low detail: > 500,000 km
   - Disable by default for performance

2. **Frustum Culling**
   - Skips rendering objects outside camera view
   - Disabled by default (overhead may exceed benefit)

3. **Shadow Optimization**
   - Only Sun casts shadows
   - Cascaded shadow maps available in Ultra mode

## Input System

### Pointer Lock

Automatically engages when clicking canvas (if `Config.controls.pointerLock` is true).

Releases when:
- Dev console opens
- ESC is pressed
- Game loses focus

### Gamepad Support

Standard Xbox-layout mapping:
- Left stick: Movement
- Right stick: Camera look
- A button: Jump
- B button: Crouch
- X button: Interact
- RB: Grab/Descend

Enable in `Config.controls.gamepadEnabled`.

## Player Movement

### Walking Mode

Movement is relative to camera forward/right, with optional planet-gravity alignment:

```javascript
// Gravity-aligned up vector
localUp = normalize(playerPos - planetCenter)

// Movement projected onto plane perpendicular to localUp
forward_ground = normalize(forward - localUp * dot(forward, localUp))
```

### Free Flight Mode

6-DOF movement with:
- Forward/Back/Left/Right: WASD
- Up/Down: Space / Shift
- Smooth acceleration with clamped velocity

## Camera System

### First-Person
- Camera at eye position (1.6m above body)
- Pitch/yaw rotation from mouse input
- Minimal offset for smooth feel

### Third-Person (Cinematic)
- Follows behind player at configurable distance/height
- Smooth Lerp-based tracking
- Look-ahead offset for better visibility

Toggle with cinematic transition:
```javascript
player.camera.toggleMode(); // Switches between modes
```

## Development Workflow

### Dev Console

Press `/` to open. Features:

1. **Real-time Config Editing**
   - Gravity, time scale, fidelity, LOD settings
   - Sensitivity, camera parameters
   - Apply changes instantly

2. **Command Execution**
   - Direct JavaScript evaluation
   - Access global `Config`, `game`, etc.

Example:
```javascript
// In console command field
Config.physics.timeScale = 10;
game.player.position.y += 100;
```

3. **Log Output**
   - Color-coded by level (info, warning, error)
   - Scrollable history
   - Auto-captures uncaught errors

### Telemetry

Press `Tab` to toggle overlay:
- **FPS**: Frame rate
- **Frame Time**: Per-frame duration (ms)
- **Position**: Player XYZ coordinates
- **Bodies**: Active entity count
- **Draw Calls**: Rendering efficiency metric
- **Memory**: JS heap usage (MB)

### Debug Log

Global `DebugLog` object:
```javascript
DebugLog.info('Information message');
DebugLog.warn('Warning message');
DebugLog.error('Error message');
DebugLog.debug('Debug message');
```

Automatically:
- Logs to browser console
- Displays in dev console
- Reports uncaught errors on-screen

## Extensibility

### Creating Custom Entities

```javascript
class Asteroid extends Entity {
    constructor(id, config) {
        super(id, config);
        this.type = 'asteroid';
        this.composition = config.composition || 'silicate';
    }
    
    createMesh(renderer) {
        // Custom geometry/material
        const geometry = new THREE.TetrahedronGeometry(this.radius, 4);
        const material = new THREE.MeshStandardMaterial({ color: 0x8B7355 });
        return super.createMesh(geometry, material);
    }
}

// Add to world
const asteroid = new Asteroid(id, config);
renderer.add(asteroid);
physicsEngine.addBody(asteroid.id, bodyConfig);
```

### Custom Physics Behaviors

Override `PhysicsEngine.update()` or add per-entity forces:

```javascript
// In game loop
for (const entity of entities) {
    if (entity.type === 'comet') {
        // Apply solar wind effect
        const solarForce = calculateSolarWind(entity, sun);
        physicsEngine.applyForce(entity.id, solarForce);
    }
}
```

### Volumetric Effects

Example: Nebula visualization
```javascript
const nebula = new VolumetricObject(id, {
    name: 'Nebula',
    position: { x: 500000, y: 0, z: 0 },
    volumeScale: 50000,
    color: 0xFF69B4
});
nebula.createMesh('medium');
renderer.add(nebula);
```

## Performance Tips

1. **Disable LOD/Frustum Culling** during development
2. **Set Fidelity to Medium** for balanced performance
3. **Reduce Substeps** if physics is slow (min: 1)
4. **Monitor Draw Calls**: Goal < 100 per frame
5. **Check Memory**: Watch heap growth for leaks

### Profiling

Use browser DevTools:
1. Performance tab: Frame timeline
2. Rendering: View shadow map textures
3. Memory: Heap snapshots for leaks

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Partial (pointer lock varies)
- **Mobile**: Limited (no pointer lock, small screen)

Required Features:
- WebGL 2.0
- Pointer Lock API
- requestAnimationFrame
- Web Workers (optional, for future threading)

## Known Limitations & Future Work

### Current
- No atmospheric rendering
- No collision detection for player/world
- Simplified orbital mechanics (no elliptical orbits)
- No sound effects
- No multiplayer support

### Future Enhancements
- Procedural planet generation with textures
- Comet/asteroid field simulation
- Warp drive mechanics
- Orbital prediction visualization
- Voice commands
- Networking (WebSocket-based multiplayer)
- Mobile touch controls
- VR/XR support

## File Size & Loading

All libraries are served via CDN:
- Three.js r128: ~150KB (minified)
- Cannon-es: ~40KB
- HTML/CSS: ~20KB
- JavaScript modules: ~100KB total

**Total CDN bandwidth: ~310KB** (one-time load, then cached)

## Troubleshooting

### Black screen on load
1. Check browser console for errors
2. Verify WebGL 2.0 support
3. Reload page

### Poor performance
1. Lower fidelity (dev console)
2. Disable LOD/frustum culling
3. Close dev console
4. Check for memory leaks in DevTools

### Physics unstable
1. Check `Config.physics.substeps` (increase to 4+)
2. Verify body masses in Config
3. Reduce `timeScale` if needed

### Camera stuck
1. Press ESC to unlock pointer
2. Check if dev console is open
3. Verify camera mode in telemetry

## License & Credits

Built with:
- **Three.js**: 3D graphics library (MIT)
- **Cannon-es**: Physics engine (BSD-3)
- **WebGL**: Graphics API

This project is provided as-is for educational and simulation purposes.

---

**Last Updated**: January 1, 2026
**Version**: 1.0.0
