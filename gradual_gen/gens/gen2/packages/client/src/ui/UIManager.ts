/**
 * UI Manager
 * ==========
 * Handles all UI elements and state transitions.
 */

import { CelestialBodyDefinition, BodyClass, formatDistance, formatMass } from '@space-sim/shared';

export type UIState = 'connecting' | 'spawn-select' | 'playing' | 'paused' | 'chat' | 'world-builder';

export interface UIElements {
  // Modals
  connectionModal: HTMLElement;
  spawnModal: HTMLElement;
  controlsModal: HTMLElement;
  pauseOverlay: HTMLElement;

  // Forms
  playerNameInput: HTMLInputElement;
  connectBtn: HTMLElement;
  planetGrid: HTMLElement;
  spawnBtn: HTMLElement;
  controlsOkBtn: HTMLElement;

  // HUD
  hud: HTMLElement;
  positionX: HTMLElement;
  positionY: HTMLElement;
  positionZ: HTMLElement;
  velocityMag: HTMLElement;
  altitudeValue: HTMLElement;
  nearestBody: HTMLElement;
  fpsValue: HTMLElement;
  latencyValue: HTMLElement;
  bodiesValue: HTMLElement;
  playersValue: HTMLElement;
  chatMessages: HTMLElement;
  chatInput: HTMLInputElement;

  // Mini-map
  minimap: HTMLCanvasElement;
}

export class UIManager {
  private elements: UIElements;
  private state: UIState = 'connecting';
  private selectedSpawnBody: string | null = null;

  // Bodies for spawn selection (used for validation)
  public getBodies(): CelestialBodyDefinition[] { return this.storedBodies; }
  private storedBodies: CelestialBodyDefinition[] = [];

  // Callbacks
  public onConnect?: (playerName: string) => void;
  public onSpawn?: (bodyId: string) => void;
  public onChat?: (message: string) => void;
  public onResume?: () => void;

  constructor() {
    this.elements = this.getElements();
    this.setupEventListeners();
  }

  private getElements(): UIElements {
    return {
      connectionModal: document.getElementById('connection-modal')!,
      spawnModal: document.getElementById('spawn-modal')!,
      controlsModal: document.getElementById('controls-modal')!,
      pauseOverlay: document.getElementById('pause-overlay')!,

      playerNameInput: document.getElementById('player-name') as HTMLInputElement,
      connectBtn: document.getElementById('connect-btn')!,
      planetGrid: document.getElementById('planet-grid')!,
      spawnBtn: document.getElementById('spawn-btn')!,
      controlsOkBtn: document.getElementById('controls-ok-btn')!,

      hud: document.getElementById('hud')!,
      positionX: document.getElementById('pos-x')!,
      positionY: document.getElementById('pos-y')!,
      positionZ: document.getElementById('pos-z')!,
      velocityMag: document.getElementById('vel-mag')!,
      altitudeValue: document.getElementById('altitude-value')!,
      nearestBody: document.getElementById('nearest-body')!,
      fpsValue: document.getElementById('fps-value')!,
      latencyValue: document.getElementById('latency-value')!,
      bodiesValue: document.getElementById('bodies-value')!,
      playersValue: document.getElementById('players-value')!,
      chatMessages: document.getElementById('chat-messages')!,
      chatInput: document.getElementById('chat-input') as HTMLInputElement,

      minimap: document.getElementById('minimap') as HTMLCanvasElement,
    };
  }

