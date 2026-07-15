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

    // Pre-allocated light directions for the current receiver
    private readonly _lightDirX = new Float64Array(4);
    private readonly _lightDirY = new Float64Array(4);
    private readonly _lightDirZ = new Float64Array(4);

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

        // Hoist: The light positions are identical for all casters relative to this receiver.
        // Pre-calculate normalized directions to lights to avoid doing this inside the caster loop.
        for (let i = 0; i < numActiveLights; i++) {
            const light = activeLights[i];
            if (light) {
                const ldx = light.position.x - rx;
                const ldy = light.position.y - ry;
                const ldz = light.position.z - rz;
                const lDistSq = ldx*ldx + ldy*ldy + ldz*ldz;
                
                if (lDistSq > 1e-12) {
                    const lDistInv = 1.0 / Math.sqrt(lDistSq);
                    this._lightDirX[i] = ldx * lDistInv;
                    this._lightDirY[i] = ldy * lDistInv;
                    this._lightDirZ[i] = ldz * lDistInv;
                } else {
                    this._lightDirX[i] = 0;
                    this._lightDirY[i] = 0;
                    this._lightDirZ[i] = 0;
                }
            }
        }

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
            
            let maxDot = 0;
            
            for (let i = 0; i < numActiveLights; i++) {
                if (!activeLights[i]) continue;
                // Dot product with un-normalized caster vector
                const dot = dx * this._lightDirX[i] + dy * this._lightDirY[i] + dz * this._lightDirZ[i];
                if (dot > maxDot) {
                    maxDot = dot;
                }
            }
            
            // Only care about bodies that are somewhat in front of a light
            if (maxDot <= 0.0) continue;
            
            // Delay division by distance until we absolutely know this body is a candidate
            const maxAlignment = maxDot / Math.sqrt(dSq);
            
            // Score = solid angle * strong alignment penalty.
            // Math.pow with a small integer power is intrinsically optimized by V8
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
