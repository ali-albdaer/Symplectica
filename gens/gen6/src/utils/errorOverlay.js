export function installErrorOverlay() {
  function show(kind, err) {
    const msg = err instanceof Error ? (err.stack || err.message) : String(err);

    let el = document.getElementById('__errorOverlay');
    if (!el) {
      el = document.createElement('div');
      el.id = '__errorOverlay';
      el.style.position = 'absolute';
      el.style.left = '12px';
      el.style.bottom = '12px';
      el.style.right = '12px';
      el.style.maxHeight = '45%';
      el.style.overflow = 'auto';
      el.style.padding = '10px 12px';
      el.style.background = 'rgba(120, 20, 20, 0.92)';
      el.style.border = '1px solid rgba(255,255,255,.2)';
      el.style.borderRadius = '10px';
      el.style.color = '#fff';
      el.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
      el.style.fontSize = '12px';
      el.style.whiteSpace = 'pre-wrap';
      el.style.zIndex = '99999';
      el.style.pointerEvents = 'auto';
      document.getElementById('app')?.appendChild(el);
    }

    el.textContent = `${kind}:\n${msg}\n\nTip: open DevTools (F12) Console for more context.`;
  }

  window.addEventListener('error', (e) => {
    show('Unhandled error', e.error || e.message);
  });

  window.addEventListener('unhandledrejection', (e) => {
    show('Unhandled promise rejection', e.reason);
  });
}
