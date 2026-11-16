const http = require('http');
const os = require('os');
const express = require('express');
const config = require('./config');
const cart = require('./cart');
const { renderPage } = require('./page');
const { raiseIncident } = require('./incident');

function buildInfo() {
  return {
    app: config.appName,
    version: process.env.APP_VERSION || 'dev',
    commit: process.env.GIT_SHA || 'local',
    hostname: os.hostname(),
  };
}

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    next();
  });

  app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/info', (req, res) => res.json(buildInfo()));
  app.get('/api/products', (req, res) => res.json(config.products));
  app.get('/api/cart', (req, res) => res.json(cart.summary()));

  app.post('/api/cart', (req, res) => {
    const { productId, quantity = 1 } = req.body || {};
    res.json(cart.addToCart(productId, quantity));
  });

  app.get('/', (req, res) => res.type('html').send(renderPage(buildInfo())));

  app.use((req, res) => res.status(404).json({ error: 'not found' }));

  // Unhandled errors: log, raise a Jira incident, and return a generic 500.
  // eslint-disable-next-line no-unused-vars
  app.use(async (err, req, res, next) => {
    console.error(`${req.method} ${req.originalUrl} failed:`, err.stack || err);
    const incident = await raiseIncident(err, req, buildInfo());
    res.status(500).json({ error: 'internal error', incident });
  });

  return app;
}

function createServer() {
  return http.createServer(createApp());
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  createServer().listen(port, () => {
    console.log(`${config.appName} listening on :${port}`);
  });
}

module.exports = { createApp, createServer, buildInfo };
