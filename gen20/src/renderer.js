import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  sRGBEncoding,
  Vector3,
  Color,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  PointLight,
  Group,
  TextureLoader,
  BackSide,
  MeshBasicMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
} from "https://unpkg.com/three@0.164.0/build/three.module.js";
import { qualitySettings, Config } from "./config.js";

export class RenderPipeline {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5e13);
    this.renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = 2; // PCFSoftShadowMap
    this.bodies = new Map();
    this.interactives = [];
    this.sunLight = null;
    this.starField = null;
    this._setupResize();
    this._initEnvironment();
  }

  _setupResize() {
    const resize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", resize);
    resize();
  }

  _initEnvironment() {
    this.starField = buildStarField(qualitySettings().starCount);
    this.scene.add(this.starField);
  }

  setQuality(level) {
    const q = qualitySettings();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.needsUpdate = true;
    if (this.sunLight) {
      this.sunLight.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
      this.sunLight.shadow.needsUpdate = true;
    }
    if (this.starField) {
      this.scene.remove(this.starField);
    }
    this.starField = buildStarField(q.starCount);
    this.scene.add(this.starField);
  }

  addBody(body) {
    const q = qualitySettings();
    const segments = q.enableLOD ? 48 : 32;
    const geometry = new SphereGeometry(body.radius, segments, segments);
    const material = new MeshStandardMaterial({
      color: new Color(body.color || 0xffffff),
      emissive: new Color(body.emissive || 0),
      metalness: 0.05,
      roughness: 0.7,
    });
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = !body.isStar;
    mesh.receiveShadow = !body.isStar;
    mesh.userData.bodyId = body.id;

    const group = new Group();
    group.add(mesh);

    if (body.isStar) {
      const light = new PointLight(material.emissive, 1, 0, 2);
      light.castShadow = true;
      light.shadow.mapSize.set(qualitySettings().shadowMapSize, qualitySettings().shadowMapSize);
      light.shadow.bias = -1e-4;
      light.shadow.radius = 3;
      group.add(light);
      this.sunLight = light;
    }

    this.scene.add(group);
    this.bodies.set(body.id, { mesh, group, body });
  }

  addInteractive(object) {
    const geometry = new SphereGeometry(object.radius, 24, 24);
    const material = new MeshStandardMaterial({
      color: new Color(object.color || 0x7ce7ff),
      emissive: new Color(object.emissive || 0),
      metalness: 0.2,
      roughness: 0.5,
    });
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.bodyId = object.id;
    this.scene.add(mesh);
    this.interactives.push({ object, mesh });
  }

  updateBodyTransforms() {
    for (const entry of this.bodies.values()) {
      entry.group.position.copy(entry.body.position);
    }
    for (const it of this.interactives) {
      it.mesh.position.copy(it.object.position);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

function buildStarField(count) {
  const geometry = new BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++) {
    const r = 1e13 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions.push(x, y, z);
  }
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  const material = new PointsMaterial({ color: 0xffffff, size: 2e10, sizeAttenuation: false });
  return new Points(geometry, material);
}
