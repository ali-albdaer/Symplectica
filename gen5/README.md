# Solar System Simulation Gen5

A fully functional 3D solar system simulation with realistic physics, built with Three.js.

## Features
- **Realistic Physics**: N-body gravity simulation for celestial bodies.
- **Player Controller**: First/Third person view, jetpack/free-flight mode.
- **Expandable**: Modular architecture for adding new bodies and features.
- **Performance**: Adjustable graphics settings, logarithmic depth buffer for large scales.
- **Dev Tools**: Real-time variable editing and debug metrics.

## Controls
- **WASD**: Move
- **SPACE**: Jump (Ground) / Up (Free Flight)
- **SHIFT**: Down (Free Flight)
- **INS**: Toggle Free Flight Mode
- **V**: Toggle View (1st/3rd Person)
- **/**: Open Developer Menu
- **Mouse**: Look around (Click to capture cursor)

## How to Run
Since this project uses ES Modules, you need to run it via a local web server.

### Option 1: VS Code Live Server
1. Install the "Live Server" extension in VS Code.
2. Right-click `index.html` and select "Open with Live Server".

### Option 2: Python
1. Open a terminal in this folder.
2. Run: `python -m http.server`
3. Open `http://localhost:8000` in your browser.

### Option 3: Node.js
1. Run `npx serve`
2. Open the provided URL.
