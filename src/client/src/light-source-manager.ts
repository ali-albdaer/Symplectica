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
    
    // Pre-allocated scratch buffers to prevent garbage collection overhead
    private readonly _resultBuffer: (LightSourceInfo | null)[] = new Array(4).fill(null);
    private readonly _scratchBrightness = new Float64Array(4);
    private _resultCount = 0;

    registerSource(id: number, info: LightSourceInfo): void {
        this.sources.set(id, info);
    }

    removeSource(id: number): void {
        this.sources.delete(id);
    }

    updatePosition(id: number, position: THREE.Vector3): void {
        const source = this.sources.get(id);
        if (source) {
            source.position.copy(position);
        }
    }

    /** 
     * Get the N most significant light sources for a position, sorted by apparent brightness (L/d²).
     * Zero-allocation implementation that returns a view of a pre-allocated array.
     * Callers must not store references to this returned array across frames.
     */
    getSignificantSources(position: THREE.Vector3, maxCount: number): readonly LightSourceInfo[] {
        const cap = Math.min(maxCount, 4);
        let found = 0;

        for (const light of this.sources.values()) {
            const dSq = light.position.distanceToSquared(position);
            const brightness = light.luminosity / Math.max(dSq, 1e-8); // Avoid division by zero

            // Linear insertion sort into a fixed-size buffer
            let ins = found;
            while (ins > 0 && brightness > this._scratchBrightness[ins - 1]) {
                ins--;
            }

            if (ins < cap) {
                // Shift elements down
                const shiftEnd = Math.min(found, cap - 1);
                for (let k = shiftEnd; k > ins; k--) {
                    this._resultBuffer[k] = this._resultBuffer[k - 1];
                    this._scratchBrightness[k] = this._scratchBrightness[k - 1];
                }
                this._resultBuffer[ins] = light;
                this._scratchBrightness[ins] = brightness;
                
                if (found < cap) {
                    found++;
                }
            }
        }

        this._resultCount = found;
        return this._resultBuffer as readonly LightSourceInfo[];
    }

    get resultCount(): number {
        return this._resultCount;
    }

    get count(): number {
        return this.sources.size;
    }

    getAllSources(): LightSourceInfo[] {
        return Array.from(this.sources.values());
    }
}

