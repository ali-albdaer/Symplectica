export class Input {
	constructor(targetElement) {
		this.target = targetElement;
		this.keys = new Map();
		this.mouseDelta = { x: 0, y: 0 };
		this.mouseButtons = new Map();
		this._locked = false;

		this._onKeyDown = (e) => {
			this.keys.set(e.code, true);
		};
		this._onKeyUp = (e) => {
			this.keys.set(e.code, false);
		};
		this._onMouseDown = (e) => {
			this.mouseButtons.set(e.button, true);
		};
		this._onMouseUp = (e) => {
			this.mouseButtons.set(e.button, false);
		};
		this._onMouseMove = (e) => {
			if (!this._locked) return;
			this.mouseDelta.x += e.movementX;
			this.mouseDelta.y += e.movementY;
		};

		window.addEventListener("keydown", this._onKeyDown);
		window.addEventListener("keyup", this._onKeyUp);
		window.addEventListener("mousedown", this._onMouseDown);
		window.addEventListener("mouseup", this._onMouseUp);
		window.addEventListener("mousemove", this._onMouseMove);
		window.addEventListener("contextmenu", (e) => e.preventDefault());

		document.addEventListener("pointerlockchange", () => {
			this._locked = document.pointerLockElement === this.target;
		});
	}

	isDown(code) {
		return !!this.keys.get(code);
	}

	mouseDown(button) {
		return !!this.mouseButtons.get(button);
	}

	consumeMouseDelta() {
		const d = { x: this.mouseDelta.x, y: this.mouseDelta.y };
		this.mouseDelta.x = 0;
		this.mouseDelta.y = 0;
		return d;
	}

	requestPointerLock() {
		this.target?.requestPointerLock?.();
	}

	exitPointerLock() {
		document.exitPointerLock?.();
	}

	isPointerLocked() {
		return this._locked;
	}
}
