/**
 * Unit Test Suite for Geofencing Engine (PRD v1.2)
 *
 * Runs directly with Node.js to verify:
 * 1. Haversine distance accuracy
 * 2. GPS accuracy filtering
 * 3. ENTER debounce delay
 * 4. Hysteresis on LEAVE event
 * 5. State tracking across updates
 */

import {
  calculateHaversineDistance,
  GeofenceEngine,
  GeofenceTarget,
  GpsCoordinate,
} from './geofenceEngine';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
  }
}

console.log('=== TEST 1: Haversine Geodesic Distance ===');
// Distance between Ben Nha Rong (10.7681, 106.7067) and Cho Xom Chieu (10.7610, 106.7042) is ~830m
const dist = calculateHaversineDistance(10.7681, 106.7067, 10.761, 106.7042);
assert(dist > 800 && dist < 860, `Distance between Ben Nha Rong and Cho Xom Chieu should be ~830m (Calculated: ${Math.round(dist)}m)`);

console.log('\n=== TEST 2: GPS Accuracy Filtering ===');
const engine = new GeofenceEngine({
  accuracyThresholdMeters: 50,
  debounceSeconds: 3,
  hysteresisFactor: 1.2,
});

const target: GeofenceTarget = {
  id: 1,
  name: 'Ben Nha Rong',
  latitude: 10.7681,
  longitude: 106.7067,
  radiusMeters: 50,
  priority: 5,
};
engine.setTargets([target]);

// Inaccurate coordinate (accuracy = 80m > threshold 50m) directly on target
const inaccurateCoord: GpsCoordinate = {
  latitude: 10.7681,
  longitude: 106.7067,
  accuracy: 80,
};
const events1 = engine.processLocation(inaccurateCoord, 1000);
assert(events1.length === 0, 'Inaccurate GPS coordinate (>50m) must be rejected and produce 0 events');

console.log('\n=== TEST 3: Debounce ENTER Logic ===');
// Accurate coordinate on target
const accurateCoord: GpsCoordinate = {
  latitude: 10.7681,
  longitude: 106.7067,
  accuracy: 10,
};

// Tick 1 at t = 1000ms: first inside, but debounce is 3s
const tick1 = engine.processLocation(accurateCoord, 1000);
assert(tick1.length === 0, 'Tick 1 (0s): Should not trigger ENTER immediately due to 3s debounce');

// Tick 2 at t = 2500ms (1.5s inside): still waiting
const tick2 = engine.processLocation(accurateCoord, 2500);
assert(tick2.length === 0, 'Tick 2 (1.5s): Still inside debounce window, no event yet');

// Tick 3 at t = 4100ms (3.1s inside): debounce reached!
const tick3 = engine.processLocation(accurateCoord, 4100);
assert(tick3.length === 1 && tick3[0].type === 'ENTER', 'Tick 3 (3.1s): Should trigger ENTER event after debounce delay');

// Tick 4 at t = 5000ms: already inside, should not trigger ENTER again
const tick4 = engine.processLocation(accurateCoord, 5000);
assert(tick4.length === 0, 'Tick 4: Should not repeat ENTER when continuously inside');

console.log('\n=== TEST 4: Hysteresis LEAVE Logic ===');
// Target radius is 50m. With hysteresisFactor = 1.2, leave threshold is 60m.
// Coordinate at 55m distance (outside radius 50m, but inside hysteresis 60m)
// 1 deg lat ~ 111,139m. 55m ~ 0.000495 deg
const boundaryCoord: GpsCoordinate = {
  latitude: 10.7681 + 0.000495,
  longitude: 106.7067,
  accuracy: 10,
};
const boundaryEvents = engine.processLocation(boundaryCoord, 6000);
assert(boundaryEvents.length === 0, 'Moving to 55m (>50m but <60m hysteresis) must NOT trigger LEAVE yet');

// Now move to 80m (>60m)
const farCoord: GpsCoordinate = {
  latitude: 10.7681 + 0.00075,
  longitude: 106.7067,
  accuracy: 10,
};
const leaveEvents = engine.processLocation(farCoord, 7000);
assert(leaveEvents.length === 1 && leaveEvents[0].type === 'LEAVE', 'Moving beyond hysteresis boundary (>60m) triggers LEAVE event');

console.log(`\n========================================`);
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
if (failed > 0) process.exit(1);
