/**
 * Time System Verification Tests
 * 
 * These tests verify that the time system is working correctly by
 * measuring orbital mechanics angles and comparing to expected values.
 * 
 * Run these tests in the browser console after loading the simulation.
 */

// Physical constants
const YEAR_SECONDS = 31536000;      // 365 days
const MONTH_SECONDS = 2592000;      // 30 days
const DAY_SECONDS = 86400;          // 24 hours
const MOON_ORBITAL_PERIOD = 27.3 * DAY_SECONDS; // Sidereal month

/**
 * Calculate angle of point (x, z) from origin in radians
 */
function getAngle(x: number, z: number): number {
    return Math.atan2(z, x);
}

/**
 * Normalize angle difference to [-π, π]
 */
function normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

/**
 * Test 1: Earth Quarter Orbit Test
 * 
 * At 1mo/s, Earth should move ~30° (π/6 rad) per real second.
 * In 3 real seconds = 3 months = π/2 radians (90°).
 * 
 * @param physics - The PhysicsClient instance
 * @param realSeconds - How many real seconds to simulate
 * @param timeController - The TimeController instance  
 */
export async function testEarthQuarterOrbit(
    physics: { getPositions: () => Float64Array, step: () => void, time: () => number },
    timeController: { update: (delta: number) => number, setSpeedIndex: (index: number) => void }
): Promise<{ passed: boolean; message: string }> {
    // Set speed to 1mo/s (index 5)
    timeController.setSpeedIndex(5);

    // Get initial Earth position (index 1, after Sun)
    const initialPositions = physics.getPositions();
    const initialX = initialPositions[3]; // Earth x
    const initialZ = initialPositions[5]; // Earth z (y is up)
    const initialAngle = getAngle(initialX, initialZ);
    const initialTime = physics.time();

    console.log(`🌍 Test 1: Earth Quarter Orbit`);
    console.log(`   Initial angle: ${(initialAngle * 180 / Math.PI).toFixed(2)}°`);
    console.log(`   Initial sim time: ${(initialTime / DAY_SECONDS).toFixed(2)} days`);

    // Simulate 3 real seconds at 1mo/s
    const realSeconds = 3;
    const steps = timeController.update(realSeconds);
    console.log(`   Running ${steps} physics steps...`);

    for (let i = 0; i < steps; i++) {
        physics.step();
    }

    // Get final position
    const finalPositions = physics.getPositions();
    const finalX = finalPositions[3];
    const finalZ = finalPositions[5];
    const finalAngle = getAngle(finalX, finalZ);
    const finalTime = physics.time();

    // Calculate angle change
    const angleChange = normalizeAngle(finalAngle - initialAngle);
    const expectedChange = Math.PI / 2; // 90 degrees
    const error = Math.abs(angleChange - expectedChange) / expectedChange * 100;

    console.log(`   Final angle: ${(finalAngle * 180 / Math.PI).toFixed(2)}°`);
    console.log(`   Angle change: ${(angleChange * 180 / Math.PI).toFixed(2)}°`);
    console.log(`   Expected: ${(expectedChange * 180 / Math.PI).toFixed(2)}°`);
    console.log(`   Final sim time: ${(finalTime / DAY_SECONDS).toFixed(2)} days`);
    console.log(`   Sim time delta: ${((finalTime - initialTime) / DAY_SECONDS).toFixed(2)} days`);
    console.log(`   Error: ${error.toFixed(2)}%`);

    const passed = error < 10; // Allow 10% error margin
    return {
        passed,
        message: passed
            ? `✅ PASSED: Earth moved ${(angleChange * 180 / Math.PI).toFixed(1)}° (expected ~90°)`
            : `❌ FAILED: Earth moved ${(angleChange * 180 / Math.PI).toFixed(1)}° (expected ~90°)`
    };
}

/**
 * Test 2: Moon Orbital Period Test
 * 
 * At 1day/s, Moon should complete one orbit in ~27.3 real seconds.
 * We'll test for half orbit (~13.65s → π radians).
 * 
 * @param physics - The PhysicsClient instance
 * @param timeController - The TimeController instance
 */
