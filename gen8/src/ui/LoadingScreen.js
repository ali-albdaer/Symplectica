/**
 * LoadingScreen.js
 * Display loading progress and prevent stuck loading screens.
 */

import { loadingTracker } from '../utils/DebugLogger.js';

export class LoadingScreen {
    constructor() {
        this.container = null;
        this.progressBar = null;
        this.statusText = null;
        this.errorContainer = null;
        
        this.createUI();
        this.setupTracker();
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
        
        // Title
        const title = document.createElement('h1');
        title.style.cssText = `
            font-size: 48px;
            font-weight: 300;
            margin-bottom: 10px;
            color: #4a9eff;
            text-shadow: 0 0 30px rgba(74, 158, 255, 0.5);
        `;
        title.textContent = '🌌 Solar System Simulator';
        this.container.appendChild(title);
        
        // Subtitle
        const subtitle = document.createElement('p');
        subtitle.style.cssText = `
            font-size: 16px;
            color: #888;
            margin-bottom: 40px;
        `;
        subtitle.textContent = 'Initializing the cosmos...';
        this.container.appendChild(subtitle);
        
        // Progress container
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 400px;
            height: 4px;
            background: #333;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 20px;
        `;
        
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #4a9eff, #00ff88);
            transition: width 0.3s ease;
        `;
        progressContainer.appendChild(this.progressBar);
        this.container.appendChild(progressContainer);
        
        // Status text
        this.statusText = document.createElement('p');
        this.statusText.style.cssText = `
            font-size: 14px;
            color: #666;
        `;
        this.statusText.textContent = 'Preparing...';
        this.container.appendChild(this.statusText);
        
        // Error container (hidden by default)
        this.errorContainer = document.createElement('div');
        this.errorContainer.style.cssText = `
            margin-top: 30px;
            padding: 15px 25px;
            background: rgba(255, 50, 50, 0.2);
            border: 1px solid #ff4444;
            border-radius: 8px;
            display: none;
            max-width: 500px;
            text-align: center;
        `;
        this.container.appendChild(this.errorContainer);
        
        // Tips
        const tips = document.createElement('div');
        tips.style.cssText = `
            position: absolute;
            bottom: 40px;
            color: #555;
            font-size: 13px;
        `;
        tips.innerHTML = `
            <p>💡 Tip: Press <span style="color: #4a9eff">F3</span> for debug info, <span style="color: #4a9eff">/</span> for developer menu</p>
        `;
        this.container.appendChild(tips);
        
        document.body.appendChild(this.container);
    }

    setupTracker() {
        loadingTracker.onProgress = (completed, total, currentTask) => {
            const percent = total > 0 ? (completed / total) * 100 : 0;
            this.progressBar.style.width = `${percent}%`;
            this.statusText.textContent = currentTask || 'Loading...';
        };
        
        loadingTracker.onError = (taskId, error) => {
            this.showError(error);
        };
        
        loadingTracker.onComplete = () => {
            this.hide();
        };
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
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
        this.statusText.textContent = text;
    }

    setProgress(percent) {
        this.progressBar.style.width = `${percent}%`;
    }
}
