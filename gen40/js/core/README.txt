Core module for main loop, configuration, and global state.

Files:
- config.js: central configuration and physical constants.
- state.js: global runtime references.
- main.js: entry point, bootstraps rendering, physics, entities, UI.

Three.js is loaded globally in index.html; modules assume `THREE` is available.
