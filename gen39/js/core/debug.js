export function createDebugLogger(container) {
  const lines = [];
  const maxLines = 200;

  function appendLine(level, message, extra) {
    const ts = new Date().toISOString().split('T')[1].replace('Z', '');
    const text = `[${ts}] [${level}] ${message}`;
    lines.push(text);
    if (lines.length > maxLines) lines.shift();
    if (container) {
      container.classList.remove('hidden');
      container.textContent = lines.join('\n');
      container.scrollTop = container.scrollHeight;
    }
    if (extra) {
      console[level === 'ERROR' ? 'error' : 'log'](message, extra);
    }
  }

  const logger = {
    info: (msg, extra) => appendLine('INFO', msg, extra),
    warn: (msg, extra) => appendLine('WARN', msg, extra),
    error: (msg, extra) => appendLine('ERROR', msg, extra),
  };

  const originalError = console.error;
  console.error = function (...args) {
    appendLine('ERROR', args.map(String).join(' '));
    originalError.apply(console, args);
  };

  window.addEventListener('error', (event) => {
    appendLine('ERROR', `Unhandled error: ${event.message}`);
  });

  window.addEventListener('unhandledrejection', (event) => {
    appendLine('ERROR', `Unhandled rejection: ${event.reason}`);
  });

  return logger;
}
