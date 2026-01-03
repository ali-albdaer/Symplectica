import { ConfigManager } from "./ConfigManager.js";

const THREE_REF = () => window.THREE;

export class SceneManager {
    constructor(configManager, logger) {
        if (!(configManager instanceof ConfigManager)) {
            throw new Error("SceneManager requires ConfigManager");
        }
        this.config = configManager;
        this.logger = logger;
        const THREE = THREE_REF();
        this.canvas = document.getElementById("viewport");
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 4000);
        this.camera.position.set(0, 3, 5);

        this.cameraRig = new THREE.Group();
        this.cameraRig.name = "CameraRig";
        this.cameraRig.add(this.camera);
        this.scene.add(this.cameraRig);

        this.worldRoot = new THREE.Group();
        this.worldRoot.name = "WorldRoot";
        this.scene.add(this.worldRoot);

        const { sunColor, sunPointLightIntensity, shadowBias } = this.config.get("lighting");
        this.sunLight = new THREE.PointLight(sunColor, sunPointLightIntensity, 0, 2);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.bias = shadowBias;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 2000;
        this.sunLight.shadow.mapSize.set(2048, 2048);
        this.scene.add(this.sunLight);

        this.ambientNode = new THREE.AmbientLight(0x0, 0);
        this.scene.add(this.ambientNode);

        this.applyFidelitySettings(this.config.get("rendering.fidelity"));
        window.addEventListener("resize", () => this.onResize());
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    applyFidelitySettings(level) {
        const THREE = THREE_REF();
        const fidelity = level || this.config.get("rendering.fidelity");
        const renderCfg = this.config.get("rendering");
        const shadowSize = renderCfg.shadowMapSize[fidelity];
        this.renderer.toneMappingExposure = renderCfg.exposure;
        this.renderer.toneMapping = renderCfg.toneMapping === "ACES" ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio * renderCfg.pixelRatio[fidelity], 2));
        this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);
        this.logger?.info?.(`Fidelity set to ${fidelity}`);
        this.onResize();
    }

    attachSun(mesh) {
        this.sunLight.position.copy(mesh.position);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
