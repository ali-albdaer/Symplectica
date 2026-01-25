export function createLogger(debugEl) {
  const state = {
    enabled: true,
    lines: []
  };

  function ensureVisible() {
    debugEl?.classList.remove('hidden');
  }

  function formatError(err) {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (err instanceof Error) {
      return `${err.name}: ${err.message}\n${err.stack ?? ''}`.trim();
    }
    try {
      return JSON.stringify(err, null, 2);
    } catch {
      return String(err);
    }
  }

  function pushLine(line) {
    state.lines.push(line);
    if (state.lines.length > 200) state.lines.shift();
    if (debugEl) debugEl.textContent = state.lines.join('\n\n');
  }

  function error(msg, err) {
    const line = `[${new Date().toISOString()}] ERROR: ${msg}${err ? `\n${formatError(err)}` : ''}`;
    console.error(line);
    pushLine(line);
    ensureVisible();
  }

  function info(msg) {
    const line = `[${new Date().toISOString()}] INFO: ${msg}`;
    console.log(line);
    pushLine(line);
  }

  function installGlobalHandlers() {
    window.addEventListener('error', (e) => {
      error('Uncaught error', e.error ?? e.message);
    });

    window.addEventListener('unhandledrejection', (e) => {
      error('Unhandled promise rejection', e.reason);
    });

    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      try {
        pushLine(`[${new Date().toISOString()}] console.error: ${args.map(String).join(' ')}`);
        ensureVisible();
      } catch {
        // ignore
      }
    };
  }

  return { error, info, installGlobalHandlers };
}
