export class CelestialBody {
  constructor({ THREE, definition, physicsEntry, scene }) {
    this.THREE = THREE;
    this.definition = definition;
    this.physicsEntry = physicsEntry;
    this.scene = scene;
    this.lodGeometries = this.createLODGeometries();
    this.mesh = this.createMesh();
    this.scene.add(this.mesh);
  }

  createLODGeometries() {
    const detail = [64, 32, 16];
    return detail.map((segments) => new this.THREE.SphereGeometry(this.definition.radius, segments, segments));
  }

  createMesh() {
    const { THREE, definition } = this;
    const geometry = this.lodGeometries[0];
    const material =
      definition.type === "star"
        ? this.createStarMaterial()
        : new THREE.MeshStandardMaterial({
            color: definition.color,
            emissive: 0x000000,
            roughness: 0.8,
            metalness: 0.1,
          });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = definition.type !== "star";
    mesh.receiveShadow = true;
    this.material = material;
    return mesh;
  }

  createStarMaterial() {
    this.hasStarShader = true;
    return new this.THREE.ShaderMaterial({
      uniforms: {
        color: { value: new this.THREE.Color(this.definition.color) },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalMatrix * normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 color;
        uniform float time;
        void main() {
          float pulse = 0.5 + 0.5 * sin(time * 0.5 + vNormal.x * 8.0);
          float rim = pow(0.4 + dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 6.0);
          vec3 finalColor = color * (1.2 * rim + pulse);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: false,
    });
  }

  update(delta, context = {}) {
    const { camera, lodEnabled } = context;
    const body = this.physicsEntry.body;
    this.mesh.position.copy(body.position);
    if (this.definition.rotationSpeed) {
      this.mesh.rotation.y += this.definition.rotationSpeed * delta;
    }
    if (this.hasStarShader) {
      this.material.uniforms.time.value += delta;
    }
    if (lodEnabled && camera) {
      this.applyLOD(camera);
    }
  }

  applyLOD(camera) {
    const distance = camera.position.distanceTo(this.mesh.position);
    let level = 0;
    if (distance > 800) level = 2;
    else if (distance > 300) level = 1;
    if (this.mesh.geometry !== this.lodGeometries[level]) {
      this.mesh.geometry = this.lodGeometries[level];
    }
  }
}
