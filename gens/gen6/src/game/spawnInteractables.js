import * as THREE from 'three';
import { Units } from '../utils/units.js';

export function spawnInteractables({ rigid, player }) {
  // Spawn a handful of small spheres near the player.
  const base = player.getPositionAU().clone();

  const r = Units.metersToAU(0.18);
  const m = 1e-16; // tiny vs celestial masses

  const colors = [0x88ccaa, 0xccaa88, 0x88aacc, 0xaacc88, 0xcc88aa, 0xaaaacc];

  for (let i = 0; i < 6; i++) {
    const offset = new THREE.Vector3(
      Units.metersToAU(1.2 + i * 0.35),
      Units.metersToAU(0.6 + (i % 2) * 0.2),
      Units.metersToAU(0.8 - i * 0.25)
    );

    rigid.addSphere({
      id: `obj_${i}`,
      mass: m,
      radiusAU: r,
      positionAU: base.clone().add(offset),
      velocityAUPerDay: new THREE.Vector3(0, 0, 0),
      color: colors[i % colors.length]
    });
  }
}
