/**
 * constants.js - Physical Constants and Unit Conversions
 * 
 * All physics calculations use SI units internally:
 * - Distance: meters (m)
 * - Mass: kilograms (kg)
 * - Time: seconds (s)
 * - Velocity: meters per second (m/s)
 * - Force: Newtons (N)
 * - Energy: Joules (J)
 * - Angular Momentum: kg·m²/s
 * 
 * Display conversions provided for human-readable output.
 */

// ============================================
// Fundamental Physical Constants
// ============================================

/** Gravitational constant in m³/(kg·s²) - CODATA 2018 */
export const G = 6.67430e-11;

/** Speed of light in m/s - exact by definition */
export const C = 299792458;

/** Speed of light squared */
export const C_SQUARED = C * C;

// ============================================
// Astronomical Constants (IAU nominal values)
// ============================================

/** Solar mass in kg */
export const SOLAR_MASS = 1.98892e30;

/** Earth mass in kg */
export const EARTH_MASS = 5.9722e24;

/** Moon mass in kg */
export const MOON_MASS = 7.342e22;

/** Jupiter mass in kg */
export const JUPITER_MASS = 1.89813e27;

/** Astronomical Unit in meters - IAU 2012 */
export const AU = 1.495978707e11;

/** Solar radius in meters */
export const SOLAR_RADIUS = 6.9634e8;

/** Earth radius in meters */
export const EARTH_RADIUS = 6.371e6;

/** Light year in meters */
export const LIGHT_YEAR = 9.4607e15;

/** Parsec in meters */
export const PARSEC = 3.0857e16;

// ============================================
// Time Constants
// ============================================

/** Seconds in a minute */
export const MINUTE = 60;

/** Seconds in an hour */
export const HOUR = 3600;

/** Seconds in a day */
export const DAY = 86400;

/** Seconds in a Julian year (365.25 days) */
export const YEAR = 31557600;

// ============================================
// Compact Object Constants
// ============================================

/** 
 * Schwarzschild radius coefficient: r_s = 2GM/c²
 * Pre-computed: 2G/c² in m/kg
 */
export const SCHWARZSCHILD_COEFF = (2 * G) / C_SQUARED;

/**
 * Typical neutron star mass (1.4 solar masses)
 */
export const NEUTRON_STAR_MASS = 1.4 * SOLAR_MASS;

/**
 * Typical neutron star radius in meters (~10-15 km)
 */
export const NEUTRON_STAR_RADIUS = 12000;

/**
 * Chandrasekhar limit - maximum white dwarf mass
 */
export const CHANDRASEKHAR_LIMIT = 1.44 * SOLAR_MASS;

/**
 * Tolman–Oppenheimer–Volkoff limit - approximate max neutron star mass
 */
export const TOV_LIMIT = 2.17 * SOLAR_MASS;

// ============================================
// Display Unit Conversions
// ============================================

