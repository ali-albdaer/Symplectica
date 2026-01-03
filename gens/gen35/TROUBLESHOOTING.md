# 🔧 TROUBLESHOOTING GUIDE

## Common Issues and Solutions

---

## Issue: Black/Blank Screen on Load

### Symptoms
- Page loads but canvas is black
- No visible objects
- Console may show errors

### Solutions

1. **Check Browser Console (F12)**
   ```
   Look for red error messages
   Common errors:
   - "Failed to fetch" → Server not running
   - "THREE is not defined" → CDN blocked
   - Script errors → Check file paths
   ```

2. **Verify HTTP Server**
   ```bash
   # Make sure you're running:
   python -m http.server 8000
   
   # Then access:
   http://localhost:8000
   
   # NOT file:///c:/Projects/...
   ```

3. **Check Three.js CDN**
   - Open Network tab in DevTools
   - Look for three.min.js (should be 200 OK)
   - If blocked, download Three.js locally

4. **Clear Browser Cache**
   ```
   Ctrl + Shift + Delete → Clear cached files
   Or hard refresh: Ctrl + F5
   ```

---

## Issue: Low FPS / Performance Problems

### Symptoms
- Choppy movement
- Low frame rate
- Browser becomes slow

### Solutions

1. **Check Current FPS**
   ```
   Press F3 → Look at FPS counter
   Target: 60 FPS
   Acceptable: >30 FPS
   Poor: <20 FPS
   ```

2. **Reduce Fidelity**
   ```
   Press / → Developer Console
   Change "Fidelity" to "Low"
   
   This reduces:
   - Shadow quality
   - Light count
   - Star count
   ```

3. **Disable Shadows**
   ```javascript
   // In config.js:
   rendering: {
       shadowsEnabled: false,
   }
   ```

4. **Reduce Star Count**
   ```javascript
   // In config.js:
   rendering: {
       starCount: 1000,  // Default: 5000
   }
   ```

5. **Lower Shadow Map Size**
   ```javascript
   rendering: {
       shadowMapSize: 512,  // Default: 2048
   }
   ```

---

## Issue: Physics Unstable / Orbits Decay

### Symptoms
- Planets drift away
- Orbits spiral outward/inward
- System "explodes"

### Solutions

1. **Check System Energy**
   ```
   Press F3 → Look at "System Energy"
   Total energy should be relatively constant
   Small drift is normal, large changes indicate instability
   ```

2. **Reduce Time Scale**
   ```
   Press / → Developer Console
   Set "Time Scale" to 0.5 or lower
   Slower simulation = more stable
   ```

3. **Increase Integration Steps**
   ```javascript
   // In config.js:
   physics: {
       integrationSteps: 2,  // Default: 1
   }
   ```

4. **Reset to Default Values**
   ```
   Refresh page (F5) to reload config.js
   ```

---

## Issue: Player Falls Through Planet

### Symptoms
- Player spawns but immediately falls
- Can't stand on planet surface
- Falls into space

### Causes & Solutions

1. **Physics Not Initialized**
   ```
   Check console for:
   "[PHYSICS] Registered body: Planet 1"
   
   If missing, physics engine failed to start
   ```

2. **Collision Radius Too Small**
   ```javascript
   // In config.js:
   player: {
       radius: 0.4,  // Increase if falling through
   }
   ```

3. **Planet Display Radius**
   ```javascript
   planet1: {
       displayRadius: 1.0,  // Must be large enough
   }
   ```

---

## Issue: Camera Not Moving / Stuck

### Symptoms
- Mouse doesn't rotate view
- WASD doesn't move player
- Camera frozen

### Solutions

1. **Pointer Not Locked**
   ```
   Click on the canvas to lock pointer
   Console should show:
   "[CAMERA] Pointer lock: ENABLED"
   ```

2. **Menu Open**
   ```
   Press / to close Developer Console
   Pointer lock disables when menu is open
   ```

3. **Check Input System**
   ```javascript
   // In browser console:
   console.log(window.player.keys);
   // Should show key states when pressing WASD
   ```

---

## Issue: Objects Not Grabbable

### Symptoms
- Right-click doesn't grab objects
- Objects don't respond
- No console message

### Solutions

1. **Check Distance**
   ```
   Must be within 3 meters of object
   Move closer with WASD
   ```

2. **Object Manager Not Initialized**
   ```
   Check console for:
   "[OBJECTS] Spawned X objects"
   
   If missing, object system failed
   ```

3. **Right-Click Handler**
   ```javascript
   // Verify in console:
   console.log(window.objectManager);
   // Should show ObjectManager instance
   ```

---

## Issue: Developer Console Won't Open

