# Troubleshooting Guide

## Common Issues and Solutions

### 1. Simulation Won't Load

#### Symptom: Black screen or loading screen stuck

**Solutions**:
- ✅ **Check Browser Console** (F12 → Console tab)
  - Look for red error messages
  - Common errors: Module loading failures, CORS errors
  
- ✅ **Verify Local Server**
  - ES6 modules REQUIRE a web server
  - Cannot open `index.html` directly (file://)
  - Start server: `python -m http.server 8000`
  - Access via: `http://localhost:8000`

- ✅ **Check Internet Connection**
  - Three.js and Cannon.js load from CDN
  - Offline? Download libraries and update paths in index.html

- ✅ **Clear Browser Cache**
  - Ctrl+Shift+Delete (Chrome/Edge)
  - Clear cached images and files

#### Symptom: "Failed to load module" error

**Solution**: Make sure you're accessing via `http://localhost` not `file://`

```bash
# Correct:
http://localhost:8000/index.html

# Wrong (won't work):
file:///C:/Users/PC/Desktop/2026/solar_system_sim/gen11/index.html
```

---

### 2. Physics Issues

#### Symptom: Objects flying off into space

**Causes**:
- Initial velocities too high
- Gravitational constant (G) too low
- Mass values misconfigured

**Solutions**:
1. Open Developer Console (`/` key)
2. Check Physics Settings
3. Reduce Time Scale to 0.5 for debugging
4. Verify Config.js values:

```javascript
// Stable orbit formula:
v = sqrt(G * M / r)

// Example for Planet 1:
G = 6.674
M = 1000000 (Sun mass)
r = 200 (distance)
v = sqrt(6.674 * 1000000 / 200) ≈ 182.68

// Current value: 28.5 (intentionally slower for gameplay)
```

#### Symptom: Bodies colliding or orbits decaying

**Solutions**:
- Increase Physics Substeps (Developer Console → 5-10)
- Check initial positions (no overlap)
- Verify velocities are tangential to orbital path

---

### 3. Performance Issues

#### Symptom: Low FPS (< 30)

**Immediate Fixes**:
1. Press `/` to open Developer Console
2. Change Fidelity to "Low"
3. Disable Shadows
4. Reduce Shadow Quality to 512

**Long-term Optimizations**:

Edit `Config.js`:
```javascript
// Reduce star field
starField: {
    enabled: true,
    count: 1000,  // Was: 5000
    size: 0.5,
    spread: 50000,
},

// Disable atmosphere effects
planet2: {
    atmosphere: {
        enabled: false,  // Was: true
    }
}
```

#### Symptom: Stuttering or frame drops

**Solutions**:
- Close other browser tabs
- Disable browser extensions
- Check Task Manager for CPU/GPU usage
- Reduce physics substeps to 1-2

---

### 4. Control Issues

#### Symptom: Can't move or look around

**Cause**: Pointer lock not engaged

**Solution**:
1. Click anywhere on the canvas
2. Browser will request pointer lock permission
3. Accept the permission
4. To release: Press `Esc`

#### Symptom: Developer Console won't close

**Solution**:
- Press `/` again
- Or click "Close" button in console
- Pointer lock will re-engage automatically

#### Symptom: Camera movement inverted

**Solution**:
Edit `Config.js`:
```javascript
controls: {
    mouseSensitivity: 0.5,
    invertY: true,  // Add this line
    // ...
}
```

Then in `Player.js` → `onMouseMove`:
```javascript
this.pitch -= this.mouseMovement.y * (Config.controls.invertY ? -1 : 1);
```

---

### 5. Graphics Issues

#### Symptom: No shadows visible

**Checks**:
1. Open Developer Console (`/`)
2. Verify "Enable Shadows" is checked
3. Ensure Fidelity is not "Low"
4. Check Shadow Quality setting

**Manual Fix** in `Config.js`:
```javascript
rendering: {
    enableShadows: true,
    shadowBias: -0.0001,
    shadowNormalBias: 0.02,
}
```

#### Symptom: Black or weird-colored objects

**Cause**: Materials not receiving light

**Solution**:
- Make sure you're not in shadow of another body
- Sun is the ONLY light source
- Check if emissive materials are configured properly

---

### 6. Browser-Specific Issues

#### Chrome/Edge
- **Best Performance**
- If issues: Disable hardware acceleration
  - Settings → System → Uncheck "Use hardware acceleration"

#### Firefox
- May have slight performance differences
- Enable WebGL: `about:config` → search "webgl" → enable all

#### Safari
- Limited WebGL 2.0 support
- May need to enable experimental features
  - Develop → Experimental Features → WebGL 2.0

---

### 7. Developer Console Issues

#### Symptom: Settings don't apply

**Solution**:
1. Click "Apply Settings" button
2. Check browser console for errors
3. Some settings require page reload

#### Symptom: Can't enter values

**Solution**:
- Click inside the input field
- Settings might be active in background
- Close and reopen console

---

### 8. Module Loading Errors

#### Symptom: "Uncaught SyntaxError: Cannot use import statement outside a module"

**Cause**: Incorrect script tag in HTML

**Solution**: Verify `index.html` has:
```html
<script type="module" src="js/main.js"></script>
```
NOT:
```html
<script src="js/main.js"></script>  <!-- Wrong! -->
```

---

### 9. CORS Errors

#### Symptom: "Cross-Origin Request Blocked" or "CORS policy"

**Cause**: Opening files directly (file://) instead of via server

**Solution**:
1. MUST use a local web server
2. Run: `python -m http.server 8000`
3. Access: `http://localhost:8000`

**Alternative**: Configure browser to disable CORS (NOT recommended for security)

---

### 10. WebGL Context Lost

#### Symptom: "WebGL context lost" error

**Causes**:
- GPU driver crash
- Too many WebGL contexts
- Browser tab suspended

**Solutions**:
1. Reload the page
2. Close other WebGL applications/tabs
3. Update graphics drivers
4. Reduce graphics quality

**Prevention**:
- Don't open multiple instances
- Close unused tabs
- Keep graphics drivers updated

---

## Debug Checklist

When reporting issues or debugging:

1. ✅ Browser and version
2. ✅ Operating system
3. ✅ Graphics card
4. ✅ Console errors (F12)
5. ✅ FPS and frame time (T key)
6. ✅ Physics settings (/ key)
7. ✅ Any config modifications

---

## Performance Benchmarks

**Expected Performance**:

| Fidelity | Min FPS | Target FPS | Hardware |
|----------|---------|------------|----------|
| Low      | 45      | 60         | Integrated GPU |
| Medium   | 30      | 60         | Mid-range GPU (GTX 1050) |
| Ultra    | 30      | 60         | High-end GPU (RTX 2060+) |

**If below expectations**:
- Check background processes
- Monitor GPU usage (Task Manager)
- Reduce shadow map size
- Disable star field

---

## Emergency Reset

If simulation is completely broken:

1. **Reset Config**:
   - Delete browser cache
   - Re-download `Config.js` from backup
   - Reload page

2. **Nuclear Option**:
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

3. **Fresh Start**:
   - Download project again
   - Don't modify files initially
   - Test first, then customize

---

## Getting Help

**Before asking for help**:
1. Check this troubleshooting guide
2. Read README.md
3. Check browser console (F12)
4. Try default configuration

**When asking for help, provide**:
- Browser console errors (screenshot)
- Config.js modifications (if any)
- System specs (GPU, RAM)
- Steps to reproduce

---

## Known Limitations

1. **N-Body Chaos**: With >10 bodies, orbits may become chaotic (this is realistic!)
2. **Collision Detection**: Planet-planet collisions not fully implemented
3. **Relativity**: No relativistic effects (speeds << c)
4. **Tidal Forces**: Not simulated
5. **Mobile**: Not optimized for touch controls

---

**Most issues are solved by**:
1. Using a local web server
2. Checking browser console
3. Reducing graphics quality
4. Verifying configuration values

Happy debugging! 🔧
