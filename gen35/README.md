# 🌌 Solar System Simulation
## Realistic N-Body Physics Engine

A fully functional 3D solar system simulation with accurate gravitational physics, built with Three.js and vanilla JavaScript.

---

## 🚀 Features

### ⚛️ Physics & Simulation
- **N-Body Gravitational System**: All celestial bodies and objects interact through realistic gravitational forces
- **Stable Orbital Mechanics**: Mathematically balanced initial conditions ensure stable, non-decaying orbits
- **Semi-Implicit Euler Integration**: Symplectic integrator for energy conservation
- **Real-time Physics**: All objects (planets, moons, player, items) follow the same physics rules
- **Configurable Time Scale**: Speed up or slow down the simulation

### 🎮 Player Controls
- **Dual Movement Modes**:
  - **Walking Mode**: WASD movement, Space to jump, camera-relative controls
  - **Free Flight Mode** (F): 6-DOF movement with Space (up), Shift (down)
- **Camera Modes** (V): Toggle between first and third person
- **Object Interaction**: Right-click to grab and hold objects
- **Smooth Cinematic Camera**: Third-person view with interpolated following

### 🌍 Celestial Bodies
- **1 Sun**: Primary light source with accurate shadows
- **2 Planets**: Earth-like and Mars-like with configurable properties
- **1 Moon**: Orbiting the first planet
- **All bodies participate in N-body physics**

### 🎨 Graphics & Rendering
- **Physically-Based Rendering**: Realistic materials and lighting
- **Dynamic Shadows**: Sun casts accurate shadows on all bodies
- **Starfield Background**: 5000+ procedurally placed stars
- **Performance Settings**: 3-level fidelity (Low, Medium, Ultra)
- **GPU Acceleration**: Hardware-accelerated rendering
- **LOD Support**: Level-of-detail system (optional, off by default)

### 🛠️ Developer Tools
- **Real-time Config Editor** (/): Modify physics, rendering, and game parameters live
- **Performance Metrics** (F3): FPS, frame time, coordinates, system energy
- **Debug Console**: On-screen logging for troubleshooting
- **Energy Monitoring**: Track total system energy to verify orbital stability

### 🎯 Interactive Objects
- **8 Physics Objects**: Crates, spheres, crystals, lanterns
- **Luminous Objects**: Some emit light and glow
- **Grabbable**: Hold objects with right-click
- **Full Physics**: Objects affected by gravity and player interaction

---

## 📁 Project Structure

```
gen35/
├── index.html              # Entry point
├── styles.css              # Global styles
├── config.js               # All configurable parameters
├── physics.js              # N-body physics engine
├── celestialBodies.js      # Sun, planets, moon classes
├── player.js               # Player controller
├── camera.js               # Camera system (1st/3rd person)
├── objects.js              # Interactive objects
├── ui.js                   # UI, dev console, metrics
└── main.js                 # Game loop and initialization
```

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| **WASD** | Move (camera-relative) |
| **Space** | Jump (walking) / Up (flight) |
| **Shift** | Run (walking) / Down (flight) |
| **F** | Toggle Free Flight Mode |
| **V** | Toggle Camera (First/Third Person) |
| **Right Click** | Grab/Hold Object |
| **/** | Open Developer Console |
| **F3** | Toggle Performance Metrics |
| **Mouse** | Look Around |

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3 (for local server)
- No Node.js or NPM required!

### Running the Simulation

1. **Navigate to the project directory**:
   ```bash
   cd c:\Projects\2026\solar_system_sim\gen35
   ```

2. **Start a local HTTP server**:
   ```bash
   python -m http.server 8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

4. **Click on the canvas** to lock the pointer and start playing!

---

## ⚙️ Configuration

All game parameters are in [`config.js`](config.js):

### Physics Constants
```javascript
physics: {
    G: 6.674e-11,              // Gravitational constant
    timeScale: 1.0,            // Simulation speed multiplier
    integrationSteps: 1,       // Physics substeps per frame
}
```

### Celestial Body Properties
- Mass, radius, rotation period
- Orbital parameters (auto-calculated for stability)
- Visual properties (colors, emissions)
- Atmosphere settings

### Player Settings
- Movement speeds (walk, run, flight)
- Jump force, grab distance
- Mouse sensitivity

### Rendering Options
- Fidelity levels (Low, Medium, Ultra)
- Shadow quality, star count
- LOD distances, lighting parameters

---

## 🔧 Developer Console

Press **/** to open the real-time configuration editor:

