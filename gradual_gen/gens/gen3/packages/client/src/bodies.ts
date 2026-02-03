/**
 * Body management and rendering
 */

import { Renderer } from './renderer';
import { NetworkSnapshot, SnapshotBody } from './network';

export interface ClientBody {
    id: string;
    name: string;
    bodyType: string;
    mass: number;
    radius: number;
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    soi?: number;
    color: number;
    isEmissive: boolean;
}

export class BodyManager {
    private bodies: Map<string, ClientBody> = new Map();
    private renderer: Renderer;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    /**
     * Update bodies from a network snapshot
     */
    updateFromSnapshot(snapshot: NetworkSnapshot): void {
        const currentIds = new Set(this.bodies.keys());
        const snapshotIds = new Set(snapshot.bodies.map((b) => b.id));

        // Remove bodies that no longer exist
        for (const id of currentIds) {
            if (!snapshotIds.has(id)) {
                this.bodies.delete(id);
                this.renderer.removeBody(id);
            }
        }

        // Update or add bodies
        for (const sb of snapshot.bodies) {
            let body = this.bodies.get(sb.id);

            if (!body) {
                body = {
                    id: sb.id,
                    name: sb.name,
                    bodyType: sb.bodyType,
                    mass: sb.mass,
                    radius: sb.radius,
                    position: { ...sb.position },
                    velocity: { ...sb.velocity },
                    soi: sb.soi,
                    color: sb.visuals?.color ?? 0xffffff,
                    isEmissive: (sb.visuals?.emission ?? 0) > 0,
                };
                this.bodies.set(sb.id, body);
            } else {
                // Update existing body
                body.mass = sb.mass;
                body.radius = sb.radius;
                body.position.x = sb.position.x;
                body.position.y = sb.position.y;
                body.position.z = sb.position.z;
                body.velocity.x = sb.velocity.x;
                body.velocity.y = sb.velocity.y;
                body.velocity.z = sb.velocity.z;
                body.soi = sb.soi;
            }

            // Update renderer
            this.renderer.updateBody(
                body.id,
                body.name,
                body.position.x,
                body.position.y,
                body.position.z,
                body.radius,
                body.color,
                body.isEmissive
            );
        }
    }

    /**
     * Interpolate body positions between two snapshots
     */
    interpolate(prev: NetworkSnapshot, curr: NetworkSnapshot, t: number): void {
        const prevMap = new Map(prev.bodies.map((b) => [b.id, b]));

        for (const currBody of curr.bodies) {
            const prevBody = prevMap.get(currBody.id);
            const body = this.bodies.get(currBody.id);

            if (!body) continue;

            if (prevBody) {
                // Lerp position
                body.position.x = prevBody.position.x + (currBody.position.x - prevBody.position.x) * t;
                body.position.y = prevBody.position.y + (currBody.position.y - prevBody.position.y) * t;
                body.position.z = prevBody.position.z + (currBody.position.z - prevBody.position.z) * t;

                // Lerp velocity
                body.velocity.x = prevBody.velocity.x + (currBody.velocity.x - prevBody.velocity.x) * t;
                body.velocity.y = prevBody.velocity.y + (currBody.velocity.y - prevBody.velocity.y) * t;
                body.velocity.z = prevBody.velocity.z + (currBody.velocity.z - prevBody.velocity.z) * t;
            }

            // Update renderer with interpolated position
            this.renderer.updateBody(
                body.id,
                body.name,
                body.position.x,
                body.position.y,
                body.position.z,
                body.radius,
                body.color,
                body.isEmissive
            );
        }
    }

    /**
     * Find a body by name (case-insensitive)
     */
    findByName(name: string): ClientBody | null {
        const lowerName = name.toLowerCase();
        for (const body of this.bodies.values()) {
            if (body.name.toLowerCase() === lowerName) {
                return body;
            }
        }
        return null;
    }

    /**
     * Find the nearest body to a position
     */
    findNearest(x: number, y: number, z: number): ClientBody | null {
        let nearest: ClientBody | null = null;
        let nearestDist = Infinity;

        for (const body of this.bodies.values()) {
            const dx = body.position.x - x;
            const dy = body.position.y - y;
            const dz = body.position.z - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = body;
            }
        }

        return nearest;
    }

    /**
     * Get all bodies
     */
    getAll(): ClientBody[] {
        return Array.from(this.bodies.values());
    }

    /**
     * Get body by ID
     */
    get(id: string): ClientBody | undefined {
        return this.bodies.get(id);
    }

    /**
     * Clear all bodies
     */
    clear(): void {
        for (const id of this.bodies.keys()) {
            this.renderer.removeBody(id);
        }
        this.bodies.clear();
    }
}
