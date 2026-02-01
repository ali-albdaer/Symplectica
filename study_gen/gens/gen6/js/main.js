import { StateManager } from './state/StateManager.js';
import { PhysicsEngine } from './physics/PhysicsEngine.js';
import { RenderEngine } from './render/RenderEngine.js';
import { InputManager } from './input/InputManager.js';
import { UIManager } from './ui/UIManager.js';
import { PRESETS } from './data/Presets.js';

// Initialization
const stateManager = new StateManager();
const physicsEngine = new PhysicsEngine();
const renderEngine = new RenderEngine(document.getElementById('canvas-container'));
const uiManager = new UIManager(stateManager, physicsEngine, null); // Pass InputManager later or decouple
const inputManager = new InputManager(renderEngine, stateManager, uiManager);
uiManager.inputManager = inputManager; // Link back

// Default Load
PRESETS.solar_system.forEach(b => stateManager.addBody(b));

// Game Loop
let lastTime = performance.now();
let physicsAccumulator = 0;
const PHYSICS_DT = 100; // Fixed physical timestep (s) - Adjust via UI later probably?
// NOTE: Space sims often need large DT. 100s is actually small for planets (years orbit).

let isPaused = false;
let timeScale = 1;

stateManager.on('toggle-pause', () => { isPaused = !isPaused; });

function loop(now) {
    requestAnimationFrame(loop);
    
    // Time delta in SECONDS
    const browserDt = (now - lastTime) / 1000;
    lastTime = now;

    // UI Input Handling
    const timeScaleInput = parseFloat(document.getElementById('time-scale').value);
    timeScale = timeScaleInput || 1;

    // Physics
    if (!isPaused) {
        // Run physics steps
        // Allow multiple steps per frame if timeScale is high?
        // Or just scale dt passed to step?
        // For stability, we should keep 'step dt' constant and do iterations.
        
        let simTimeThisFrame = browserDt * timeScale;
        
        // Clamp max simulated time per frame to prevent freezing
        if (simTimeThisFrame > 0.5) simTimeThisFrame = 0.5;

        physicsAccumulator += simTimeThisFrame;

        // Simple sub-stepping
        const MAX_STEPS = 20;
        let steps = 0;
        
        // We use a flexible DT strategy here for the demo, but ideally Fixed DT
        // Let's use the timeScale directly with a max per step cap
        const DT_PER_STEP = 10000; // 1000s step
        
        while (physicsAccumulator > 0 && steps < MAX_STEPS) {
             let stepDt = physicsAccumulator;
             // If accumulated is huge, break it down?
             // For sympletic integrators, constant step is better for energy preservation.
             // But for real-time adjustable speed, we often just pass the float DT.
             // Let's just pass `stepDt` but broken into reasonable chunks if it's huge.
             
             physicsEngine.step(stateManager, stepDt);
             physicsAccumulator -= stepDt;
             steps++;
        }
    }

    // Input Update
    inputManager.update(browserDt);

    // Render
    renderEngine.render(stateManager);

    // Diagnostics
    const diag = physicsEngine.getDiagnostics(stateManager.bodies);
    uiManager.update(browserDt, diag);
}

// Start
requestAnimationFrame(loop);