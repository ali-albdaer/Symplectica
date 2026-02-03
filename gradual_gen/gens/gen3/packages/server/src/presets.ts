/**
 * World Presets
 */

import { circularVelocity, AU, SOLAR_MASS, SOLAR_RADIUS, EARTH_MASS, EARTH_RADIUS, MOON_MASS, MOON_RADIUS } from './constants.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

function vec3(x = 0, y = 0, z = 0): Vec3 {
    return { x, y, z };
}

/**
 * Create the solar system preset
 */
function createSolarSystem(): WorldPreset {
    const bodies: Body[] = [];

    // Sun
    bodies.push({
        id: 'sun',
        name: 'Sun',
        bodyType: 'Star',
        mass: SOLAR_MASS,
        radius: SOLAR_RADIUS,
        position: vec3(0, 0, 0),
        velocity: vec3(0, 0, 0),
        visuals: { color: 0xFFFF00, emission: 1 },
    });

    // Planets with orbital data
    const planets = [
        { id: 'mercury', name: 'Mercury', mass: 3.3011e23, radius: 2.4397e6, a: 5.791e10, color: 0x8B7355 },
        { id: 'venus', name: 'Venus', mass: 4.8675e24, radius: 6.0518e6, a: 1.0821e11, color: 0xFFC649 },
        { id: 'earth', name: 'Earth', mass: EARTH_MASS, radius: EARTH_RADIUS, a: AU, color: 0x6B93D6 },
        { id: 'mars', name: 'Mars', mass: 6.4171e23, radius: 3.3895e6, a: 2.279e11, color: 0xC1440E },
        { id: 'jupiter', name: 'Jupiter', mass: 1.8982e27, radius: 6.9911e7, a: 7.785e11, color: 0xD8CA9D },
        { id: 'saturn', name: 'Saturn', mass: 5.6834e26, radius: 5.8232e7, a: 1.4335e12, color: 0xF4D59E },
        { id: 'uranus', name: 'Uranus', mass: 8.6810e25, radius: 2.5362e7, a: 2.8725e12, color: 0xD1E7E7 },
        { id: 'neptune', name: 'Neptune', mass: 1.02413e26, radius: 2.4622e7, a: 4.4951e12, color: 0x5B5DDF },
    ];

    for (const p of planets) {
        const v = circularVelocity(SOLAR_MASS, p.a);
        bodies.push({
            id: p.id,
            name: p.name,
            bodyType: 'Planet',
            mass: p.mass,
            radius: p.radius,
            position: vec3(p.a, 0, 0),
            velocity: vec3(0, v, 0),
            visuals: { color: p.color },
        });
    }

    return {
        id: 'solar_system',
        name: 'Solar System',
        description: 'Our solar system with all 8 planets',
        bodies,
    };
}

/**
 * Create Earth-Moon system preset
 */
function createEarthMoon(): WorldPreset {
    const moonDistance = 3.844e8;
    const moonV = circularVelocity(EARTH_MASS, moonDistance);

    return {
        id: 'earth_moon',
        name: 'Earth-Moon System',
        description: 'Earth and its Moon',
        bodies: [
            {
                id: 'earth',
                name: 'Earth',
                bodyType: 'Planet',
                mass: EARTH_MASS,
                radius: EARTH_RADIUS,
                position: vec3(0, 0, 0),
                velocity: vec3(0, 0, 0),
                visuals: { color: 0x6B93D6 },
            },
            {
                id: 'moon',
                name: 'Moon',
                bodyType: 'Moon',
                mass: MOON_MASS,
                radius: MOON_RADIUS,
                position: vec3(moonDistance, 0, 0),
                velocity: vec3(0, moonV, 0),
                visuals: { color: 0xAAAAAA },
            },
        ],
    };
}

/**
 * Create two-body test preset (Sun + Earth)
 */
function createTwoBody(): WorldPreset {
    const earthV = circularVelocity(SOLAR_MASS, AU);

    return {
        id: 'two_body',
        name: 'Two Body Test',
        description: 'Simple Sun-Earth system for testing',
        bodies: [
            {
                id: 'sun',
                name: 'Sun',
                bodyType: 'Star',
                mass: SOLAR_MASS,
                radius: SOLAR_RADIUS,
                position: vec3(0, 0, 0),
                velocity: vec3(0, 0, 0),
                visuals: { color: 0xFFFF00, emission: 1 },
            },
            {
                id: 'earth',
                name: 'Earth',
                bodyType: 'Planet',
                mass: EARTH_MASS,
                radius: EARTH_RADIUS,
                position: vec3(AU, 0, 0),
                velocity: vec3(0, earthV, 0),
                visuals: { color: 0x6B93D6 },
            },
        ],
    };
}

const builtInPresets: Record<string, () => WorldPreset> = {
    solar_system: createSolarSystem,
    earth_moon: createEarthMoon,
    two_body: createTwoBody,
};

/**
 * Load a world preset by name
 */
export async function loadPreset(name: string): Promise<WorldPreset | null> {
    // Check built-in presets
    if (builtInPresets[name]) {
        return builtInPresets[name]();
    }

    // Try to load from file
    try {
        const presetPath = join(__dirname, '..', '..', '..', 'world_presets', `${name}.json`);
        const content = await readFile(presetPath, 'utf-8');
        return JSON.parse(content) as WorldPreset;
    } catch {
        console.warn(`Preset '${name}' not found`);
        return null;
    }
}

/**
 * List available presets
 */
export function listPresets(): string[] {
    return Object.keys(builtInPresets);
}