  private setupEventListeners(): void {
    // Connect button
    this.elements.connectBtn.addEventListener('click', () => {
      const name = this.elements.playerNameInput.value.trim();
      if (name.length > 0) {
        this.onConnect?.(name);
      }
    });

    // Enter key on name input
    this.elements.playerNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.elements.connectBtn.click();
      }
    });

    // Spawn button
    this.elements.spawnBtn.addEventListener('click', () => {
      if (this.selectedSpawnBody) {
        this.onSpawn?.(this.selectedSpawnBody);
      }
    });

    // Controls OK button
    this.elements.controlsOkBtn.addEventListener('click', () => {
      this.hideControlsModal();
      this.setState('playing');
    });

    // Chat input
    this.elements.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const message = this.elements.chatInput.value.trim();
        if (message.length > 0) {
          this.onChat?.(message);
          this.elements.chatInput.value = '';
        }
        this.elements.chatInput.blur();
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        this.elements.chatInput.blur();
        e.preventDefault();
      }
    });

    // Resume button in pause overlay
    this.elements.pauseOverlay.addEventListener('click', () => {
      this.onResume?.();
    });
  }

  /**
   * Set UI state
   */
  setState(state: UIState): void {
    this.state = state;
    this.updateVisibility();
  }

  /**
   * Get current UI state
   */
  getState(): UIState {
    return this.state;
  }

  /**
   * Update visibility based on state
   */
  private updateVisibility(): void {
    // Hide all modals
    this.elements.connectionModal.classList.add('hidden');
    this.elements.spawnModal.classList.add('hidden');
    this.elements.controlsModal.classList.add('hidden');
    this.elements.pauseOverlay.classList.add('hidden');
    this.elements.hud.classList.add('hidden');

    switch (this.state) {
      case 'connecting':
        this.elements.connectionModal.classList.remove('hidden');
        this.elements.playerNameInput.focus();
        break;

      case 'spawn-select':
        this.elements.spawnModal.classList.remove('hidden');
        break;

      case 'playing':
        this.elements.hud.classList.remove('hidden');
        break;

      case 'paused':
        this.elements.hud.classList.remove('hidden');
        this.elements.pauseOverlay.classList.remove('hidden');
        break;

      case 'chat':
        this.elements.hud.classList.remove('hidden');
        this.elements.chatInput.focus();
        break;

      case 'world-builder':
        this.elements.hud.classList.remove('hidden');
        // TODO: Show world builder panel
        break;
    }
  }

  /**
   * Show controls modal
   */
  showControlsModal(): void {
    this.elements.controlsModal.classList.remove('hidden');
  }

  /**
   * Set connect button loading state
   */
  setConnectButtonLoading(loading: boolean): void {
    if (loading) {
      this.elements.connectBtn.textContent = 'Connecting...';
      this.elements.connectBtn.setAttribute('disabled', 'true');
      (this.elements.connectBtn as HTMLButtonElement).style.opacity = '0.7';
    } else {
      this.elements.connectBtn.textContent = 'Connect';
      this.elements.connectBtn.removeAttribute('disabled');
      (this.elements.connectBtn as HTMLButtonElement).style.opacity = '1';
    }
  }

  /**
   * Hide controls modal
   */
  hideControlsModal(): void {
    this.elements.controlsModal.classList.add('hidden');
  }

  /**
   * Populate spawn selection with bodies
   */
  populateSpawnSelection(bodies: CelestialBodyDefinition[]): void {
    this.storedBodies = bodies;
    this.elements.planetGrid.innerHTML = '';

    // Filter to only planets and moons (using bodyClass)
    const spawnableBodies = bodies.filter(
      (b) => b.bodyClass === BodyClass.TERRESTRIAL || 
             b.bodyClass === BodyClass.GAS_GIANT ||
             b.bodyClass === BodyClass.ICE_GIANT ||
             b.bodyClass === BodyClass.MOON
    );

    for (const body of spawnableBodies) {
      const card = this.createPlanetCard(body);
      this.elements.planetGrid.appendChild(card);
    }

    // Select first by default
    if (spawnableBodies.length > 0 && !this.selectedSpawnBody) {
      const firstBody = spawnableBodies[0];
      if (firstBody) {
        this.selectSpawnBody(firstBody.id);
      }
    }
  }

  /**
   * Create a planet card element
   */
  private createPlanetCard(body: CelestialBodyDefinition): HTMLElement {
    const card = document.createElement('div');
    card.className = 'planet-card';
    card.dataset['bodyId'] = body.id;

    // Convert RGB array to hex color
    const colorToHex = (c: [number, number, number]): number => {
      return (Math.floor(c[0] * 255) << 16) | (Math.floor(c[1] * 255) << 8) | Math.floor(c[2] * 255);
    };

    // Color circle
    const colorCircle = document.createElement('div');
    colorCircle.style.width = '60px';
    colorCircle.style.height = '60px';
    colorCircle.style.borderRadius = '50%';
    colorCircle.style.backgroundColor = `#${colorToHex(body.color).toString(16).padStart(6, '0')}`;
    colorCircle.style.marginBottom = '0.5rem';
    colorCircle.style.boxShadow = '0 0 20px rgba(255,255,255,0.2)';
    card.appendChild(colorCircle);

    // Name
    const name = document.createElement('div');
    name.textContent = body.name;
    name.style.fontWeight = 'bold';
    name.style.fontSize = '1.1rem';
    card.appendChild(name);

    // Type
    const type = document.createElement('div');
    type.textContent = body.type;
    type.style.fontSize = '0.8rem';
    type.style.opacity = '0.7';
    type.style.marginBottom = '0.5rem';
    card.appendChild(type);

    // Stats
    const stats = document.createElement('div');
    stats.style.fontSize = '0.75rem';
    stats.style.opacity = '0.6';
    stats.innerHTML = `
      <div>Radius: ${formatDistance(body.radius)}</div>
      <div>Mass: ${formatMass(body.mass)}</div>
    `;
    card.appendChild(stats);

    // Click handler
    card.addEventListener('click', () => {
      this.selectSpawnBody(body.id);
    });

    return card;
  }

  /**
   * Select a spawn body
   */
  selectSpawnBody(bodyId: string): void {
    this.selectedSpawnBody = bodyId;

    // Update visual selection
    const cards = this.elements.planetGrid.querySelectorAll('.planet-card');
    cards.forEach((card) => {
      card.classList.remove('selected');
      if ((card as HTMLElement).dataset['bodyId'] === bodyId) {
        card.classList.add('selected');
      }
    });

    // Enable spawn button
    this.elements.spawnBtn.classList.remove('disabled');
  }

  /**
   * Update HUD with player position
   */
  updatePosition(x: number, y: number, z: number): void {
    this.elements.positionX.textContent = formatDistance(x);
    this.elements.positionY.textContent = formatDistance(y);
    this.elements.positionZ.textContent = formatDistance(z);
  }

  /**
   * Update velocity display
   */
  updateVelocity(magnitude: number): void {
    if (magnitude > 1000) {
      this.elements.velocityMag.textContent = `${(magnitude / 1000).toFixed(2)} km/s`;
    } else {
      this.elements.velocityMag.textContent = `${magnitude.toFixed(2)} m/s`;
    }
  }

  /**
   * Update altitude display
   */
  updateAltitude(altitude: number, bodyName: string): void {
    this.elements.altitudeValue.textContent = formatDistance(altitude);
    this.elements.nearestBody.textContent = bodyName;
  }

  /**
   * Update diagnostic values
   */
  updateDiagnostics(fps: number, latency: number, bodies: number, players: number): void {
    this.elements.fpsValue.textContent = fps.toFixed(0);
    this.elements.latencyValue.textContent = `${latency.toFixed(0)}ms`;
    this.elements.bodiesValue.textContent = bodies.toString();
    this.elements.playersValue.textContent = players.toString();
  }

  /**
   * Add a chat message
   */
  addChatMessage(playerName: string, message: string, isSystem: boolean = false): void {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';

    if (isSystem) {
      messageDiv.innerHTML = `<span style="color: #ffcc00">${message}</span>`;
    } else {
      messageDiv.innerHTML = `<strong>${playerName}:</strong> ${message}`;
    }

    this.elements.chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;

    // Limit messages
    while (this.elements.chatMessages.children.length > 50) {
      this.elements.chatMessages.removeChild(this.elements.chatMessages.firstChild!);
    }
  }

  /**
   * Focus chat input
   */
  focusChat(): void {
    this.elements.chatInput.focus();
  }

  /**
   * Update minimap
   */
  updateMinimap(
    bodies: { x: number; y: number; radius: number; color: number }[],
    playerX: number,
    playerY: number,
    scale: number
  ): void {
    const canvas = this.elements.minimap;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bodies
    for (const body of bodies) {
      const screenX = centerX + (body.x - playerX) / scale;
      const screenY = centerY + (body.y - playerY) / scale;

      // Skip if off-screen
      if (screenX < -10 || screenX > canvas.width + 10 || screenY < -10 || screenY > canvas.height + 10) {
        continue;
      }

      const screenRadius = Math.max(2, body.radius / scale);

      ctx.beginPath();
      ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
      ctx.fillStyle = `#${body.color.toString(16).padStart(6, '0')}`;
      ctx.fill();
    }

    // Draw player at center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff00';
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Show connection error
   */
  showConnectionError(message: string): void {
    // Could show a toast or update the connection modal
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    error.style.color = '#ff4444';
    error.style.marginTop = '1rem';

    this.elements.connectionModal.querySelector('.modal-content')?.appendChild(error);

    // Remove after 3 seconds
    setTimeout(() => error.remove(), 3000);
  }
}
