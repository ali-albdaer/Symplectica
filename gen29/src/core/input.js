export class Input {
  constructor() {
    this.keysDown = new Set();
    this.keysPressed = new Map();

    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.mouseButtonsDown = new Set();

    this._onKeyDown = (e) => {
      const key = normalizeKey(e);
      if (!this.keysDown.has(key)) {
        this.keysPressed.set(key, true);
      }
      this.keysDown.add(key);
    };

    this._onKeyUp = (e) => {
      const key = normalizeKey(e);
      this.keysDown.delete(key);
    };

    this._onMouseMove = (e) => {
      // When pointer locked, movementX/Y are relative.
      this.mouseDeltaX += e.movementX || 0;
      this.mouseDeltaY += e.movementY || 0;
    };

    this._onMouseDown = (e) => {
      this.mouseButtonsDown.add(e.button);
    };

    this._onMouseUp = (e) => {
      this.mouseButtonsDown.delete(e.button);
    };

    this._onContextMenu = (e) => {
      // Needed so right-click can be used for grabbing.
      e.preventDefault();
    };

    this._onBlur = () => {
      this.keysDown.clear();
      this.keysPressed.clear();
      this.mouseButtonsDown.clear();
      this.mouseDeltaX = 0;
      this.mouseDeltaY = 0;
    };
  }

  attach() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('contextmenu', this._onContextMenu);
    window.addEventListener('blur', this._onBlur);
  }

  detach() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('contextmenu', this._onContextMenu);
    window.removeEventListener('blur', this._onBlur);
  }

  consumeMouseDeltas() {
    const dx = this.mouseDeltaX;
    const dy = this.mouseDeltaY;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return { dx, dy };
  }

  isDown(key) {
    return this.keysDown.has(normalizeKeyStr(key));
  }

  wasPressed(key) {
    key = normalizeKeyStr(key);
    const v = this.keysPressed.get(key) === true;
    this.keysPressed.delete(key);
    return v;
  }

  onKeyPressed(key, fn) {
    key = normalizeKeyStr(key);
    const handler = () => {
      if (this.wasPressed(key)) fn();
      requestAnimationFrame(handler);
    };
    requestAnimationFrame(handler);
  }

  isMouseDown(buttonIndex) {
    return this.mouseButtonsDown.has(buttonIndex);
  }
}

function normalizeKey(e) {
  // Prefer e.key for symbols like '/'.
  return normalizeKeyStr(e.key);
}

function normalizeKeyStr(key) {
  if (!key) return '';
  if (key.length === 1) return key.toLowerCase();
  return key;
}