export async function testMoonOrbitPeriod(
    physics: { getPositions: () => Float64Array, step: () => void, time: () => number },
    timeController: { update: (delta: number) => number, setSpeedIndex: (index: number) => void }
): Promise<{ passed: boolean; message: string }> {
    // Set speed to 1day/s (index 3)
    timeController.setSpeedIndex(3);

    // Get initial Moon position relative to Earth (Moon is index 2)
    const positions = physics.getPositions();
    const earthX = positions[3], earthZ = positions[5];
    const moonX = positions[6], moonZ = positions[8];
    const relX = moonX - earthX;
    const relZ = moonZ - earthZ;
    const initialAngle = getAngle(relX, relZ);
    const initialTime = physics.time();

    console.log(`🌙 Test 2: Moon Orbital Period`);
    console.log(`   Initial Moon angle (rel to Earth): ${(initialAngle * 180 / Math.PI).toFixed(2)}°`);

    // Simulate ~14 real seconds (half orbit) at 1day/s
    const realSeconds = 13.65;
    const steps = timeController.update(realSeconds);
    console.log(`   Running ${steps} physics steps...`);

    for (let i = 0; i < steps; i++) {
        physics.step();
    }

    // Get final position
    const finalPositions = physics.getPositions();
    const finalEarthX = finalPositions[3], finalEarthZ = finalPositions[5];
    const finalMoonX = finalPositions[6], finalMoonZ = finalPositions[8];
    const finalRelX = finalMoonX - finalEarthX;
    const finalRelZ = finalMoonZ - finalEarthZ;
    const finalAngle = getAngle(finalRelX, finalRelZ);

    const angleChange = Math.abs(normalizeAngle(finalAngle - initialAngle));
    const expectedChange = Math.PI; // Half orbit = 180 degrees
    const error = Math.abs(angleChange - expectedChange) / expectedChange * 100;

    console.log(`   Final Moon angle: ${(finalAngle * 180 / Math.PI).toFixed(2)}°`);
    console.log(`   Angle change: ${(angleChange * 180 / Math.PI).toFixed(2)}°`);
    console.log(`   Expected: ${(expectedChange * 180 / Math.PI).toFixed(2)}°`);
    console.log(`   Error: ${error.toFixed(2)}%`);

    const passed = error < 15; // Allow 15% error margin (Moon orbit is more sensitive)
    return {
        passed,
        message: passed
            ? `✅ PASSED: Moon moved ${(angleChange * 180 / Math.PI).toFixed(1)}° (expected ~180°)`
            : `❌ FAILED: Moon moved ${(angleChange * 180 / Math.PI).toFixed(1)}° (expected ~180°)`
    };
}

/**
 * Test 3: Time Display Accuracy
 * 
 * Track physics.time() for a known number of steps and verify it matches expectations.
 * At 1hr/s with dt=3600s, each step should advance sim time by 3600s.
 * 
 * @param physics - The PhysicsClient instance
 * @param timeController - The TimeController instance
 */
export async function testTimeDisplayAccuracy(
    physics: { step: () => void, time: () => number },
    timeController: { update: (delta: number) => number, setSpeedIndex: (index: number) => void, getPhysicsTimestep: () => number }
): Promise<{ passed: boolean; message: string }> {
    // Set speed to 1hr/s (index 2)
    timeController.setSpeedIndex(2);

    const dt = timeController.getPhysicsTimestep();
    const initialTime = physics.time();

    console.log(`⏱ Test 3: Time Display Accuracy`);
    console.log(`   Physics timestep: ${dt}s`);
    console.log(`   Initial sim time: ${initialTime}s`);

    // Run exactly 10 steps
    const numSteps = 10;
    for (let i = 0; i < numSteps; i++) {
        physics.step();
    }

    const finalTime = physics.time();
    const actualDelta = finalTime - initialTime;
    const expectedDelta = numSteps * dt;
    const error = Math.abs(actualDelta - expectedDelta) / expectedDelta * 100;

    console.log(`   Final sim time: ${finalTime}s`);
    console.log(`   Time delta: ${actualDelta}s`);
    console.log(`   Expected delta: ${expectedDelta}s`);
    console.log(`   Error: ${error.toFixed(4)}%`);

    const passed = error < 0.01; // Should be essentially exact
    return {
        passed,
        message: passed
            ? `✅ PASSED: ${numSteps} steps = ${actualDelta}s (expected ${expectedDelta}s)`
            : `❌ FAILED: ${numSteps} steps = ${actualDelta}s (expected ${expectedDelta}s)`
    };
}

/**
 * Run all verification tests
 */
export async function runAllTests(physics: any, timeController: any): Promise<void> {
    console.log('═══════════════════════════════════════════════════════');
    console.log('        TIME SYSTEM VERIFICATION TESTS');
    console.log('═══════════════════════════════════════════════════════');

    const results: Array<{ name: string; passed: boolean; message: string }> = [];

    // Test 3 first (non-destructive)
    const test3 = await testTimeDisplayAccuracy(physics, timeController);
    results.push({ name: 'Time Display Accuracy', ...test3 });
    console.log(test3.message);
    console.log('');

    // Tests 1 and 2 modify simulation state
    const test1 = await testEarthQuarterOrbit(physics, timeController);
    results.push({ name: 'Earth Quarter Orbit', ...test1 });
    console.log(test1.message);
    console.log('');

    const test2 = await testMoonOrbitPeriod(physics, timeController);
    results.push({ name: 'Moon Orbital Period', ...test2 });
    console.log(test2.message);
    console.log('');

    console.log('═══════════════════════════════════════════════════════');
    const passed = results.filter(r => r.passed).length;
    console.log(`RESULTS: ${passed}/${results.length} tests passed`);
    console.log('═══════════════════════════════════════════════════════');
}
