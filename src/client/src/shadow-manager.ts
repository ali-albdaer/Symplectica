import * as THREE from 'three';
import { LightSourceInfo } from './light-source-manager';

export interface ShadowCasterInfo {
    id: number;
    position: THREE.Vector3;
    radius: number;
}

export class ShadowCasterManager {
    private casters: Map<number, ShadowCasterInfo> = new Map();
    
    // Pre-allocated scratch buffers to prevent garbage collection overhead
    private readonly _resultBuffer: (ShadowCasterInfo | null)[] = new Array(4).fill(null);
    private readonly _scratchScore = new Float64Array(4);
    private _resultCount = 0;
    
    private readonly _vecToCaster = new THREE.Vector3();
    private readonly _dirToLight = new THREE.Vector3();

    registerCaster(id: number, info: ShadowCasterInfo): void {
        this.casters.set(id, info);
    }

    removeCaster(id: number): void {
        this.casters.delete(id);
    }

    updatePosition(id: number, x: number, y: number, z: number): void {
        const caster = this.casters.get(id);
        if (caster) {
            caster.position.set(x, y, z);
        }
    }

    /** 
     * Get the N most significant casters for a given receiver body.
     * Ranks by estimated shadow contribution (combining solid angle and geometric alignment with lights).
     * Zero-allocation implementation.
     */
    getSignificantCasters(
        receiverId: number, 
        receiverPosition: THREE.Vector3, 
        activeLights: readonly LightSourceInfo[], 
        numActiveLights: number,
        maxCount: number
    ): readonly ShadowCasterInfo[] {
        const cap = Math.min(maxCount, 4);
        let found = 0;

        for (const caster of this.casters.values()) {
            if (caster.id === receiverId) continue;

            this._vecToCaster.subVectors(caster.position, receiverPosition);
            const dSq = this._vecToCaster.lengthSq();
            const solidAngleScore = (caster.radius * caster.radius) / Math.max(dSq, 1e-8);
            
            // If the body is too far / too small to matter at all, skip early
            if (solidAngleScore < 1e-12) continue;
            
            this._vecToCaster.normalize();
            let maxAlignment = 0;
            
            for (let i = 0; i < numActiveLights; i++) {
                const light = activeLights[i];
                if (!light) continue;
                
                this._dirToLight.subVectors(light.position, receiverPosition).normalize();
                const alignment = this._vecToCaster.dot(this._dirToLight);
                if (alignment > maxAlignment) {
                    maxAlignment = alignment;
                }
            }
            
            // Only care about bodies that are somewhat in front of a light (alignment > 0)
            if (maxAlignment <= 0.0) continue;
            
            // Score = solid angle * strong alignment penalty.
            // Using a high power ensures that bodies perfectly eclipsing are prioritized over large bodies off to the side.
            const score = solidAngleScore * Math.pow(maxAlignment, 16);

            // Linear insertion sort into a fixed-size buffer
            let ins = found;
            while (ins > 0 && score > this._scratchScore[ins - 1]) {
                ins--;
            }

            if (ins < cap) {
                const shiftEnd = Math.min(found, cap - 1);
                for (let k = shiftEnd; k > ins; k--) {
                    this._resultBuffer[k] = this._resultBuffer[k - 1];
                    this._scratchScore[k] = this._scratchScore[k - 1];
                }
                this._resultBuffer[ins] = caster;
                this._scratchScore[ins] = score;
                
                if (found < cap) {
                    found++;
                }
            }
        }

        this._resultCount = found;
        return this._resultBuffer as readonly ShadowCasterInfo[];
    }

    get resultCount(): number {
        return this._resultCount;
    }
}
