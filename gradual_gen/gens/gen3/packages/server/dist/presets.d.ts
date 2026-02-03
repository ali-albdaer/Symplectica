/**
 * World Presets
 */
interface Vec3 {
    x: number;
    y: number;
    z: number;
}
interface Body {
    id: string;
    name: string;
    bodyType: string;
    mass: number;
    radius: number;
    position: Vec3;
    velocity: Vec3;
    fixed?: boolean;
    ownerId?: string;
    visuals?: {
        color: number;
        emission?: number;
    };
}
export interface WorldPreset {
    id: string;
    name: string;
    description: string;
    bodies: Body[];
    config?: Record<string, unknown>;
}
/**
 * Load a world preset by name
 */
export declare function loadPreset(name: string): Promise<WorldPreset | null>;
/**
 * List available presets
 */
export declare function listPresets(): string[];
export {};
//# sourceMappingURL=presets.d.ts.map