- **Physics**: Adjust time scale, gravity
- **Rendering**: Change fidelity, shadow quality
- **Player**: Modify movement speeds, mouse sensitivity
- **Celestial Bodies**: Edit masses, light intensity
- **Camera**: Tweak sensitivity and smoothing

Changes apply **immediately** without reloading!

---

## 📊 Performance Metrics (F3)

Monitor real-time performance:
- **FPS**: Frames per second
- **Frame Time**: Milliseconds per frame
- **Position**: Player coordinates
- **Physics**: Active bodies count
- **System Energy**: Total gravitational + kinetic energy (stability check)

---

## 🌟 Expandability

The architecture is designed for easy feature additions:

### Adding New Celestial Bodies
1. Define configuration in `config.js`
2. Instantiate in `createSolarSystem()` in `celestialBodies.js`
3. Physics integration is automatic!

### Adding Special Entities (e.g., Black Holes)
1. Create new class extending `CelestialBody`
2. Override physics behavior in `physics.js` if needed
3. Add special rendering effects
4. Register with physics engine

### Adding New Features
- **Telescopes**: Extend camera system
- **Working Instruments**: Create new interactive object types
- **Advanced Phenomena**: Modify physics calculations
- **Particle Effects**: Add to rendering system

---

## 🐛 Debugging

### If the simulation doesn't load:
1. Check browser console (F12) for errors
2. Debug overlay shows initialization progress
3. Verify Three.js CDN is accessible
4. Ensure local server is running

### If physics seems unstable:
1. Open metrics (F3) and check "System Energy"
2. Energy should remain relatively constant
3. Use dev console (/) to adjust `timeScale` or `integrationSteps`

### If performance is low:
1. Press F3 to check FPS
2. Open dev console (/) and reduce fidelity
3. Disable shadows or reduce star count
4. Lower shadow map size

---

## 🎓 Technical Details

### Physics Engine
- **Method**: Semi-implicit (symplectic) Euler integration
- **Complexity**: O(n²) for n bodies (can be optimized with Barnes-Hut later)
- **Stability**: Energy-conserving for orbital mechanics
- **Collision**: Sphere-sphere detection with elastic response

### Orbital Mechanics
Circular orbit velocity calculated as:
```
v = √(G × M / r)
```
where:
- G = Gravitational constant
- M = Central body mass
- r = Orbital radius

### Camera System
- **First Person**: Direct position at player eye level
- **Third Person**: Smoothed lerp interpolation for cinematic feel
- **Pointer Lock API**: Seamless mouse control

---

## 🎨 Visual Features

### Lighting
- **Sun**: Single point light source (no ambient lighting)
- **Shadows**: PCF soft shadows from sun
- **Emissive Materials**: Self-illuminating objects
- **Point Lights**: Luminous objects emit local light

### Materials
- **PBR**: Physically-based rendering (roughness, metalness)
- **Emissive**: Glowing effects for sun and luminous objects
- **Atmospheres**: Transparent layers on planets

### Skybox
- 5000 procedurally placed stars
- Realistic color temperature variation
- Spherical distribution

---

## 🚧 Future Enhancements

Suggested additions:
- **Black Holes**: Schwarzschild radius, gravitational lensing
- **Telescopes**: Zoom and observation mechanics
- **More Celestial Bodies**: Asteroids, comets, gas giants
- **Particle Systems**: Thrusters, explosions, trails
- **Multiplayer**: Synchronized physics simulation
- **Save/Load**: Persistent universe state
- **Procedural Generation**: Random solar systems
- **VR Support**: WebXR integration

---

## 📝 License

This project is open source and free to use, modify, and distribute.

---

## 🙏 Credits

- **Three.js**: 3D rendering library
- **Physics**: Based on classical Newtonian mechanics
- **Design**: Modular, expandable architecture

---

## 📞 Support

For issues or questions:
1. Check the debug console (/)
2. Enable metrics (F3) for diagnostics
3. Review browser console for error messages
4. Verify all files are loaded correctly

---

**Enjoy exploring the cosmos! 🌌✨**
