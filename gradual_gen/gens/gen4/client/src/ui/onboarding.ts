/**
 * Onboarding flow: First-run welcome modal and tooltip system.
 * Shows a brief overview of controls on first visit.
 * Uses localStorage to track if onboarding has been shown.
 */

const ONBOARDING_KEY = 'solar-sim-onboarding-complete';

interface OnboardingStep {
  title: string;
  text: string;
  targetId?: string; // ID of element to highlight
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Solar System Simulator!',
    text: 'This is a physically accurate, real-time gravitational simulation powered by a Rust physics engine compiled to WebAssembly.',
  },
  {
    title: 'Controls',
    text: '<b>Space</b> — Pause/Resume<br><b>.</b> — Single step<br><b>H</b> — Toggle HUD<br><b>Mouse wheel</b> — Zoom<br><b>Left drag</b> — Orbit<br><b>Right drag</b> — Pan',
  },
  {
    title: 'Simulation Panel',
    text: 'Use the controls panel to change time scale, select camera modes, switch physics solvers and integrators, or load preset scenarios.',
    targetId: 'controls',
  },
  {
    title: 'World Builder',
    text: 'Add custom bodies with the World Builder. Set mass, radius, position, and velocity — or click "Circular Orbit" to auto-calculate orbital velocity.',
    targetId: 'world-builder',
  },
  {
    title: 'Body List',
    text: 'Click any body in the list to focus the camera on it. The HUD displays real-time tick count, simulation time, and FPS.',
    targetId: 'body-list',
  },
];

export class Onboarding {
  private overlay: HTMLDivElement | null = null;
  private currentStep = 0;

  /** Show onboarding if it hasn't been shown before */
  show(): void {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
    this.currentStep = 0;
    this.createOverlay();
    this.renderStep();
  }

  /** Force-show onboarding regardless of previous completion */
  forceShow(): void {
    localStorage.removeItem(ONBOARDING_KEY);
    this.currentStep = 0;
    this.createOverlay();
    this.renderStep();
  }

  private createOverlay(): void {
    // Remove any existing overlay
    const existing = document.getElementById('onboarding-overlay');
    if (existing) existing.remove();

    this.overlay = document.createElement('div');
    this.overlay.id = 'onboarding-overlay';
    this.overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Inter', sans-serif;
    `;
    document.body.appendChild(this.overlay);
  }

  private renderStep(): void {
    if (!this.overlay) return;

    const step = ONBOARDING_STEPS[this.currentStep];
    const isLast = this.currentStep === ONBOARDING_STEPS.length - 1;
    const isFirst = this.currentStep === 0;

    // Highlight target element
    this.clearHighlights();
    if (step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.style.position = 'relative';
        el.style.zIndex = '10001';
        el.style.boxShadow = '0 0 0 4px #4fc3f7, 0 0 20px rgba(79, 195, 247, 0.4)';
        el.style.borderRadius = '8px';
      }
    }

    this.overlay.innerHTML = `
      <div style="
        background: #1a1a2e; border: 1px solid #444; border-radius: 12px;
        padding: 24px 32px; max-width: 420px; width: 90%;
        color: #eee; box-shadow: 0 8px 40px rgba(0,0,0,0.6);
      ">
        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">
          Step ${this.currentStep + 1} of ${ONBOARDING_STEPS.length}
        </div>
        <h2 style="margin: 0 0 12px; font-size: 18px; color: #4fc3f7;">${step.title}</h2>
        <p style="margin: 0 0 20px; line-height: 1.5; font-size: 14px; color: #ccc;">${step.text}</p>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          ${!isFirst ? `<button id="ob-prev" style="
            padding: 8px 16px; border: 1px solid #555; background: transparent;
            color: #aaa; cursor: pointer; border-radius: 6px; font-size: 13px;
          ">← Back</button>` : ''}
          <button id="ob-skip" style="
            padding: 8px 16px; border: 1px solid #555; background: transparent;
            color: #888; cursor: pointer; border-radius: 6px; font-size: 13px;
          ">Skip</button>
          <button id="ob-next" style="
            padding: 8px 16px; border: none; background: #4fc3f7;
            color: #111; cursor: pointer; border-radius: 6px; font-weight: 600; font-size: 13px;
          ">${isLast ? '🚀 Start Exploring' : 'Next →'}</button>
        </div>
      </div>
    `;

    // Bind buttons
    document.getElementById('ob-next')!.addEventListener('click', () => {
      if (isLast) {
        this.complete();
      } else {
        this.currentStep++;
        this.renderStep();
      }
    });

    document.getElementById('ob-skip')!.addEventListener('click', () => {
      this.complete();
    });

    const prevBtn = document.getElementById('ob-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentStep--;
        this.renderStep();
      });
    }
  }

  private clearHighlights(): void {
    for (const step of ONBOARDING_STEPS) {
      if (step.targetId) {
        const el = document.getElementById(step.targetId);
        if (el) {
          el.style.zIndex = '';
          el.style.boxShadow = '';
          el.style.borderRadius = '';
        }
      }
    }
  }

  private complete(): void {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    this.clearHighlights();
    this.overlay?.remove();
    this.overlay = null;
  }
}
