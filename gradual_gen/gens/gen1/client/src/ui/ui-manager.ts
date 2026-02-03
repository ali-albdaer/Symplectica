/**
 * UI Manager
 * 
 * Handles all DOM-based UI elements
 * 
 * @module ui
 */

import type { SerializedBody, SerializedPlayer } from '@nbody/shared';
import { AU } from '@nbody/shared';

type ModalName = 'connect' | 'spawn' | 'controls';

export interface UICallbacks {
  onConnect: (name: string, serverUrl: string) => Promise<void>;
  onSpawnSelect: (bodyId: string) => void;
  onChatSend: (text: string) => void;
}

export class UIManager {
  private callbacks: UICallbacks;
  
  // Modal elements
  private connectModal: HTMLElement;
  private spawnModal: HTMLElement;
  private controlsModal: HTMLElement;
  private hud: HTMLElement;
  
  // Input elements
  private playerNameInput: HTMLInputElement;
  private serverUrlInput: HTMLInputElement;
  private connectBtn: HTMLButtonElement;
  private connectError: HTMLElement;
  private startBtn: HTMLButtonElement;
  
  // HUD elements
  private positionValue: HTMLElement;
  private velocityValue: HTMLElement;
  private currentBody: HTMLElement;
  private fpsValue: HTMLElement;
  private pingValue: HTMLElement;
  private tickValue: HTMLElement;
  private simTime: HTMLElement;
  
  // Chat elements
  private chatMessages: HTMLElement;
  private chatInput: HTMLInputElement;
  private chatContainer: HTMLElement;
  
  // State
  private chatVisible: boolean = false;
  private chatTimeout: number | null = null;
  private selectedSpawnBody: string | null = null;
  
