import * as THREE from 'three';
import { LightSourceInfo } from './light-source-manager';

export interface ShadowCasterInfo {
    id: number;
    position: THREE.Vector3;
    radius: number;
}

export class ShadowCasterManager {
    private casters: Map<number, ShadowCasterInfo> = new Map();
    private casterArray: ShadowCasterInfo[] = [];
    
    // Pre-allocated scratch buffers to prevent garbage collection overhead
    private readonly _resultBuffer: (ShadowCasterInfo | null)[] = new Array(4).fill(null);
    private readonly _scratchScore = new Float64Array(4);
    private _resultCount = 0;

    registerCaster(id: number, info: ShadowCasterInfo): void {
        this.casters.set(id, info);
        this.casterArray.push(info);
    }

    removeCaster(id: number): void {
        this.casters.delete(id);
        const idx = this.casterArray.findIndex(c => c.id === id);
        if (idx >= 0) {
            this.casterArray.splice(idx, 1);
        }
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
     * Zero-allocation, heavily optimized O(N) implementation.
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
        
        const rx = receiverPosition.x;
        const ry = receiverPosition.y;
        const rz = receiverPosition.z;
        const casters = this.casterArray;
        const len = casters.length;

        for (let c = 0; c < len; c++) {
            const caster = casters[c];
            if (caster.id === receiverId) continue;

            const dx = caster.position.x - rx;
            const dy = caster.position.y - ry;
            const dz = caster.position.z - rz;
            const dSq = dx*dx + dy*dy + dz*dz;
            
            const solidAngleScore = (caster.radius * caster.radius) / Math.max(dSq, 1e-8);
            
            // If the body is too far / too small to matter at all, skip early before heavy math
            if (solidAngleScore < 1e-6) continue;
            
            const dist = Math.sqrt(dSq);
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;
            
            let maxAlignment = 0;
            
            for (let i = 0; i < numActiveLights; i++) {
                const light = activeLights[i];
                if (!light) continue;
                
                const ldx = light.position.x - rx;
                const ldy = light.position.y - ry;
                const ldz = light.position.z - rz;
                
                const lDist = Math.sqrt(ldx*ldx + ldy*ldy + ldz*ldz);
                const lnx = ldx / lDist;
                const lny = ldy / lDist;
                const lnz = ldz / lDist;
                
                const alignment = nx*lnx + ny*lny + nz*lnz;
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
