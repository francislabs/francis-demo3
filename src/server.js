const http = require('http');
const os = require('os');
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

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok' }));
    }

    if (url.pathname === '/api/info') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(buildInfo()));
    }

    if (url.pathname === '/api/products') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(config.products));
    }

    if (url.pathname === '/') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      });
      return res.end(renderPage(buildInfo()));
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'not found' }));
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  createServer().listen(port, () => {
    console.log(`${config.appName} listening on :${port}`);
  });
}

module.exports = { createServer, buildInfo };
