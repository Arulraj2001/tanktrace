const http = require('http');
const { spawn } = require('child_process');

console.log("=== TankTrace Verification Test Suite ===");

// Start vite preview on port 4173
const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
  shell: true,
  stdio: 'pipe'
});

let serverReady = false;

previewProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('http://localhost:4173') || output.includes('Local:')) {
    serverReady = true;
  }
});

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:4173${urlPath}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

async function runTests() {
  // Wait for server to boot
  let attempts = 0;
  while (!serverReady && attempts < 20) {
    await new Promise(r => setTimeout(r, 500));
    attempts++;
  }
  console.log("Server detected ready. Executing route and dataset checks...");

  const endpoints = [
    { path: '/', expectedStatus: 200, check: (body) => body.includes('<title>TankTrace') && body.includes('id="root"') },
    { path: '/data/tn_districts.geojson', expectedStatus: 200, check: (body) => {
      const json = JSON.parse(body);
      return json.type === 'FeatureCollection' && json.features.length === 30;
    }},
    { path: '/data/tn_summary.json', expectedStatus: 200, check: (body) => {
      const json = JSON.parse(body);
      return json.total_waterbodies === 64493 && json.state === 'Tamil Nadu';
    }},
    { path: '/data/tn_waterbodies_all.json', expectedStatus: 200, check: (body) => {
      const json = JSON.parse(body);
      return json.metadata.total_count === 64493 && json.records.length === 64493;
    }},
    { path: '/data/sample_import.geojson', expectedStatus: 200, check: (body) => {
      const json = JSON.parse(body);
      return json.type === 'FeatureCollection' && json.features.length === 50;
    }},
    { path: '/data/tn_waterbodies_major.geojson', expectedStatus: 200, check: (body) => {
      const json = JSON.parse(body);
      return json.type === 'FeatureCollection' && json.features.length > 5000;
    }}
  ];

  let passed = 0;
  let failed = 0;

  for (const ep of endpoints) {
    try {
      const res = await fetchUrl(ep.path);
      const isOkStatus = res.status === ep.expectedStatus;
      const isOkBody = ep.check(res.body);

      if (isOkStatus && isOkBody) {
        console.log(`[PASS] ${ep.path} (Status: ${res.status})`);
        passed++;
      } else {
        console.error(`[FAIL] ${ep.path} (Status: ${res.status}, checkPassed: ${isOkBody})`);
        failed++;
      }
    } catch (e) {
      console.error(`[FAIL] ${ep.path} request error:`, e.message);
      failed++;
    }
  }

  console.log(`\nVerification Results: ${passed} Passed, ${failed} Failed`);

  // Kill preview process
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', previewProcess.pid, '/f', '/t']);
  } else {
    previewProcess.kill();
  }

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(err => {
  console.error("Test runner error:", err);
  process.exit(1);
});

