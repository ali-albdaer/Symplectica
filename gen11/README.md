# Solar System Simulation - Gen11

A fully functional 3D Solar System simulation with realistic N-body gravitational physics, built with Three.js and Cannon.js.

## 🌟 Features

### Core Systems
- **N-Body Gravitational Physics**: All celestial bodies exert realistic gravitational forces on each other
- **Stable Orbital Mechanics**: Pre-configured stable orbits for Sun, 2 Planets, and 1 Moon
- **Dual-Mode Player Control**:
  - **Walking Mode**: WASD movement with dynamic gravity alignment to nearest celestial body
  - **Flight Mode**: 6-DOF free flight with camera-relative controls
- **Real-time Shadows**: Sun as the sole light source with accurate shadow casting
- **Interactive Objects**: Physics-driven micro-objects that can be grabbed and thrown

### Graphics & Performance
- **3-Level Fidelity Settings**: Low, Medium, Ultra (configurable in Developer Console)
- **Level of Detail (LOD)**: Automatic mesh quality adjustment based on distance
- **GPU-Accelerated Rendering**: WebGL-based high-performance rendering
- **Dynamic Star Field**: Procedurally generated background stars

### UI & Debugging
- **Developer Console** (`/` key): Live editor for all Config.js parameters
- **Telemetry Overlay** (`T` key): Real-time FPS, frame time, position, velocity
- **Debug Log** (`L` key): System messages and error tracking
- **On-Screen Controls Guide**: Always-visible control reference

## 📁 File Structure

```
gen11/
├── index.html              # Main HTML entry point
└── js/
    ├── main.js             # Application initialization
    ├── Config.js           # Centralized configuration
    ├── Engine.js           # Core game loop and scene management
    ├── PhysicsWorld.js     # Cannon.js physics and N-body gravity
    ├── CelestialBody.js    # Planets, moons, stars
    ├── Player.js           # Player controller
    └── UIManager.js        # UI and debug overlay management
```

## 🚀 Quick Start

