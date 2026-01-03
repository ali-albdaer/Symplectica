# Solar System Simulation (Three.js + Cannon.js)

A browser-ready prototype of a scalable solar system sandbox that runs entirely from static files. It uses Three.js (ESM via CDN) for rendering and Cannon-es for physics, so no bundlers or npm installs are required.

## Getting Started

1. Serve the folder through any static file server (or open `index.html` directly if your browser allows pointer lock from file URLs).
2. The app auto-loads CDN versions of Three.js and Cannon-es.
3. Click the canvas to enable pointer lock and begin controlling the player.

## Controls

- **Pointer Lock**: Click canvas to capture cursor; press `Esc` to release.
- **Movement (Walk)**: `WASD` moves relative to camera heading; `Space` jumps when grounded.
- **Free Flight**: Press `F` to toggle; `Space` ascends, `Shift` descends, `WASD` for directional thrust.
- **Camera Modes**: Press `V` to toggle First-Person vs Cinematic Third-Person (smooth lerp/slerp transitions).
- **Grab Objects**: Right-click to pick up/drop nearby interactive bodies adhering to physics.
- **Telemetry Overlay**: `T` toggles FPS / frame time / world coordinates.
- **Fidelity Levels**: `1`, `2`, `3` switch between Low, Medium, Ultra presets.
- **Frustum Culling**: `O` toggles culling (defaults to off).
- **Developer Console**: Press `/` to open live config editor (pointer lock releases automatically).

## Key Systems

- **Config-Centric State**: All physical constants live in `src/Config.js` (masses, orbital speeds, densities, fidelity profiles, player physics, optimization flags, special-entity slots). Dev Console edits propagate through an `EventBus`, triggering a loseless rebuild of the physics world and meshes.
- **Physics**: `PhysicsEngine` wraps Cannon-es with deterministic N-body gravity (player, micro-objects, celestial bodies). Runtime additions go through `addSpecialBody`, so extending the sandbox (e.g., black holes) never touches the core loop.
- **Rendering**: Single `PointLight` emitted by the star drives all lighting and soft shadows; the star uses a lightweight GPU shader for emissive pulsation. Fidelity presets manage pixel ratio, shadow map size, and optional LOD.
- **Player & Camera**: `PlayerController` handles dual-mode locomotion, gravity-aware up-vector alignment, jump impulses, and object grabbing. `CameraRig` lerps/slerps between POVs and keeps the camera up-vector synced to local gravity. A lightweight capsule avatar is shown only in third-person to receive shadows.
- **UI & Debug**: Pointer-lock manager, telemetry overlay, configurable Dev Console, and on-screen debug log (auto-revealed on errors) keep the experience debuggable without browser devtools.

## Extensibility

- **Special Entities**: `SpecialEntityRegistry` lets you register factories (e.g., black holes with Schwarzschild radius logic, volumetric telescopes). Populate `CONFIG.specialEntities` with definitions to spawn them without touching the render/physics loop.
- **Fidelity Hooks**: Subscribe to `fidelity:changed` on the `EventBus` to adjust shaders, particle budgets, or streaming assets per tier.
- **Live Tweaks**: The Dev Console emits `config:*` events, so custom systems can hot-reload when masses, scales, or orbit speeds shift.

## Files of Interest

- `index.html` – Entry point, overlays, and canvas styling.
- `src/main.js` – Bootstraps renderer, physics, entities, controls, and UI hooks.
- `src/physics/PhysicsEngine.js` – Deterministic N-body gravity + runtime special body injection.
- `src/player/PlayerController.js` & `src/player/CameraRig.js` – Dual-mode locomotion, grabbing, and cinematic camera blend.
- `src/ui/DevConsole.js` / `TelemetryOverlay.js` / `PointerLockManager.js` – Live tuning, metrics, and cursor logic.
- `src/entities/*.js` – Celestial bodies (with GPU-lit star), interactive props, special-entity registry.

## Deployment Notes

- No build step required. Keep CDN URLs online or mirror them locally if deploying to an offline environment.
- For best pointer-lock behavior, host via `http://`/`https://` (e.g., `npx serve` or VS Code Live Server).
- Customize materials, add PBR textures, or hook in post-processing pipelines as needed—the architecture leaves room for growth without rewriting the loop.
