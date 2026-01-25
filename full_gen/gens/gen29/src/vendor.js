// CDN-backed dependencies (no Node/NPM build).
// Keep versions pinned for debuggability.
export { default as GUI } from 'https://unpkg.com/lil-gui@0.19.2/dist/lil-gui.esm.min.js';

// Resolved via importmap in `index.html`.
export * as THREE from 'three';
export { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