  constructor(callbacks: UICallbacks) {
    this.callbacks = callbacks;
    
    // Get elements
    this.connectModal = document.getElementById('connect-modal')!;
    this.spawnModal = document.getElementById('spawn-modal')!;
    this.controlsModal = document.getElementById('controls-modal')!;
    this.hud = document.getElementById('hud')!;
    
    this.playerNameInput = document.getElementById('player-name') as HTMLInputElement;
    this.serverUrlInput = document.getElementById('server-url') as HTMLInputElement;
    this.connectBtn = document.getElementById('connect-btn') as HTMLButtonElement;
    this.connectError = document.getElementById('connect-error')!;
    this.startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    
    this.positionValue = document.getElementById('position-value')!;
    this.velocityValue = document.getElementById('velocity-value')!;
    this.currentBody = document.getElementById('current-body')!;
    this.fpsValue = document.getElementById('fps-value')!;
    this.pingValue = document.getElementById('ping-value')!;
    this.tickValue = document.getElementById('tick-value')!;
    this.simTime = document.getElementById('sim-time')!;
    
    this.chatMessages = document.getElementById('chat-messages')!;
    this.chatInput = document.getElementById('chat-input') as HTMLInputElement;
    this.chatContainer = document.getElementById('chat-container')!;
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Connect button
    this.connectBtn.addEventListener('click', () => this.handleConnect());
    this.playerNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleConnect();
    });
    
    // Start button
    this.startBtn.addEventListener('click', () => {
      if (this.selectedSpawnBody) {
        this.callbacks.onSpawnSelect(this.selectedSpawnBody);
        this.showModal(null);
        this.showHUD(true);
      }
    });
    
    // Chat input
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = this.chatInput.value.trim();
        if (text) {
          this.callbacks.onChatSend(text);
          this.chatInput.value = '';
        }
        this.closeChatInput();
      }
    });
    
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeChatInput();
      }
    });
  }
  
  private async handleConnect(): Promise<void> {
    const name = this.playerNameInput.value.trim();
    const serverUrl = this.serverUrlInput.value.trim();
    
    if (!name) {
      this.connectError.textContent = 'Please enter your name';
      return;
    }
    
    if (!serverUrl) {
      this.connectError.textContent = 'Please enter server URL';
      return;
    }
    
    this.connectBtn.disabled = true;
    this.connectBtn.textContent = 'Connecting...';
    this.connectError.textContent = '';
    
    try {
      await this.callbacks.onConnect(name, serverUrl);
    } catch (error) {
      this.connectError.textContent = error instanceof Error ? error.message : 'Connection failed';
      this.connectBtn.disabled = false;
      this.connectBtn.textContent = 'Connect';
    }
  }
  
  /**
   * Show a modal
   */
  showModal(modal: ModalName | null): void {
    this.connectModal.classList.add('hidden');
    this.spawnModal.classList.add('hidden');
    this.controlsModal.classList.add('hidden');
    
    switch (modal) {
      case 'connect':
        this.connectModal.classList.remove('hidden');
        break;
      case 'spawn':
        this.spawnModal.classList.remove('hidden');
        break;
      case 'controls':
        this.controlsModal.classList.remove('hidden');
        break;
    }
  }
  
  /**
   * Show/hide HUD
   */
  showHUD(visible: boolean): void {
    if (visible) {
      this.hud.classList.remove('hidden');
    } else {
      this.hud.classList.add('hidden');
    }
  }
  
  /**
   * Populate spawn location grid
   */
  populateSpawnGrid(bodies: SerializedBody[]): void {
    const grid = document.getElementById('planet-grid')!;
    grid.innerHTML = '';
    
    // Filter to spawnable bodies (planets and moons)
    const spawnableBodies = bodies.filter(b => 
      b.celestialType === 'planet' || 
      b.celestialType === 'moon' ||
      b.celestialType === 'dwarf-planet'
    );
    
    for (const body of spawnableBodies) {
      const card = document.createElement('div');
      card.className = 'planet-card';
      card.dataset.bodyId = body.id;
      
      // Calculate distance from sun (first body assumed to be sun)
      const sun = bodies.find(b => b.celestialType === 'star');
      let distance = 0;
      if (sun) {
        const dx = body.position[0] - sun.position[0];
        const dy = body.position[1] - sun.position[1];
        const dz = body.position[2] - sun.position[2];
        distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      }
      
      card.innerHTML = `
        <div class="planet-preview" style="background: ${this.getBodyGradient(body.name)}"></div>
        <div class="planet-name">${body.name}</div>
        <div class="planet-info">
          R: ${this.formatDistance(body.radius)}<br>
          D: ${(distance / AU).toFixed(2)} AU
        </div>
      `;
      
      card.addEventListener('click', () => {
        // Deselect others
        grid.querySelectorAll('.planet-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedSpawnBody = body.id;
      });
      
      grid.appendChild(card);
    }
    
    // Auto-select Earth if available
    const earth = spawnableBodies.find(b => b.name === 'Earth');
    if (earth) {
      this.selectedSpawnBody = earth.id;
      grid.querySelector(`[data-body-id="${earth.id}"]`)?.classList.add('selected');
    } else if (spawnableBodies.length > 0) {
      this.selectedSpawnBody = spawnableBodies[0]!.id;
      grid.querySelector('.planet-card')?.classList.add('selected');
    }
  }
  
  /**
   * Get gradient for known bodies
   */
  private getBodyGradient(name: string): string {
    const gradients: Record<string, string> = {
      'Mercury': 'radial-gradient(circle at 30% 30%, #c0b0a0, #4a4035)',
      'Venus': 'radial-gradient(circle at 30% 30%, #f0d080, #8a6030)',
      'Earth': 'radial-gradient(circle at 30% 30%, #6a8cff, #1a2a4a)',
      'Moon': 'radial-gradient(circle at 30% 30%, #b0b0b0, #404040)',
      'Mars': 'radial-gradient(circle at 30% 30%, #e07040, #802010)',
      'Jupiter': 'radial-gradient(circle at 30% 30%, #e0c090, #906040)',
      'Saturn': 'radial-gradient(circle at 30% 30%, #f0e0b0, #a08050)',
      'Uranus': 'radial-gradient(circle at 30% 30%, #a0e0e0, #406070)',
      'Neptune': 'radial-gradient(circle at 30% 30%, #5060f0, #202060)',
      'Pluto': 'radial-gradient(circle at 30% 30%, #d0c0b0, #504030)'
    };
    return gradients[name] ?? 'radial-gradient(circle at 30% 30%, #808080, #404040)';
  }
  
  /**
   * Format distance for display
   */
  private formatDistance(meters: number): string {
    if (meters >= 1e9) {
      return `${(meters / 1e9).toFixed(1)}k km`;
    } else if (meters >= 1e6) {
      return `${(meters / 1e6).toFixed(1)} Mm`;
    } else if (meters >= 1e3) {
      return `${(meters / 1e3).toFixed(1)} km`;
    } else {
      return `${meters.toFixed(1)} m`;
    }
  }
  
  /**
   * Update HUD values
   */
  updateHUD(data: {
    position?: [number, number, number];
    velocity?: number;
    bodyName?: string;
    fps?: number;
    ping?: number;
    tick?: number;
    julianDate?: number;
  }): void {
    if (data.position) {
      this.positionValue.textContent = 
        `${(data.position[0] / 1e6).toFixed(1)}, ${(data.position[1] / 1e6).toFixed(1)}, ${(data.position[2] / 1e6).toFixed(1)} Mm`;
    }
    
    if (data.velocity !== undefined) {
      this.velocityValue.textContent = `${data.velocity.toFixed(1)} m/s`;
    }
    
    if (data.bodyName) {
      this.currentBody.textContent = data.bodyName;
    }
    
    if (data.fps !== undefined) {
      this.fpsValue.textContent = data.fps.toString();
    }
    
    if (data.ping !== undefined) {
      this.pingValue.textContent = `${data.ping} ms`;
    }
    
    if (data.tick !== undefined) {
      this.tickValue.textContent = data.tick.toString();
    }
    
    if (data.julianDate !== undefined) {
      // Convert Julian Date to readable format
      const jd = data.julianDate;
      const daysSinceJ2000 = jd - 2451545.0;
      this.simTime.textContent = `J2000 + ${daysSinceJ2000.toFixed(2)}d`;
    }
  }
  
  /**
   * Add chat message
   */
  addChatMessage(sender: string | null, text: string, type: 'normal' | 'system' = 'normal', color?: string): void {
    const msg = document.createElement('div');
    msg.className = 'chat-message';
    
    if (type === 'system') {
      msg.classList.add('system');
      if (color === 'green') msg.classList.add('success');
      if (color === 'red') msg.classList.add('error');
      msg.textContent = text;
    } else {
      msg.innerHTML = `<span class="sender">${sender}:</span> ${this.escapeHtml(text)}`;
    }
    
    this.chatMessages.appendChild(msg);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    
    // Show chat container briefly
    this.showChat();
    
    // Fade out after delay
    this.resetChatTimeout();
  }
  
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Show chat
   */
  private showChat(): void {
    this.chatContainer.style.opacity = '1';
  }
  
  /**
   * Reset chat fade timeout
   */
  private resetChatTimeout(): void {
    if (this.chatTimeout) {
      clearTimeout(this.chatTimeout);
    }
    
    this.chatTimeout = window.setTimeout(() => {
      if (!this.chatVisible) {
        this.chatContainer.style.opacity = '0.3';
      }
    }, 15000);
  }
  
  /**
   * Open chat input
   */
  openChatInput(): void {
    this.chatVisible = true;
    this.chatInput.classList.remove('hidden');
    this.chatInput.focus();
    this.showChat();
  }
  
  /**
   * Close chat input
   */
  closeChatInput(): void {
    this.chatVisible = false;
    this.chatInput.classList.add('hidden');
    this.chatInput.value = '';
    this.resetChatTimeout();
  }
  
  /**
   * Check if chat is open
   */
  isChatOpen(): boolean {
    return this.chatVisible;
  }
}
