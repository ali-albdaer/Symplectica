/**
 * Physics Verification Tests
 * ==========================
 * Automated tests to verify physical accuracy of the simulator.
 * 
 * All tests include mathematical justification and expected vs actual comparisons.
 */

import {
  PhysicsEngine,
  CelestialBody,
  Vector3,
  G,
  AU,
  SOLAR_MASS,
  EARTH_MASS,
  EARTH_RADIUS,
  SECONDS_PER_DAY,
  calculateOrbitalPeriod,
  calculateOrbitalVelocity,
  GravityMethod,
} from '../index.js';

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  error: string;
  tolerance: string;
}

/**
 * Run all physics verification tests
 */
export async function runPhysicsTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Kepler's Third Law
  results.push(testKeplersThirdLaw());

  // Test 2: Energy Conservation
  results.push(await testEnergyConservation());

  // Test 3: Angular Momentum Conservation
  results.push(await testAngularMomentumConservation());

  // Test 4: Circular Orbit Stability
  results.push(await testCircularOrbitStability());

  // Test 5: Escape Velocity
  results.push(testEscapeVelocity());

  // Test 6: Gravitational Acceleration
  results.push(testGravitationalAcceleration());

  // Test 7: Two-Body Barycenter
  results.push(await testBarycenter());

  // Test 8: Earth Orbital Period
  results.push(await testEarthOrbitalPeriod());

  return results;
}

/**
 * Test 1: Kepler's Third Law
 * T² = 4π²a³/(GM)
 * 
 * For Earth: T = 365.256 days, a = 1 AU, M = M☉
 */
function testKeplersThirdLaw(): TestResult {
  const a = AU;
  const M = SOLAR_MASS;

  const T_calculated = calculateOrbitalPeriod(a, M);
  const T_expected = 365.256 * SECONDS_PER_DAY;

  const errorPercent = Math.abs(T_calculated - T_expected) / T_expected * 100;
  const tolerance = 0.01; // 0.01%

  return {
    name: "Kepler's Third Law (Earth orbital period)",
    passed: errorPercent < tolerance,
    expected: `${(T_expected / SECONDS_PER_DAY).toFixed(3)} days`,
    actual: `${(T_calculated / SECONDS_PER_DAY).toFixed(3)} days`,
    error: `${errorPercent.toFixed(6)}%`,
    tolerance: `${tolerance}%`,
  };
}

/**
 * Test 2: Energy Conservation
 * E = KE + PE = ½mv² - GMm/r = constant
 * 
 * For a stable orbit, total mechanical energy should remain constant.
 */
async function testEnergyConservation(): Promise<TestResult> {
  const physics = new PhysicsEngine({ gravityMethod: GravityMethod.DIRECT });

  // Create Sun-Earth system
  physics.addBody(new CelestialBody({
    id: 'sun',
    name: 'Sun',
    type: 'star' as any,
    class: 'G' as any,
    mass: SOLAR_MASS,
    radius: 6.96340e8,
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
  }));

  const orbitalVelocity = calculateOrbitalVelocity(AU, SOLAR_MASS);
  physics.addBody(new CelestialBody({
    id: 'earth',
    name: 'Earth',
    type: 'planet' as any,
    class: 'terrestrial' as any,
    mass: EARTH_MASS,
    radius: EARTH_RADIUS,
    position: new Vector3(AU, 0, 0),
    velocity: new Vector3(0, orbitalVelocity, 0),
  }));

  const initialEnergy = physics.calculateTotalEnergy();

  // Simulate 10 Earth days (many orbits would take too long)
  const dt = 60; // 1 minute timesteps
  const simulationTime = 10 * SECONDS_PER_DAY;
  const steps = simulationTime / dt;

  for (let i = 0; i < steps; i++) {
    physics.step(dt);
  }

  const finalEnergy = physics.calculateTotalEnergy();
  const energyDrift = Math.abs(finalEnergy - initialEnergy) / Math.abs(initialEnergy) * 100;
  const tolerance = 0.001; // 0.001% drift over 10 days

  return {
    name: 'Energy Conservation (10 day simulation)',
    passed: energyDrift < tolerance,
    expected: `${initialEnergy.toExponential(6)} J`,
    actual: `${finalEnergy.toExponential(6)} J`,
    error: `${energyDrift.toFixed(8)}% drift`,
    tolerance: `${tolerance}%`,
  };
}

