# Harness Shop — self-healing demo (Harness + Jira + Cosmos + GitHub)

A small Node.js (Express) store deployed to GKE by Harness. **`main` intentionally contains a bug**: clicking **Add to cart** fails.

## The demo loop

1. **Error.** A shopper clicks **Add to cart**. `POST /api/cart` fails, and the app auto-raises a **Jira Service Management incident** in project `DEV` (`src/incident.js`).
2. **Cosmos fixes it.** Jira notifies Cosmos. The Cosmos PR Author reads the incident, fixes the bug, adds a regression test, and opens a PR (see `AGENTS.md`).
3. **Harness ships it.** The PR triggers the Harness pipeline `harness-shop-cosmos-build-deploy`:
   - scans, tests, and builds the image,
   - waits for **approval**,
   - deploys to GKE (namespace `cosmosdeploy`),
   - smoke-tests Add to cart,
   - resolves the incident.
4. **Reset.** The `reset-cosmos-demo` pipeline closes the PR without merging, redeploys the buggy `main`, and closes the incident. That puts everything back for the next demo.

## Run locally

```bash
npm ci
npm test
npm start            # http://localhost:8080
```

Jira reporting is off unless `JIRA_URL`, `JIRA_EMAIL` and `JIRA_API_TOKEN` are set.
