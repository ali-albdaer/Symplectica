# Solar System Sim (Three.js + Cannon) — CDN-only

## Requirements met
- No Node / no NPM: Three.js, cannon-es, and lil-gui are loaded via CDN (ES modules).
- Centralized constants: all tunables live in `src/Config.js`.
- N-body gravity: every celestial body attracts every other; stable defaults for 1 Sun + 2 Planets + 1 Moon.
- Player modes: Walking + gravity alignment near planets; Free-flight toggled with `F`.
- Interaction: right-click grab with a physics constraint.
- Camera: smooth First-Person ↔ Cinematic Third-Person.
- Lighting: Sun is the only `PointLight`; shadows enabled.
- UI: `/` toggles dev GUI; `T` telemetry; debug log overlay captures errors.

## Run locally
ES module imports require serving via HTTP (not `file://`).

Option A (Python):
- `python -m http.server 8080`
- Open `http://localhost:8080/`

Option B (VS Code): use a simple static server extension.

## Controls
- Click: pointer lock
- `WASD`: move
- `Space`: jump (walking) / up (flight)
- `Shift`: down (flight)
- `F`: toggle flight
- Right mouse: grab / release
- `/`: toggle dev console (lil-gui)
- `T`: toggle telemetry

## Notes on scale
This sim uses "game units" (not real AU/kg) for stability. You can change masses/distances/G in `src/Config.js` live.
