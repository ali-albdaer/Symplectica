# Solar System Sim (Gen28)

Static web app (no Node/NPM). Uses ES modules + CDN imports.

## Run locally (Python)

From this folder:

```bash
python -m http.server 8000
```

Then open:

- http://localhost:8000/

## Controls

- Click: pointer lock (mouse look)
- WASD: move
- Space: jump (walk) / up (flight)
- Shift: down (flight)
- F: toggle free flight
- V: toggle first/third person
- `/`: toggle Dev Menu (live config editing)
- T: toggle telemetry (FPS + frame time + coordinates)
- Right-click: grab/release nearby props

## Project structure

- `index.html`: entry
- `styles.css`: overlay/UI styles
- `src/config.js`: all global variables (live-editable)
- `src/physics/nbody.js`: stable leapfrog N-body gravity integrator
- `src/game/*`: player/camera/grab/collisions/world building
- `src/ui/*`: telemetry + dev menu
- `src/util/debugLog.js`: on-screen debug log + global error hooks

## Notes on physics stability

- Celestial bodies are initialized with circular-orbit tangential velocities computed from $v=\sqrt{GM/r}$.
- The integrator is kick-drift-kick leapfrog for long-term stability.
- Moon orbit radius is chosen to be inside Planet 1’s Hill sphere for default stability.
