# Quick Reference Card

## 🚀 5-Minute Setup
```bash
cd c:\Users\PC\Desktop\2026\solar_system_sim\gen11
python -m http.server 8000
# Open browser → http://localhost:8000
# Click canvas to start
```

## ⌨️ Essential Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move (Walking) / Directional flight |
| **Space** | Jump (Walking) / Ascend (Flight) |
| **Shift** | — / Descend (Flight) |
| **F** | Toggle Flight Mode |
| **C** | Toggle First/Third Person Camera |
| **T** | Toggle Telemetry Overlay |
| **L** | Toggle Debug Log |
| **/** | Toggle Developer Console |
| **Right Click** | Grab/Release Objects |
| **Esc** | Release Pointer Lock |

## 🎮 Movement Modes

### Walking Mode (Default)
- Gravity-aligned to nearest planet
- Jump with spacebar
- Affected by planetary gravity

### Flight Mode (F to toggle)
- 6 Degrees of Freedom
- Space = Up, Shift = Down
- No gravity constraints

## ⚙️ Quick Config (via `/` Console)

### Performance Issues?
1. Press `/`
2. Fidelity → **Low**
3. Enable Shadows → **Uncheck**
4. Apply Settings

### Too Fast/Slow?
1. Press `/`
2. Time Scale → **0.5** (slower) or **2.0** (faster)
3. Apply Settings

### Physics Unstable?
1. Press `/`
2. Physics Substeps → **5-10**
3. Apply Settings

## 📊 Telemetry (T key)
- **FPS**: Frames per second (target: 60)
- **Frame Time**: Milliseconds per frame
- **Position**: Your coordinates [x, y, z]
- **Velocity**: Your speed [x, y, z]
- **Mode**: Walking or Flight
- **Bodies**: Total objects in simulation

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Black screen | Use local server (not file://) |
| Can't move | Click canvas for pointer lock |
| Low FPS | Reduce fidelity to Low |
| Flying off | Reduce time scale |
| No shadows | Enable in Dev Console |

## 📝 Config.js Quick Edit Locations

```javascript
// Physics
Config.physics.G = 6.674           // Gravity strength
Config.physics.timeScale = 1.0      // Speed multiplier

// Player
Config.player.walkSpeed = 5.0       // Walk speed
Config.player.flightSpeed = 20.0    // Flight speed
Config.player.jumpForce = 8.0       // Jump strength

// Graphics
Config.rendering.currentFidelity = 'medium'  // low/medium/ultra
Config.rendering.enableShadows = true
Config.rendering.fov = 75           // Field of view

// Celestial Bodies (example: Sun)
Config.celestialBodies.sun.mass = 1000000
Config.celestialBodies.sun.luminosity = 2000
```

## 🌍 Stable Orbit Formula
```
Orbital Velocity = sqrt(G × Mass / Distance)

Example (Planet 1):
v = sqrt(6.674 × 1000000 / 200)
v ≈ 182.68 units/sec
```

## 🎯 Developer Console Categories

### Graphics Settings
- Fidelity (Low/Medium/Ultra)
- Shadow Quality (512-4096)
- Field of View (30-120°)

### Physics Settings
- Time Scale (0.1-10x)
- Gravity Constant
- Physics Substeps

### Player Settings
- Movement Speed
- Flight Speed
- Jump Force

### Camera Settings
- FOV
- Mouse Sensitivity

## 📂 File Structure
```
gen11/
├── index.html          ← Entry point
├── START_SERVER.bat    ← Quick server start
├── README.md           ← Full documentation
├── ADVANCED.md         ← Advanced features
├── TROUBLESHOOTING.md  ← Problem solving
└── js/
    ├── main.js         ← Initialization
    ├── Config.js       ← ALL SETTINGS HERE
    ├── Engine.js       ← Game loop
    ├── PhysicsWorld.js ← N-body physics
    ├── CelestialBody.js← Planets/stars
    ├── Player.js       ← Player control
    └── UIManager.js    ← UI/debugging
```

## 🔥 Performance Presets

### Low-End PC
```javascript
currentFidelity: 'low'
enableShadows: false
starField.count: 1000
shadowMapSize: 512
```

### Mid-Range PC
```javascript
currentFidelity: 'medium'
enableShadows: true
starField.count: 5000
shadowMapSize: 1024
```

### High-End PC
```javascript
currentFidelity: 'ultra'
enableShadows: true
starField.count: 10000
shadowMapSize: 2048
```

## 🎨 Default Celestial Bodies

| Body | Distance | Mass | Velocity |
|------|----------|------|----------|
| Sun | 0 | 1,000,000 | 0 |
| Planet 1 | 200 | 800 | 28.5 |
| Planet 2 | 450 | 2,500 | 18.5 |
| Moon 1 | 60 from P2 | 150 | 10.5 |

## 🛠️ Quick Diagnostic Commands

Open browser console (F12) and paste:

```javascript
// Check current FPS
window.solarSystemApp.engine.fps

// Check player position
window.solarSystemApp.player.getPosition()

// List all bodies
window.solarSystemApp.celestialBodies.map(b => b.config.name)

// Pause/unpause
window.solarSystemApp.engine.togglePause()

// Check physics bodies count
window.solarSystemApp.physicsWorld.bodies.size
```

## 📞 Browser Requirements

| Browser | Min Version | Recommended |
|---------|-------------|-------------|
| Chrome | 90+ | 100+ |
| Firefox | 88+ | 100+ |
| Edge | 90+ | 100+ |
| Safari | 14+ | 15+ |

## ⚡ Hotkeys for Power Users

| Key Combo | Action (when enabled) |
|-----------|----------------------|
| Shift+P | Pause physics |
| Shift+R | Restart simulation |
| Shift+G | Toggle gravity vectors |
| Ctrl+` | Browser console |

*(Some require custom implementation)*

---

**Need Help?** Check TROUBLESHOOTING.md
**Want More?** Check ADVANCED.md
**Full Docs?** Check README.md

**Happy Exploring! 🌌**