/**
 * Test 3: Angular Momentum Conservation
 * L = r × p = r × mv = constant
 */
async function testAngularMomentumConservation(): Promise<TestResult> {
  const physics = new PhysicsEngine({ gravityMethod: GravityMethod.DIRECT });

  physics.addBody(new CelestialBody({
    id: 'sun',
    name: 'Sun',
    type: 'star' as any,
    class: 'G' as any,
    mass: SOLAR_MASS,
    radius: 6.96340e8,
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
  }));

  const orbitalVelocity = calculateOrbitalVelocity(AU, SOLAR_MASS);
  physics.addBody(new CelestialBody({
    id: 'earth',
    name: 'Earth',
    type: 'planet' as any,
    class: 'terrestrial' as any,
    mass: EARTH_MASS,
    radius: EARTH_RADIUS,
    position: new Vector3(AU, 0, 0),
    velocity: new Vector3(0, orbitalVelocity, 0),
  }));

  const calcAngularMomentum = () => {
    let Lz = 0;
    for (const body of physics.getBodies()) {
      // L_z = m(x*vy - y*vx)
      Lz += body.mass * (body.position.x * body.velocity.y - body.position.y * body.velocity.x);
    }
    return Lz;
  };

  const initialL = calcAngularMomentum();

  // Simulate 10 days
  const dt = 60;
  const steps = (10 * SECONDS_PER_DAY) / dt;
  for (let i = 0; i < steps; i++) {
    physics.step(dt);
  }

  const finalL = calcAngularMomentum();
  const drift = Math.abs(finalL - initialL) / Math.abs(initialL) * 100;
  const tolerance = 0.001;

  return {
    name: 'Angular Momentum Conservation',
    passed: drift < tolerance,
    expected: `${initialL.toExponential(6)} kg·m²/s`,
    actual: `${finalL.toExponential(6)} kg·m²/s`,
    error: `${drift.toFixed(8)}% drift`,
    tolerance: `${tolerance}%`,
  };
}

/**
 * Test 4: Circular Orbit Stability
 * A body with v = √(GM/r) should maintain constant distance from center.
 */
async function testCircularOrbitStability(): Promise<TestResult> {
  const physics = new PhysicsEngine({ gravityMethod: GravityMethod.DIRECT });

  physics.addBody(new CelestialBody({
    id: 'sun',
    name: 'Sun',
    type: 'star' as any,
    class: 'G' as any,
    mass: SOLAR_MASS,
    radius: 6.96340e8,
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
  }));

  const r = AU;
  const v = calculateOrbitalVelocity(r, SOLAR_MASS);
  physics.addBody(new CelestialBody({
    id: 'earth',
    name: 'Earth',
    type: 'planet' as any,
    class: 'terrestrial' as any,
    mass: EARTH_MASS,
    radius: EARTH_RADIUS,
    position: new Vector3(r, 0, 0),
    velocity: new Vector3(0, v, 0),
  }));

  // Track min/max distance
  let minR = r;
  let maxR = r;

  const dt = 3600; // 1 hour timesteps
  const steps = (30 * SECONDS_PER_DAY) / dt; // 30 days

  for (let i = 0; i < steps; i++) {
    physics.step(dt);

    const earth = physics.getBodies().find((b: CelestialBody) => b.id === 'earth')!;
    const dist = earth.position.length();
    minR = Math.min(minR, dist);
    maxR = Math.max(maxR, dist);
  }

  const eccentricity = (maxR - minR) / (maxR + minR);
  const tolerance = 0.001; // Should remain essentially circular

  return {
    name: 'Circular Orbit Stability',
    passed: eccentricity < tolerance,
    expected: 'e = 0 (circular)',
    actual: `e = ${eccentricity.toExponential(4)}`,
    error: `${(eccentricity * 100).toFixed(6)}%`,
    tolerance: `e < ${tolerance}`,
  };
}

