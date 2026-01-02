export function createInput(canvas) {
  const state = {
    keys: new Set(),
    pointerLocked: false,
    mouseDeltaX: 0,
    mouseDeltaY: 0,
    mouseButtons: new Set(),
    wheelDelta: 0,
    keyDownHandlers: []
  };

  function setPointerLocked(locked) {
    state.pointerLocked = locked;
  }

  function consumeMouseDelta() {
    const dx = state.mouseDeltaX;
    const dy = state.mouseDeltaY;
    state.mouseDeltaX = 0;
    state.mouseDeltaY = 0;
    return { dx, dy };
  }

  function isKeyDown(code) {
    return state.keys.has(code);
  }

  function isMouseDown(button) {
    return state.mouseButtons.has(button);
  }

  function consumeWheelDelta() {
    const d = state.wheelDelta;
    state.wheelDelta = 0;
    return d;
  }

  function onKeyDown(fn) {
    state.keyDownHandlers.push(fn);
  }

  window.addEventListener('keydown', (e) => {
    state.keys.add(e.code);
    for (const fn of state.keyDownHandlers) fn(e);
  });

  window.addEventListener('keyup', (e) => {
    state.keys.delete(e.code);
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('mousedown', (e) => {
    state.mouseButtons.add(e.button);
  });

  window.addEventListener('mouseup', (e) => {
    state.mouseButtons.delete(e.button);
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.pointerLocked) return;
    state.mouseDeltaX += e.movementX;
    state.mouseDeltaY += e.movementY;
  });

  window.addEventListener('wheel', (e) => {
    state.wheelDelta += e.deltaY;
  }, { passive: true });

  return {
    setPointerLocked,
    consumeMouseDelta,
    isKeyDown,
    isMouseDown,
    consumeWheelDelta,
    onKeyDown
  };
}
