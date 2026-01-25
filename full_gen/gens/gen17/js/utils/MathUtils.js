const THREE_REF = () => window.THREE;

export function vec3FromConfig(cfg) {
    return new (THREE_REF().Vector3)(cfg.x, cfg.y, cfg.z);
}

export function applyVectorToConfig(vec3, target) {
    target.x = vec3.x;
    target.y = vec3.y;
    target.z = vec3.z;
}

export function setMeshFromBody(mesh, body) {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
}

export function threeFromCannon(cannonVec) {
    return new (THREE_REF().Vector3)(cannonVec.x, cannonVec.y, cannonVec.z);
}

export function applyThreeToCannon(threeVec, cannonVec) {
    cannonVec.x = threeVec.x;
    cannonVec.y = threeVec.y;
    cannonVec.z = threeVec.z;
}

export function gravitationalForce(G, massA, massB, delta) {
    const distanceSq = delta.lengthSq();
    if (distanceSq < 1e-6) {
        return 0;
    }
    return (G * massA * massB) / distanceSq;
}

export function normalizeSafe(vec3) {
    if (vec3.lengthSq() < 1e-8) {
        return vec3.set(0, 1, 0);
    }
    return vec3.normalize();
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function slerpQuaternion(target, current, alpha) {
    current.slerp(target, clamp(alpha, 0, 1));
}

export function lerpVector(target, current, alpha) {
    current.lerp(target, clamp(alpha, 0, 1));
}

export function rollingAverage(buffer, next, size) {
    buffer.push(next);
    if (buffer.length > size) {
        buffer.shift();
    }
    const total = buffer.reduce((sum, value) => sum + value, 0);
    return total / buffer.length;
}
