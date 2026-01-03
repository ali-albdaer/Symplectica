# Solar System Simulator

A fully interactive 3D solar system simulation with realistic physics, built with Three.js and vanilla JavaScript.

## Features

### Realistic Physics
- N-body gravitational simulation using Velocity Verlet integration
- All celestial bodies interact with each other gravitationally
- Accurate orbital mechanics with proper Keplerian elements
- Collision detection and response for player and objects

### Celestial Bodies
- **Sol (Sun)**: Central star with corona and glow effects
- **Terra (Planet 1)**: Earth-like planet with atmosphere, clouds, and moon
- **Ember (Planet 2)**: Mars-like rocky planet
- **Luna (Moon)**: Moon orbiting Terra with tidal locking

### Player Controls
- **WASD**: Move around
- **Space**: Jump (walking mode) / Ascend (flight mode)
- **Shift**: Sprint (walking) / Descend (flight mode)
- **Mouse**: Look around
- **V**: Toggle first/third person view
- **INS**: Toggle free flight mode
- **E**: Pick up / drop objects
- **Left Click**: Throw held object

### Interactive Objects
- Physics-enabled crates, barrels, spheres, and rocks
- Full collision and gravity interaction
- Can be picked up, carried, and thrown

### Developer Console (Press `/`)
Real-time adjustable parameters:
- **Celestial Bodies**: Mass, radius, rotation period, orbital parameters
- **Physics**: Time scale, gravitational constant, simulation steps
- **Graphics**: Quality presets, shadows, atmosphere, bloom, anti-aliasing
- **Player**: Walk/run speed, jump force, flight speed, mouse sensitivity

### Graphics Options
Three quality presets (Low, Medium, High) affecting:
- Shadow map resolution
- Atmosphere ray-marching samples
- Bloom post-processing
- Star field density
- Planet geometry detail
- Anti-aliasing

### Performance
- **F3**: Toggle performance metrics (FPS, frame time, draw calls, etc.)
- Adaptive quality settings
- Efficient physics with configurable sub-stepping

## Project Structure

```
gen4/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styling
└── src/
    ├── main.js         # Game entry point and main loop
    ├── config.js       # Global configuration and parameters
    ├── Renderer.js     # Three.js rendering setup
    ├── Physics.js      # N-body physics engine
    ├── Math3D.js       # Vector/Matrix math utilities
    ├── CelestialBody.js # Planets, moons, and stars
    ├── Player.js       # Player controller
    ├── Camera.js       # First/third person camera
    ├── Input.js        # Keyboard/mouse input handling
    ├── Lighting.js     # Sun lighting and shadows
    ├── InteractiveObjects.js # Physics objects
    └── UI.js           # HUD and developer menu
```

## How to Run

1. Serve the project with any local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx serve .
   
   # Using VS Code Live Server extension
   # Right-click index.html -> Open with Live Server
   ```

2. Open `http://localhost:8000` in a modern browser

3. Click "Click to Start" to begin

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| WASD | Move |
| Space | Jump / Ascend |
| Shift | Sprint / Descend |
| Mouse | Look around |
| V | Toggle view mode |
| INS | Toggle flight mode |
| E | Pick up / drop objects |
| / | Open developer console |
| F3 | Toggle performance metrics |
| F11 | Toggle fullscreen |
| ESC | Pause / unlock mouse |
| Ctrl+R | Respawn at Planet 1 |
| O | Toggle orbit camera mode |
| C | Toggle cinematic camera |
| Shift+G | Spawn random object |

## Extending the Project

### Adding a New Planet

1. Open `src/config.js`
2. Add a new entry to `CELESTIAL_BODIES`:
   ```javascript
   planet3: {
       name: "Neptune",
       type: "planet",
       mass: 1.024e26,
       radius: 24622,
       // ... other properties
       parentBody: "sun",
   }
   ```

### Adding a New Object Type

1. Open `src/config.js`
2. Add to `INTERACTIVE_OBJECTS.types`:
   ```javascript
   myObject: {
       name: "My Object",
       mass: 10,
       size: { x: 1, y: 1, z: 1 },
       color: 0xFF0000,
       friction: 0.5,
       restitution: 0.5,
   }
   ```

### Modifying Physics

All physics constants are in `config.js` under `PHYSICS`:
- `G`: Gravitational constant
- `TIME_SCALE`: Simulation speed multiplier
- `PHYSICS_STEPS`: Sub-steps per frame for accuracy
- `COLLISION_ELASTICITY`: Bounciness of collisions

## Technical Notes

- Uses Three.js r128 via CDN
- Physics uses Velocity Verlet integration for orbital stability
- World scale: 1 unit ≈ 1000 km
- Distance scale compressed for playability
- Logarithmic depth buffer for large scale rendering

## Browser Compatibility

Requires a modern browser with:
- WebGL 2.0 support
- ES6 module support
- Pointer Lock API

Tested on: Chrome 90+, Firefox 88+, Edge 90+

## License

MIT License - Feel free to use and modify for any purpose.
