import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';

const API_URL = 'http://127.0.0.1:3000/api/v1';

// Seed the DB before tests
before(() => {
  console.log('Seeding database...');
  // Running seed inside the container since host might not resolve "mongo" correctly
  execSync('docker start -a waylink-seed-1', { stdio: 'inherit' });
});

async function login(employeeId, email, password, roleOrigin) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, email, password })
  });
  const data = await res.json();
  if (res.status === 200 && data.data?.handoffCode) {
    const exRes = await fetch(`${API_URL}/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': roleOrigin },
      body: JSON.stringify({ handoffCode: data.data.handoffCode })
    });
    const exData = await exRes.json();
    return { token: exData?.data?.accessToken };
  }
  return { token: null };
}

function assertShape(obj, expectedKeys) {
  if (!obj) throw new Error('Expected object, got null/undefined');
  const keys = Object.keys(obj);
  for (const k of expectedKeys) {
    assert(keys.includes(k), `Missing key: ${k}`);
  }
}

test('Contract Tests', async (t) => {
  let smToken, dspToken, ldrToken, drvToken;

  await t.test('Auth: Login + Exchange', async () => {
    smToken = (await login('STM-4001', 'dilani.j@waypoint.lk', 'Store@123', 'http://localhost:5177')).token;
    dspToken = (await login('DSP-1001', 'nuwan.perera@waypoint.lk', 'Dispatch@123', 'http://localhost:5174')).token;
    ldrToken = (await login('LDR-2001', 'kasun.silva@waypoint.lk', 'Loader@123', 'http://localhost:5175')).token;
    drvToken = (await login('DRV-3001', 'ruwan.fernando@waypoint.lk', 'Driver@123', 'http://localhost:5176')).token;
    
    assert.ok(smToken);
    assert.ok(dspToken);
    assert.ok(ldrToken);
    assert.ok(drvToken);
  });

  await t.test('Auth: Me', async () => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${drvToken}` } });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assertShape(body.data, ['id', 'employeeId', 'email', 'name', 'role']);
  });

  let driverId, vehicleId;

  await t.test('Reference: Drivers', async () => {
    const res = await fetch(`${API_URL}/reference/drivers`, { headers: { 'Authorization': `Bearer ${dspToken}` } });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert(Array.isArray(body.data));
    assertShape(body.data[0], ['_id', 'employeeId', 'name']);
    driverId = body.data[0]._id;
  });

  await t.test('Reference: Vehicles', async () => {
    const res = await fetch(`${API_URL}/reference/vehicles?serviceDate=${new Date().toISOString().slice(0, 10)}`, { headers: { 'Authorization': `Bearer ${dspToken}` } });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert(Array.isArray(body.data));
    assertShape(body.data[0], ['_id', 'vehicleId', 'routesToday']);
    vehicleId = body.data[0].vehicleId;
  });

  await t.test('Reference: Outlets', async () => {
    const res = await fetch(`${API_URL}/reference/outlets`, { headers: { 'Authorization': `Bearer ${dspToken}` } });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assertShape(body.data[0], ['_id', 'outletId', 'displayName']);
  });

  await t.test('Reference: Products', async () => {
    const res = await fetch(`${API_URL}/catalog/products`, { headers: { 'Authorization': `Bearer ${smToken}` } });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assertShape(body.data[0], ['_id', 'sku', 'name']);
  });

  await t.test('Reference: Calendar', async () => {
    const res = await fetch(`${API_URL}/calendar/${new Date().toISOString().slice(0, 10)}`, { headers: { 'Authorization': `Bearer ${dspToken}` } });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assertShape(body.data, ['date', 'isOperating']);
  });

  let uoId;
  await t.test('Unified Orders: Create & Patch & List', async () => {
    let res = await fetch(`${API_URL}/unified/orders`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${smToken}` },
      body: JSON.stringify({ storeId: 'OUT076', storeName: 'Waypoint Fresh', town: 'Kandy City', type: 'Fresh', kg: 100, items: [{ name: 'Test Apple', qty: 10, sku: 'SKU1' }] })
    });
     assert.strictEqual(res.status, 201);
    let body = await res.json();
    assertShape(body.data, ['id', 'status']);
    uoId = body.data.id;

    res = await fetch(`${API_URL}/unified/orders`, { headers: { 'Authorization': `Bearer ${dspToken}` } });
    assert.strictEqual(res.status, 200);

    res = await fetch(`${API_URL}/unified/orders/${uoId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dspToken}` },
      body: JSON.stringify({ status: "Deferred", deferralReason: "Test" })
    });
    assert.strictEqual(res.status, 200);
  });

  await t.test('Planning: Create Trip from Unified Orders', async () => {
    const res = await fetch(`${API_URL}/planning/unified-trips`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dspToken}` },
      body: JSON.stringify({
        serviceDate: new Date().toISOString().slice(0, 10),
        departureAt: new Date().toISOString(),
        plannedEndAt: new Date(Date.now() + 4*3600*1000).toISOString(),
        vehicleId, driverId, distanceKm: 50,
        stops: [{ unifiedOrderId: uoId, plannedArrivalAt: new Date(Date.now() + 1800*1000).toISOString() }]
      })
    });
     assert.ok([200, 201].includes(res.status), `Expected 200 or 201, got ${res.status}`);
    const body = await res.json();
  });

  await t.test('Loading: List Jobs', async () => {
    const res = await fetch(`${API_URL}/load-jobs?serviceDate=${new Date().toISOString().slice(0, 10)}`, { headers: { 'Authorization': `Bearer ${ldrToken}` } });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert(Array.isArray(body.data));
  });

  await t.test('Driver: Routes Today', async () => {
    const res = await fetch(`${API_URL}/driver/routes/today`, { headers: { 'Authorization': `Bearer ${drvToken}` } });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert(Array.isArray(body.data));
  });

  await t.test('Operations: Deliveries', async () => {
    const res = await fetch(`${API_URL}/store/deliveries`, { headers: { 'Authorization': `Bearer ${smToken}` } });
    assert.strictEqual(res.status, 200);
  });

  await t.test('Auth: Logout', async () => {
    const res = await fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: { 'Authorization': `Bearer ${drvToken}` } });
    assert.strictEqual(res.status, 204);
  });
});
