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

test('home page renders headline, products and add-to-cart buttons', async () => {
  const html = await (await fetch(`${base}/`)).text();
  assert.ok(html.includes(config.headline));
  for (const p of config.products) {
    assert.ok(html.includes(p.name));
    assert.ok(html.includes(`data-product="${p.id}"`));
  }
});

test('info endpoint exposes version', async () => {
  const info = await (await fetch(`${base}/api/info`)).json();
  assert.ok(info.version);
  assert.strictEqual(info.app, config.appName);
});

test('cart starts empty', async () => {
  const data = await (await fetch(`${base}/api/cart`)).json();
  assert.strictEqual(data.count, 0);
});

test('products have an id, a name and a positive price', () => {
  for (const p of config.products) {
    assert.ok(p.id);
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
