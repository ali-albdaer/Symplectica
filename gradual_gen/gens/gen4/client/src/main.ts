/**
 * Client entry point. Initializes renderer, networking, and UI.
 */

import { App } from './app.js';

const app = new App();
app.init().then(() => {
  console.log('Solar System Simulation initialized');
});