export const Units = {
    /**
     * Convert meters to AU
     */
    metersToAU(m) {
        return m / AU;
    },

    /**
     * Convert AU to meters
     */
    auToMeters(au) {
        return au * AU;
    },

    /**
     * Convert meters to kilometers
     */
    metersToKm(m) {
        return m / 1000;
    },

    /**
     * Convert kilometers to meters
     */
    kmToMeters(km) {
        return km * 1000;
    },

    /**
     * Convert seconds to days
     */
    secondsToDays(s) {
        return s / DAY;
    },

    /**
     * Convert days to seconds
     */
    daysToSeconds(d) {
        return d * DAY;
    },

    /**
     * Convert seconds to years
     */
    secondsToYears(s) {
        return s / YEAR;
    },

    /**
     * Convert years to seconds
     */
    yearsToSeconds(y) {
        return y * YEAR;
    },

    /**
     * Convert kg to solar masses
     */
    kgToSolarMass(kg) {
        return kg / SOLAR_MASS;
    },

    /**
     * Convert solar masses to kg
     */
    solarMassToKg(sm) {
        return sm * SOLAR_MASS;
    },

    /**
     * Convert kg to Earth masses
     */
    kgToEarthMass(kg) {
        return kg / EARTH_MASS;
    },

    /**
     * Convert Earth masses to kg
     */
    earthMassToKg(em) {
        return em * EARTH_MASS;
    },

    /**
     * Calculate Schwarzschild radius for a given mass
     * @param {number} mass - Mass in kg
     * @returns {number} Schwarzschild radius in meters
     */
    schwarzschildRadius(mass) {
        return SCHWARZSCHILD_COEFF * mass;
    },

    /**
     * Format a number in scientific notation
     * @param {number} value - The value to format
     * @param {number} precision - Decimal places (default 3)
     * @returns {string} Formatted string
     */
    toScientific(value, precision = 3) {
        if (value === 0) return '0';
        const exp = Math.floor(Math.log10(Math.abs(value)));
        const mantissa = value / Math.pow(10, exp);
        return `${mantissa.toFixed(precision)}e${exp}`;
    },

    /**
     * Format a number with SI prefix
     * @param {number} value - The value to format
     * @param {string} unit - Base unit string
     * @returns {string} Formatted string with SI prefix
     */
    toSIPrefix(value, unit = '') {
        const prefixes = [
            { threshold: 1e24, symbol: 'Y' },
            { threshold: 1e21, symbol: 'Z' },
            { threshold: 1e18, symbol: 'E' },
            { threshold: 1e15, symbol: 'P' },
            { threshold: 1e12, symbol: 'T' },
            { threshold: 1e9, symbol: 'G' },
            { threshold: 1e6, symbol: 'M' },
            { threshold: 1e3, symbol: 'k' },
            { threshold: 1, symbol: '' },
            { threshold: 1e-3, symbol: 'm' },
            { threshold: 1e-6, symbol: 'μ' },
            { threshold: 1e-9, symbol: 'n' },
        ];

        const absValue = Math.abs(value);
        for (const { threshold, symbol } of prefixes) {
            if (absValue >= threshold) {
                return `${(value / threshold).toFixed(2)} ${symbol}${unit}`;
            }
        }
        return `${value.toExponential(2)} ${unit}`;
    },

    /**
     * Format time duration in appropriate units
     * @param {number} seconds - Time in seconds
     * @returns {string} Human-readable time string
     */
    formatTime(seconds) {
        if (seconds < MINUTE) {
            return `${seconds.toFixed(1)} s`;
        } else if (seconds < HOUR) {
            return `${(seconds / MINUTE).toFixed(1)} min`;
        } else if (seconds < DAY) {
            return `${(seconds / HOUR).toFixed(2)} hours`;
        } else if (seconds < YEAR) {
            return `${(seconds / DAY).toFixed(2)} days`;
        } else {
            return `${(seconds / YEAR).toFixed(3)} years`;
        }
    },

    /**
     * Format distance in appropriate units
     * @param {number} meters - Distance in meters
     * @returns {string} Human-readable distance string
     */
    formatDistance(meters) {
        const absM = Math.abs(meters);
        if (absM < 1000) {
            return `${meters.toFixed(1)} m`;
        } else if (absM < AU * 0.01) {
            return `${(meters / 1000).toFixed(1)} km`;
        } else if (absM < LIGHT_YEAR * 0.1) {
            return `${(meters / AU).toFixed(4)} AU`;
        } else {
            return `${(meters / LIGHT_YEAR).toFixed(4)} ly`;
        }
    },

    /**
     * Format mass in appropriate units
     * @param {number} kg - Mass in kg
     * @returns {string} Human-readable mass string
     */
    formatMass(kg) {
        if (kg < EARTH_MASS * 0.01) {
            return this.toSIPrefix(kg, 'kg');
        } else if (kg < SOLAR_MASS * 0.001) {
            return `${(kg / EARTH_MASS).toFixed(3)} M⊕`;
        } else {
            return `${(kg / SOLAR_MASS).toFixed(6)} M☉`;
        }
    }
};

// ============================================
// Simulation Constants (defaults)
// ============================================

export const SimDefaults = {
    /** Default timestep in seconds (1 hour) */
    TIMESTEP: 3600,

    /** 
     * Default softening parameter in meters 
     * Prevents singularities when bodies get very close
     * Set to roughly Earth radius to smooth close approaches
     */
    SOFTENING: 1e7,

    /** Maximum allowed relative energy error before warning */
    MAX_ENERGY_ERROR: 0.01,

    /** Maximum allowed relative energy error before critical warning */
    CRITICAL_ENERGY_ERROR: 0.1,

    /** Default view scale (meters per screen unit) */
    VIEW_SCALE: AU / 100,

    /** Minimum distance to prevent division by zero (meters) */
    MIN_DISTANCE: 1e6,

    /** Maximum bodies for O(n²) pairwise calculation */
    MAX_PAIRWISE_BODIES: 1000,
};

// ============================================
// Performance Presets
// ============================================

export const PerformancePresets = {
    low: {
        name: 'Low',
        maxTrailPoints: 50,
        shadowMapSize: 512,
        antialias: false,
        effectsEnabled: false,
        substeps: 1,
    },
    medium: {
        name: 'Medium',
        maxTrailPoints: 200,
        shadowMapSize: 1024,
        antialias: true,
        effectsEnabled: true,
        substeps: 2,
    },
    high: {
        name: 'High',
        maxTrailPoints: 500,
        shadowMapSize: 2048,
        antialias: true,
        effectsEnabled: true,
        substeps: 4,
    },
    ultra: {
        name: 'Ultra',
        maxTrailPoints: 1000,
        shadowMapSize: 4096,
        antialias: true,
        effectsEnabled: true,
        substeps: 8,
    }
};

export default {
    G,
    C,
    C_SQUARED,
    SOLAR_MASS,
    EARTH_MASS,
    MOON_MASS,
    JUPITER_MASS,
    AU,
    SOLAR_RADIUS,
    EARTH_RADIUS,
    SCHWARZSCHILD_COEFF,
    DAY,
    YEAR,
    Units,
    SimDefaults,
    PerformancePresets,
};
