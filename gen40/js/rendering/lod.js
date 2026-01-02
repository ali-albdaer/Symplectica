import { Config } from '../core/config.js';
import { State } from '../core/state.js';

export function updateLOD() {
  if (!State.camera || !State.celestialBodies.length) return;
  const camPos = State.camera.position.clone().applyMatrix4(State.camera.parent ? State.camera.parent.matrixWorld : State.camera.matrixWorld);

  for (const entry of State.celestialBodies) {
    const mesh = entry.mesh;
    if (!mesh || !mesh.userData.hiGeo || !mesh.userData.loGeo) continue;

    const dist = mesh.getWorldPosition(new THREE.Vector3()).distanceTo(camPos);
    if (Config.rendering.enableLODs) {
      const useLow = dist > entry.config.radius * 25;
      mesh.geometry = useLow ? mesh.userData.loGeo : mesh.userData.hiGeo;
    } else {
      mesh.geometry = mesh.userData.hiGeo;
    }
  }
}
