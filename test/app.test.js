const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { createServer } = require('../src/server');
const { escapeHtml } = require('../src/page');
const config = require('../src/config');

let server;
let base;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test('health endpoint returns ok', async () => {
  const res = await fetch(`${base}/healthz`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('home page renders headline and products', async () => {
  const res = await fetch(`${base}/`);
  const html = await res.text();
  assert.strictEqual(res.status, 200);
  assert.ok(html.includes(config.headline));
  for (const p of config.products) assert.ok(html.includes(p.name));
});

test('home page shows the holiday promo banner', async () => {
  const html = await (await fetch(`${base}/`)).text();
  assert.ok(config.promoBanner, 'promoBanner should be set');
  assert.ok(html.includes(config.promoBanner));
  assert.ok(html.includes('data-testid="promo"'));
});

test('info endpoint exposes version', async () => {
  const info = await (await fetch(`${base}/api/info`)).json();
  assert.ok(info.version);
  assert.strictEqual(info.app, config.appName);
});

test('products have a name and a positive price', () => {
  assert.ok(config.products.length > 0);
  for (const p of config.products) {
    assert.ok(p.name);
    assert.ok(p.price > 0);
  }
});

test('html is escaped', () => {
  assert.strictEqual(escapeHtml('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
});

test('unknown routes return 404', async () => {
  const res = await fetch(`${base}/nope`);
  assert.strictEqual(res.status, 404);
});
