const http = require('http');
const os = require('os');
const express = require('express');
const config = require('./config');
const { renderPage } = require('./page');

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

  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    next();
  });

  app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/info', (req, res) => res.json(buildInfo()));
  app.get('/api/products', (req, res) => res.json(config.products));
  app.get('/', (req, res) => res.type('html').send(renderPage(buildInfo())));

  app.use((req, res) => res.status(404).json({ error: 'not found' }));
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
