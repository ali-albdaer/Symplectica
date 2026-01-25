# Solar System Simulation

A web-based 3D solar system simulation with realistic physics.

## How to Run

Since this project uses ES Modules, you cannot run it directly from the file system (file:// protocol). You must use a local web server.

### Using Python (Recommended)

1. Open a terminal in this folder.
2. Run the following command:
   ```bash
   python -m http.server
   ```
3. Open your browser and go to `http://localhost:8000`.

## Controls

- **WASD**: Move
- **SPACE**: Jump (Walking) / Up (Flying)
- **SHIFT**: Run (Walking) / Down (Flying)
- **F**: Toggle Free Flight Mode
- **V**: Toggle Camera (1st/3rd Person)
- **/**: Toggle Developer Menu
- **Mouse**: Look around

## Features

- Realistic N-Body Physics (Verlet Integration)
- Seamless Planet-to-Space transition
- Dynamic Lighting and Shadows
- Developer Console for real-time tweaking
