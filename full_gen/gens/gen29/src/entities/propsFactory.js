import { THREE } from '../vendor.js';
import { Body } from './body.js';
import { makePropMaterial } from './materials.js';

function randRange(a, b) {
  return a + (b - a) * Math.random();
}

export function createPropsNearPlayer({ THREE, configStore, scene, world, player }) {
  const cfg = configStore.data.props;

  const count = cfg.spawnCount;
  const radius = cfg.spawnRadius;

  for (let i = 0; i < count; i++) {
    const mass = randRange(cfg.minMass, cfg.maxMass);
    const r = randRange(cfg.minRadius, cfg.maxRadius);
    const emissive = Math.random() < cfg.emissiveChance;

    const geom = Math.random() < 0.5 ? new THREE.SphereGeometry(1, 16, 16) : new THREE.BoxGeometry(1, 1, 1);
    const mat = makePropMaterial({ THREE, emissive, emissiveStrength: cfg.emissiveStrength });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.scale.setScalar(r * 2);
    mesh.castShadow = configStore.get('graphics.enableShadows');
    mesh.receiveShadow = configStore.get('graphics.enableShadows');
    scene.add(mesh);

    const angle = Math.random() * Math.PI * 2;
    const dist = 0.2 + Math.random() * radius;
    const pos = player.body.position
      .clone()
      .add(new THREE.Vector3(Math.cos(angle) * dist, 0.08 + Math.random() * 0.1, Math.sin(angle) * dist));

    const b = new Body({
      name: `Prop ${i + 1}`,
      type: 'prop',
      mass,
      radius: r,
      position: pos,
      velocity: new THREE.Vector3(0, 0, 0),
      mesh,
      emissiveStrength: emissive ? cfg.emissiveStrength : 0,
    });

    world.addBody(b);
  }
}
