# 🌌 Solar System Simulator

A fully functional 3D solar system simulation with realistic N-body physics, built with Three.js.

## Features

### Physics Engine
- **N-body gravitational simulation** - All celestial bodies interact with each other
- **Velocity Verlet integration** - Stable long-term orbital calculations
- **Accurate orbital mechanics** - Bodies follow Kepler's laws
- **Collision detection** - Bodies can collide and respond realistically
- **Time scaling** - Speed up or slow down simulation (1x to 1,000,000x)

### Celestial Bodies
- 1 Sun (Sol) - Emissive star with corona effects
- 2 Planets (Terra & Vulcan) - With atmospheres and rotation
- 1 Moon (Luna) - Orbiting the first planet
- Starfield background with 10,000 stars

### Player Controls
- **WASD** - Move around
- **Mouse** - Look around
- **Space** - Jump / Fly up
- **Shift** - Run / Fly down
- **INS** - Toggle free flight mode
- **V** - Switch first/third person view

### Time Controls
- **P** - Pause/resume simulation
- **[** - Slow down time (0.5x)
- **]** - Speed up time (2x)
- **\\** - Reset to real-time (1x)

### Debug & Development
- **/** - Open developer menu
- **F3** - Toggle debug overlay
- **F4** - Show debug logs
- **H** - Hide/show HUD

## Project Structure

```
src/
├── config/
│   └── GlobalConfig.js      # All configurable parameters
├── core/
│   └── Game.js               # Main game class
├── physics/
│   └── PhysicsEngine.js      # N-body physics simulation
├── entities/
│   ├── CelestialBody.js      # Sun, planets, moons
│   ├── SolarSystemManager.js # Manages all celestial bodies
│   ├── PlayerController.js   # Player movement & input
│   ├── CameraController.js   # Camera modes & smoothing
│   ├── InteractiveObjects.js # Rocks, crates, etc.
│   └── TerrainGenerator.js   # Procedural terrain
├── rendering/
│   ├── LightingSystem.js     # Sun lighting & shadows
│   └── PostProcessing.js     # Bloom effects
├── ui/
│   ├── DevMenu.js            # Developer configuration menu
│   ├── DebugOverlay.js       # FPS, coordinates, physics info
│   ├── HUD.js                # Main game HUD
│   └── LoadingScreen.js      # Loading progress display
├── utils/
│   └── DebugLogger.js        # Logging & performance tracking
└── main.js                   # Application entry point
```

## Configuration

All simulation parameters are in `src/config/GlobalConfig.js`:

### Physics Parameters
```javascript
PHYSICS = {
    G: 6.67430e-20,           // Gravitational constant (km³/kg/s²)
    timeScale: 1,              // Real-time multiplier
    physicsStepsPerFrame: 4,   // Sub-steps for accuracy
}
```

### Celestial Bodies
Each body has configurable:
- Mass, radius, rotation period
- Orbital radius and velocity
- Color, atmosphere, textures

### Quality Presets
Three levels: `low`, `medium`, `high`
- Shadow quality
- Bloom effects
- Anti-aliasing
- Particle counts

## Extending the Simulation

### Adding New Celestial Bodies

1. Add configuration to `GlobalConfig.js`:
```javascript
CELESTIAL_BODIES.newPlanet = {
    name: "NewPlanet",
    type: "planet",
    mass: 5.0e24,
    radius: 6000,
    position: { x: 200000000, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 25 }, // Calculate for stable orbit
    // ... other properties
};
```

2. The `SolarSystemManager` will automatically create it on initialization.

### Adding Black Holes (Future Feature)

Black holes can be added by:
1. Creating a new body type in `CelestialBody.js`
2. Adding event horizon rendering (shader-based)
3. Implementing gravitational lensing effects
4. Adding accretion disk visuals

### Adding Telescopes (Future Feature)

Telescopes can be implemented as:
1. Interactive objects the player can use
2. Switch to a special camera mode with zoom
3. Render distant objects with enhanced detail
4. Show orbital paths and body information

## Performance Optimization

The simulation is optimized for performance:

- **LOD system** - Celestial bodies use appropriate detail levels
- **Frustum culling** - Only visible objects are rendered
- **Spatial optimization** - Physics uses efficient algorithms
- **Quality presets** - Users can adjust for their hardware
- **GPU utilization** - Shaders handle heavy visual effects

## Debugging

### Stuck on Loading Screen?

The loading system tracks all tasks and shows which one is stuck:
- Check the browser console for error messages
- Tasks timeout after 30 seconds with a warning
- Each task logs when it starts and completes

### Physics Issues?

Enable physics debugging:
```javascript
DEBUG.showPhysicsDebug = true;
DEBUG.showVelocityVectors = true;
DEBUG.showGravityVectors = true;
```

### Orbital Instability?

The `validateOrbitalStability()` function checks all orbits on startup.
If orbits are unstable, velocities are automatically corrected.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## Requirements

- Modern browser with WebGL 2.0 support
- Recommended: Dedicated GPU for best performance
- Minimum 4GB RAM

## Credits

Built with:
- [Three.js](https://threejs.org/) - 3D graphics library
- [Vite](https://vitejs.dev/) - Build tool

## License

MIT License - Feel free to use and modify!
