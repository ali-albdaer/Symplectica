import { PHYS } from '../utils/Constants.js';

export const PRESETS = {
    solar_system: [
        {
            name: "Sun",
            type: "STAR",
            mass: PHYS.MASS_SUN,
            radius: PHYS.RADIUS_SUN,
            pos: { x: 0, y: 0, z: 0 },
            vel: { x: 0, y: 0, z: 0 },
            color: 0xffff00
        },
        {
            name: "Earth",
            type: "PLANET",
            mass: PHYS.MASS_EARTH,
            radius: PHYS.RADIUS_EARTH,
            pos: { x: PHYS.AU, y: 0, z: 0 },
            vel: { x: 0, y: 0, z: 29780 }, // approx orbital velocity
            color: 0x2233ff
        },
        {
            name: "Jupiter",
            type: "PLANET",
            mass: PHYS.MASS_JUPITER,
            radius: PHYS.RADIUS_JUPITER,
            pos: { x: 5.2 * PHYS.AU, y: 0, z: 0 },
            vel: { x: 0, y: 0, z: 13070 },
            color: 0xffaa88
        }
    ],

    sun_earth_moon: [
        {
            name: "Sun",
            type: "STAR",
            mass: PHYS.MASS_SUN,
            radius: PHYS.RADIUS_SUN,
            pos: { x: 0, y: 0, z: 0 },
            vel: { x: 0, y: 0, z: 0 },
            color: 0xffff00
        },
        {
            name: "Earth",
            type: "PLANET",
            mass: PHYS.MASS_EARTH,
            radius: PHYS.RADIUS_EARTH,
            pos: { x: PHYS.AU, y: 0, z: 0 },
            vel: { x: 0, y: 0, z: 29780 },
            color: 0x2233ff
        },
        {
            name: "Moon",
            type: "MOON",
            mass: PHYS.MASS_MOON,
            radius: 1737000,
            pos: { x: PHYS.AU + 384400000, y: 0, z: 0 },
            vel: { x: 0, y: 0, z: 29780 + 1022 },
            color: 0xaaaaaa
        }
    ],

    // Famous stable figure-8 solution for 3 body (Chenciner & Montgomery)
    // Scaled up to be visible
    three_body_stable: [
        { name: "A", type: "STAR", mass: PHYS.MASS_SUN, radius: PHYS.RADIUS_SUN/2, pos: {x: 0.97000436 * PHYS.AU, y: -0.24308753 * PHYS.AU, z:0}, vel: {x: 0.4662036850 * 30000, y: 0.4323657300 * 30000, z:0}, color: 0xff0000 },
        { name: "B", type: "STAR", mass: PHYS.MASS_SUN, radius: PHYS.RADIUS_SUN/2, pos: {x: -0.97000436 * PHYS.AU, y: 0.24308753 * PHYS.AU, z:0}, vel: {x: 0.4662036850 * 30000, y: 0.4323657300 * 30000, z:0}, color: 0x00ff00 },
        { name: "C", type: "STAR", mass: PHYS.MASS_SUN, radius: PHYS.RADIUS_SUN/2, pos: {x: 0, y: 0, z:0}, vel: {x: -2 * 0.4662036850 * 30000, y: -2 * 0.4323657300 * 30000, z:0}, color: 0x0000ff }
    ],

    black_hole_test: [
         {
            name: "Black Hole",
            type: "BLACK_HOLE",
            mass: PHYS.MASS_SUN * 10,
            radius: 30000, // Event horizon is ~30km, this is just visual
            pos: { x: 0, y: 0, z: 0 },
            vel: { x: 0, y: 0, z: 0 },
            color: 0x000000
        },
        {
            name: "Probe",
            type: "PLANET",
            mass: 1000,
            radius: 100,
            pos: { x: PHYS.AU * 0.01, y: 0, z: 0 }, // Close to BH
            vel: { x: 0, y: 0, z: 3.5e6 }, // Fast Tangential
            color: 0xffffff
        }
    ]
};