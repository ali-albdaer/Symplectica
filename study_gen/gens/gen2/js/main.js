// js/main.js

import * as THREE from 'three';
import { initScene, animate, setViewMode, showError } from './render.js';
import { setupUI } from './ui.js';
import { PhysicsEngine } from './physics.js';

// Make THREE globally available for UI
window.THREE = THREE;

let physics;

window.addEventListener('DOMContentLoaded', () => {
    try {
        physics = new PhysicsEngine();
        initScene(physics);
        setupUI({
            onViewSwitch: setViewMode,
            onError: showError,
            physics
        });
        animate();
    } catch (e) {
        showError(e.message || 'Unknown error during initialization.');
    }
});
