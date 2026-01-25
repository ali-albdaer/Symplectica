# 🌌 Solar System Simulation - 3D Physics Game

A fully functional, web-based 3D solar system simulation with realistic N-body physics, interactive gameplay, and beautiful visuals.

## 🎮 Features

### Physics & Simulation
- **Realistic N-Body Gravity**: All celestial bodies and objects interact gravitationally
- **Stable Orbital Mechanics**: Default configuration creates stable, non-decaying orbits
- **Multiple Integration Methods**: Euler, Verlet, and RK4 (Runge-Kutta 4th order)
- **Configurable Physics**: Adjustable time scale, substeps, and gravitational constant
- **Player Physics**: Affected by gravity from all celestial bodies

### Celestial Bodies
- **1 Sun**: Luminous star with accurate point light and shadows
- **2 Planets**: Alpha (Earth-like) and Beta (Jupiter-like) with unique properties
- **1 Moon**: Orbiting Planet Alpha with realistic parameters
- **Expandable System**: Easy to add new bodies, black holes, asteroid belts, etc.

### Player & Controls

#### Walking Mode (Default)
- **WASD**: Move relative to camera direction
- **Space**: Jump (gravity-dependent)
- **Shift**: Sprint
- **Mouse**: Look around (pointer-locked)

#### Flight Mode (Press F)
- **WASD**: Move forward/back/left/right
- **Space**: Move up
- **Shift**: Move down
- **Sprint**: 5x speed boost

