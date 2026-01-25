# Solar System Simulation

A fully functional 3D solar system simulation with realistic N-body physics, built using Three.js.

## Features

### Physics
- **N-Body Gravitational Simulation**: All celestial bodies interact gravitationally using Velocity Verlet integration for stability
- **Stable Default Orbits**: Pre-calculated orbital velocities ensure stable, non-decaying orbits
- **Micro-Physics**: Interactive objects follow the same physics rules as celestial bodies

### Celestial Bodies
- **Sun**: Central light source with corona and glow effects
- **Planet 1 (Terra)**: Earth-like planet with atmosphere, player spawn location
- **Planet 2 (Helios)**: Mars-like planet with atmosphere
- **Moon (Luna)**: Orbits Planet 1 with tidal locking

### Player Controls
| Key | Action |
|-----|--------|
| WASD | Move forward/backward/left/right |
| Space | Jump (walking) / Fly up (flying) |
| Shift | Sprint (walking) / Fly down (flying) |
| F | Toggle flight mode |
| V | Toggle first/third person view |
| Right Click | Grab/release objects |
| H | Toggle controls help |
| P | Toggle performance stats |
| / | Open developer console |
| ` | Toggle debug log |
| Escape | Close menus |

### Rendering
- **Dynamic Starfield**: Procedurally generated stars with color variation based on stellar classification
- **Atmospheric Effects**: Fresnel-based atmosphere rendering on planets
- **Shadow Mapping**: Accurate shadows from the sun
- **Three Fidelity Levels**: Low, Medium, Ultra presets

### Developer Console
Press `/` to open the developer console where you can modify in real-time:
- Simulation speed and physics parameters
- Celestial body properties (mass, radius, orbital parameters)
- Player movement settings
- Rendering quality options
- Debug visualizations

## Project Structure

```
gen38/
├── index.html              # Main entry point
├── css/
│   └── style.css           # All styling
└── js/
    ├── config.js           # Centralized configuration
    ├── main.js             # Game initialization and loop
    ├── utils/
    │   ├── logger.js       # Debug logging system
    │   └── mathUtils.js    # Mathematical utilities
    ├── physics/
    │   └── physics.js      # N-body physics engine
    ├── entities/
    │   ├── celestialBody.js    # Base class for celestial objects
    │   ├── sun.js              # Sun implementation
    │   ├── planet.js           # Planet implementation
    │   ├── moon.js             # Moon implementation
    │   ├── player.js           # Player controller
    │   └── interactiveObject.js # Grabbable physics objects
    ├── rendering/
    │   ├── renderer.js     # Three.js renderer setup
    │   ├── sky.js          # Starfield generation
    │   └── shadows.js      # Shadow management
    ├── controls/
    │   ├── inputManager.js     # Keyboard/mouse input
    │   └── cameraController.js # Camera and player control
    └── ui/
        ├── devConsole.js   # Developer configuration panel
        ├── telemetry.js    # FPS and performance display
        └── menuManager.js  # Menu state management
```

## Running the Simulation

Since this project doesn't use Node.js/npm, you can run it with Python's built-in HTTP server:

```bash
cd gen38
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Expandability

The architecture is designed for easy expansion:

### Adding New Celestial Bodies
1. Add configuration in `config.js`
2. Create instance in `main.js` `createCelestialBodies()`
3. The physics engine automatically handles gravitational interactions

### Adding Special Entities (Black Holes, etc.)
1. Create a new class extending `CelestialBody`
2. Override `createMesh()` for custom visuals
3. Add special physics behavior if needed

### Adding New Interactive Object Types
1. Add type definition in `Config.interactiveObjects.types`
2. Objects will automatically be available for spawning

## Configuration

All simulation parameters are centralized in `js/config.js`:

- **scale**: Distance, time, and visual scale factors
- **physics**: Gravitational constant, timestep, softening parameters
- **sun/planet1/planet2/moon**: Mass, radius, orbital parameters
- **player**: Movement speeds, jump force, camera settings
- **rendering**: Quality presets, shadow settings, starfield options
- **debug**: Visualization toggles

## Physics Notes

### Orbital Stability
Default orbital velocities are calculated using Kepler's laws:
- `v = √(G × M / r)` for circular orbits

The developer console includes a "Recalculate Stable Orbits" button that automatically sets orbital velocities based on current mass and radius values.

### Integration Method
The simulation uses Velocity Verlet integration:
1. Calculate forces/accelerations
2. Update velocities using average acceleration
3. Update positions

This provides better energy conservation than simple Euler integration.

## Performance Tips

- Use **Low** fidelity preset for older hardware
- Disable shadows if FPS is low
- Reduce star count in developer console
- LOD system is available but disabled by default

## Credits

Built with [Three.js](https://threejs.org/) r128.
