// SI Constants
export const PHYS = {
    G: 6.67430e-11,       // Gravitational Constant (m^3 kg^-1 s^-2)
    c: 299792458,         // Speed of Light (m/s)
    AU: 1.496e11,         // Astronomical Unit (m)
    LY: 9.461e15,         // Light Year (m)
    
    // Solar System Reference
    MASS_SUN: 1.989e30,   // kg
    MASS_EARTH: 5.972e24, // kg
    MASS_JUPITER: 1.898e27,// kg
    MASS_MOON: 7.342e22,  // kg
    
    RADIUS_SUN: 6.9634e8, // m
    RADIUS_EARTH: 6.371e6,// m
    RADIUS_JUPITER: 6.9911e7,// m
    
    // Time
    YEAR: 31536000,       // Seconds in a year (approx)
    DAY: 86400            // Seconds in a day
};

// Simulation Constants
export const SIM = {
    MAX_DT: 86400 * 10,   // Max timestep clamp (10 days)
    MIN_DT: 0.1,          // Min timestep
    SOFTENING: 100,       // Softening parameter to avoid singularities (m) - relatively small for space
    G_CONSTANT: PHYS.G,   // Alias
};

export class Units {
    static formatMass(kg) {
        if (kg > PHYS.MASS_SUN * 0.1) return (kg / PHYS.MASS_SUN).toFixed(2) + ' M☉';
        if (kg > PHYS.MASS_EARTH * 0.1) return (kg / PHYS.MASS_EARTH).toFixed(2) + ' M⊕';
        return kg.toExponential(2) + ' kg';
    }

    static formatDistance(m) {
        if (m > PHYS.LY * 0.1) return (m / PHYS.LY).toFixed(2) + ' ly';
        if (m > PHYS.AU * 0.1) return (m / PHYS.AU).toFixed(2) + ' AU';
        if (m > 1000) return (m / 1000).toFixed(0) + ' km';
        return m.toFixed(0) + ' m';
    }
}