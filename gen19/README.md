# Solar System Sim (Gen19)

Static web app (no Node/NPM) intended to be hosted via `python -m http.server`.

## Run

- `cd` into this folder
- `python -m http.server 8000`
- Open `http://localhost:8000/`

## Controls

- Click canvas: lock cursor
- WASD: move
- Space: jump (walking) / up (flight)
- Shift: down (flight)
- Mouse: look
- F: toggle free flight
- V: toggle first/third person
- Right mouse: grab/release nearest object
- /: developer menu (live config editor)
- T: telemetry overlay

## Notes

- Physics is fully N-body using a symplectic (leapfrog) integrator.
- Default initial conditions are computed from masses/distances for stable near-circular orbits.
- Errors are surfaced on-screen in the Debug Log overlay.
