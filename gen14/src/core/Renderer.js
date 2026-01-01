import * as THREE from "../vendor/three.js";
import { Config } from "../Config.js";

export class Renderer {
	constructor({ canvas }) {
		this.canvas = canvas;
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(Config.render.background);

		this.camera = new THREE.PerspectiveCamera(70, 1, 0.05, 5000);
		this.camera.position.set(0, 3, 14);

		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			powerPreference: "high-performance",
		});
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.shadowMap.enabled = !!Config.render.useShadows;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.sunLight = null;
		this._resize();
		window.addEventListener("resize", () => this._resize());
	}

	applyFidelity() {
		const dpr = Math.min(window.devicePixelRatio || 1, Config.render.pixelRatioCap);
		this.renderer.setPixelRatio(dpr);

		const f = Config.render.fidelity;
		let shadowSize = 2048;
		if (f === "Low") shadowSize = 1024;
		else if (f === "Ultra") shadowSize = 4096;

		if (this.sunLight) {
			this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);
			this.sunLight.shadow.needsUpdate = true;
		}
	}

	setSunLight(light) {
		this.sunLight = light;
		this.applyFidelity();
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	_resize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h, false);
		this.applyFidelity();
	}
}
