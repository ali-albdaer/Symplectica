import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { buildLOD } from './Utils.js';

export class CelestialBody {
  constructor({ name, mass, radius, color, emissive, position, velocity, isLight = false }, scene, physicsWorld) {
    this.name = name;
    this.mass = mass;
    this.radius = radius;
    this.isLight = isLight;
    this.scene = scene;

    const geometryHi = new THREE.SphereGeometry(radius, 64, 64);
    const geometryMid = new THREE.SphereGeometry(radius, 32, 32);
    const geometryLow = new THREE.SphereGeometry(radius, 12, 12);
    const material = new THREE.MeshStandardMaterial({ color, emissive: emissive || 0x000000, roughness: 0.55, metalness: 0.05 });

    const lod = buildLOD(() => ([
      { mesh: new THREE.Mesh(geometryHi, material), distance: 0 },
      { mesh: new THREE.Mesh(geometryMid, material), distance: radius * 25 },
      { mesh: new THREE.Mesh(geometryLow, material), distance: radius * 50 },
    ]));
    lod.castShadow = true;
    lod.receiveShadow = true;

    this.mesh = lod;
    this.mesh.position.fromArray(position);
    scene.add(this.mesh);

    const shape = new CANNON.Sphere(radius);
    this.body = new CANNON.Body({ mass, shape, position: new CANNON.Vec3(...position), linearDamping: 0, angularDamping: 0.01 });
    this.body.velocity = new CANNON.Vec3(...velocity);
    physicsWorld.world.addBody(this.body);

    if (isLight) {
      this.light = new THREE.PointLight(0xfff2c0, 3.5, 0, 1.8);
      this.light.castShadow = true;
      this.light.shadow.bias = -0.0005;
      this.light.shadow.mapSize.set(2048, 2048);
      this.mesh.add(this.light);
    }
  }

  syncGraphics() {
    this.mesh.position.copy(this.body.position);
  }
}
