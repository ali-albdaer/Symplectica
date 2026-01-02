// Keyboard/mouse input and pointer lock handling

import { Debug } from "../core/debug.js";

export function setupInputManager(container) {
  const keys = new Set();
  let pointerLocked = false;
  let mouseDX = 0;
  let mouseDY = 0;
  let rightMouseDown = false;

  function onKeyDown(e) {
    keys.add(e.key.toLowerCase());
  }

  function onKeyUp(e) {
    keys.delete(e.key.toLowerCase());
  }

  function onMouseMove(e) {
    if (!pointerLocked) return;
    mouseDX += e.movementX;
    mouseDY += e.movementY;
  }

  function onMouseDown(e) {
    if (e.button === 2) {
      rightMouseDown = true;
    }
    if (!pointerLocked && e.button === 0) {
      requestLock();
    }
  }

  function onMouseUp(e) {
    if (e.button === 2) {
      rightMouseDown = false;
    }
  }

  function requestLock() {
    container.requestPointerLock?.();
  }

  function exitLock() {
    document.exitPointerLock?.();
  }

  function onPointerLockChange() {
    pointerLocked = document.pointerLockElement === container;
    if (!pointerLocked) {
      mouseDX = 0;
      mouseDY = 0;
    }
  }

  function onContextMenu(e) {
    e.preventDefault();
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("pointerlockchange", onPointerLockChange);

  Debug.log("Input manager initialized");

  return {
    isKeyDown(code) {
      return keys.has(code.toLowerCase());
    },
    consumeMouseDelta() {
      const dx = mouseDX;
      const dy = mouseDY;
      mouseDX = 0;
      mouseDY = 0;
      return { dx, dy };
    },
    isRightMouseDown() {
      return rightMouseDown;
    },
    isPointerLocked() {
      return pointerLocked;
    },
    lock: requestLock,
    unlock: exitLock,
  };
}
