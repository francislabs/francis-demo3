// Raises a Jira Service Management incident when the app hits an unhandled error.
// Configured through environment variables (set from a Kubernetes secret):
//   JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT (default DEV)
// At most one open auto-incident exists at a time, so repeated clicks do not flood Jira.

const INCIDENT_LABEL = 'auto-incident';
const COSMOS_LABEL = 'cosmos-ticket-manager';
const COOLDOWN_MS = 60 * 1000;

let lastAttempt = 0;
let lastKey = null;

function jiraConfig() {
  const { JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;
  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) return null;
  return {
    url: JIRA_URL.replace(/\/$/, ''),
    project: process.env.JIRA_PROJECT || 'DEV',
    auth: 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64'),
  };
}

async function jira(cfg, method, path, body) {
  const res = await fetch(cfg.url + path, {
    method,
    headers: { Authorization: cfg.auth, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Jira ${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function findOpenIncident(cfg) {
  const jql = `project = ${cfg.project} AND labels = ${INCIDENT_LABEL} AND statusCategory != Done ORDER BY created DESC`;
  const data = await jira(cfg, 'POST', '/rest/api/3/search/jql', { jql, fields: ['summary'], maxResults: 1 });
  if (!data.issues || !data.issues.length) return null;
  return data.issues[0].key || data.issues[0].id;
}

function describe(err, req, info) {
  return [
    'h3. Production error detected by Harness Shop',
    '',
    `*Endpoint:* {{${req.method} ${req.originalUrl}}}`,
    `*Request body:* {{${JSON.stringify(req.body || {})}}}`,
    `*Error:* {{${err.name}: ${err.message}}}`,
    `*App version:* ${info.version}  *Commit:* ${info.commit}  *Pod:* ${info.hostname}`,
    `*Repository:* https://github.com/francislabs/francis-demo3`,
    '',
    '*Stack trace*',
    '{noformat}',
    String(err.stack || err).split('\n').slice(0, 12).join('\n'),
    '{noformat}',
    '',
    '*Impact:* Shoppers cannot add products to their cart.',
    '*Expected:* {{POST /api/cart}} with a valid {{productId}} returns 200 and the updated cart.',
  ].join('\n');
}

async function raiseIncident(err, req, info) {
  const cfg = jiraConfig();
  if (!cfg) return null;

  // Cool-down per pod so a burst of clicks makes one API round trip.
  const now = Date.now();
  if (now - lastAttempt < COOLDOWN_MS) return lastKey;
  lastAttempt = now;

  try {
    const existing = await findOpenIncident(cfg);
    if (existing) {
      lastKey = existing;
      return existing;
    }
    const created = await jira(cfg, 'POST', '/rest/api/2/issue', {
      fields: {
        project: { key: cfg.project },
        issuetype: { name: '[System] Incident' },
        summary: `Add to cart fails with ${err.name}: ${err.message}`.slice(0, 250),
        description: describe(err, req, info),
        labels: [INCIDENT_LABEL, COSMOS_LABEL, 'harness-shop-cosmos'],
      },
    });
    lastKey = created.key;
    console.log(`Raised Jira incident ${created.key}`);
    return created.key;
  } catch (e) {
    console.error('Could not raise Jira incident:', e.message);
    return lastKey;
  }
}

function _reset() {
  lastAttempt = 0;
  lastKey = null;
}

module.exports = { raiseIncident, INCIDENT_LABEL, COSMOS_LABEL, _reset };