### Symptoms
- Pressing / does nothing
- No console appears

### Solutions

1. **Check Key Binding**
   ```javascript
   // In config.js:
   ui: {
       devConsoleKey: '/',
   }
   
   // Try changing to different key if / conflicts
   ```

2. **UI System Failed**
   ```
   Check browser console (F12) for errors
   Look for "[UI] System initialized"
   ```

---

## Issue: Shadows Not Appearing

### Symptoms
- No shadows on planets
- Objects don't cast shadows
- Everything is bright

### Solutions

1. **Shadows Disabled**
   ```javascript
   // In config.js:
   rendering: {
       shadowsEnabled: true,
   }
   ```

2. **Shadow Map Size Too Low**
   ```javascript
   rendering: {
       shadowMapSize: 2048,
   }
   ```

3. **Check Sun Light**
   ```javascript
   // In browser console:
   console.log(window.solarSystem.sun.light);
   console.log(window.solarSystem.sun.light.castShadow);
   // Should be: true
   ```

---

## Issue: Screen Too Dark / Can't See Anything

### Symptoms
- Planets are black
- Only sun is visible
- Too dark to navigate

### Solutions

1. **This is Intentional!**
   ```
   Sun is the only light source (realistic)
   Dark side of planets should be dark
   Move to sunlit side or increase sun intensity
   ```

2. **Increase Sun Intensity**
   ```
   Press / → Developer Console
   Set "Light Intensity" higher (try 5.0)
   ```

3. **Add Ambient Light (Unrealistic)**
   ```javascript
   // In main.js, add after scene creation:
   const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
   scene.add(ambientLight);
   ```

---

## Issue: Console Errors About "CONFIG is not defined"

### Symptoms
- Error: "CONFIG is not defined"
- Script fails to load

### Solutions

1. **Script Load Order**
   ```html
   <!-- In index.html, ensure config.js is FIRST -->
   <script src="config.js"></script>
   <script src="physics.js"></script>
   <!-- etc. -->
   ```

2. **File Not Found**
   ```
   Check browser Network tab
   Verify config.js loads (200 OK)
   ```

---

## Issue: "Three.js is not defined" Error

### Symptoms
- Error: "THREE is not defined"
- Nothing renders

### Solutions

1. **CDN Blocked**
   ```
   Check if CDN is accessible
   Try alternative CDN or local copy
   ```

2. **Download Three.js Locally**
   ```bash
   # Download three.min.js
   # Place in project folder
   # Update index.html:
   <script src="three.min.js"></script>
   ```

---

## Debugging Tips

### Enable Verbose Logging
```javascript
// At start of main.js:
console.log('[DEBUG] Verbose logging enabled');

// Add logs in critical sections
console.log('[DEBUG] Player position:', player.position);
```

### Monitor System Health
```
Press F3 for real-time metrics:
- FPS should be 60
- System energy should be stable
- Position should change when moving
```

### Test in Different Browsers
```
Chrome: Best performance
Firefox: Good debugging tools
Edge: Windows optimization
Safari: macOS/iOS
```

### Check WebGL Support
```javascript
// In browser console:
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
console.log('WebGL supported:', !!gl);
```

---

## Still Having Issues?

1. **Check All Files Present**
   ```
   Required files:
   - index.html
   - config.js
   - physics.js
   - celestialBodies.js
   - player.js
   - camera.js
   - objects.js
   - ui.js
   - main.js
   - styles.css
   ```

2. **Verify File Permissions**
   ```bash
   # Files should be readable
   ls -l
   ```

3. **Check Browser Compatibility**
   ```
   Minimum requirements:
   - Chrome 90+
   - Firefox 88+
   - Edge 90+
   - Safari 14+
   ```

4. **Review Browser Console**
   ```
   F12 → Console tab
   Look for initialization messages:
   [RENDERER] Initialized
   [PHYSICS] Registered bodies
   [GAME] Initialization complete
   ```

---

## Performance Benchmarks

### Expected Performance

| Hardware | FPS (Ultra) | FPS (Low) |
|----------|-------------|-----------|
| High-end GPU | 60 | 60 |
| Mid-range GPU | 45-60 | 60 |
| Integrated GPU | 25-40 | 50-60 |
| Old Hardware | 15-25 | 30-45 |

### If Below Expected:
- Close other tabs/programs
- Update graphics drivers
- Reduce browser zoom to 100%
- Disable browser extensions

---

## Contact & Support

If none of these solutions work:
1. Check browser console (F12)
2. Note exact error messages
3. Check which initialization steps complete
4. Review ARCHITECTURE.js for system design

---

**Remember: Most issues are configuration or environment related!**
