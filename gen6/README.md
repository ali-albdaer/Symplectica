# Solar System Sim (gen6) — no npm

This project is a **zero-build** web app (no Node/npm). It uses **ES modules** in the browser and loads Three.js via an **import map**.

## Run locally (recommended)
Browsers block module imports from `file://`, so run a simple local server.

### Option A: Python
From the project folder:

```powershell
python -m http.server 5173
```

Then open:

- http://localhost:5173/

### Option B: .NET
```powershell
dotnet tool install --global dotnet-serve

dotnet serve --port 5173
```

## Controls
- Click the canvas to lock mouse.
- `WASD` move
- Mouse look
- `Space` jump / move up in free-flight
- `Shift` (hold) go down in free-flight
- `INS` toggle free-flight
- `/` toggle developer menu
- `P` toggle performance metrics
- `C` toggle coordinates readout
- `V` toggle 1st/3rd person camera

## Goal
- Accurate-ish, stable **N-body gravity** with a symplectic integrator by default.
- Expandable code: new bodies and features are intended to plug in cleanly.

