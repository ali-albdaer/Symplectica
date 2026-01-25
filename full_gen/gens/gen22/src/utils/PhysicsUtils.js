import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

export function computeCircularOrbitVelocity(primaryMass, radius, gravitationalConstant) {
    const v = Math.sqrt((gravitationalConstant * primaryMass) / radius);
    return v;
}

export function createVectorFromPolar(radius, angle) {
    return new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle));
}

export function createVelocityVector(speed, angle) {
    return new THREE.Vector3(-speed * Math.sin(angle), 0, speed * Math.cos(angle));
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}
