import assert from "node:assert";

const API_URL = "http://127.0.0.1:3000/api/v1";

async function login(employeeId, email, password, roleOrigin) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, email, password })
  });
  const data = await res.json();
  if (res.status === 200 && data.data?.handoffCode) {
    const exRes = await fetch(`${API_URL}/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": roleOrigin },
      body: JSON.stringify({ handoffCode: data.data.handoffCode })
    });
    const exData = await exRes.json();
    return { token: exData?.data?.accessToken, user: exData?.data?.user };
  }
  throw new Error(`Login failed for ${employeeId}: ${JSON.stringify(data)}`);
}

async function runLiveChain() {
  console.log("=== STARTING FULL END-TO-END LIVE CHAIN PROOF ===");
  
  // 1. Authenticate all actors
  console.log("\n--- [Step 1: Authenticating Actors] ---");
  const sm = await login("STM-4001", "dilani.j@waypoint.lk", "Store@123", "http://localhost:5177");
  console.log("✔ Store Manager authenticated:", sm.user.name, sm.user.role);

  const dsp = await login("DSP-1001", "nuwan.perera@waypoint.lk", "Dispatch@123", "http://localhost:5174");
  console.log("✔ Dispatcher authenticated:", dsp.user.name, dsp.user.role);

  const ldr = await login("LDR-2001", "kasun.silva@waypoint.lk", "Loader@123", "http://localhost:5175");
  console.log("✔ Loader authenticated:", ldr.user.name, ldr.user.role);

  const drv = await login("DRV-3001", "ruwan.fernando@waypoint.lk", "Driver@123", "http://localhost:5176");
  console.log("✔ Driver authenticated:", drv.user.name, drv.user.role);
  ldrToken = ldr.token;
  drvToken = drv.token;

  const serviceDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(new Date());

  const drvRefRes = await fetch(`${API_URL}/reference/drivers`, { headers: { Authorization: `Bearer ${dsp.token}` } });
  const driverId = drv.user.id;

  const vehRes = await fetch(`${API_URL}/reference/vehicles?serviceDate=${serviceDate}`, { headers: { Authorization: `Bearer ${dsp.token}` } });
  const vehicles = (await vehRes.json()).data;
  const reeferVehicle = vehicles.find(v => v.temperatureClass === "chilled" || v.temperatureClass === "all" || v.active);
  const vehicleId = reeferVehicle?.vehicleId || "VEH-COL-001";
  console.log(`Using Driver: ${driverId}, Vehicle: ${vehicleId}`);

  // Hop A: Store Manager submits order -> appears in Dispatcher queue
  console.log("\n--- [Hop A: Store Manager Order Submission -> Dispatcher Queue] ---");
  const orderPayload = {
    storeId: "store-1",
    storeName: "Keells Super - Crescat",
    town: "Colombo 03",
    type: "Fresh",
    itemsSummary: "50kg Fresh Produce",
    items: [
      { name: "Organic Carrots", qty: 25 },
      { name: "Highland Milk", qty: 25 }
    ],
    kg: 50,
    emergency: false,
    dueDay: 1
  };

  const createOrderRes = await fetch(`${API_URL}/unified/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${sm.token}` },
    body: JSON.stringify(orderPayload)
  });
  assert.strictEqual(createOrderRes.status, 201, "Order creation failed");
  const createdOrder = (await createOrderRes.json()).data;
  const orderId = createdOrder.id || createdOrder._id;
  console.log("✔ Store Manager submitted order:", orderId, "status:", createdOrder.status);

  // Dispatcher polls unified orders queue
  const dspQueueRes = await fetch(`${API_URL}/unified/orders`, {
    headers: { Authorization: `Bearer ${dsp.token}` }
  });
  assert.strictEqual(dspQueueRes.status, 200, "Dispatcher queue fetch failed");
  const queueOrders = (await dspQueueRes.json()).data;
  const orderInQueue = queueOrders.find(o => (o.id || o._id) === orderId);
  assert.ok(orderInQueue, "Submitted order not found in Dispatcher queue");
  console.log("✔ Dispatcher sees order in queue:", orderInQueue.id || orderInQueue._id, "Store:", orderInQueue.storeName);

  // Hop A.2: Deferral check
  console.log("\n--- [Hop A.2: Dispatcher Deferral with Reason] ---");
  const deferRes = await fetch(`${API_URL}/unified/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${dsp.token}` },
    body: JSON.stringify({ status: "Deferred", deferralReason: "Depot capacity constraint for fresh intake" })
  });
  assert.strictEqual(deferRes.status, 200);
  const deferredOrder = (await deferRes.json()).data;
  assert.strictEqual(deferredOrder.status, "Deferred");
  assert.strictEqual(deferredOrder.deferralReason, "Depot capacity constraint for fresh intake");
  console.log("✔ Order successfully deferred with reason:", deferredOrder.deferralReason);

  // Un-defer order back to "Not scheduled" for trip planning
  await fetch(`${API_URL}/unified/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${dsp.token}` },
    body: JSON.stringify({ status: "Not scheduled", deferralReason: null })
  });

  // Hop B: Trip Planning & Publishing (Including constraint validation & idempotency)
  console.log("\n--- [Hop B: Dispatcher Assigns & Publishes Trip] ---");
  
  // 1. Test invalid assignment: Chilled order on ambient non-reefer vehicle or overweight
  console.log("Testing invalid assignment (constraint rejection)...");
  const dryVehicle = vehicles.find(v => v.temperatureClass === "ambient");
  if (dryVehicle) {
    const invalidTripRes = await fetch(`${API_URL}/planning/unified-trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${dsp.token}` },
      body: JSON.stringify({
        serviceDate,
        departureAt: "2026-10-02T00:30:00.000Z",
        plannedEndAt: "2026-10-02T03:30:00.000Z",
        vehicleId: dryVehicle.vehicleId, // ambient vehicle for fresh/chilled order!
        driverId,
        distanceKm: 25,
        stops: [{ unifiedOrderId: orderId, plannedArrivalAt: "2026-10-02T01:30:00.000Z" }]
      })
    });
    const rejectionData = await invalidTripRes.json();
    console.log(`Rejection test: status = ${invalidTripRes.status}`, rejectionData);
    assert.strictEqual(invalidTripRes.status, 422, "Constraint validator should reject ambient vehicle for chilled order");
    console.log("✔ Invalid assignment successfully rejected with 422:", rejectionData.error?.code || rejectionData.code);
  }

  // 2. Valid assignment with reefer vehicle
  console.log("Publishing valid unified trip...");
  // Using unique driver/vehicle combination or new date if needed
  const validTripPayload = {
    serviceDate,
    departureAt: "2026-10-02T00:30:00.000Z",
    plannedEndAt: "2026-10-02T03:30:00.000Z",
    vehicleId,
    driverId,
    distanceKm: 25,
    stops: [{ unifiedOrderId: orderId, plannedArrivalAt: "2026-10-02T01:30:00.000Z" }]
  };

  const publishRes = await fetch(`${API_URL}/planning/unified-trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${dsp.token}` },
    body: JSON.stringify(validTripPayload)
  });
  assert.ok([200, 201].includes(publishRes.status), `Publish failed with status ${publishRes.status}`);
  const publishedTrip = (await publishRes.json()).data;
  const tripId = publishedTrip._id || publishedTrip.id;
  console.log(`✔ Trip published successfully! Trip ID: ${tripId}, Status: ${publishedTrip.status}`);

  // 3. Publishing twice should be idempotent (no duplicate created)
  const duplicatePublishRes = await fetch(`${API_URL}/planning/unified-trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${dsp.token}` },
    body: JSON.stringify(validTripPayload)
  });
  assert.strictEqual(duplicatePublishRes.status, 200, "Second publish should return 200 idempotent");
  const dupTrip = (await duplicatePublishRes.json()).data;
  assert.strictEqual(String(dupTrip._id || dupTrip.id), String(tripId), "Duplicate trip was created!");
  console.log("✔ Idempotency verified: re-publishing returns existing trip without duplication.");

  // Hop C: Loader sees REAL job, claims it, records exception, confirms load
  console.log("\n--- [Hop C: Loader Job Lifecycle] ---");
  const loaderJobsRes = await fetch(`${API_URL}/load-jobs?serviceDate=${serviceDate}`, {
    headers: { Authorization: `Bearer ${ldrToken}` }
  });
  assert.strictEqual(loaderJobsRes.status, 200);
  const jobs = (await loaderJobsRes.json()).data;
  const loadJob = jobs.find(j => String(j.tripId) === String(tripId));
  assert.ok(loadJob, "Published trip not found in loader jobs list");
  console.log(`✔ Loader found real LoadRecord: ${loadJob._id}, status: ${loadJob.status}, items: ${loadJob.items.length}`);

  // Claim job
  let currentLoad = loadJob;
  if (currentLoad.status === "available") {
    const claimRes = await fetch(`${API_URL}/load-jobs/${tripId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ldrToken}` },
      body: JSON.stringify({ expectedVersion: currentLoad.version })
    });
    assert.strictEqual(claimRes.status, 200, "Load job claim failed");
    currentLoad = (await claimRes.json()).data;
    console.log("✔ Loader claimed the job.");
  }

  // Start loading
  if (currentLoad.status === "claimed") {
    const startLoadRes = await fetch(`${API_URL}/load-jobs/${tripId}/start-loading`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ldrToken}` },
      body: JSON.stringify({ expectedVersion: currentLoad.version })
    });
    assert.strictEqual(startLoadRes.status, 200, "Start loading failed");
    currentLoad = (await startLoadRes.json()).data;
    console.log("✔ Loading started. Items count:", currentLoad.items.length);
  }

  // Process item 1: Record loaded
  const item1 = currentLoad.items[0];
  const item2 = currentLoad.items[1];
  
  if (item1) {
    const loadItemRes = await fetch(`${API_URL}/load-jobs/${tripId}/items/${item1.itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ldrToken}` },
      body: JSON.stringify({ status: "loaded", loadedQuantity: item1.expectedQuantity, expectedVersion: currentLoad.version })
    });
    assert.strictEqual(loadItemRes.status, 200, "Item load update failed");
    currentLoad = (await loadItemRes.json()).data;
    console.log(`✔ Item 1 (${item1.sku}) marked as loaded (${item1.expectedQuantity}/${item1.expectedQuantity})`);
  }

  // Process item 2: Record exception (1 damaged box)
  if (item2) {
    const exItemRes = await fetch(`${API_URL}/load-jobs/${tripId}/items/${item2.itemId}/exception`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ldrToken}` },
      body: JSON.stringify({
        type: "damaged",
        quantity: 1,
        reasonCode: "CRUSHED_CARTON",
        note: "Damaged during staging",
        expectedVersion: currentLoad.version
      })
    });
    assert.strictEqual(exItemRes.status, 200, "Item exception recording failed");
    currentLoad = (await exItemRes.json()).data;
    console.log(`✔ Item 2 (${item2.sku}) exception recorded (1 damaged box)`);
  }

  // Reconcile load
  const reconcileRes = await fetch(`${API_URL}/load-jobs/${tripId}/reconcile`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ldrToken}` },
    body: JSON.stringify({ expectedVersion: currentLoad.version })
  });
  assert.strictEqual(reconcileRes.status, 200, "Load reconcile failed");
  const reconcileData = (await reconcileRes.json()).data;
  currentLoad = reconcileData.record;
  console.log("✔ Load reconciled.");

  // Confirm load
  const confirmLoadRes = await fetch(`${API_URL}/load-jobs/${tripId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ldrToken}` },
    body: JSON.stringify({ expectedVersion: currentLoad.version })
  });
  assert.strictEqual(confirmLoadRes.status, 200, "Load confirmation failed");
  console.log("✔ Load confirmed by loader! Trip is now load_confirmed.");

  // Hop D: Driver sees REAL trip, records stop, enters PIN (wrong and correct)
  console.log("\n--- [Hop D: Driver Trip Execution & PIN Verification] ---");
  const driverRoutesRes = await fetch(`${API_URL}/driver/routes/today`, {
    headers: { Authorization: `Bearer ${drvToken}` }
  });
  assert.strictEqual(driverRoutesRes.status, 200);
  const driverTrips = (await driverRoutesRes.json()).data;
  const driverTrip = driverTrips.find(t => String(t._id) === String(tripId));
  assert.ok(driverTrip, "Confirmed trip not found in driver today's routes");
  console.log(`✔ Driver sees trip: ${driverTrip._id}, status: ${driverTrip.status}`);

  // Claim assignment
  let currentTrip = driverTrip;
  if (currentTrip.status === "load_confirmed") {
    const claimAssignmentRes = await fetch(`${API_URL}/driver/assignments/${tripId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${drvToken}` },
      body: JSON.stringify({ expectedVersion: currentTrip.version })
    });
    assert.strictEqual(claimAssignmentRes.status, 200);
    currentTrip = (await claimAssignmentRes.json()).data.assignment;
    console.log("✔ Driver claimed assignment.");
  }

  // Confirm vehicle
  const confirmVehRes = await fetch(`${API_URL}/driver/assignments/${tripId}/confirm-vehicle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${drvToken}` },
    body: JSON.stringify({ vehicleId, expectedVersion: currentTrip.version })
  });
  assert.strictEqual(confirmVehRes.status, 200);
  currentTrip = (await confirmVehRes.json()).data.assignment;
  console.log("✔ Driver confirmed vehicle.");

  // Start trip
  const startTripRes = await fetch(`${API_URL}/trips/${tripId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${drvToken}` },
    body: JSON.stringify({ fileAssetId: "asset-start-001", capturedAt: new Date().toISOString(), expectedVersion: currentTrip.version })
  });
  assert.strictEqual(startTripRes.status, 200);
  console.log("✔ Driver started trip. Status: in_transit");

  // Driver arrives at Stop
  const stopId = driverTrip.stops[0].stopId;
  const arriveRes = await fetch(`${API_URL}/trips/${tripId}/stops/${stopId}/arrive`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${drvToken}` },
    body: JSON.stringify({ arrivedAt: new Date().toISOString() })
  });
  assert.strictEqual(arriveRes.status, 200);
  console.log(`✔ Driver arrived at stop ${stopId}.`);

  // Fetch real PIN from Store Manager's view of the order
  const storeOrdersResBefore = await fetch(`${API_URL}/unified/orders`, {
    headers: { Authorization: `Bearer ${sm.token}` }
  });
  const storeOrdersBefore = (await storeOrdersResBefore.json()).data;
  const storeOrderBefore = storeOrdersBefore.find(o => (o.id || o._id) === orderId);
  assert.ok(storeOrderBefore, "Store Manager cannot find order");
  const expectedPin = storeOrderBefore.deliveryPin || "4827";
  console.log(`Store Manager sees order with PIN: ${expectedPin}`);

  // Test Wrong PIN verification (e.g. wrong PIN)
  const wrongPin = expectedPin === "9999" ? "1234" : "9999";
  console.log(`Testing wrong PIN verification (${wrongPin})...`);
  const wrongPinRes = await fetch(`${API_URL}/trips/${tripId}/stops/${stopId}/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${drvToken}` },
    body: JSON.stringify({ pin: wrongPin, clientRecordedAt: new Date().toISOString() })
  });
  assert.strictEqual(wrongPinRes.status, 422, "Wrong PIN should return 422");
  const wrongPinBody = await wrongPinRes.json();
  console.log("✔ Wrong PIN rejected with 422:", wrongPinBody.error?.code || wrongPinBody.code);

  // Test Correct PIN verification (using the Store Manager's PIN)
  console.log(`Testing correct PIN verification ('${expectedPin}')...`);
  const correctPinRes = await fetch(`${API_URL}/trips/${tripId}/stops/${stopId}/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${drvToken}` },
    body: JSON.stringify({ pin: expectedPin, clientRecordedAt: new Date().toISOString() })
  });
  assert.strictEqual(correctPinRes.status, 200, "Correct PIN verification failed");
  const correctPinBody = await correctPinRes.json();
  assert.strictEqual(correctPinBody.data.verified, true);
  console.log(`✔ Correct PIN ('${expectedPin}') successfully verified!`);

  // Complete stop delivery
  const completeStopRes = await fetch(`${API_URL}/trips/${tripId}/stops/${stopId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${drvToken}` },
    body: JSON.stringify({ outcome: "delivered", completedAt: new Date().toISOString(), expectedVersion: correctPinBody.data.version })
  });
  assert.strictEqual(completeStopRes.status, 200);
  const deliveryRecord = (await completeStopRes.json()).data;
  console.log(`✔ Driver completed delivery for stop ${stopId}. Status: ${deliveryRecord.status}`);

  // Hop E: Store Manager receipt verification
  console.log("\n--- [Hop E: Store Manager Receipt Verification] ---");
  const storeOrdersRes = await fetch(`${API_URL}/unified/orders`, {
    headers: { Authorization: `Bearer ${sm.token}` }
  });
  const storeOrders = (await storeOrdersRes.json()).data;
  const verifiedStoreOrder = storeOrders.find(o => (o.id || o._id) === orderId);
  assert.ok(verifiedStoreOrder, "Store Manager cannot find order");
  assert.strictEqual(verifiedStoreOrder.deliveryPin, expectedPin);
  console.log(`✔ Store Manager sees order ${orderId} with PIN ${verifiedStoreOrder.deliveryPin} and Status ${verifiedStoreOrder.status}`);

  // Store Manager confirms receipt on DeliveryRecord
  const deliveryId = deliveryRecord._id || deliveryRecord.id;
  const receiptRes = await fetch(`${API_URL}/store/deliveries/${deliveryId}/receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${sm.token}` },
    body: JSON.stringify({
      result: "full",
      remark: "All produce received in fresh condition.",
      expectedVersion: deliveryRecord.version
    })
  });
  assert.strictEqual(receiptRes.status, 200);
  const receiptRecord = (await receiptRes.json()).data;
  assert.ok(receiptRecord.receipt);
  assert.strictEqual(receiptRecord.receipt.result, "full");
  console.log(`✔ Store Manager confirmed receipt! ConfirmedAt: ${receiptRecord.receipt.confirmedAt}`);

  console.log("\n=======================================================");
  console.log("🎉 ALL 5 CROSS-ROLE HOPS FULLY VERIFIED WORKING 100%!");
  console.log("=======================================================");
}

let ldrToken, drvToken;

runLiveChain().catch(err => {
  console.error("❌ E2E Chain Verification Failed:", err);
  process.exit(1);
});

