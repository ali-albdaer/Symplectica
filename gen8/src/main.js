/**
 * main.js
 * Application entry point.
 * Initializes the game and handles top-level error catching.
 */

import { Game } from './core/Game.js';
import { DebugLogger, loggerSystem, LogLevel } from './utils/DebugLogger.js';

const logger = new DebugLogger('Main');

// Set log level based on URL params (for debugging)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('debug')) {
    loggerSystem.setLevel(LogLevel.DEBUG);
    logger.info('Debug mode enabled');
}

// Global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
    logger.error(`Unhandled error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
    });
    
    // Show error on screen if game hasn't loaded
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.style.display !== 'none') {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 50, 50, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            text-align: center;
            z-index: 100001;
        `;
        errorDiv.innerHTML = `
            <h3>Error Loading Game</h3>
            <p>${event.message}</p>
            <p style="font-size: 12px; color: #ffcccc">${event.filename}:${event.lineno}</p>
            <button onclick="location.reload()" style="
                margin-top: 10px;
                padding: 8px 20px;
                background: white;
                color: #ff3333;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Reload</button>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    logger.error(`Unhandled promise rejection: ${event.reason}`, event);
});

// Main initialization
async function main() {
    logger.info('=================================');
    logger.info('  Solar System Simulator v1.0');
    logger.info('=================================');
    logger.info('Starting application...');
    
    try {
        // Check WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
            throw new Error('WebGL is not supported in this browser. Please use a modern browser with WebGL support.');
        }
        
        logger.info('WebGL support confirmed');
        
        // Create and initialize game
        const game = new Game();
        
        // Make game accessible for debugging
        window.game = game;
        window.logger = loggerSystem;
        
        // Initialize the game
        await game.init();
        
        logger.info('Application started successfully!');
        
        // Log helpful info
        console.log('%c Solar System Simulator ', 'background: #4a9eff; color: white; padding: 5px 10px; font-size: 14px; border-radius: 4px;');
        console.log('%c Controls:', 'font-weight: bold; margin-top: 10px;');
        console.log('  WASD - Move');
        console.log('  Mouse - Look around');
        console.log('  Space - Jump / Fly up');
        console.log('  Shift - Run / Fly down');
        console.log('  INS - Toggle free flight');
        console.log('  V - Toggle first/third person');
        console.log('  [ ] - Adjust time scale');
        console.log('  P - Pause');
        console.log('  / - Developer menu');
        console.log('  F3 - Debug overlay');
        console.log('  F4 - Show logs');
        console.log('%c Debug:', 'font-weight: bold; margin-top: 10px;');
        console.log('  window.game - Game instance');
        console.log('  window.logger - Log system');
        
    } catch (error) {
        logger.error('Failed to start application', error);
        
        // Show error to user
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #0a0a1a;
                color: white;
                font-family: 'Segoe UI', sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <h1 style="color: #ff6666;">Failed to Start</h1>
                <p style="max-width: 500px; color: #aaa;">${error.message}</p>
                <pre style="
                    background: #1a1a2a;
                    padding: 15px;
                    border-radius: 8px;
                    font-size: 12px;
                    max-width: 600px;
                    overflow: auto;
                    color: #888;
                    margin: 20px 0;
                ">${error.stack || ''}</pre>
                <button onclick="location.reload()" style="
                    padding: 10px 30px;
                    background: #4a9eff;
                    border: none;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                ">Try Again</button>
            </div>
        `;
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