#### Other Controls
- **V**: Toggle first/third person camera
- **Right Click**: Grab/release interactive objects
- **F3**: Toggle performance metrics
- **F4**: Toggle coordinate display
- **/**: Open developer console
- **ESC**: Pause game

### Interactive Objects
- 5 physics-enabled objects near spawn point
- Some are luminous with point lights
- Can be grabbed and thrown
- Follow same N-body physics as celestial bodies

### Camera System
- **First Person**: Eye-level view with full rotation control
- **Third Person**: Smooth, cinematic follow camera
- **Adaptive Movement**: Camera-relative controls in both modes
- **Pointer Lock API**: Professional FPS-style mouse control

### Visual Features
- **Realistic Lighting**: Sun is the sole light source
- **Dynamic Shadows**: PCF soft shadows from celestial bodies
- **Starfield Background**: 10,000+ procedural stars
- **Atmospheric Halos**: For planets with atmospheres
- **ACES Tone Mapping**: Professional color grading
- **No Ambient Light**: True space darkness

### Performance
- **3 Quality Presets**: Low, Medium, Ultra
- **GPU Acceleration**: Hardware-accelerated rendering
- **Configurable Shadows**: 1024-4096 shadow map sizes
- **Optional LOD**: Level of detail for distant objects
- **Performance Metrics**: Real-time FPS, frame time, physics time
- **High Frame Rate**: Optimized for 60+ FPS

### Developer Features
- **Live Config Editor**: Press `/` to modify all parameters in real-time
- **Debug Console**: Captures all console.log/error/warn messages
- **Coordinate Display**: Position, velocity, nearest body
- **Performance Overlay**: FPS, frame time, physics time, render time
- **Error Handling**: On-screen error display with helpful messages
- **Expandable Architecture**: Easy to add new features

## 📁 Project Structure

```
solar_system_sim/
├── index.html          # Entry point
├── styles.css          # UI styling
├── config.js           # Global configuration (all constants)
├── physics.js          # N-body physics engine
├── celestial.js        # Celestial bodies & interactive objects
├── player.js           # Player controller
├── camera.js           # Camera system
├── ui.js               # UI, HUD, dev console
└── main.js             # Game loop & initialization
```

## 🚀 Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- No Node.js or npm required
- Python 3.x (for local server)

### Running the Simulation

1. Navigate to the project directory:
```bash
cd solar_system_sim/gen25
```

2. Start a local web server:
```bash
python -m http.server 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

4. Click the screen to lock the cursor and start playing!

## ⚙️ Configuration

All game parameters are centralized in `config.js`. Key sections:

### Simulation Settings
```javascript
CONFIG.simulation = {
    timeScale: 1.0,              // Time multiplier
    gravitationalConstant: 6.67430e-11,
    physicsSubsteps: 4,          // Higher = more stable
    integrationMethod: 'verlet', // 'euler', 'verlet', 'rk4'
}
```

### Celestial Body Example
```javascript
CONFIG.planet1 = {
    name: 'Planet Alpha',
    mass: 5.972e24,              // kg
    radius: 6371000,             // meters
    position: [1.496e11, 0, 0],  // 1 AU from sun
    velocity: [0, 0, 29780],     // Stable orbital velocity
    rotationSpeed: 0.0007272,    // ~24 hour day
    // ... more properties
}
```

### Live Editing
Press `/` in-game to open the developer console and modify any parameter in real-time!

## 🔧 Customization

### Adding New Celestial Bodies

1. Add configuration in `config.js`:
```javascript
CONFIG.planet3 = {
    name: 'Mars',
    type: 'planet',
    mass: 6.39e23,
    radius: 3389500,
    position: [2.279e11, 0, 0],  // 1.52 AU
    velocity: [0, 0, 24070],     // Calculate for stable orbit
    color: 0xFF6B4A,
    // ... other properties
}
```

2. Create in `celestial.js`:
```javascript
this.createCelestialBody('planet3', this.config.planet3);
```

### Adding Special Features

The architecture supports easy expansion:
- **Black Holes**: Add Schwarzschild radius logic
- **Telescopes**: Implement zoom/target mechanics
- **Wormholes**: Portal system
- **Asteroid Belts**: Particle systems
- **Space Stations**: Static structures

Example structure already in `config.js`:
```javascript
CONFIG.specialEntities = {
    blackholes: [],
    wormholes: [],
    asteroidBelts: [],
}
```

## 🎨 Visual Quality Settings

### Performance Presets
```javascript
// Change preset in dev console or config
CONFIG.applyPreset('ultra');  // 'low', 'medium', 'ultra'
```

### Shadow Quality
```javascript
CONFIG.rendering.shadowMapSize = 4096;  // 1024, 2048, 4096
```

### Star Density
```javascript
CONFIG.skybox.starCount = 20000;  // More stars = more atmosphere
```

## 🐛 Debugging

### Debug Log
- Automatically captures console output
- Toggle with in-game UI
- Shows timestamps and error types

### Common Issues

**Black Screen**
- Check browser console (F12)
- Verify Three.js CDN is loading
- Check for JavaScript errors

**Unstable Orbits**
- Increase `physicsSubsteps` in config
- Try 'verlet' or 'rk4' integration method
- Adjust initial velocities for circular orbits

**Low FPS**
- Apply 'low' performance preset
- Reduce shadow map size
- Disable shadows entirely
- Reduce star count

**Player Falls Through Planet**
- Check spawn height calculation
- Verify planet radius matches visual scale
- Adjust physics substeps

## 📊 Performance Optimization

### For Low-End Hardware
```javascript
CONFIG.applyPreset('low');
CONFIG.rendering.shadowsEnabled = false;
CONFIG.skybox.starCount = 3000;
CONFIG.rendering.useLOD = true;
```

### For High-End Hardware
```javascript
CONFIG.applyPreset('ultra');
CONFIG.rendering.shadowMapSize = 4096;
CONFIG.skybox.starCount = 20000;
CONFIG.simulation.physicsSubsteps = 6;
```

## 🧪 Physics Accuracy

### Orbital Velocity Calculation
The simulation uses real physics formulas:

**Circular Orbit**: `v = √(GM/r)`

Where:
- G = Gravitational constant (6.674×10⁻¹¹)
- M = Central body mass
- r = Orbital radius

### Stability Tips
1. Use Verlet or RK4 integration for long-term stability
2. Increase substeps for tighter orbits
3. Match planet velocity to orbital velocity
4. Keep time scale reasonable (< 10x)

## 🌟 Future Expansion Ideas

Based on the expandable architecture:

- **Black Holes**: Gravitational lensing, event horizons, Hawking radiation
- **Telescopes**: Zoom mechanics, constellation mapping, exoplanet detection
- **Asteroid Belts**: Procedural generation, mining mechanics
- **Comets**: Elliptical orbits, tail effects
- **Space Stations**: Orbital mechanics, docking
- **Multiple Star Systems**: Binary/trinary stars
- **Planetary Rings**: Saturn-like ring systems
- **Weather Systems**: Atmospheric effects
- **Day/Night Cycle**: More pronounced lighting changes
- **Multiplayer**: Networked physics synchronization

## 📝 Technical Details

### Technologies Used
- **Three.js r152**: 3D rendering engine
- **Vanilla JavaScript**: No frameworks, no build tools
- **HTML5 Canvas**: WebGL rendering
- **Pointer Lock API**: FPS controls
- **CSS3**: UI styling and animations

### Physics Implementation
- N-body gravitational simulation
- Multiple integration methods (Euler, Verlet, RK4)
- Configurable substeps for stability
- Force accumulation and application
- Collision detection (ground contact)

### Rendering Pipeline
1. Physics update (substeps)
2. Celestial body updates (rotation, lights)
3. Player update (movement, interaction)
4. Camera update (positioning, smoothing)
5. Render scene
6. UI updates

## 🤝 Contributing

The code is designed for easy modification:
- All constants in `config.js`
- Modular architecture
- Extensive comments
- Clear separation of concerns

## 📜 License

This project is open source and available for educational and personal use.

## 🎓 Educational Value

This simulation demonstrates:
- Classical mechanics (Newton's laws)
- Orbital dynamics
- Numerical integration methods
- 3D graphics programming
- Game engine architecture
- Physics engine design
- User interface development

## 🙏 Credits

- **Three.js**: 3D rendering library
- **Physics**: Based on real astronomical data
- **Design**: Inspired by space simulation games

---

**Enjoy exploring the cosmos! 🚀🌍🌙**

For questions or issues, check the browser console (F12) for detailed error messages.
