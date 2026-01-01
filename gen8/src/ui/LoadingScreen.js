/**
 * LoadingScreen.js
 * Display loading progress and prevent stuck loading screens.
 * Uses existing HTML elements from index.html
 */

import { loadingTracker } from '../utils/DebugLogger.js';

export class LoadingScreen {
    constructor() {
        // Use existing HTML elements or create new ones
        this.container = document.getElementById('loading-screen') || 
                        document.getElementById('initial-loading');
        
        // If no loading screen exists, create one
        if (!this.container) {
            this.createUI();
        } else {
            // Transform the initial loading into a full loading screen
            this.transformExistingUI();
        }
        
        this.setupTracker();
    }

    transformExistingUI() {
        // Update the existing initial-loading to be a proper loading screen
        this.container.id = 'loading-screen';
        this.container.innerHTML = `
            <h1 style="font-size: 48px; font-weight: 300; margin-bottom: 10px; color: #4a9eff; text-shadow: 0 0 30px rgba(74, 158, 255, 0.5);">
                🌌 Solar System Simulator
            </h1>
            <p style="font-size: 16px; color: #888; margin-bottom: 40px;">
                Initializing the cosmos...
            </p>
            <div style="width: 400px; height: 4px; background: #333; border-radius: 2px; overflow: hidden; margin-bottom: 20px;">
                <div id="loading-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4a9eff, #00ff88); transition: width 0.3s ease;"></div>
            </div>
            <p id="loading-status" style="font-size: 14px; color: #666;">Preparing...</p>
            <div id="loading-error" style="margin-top: 30px; padding: 15px 25px; background: rgba(255, 50, 50, 0.2); border: 1px solid #ff4444; border-radius: 8px; display: none; max-width: 500px; text-align: center;"></div>
            <div style="position: absolute; bottom: 40px; color: #555; font-size: 13px;">
                <p>💡 Tip: Press <span style="color: #4a9eff">F3</span> for debug info, <span style="color: #4a9eff">/</span> for developer menu</p>
            </div>
        `;
        
        this.progressBar = document.getElementById('loading-progress');
        this.statusText = document.getElementById('loading-status');
        this.errorContainer = document.getElementById('loading-error');
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'loading-screen';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 100000;
            color: #fff;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        this.container.innerHTML = `
            <h1 style="font-size: 48px; font-weight: 300; margin-bottom: 10px; color: #4a9eff; text-shadow: 0 0 30px rgba(74, 158, 255, 0.5);">
                🌌 Solar System Simulator
            </h1>
            <p style="font-size: 16px; color: #888; margin-bottom: 40px;">
                Initializing the cosmos...
            </p>
            <div style="width: 400px; height: 4px; background: #333; border-radius: 2px; overflow: hidden; margin-bottom: 20px;">
                <div id="loading-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4a9eff, #00ff88); transition: width 0.3s ease;"></div>
            </div>
            <p id="loading-status" style="font-size: 14px; color: #666;">Preparing...</p>
            <div id="loading-error" style="margin-top: 30px; padding: 15px 25px; background: rgba(255, 50, 50, 0.2); border: 1px solid #ff4444; border-radius: 8px; display: none; max-width: 500px; text-align: center;"></div>
            <div style="position: absolute; bottom: 40px; color: #555; font-size: 13px;">
                <p>💡 Tip: Press <span style="color: #4a9eff">F3</span> for debug info, <span style="color: #4a9eff">/</span> for developer menu</p>
            </div>
        `;
        
        document.body.appendChild(this.container);
        
        this.progressBar = document.getElementById('loading-progress');
        this.statusText = document.getElementById('loading-status');
        this.errorContainer = document.getElementById('loading-error');
    }

    setupTracker() {
        loadingTracker.onProgress = (completed, total, currentTask) => {
            const percent = total > 0 ? (completed / total) * 100 : 0;
            if (this.progressBar) this.progressBar.style.width = `${percent}%`;
            if (this.statusText) this.statusText.textContent = currentTask || 'Loading...';
        };
        
        loadingTracker.onError = (taskId, error) => {
            this.showError(error);
        };
        
        loadingTracker.onComplete = () => {
            this.hide();
        };
    }

    show() {
        if (this.container) this.container.style.display = 'flex';
    }

    hide() {
        if (!this.container) return;
        
        this.container.style.opacity = '1';
        this.container.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            this.container.style.opacity = '0';
            setTimeout(() => {
                this.container.style.display = 'none';
            }, 500);
        }, 300);
    }

    showError(message) {
        if (!this.errorContainer) return;
        
        this.errorContainer.style.display = 'block';
        this.errorContainer.innerHTML = `
            <p style="color: #ff6666; margin: 0 0 10px 0;">❌ Error Loading</p>
            <p style="color: #aaa; margin: 0; font-size: 13px;">${message}</p>
            <button onclick="location.reload()" style="
                margin-top: 15px;
                padding: 8px 20px;
                background: #4a9eff;
                border: none;
                color: white;
                border-radius: 4px;
                cursor: pointer;
            ">Retry</button>
        `;
    }

    setStatus(text) {
        if (this.statusText) this.statusText.textContent = text;
    }

    setProgress(percent) {
        if (this.progressBar) this.progressBar.style.width = `${percent}%`;
    }
}
