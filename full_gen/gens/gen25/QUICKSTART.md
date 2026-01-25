# Quick Start Guide

## How to Test the Solar System Simulation

### 1. Start the Server

Open PowerShell/Command Prompt in the project directory and run:

```powershell
python -m http.server 8000
```

### 2. Open in Browser

Navigate to: `http://localhost:8000`

### 3. What to Expect

1. **Loading Screen** - Shows for ~2 seconds while initializing
2. **Click Screen** - Click anywhere to lock the cursor
3. **You're on Planet Alpha!** - You spawn on the blue planet

### 4. Try These First

#### Basic Movement
- Look around with mouse
- Press **W** to walk forward
- Press **Space** to jump
- Press **Shift** while moving to sprint

#### Flight Mode
- Press **F** to enable flight mode
- Use **WASD** to move horizontally
- Press **Space** to go up
- Press **Shift** to go down
- Hold **Shift** while moving for 5x speed

#### Camera
- Press **V** to toggle third-person view
- Third-person camera smoothly follows you

#### Interact with Objects
- Look at one of the colorful objects near spawn
- **Right-click** to grab it
- Move around while holding it
- **Right-click** again to throw it forward

#### Developer Tools
- Press **/** (forward slash) to open the dev console
- Try changing `timeScale` to speed up/slow down time
- Try changing `walkSpeed` or `flightSpeed`
- Press **/** again to close

- Press **F3** to show performance metrics (FPS, frame times)
- Press **F4** to show your coordinates and nearest body

### 5. What You Should See

✅ **Sun** - Large orange glowing sphere (scaled down for visibility)
✅ **Planet Alpha** - Blue planet where you spawn (with atmosphere halo)
✅ **Planet Beta** - Tan/orange gas giant in the distance
✅ **Moon** - Gray moon orbiting Planet Alpha
✅ **Stars** - 10,000 background stars
✅ **Interactive Objects** - 5 colorful objects (some glowing)
✅ **Shadows** - From the sun onto planets and objects
✅ **Smooth Orbits** - Planets orbiting the sun in stable paths

### 6. Verify Physics

Watch the orbits for a minute:
- Planets should orbit smoothly around the sun
- Moon should orbit Planet Alpha
- No bodies should crash or fly away
- Interactive objects fall when released

### 7. Test Performance

- Check FPS (should be 60+ on modern hardware)
- Open dev console and reduce `starCount` if needed
- Try different performance presets (low/medium/ultra)
- Change `shadowMapSize` for quality vs performance

### 8. Common First-Time Issues

**"I can't move the camera"**
→ Click the screen to lock the cursor

**"Everything is black"**
→ Check browser console (F12) for errors
→ Make sure you're using http://localhost, not file://

**"I'm falling"**
→ You spawned on a planet - gravity is pulling you down
→ Try flight mode (F) for easier movement

**"I don't see the planets"**
→ They're far away! Use flight mode and boost (Shift+Space)
→ Or increase `timeScale` in dev console to watch orbits faster

**"Performance is slow"**
→ Press / and apply 'low' preset
→ Or reduce shadow quality and star count

### 9. Fun Things to Try

1. **Fly to the Sun** - Feel the heat (not really, but it's bright!)
2. **Watch the Moon Orbit** - Speed up time in dev console
3. **Throw Objects at Each Other** - They have real physics
4. **Change Planet Colors** - In the dev console
5. **Make Yourself Massive** - Change your mass and feel the gravity effect
6. **Time Travel** - Set `timeScale` to 100 and watch orbits speed up
7. **Zero Gravity** - Set `gravitationalConstant` to 0
8. **Jump to Planet Beta** - Flight mode + Shift boost + patience

### 10. Troubleshooting

**Check Browser Console (F12) if:**
- Black screen
- Loading never completes
- Controls don't work
- Crashes or freezes

**The console will show:**
- Initialization progress
- Any errors with helpful messages
- Physics system state
- Performance warnings

### 11. Experimentation

The entire simulation is live-editable:

```javascript
// In dev console, try changing:
CONFIG.simulation.timeScale = 10;      // 10x faster
CONFIG.player.walkSpeed = 50;          // Faster walking
CONFIG.player.jumpForce = 1000;        // Super jump
CONFIG.sun.lightIntensity = 5;         // Brighter sun
CONFIG.planet1.color = 0xFF0000;       // Red planet (reload to see)
```

### 12. If Something Breaks

Don't worry! Just refresh the page (F5) to reset everything.

All settings return to defaults on reload.

---

## Expected Console Output

When working correctly, you should see:

```
=== SOLAR SYSTEM SIMULATION ===
Initializing systems...
✓ Renderer created
✓ Scene created
✓ Physics engine initialized
✓ UI initialized
✓ Camera initialized
Initializing celestial system...
Created 4 celestial bodies
✓ Celestial system initialized
Player spawned on Planet Alpha at [...]
✓ Player initialized
Creating interactive objects...
Created 5 interactive objects
=== INITIALIZATION COMPLETE ===
Click the screen to lock cursor and start playing!
Pointer lock: ON
```

---

## Enjoy! 🚀

You've got a fully functional N-body physics simulation with realistic orbital mechanics!

Explore, experiment, and have fun! ✨
