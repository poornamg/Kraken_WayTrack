const fs = require('fs');

async function loginAndExchange(role, employeeId, email, password, origin) {
  const res = await fetch('http://127.0.0.1:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, email, password })
  });
  const data = await res.json();
  
  if (data.data && data.data.handoffCode) {
    const exRes = await fetch('http://127.0.0.1:3000/api/v1/auth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': origin },
      body: JSON.stringify({ handoffCode: data.data.handoffCode })
    });
    const exData = await exRes.json();
    return { status: exRes.status, token: exData?.data?.accessToken };
  }
  
  return { status: res.status };
}

async function smoke() {
  const results = {};
  
  const smLogin = await loginAndExchange('store_manager', 'STM-4001', 'dilani.j@waypoint.lk', 'Store@123', 'http://localhost:5177');
  results['auth_login_store'] = smLogin.status;
  const smToken = smLogin.token;

  const dspLogin = await loginAndExchange('dispatcher', 'DSP-1001', 'nuwan.perera@waypoint.lk', 'Dispatch@123', 'http://localhost:5174');
  results['auth_login_dispatcher'] = dspLogin.status;
  const dspToken = dspLogin.token;

  const ldrLogin = await loginAndExchange('loader', 'LDR-2001', 'kasun.silva@waypoint.lk', 'Loader@123', 'http://localhost:5175');
  results['auth_login_loader'] = ldrLogin.status;
  const ldrToken = ldrLogin.token;

  const drvLogin = await loginAndExchange('driver', 'DRV-3001', 'ruwan.fernando@waypoint.lk', 'Driver@123', 'http://localhost:5176');
  results['auth_login_driver'] = drvLogin.status;
  const drvToken = drvLogin.token;

  async function check(name, method, url, token, body = null) {
    const opts = { method, headers: {} };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`http://127.0.0.1:3000/api/v1${url}`, opts);
    let data;
    try { data = await res.json(); } catch (e) {}
    results[name] = { 
      status: res.status, 
      keys: data ? Object.keys(data) : [],
      dataKeys: data?.data ? (Array.isArray(data.data) ? (data.data[0] ? Object.keys(data.data[0]) : 'empty_array') : Object.keys(data.data)) : null
    };
    return data;
  }

  await check('auth_me', 'GET', '/auth/me', drvToken);
  await check('ref_outlets', 'GET', '/reference/outlets', dspToken);
  await check('ref_vehicles', 'GET', '/reference/vehicles', dspToken);
  await check('ref_calendar', 'GET', '/reference/calendar', dspToken);
  await check('ref_products', 'GET', '/reference/products?brand=Fresh', smToken);
  
  const uoData = await check('uo_create', 'POST', '/unified/orders', smToken, {
    storeId: 'OUT076',
    storeName: 'Waypoint Fresh',
    town: 'Kandy City',
    type: 'Fresh',
    kg: 100,
    items: [{ name: 'Test Apple', qty: 10 }]
  });

  await check('uo_list', 'GET', '/unified/orders', dspToken);
  
  if (uoData?.data?._id) {
    await check('uo_patch', 'PATCH', `/unified/orders/${uoData.data._id}`, dspToken, { status: "Scheduled" });
  }

  const tripData = await check('planning_unified_trips', 'POST', '/planning/unified-trips', dspToken, {
    serviceDate: new Date().toISOString().slice(0, 10),
    departureAt: new Date().toISOString(),
    plannedEndAt: new Date(Date.now() + 4*3600*1000).toISOString(),
    vehicleId: 'WP-014',
    driverId: '6abeab11d70cfeb67af1ef4e', // hardcoded valid driver
    distanceKm: 50,
    stops: [{ unifiedOrderId: uoData?.data?._id, plannedArrivalAt: new Date(Date.now() + 1800*1000).toISOString() }]
  });
  
  await check('load_jobs', 'GET', `/load-jobs?serviceDate=${new Date().toISOString().slice(0, 10)}`, ldrToken);
  await check('driver_routes', 'GET', '/driver/routes/today', drvToken);
  await check('ops_deliveries', 'GET', '/store/deliveries', smToken);

  console.log(JSON.stringify(results, null, 2));
}

smoke().catch(console.error);
