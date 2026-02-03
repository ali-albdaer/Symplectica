/**
 * Celestial Body Types and Interfaces
 * ====================================
 * All units are SI (meters, kilograms, seconds).
 */
/**
 * Body classification for physics calculations
 */
export var BodyType;
(function (BodyType) {
    /** Massive body that exerts gravity (stars, planets, moons) */
    BodyType["MASSIVE"] = "massive";
    /** Passive object that receives gravity but doesn't exert it (ships, debris) */
    BodyType["PASSIVE"] = "passive";
})(BodyType || (BodyType = {}));
/**
 * Visual classification for rendering
 */
export var BodyClass;
(function (BodyClass) {
    BodyClass["STAR"] = "star";
    BodyClass["BLACK_HOLE"] = "black_hole";
    BodyClass["NEUTRON_STAR"] = "neutron_star";
    BodyClass["PULSAR"] = "pulsar";
    BodyClass["GAS_GIANT"] = "gas_giant";
    BodyClass["ICE_GIANT"] = "ice_giant";
    BodyClass["TERRESTRIAL"] = "terrestrial";
    BodyClass["DWARF_PLANET"] = "dwarf_planet";
    BodyClass["MOON"] = "moon";
    BodyClass["ASTEROID"] = "asteroid";
    BodyClass["COMET"] = "comet";
    BodyClass["SPACECRAFT"] = "spacecraft";
    BodyClass["STATION"] = "station";
    BodyClass["DEBRIS"] = "debris";
})(BodyClass || (BodyClass = {}));
/**
 * Spectral class for stars
 */
export var SpectralClass;
(function (SpectralClass) {
    SpectralClass["O"] = "O";
    SpectralClass["B"] = "B";
    SpectralClass["A"] = "A";
    SpectralClass["F"] = "F";
    SpectralClass["G"] = "G";
    SpectralClass["K"] = "K";
    SpectralClass["M"] = "M";
    SpectralClass["L"] = "L";
    SpectralClass["T"] = "T";
    SpectralClass["Y"] = "Y"; // Infrared, < 550 K (brown dwarf)
})(SpectralClass || (SpectralClass = {}));
/**
 * Default atmosphere for Earth-like planets
 */
export const DEFAULT_EARTH_ATMOSPHERE = {
    hasAtmosphere: true,
    surfacePressure: 101325, // Pa
    scaleHeight: 8500, // m
    composition: [
        { gas: 'N2', fraction: 0.78, molarMass: 0.028 },
        { gas: 'O2', fraction: 0.21, molarMass: 0.032 },
        { gas: 'Ar', fraction: 0.009, molarMass: 0.040 },
        { gas: 'CO2', fraction: 0.0004, molarMass: 0.044 }
    ],
    rayleighCoefficients: [5.8e-6, 13.5e-6, 33.1e-6], // Per meter
    mieCoefficient: 21e-6,
    mieDirectionality: 0.758
};
/**
 * Default terrain for rocky planets
 */
export const DEFAULT_ROCKY_TERRAIN = {
    seed: 0,
    terrainType: 'rocky',
    maxDisplacement: 10000, // 10 km max mountains
    octaves: 8,
    frequency: 1,
    lacunarity: 2.0,
    persistence: 0.5,
    hasLiquid: false,
    seaLevel: 0.5
};
//# sourceMappingURL=types.js.map