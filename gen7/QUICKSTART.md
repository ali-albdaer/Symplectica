# Quick Start Guide

## 🚀 Running the Application

### Method 1: Direct Browser (Simplest)
1. Navigate to the `gen7` folder
2. Double-click `index.html`
3. Your default browser will open the simulation

⚠️ **Note:** Some browsers block ES6 modules when opening files directly. If you see errors, use Method 2.

### Method 2: Local Web Server (Recommended)

#### Using Python:
```bash
# Navigate to the gen7 folder
cd "C:\Users\PC\Desktop\2026\solar_system_sim\gen7"

# Python 3
python -m http.server 8000

# Then open in browser:
# http://localhost:8000
```

#### Using Node.js (http-server):
```bash
# Install http-server globally (once)
npm install -g http-server

# Navigate to gen7 folder
cd "C:\Users\PC\Desktop\2026\solar_system_sim\gen7"

# Start server
http-server -p 8000

# Open: http://localhost:8000
```

#### Using VS Code Live Server:
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## ✅ What to Expect

### Loading (5-10 seconds)
- Beautiful loading screen with progress bar
- Messages showing initialization steps:
  - Initializing renderer...
  - Initializing physics engine...
  - Creating solar system...
  - Spawning player...
  - etc.

### After Loading
- Black space background with stars
- Glowing sun in the distance
- You're standing on a blue planet (Terra Prime)
- Several colored objects (cubes, spheres, cylinders) nearby
- Help panel in bottom-right corner

## 🎮 First Steps

1. **Click on the screen** to activate mouse look
2. **Move around** with WASD
3. **Look around** by moving mouse
4. **Jump** with Space bar
5. **Try third-person view** - Press V

## 🧪 Testing Features

### Test Physics
1. Walk up to one of the objects
2. Walk into it to push it
3. Jump on it
4. Watch it fall and bounce with realistic physics

### Test Flight Mode
1. Press `INS` to enable free flight
2. Press `Space` to go up
3. Press `Shift` to go down
4. Fly around the planet
5. Observe the moon in the distance

### Test Developer Menu
1. Press `/` to open the dev menu
2. Navigate through tabs:
   - **Celestial Bodies** - Change planet colors, sizes, masses
   - **Physics Settings** - Adjust time scale, gravity
   - **Graphics Settings** - Quality presets, shadows
   - **Debug Tools** - Show orbits, log physics
3. Try changing time scale to 10x - watch orbits speed up!
4. Press ESC to close

### Test Performance
1. Press `F` to show performance metrics
2. Should see 60 FPS on most systems
3. Try changing quality in dev menu if low FPS

### Test Camera Modes
1. Press `V` to switch to third-person
2. Walk around and see smooth camera following
3. Jump and watch cinematic camera movement
4. Press `V` again to return to first-person

## 🐛 Troubleshooting

### Black Screen
- **Check browser console** (F12)
- **Error messages** will show what's wrong
- Common issue: CORS error (use local server)

### Low FPS
- Press `/` to open dev menu
- Go to Graphics Settings
- Change Quality to "low"
- Disable shadows

### Controls Not Working
- **Click on the canvas** to activate pointer lock
- Look for cursor to disappear (means it's active)
- Press ESC to release pointer lock

### Objects Falling Through Planet
- This shouldn't happen with default settings
- If it does, check console for errors
- Try adjusting physics tick rate in dev menu

### Loading Screen Stuck
- Check console (F12) for errors
- Ensure all files are present
- Check network tab for failed file loads

## 📊 Performance Expectations

### High-End PC (RTX 3070+, Modern CPU)
- 60 FPS constant
- All settings on High
- Shadows enabled
- 15000 stars

### Mid-Range PC (GTX 1060, i5/Ryzen 5)
- 60 FPS on Medium settings
- Some shadow quality reduction
- 10000 stars

### Low-End PC / Laptop
- 30-60 FPS on Low settings
- Shadows disabled
- 5000 stars
- Lower resolution

## 🎯 Cool Things to Try

1. **Time Lapse**
   - Open dev menu (`/`)
   - Set time scale to 100x
   - Watch planets orbit the sun rapidly

2. **Planet Colors**
   - Open dev menu
   - Go to Celestial Bodies
   - Change planet colors in real-time

3. **Orbit Visualization**
   - Open dev menu
   - Go to Debug Tools
   - Enable "Show Orbits"
   - See the orbital paths

4. **Gravity Experiment**
   - Open dev menu
   - Change sun's mass dramatically
   - Watch orbits change in real-time

5. **Free Flight Exploration**
   - Enable flight mode (`INS`)
   - Fly to the moon
   - Observe Earth from afar
   - Fly close to the sun

## 📝 Configuration

All game parameters are in `config/globals.js`:

```javascript
// Example: Make player jump higher
PLAYER: {
    jumpForce: 12.0,  // default is 6.0
}

// Example: Make time run faster
PHYSICS: {
    timeScale: 5.0,  // default is 1.0
}

// Example: Add more interactive objects
OBJECTS: {
    spawnCount: 20,  // default is 8
}
```

## 🔧 Advanced Usage

### Accessing Game Object in Console
The game is available globally:
```javascript
// Open browser console (F12)
game.gravityEngine.logBodyStates()  // Print all physics
game.player.getState()               // Player info
game.celestialBodies.planet1.getInfo()  // Planet info
```

### Modifying in Real-Time
```javascript
// Speed up time 10x
game.gravityEngine.setTimeScale(10)

// Change sun color
game.celestialBodies.sun.mesh.material.color.setHex(0xFF0000)

// Teleport player
game.player.setPosition(0, 100, 0)
```

## 🎨 Visual Quality Guide

### Maximum Quality Settings
```javascript
GRAPHICS: {
    quality: 'high',
    shadows: { enabled: true, quality: 'high' },
    antialiasing: true,
    stars: { count: 20000 },
    planetDetails: {
        atmosphereEnabled: true,
        cloudsEnabled: true,
    }
}
```

### Performance Mode
```javascript
GRAPHICS: {
    quality: 'low',
    shadows: { enabled: false },
    antialiasing: false,
    stars: { count: 3000 },
}
```

## ❓ Need Help?

1. **Check README.md** - Full documentation
2. **Check DEVELOPER_GUIDE.md** - How to extend
3. **Browser Console (F12)** - Detailed error messages
4. **Performance Metrics (F)** - FPS and stats

---

**Enjoy the simulation!** 🌌

Press H in-game for controls reminder.