/**
 * Test 5: Escape Velocity
 * v_escape = √(2GM/r)
 * 
 * For Earth surface: v_escape ≈ 11.186 km/s
 */
function testEscapeVelocity(): TestResult {
  const v_calculated = Math.sqrt(2 * G * EARTH_MASS / EARTH_RADIUS);
  const v_expected = 11186; // m/s (standard value)

  const errorPercent = Math.abs(v_calculated - v_expected) / v_expected * 100;
  const tolerance = 0.1; // 0.1%

  return {
    name: 'Escape Velocity (Earth surface)',
    passed: errorPercent < tolerance,
    expected: `${(v_expected / 1000).toFixed(3)} km/s`,
    actual: `${(v_calculated / 1000).toFixed(3)} km/s`,
    error: `${errorPercent.toFixed(4)}%`,
    tolerance: `${tolerance}%`,
  };
}

/**
 * Test 6: Gravitational Acceleration
 * g = GM/r²
 * 
 * For Earth surface: g ≈ 9.807 m/s²
 */
function testGravitationalAcceleration(): TestResult {
  const g_calculated = G * EARTH_MASS / (EARTH_RADIUS * EARTH_RADIUS);
  const g_expected = 9.80665; // Standard gravity

  const errorPercent = Math.abs(g_calculated - g_expected) / g_expected * 100;
  const tolerance = 0.1;

  return {
    name: 'Surface Gravity (Earth)',
    passed: errorPercent < tolerance,
    expected: `${g_expected.toFixed(5)} m/s²`,
    actual: `${g_calculated.toFixed(5)} m/s²`,
    error: `${errorPercent.toFixed(4)}%`,
    tolerance: `${tolerance}%`,
  };
}

/**
 * Test 7: Two-Body Barycenter
 * The center of mass should remain stationary.
 * r_cm = (m1*r1 + m2*r2) / (m1 + m2)
 */
async function testBarycenter(): Promise<TestResult> {
  const physics = new PhysicsEngine({ gravityMethod: GravityMethod.DIRECT });

  const m1 = SOLAR_MASS;
  const m2 = SOLAR_MASS * 0.5; // Second star

  // Place at barycenter origin
  const separation = AU;
  const r1 = -separation * m2 / (m1 + m2);
  const r2 = separation * m1 / (m1 + m2);

  // Orbital velocity for each
  const v1 = calculateOrbitalVelocity(Math.abs(r1), m1 + m2) * Math.sqrt(m2 / (m1 + m2));
  const v2 = calculateOrbitalVelocity(Math.abs(r2), m1 + m2) * Math.sqrt(m1 / (m1 + m2));

  physics.addBody(new CelestialBody({
    id: 'star1',
    name: 'Star 1',
    type: 'star' as any,
    class: 'G' as any,
    mass: m1,
    radius: 6.96340e8,
    position: new Vector3(r1, 0, 0),
    velocity: new Vector3(0, v1, 0),
  }));

  physics.addBody(new CelestialBody({
    id: 'star2',
    name: 'Star 2',
    type: 'star' as any,
    class: 'G' as any,
    mass: m2,
    radius: 6.96340e8 * 0.8,
    position: new Vector3(r2, 0, 0),
    velocity: new Vector3(0, -v2, 0),
  }));

  const calcCOM = () => {
    let totalMass = 0;
    let comX = 0, comY = 0, comZ = 0;
    for (const body of physics.getBodies()) {
      totalMass += body.mass;
      comX += body.mass * body.position.x;
      comY += body.mass * body.position.y;
      comZ += body.mass * body.position.z;
    }
    return new Vector3(comX / totalMass, comY / totalMass, comZ / totalMass);
  };

  const initialCOM = calcCOM();

  // Simulate 5 days
  const dt = 60;
  const steps = (5 * SECONDS_PER_DAY) / dt;
  for (let i = 0; i < steps; i++) {
    physics.step(dt);
  }

  const finalCOM = calcCOM();
  const drift = finalCOM.sub(initialCOM).length();
  const tolerance = 1; // 1 meter drift tolerance

  return {
    name: 'Barycenter Stability',
    passed: drift < tolerance,
    expected: `(${initialCOM.x.toFixed(2)}, ${initialCOM.y.toFixed(2)}, ${initialCOM.z.toFixed(2)}) m`,
    actual: `(${finalCOM.x.toFixed(2)}, ${finalCOM.y.toFixed(2)}, ${finalCOM.z.toFixed(2)}) m`,
    error: `${drift.toExponential(4)} m drift`,
    tolerance: `< ${tolerance} m`,
  };
}

