# Solar System Simulation - 3D Physics-Based Game

A fully functional, high-performance 3D solar system simulation built with Three.js and WebGL. Features realistic physics, interactive gameplay, and beautiful graphics.

## Features

### ✨ Core Systems

- **Realistic Physics Engine**: All celestial bodies interact gravitationally with accurate N-body simulation
- **Expandable Architecture**: Modular design makes adding new features simple
- **Real-time Configuration**: Developer menu accessible via `/` key for live adjustments
- **Performance Optimized**: GPU-accelerated rendering with configurable quality settings

### 🌍 Celestial Bodies

- **1 Sun**: Central star with emissive lighting and heat
- **2 Planets**: Terra (Earth-like) and Ares (Mars-like) with realistic orbital mechanics
- **1 Moon**: Luna orbiting Terra with tidally-locked rotation
- All bodies have accurate:
  - Mass, radius, and density
  - Orbital periods and rotation periods
  - Surface gravity
  - Atmospheric effects (where applicable)

### 🎮 Player Controls

#### Ground Mode
- **WASD**: Move around planet surface
- **Mouse**: Look around (first-person view)
- **Space**: Jump
- **Shift**: Run (hold while moving)

#### Flight Mode
- **INS**: Toggle flight mode
- **WASD**: Move in 3D space
- **Space**: Ascend (local up)
- **Shift**: Descend (local down)
- **Mouse**: Free look in any direction

#### Camera
- **V**: Toggle between first-person and third-person view
- Third-person camera features smooth cinematic following

#### Menus & UI
- **/**: Open/close developer menu
- **F**: Toggle performance metrics
- **ESC**: Open settings menu

### 🎨 Graphics & Visuals

#### Quality Presets
- **Ultra**: Maximum visual fidelity (4K shadows, 10K particles)
- **High**: Balanced performance (2K shadows, 5K particles) - Default
- **Medium**: Good performance (1K shadows, 2K particles)
- **Low**: Maximum performance (512px shadows, 500 particles)

#### Visual Features
- Real-time shadows from the sun
- Atmospheric glow effects on planets
- Procedurally generated starfield
- Smooth lighting transitions
- Physically-based materials

### ⚙️ Developer Menu

Access comprehensive real-time configuration via `/` key:

#### Celestial Bodies Tab
- Modify mass, radius, orbital parameters
- Adjust rotation speeds and axial tilts
- Change surface gravity

#### Physics Tab
- Gravitational constant
- Time scale and acceleration
- Damping and friction coefficients
- Scale factors for distance/size

#### Player Tab
- Movement speeds (walk, run, flight)
- Jump force and mouse sensitivity
- Camera settings and smoothing

#### Graphics Tab
- Shadow quality and resolution
- Render distance
- Particle effects count
- Lighting intensity

All changes are saved to localStorage automatically.

### 🎯 Interactive Objects

8 physics-enabled objects spawn near the player:
- Cubes, spheres, cylinders, and cones
- Fully interactive with accurate collision detection
- Subject to planetary gravity
- Can be pushed and thrown

### 📊 Performance Monitoring

Toggle with **F** key to display:
- FPS (color-coded: green > 60, orange > 45, red < 45)
- Frame time in milliseconds
- Object count in scene
- Draw calls per frame

## Technical Architecture

### File Structure

```
gen3/
├── index.html              # Main HTML structure
├── css/
│   └── style.css          # All UI styling
└── src/
    ├── main.js            # Entry point & game loop
    ├── config.js          # Global configuration
    ├── CelestialBody.js   # Sun, planets, moon implementation
    ├── Physics.js         # Physics engine & gravity
    ├── Player.js          # Player controller
    ├── Camera.js          # Camera system (1st/3rd person)
    ├── Input.js           # Keyboard & mouse handling
    ├── InteractableObject.js  # Physics objects
    ├── LightingSystem.js  # Lights & shadows
    ├── PerformanceMonitor.js  # FPS & metrics
    ├── DeveloperMenu.js   # Real-time config UI
    └── SettingsManager.js # Graphics settings
```

### Key Technologies

- **Three.js**: 3D rendering engine
- **WebGL**: GPU-accelerated graphics
- **ES6 Modules**: Modern JavaScript architecture
- **CSS3**: Smooth UI animations and effects

## Performance Optimization

### GPU Utilization
- Shadow mapping on GPU
- Instanced rendering where possible
- Efficient geometry batching
- Optimized shader usage

### CPU Optimization
- Fixed timestep physics
- Spatial partitioning for collision detection
- Frame capping to prevent resource waste
- Lazy evaluation of expensive calculations

### Memory Management
- Geometry and texture disposal
- Object pooling for particles
- Efficient buffer management

## Configuration System

All game parameters are centralized in `config.js`:

### Scale Factors
- Distance: 1 unit = 100,000 km
- Size: Scaled for visibility
- Time: 60x acceleration
- Gravity: Enhanced for gameplay

### Physics Constants
- Gravitational constant: 6.674e-11
- Target FPS: 60
- Time step: 1/60 second
- Collision iterations: 3

### Customization
Every parameter can be modified in real-time through the developer menu, making it easy to:
- Balance gameplay
- Test different scenarios
- Create custom solar systems
- Experiment with physics

## Browser Compatibility

- **Chrome**: ✅ Recommended (best performance)
- **Firefox**: ✅ Fully supported
- **Edge**: ✅ Fully supported
- **Safari**: ✅ Supported (may have minor differences)

### Requirements
- WebGL 2.0 support
- Modern JavaScript (ES6+)
- At least 4GB RAM recommended
- Dedicated GPU recommended for Ultra settings

## Future Expansion Ideas

The modular architecture supports easy addition of:
- More planets and moons
- Asteroid belts
- Spaceships and vehicles
- Multiplayer support
- Save/load game states
- Custom solar system builder
- VR support
- Advanced weather systems
- Base building on planets

## Development Notes

### Adding New Celestial Bodies
1. Define configuration in `config.js`
2. Create instance in `main.js`
3. Add to physics engine
4. Physics interactions happen automatically

### Adding New Features
1. Create new module in `src/`
2. Import in `main.js`
3. Initialize in init sequence
4. Update in game loop if needed

### Performance Tuning
- Adjust quality presets in `config.js`
- Modify shadow map sizes
- Change particle counts
- Adjust render distance

## Credits

Built with:
- Three.js for 3D rendering
- Modern web standards (WebGL, ES6+)
- Realistic orbital mechanics
- Passion for space exploration

---

**Version**: 1.0.0  
**Build**: Gen3  
**License**: MIT  
**Created**: 2026
