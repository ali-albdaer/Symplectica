# Solar System Simulation - 3D Web Game

A fully-featured, physics-accurate 3D solar system simulation with first-person and third-person exploration gameplay. Features realistic N-body gravitational interactions, interactive objects, and a powerful developer console for real-time configuration.

## Features

### Core Gameplay
- **Realistic Physics**: Full N-body gravitational simulation with all bodies interacting
- **Stable Orbits**: Pre-configured system with mathematically stable celestial mechanics
- **Player Movement**: Walking on planetary surfaces with gravity-aware controls
- **Free Flight**: 6-DOF movement mode for unrestricted exploration
- **Object Interaction**: Grab and manipulate interactive objects with physics simulation
- **Dual Camera Modes**: Seamless switching between first-person and third-person views

### Technical Features
- **Expandable Architecture**: Easy to add new entities, celestial bodies, and features
- **Centralized Configuration**: All parameters in one configuration file
- **Real-Time Developer Console**: Modify any parameter during gameplay via `/` key
- **Comprehensive Debug System**: On-screen error logging and performance telemetry
- **Performance Optimization**: Multi-level fidelity settings with GPU acceleration
- **Lighting & Shadows**: Sun-centric lighting with realistic shadow casting

## File Structure

```
solar_system_sim/
├── index.html              # Main entry point and UI definition
├── main.js                 # Application initialization and main loop
├── debug.js               # Debug logging and error handling
├── config.js              # All configuration and game parameters
├── utils.js               # Mathematical utilities and helper functions
├── physics.js             # N-body gravity simulation engine
├── renderer.js            # Three.js rendering system
├── camera.js              # First/third person camera system
├── player.js              # Player controller and movement
├── input-handler.js       # Keyboard and mouse input
├── ui.js                  # UI panels, developer console, telemetry
└── scene-manager.js       # Scene setup and entity management
```

## How to Run

### Using Python HTTP Server (No Node.js Required)

```bash
cd c:\Projects\2026\solar_system_sim\gen27
python -m http.server 8000
```

Then open your browser to: `http://localhost:8000`

### Using Python 3

```bash
cd c:\Projects\2026\solar_system_sim\gen27
python3 -m http.server 8000
```

### Alternative: Using SimpleHTTPServer (Python 2)

```bash
cd c:\Projects\2026\solar_system_sim\gen27
python -m SimpleHTTPServer 8000
```

## Controls

### Movement
- **W** - Move forward
- **A** - Strafe left
- **D** - Strafe right
- **S** - Move backward
- **SPACE** - Jump (or Up in Free Flight mode)
- **SHIFT** - Down in Free Flight mode

### Camera & View
- **MOUSE** - Look around (hold pointer lock)
- **V** - Toggle first-person / third-person camera
- **F** - Toggle free flight mode (6-DOF movement)

### Interaction
- **R** or **RIGHT-CLICK** - Grab/release interactive objects
- **SHIFT** - Move down (in free flight mode)

