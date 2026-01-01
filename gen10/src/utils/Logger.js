export function installGlobalDebugging({ debugLogElement }) {
  const state = {
    buffer: [],
    maxLines: 200,
    el: debugLogElement,
  };

  function formatAny(value) {
    if (value instanceof Error) return value.stack || value.message || String(value);
    if (typeof value === 'object') {
      try { return JSON.stringify(value, null, 2); } catch { return String(value); }
    }
    return String(value);
  }

  function appendLine(level, parts) {
    const ts = new Date().toISOString().slice(11, 19);
    const line = `[${ts}] ${level}: ${parts.map(formatAny).join(' ')}`;
    state.buffer.push(line);
    if (state.buffer.length > state.maxLines) state.buffer.shift();
    if (state.el) {
      state.el.textContent = state.buffer.join('\n');
      state.el.scrollTop = state.el.scrollHeight;
    }
  }

  const original = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  console.log = (...args) => { appendLine('LOG', args); original.log(...args); };
  console.warn = (...args) => { appendLine('WARN', args); original.warn(...args); };
  console.error = (...args) => { appendLine('ERROR', args); original.error(...args); };

  window.addEventListener('error', (ev) => {
    appendLine('WINDOW_ERROR', [ev.message, ev.error || '']);
  });
  window.addEventListener('unhandledrejection', (ev) => {
    appendLine('UNHANDLED_REJECTION', [ev.reason]);
  });

  return {
    log: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
  };
}
