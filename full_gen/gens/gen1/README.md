# Solar System Simulator

A 3D solar system simulation with realistic physics and player exploration.

## Features
- **N-Body Physics**: All celestial bodies interact with each other using Newton's law of universal gravitation.
- **Player Controller**: First-person and Third-person views, walking on planets, and free flight mode.
- **Interactive Objects**: Physics-enabled boxes to interact with.
- **Developer Tools**: Real-time adjustment of physics and graphics settings.

## Controls
- **WASD**: Move
- **SPACE**: Jump (or Up in Flight Mode)
- **SHIFT**: Down (in Flight Mode)
- **MOUSE**: Look around
- **INS**: Toggle Free Flight Mode
- **V**: Switch Camera View (First/Third Person)
- **/**: Toggle Developer Menu

## How to Run
1. Open this folder in VS Code.
2. Use a local server extension (like "Live Server") to serve the `index.html` file.
   - Or run `npx serve` in the terminal if you have Node.js installed.
3. Open the browser to the local server URL.

## Configuration
Global variables can be found in `src/config.js`.
