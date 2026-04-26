const TAU = Math.PI * 2;

export function unwrapAngle(reference: number, angle: number): number {
    if (!Number.isFinite(reference) || !Number.isFinite(angle)) return angle;

    let wrapped = angle;
    while (wrapped - reference > Math.PI) {
        wrapped -= TAU;
    }
    while (wrapped - reference < -Math.PI) {
        wrapped += TAU;
    }
    return wrapped;
}

export function bodySafeOrbitDistance(radius: number): number {
    if (!Number.isFinite(radius) || radius < 0) return 1;
    return radius + 1;
}

export function clampOrbitDistance(distance: number, minDistance: number, maxDistance: number): number {
    if (!Number.isFinite(distance)) return minDistance;
    return Math.max(minDistance, Math.min(maxDistance, distance));
}

export function smoothingAlphaFromDamping(damping: number, deltaSeconds: number): number {
    if (!Number.isFinite(damping) || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return 1;
    const clampedDamping = Math.max(0, Math.min(0.9999, damping));
    return 1 - Math.pow(clampedDamping, deltaSeconds * 60);
}