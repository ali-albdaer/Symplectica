# QUICK START GUIDE

## In 30 Seconds

```bash
cd c:\Projects\2026\solar_system_sim\gen27
python -m http.server 8000
```

Then open: **http://localhost:8000**

## First Time Playing

1. **Wait** for the scene to fully load (check for "SOLAR SYSTEM SIMULATION" title)
2. **Click** the canvas to enable pointer lock
3. **Move**: W/A/S/D to walk, Mouse to look around
4. **Jump**: Space bar
5. **Explore**: Walk around Planet 1 to see the other planets in the sky

## Essential Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move forward/left/backward/right |
| **MOUSE** | Look around (click canvas first) |
| **SPACE** | Jump |
| **F** | Free flight mode (6-DOF movement) |
| **V** | Toggle camera (1st/3rd person) |
| **R** | Grab objects |
| **/** | Developer console |
| **G** | Show FPS/position overlay |
| **H** | Show help |

## Understanding the System

### What You See
- **Sun**: At the center, big yellow sphere that emits light
- **Planet 1** (Earth-like): Close to sun, has moon orbiting it
- **Planet 2** (Jupiter-like): Far from sun, very large
- **Moon 1**: Small, orbits Planet 1
- **Starfield**: Distant stars in background
- **Interactive Objects**: Glowing orbs and rocks near spawn point

### Physics
- Everything falls toward the nearest massive body
- Walking on planets feels normal (gravity pulls you to surface)
- Jumping up gives you airtime
- Planets orbit the sun in stable paths
- All objects are affected by gravity from all other objects

## Developer Console

Press **/** to open the console.

Here you can:
- **Change any parameter** in real-time (position, velocity, mass, etc.)
- **Adjust game settings** (speed, jump force, rendering quality)
- **Experiment** with physics without restarting
- **Click R** on any parameter to reset to default

Example: Change walk speed from 4.5 to 10, hit Enter, immediately move faster!

## Telemetry (Performance Info)

Press **G** to show:
- Current FPS and average FPS
- Frame time in milliseconds  
- Player position and velocity
- Camera mode and direction

Use this to monitor performance if game feels slow.

## If Something Goes Wrong

1. **Game won't load?** 
   - Check browser console (F12) for errors
   - Make sure you're using Python HTTP server

2. **All black screen?**
   - Check developer console shows "SOLAR SYSTEM SIMULATION"
   - If stuck on "Initializing", check debug log (L key)

3. **Poor FPS?**
   - Press `/` to open console
   - Find "Fidelity" and change from "ultra" to "medium"
   - Alternatively, press G to see real FPS number

4. **Player stuck or falling?**
   - Press F to enable free flight
   - Press Space to go up
   - Press Shift to go down

## Common Questions

**Q: Why does gravity feel weird?**  
A: You're on a spherical planet. "Down" is always toward the planet's center. Walk to the edge of what you consider "up" and you'll see!

**Q: Can I travel to other planets?**  
A: Yes! Turn on free flight mode (F) and fly toward them. They're very far away though!

**Q: What are the glowing orbs?**  
A: Interactive objects. You can grab them (R key) and throw them around.

**Q: Why is the sun so big?**  
A: Everything is scaled down to fit in a viewable space. In reality, the sun would be much smaller at this distance.

**Q: Can I break the physics?**  
A: Yes! Open the developer console (/) and try setting negative masses, or move planets into each other. See what happens!

**Q: Is it using real physics?**  
A: Yes! Using Newton's law of gravitation (F = GMm/r²). All constants are real physical values.

## Advanced Usage

### Modifying the System

Edit `config.js` before loading to:
- Add more planets
- Change orbit distances and velocities
- Modify player starting position
- Adjust physics timestep
- Change rendering quality

See **CUSTOMIZATION.md** for examples.

### Understanding the Code

The codebase is organized into:
- **physics.js** - Gravity calculations
- **renderer.js** - 3D graphics
- **player.js** - Movement and jumping
- **camera.js** - First/third person views
- **input-handler.js** - Controls
- **ui.js** - Menus and telemetry
- **config.js** - All parameters

Each system is independent and well-documented.

## What Happens Next

The solar system is **fully stable by default**. You can:

1. **Explore** all four bodies
2. **Experiment** with parameters in the console
3. **Create chaos** by modifying orbits
4. **Add new features** by extending the code
5. **Modify physics** to test different constants

## Technical Details

- **No installation required** - Pure HTML/CSS/JavaScript
- **One large file per system** - Easy to find and modify
- **Configuration-driven** - Change behavior without code
- **Fully documented** - Every function explained
- **Real physics** - Uses actual gravitational equations
- **GPU-accelerated** - Three.js with WebGL

## File You Need to Know

| File | Purpose |
|------|---------|
| **index.html** | Main page and styling |
| **config.js** | All parameters - START HERE to customize |
| **physics.js** | Gravity calculations |
| **README.md** | Full documentation |
| **CUSTOMIZATION.md** | How to add features |

## Next Steps

1. ✓ Get it running (use Python HTTP server)
2. ✓ Explore the default system
3. ✓ Open developer console (/) and adjust parameters
4. ✓ Read CUSTOMIZATION.md to add new features
5. ✓ Experiment and have fun!

---

**Everything is ready to use. Just run the HTTP server and open your browser!**

Questions? Check README.md or CUSTOMIZATION.md for detailed information.