/**
 * Test 8: Earth Orbital Period
 * Simulate full year and verify return to starting position.
 */
async function testEarthOrbitalPeriod(): Promise<TestResult> {
  const physics = new PhysicsEngine({ gravityMethod: GravityMethod.DIRECT });

  physics.addBody(new CelestialBody({
    id: 'sun',
    name: 'Sun',
    type: 'star' as any,
    class: 'G' as any,
    mass: SOLAR_MASS,
    radius: 6.96340e8,
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
  }));

  const r = AU;
  const v = calculateOrbitalVelocity(r, SOLAR_MASS);
  physics.addBody(new CelestialBody({
    id: 'earth',
    name: 'Earth',
    type: 'planet' as any,
    class: 'terrestrial' as any,
    mass: EARTH_MASS,
    radius: EARTH_RADIUS,
    position: new Vector3(r, 0, 0),
    velocity: new Vector3(0, v, 0),
  }));

  const initialPos = new Vector3(r, 0, 0);

  // Simulate 1 year with 1 hour timesteps
  const dt = 3600;
  const year = 365.256 * SECONDS_PER_DAY;
  const steps = Math.round(year / dt);

  for (let i = 0; i < steps; i++) {
    physics.step(dt);
  }

  const earth = physics.getBodies().find((b: CelestialBody) => b.id === 'earth')!;
  const finalPos = earth.position.clone();

  // Check if Earth returned close to starting position
  const positionError = finalPos.sub(initialPos).length();
  const errorAU = positionError / AU;
  const tolerance = 0.001; // 0.1% of AU

  return {
    name: 'Earth Orbital Period (1 year simulation)',
    passed: errorAU < tolerance,
    expected: `Returns to (${(initialPos.x / AU).toFixed(4)}, 0, 0) AU`,
    actual: `(${(finalPos.x / AU).toFixed(4)}, ${(finalPos.y / AU).toFixed(4)}, ${(finalPos.z / AU).toFixed(4)}) AU`,
    error: `${(errorAU * 100).toFixed(4)}% of AU`,
    tolerance: `${tolerance * 100}% of AU`,
  };
}

/**
 * Print test results to console
 */
export function printTestResults(results: TestResult[]): void {
  console.log('\n========================================');
  console.log('  PHYSICS VERIFICATION TEST RESULTS');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    const color = result.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${color}${status}${reset}: ${result.name}`);
    console.log(`  Expected: ${result.expected}`);
    console.log(`  Actual:   ${result.actual}`);
    console.log(`  Error:    ${result.error}`);
    console.log(`  Tolerance: ${result.tolerance}`);
    console.log();

    if (result.passed) passed++;
    else failed++;
  }

  console.log('========================================');
  console.log(`  SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');
}

// Run tests if executed directly
if (typeof window === 'undefined') {
  runPhysicsTests().then(printTestResults);
}
