export class DebugLog {
  /** @param {HTMLElement} el */
  constructor(el) {
    this.el = el;
    this.lines = [];
    this.maxLines = 200;

    // Override console methods to also print on-screen.
    const origError = console.error.bind(console);
    const origWarn = console.warn.bind(console);

    console.error = (...args) => {
      origError(...args);
      this.error(args.map(String).join(' '));
    };

    console.warn = (...args) => {
      origWarn(...args);
      this.warn(args.map(String).join(' '));
    };
  }

  installGlobalHandlers() {
    window.addEventListener('error', (e) => {
      const msg = e?.error?.stack || e.message || 'Unknown error';
      this.error(msg);
      this.show(true);
    });

    window.addEventListener('unhandledrejection', (e) => {
      const msg = e?.reason?.stack || String(e.reason) || 'Unhandled rejection';
      this.error(msg);
      this.show(true);
    });
  }

  show(on) {
    this.el.classList.toggle('hidden', !on);
  }

  toggle() {
    this.show(this.el.classList.contains('hidden'));
  }

  info(message) { this._push('info', message); }
  warn(message) { this._push('warn', message); }
  error(message) { this._push('error', message); }

  _push(level, message) {
    const ts = new Date().toLocaleTimeString();
    this.lines.push({ level, message, ts });
    if (this.lines.length > this.maxLines) this.lines.shift();
    this._render();
  }

  _render() {
    if (!this.el) return;
    this.el.innerHTML = this.lines
      .map((l) => {
        const cls = l.level === 'error' ? 'err' : '';
        return `<div class="${cls}"><span class="ts">[${l.ts}]</span> ${escapeHtml(l.message)}</div>`;
      })
      .join('');
    this.el.scrollTop = this.el.scrollHeight;
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
