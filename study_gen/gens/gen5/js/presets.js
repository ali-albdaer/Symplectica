/**
 * presets.js - Preset Scenarios and Initial Conditions
 * 
 * Contains accurate initial conditions for various celestial scenarios.
 * Data sources:
 * - NASA JPL Horizons (J2000.0 epoch approximations for Solar System)
 * - IAU nominal values for masses
 * - Literature values for stable multi-star configurations
 * 
 * All values in SI units (meters, kg, m/s)
 */

import { Body, BodyType } from './body.js';
import { Vec3 } from './vector3.js';
import { 
    AU, SOLAR_MASS, EARTH_MASS, MOON_MASS, SOLAR_RADIUS, EARTH_RADIUS,
    JUPITER_MASS, DAY, YEAR
} from './constants.js';
import { getSimulation } from './simulation.js';

/**
 * Preset definitions
 */
export const Presets = {
    /**
     * Solar System - Inner planets with accurate J2000-like initial conditions
     * 
     * Note: These are simplified circular/near-circular approximations.
     * For higher accuracy, use JPL Horizons ephemeris data.
     * 
     * Reference frame: Heliocentric, ecliptic J2000
     */
    'solar-system': {
        name: 'Solar System',
        description: 'Sun with inner planets (Mercury through Mars) and Jupiter',
        timestep: 3600, // 1 hour
        bodies: [
            // Sun
            {
                name: 'Sun',
                type: BodyType.STAR,
                mass: SOLAR_MASS,
                radius: SOLAR_RADIUS,
                x: 0, y: 0, z: 0,
                vx: 0, vy: 0, vz: 0,
                color: 0xffdd44,
                luminosity: 3.828e26,
            },
            // Mercury
            {
                name: 'Mercury',
                type: BodyType.PLANET,
                mass: 3.3011e23,
                radius: 2.4397e6,
                x: 5.791e10, y: 0, z: 0,  // 0.387 AU
                vx: 0, vy: 4.736e4, vz: 0,  // 47.36 km/s
                color: 0x8c8c8c,
                hasAtmosphere: false,
            },
            // Venus
            {
                name: 'Venus',
                type: BodyType.PLANET,
                mass: 4.8675e24,
                radius: 6.0518e6,
                x: 1.082e11, y: 0, z: 0,  // 0.723 AU
                vx: 0, vy: 3.502e4, vz: 0,  // 35.02 km/s
                color: 0xe6c87a,
                hasAtmosphere: true,
            },
            // Earth
            {
                name: 'Earth',
                type: BodyType.PLANET,
                mass: EARTH_MASS,
                radius: EARTH_RADIUS,
                x: AU, y: 0, z: 0,  // 1 AU
                vx: 0, vy: 2.978e4, vz: 0,  // 29.78 km/s
                color: 0x4488ff,
                hasAtmosphere: true,
            },
            // Mars
            {
                name: 'Mars',
                type: BodyType.PLANET,
                mass: 6.4171e23,
                radius: 3.3895e6,
                x: 2.279e11, y: 0, z: 0,  // 1.524 AU
                vx: 0, vy: 2.407e4, vz: 0,  // 24.07 km/s
                color: 0xc1440e,
                hasAtmosphere: true,
            },
            // Jupiter
            {
                name: 'Jupiter',
                type: BodyType.PLANET,
                mass: JUPITER_MASS,
                radius: 6.9911e7,
                x: 7.785e11, y: 0, z: 0,  // 5.2 AU
                vx: 0, vy: 1.307e4, vz: 0,  // 13.07 km/s
                color: 0xd8ca9d,
                hasAtmosphere: true,
            },
        ],
    },

    /**
     * Sun-Earth-Moon system
     */
    'sun-earth-moon': {
        name: 'Sun-Earth-Moon',
        description: 'Three-body system with accurate relative positions',
        timestep: 600, // 10 minutes for Moon accuracy
        bodies: [
            // Sun
            {
                name: 'Sun',
                type: BodyType.STAR,
                mass: SOLAR_MASS,
                radius: SOLAR_RADIUS,
                x: 0, y: 0, z: 0,
                vx: 0, vy: 0, vz: 0,
                color: 0xffdd44,
                luminosity: 3.828e26,
            },
            // Earth
            {
                name: 'Earth',
                type: BodyType.PLANET,
                mass: EARTH_MASS,
                radius: EARTH_RADIUS,
                x: AU, y: 0, z: 0,
                vx: 0, vy: 2.978e4, vz: 0,
                color: 0x4488ff,
                hasAtmosphere: true,
            },
            // Moon
            {
                name: 'Moon',
                type: BodyType.MOON,
                mass: MOON_MASS,
                radius: 1.7374e6,
                x: AU + 3.844e8, y: 0, z: 0,  // Earth + 384,400 km
                vx: 0, vy: 2.978e4 + 1.022e3, vz: 0,  // Earth velocity + 1.022 km/s
                color: 0xaaaaaa,
                hasAtmosphere: false,
            },
        ],
    },

    /**
     * Binary star system - Two equal mass stars in circular orbit
     */
    'binary-stars': {
        name: 'Binary Stars',
        description: 'Two solar-mass stars in stable circular orbit',
        timestep: 3600,
        bodies: [
            // Star A
            {
                name: 'Star A',
                type: BodyType.STAR,
                mass: SOLAR_MASS,
                radius: SOLAR_RADIUS,
                x: -0.5 * AU, y: 0, z: 0,
                vx: 0, vy: -2.1e4, vz: 0,  // Orbital velocity for 1 AU separation
                color: 0xffdd44,
                luminosity: 3.828e26,
            },
            // Star B
            {
                name: 'Star B',
                type: BodyType.STAR,
                mass: SOLAR_MASS,
                radius: SOLAR_RADIUS,
                x: 0.5 * AU, y: 0, z: 0,
                vx: 0, vy: 2.1e4, vz: 0,
                color: 0xff8844,
                luminosity: 3.828e26,
            },
        ],
    },

    /**
     * Triple star system - Hierarchical configuration
     * Inner binary + distant third star
     */
    'triple-star': {
        name: 'Triple Star',
        description: 'Hierarchical triple: close binary with distant companion',
        timestep: 1800,
        bodies: [
            // Inner binary - Star A
            {
                name: 'Star A',
                type: BodyType.STAR,
                mass: SOLAR_MASS,
                radius: SOLAR_RADIUS,
                x: -0.25 * AU, y: 0, z: 0,
                vx: 0, vy: -3.0e4, vz: 0,
                color: 0xffdd44,
                luminosity: 3.828e26,
            },
            // Inner binary - Star B
            {
                name: 'Star B',
                type: BodyType.STAR,
                mass: SOLAR_MASS,
                radius: SOLAR_RADIUS,
                x: 0.25 * AU, y: 0, z: 0,
                vx: 0, vy: 3.0e4, vz: 0,
                color: 0xff8844,
                luminosity: 3.828e26,
            },
            // Distant companion - Star C
            {
                name: 'Star C',
                type: BodyType.STAR,
                mass: 0.5 * SOLAR_MASS,
                radius: 0.7 * SOLAR_RADIUS,
                x: 5 * AU, y: 0, z: 0,
                vx: 0, vy: 1.33e4, vz: 0,
                color: 0xffaaaa,
                luminosity: 0.5 * 3.828e26,
            },
        ],
    },

    /**
     * Figure-8 Three-Body Solution
     * 
     * This is the famous stable periodic solution discovered by Moore (1993)
     * and proven by Chenciner & Montgomery (2000).
     * 
     * Three equal masses chase each other along a figure-8 shaped path.
     * Initial conditions from Simó (2001), scaled to solar masses and AU.
     * 
     * Original normalized values (G=1, m=1, period≈6.32):
     * x1 = 0.97000436, y1 = -0.24308753
     * vx1 = 0.4662036850, vy1 = 0.4323657300
     * (other two bodies by rotation symmetry)
     */
    'figure-eight': {
        name: 'Figure-8 (3-body)',
        description: 'Stable periodic three-body solution (Moore/Chenciner-Montgomery)',
        timestep: 86400, // 1 day
        bodies: (() => {
            // Scale factor: we use AU for distance, need to compute velocities
            // For G*M = 1 in normalized units, with M = solar mass, scale is:
            const L = AU;  // Length scale
            const M = SOLAR_MASS;  // Mass scale
            const G = 6.67430e-11;
            // Time scale: T = sqrt(L³/(G*M))
            const T = Math.sqrt(L * L * L / (G * M));
            // Velocity scale: V = L/T
            const V = L / T;
            
            // Normalized initial conditions (Simó)
            const x0 = 0.97000436;
            const y0 = -0.24308753;
            const vx0 = 0.4662036850;
            const vy0 = 0.4323657300;
            
            return [
                {
                    name: 'Body 1',
                    type: BodyType.STAR,
                    mass: M,
                    radius: SOLAR_RADIUS * 0.3,
                    x: x0 * L, y: y0 * L, z: 0,
                    vx: vx0 * V, vy: vy0 * V, vz: 0,
                    color: 0xff4444,
                    luminosity: 1e26,
                },
                {
                    name: 'Body 2',
                    type: BodyType.STAR,
                    mass: M,
                    radius: SOLAR_RADIUS * 0.3,
                    x: -x0 * L, y: -y0 * L, z: 0,
                    vx: vx0 * V, vy: vy0 * V, vz: 0,
                    color: 0x44ff44,
                    luminosity: 1e26,
                },
                {
                    name: 'Body 3',
                    type: BodyType.STAR,
                    mass: M,
                    radius: SOLAR_RADIUS * 0.3,
                    x: 0, y: 0, z: 0,
                    vx: -2 * vx0 * V, vy: -2 * vy0 * V, vz: 0,
                    color: 0x4444ff,
                    luminosity: 1e26,
                },
            ];
        })(),
    },

    /**
     * Black hole with accretion disk proxy (test particles)
     */
    'black-hole-system': {
        name: 'Black Hole System',
        description: 'Stellar-mass black hole with test particles',
        timestep: 1,
        bodies: [
            // Black hole (10 solar masses)
            {
                name: 'Black Hole',
                type: BodyType.BLACK_HOLE,
                mass: 10 * SOLAR_MASS,
                x: 0, y: 0, z: 0,
                vx: 0, vy: 0, vz: 0,
            },
            // Test particle 1 - close orbit
            {
                name: 'Particle 1',
                type: BodyType.PLANET,
                mass: 1e20, // Very small
                radius: 1e6,
                x: 1e8, y: 0, z: 0,
                vx: 0, vy: 1.15e6, vz: 0,
                color: 0x88ffff,
            },
            // Test particle 2 - medium orbit
            {
                name: 'Particle 2',
                type: BodyType.PLANET,
                mass: 1e20,
                radius: 1e6,
                x: 5e8, y: 0, z: 0,
                vx: 0, vy: 5.2e5, vz: 0,
                color: 0xff88ff,
            },
        ],
    },

    /**
     * Pulsar binary system
     */
    'pulsar-binary': {
        name: 'Pulsar Binary',
        description: 'Pulsar with companion star',
        timestep: 100,
        bodies: [
            // Pulsar
            {
                name: 'Pulsar',
                type: BodyType.PULSAR,
                mass: 1.4 * SOLAR_MASS,
                radius: 12000,
                x: 0, y: 0, z: 0,
                vx: 0, vy: 0, vz: 0,
                rotationPeriod: 0.033, // 33 ms
            },
            // Companion star
            {
                name: 'Companion',
                type: BodyType.STAR,
                mass: 0.5 * SOLAR_MASS,
                radius: 0.5 * SOLAR_RADIUS,
                x: 5e9, y: 0, z: 0, // Close orbit
                vx: 0, vy: 1.9e5, vz: 0,
                color: 0xffaaaa,
            },
        ],
    },
};

