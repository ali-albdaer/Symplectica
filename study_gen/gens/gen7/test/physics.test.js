/**
 * Physics Standard Scenario Tests
 * Validates N-body simulation accuracy.
 */

import { NBodySimulation } from '../shared/physics/nbody.js';
import { loadUniverse } from '../shared/universe/schema.js';
import { Vector3D } from '../shared/math/Vector3D.js';
import { G, AU, PHYSICS_HZ } from '../shared/physics/constants.js';
import { strict as assert } from 'assert';
import { test, describe } from 'node:test';

// Import presets
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const minimalPreset = require('../shared/universe/presets/minimal.json');

describe('N-Body Physics Core', () => {
  
  test('Feature 2 Test: Earth-Moon stability for 10,000 ticks', () => {
    console.log('  Testing Earth-Moon orbital stability...');
    
    const sim = new NBodySimulation();
    loadUniverse(minimalPreset, sim);
    
    const earth = sim.getBody('earth');
    const moon = sim.getBody('moon');
    
    // Record initial orbital distance
    const initialDistance = earth.position.distanceTo(moon.position);
    console.log(`  Initial Moon distance: ${(initialDistance / 1000).toFixed(0)} km`);
    
    // Run for 10,000 ticks (~2.8 minutes of simulation time)
    sim.stepMultiple(10000);
    
    // Check final orbital distance
    const finalDistance = earth.position.distanceTo(moon.position);
    console.log(`  Final Moon distance: ${(finalDistance / 1000).toFixed(0)} km`);
    
    // Allow 5% drift over short simulation (accumulates over long runs)
    const drift = Math.abs(finalDistance - initialDistance) / initialDistance;
    console.log(`  Orbital drift: ${(drift * 100).toFixed(3)}%`);
    
    assert.ok(drift < 0.05, `Orbital drift ${(drift * 100).toFixed(2)}% exceeds 5% threshold`);
    console.log('  ✓ Earth-Moon stability test passed');
  });

  test('Orbital velocity calculation accuracy', () => {
    console.log('  Testing orbital velocity formula...');
    
    // Earth's orbital velocity around Sun
    const sunMass = 1.989e30;
    const earthOrbitRadius = 1.496e11;
    
    const calculatedVelocity = NBodySimulation.calculateOrbitalVelocity(sunMass, earthOrbitRadius);
    const expectedVelocity = 29780; // m/s (known Earth orbital velocity)
    
    const error = Math.abs(calculatedVelocity - expectedVelocity) / expectedVelocity;
    console.log(`  Calculated: ${calculatedVelocity.toFixed(0)} m/s`);
    console.log(`  Expected: ${expectedVelocity} m/s`);
    console.log(`  Error: ${(error * 100).toFixed(2)}%`);
    
    assert.ok(error < 0.01, `Orbital velocity error ${(error * 100).toFixed(2)}% exceeds 1%`);
    console.log('  ✓ Orbital velocity test passed');
  });

  test('SOI calculation for Earth', () => {
    console.log('  Testing Sphere of Influence calculation...');
    
    const sunMass = 1.989e30;
    const earthMass = 5.972e24;
    const earthSemiMajor = 1.496e11;
    
    const soiRadius = NBodySimulation.calculateSOI(earthMass, sunMass, earthSemiMajor);
    const expectedSOI = 9.24e8; // ~924,000 km (known Earth SOI)
    
    const error = Math.abs(soiRadius - expectedSOI) / expectedSOI;
    console.log(`  Calculated: ${(soiRadius / 1000).toFixed(0)} km`);
    console.log(`  Expected: ${(expectedSOI / 1000).toFixed(0)} km`);
    console.log(`  Error: ${(error * 100).toFixed(2)}%`);
    
    assert.ok(error < 0.05, `SOI error ${(error * 100).toFixed(2)}% exceeds 5%`);
    console.log('  ✓ SOI calculation test passed');
  });

  test('Energy conservation (approximate)', () => {
    console.log('  Testing energy conservation...');
    
    const sim = new NBodySimulation();
    loadUniverse(minimalPreset, sim);
    
    // Calculate initial total energy
    const calcEnergy = () => {
      let kinetic = 0;
      let potential = 0;
      
      const bodies = sim.getAllBodies();
      for (const body of bodies) {
        // Kinetic energy: 0.5 * m * v²
        const vSq = body.velocity.lengthSquared();
        kinetic += 0.5 * body.mass * vSq;
        
        // Gravitational potential energy (pairwise)
        for (const other of bodies) {
          if (body.id >= other.id) continue;
          const r = body.position.distanceTo(other.position);
          potential -= (G * body.mass * other.mass) / r;
        }
      }
      
      return kinetic + potential;
    };
    
    const initialEnergy = calcEnergy();
    console.log(`  Initial energy: ${initialEnergy.toExponential(4)} J`);
    
    // Run 1000 ticks
    sim.stepMultiple(1000);
    
    const finalEnergy = calcEnergy();
    console.log(`  Final energy: ${finalEnergy.toExponential(4)} J`);
    
    // Energy drift (symplectic integrators have bounded energy error)
    const drift = Math.abs(finalEnergy - initialEnergy) / Math.abs(initialEnergy);
    console.log(`  Energy drift: ${(drift * 100).toExponential(2)}%`);
    
    // Velocity Verlet should conserve energy well
    assert.ok(drift < 0.001, `Energy drift ${(drift * 100).toFixed(4)}% exceeds 0.1%`);
    console.log('  ✓ Energy conservation test passed');
  });

  test('NaN/Infinity detection', () => {
    console.log('  Testing validation of invalid states...');
    
    const sim = new NBodySimulation();
    
    // Try to add body with NaN position
    let caught = false;
    try {
      sim.addBody({
        id: 'test',
        name: 'Test',
        type: 'planet',
        mass: 1e24,
        radius: 1e6,
        position: { x: NaN, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
      });
    } catch (e) {
      caught = true;
      console.log(`  Correctly caught: ${e.message}`);
    }
    
    assert.ok(caught, 'Should throw error for NaN position');
    console.log('  ✓ Validation test passed');
  });

});

describe('Vector3D Mathematics', () => {
  
  test('Vector operations accuracy', () => {
    console.log('  Testing vector math...');
    
    const a = new Vector3D(3, 4, 0);
    const b = new Vector3D(1, 2, 3);
    
    // Length
    assert.strictEqual(a.length(), 5, 'Length of (3,4,0) should be 5');
    
    // Dot product
    const c = a.clone();
    assert.strictEqual(c.dot(b), 11, 'Dot product should be 11');
    
    // Cross product
    const d = new Vector3D(1, 0, 0);
    const e = new Vector3D(0, 1, 0);
    const cross = d.clone().cross(e);
    assert.strictEqual(cross.z, 1, 'Cross product of X and Y unit vectors should be Z');
    
    console.log('  ✓ Vector math tests passed');
  });

  test('High precision at AU scales', () => {
    console.log('  Testing precision at astronomical scales...');
    
    const pos1 = new Vector3D(AU, 0, 0);
    const pos2 = new Vector3D(AU + 1000, 0, 0); // 1 km offset
    
    const distance = pos1.distanceTo(pos2);
    const error = Math.abs(distance - 1000) / 1000;
    
    console.log(`  Distance at 1 AU with 1km offset: ${distance.toFixed(6)} m`);
    console.log(`  Error: ${(error * 100).toExponential(2)}%`);
    
    // Should be accurate to millimeter at AU scales
    assert.ok(error < 1e-10, 'Precision loss at AU scales');
    console.log('  ✓ Precision test passed');
  });

});

console.log('\n========================================');
console.log(' Project Odyssey - Physics Test Suite');
console.log('========================================\n');
