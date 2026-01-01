import { Vector3, Quaternion, Matrix4 } from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export class CameraRig {
  constructor({ camera, eventBus }) {
    this.camera = camera;
    this.mode = "first";
    this.currentOffset = new Vector3(0, 1.4, 0);
    this.firstPersonOffset = new Vector3(0, 1.4, 0);
    this.thirdPersonOffset = new Vector3(0, 4, -10);
    this.cameraTarget = new Vector3();
    this.cameraQuaternion = new Quaternion();
    eventBus?.on("camera:toggle", () => this.toggleMode());
  }

  toggleMode() {
    this.mode = this.mode === "first" ? "cinematic" : "first";
  }

  update(delta, pose) {
    const lerpFactor = 1 - Math.pow(0.001, delta * 60);
    const targetOffset = this.mode === "first" ? this.firstPersonOffset : this.thirdPersonOffset;
    this.currentOffset.lerp(targetOffset, lerpFactor);

    const offsetWorld = this.currentOffset.clone().applyQuaternion(pose.quaternion);
    this.cameraTarget.copy(pose.position).add(offsetWorld);
    this.camera.position.lerp(this.cameraTarget, lerpFactor);
    this.camera.up.lerp(pose.up, lerpFactor);

    const desiredQuat = this.mode === "first" ? pose.quaternion : this.lookAt(pose.position, this.camera.position, pose.up);
    this.cameraQuaternion.copy(this.camera.quaternion).slerp(desiredQuat, lerpFactor);
    this.camera.quaternion.copy(this.cameraQuaternion);
  }

  lookAt(target, position, up) {
    const matrix = new Matrix4();
    matrix.lookAt(position, target, up);
    const quat = new Quaternion();
    quat.setFromRotationMatrix(matrix);
    return quat;
  }
}
