import * as THREE from 'three';

export function getGravityVector(position, bodies, G) {
    const force = new THREE.Vector3(0, 0, 0);
    let maxForce = 0;
    let dominantBody = null;

    for (const body of bodies) {
        if (body.mesh.position.distanceToSquared(position) < 0.001) continue; // Self check

        const distSq = body.mesh.position.distanceToSquared(position);
        const dist = Math.sqrt(distSq);
        const dir = new THREE.Vector3().subVectors(body.mesh.position, position).normalize();
        
        // F = G * M / r^2 (We ignore 'm' of the test particle here, effectively calculating acceleration)
        const accelerationMagnitude = (G * body.mass) / distSq;
        
        force.add(dir.multiplyScalar(accelerationMagnitude));

        if (accelerationMagnitude > maxForce) {
            maxForce = accelerationMagnitude;
            dominantBody = body;
        }
    }

    return { vector: force, dominantBody };
}
