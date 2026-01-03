export class Input {
	constructor(canvas) {
		this.canvas = canvas;
		this.keys = new Set();
		this.mouseDX = 0;
		this.mouseDY = 0;
		this.pointerLocked = false;
		this._rightMouseDown = false;
		this._rightClicked = false;

		window.addEventListener('keydown', (e) => {
			this.keys.add(e.code);
		});
		window.addEventListener('keyup', (e) => {
			this.keys.delete(e.code);
		});

		window.addEventListener('mousemove', (e) => {
			if (!this.pointerLocked) return;
			this.mouseDX += e.movementX;
			this.mouseDY += e.movementY;
		});

		window.addEventListener('mousedown', (e) => {
			if (e.button === 2) {
				this._rightMouseDown = true;
				this._rightClicked = true;
			}
		});
		window.addEventListener('mouseup', (e) => {
			if (e.button === 2) {
				this._rightMouseDown = false;
			}
		});

		window.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});

		document.addEventListener('pointerlockchange', () => {
			this.pointerLocked = document.pointerLockElement === this.canvas;
		});
	}

	consumeMouseDelta() {
		const dx = this.mouseDX;
		const dy = this.mouseDY;
		this.mouseDX = 0;
		this.mouseDY = 0;
		return { dx, dy };
	}

	consumeRightClick() {
		const v = this._rightClicked;
		this._rightClicked = false;
		return v;
	}

	isDown(code) {
		return this.keys.has(code);
	}

	getAxis2D() {
		// WASD -> x (right), y (forward)
		let x = 0;
		let y = 0;
		if (this.isDown('KeyA')) x -= 1;
		if (this.isDown('KeyD')) x += 1;
		if (this.isDown('KeyW')) y += 1;
		if (this.isDown('KeyS')) y -= 1;
		return { x, y };
	}
}
