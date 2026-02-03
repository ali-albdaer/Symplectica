/**
 * Client entry point
 */

import { Game } from './game';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();

    // Login handling
    const loginOverlay = document.getElementById('login-overlay')!;
    const playerNameInput = document.getElementById('player-name') as HTMLInputElement;
    const joinBtn = document.getElementById('join-btn')!;

    playerNameInput.focus();

    joinBtn.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (name.length > 0) {
            loginOverlay.style.display = 'none';
            game.start(name);
        }
    });

    playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            joinBtn.click();
        }
    });

    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });

    // Prevent right-click context menu on canvas
    document.addEventListener('contextmenu', (e) => {
        if ((e.target as HTMLElement).tagName === 'CANVAS') {
            e.preventDefault();
        }
    });
});
