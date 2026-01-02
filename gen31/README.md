# Solar System Simulation (Web, No Build)

Fully client-side Three.js solar system sandbox with n-body gravity, player controls, dev console, and telemetry. Host with `python -m http.server` from the project root and open the served URL.

## Features
- Symplectic (leapfrog) n-body integration for star, 2 planets, 1 moon, player, and props.
- Default parameters produce circular, non-decaying orbits; tangential speeds derived from $v = \sqrt{GM/r}$.
- Player: walk + jump on planetary surfaces, free-flight toggle, first/third-person cameras, grab/release props.
- Visuals: single sun directional light with shadows (fidelity presets), emissive starfield, per-body emissive materials, optional LOD.
- UI: HUD, telemetry overlay (FPS/frame time/coords), debug log overlay, pause menu with fidelity selector, dev console (`/`) for live tuning (time scale, integrator, masses/radii, etc.). Pointer lock auto-handles menus.
- Expandable architecture: bodies defined in `src/config.js`; add new special entities by extending body descriptors.

## Controls
- Click viewport to lock pointer.
- Movement: `WASD`, `Space` to jump, `Shift` to descend (flight), `F` toggle walk/flight.
- Camera: mouse look, `V` toggle first/third person.
- Interaction: right-click to grab/release nearest prop.
- UI: `/` dev console, `Esc` pause menu, `Fidelity` dropdown in menu.
- Overlays: crosshair hides when menus are open; debug log shows errors instead of hanging silently.

## Files
- `index.html` — entry point, overlays, import map for CDN modules.
- `src/config.js` — all tunable constants and default system layout.
- `src/main.js` — bootstrap, loop, player control, grabbing, fidelity switching.
- `src/physics.js` — body model, gravity, leapfrog integrator, helpers.
- `src/entities.js` — seed bodies/interactables, mesh creation, orbit initialization.
- `src/renderer.js` — renderer/camera/scene/starfield/light utilities.
- `src/input.js` — key/mouse/pointer-lock handling.
- `src/ui.js` — HUD, telemetry, debug log, dev console wiring, global error hooks.

## Notes
- No build tools or npm are required. Only CDN imports are used.
- Shadows and bloom depend on the selected fidelity preset. Default: Medium (shadows on, LOD off).
- Star is the sole light source; other luminous objects use emissive materials only.
- To tweak physics live, open the dev console and adjust time scale, integrator `dt`, drag, masses, and radii. Reset by refreshing.
