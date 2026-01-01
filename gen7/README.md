# Solar System Simulation - Gen7

A fully functional 3D solar system simulation with realistic N-body physics, first/third-person player controls, and beautiful graphics. Built with Three.js and vanilla JavaScript.

## 🌟 Features

### Physics
- **N-body gravitational simulation** - All celestial bodies interact gravitationally
- **Stable orbital mechanics** - Default configuration creates stable, realistic orbits
- **Accurate physics** - Semi-implicit Euler integration with fixed timestep
- **Collision detection and response** - Realistic object interactions
- **Configurable time scale** - Speed up or slow down the simulation

### Celestial Bodies
- **1 Sun** - Self-luminous star with dynamic lighting
- **2 Planets** - Earth-like and Mars-like worlds with atmospheres
- **1 Moon** - Tidally locked satellite orbiting Planet 1
- **Expandable system** - Easy to add more bodies (asteroids, comets, black holes, etc.)

### Player Controls
- **First-person and third-person views** - Toggle with `V`
- **Ground movement** - WASD to move, Space to jump
- **Free flight mode** - Press `INS` for unrestricted flight
  - Space = up, Shift = down
  - Smooth acceleration and damping
- **Mouse look** - Full 360° camera control
- **Spawns on Planet 1** - Starting location with stable footing

### Interactive Objects
- **8 physics-enabled objects** spawn near the player
- **Cubes, spheres, and cylinders** with different properties
- **Realistic physics** - Mass, friction, restitution
- **Interact via collisions** - Push, throw, and watch them bounce

### Graphics & Performance
- **Three quality presets** - Low, Medium, High
- **Dynamic shadows** - Accurate sun-cast shadows
- **Atmospheric effects** - Glowing atmospheres on planets
- **Starfield background** - Thousands of distant stars
- **GPU-optimized** - Efficient rendering for smooth performance
- **Performance metrics** - Toggle with `F` to see FPS, draw calls, etc.

### Developer Tools
- **Live configuration menu** - Press `/` to access
  - Modify all celestial body properties in real-time
  - Adjust physics parameters
  - Change graphics settings
  - Debug tools and visualization
- **All parameters in globals.js** - Easy to modify and extend
- **Debuggable code** - Clear console logging and error handling
- **Performance monitoring** - Real-time metrics display

## 🎮 Controls

| Key | Action |
|-----|--------|
| **WASD** | Move (ground mode) |
| **Mouse** | Look around |
| **Space** | Jump (ground) / Fly up (flight mode) |
| **Shift** | Fly down (flight mode only) |
| **INS** | Toggle free flight mode |
| **V** | Toggle camera view (1st/3rd person) |
| **F** | Toggle performance metrics |
| **C** | Toggle coordinates display |
| **H** | Toggle help/controls |
| **/** | Open developer menu |
| **P** | Pause/Resume simulation |
| **ESC** | Close developer menu |

## 🚀 Getting Started

1. **Open `index.html`** in a modern web browser
   - Chrome, Firefox, Edge, or Safari recommended
   - Requires WebGL support

2. **Click on the canvas** to activate pointer lock

3. **Explore!**
   - Walk around Planet 1
   - Jump and feel the gravity
   - Toggle to flight mode for unrestricted exploration
   - Switch to third-person for a cinematic view

## 📁 Project Structure

```
gen7/
├── index.html                    # Entry point
├── styles.css                    # UI styling
├── README.md                     # This file
├── config/
│   └── globals.js               # All configuration parameters
├── src/
│   ├── main.js                  # Main application
│   ├── utils/
│   │   └── Vector3D.js          # Vector mathematics
│   ├── physics/
│   │   ├── PhysicsObject.js     # Base physics class
│   │   └── GravityEngine.js     # N-body gravity simulation
│   ├── celestial/
│   │   ├── CelestialBody.js     # Base celestial class
│   │   ├── Star.js              # Sun/star implementation
│   │   ├── Planet.js            # Planet implementation
│   │   └── Moon.js              # Moon implementation
│   ├── player/
│   │   ├── Player.js            # Player controller
│   │   └── Camera.js            # Camera system
│   ├── objects/
│   │   └── InteractiveObject.js # Physics objects
│   ├── rendering/
│   │   ├── Renderer.js          # Main renderer
│   │   └── LightingSystem.js    # Lighting and shadows
│   └── ui/
│       ├── PerformanceMonitor.js # Performance metrics
│       └── DevMenu.js           # Developer menu
```

## 🔧 Configuration

All parameters are in `config/globals.js` and can be modified:

### Celestial Bodies
- Mass, radius, color, temperature
- Orbital parameters (semi-major axis, eccentricity, inclination)
- Rotation period
- Atmosphere properties

### Physics
- Gravitational constant (G)
- Time scale
- Physics tick rate
- Collision settings
- Friction and drag

### Graphics
- Quality presets
- Shadow settings
- Antialiasing
- Star count
- Field of view
- Effects (bloom, atmosphere)

### Player
- Movement speeds
- Jump force
- Flight parameters
- Camera settings

## 🎯 Future Expansion Ideas

The project is designed to easily accommodate:

- **Black holes** with event horizons and gravitational lensing
- **Working telescopes** for zooming to distant bodies
- **More celestial bodies** - Asteroids, comets, gas giants, rings
- **Procedural terrain** on planets
- **Day/night cycles** with dynamic lighting
- **Weather systems** and clouds
- **Spaceship** for interplanetary travel
- **Landing on moons** and other planets
- **Resource gathering** and base building
- **Multiplayer** support

## 🐛 Debugging

### Loading Issues
- Check browser console (`F12`) for detailed error messages
- Loading screen shows progress and any errors
- Ensure all files are in correct directories

### Performance Issues
- Press `F` to see performance metrics
- Lower quality preset in developer menu (`/`)
- Disable shadows for better performance
- Reduce star count

### Physics Issues
- Press `/` to open developer menu
- Check "Debug Tools" tab
- Use "Print Physics State" to see all body data
- Verify orbital velocities in console

### Camera/Controls
- Ensure pointer lock is active (click canvas)
- Check console for control state messages
- Try toggling flight mode (`INS`)
- Reset by refreshing the page

## 📊 Performance Tips

1. **Adjust quality preset** in developer menu
2. **Disable shadows** if running slow
3. **Reduce star count** for better performance
4. **Lower resolution** in browser
5. **Close other applications** to free up GPU

## 🧪 Technical Details

### Physics Engine
- Uses **Verlet integration** for stability
- **Fixed timestep** (60Hz default) for consistency
- **N-body simulation** - every body affects every other body
- **Collision detection** with sphere-sphere tests
- **Impulse-based collision resolution**

### Rendering
- **Three.js WebGL renderer**
- **PBR materials** (Physically Based Rendering)
- **Shadow mapping** for accurate shadows
- **Point lights** and directional lights
- **Post-processing** ready architecture

### Coordinate System
- **Scaled for visualization** - Real distances too large for rendering
- Distance scale: 1 scene unit = 1 billion meters
- Size scale: 1 scene unit = 10 million meters
- All physics calculations use real units

## 📝 License

This is an educational/portfolio project. Feel free to learn from and modify the code.

## 🙏 Credits

- **Three.js** - 3D graphics library
- **Physics algorithms** - Based on classical mechanics
- **Design** - Modern space simulation aesthetic

---

**Enjoy exploring the cosmos!** 🌌

For questions or issues, check the browser console for detailed logging.
