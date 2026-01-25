import * as THREE from 'three';

export function getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

export function applyGravity(body, attractor, G, dt) {
    const dx = attractor.position.x - body.position.x;
    const dy = attractor.position.y - body.position.y;
    const dz = attractor.position.z - body.position.z;
    
    const distSq = dx*dx + dy*dy + dz*dz;
    const dist = Math.sqrt(distSq);
    
    if (dist === 0) return;

    const f = (G * body.mass * attractor.mass) / distSq;
    
    const fx = f * (dx / dist);
    const fy = f * (dy / dist);
    const fz = f * (dz / dist);
    
    body.velocity.x += (fx / body.mass) * dt;
    body.velocity.y += (fy / body.mass) * dt;
    body.velocity.z += (fz / body.mass) * dt;
}

export function updatePosition(body, dt) {
    body.position.x += body.velocity.x * dt;
    body.position.y += body.velocity.y * dt;
    body.position.z += body.velocity.z * dt;
}
