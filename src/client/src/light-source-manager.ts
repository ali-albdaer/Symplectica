import * as THREE from 'three';

export interface LightSourceInfo {
    id: number;
    position: THREE.Vector3;     // J2000 local coords (floating origin applied)
    color: THREE.Color;          // Blackbody color
    luminosity: number;          // Solar luminosities
    radius: number;              // Star radius in meters
    temperature: number;         // Effective temperature in Kelvin
}

export class LightSourceManager {
    private sources: Map<number, LightSourceInfo> = new Map();
    private sortedSources: LightSourceInfo[] = [];
    private needsSort = false;

    registerSource(id: number, info: LightSourceInfo): void {
        this.sources.set(id, info);
        this.needsSort = true;
    }

    removeSource(id: number): void {
        this.sources.delete(id);
        this.needsSort = true;
    }

    updatePosition(id: number, position: THREE.Vector3): void {
        const source = this.sources.get(id);
        if (source) {
            source.position.copy(position);
        }
    }

    /** 
     * Get the N most significant light sources for a position, sorted by apparent brightness (L/d²).
     * This allocates a new array each time; use carefully or rely on caching if called per-body per-frame.
     */
    getSignificantSources(position: THREE.Vector3, maxCount: number): LightSourceInfo[] {
        if (this.sources.size === 0) return [];
        if (this.sources.size === 1) return [this.sources.values().next().value!];

        // Sort by apparent brightness (L / d^2)
        const sorted = Array.from(this.sources.values()).sort((a, b) => {
            const distSqA = a.position.distanceToSquared(position);
            const distSqB = b.position.distanceToSquared(position);
            const apparentA = a.luminosity / (distSqA || 1); // Avoid division by zero
            const apparentB = b.luminosity / (distSqB || 1);
            return apparentB - apparentA;
        });

        return sorted.slice(0, maxCount);
    }

    get count(): number {
        return this.sources.size;
    }

    getAllSources(): LightSourceInfo[] {
        return Array.from(this.sources.values());
    }
}
