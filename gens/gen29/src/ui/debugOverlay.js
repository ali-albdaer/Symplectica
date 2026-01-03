export class DebugOverlay {
  constructor(el) {
    this.el = el;
    this.lines = [];
    this.maxLines = 200;

    this.isOverlayInteractive = false;

    this.setVisible(false);
  }

  setVisible(v) {
    if (!this.el) return;
    this.el.classList.toggle('hidden', !v);
  }

  log(message, err) {
    const ts = new Date().toISOString().slice(11, 23);
    const detail = err ? `\n${err?.stack || err}` : '';
    this.lines.push(`[${ts}] ${message}${detail}`);
    if (this.lines.length > this.maxLines) this.lines.splice(0, this.lines.length - this.maxLines);

    if (this.el) this.el.textContent = this.lines.join('\n\n');

    // Auto-show when something logs.
    if (this.el) this.el.classList.remove('hidden');
  }

  installGlobalHandlers() {
    window.addEventListener('error', (e) => {
      this.log('Window error', e.error || e.message);
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.log('Unhandled promise rejection', e.reason);
    });

    // Monkeypatch console to surface logs in-game.
    const origError = console.error.bind(console);
    console.error = (...args) => {
      this.log('console.error', args.map(stringify).join(' '));
      origError(...args);
    };

    const origWarn = console.warn.bind(console);
    console.warn = (...args) => {
      this.log('console.warn', args.map(stringify).join(' '));
      origWarn(...args);
    };
  }
}

function stringify(v) {
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
