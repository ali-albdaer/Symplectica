# Solar System Sim (Gen29)

No-build web app (no Node/NPM). Host with any static server (e.g. Python).

## Run

- From this folder:
  - `python -m http.server 8000`
- Open `http://localhost:8000/`

## Debuggability

- On-screen debug log captures `window.onerror`, `unhandledrejection`, and `console.error`.
- Telemetry overlay can show FPS, frame time, player coordinates, and total system energy.

## Controls

- Click: pointer lock
- WASD + mouse: move/look
- Space: jump (walk) / up (flight)
- Shift: down (flight)
- `F`: toggle free flight
- `V`: toggle first/third person
- `/`: toggle Dev Menu (live edits)
- `T`: toggle telemetry
- `L`: toggle debug log
- Right click: grab/release prop

## Notes on Physics

- Uses a symplectic Velocity Verlet integrator with fixed-step simulation.
- Orbits are not hardcoded; only initial tangential velocities are computed.
- Default system is tuned to be stable under the chosen game-scale constants.