### Debug & UI
- **/** (Forward slash) - Toggle developer console
- **G** - Toggle telemetry display (FPS, position, etc.)
- **L** - Toggle debug log
- **H** - Toggle help panel

## Developer Console

Press `/` to open the developer console. Here you can:

1. **Modify Celestial Bodies**
   - Change position, velocity, mass, radius
   - Adjust rotation periods and orbital parameters

2. **Adjust Physics**
   - Modify gravitational constant (G)
   - Change timestep and substeps
   - Monitor force calculations

3. **Control Rendering**
   - Change fidelity level (Low, Medium, Ultra)
   - Toggle LOD (Level of Detail)
   - Adjust shadow settings

4. **Player Settings**
   - Modify movement speeds
   - Adjust jump force
   - Change grab distance

5. **Reset Parameters**
   - Click "R" button next to any parameter to reset to default
   - All parameters restore to original values

## Physics & Orbital Mechanics

The simulation uses:
- **Velocity Verlet Integration** for accurate physics
- **N-Body Gravitational Calculations** where all bodies interact
- **Realistic Constants**: Proper gravitational constant and physics values
- **Scaled Coordinates**: 1 unit = 1 billion meters (for computational stability)
- **Multiple Substeps**: Physics runs at higher frequency than rendering for stability

### Default System Configuration

- **Sun**: 1 solar mass, stationary at origin
- **Planet 1**: Earth-like (1 AU distance, ~30 km/s orbital velocity)
- **Planet 2**: Jupiter-like (5 AU distance, ~13 km/s orbital velocity)  
- **Moon 1**: Earth's moon-like, orbiting Planet 1

All orbital parameters are pre-calculated to ensure stability and realistic mechanics.

## Performance

### Optimization Features
- **GPU-Accelerated Rendering**: WebGL context with high-performance settings
- **Fidelity Levels**: Low/Medium/Ultra with different shadow map resolutions
- **Level of Detail**: Optional LOD system for distant objects (default: off)
- **Spatial Queries**: Efficient body lookup and spatial checks
- **Performance Monitoring**: Real-time frame time and FPS tracking

### Performance Telemetry (Press G)
- Current FPS and average FPS
- Frame time in milliseconds
- Physics calculation time
- Player position and velocity
- Camera mode and orientation

## Customization & Expansion

### Adding New Celestial Bodies

Edit `config.js`, add to `Config.bodies`:

```javascript
newPlanet: {
    name: 'New Planet',
    mass: 1e24,
    radius: 6e6,
    position: [1.5e11, 0, 0],
    velocity: [0, 25000, 0],
    color: { r: 0.8, g: 0.5, b: 0.3 },
},
```

Then in `scene-manager.js`, add to `createCelestialBodies()`:

```javascript
const newPlanet = PhysicsEngine.createBody(bodiesConfig.newPlanet);
Renderer.createBodyMesh(newPlanet);
```

### Adding New Features (Blackholes, Telescopes, etc.)

The architecture supports this through:
1. **Physics Bodies**: Extend physics engine with new body types
2. **Special Rendering**: Create custom mesh materials for special entities
3. **Behavior Scripts**: Add update logic in scene manager
4. **Configuration**: All parameters in Config system

## Troubleshooting

### Black Screen / Loading Screen Stuck
- Check browser console (F12) for errors
- Developer console shows detailed error messages
- Check debug log (press L) for system information

### Poor Performance
- Press `/` to open developer console
- Change `Fidelity` from "ultra" to "medium" or "low"
- Toggle `LOD Enabled` to true
- Check FPS in telemetry (press G)

### Objects Falling Through Ground
- Ensure planet has correct mass and radius in config
- Check that physics substeps are adequate (default: 4)
- Verify simulation timestep (default: 0.016s)

### Unstable Orbits
- Orbital velocities are pre-calculated
- If you modify distances, recalculate velocities
- Formula: v = sqrt(GM/r) for circular orbits
- Use telemetry to monitor orbital energy

## Browser Requirements

- Modern browser with WebGL support (Chrome, Firefox, Edge, Safari)
- Minimum 2GB RAM
- Recommended: Discrete GPU for best performance
- Desktop or laptop recommended (not optimized for mobile)

## Future Expansion Ideas

The architecture supports adding:
- Blackholes with event horizon and Hawking radiation
- Working telescopes with zoom and spectroscopy
- Space stations and spacecraft
- Asteroid fields and impacts
- Atmospheric effects and weather
- Multiplayer support
- Space stations and bases
- More detailed terrain
- Particle effects and visual effects

## Debug Information

All systems log to the browser console AND the in-game debug log. Enable telemetry (G key) to see:
- Real-time FPS and frame time
- Player position and velocity  
- Camera orientation
- Number of bodies in simulation
- Physics calculation time

## Known Limitations

- No collision detection between bodies (only gravity)
- No atmospheric drag (simplified physics)
- Star positions are procedurally generated, not astronomically accurate
- Maximum practical body count: ~100-200 depending on fidelity
- Far clipping plane limits view of outer solar system

## Code Architecture Notes

### Modularity
Each system is independent and can be modified without affecting others:
- Physics engine is pure and doesn't depend on rendering
- Renderer doesn't modify physics bodies directly
- Input handler only sets controller flags
- Scene manager orchestrates creation but not updates

### Extensibility
New systems can be added by:
1. Creating a new file (e.g., `telescope.js`)
2. Following the module pattern with `window.SystemName = { ... }`
3. Initializing in `GameApp.initialize()`
4. Hooking into main loop via `update()`

### Configuration-Driven Design
Almost all parameters are in `config.js`. This enables:
- Live modification without code changes
- Easy experimentation
- Quick balancing
- Simple A/B testing

## License

Educational/Personal Use

## Technical Details

### Physics Constants
- G = 6.67430e-11 (m³ kg⁻¹ s⁻²)
- Distance Scale: 1 unit = 1×10⁹ meters
- Time Scale: 1 unit = 86400 seconds (1 day)
- Size Scale: 1 unit = 1×10⁸ meters

### Integration Method
- **Velocity Verlet**: More stable than Euler for orbital mechanics
- **Substeps**: Run physics 4x per frame for higher accuracy
- **Collision Prevention**: Minimum distance checks prevent singularities

### Lighting Model
- **Sun Light**: Directional light from sun position
- **Shadows**: PCF soft shadows from celestial bodies
- **No Ambient Light**: All illumination from sun (physically accurate)
- **Emissive Objects**: Sun and luminous objects emit light

## Support & Reporting Issues

Check debug output for detailed error messages:
1. Open browser developer console (F12)
2. Check JavaScript console for errors
3. Enable debug log (L key) in-game
4. Check loading status on black screen

All errors are logged with full stack traces for debugging.