### Prerequisites
- A modern web browser with WebGL support (Chrome, Firefox, Edge, Safari)
- A local web server (required for ES6 modules)

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd c:\Users\PC\Desktop\2026\solar_system_sim\gen11
   ```

2. **Start a local web server**:

   **Option A - Python (if installed)**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option B - Node.js (if installed, but NOT required for the project)**:
   ```bash
   npx http-server -p 8000
   ```

   **Option C - VS Code Live Server Extension**:
   - Install the "Live Server" extension
   - Right-click `index.html` and select "Open with Live Server"

   **Option D - PowerShell (Windows)**:
   ```powershell
   # Navigate to the directory first, then run:
   python -m http.server 8000
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:8000`
   - Click anywhere on the canvas to engage pointer lock
   - Start exploring!

## 🎮 Controls

### Walking Mode (Default)
- **W/A/S/D**: Move forward/left/backward/right
- **Space**: Jump (when grounded)
- **Mouse**: Look around (requires pointer lock)
- **F**: Toggle Flight Mode

### Flight Mode
- **W/A/S/D**: Move relative to camera direction
- **Space**: Ascend
- **Shift**: Descend
- **Mouse**: Free look
- **F**: Toggle back to Walking Mode

### Universal Controls
- **Right Click**: Grab/release interactive objects
- **C**: Toggle between First-Person and Third-Person camera
- **T**: Toggle Telemetry overlay
- **L**: Toggle Debug Log
- **/**: Toggle Developer Console
- **Esc**: Release pointer lock

## ⚙️ Configuration

### Developer Console (`/` key)
Access real-time configuration of:

#### Graphics Settings
- **Fidelity**: Low/Medium/Ultra
- **Shadow Quality**: 512 - 4096
- **Enable/Disable Shadows**
- **Field of View**: 30° - 120°

#### Physics Settings
- **Time Scale**: Speed up or slow down simulation
- **Gravity Constant (G)**: Adjust gravitational strength
- **Physics Substeps**: Improve stability (higher = more accurate)

#### Player Settings
- **Walk Speed**: 1 - 50 units/sec
- **Flight Speed**: 5 - 100 units/sec
- **Jump Force**: 1 - 20 units
- **Mouse Sensitivity**: 0.1 - 2.0

### Manual Configuration
Edit `js/Config.js` to modify:
- Celestial body properties (mass, radius, position, velocity)
- Interactive object parameters
- Rendering settings
- Control bindings
- Special entities (black holes, wormholes - currently disabled)

## 🌍 Physics System

### N-Body Gravity
The simulation implements authentic N-body gravitational attraction:

```
F = G * (m1 * m2) / r²
```

Where:
- **G** = Gravitational constant (configurable)
- **m1, m2** = Masses of the two bodies
- **r** = Distance between bodies

### Stable Orbits
The default configuration provides stable, non-decaying orbits:
- **Sun**: Stationary at origin (1,000,000 mass units)
- **Planet 1 (Mercurius)**: 200 units from Sun, orbital velocity ~28.5 units/sec
- **Planet 2 (Jovian)**: 450 units from Sun, orbital velocity ~18.5 units/sec
- **Moon (Luna Prima)**: Orbits Planet 2 at 60 units distance

### Interactive Physics
All interactive objects (boulders, cubes, crystals) follow the same N-body physics and can be:
- Grabbed and held with right-click
- Thrown by releasing while moving the camera
- Affected by all gravitational sources

## 🎨 Technical Details

### Architecture
- **Object-Oriented Design**: ES6 Classes with clear separation of concerns
- **Modular Structure**: Each subsystem is independent and injectable
- **Fixed Timestep Physics**: Ensures deterministic simulation regardless of frame rate
- **Accumulator Pattern**: Stable physics updates with variable rendering

### Performance Optimizations
- **Frustum Culling**: Automatic with Three.js
- **LOD System**: 3 detail levels per celestial body
- **Shadow Map Caching**: Minimize shadow map regeneration
- **Fixed Timestep**: Physics runs at consistent 60Hz

### Rendering Pipeline
1. Update physics (fixed 60Hz)
2. Apply N-body gravitational forces
3. Update celestial body rotations
4. Update player and camera
5. Update interactive objects
6. Render scene
7. Update UI

## 🐛 Debugging

### Debug Tools
- **Console Logging**: All major events logged to browser console
- **On-Screen Debug Log**: Toggle with `L` key
- **Telemetry**: Real-time performance metrics
- **Error Handling**: Graceful failure with on-screen error messages

### Common Issues

**Problem**: Simulation doesn't load
- Check browser console for errors
- Ensure internet connection (CDN libraries)
- Verify local server is running

**Problem**: Physics appears unstable
- Increase physics substeps in Developer Console
- Reduce time scale
- Check that masses/velocities haven't been misconfigured

**Problem**: Low FPS
- Reduce fidelity setting to "Low"
- Disable shadows
- Lower shadow map quality

**Problem**: Pointer lock not working
- Click directly on the canvas
- Close Developer Console first
- Check browser permissions

## 🔧 Expandability

The architecture supports easy addition of:

### Special Entities (Currently in Config.js)
- **Black Holes**: With Schwarzschild radius and event horizon shaders
- **Wormholes**: Portal-based teleportation
- **Telescopes**: Volumetric zoom capabilities

### To Add a New Celestial Body:
1. Add configuration to `Config.js` → `celestialBodies`
2. Specify: mass, radius, position, velocity, visual properties
3. The system automatically handles physics and rendering

### To Add Custom Physics:
1. Extend `PhysicsWorld.js`
2. Implement custom force calculations
3. Apply forces in the `update()` loop

## 📊 System Requirements

### Minimum
- Modern web browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- WebGL 1.0 support
- 4GB RAM
- Integrated graphics

### Recommended
- Chrome 100+ or Firefox 100+
- Dedicated GPU
- 8GB+ RAM
- Monitor: 1920x1080 or higher

## 📝 Configuration Reference

### Key Config.js Sections

```javascript
Config.physics.G              // Gravitational constant
Config.physics.timeScale      // Simulation speed multiplier
Config.player.walkSpeed       // Walking speed
Config.player.flightSpeed     // Flight speed
Config.rendering.fidelity     // Graphics quality preset
Config.celestialBodies.sun    // Sun configuration
Config.celestialBodies.planet1 // Inner planet
Config.celestialBodies.planet2 // Outer planet
Config.interactiveObjects     // Grabbable objects
```

## 🎓 Credits

**Built with**:
- [Three.js](https://threejs.org/) - 3D Graphics Library (r128)
- [Cannon.js](https://github.com/schteppe/cannon.js) - Physics Engine (v0.6.2)

**Architecture**: ES6 Modules, Object-Oriented Design
**Physics**: N-Body Gravitational Simulation
**Rendering**: WebGL with Shadow Mapping

## 📄 License

This project is open source and available for educational and personal use.

---

**Happy Exploring! 🚀**

For questions or issues, check the browser console and debug log (`L` key).