/**
 * Load a preset into the simulation
 * @param {string} presetId - Preset identifier
 * @returns {boolean} Success status
 */
export function loadPreset(presetId) {
    const preset = Presets[presetId];
    if (!preset) {
        console.error(`Unknown preset: ${presetId}`);
        return false;
    }
    
    const simulation = getSimulation();
    
    // Clear existing bodies
    simulation.clearBodies();
    
    // Set timestep if specified
    if (preset.timestep) {
        simulation.timestep = preset.timestep;
    }
    
    // Add bodies
    for (const bodyData of preset.bodies) {
        const body = new Body(bodyData);
        simulation.addBody(body);
    }
    
    // Reset simulation state
    simulation.reset();
    
    console.log(`Loaded preset: ${preset.name} (${simulation.bodies.length} bodies)`);
    return true;
}

/**
 * Get list of available presets
 * @returns {Array<{id: string, name: string, description: string}>}
 */
export function getPresetList() {
    return Object.entries(Presets).map(([id, preset]) => ({
        id,
        name: preset.name,
        description: preset.description,
    }));
}

/**
 * Create default body parameters for a given type
 * @param {string} type - Body type
 * @returns {Object} Default parameters
 */
export function getDefaultBodyParams(type) {
    switch (type) {
        case BodyType.STAR:
            return {
                name: 'New Star',
                type: BodyType.STAR,
                mass: SOLAR_MASS,
                radius: SOLAR_RADIUS,
                color: 0xffdd44,
                luminosity: 3.828e26,
            };
            
        case BodyType.PLANET:
            return {
                name: 'New Planet',
                type: BodyType.PLANET,
                mass: EARTH_MASS,
                radius: EARTH_RADIUS,
                color: 0x4488ff,
                hasAtmosphere: true,
            };
            
        case BodyType.MOON:
            return {
                name: 'New Moon',
                type: BodyType.MOON,
                mass: MOON_MASS,
                radius: 1.7374e6,
                color: 0xaaaaaa,
            };
            
        case BodyType.COMET:
            return {
                name: 'New Comet',
                type: BodyType.COMET,
                mass: 1e13,
                radius: 5000,
                color: 0x88ffff,
                tailLength: 1.0,
            };
            
        case BodyType.SPACESHIP:
            return {
                name: 'Spacecraft',
                type: BodyType.SPACESHIP,
                mass: 1e5,
                radius: 100,
                color: 0xff88ff,
                isGravitySource: false, // Too small to affect others
            };
            
        case BodyType.BLACK_HOLE:
            return {
                name: 'Black Hole',
                type: BodyType.BLACK_HOLE,
                mass: 10 * SOLAR_MASS,
                color: 0x000000,
            };
            
        case BodyType.NEUTRON_STAR:
            return {
                name: 'Neutron Star',
                type: BodyType.NEUTRON_STAR,
                mass: 1.4 * SOLAR_MASS,
                radius: 12000,
                color: 0x44ffff,
            };
            
        case BodyType.PULSAR:
            return {
                name: 'Pulsar',
                type: BodyType.PULSAR,
                mass: 1.4 * SOLAR_MASS,
                radius: 12000,
                rotationPeriod: 0.1,
                color: 0xffff44,
            };
            
        case BodyType.MAGNETAR:
            return {
                name: 'Magnetar',
                type: BodyType.MAGNETAR,
                mass: 1.5 * SOLAR_MASS,
                radius: 12000,
                rotationPeriod: 5.0,
                magneticFieldStrength: 1e11,
                color: 0xff44ff,
            };
            
        default:
            return {
                name: 'New Body',
                type: BodyType.PLANET,
                mass: EARTH_MASS,
                radius: EARTH_RADIUS,
            };
    }
}

export default {
    Presets,
    loadPreset,
    getPresetList,
    getDefaultBodyParams,
};
