import { clamp } from '../utils/math.js';

export class Cameras {
  constructor({ THREE, configStore, renderer, scene, baseCamera, player, input }) {
    this.THREE = THREE;
    this.configStore = configStore;
    this.renderer = renderer;
    this.scene = scene;
    this.input = input;

    this.player = player;

    this.activeCamera = baseCamera;
    this.mode = 'First'; // 'First' | 'Third'

    this._tmpV = new THREE.Vector3();
    this._tmpQ = new THREE.Quaternion();

    this._thirdTarget = new THREE.Vector3();
    this._thirdPos = new THREE.Vector3();
  }

  toggleMode() {
    this.mode = this.mode === 'First' ? 'Third' : 'First';
  }

  fixedUpdate(dt) {
    // Read mouse deltas at fixed rate so movement aligns with sim.
    const { dx, dy } = this.input.consumeMouseDeltas();
    const sensitivity = 0.0022;

    this.player.applyLookDeltas(-dx * sensitivity, -dy * sensitivity);
  }

  update(realDt) {
    const cam = this.activeCamera;

    if (this.mode === 'First') {
      this.player.getFirstPersonCameraPose(cam.position, cam.quaternion);
      return;
    }

    // Cinematic 3rd-person: critically damped spring-ish follow.
    const thirdDist = this.configStore.get('player.camera.thirdPersonDistance');
    const thirdHeight = this.configStore.get('player.camera.thirdPersonHeight');
    const smooth = this.configStore.get('player.camera.thirdPersonSmooth');

    this.player.getThirdPersonTarget(this._thirdTarget);

    // Camera back vector from view.
    cam.quaternion.copy(this.player.viewQuat);
    this._tmpV.set(0, 0, 1).applyQuaternion(cam.quaternion);

    const desired = this._tmpV.multiplyScalar(thirdDist).add(this._thirdTarget);
    desired.y += thirdHeight;

    if (this._thirdPos.lengthSq() === 0) this._thirdPos.copy(desired);

    const k = 1 - Math.exp(-smooth * Math.max(0, realDt));
    this._thirdPos.lerp(desired, k);

    cam.position.copy(this._thirdPos);
    cam.lookAt(this._thirdTarget);
  }
}
