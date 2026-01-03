import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { getConfig, subscribeConfig } from "../config.js";
import { logError } from "../utils/Logger.js";

export class RendererEngine {
    constructor({ canvas }) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = getConfig().rendering.exposure;
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5e9);
        this.sunLight = null;
        this.starfield = null;
        this.renderScale = getConfig().simulation.renderScale;
        this.fidelitySubscription = null;
        this.starfieldSubscription = null;
        this.lodSubscription = null;
        this.exposureSubscription = null;
        this.lodEnabled = getConfig().simulation.enableLOD;
        this.bodies = [];
    }

    initialize() {
        this.setupScene();
        this.setupLighting();
        this.setupStarfield();
        this.handleResize();
        window.addEventListener("resize", () => this.handleResize());
        this.fidelitySubscription = subscribeConfig("simulation.fidelity", (value) => this.applyFidelity(value));
        this.starfieldSubscription = subscribeConfig("rendering.starfieldDensity", (value) => this.rebuildStarfield(value));
        this.lodSubscription = subscribeConfig("simulation.enableLOD", (value) => this.setLODEnabled(value));
        this.exposureSubscription = subscribeConfig("rendering.exposure", (value) => {
            this.renderer.toneMappingExposure = value;
        });
        this.applyFidelity(getConfig().simulation.fidelity);
        this.setLODEnabled(this.lodEnabled);
    }

    setupScene() {
        this.scene.background = new THREE.Color(0x02030c);
        this.scene.fog = new THREE.Fog(0x02030c, 2e5, 4e9);
    }

    setupLighting() {
        const sun = new THREE.PointLight(0xffffff, 1, 0, 2);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.bias = -1e-5;
        this.scene.add(sun);
        this.sunLight = sun;
    }

    setupStarfield() {
        const { starfieldDensity } = getConfig().rendering;
        this.rebuildStarfield(starfieldDensity);
    }

    rebuildStarfield(density) {
        if (this.starfield) {
            this.scene.remove(this.starfield);
            this.starfield.geometry.dispose();
            this.starfield.material.dispose();
            this.starfield = null;
        }
        const starCount = Math.floor(5000 * density);
        const radius = 3e9;
        const positions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i += 1) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 8000000 * this.renderScale,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        this.starfield = new THREE.Points(geometry, material);
        this.scene.add(this.starfield);
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
    }

    applyFidelity(level) {
        const fidelity = level.toLowerCase();
        const renderer = this.renderer;
        switch (fidelity) {
            case "low":
                renderer.shadowMap.enabled = false;
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
                break;
            case "medium":
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFShadowMap;
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                break;
            case "ultra":
            default:
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
                break;
        }
    }

    addBody(body) {
        if (!body.mesh) {
            logError(`Body ${body.name} has no mesh to render.`);
            return;
        }
        this.scene.add(body.mesh);
        if (body.light) {
            this.scene.add(body.light);
        }
        this.bodies.push(body);
    }

    removeBody(body) {
        if (body.mesh && this.scene.children.includes(body.mesh)) {
            this.scene.remove(body.mesh);
        }
        if (body.light && this.scene.children.includes(body.light)) {
            this.scene.remove(body.light);
        }
        const index = this.bodies.indexOf(body);
        if (index >= 0) {
            this.bodies.splice(index, 1);
        }
    }

    update(deltaTime) {
        if (this.sunLight) {
            const sun = this.bodies.find((body) => body.type === "star");
            if (sun) {
                this.sunLight.position.copy(sun.mesh.position);
                this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, 1.5, 0.05);
                this.sunLight.distance = 0;
            }
        }
        if (this.lodEnabled) {
            this.applyLODLevels();
        }
    }

    dispose() {
        if (this.fidelitySubscription) {
            this.fidelitySubscription();
            this.fidelitySubscription = null;
        }
        if (this.starfieldSubscription) {
            this.starfieldSubscription();
            this.starfieldSubscription = null;
        }
        if (this.lodSubscription) {
            this.lodSubscription();
            this.lodSubscription = null;
        }
        if (this.exposureSubscription) {
            this.exposureSubscription();
            this.exposureSubscription = null;
        }
        this.renderer.dispose();
        this.bodies = [];
    }

    setLODEnabled(enabled) {
        this.lodEnabled = enabled;
        if (!enabled) {
            for (const body of this.bodies) {
                const base = body.type === "star" ? 64 : 48;
                body.setDetail(base);
            }
        }
    }

    applyLODLevels() {
        const cameraPosition = this.camera.position;
        for (const body of this.bodies) {
            if (!body.mesh || body.isInteractive || body.isPlayer) {
                continue;
            }
            const distance = body.mesh.position.distanceTo(cameraPosition);
            const targetDetail = this.pickDetailLevel(body, distance);
            body.setDetail(targetDetail);
        }
    }

    pickDetailLevel(body, distance) {
        const base = body.type === "star" ? 64 : 48;
        const mid = body.type === "star" ? 48 : 32;
        const low = body.type === "star" ? 32 : 16;
        const scale = Math.max(body.radius * this.renderScale, 1);
        if (distance < scale * 400) {
            return base;
        }
        if (distance < scale * 1500) {
            return mid;
        }
        return low;
    }
}
